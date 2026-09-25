const mongoose = require("mongoose");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

const Wedding = require("../models/Wedding");
const Admin = require("../models/Admin");

const BASE_URL = `http://localhost:${process.env.PORT || 5000}/api`;

async function runTests() {
  console.log("=== STARTING THEME & APPEARANCE BACKEND TESTS ===");

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

  try {
    // 1. Test GET /api/wedding (Public)
    console.log("\n[Test 1] Testing public GET /api/wedding for theme settings...");
    const getRes = await fetch(`${BASE_URL}/wedding`);
    const getData = await getRes.json();
    console.log("GET status:", getRes.status, "Success:", getData.success);
    if (!getData.success || !getData.data) {
      throw new Error("Failed to get wedding details.");
    }
    console.log("✓ Public GET /api/wedding returned successfully.");

    // 2. Test 401 Unauthorized for PUT without token
    console.log("\n[Test 2] Testing 401 Unauthorized for PUT /api/wedding without token...");
    const unauthRes = await fetch(`${BASE_URL}/wedding`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ primaryColor: "#A67C52" }),
    });
    console.log("Unauthorized status:", unauthRes.status);
    if (unauthRes.status !== 401) {
      throw new Error(`Expected 401, got ${unauthRes.status}`);
    }
    console.log("✓ Unauthorized update correctly rejected with 401.");

    // 3. Test invalid hex color rejection
    console.log("\n[Test 3] Testing 400 rejection for invalid hex colors...");
    const invalidColors = ["#12XYZ", "gold", "123456", "#12345", "rgb(0,0,0)"];
    for (const invalidColor of invalidColors) {
      const res = await fetch(`${BASE_URL}/wedding`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ primaryColor: invalidColor }),
      });
      if (res.status !== 400) {
        throw new Error(`Expected 400 for invalid color '${invalidColor}', got ${res.status}`);
      }
    }
    console.log("✓ All invalid hex colors correctly rejected with 400.");

    // 4. Test invalid theme style rejection
    console.log("\n[Test 4] Testing 400 rejection for invalid themeStyle...");
    const invalidStyleRes = await fetch(`${BASE_URL}/wedding`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({ themeStyle: "cyberpunk-futuristic" }),
    });
    console.log("Invalid style status:", invalidStyleRes.status);
    if (invalidStyleRes.status !== 400) {
      throw new Error("Expected 400 for invalid theme style.");
    }
    console.log("✓ Invalid themeStyle correctly rejected with 400.");

    // 5. Test invalid font rejection
    console.log("\n[Test 5] Testing 400 rejection for unwhitelisted fonts...");
    const invalidFontRes = await fetch(`${BASE_URL}/wedding`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({ headingFont: "Comic Sans MS" }),
    });
    console.log("Invalid font status:", invalidFontRes.status);
    if (invalidFontRes.status !== 400) {
      throw new Error("Expected 400 for unwhitelisted font.");
    }
    console.log("✓ Unwhitelisted font correctly rejected with 400.");

    // 6. Test valid theme update
    console.log("\n[Test 6] Testing valid theme update...");
    const validThemePayload = {
      primaryColor: "#A67C52",
      secondaryColor: "#D8B4A0",
      backgroundColor: "#FFF9F3",
      textColor: "#2A2520",
      headingFont: "Cormorant Garamond",
      bodyFont: "Inter",
      themeStyle: "luxury",
    };

    const updateRes = await fetch(`${BASE_URL}/wedding`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify(validThemePayload),
    });
    const updateData = await updateRes.json();
    console.log("Update status:", updateRes.status, "Success:", updateData.success);
    if (!updateData.success || !updateData.data) {
      throw new Error("Failed to update theme settings.");
    }

    // Verify stored theme values
    const d = updateData.data;
    if (
      d.primaryColor !== validThemePayload.primaryColor ||
      d.secondaryColor !== validThemePayload.secondaryColor ||
      d.backgroundColor !== validThemePayload.backgroundColor ||
      d.textColor !== validThemePayload.textColor ||
      d.headingFont !== validThemePayload.headingFont ||
      d.bodyFont !== validThemePayload.bodyFont ||
      d.themeStyle !== validThemePayload.themeStyle
    ) {
      throw new Error("Stored theme values do not match submitted payload.");
    }

    // Verify preservation of other wedding fields
    if (initialWedding) {
      if (initialWedding.brideName && d.brideName !== initialWedding.brideName) {
        throw new Error("Bride name was overwritten!");
      }
      if (initialWedding.ceremonyVenueName && d.ceremonyVenueName !== initialWedding.ceremonyVenueName) {
        throw new Error("Ceremony venue was overwritten!");
      }
      if (initialWedding.invitationHeading && d.invitationHeading !== initialWedding.invitationHeading) {
        throw new Error("Invitation heading was overwritten!");
      }
    }
    console.log("✓ Theme settings updated and all existing wedding data preserved.");

    console.log("\nALL THEME & APPEARANCE BACKEND TESTS PASSED! 🎉");
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
