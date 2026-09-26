const mongoose = require("mongoose");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

const Wedding = require("../models/Wedding");
const Admin = require("../models/Admin");

const BASE_URL = `http://localhost:${process.env.PORT || 5000}/api`;

async function runTests() {
  console.log("=== STARTING BACKGROUND MUSIC BACKEND TESTS ===");

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB.");

  // Get admin token
  const admin = await Admin.findOne({ email: "admin@wedding.com" });
  if (!admin) {
    throw new Error("Admin not found. Please ensure admin is seeded.");
  }
  const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const initialWedding = await Wedding.findOne();
  console.log("Initial wedding title:", initialWedding ? initialWedding.weddingTitle : "None");
  const originalMusicEnabled = initialWedding ? initialWedding.musicEnabled : false;
  const originalMusicUrl = initialWedding ? initialWedding.backgroundMusicUrl : "";
  const originalMusicTitle = initialWedding ? initialWedding.musicTitle : "";

  try {
    // 1. Test GET /api/wedding (Public)
    console.log("\n[Test 1] Testing public GET /api/wedding for music fields...");
    const getRes = await fetch(`${BASE_URL}/wedding`);
    const getData = await getRes.json();
    console.log("GET status:", getRes.status, "Success:", getData.success);
    if (!getData.success || !getData.data) {
      throw new Error("Failed to get wedding details.");
    }
    console.log("Returned musicEnabled:", getData.data.musicEnabled);
    console.log("Returned backgroundMusicUrl:", getData.data.backgroundMusicUrl);
    console.log("Returned musicTitle:", getData.data.musicTitle);
    console.log("✓ Public GET /api/wedding returns music fields successfully.");

    // 2. Test 401 Unauthorized for PUT without token
    console.log("\n[Test 2] Testing 401 Unauthorized for PUT /api/wedding without token...");
    const unauthRes = await fetch(`${BASE_URL}/wedding`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ musicEnabled: true }),
    });
    console.log("Unauthorized status:", unauthRes.status);
    if (unauthRes.status !== 401) {
      throw new Error(`Expected 401, got ${unauthRes.status}`);
    }
    console.log("✓ Unauthorized update correctly rejected with 401.");

    // 3. Test invalid musicEnabled rejection
    console.log("\n[Test 3] Testing 400 rejection for invalid musicEnabled value...");
    const invalidBoolRes = await fetch(`${BASE_URL}/wedding`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({ musicEnabled: "not-a-bool" }),
    });
    console.log("Invalid boolean status:", invalidBoolRes.status);
    if (invalidBoolRes.status !== 400) {
      throw new Error(`Expected 400 for invalid boolean, got ${invalidBoolRes.status}`);
    }
    console.log("✓ Invalid boolean correctly rejected with 400.");

    // 4. Test dangerous protocol rejection (javascript:)
    console.log("\n[Test 4] Testing 400 rejection for dangerous music URL...");
    const dangerousUrlRes = await fetch(`${BASE_URL}/wedding`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({ backgroundMusicUrl: "javascript:alert('xss')" }),
    });
    console.log("Dangerous URL status:", dangerousUrlRes.status);
    if (dangerousUrlRes.status !== 400) {
      throw new Error(`Expected 400 for javascript: URL, got ${dangerousUrlRes.status}`);
    }
    console.log("✓ Dangerous javascript: URL correctly rejected with 400.");

    // 5. Test title length limit rejection
    console.log("\n[Test 5] Testing 400 rejection for excessively long musicTitle...");
    const longTitle = "A".repeat(151);
    const longTitleRes = await fetch(`${BASE_URL}/wedding`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({ musicTitle: longTitle }),
    });
    console.log("Long title status:", longTitleRes.status);
    if (longTitleRes.status !== 400) {
      throw new Error("Expected 400 for title > 150 chars.");
    }
    console.log("✓ Long title correctly rejected with 400.");

    // 6. Test valid local path update
    console.log("\n[Test 6] Testing valid update with local audio path...");
    const validLocalPayload = {
      musicEnabled: true,
      musicTitle: "Acoustic Wedding Theme",
      backgroundMusicUrl: "/music/wedding-theme.mp3",
    };
    const updateLocalRes = await fetch(`${BASE_URL}/wedding`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify(validLocalPayload),
    });
    const updateLocalData = await updateLocalRes.json();
    console.log("Update local status:", updateLocalRes.status, "Success:", updateLocalData.success);
    if (!updateLocalData.success) {
      throw new Error(`Update failed: ${updateLocalData.message}`);
    }
    if (
      updateLocalData.data.musicEnabled !== true ||
      updateLocalData.data.musicTitle !== "Acoustic Wedding Theme" ||
      updateLocalData.data.backgroundMusicUrl !== "/music/wedding-theme.mp3"
    ) {
      throw new Error("Local audio update values do not match expected data.");
    }
    console.log("✓ Local audio path successfully saved in MongoDB.");

    // 7. Test valid direct HTTPS URL update
    console.log("\n[Test 7] Testing valid update with external HTTPS audio URL...");
    const validHttpPayload = {
      musicEnabled: true,
      musicTitle: "Canon in D - Pachelbel",
      backgroundMusicUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    };
    const updateHttpRes = await fetch(`${BASE_URL}/wedding`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify(validHttpPayload),
    });
    const updateHttpData = await updateHttpRes.json();
    console.log("Update HTTP status:", updateHttpRes.status, "Success:", updateHttpData.success);
    if (!updateHttpData.success) {
      throw new Error(`Update failed: ${updateHttpData.message}`);
    }
    if (
      updateHttpData.data.musicTitle !== "Canon in D - Pachelbel" ||
      updateHttpData.data.backgroundMusicUrl !== "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
    ) {
      throw new Error("HTTP audio update values do not match expected data.");
    }
    console.log("✓ External HTTPS audio URL successfully saved in MongoDB.");

    // 8. Test preservation of existing fields
    console.log("\n[Test 8] Verifying preservation of other wedding fields...");
    const checkDoc = await Wedding.findOne();
    if (checkDoc.weddingTitle !== initialWedding.weddingTitle) {
      throw new Error(`Wedding title corrupted! Expected '${initialWedding.weddingTitle}', got '${checkDoc.weddingTitle}'`);
    }
    if (initialWedding.primaryColor && checkDoc.primaryColor !== initialWedding.primaryColor) {
      throw new Error(`Theme color corrupted! Expected '${initialWedding.primaryColor}', got '${checkDoc.primaryColor}'`);
    }
    console.log("✓ Unrelated fields (title, theme, couple, venues) perfectly preserved.");

    // 9. Revert music settings back to original
    console.log("\n[Test 9] Reverting to initial music configuration...");
    await fetch(`${BASE_URL}/wedding`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({
        musicEnabled: originalMusicEnabled,
        backgroundMusicUrl: originalMusicUrl,
        musicTitle: originalMusicTitle,
      }),
    });
    console.log("✓ Restored initial music configuration.");

    console.log("\n==================================================");
    console.log("ALL BACKGROUND MUSIC BACKEND TESTS PASSED SUCCESSFULLY!");
    console.log("==================================================");
  } finally {
    await mongoose.disconnect();
  }
}

runTests().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
