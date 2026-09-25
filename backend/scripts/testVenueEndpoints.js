const http = require("http");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const mongoose = require("mongoose");

dotenv.config({ path: path.join(__dirname, "../.env") });

const authRoutes = require("../routes/authRoutes");
const weddingRoutes = require("../routes/weddingRoutes");

async function testVenue() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected.");

  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use("/api/auth", authRoutes);
  app.use("/api/wedding", weddingRoutes);

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5097, resolve));
  const baseUrl = "http://localhost:5097/api";

  // Login
  const loginRes = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@wedding.com", password: "admin123456" }),
  });
  const loginData = await loginRes.json();
  const token = loginData.token;

  // 1. Test Invalid Latitude
  console.log("\n--- Testing Invalid Latitude Validation (100) ---");
  const invRes = await fetch(`${baseUrl}/wedding`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ceremonyLatitude: 100 }),
  });
  const invData = await invRes.json();
  console.log("Status:", invRes.status, "Message:", invData.message);
  if (invRes.status === 400 && invData.message.includes("latitude")) {
    console.log("✓ Invalid latitude correctly rejected");
  } else {
    throw new Error("Invalid latitude was not rejected");
  }

  // 2. Test Valid Venue Update
  console.log("\n--- Testing Valid Venue Update ---");
  const venuePayload = {
    ceremonyVenueName: "Shangri-La Colombo",
    ceremonyAddress: "1 Galle Face, Colombo 02",
    ceremonyDate: "2026-12-18",
    ceremonyTime: "14:00",
    ceremonyGoogleMapsUrl: "https://maps.google.com/?q=Shangri-La+Colombo",
    ceremonyLatitude: 6.9271,
    ceremonyLongitude: 79.8441,
    ceremonyDescription: "The ceremony will be held in the Lotus Ballroom.",
    receptionVenueName: "Galle Face Hotel",
    receptionAddress: "2 Galle Road, Colombo 03",
    receptionDate: "2026-12-18",
    receptionTime: "18:30",
    receptionGoogleMapsUrl: "https://maps.google.com/?q=Galle+Face+Hotel",
    receptionLatitude: 6.9197,
    receptionLongitude: 79.8453,
    receptionDescription: "Cocktails and dinner on the Grand Sea Lawn.",
  };

  const putRes = await fetch(`${baseUrl}/wedding`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(venuePayload),
  });
  const putData = await putRes.json();
  console.log("Status:", putRes.status, "Ceremony Venue:", putData.data?.ceremonyVenueName);
  if (
    putRes.status === 200 &&
    putData.data?.ceremonyVenueName === "Shangri-La Colombo" &&
    putData.data?.ceremonyLatitude === 6.9271
  ) {
    console.log("✓ Venue details updated successfully");
  } else {
    throw new Error("Venue update failed");
  }

  // 3. Verify non-venue fields were preserved
  console.log("\n--- Checking Non-Venue Field Preservation ---");
  if (putData.data?.weddingTitle && putData.data?.brideName) {
    console.log("✓ Wedding Title preserved:", putData.data.weddingTitle);
    console.log("✓ Bride Name preserved:", putData.data.brideName);
  } else {
    throw new Error("Non-venue fields were lost");
  }

  server.close();
  await mongoose.connection.close();
  console.log("\n>>> ALL VENUE API TESTS PASSED! <<<\n");
}

testVenue().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
