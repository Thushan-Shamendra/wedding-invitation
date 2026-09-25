const mongoose = require("mongoose");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

const Wedding = require("../models/Wedding");
const Admin = require("../models/Admin");

const BASE_URL = `http://localhost:${process.env.PORT || 5000}/api`;

async function runTests() {
  console.log("=== STARTING INVITATION MESSAGE BACKEND TESTS ===");

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

  // Capture existing state before tests
  const initialWedding = await Wedding.findOne();
  console.log("Initial wedding title:", initialWedding ? initialWedding.weddingTitle : "None");

  try {
    // 1. Test GET /api/wedding (Public)
    console.log("\n[Test 1] Testing public GET /api/wedding...");
    const getRes = await fetch(`${BASE_URL}/wedding`);
    const getData = await getRes.json();
    console.log("GET status:", getRes.status, "Success:", getData.success);
    if (!getData.success || !getData.data) {
      throw new Error("Failed to get wedding details.");
    }
    console.log("✓ Public GET /api/wedding succeeded.");

    // 2. Test 401 Unauthorized PUT without token
    console.log("\n[Test 2] Testing 401 Unauthorized for PUT /api/wedding without token...");
    const unauthRes = await fetch(`${BASE_URL}/wedding`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invitationHeading: "Unauthorized Attempt" }),
    });
    console.log("Unauthorized status:", unauthRes.status);
    if (unauthRes.status !== 401) {
      throw new Error(`Expected 401, got ${unauthRes.status}`);
    }
    console.log("✓ Unauthorized PUT properly rejected with 401.");

    // 3. Test max length validations
    console.log("\n[Test 3] Testing max length validations (Heading > 150 chars)...");
    const longHeading = "A".repeat(151);
    const exceedHeadingRes = await fetch(`${BASE_URL}/wedding`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({ invitationHeading: longHeading }),
    });
    console.log("Exceed heading status:", exceedHeadingRes.status);
    if (exceedHeadingRes.status !== 400) {
      throw new Error("Expected 400 for heading > 150 characters.");
    }
    console.log("✓ Exceeding invitationHeading length rejected with 400.");

    console.log("\n[Test 4] Testing max length validations (Greeting > 200 chars)...");
    const longGreeting = "B".repeat(201);
    const exceedGreetingRes = await fetch(`${BASE_URL}/wedding`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({ personalGuestGreeting: longGreeting }),
    });
    console.log("Exceed greeting status:", exceedGreetingRes.status);
    if (exceedGreetingRes.status !== 400) {
      throw new Error("Expected 400 for greeting > 200 characters.");
    }
    console.log("✓ Exceeding personalGuestGreeting length rejected with 400.");

    console.log("\n[Test 5] Testing max length validations (Message > 3000 chars)...");
    const longMessage = "C".repeat(3001);
    const exceedMsgRes = await fetch(`${BASE_URL}/wedding`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({ invitationMessage: longMessage }),
    });
    console.log("Exceed message status:", exceedMsgRes.status);
    if (exceedMsgRes.status !== 400) {
      throw new Error("Expected 400 for message > 3000 characters.");
    }
    console.log("✓ Exceeding invitationMessage length rejected with 400.");

    // 4. Test safe partial update of invitation fields
    console.log("\n[Test 6] Testing safe partial update of invitation fields...");
    const testPayload = {
      invitationHeading: "We're Getting Married!",
      personalGuestGreeting: "Dearest {{guestName}},",
      invitationMessage:
        "We warmly invite you to celebrate our union in the presence of family and friends.",
      footerMessage: "With All Our Love, Amanda & Daniel",
    };

    const updateRes = await fetch(`${BASE_URL}/wedding`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify(testPayload),
    });
    const updateData = await updateRes.json();
    console.log("Update status:", updateRes.status, "Success:", updateData.success);
    if (!updateData.success || !updateData.data) {
      throw new Error("Failed to update invitation message.");
    }

    // Verify fields stored correctly
    if (
      updateData.data.invitationHeading !== testPayload.invitationHeading ||
      updateData.data.personalGuestGreeting !== testPayload.personalGuestGreeting ||
      updateData.data.invitationMessage !== testPayload.invitationMessage ||
      updateData.data.footerMessage !== testPayload.footerMessage
    ) {
      throw new Error("Stored invitation fields do not match payload.");
    }

    // Verify unrelated fields were preserved
    if (initialWedding) {
      if (initialWedding.brideName && updateData.data.brideName !== initialWedding.brideName) {
        throw new Error("Bride name was overwritten!");
      }
      if (initialWedding.groomName && updateData.data.groomName !== initialWedding.groomName) {
        throw new Error("Groom name was overwritten!");
      }
      if (
        initialWedding.ceremonyVenueName &&
        updateData.data.ceremonyVenueName !== initialWedding.ceremonyVenueName
      ) {
        throw new Error("Ceremony venue was overwritten!");
      }
    }
    console.log("✓ Invitation fields updated and all other wedding fields preserved intact.");

    console.log("\nALL INVITATION MESSAGE BACKEND TESTS PASSED! 🎉");
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
