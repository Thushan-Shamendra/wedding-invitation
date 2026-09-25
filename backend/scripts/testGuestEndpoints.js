const http = require("http");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const mongoose = require("mongoose");

dotenv.config({ path: path.join(__dirname, "../.env") });

const authRoutes = require("../routes/authRoutes");
const guestRoutes = require("../routes/guestRoutes");
const Guest = require("../models/Guest");

async function testGuests() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected.");

  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use("/api/auth", authRoutes);
  app.use("/api/guests", guestRoutes);

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5095, resolve));
  const baseUrl = "http://localhost:5095/api";

  // Login
  const loginRes = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@wedding.com", password: "admin123456" }),
  });
  const loginData = await loginRes.json();
  const token = loginData.token;

  // 1. Unauthorized POST
  console.log("\n--- Testing Unauthorized POST ---");
  const unauthRes = await fetch(`${baseUrl}/guests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Hacked Guest" }),
  });
  console.log("Status:", unauthRes.status);
  if (unauthRes.status === 401) {
    console.log("✓ Unauthorized POST correctly rejected with 401");
  } else {
    throw new Error("Unauthorized POST was not rejected");
  }

  // 2. Create Guest & Verify Unique Token
  console.log("\n--- Testing Create Guest & Token Generation ---");
  const createRes = await fetch(`${baseUrl}/guests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: "Kasun Perera",
      email: "kasun@example.com",
      phone: "0771234567",
      maximumGuests: 2,
      personalMessage: "Dear Kasun, we would love to celebrate our special day with you.",
    }),
  });
  const createData = await createRes.json();
  console.log(
    "Status:",
    createRes.status,
    "Guest Name:",
    createData.data?.name,
    "Token:",
    createData.data?.invitationToken
  );
  if (
    createRes.status === 201 &&
    createData.data?.name === "Kasun Perera" &&
    createData.data?.invitationToken.startsWith("kasun-perera-")
  ) {
    console.log("✓ Guest created with unique human-readable token");
  } else {
    throw new Error("Guest creation failed");
  }

  const guestId = createData.data._id;
  const invToken = createData.data.invitationToken;

  // 3. Public Invitation Lookup by Token
  console.log("\n--- Testing Public Token Lookup ---");
  const pubRes = await fetch(`${baseUrl}/guests/invite/${invToken}`);
  const pubData = await pubRes.json();
  console.log("Status:", pubRes.status, "Public Name:", pubData.data?.name, "Max Guests:", pubData.data?.maximumGuests);
  if (
    pubRes.status === 200 &&
    pubData.data?.name === "Kasun Perera" &&
    pubData.data?.maximumGuests === 2 &&
    pubData.data?.email === undefined // Ensure private email is omitted
  ) {
    console.log("✓ Public invitation details returned safely");
  } else {
    throw new Error("Public invitation endpoint failed");
  }

  // 4. Invalid Token
  console.log("\n--- Testing Invalid Token Lookup ---");
  const invalidRes = await fetch(`${baseUrl}/guests/invite/invalid-non-existent-token-1234`);
  console.log("Status:", invalidRes.status);
  if (invalidRes.status === 404) {
    console.log("✓ Invalid token correctly returned 404");
  } else {
    throw new Error("Invalid token test failed");
  }

  // 5. Update Guest & Verify Token Preserved
  console.log("\n--- Testing Update Guest & Token Stability ---");
  const updateRes = await fetch(`${baseUrl}/guests/${guestId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      maximumGuests: 3,
      rsvpStatus: "attending",
    }),
  });
  const updateData = await updateRes.json();
  console.log(
    "Updated Max Guests:",
    updateData.data?.maximumGuests,
    "Updated Status:",
    updateData.data?.rsvpStatus,
    "Token Preserved:",
    updateData.data?.invitationToken === invToken
  );
  if (
    updateRes.status === 200 &&
    updateData.data?.maximumGuests === 3 &&
    updateData.data?.rsvpStatus === "attending" &&
    updateData.data?.invitationToken === invToken
  ) {
    console.log("✓ Token remained completely stable after update");
  } else {
    throw new Error("Update guest test failed");
  }

  // 6. Test Stats Summary
  console.log("\n--- Testing Stats Summary ---");
  const statsRes = await fetch(`${baseUrl}/guests/stats/summary`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const statsData = await statsRes.json();
  console.log("Stats Data:", statsData.data);
  if (statsRes.status === 200 && statsData.data?.attending >= 1) {
    console.log("✓ Stats summary calculated successfully");
  } else {
    throw new Error("Stats summary failed");
  }

  // 7. Test Search and Filtering
  console.log("\n--- Testing Search & Status Query ---");
  const searchRes = await fetch(`${baseUrl}/guests?search=kasun&status=attending`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const searchData = await searchRes.json();
  console.log("Search matches:", searchData.count);
  if (searchRes.status === 200 && searchData.count >= 1) {
    console.log("✓ Search & filtering passed");
  } else {
    throw new Error("Search test failed");
  }

  // 8. Delete Guest
  console.log("\n--- Testing Delete Guest ---");
  const delRes = await fetch(`${baseUrl}/guests/${guestId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log("Delete status:", delRes.status);
  if (delRes.status === 200) {
    console.log("✓ Delete passed");
  } else {
    throw new Error("Delete failed");
  }

  server.close();
  await mongoose.connection.close();
  console.log("\n>>> ALL GUEST API TESTS PASSED! <<<\n");
}

testGuests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
