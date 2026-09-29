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
  console.log("=== STARTING VENUE MODULE COMPREHENSIVE ENDPOINT TESTS ===");
  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected.");

  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use("/api/auth", authRoutes);
  app.use("/api/wedding", weddingRoutes);

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5098, resolve));
  const baseUrl = "http://localhost:5098/api";

  try {
    // Login
    console.log("\n[Auth] Logging in as admin...");
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@wedding.com", password: "admin123456" }),
    });
    const loginData = await loginRes.json();
    if (!loginData.token) {
      throw new Error(`Admin login failed: ${JSON.stringify(loginData)}`);
    }
    const token = loginData.token;
    const authHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
    console.log("✓ Logged in successfully.");

    // 1. Test ceremony hall name & optional coordinates (Scenario 1)
    console.log("\n[Test 1] Testing ceremony hall name & optional coordinates...");
    const scenario1Payload = {
      ceremonyVenueName: "Cinnamon Lakeside Colombo",
      ceremonyHallName: "Lotus Ballroom",
      ceremonyAddress: "115 Sir Chittampalam A Gardiner Mawatha, Colombo 02",
      ceremonyDate: "2026-12-18",
      ceremonyTime: "14:00",
      ceremonyLatitude: null,
      ceremonyLongitude: null,
      receptionEnabled: false,
    };

    const res1 = await fetch(`${baseUrl}/wedding`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify(scenario1Payload),
    });
    const data1 = await res1.json();
    if (res1.status !== 200 || !data1.success) {
      throw new Error(`Test 1 failed: ${data1.message}`);
    }
    if (
      data1.data.ceremonyVenueName !== "Cinnamon Lakeside Colombo" ||
      data1.data.ceremonyHallName !== "Lotus Ballroom" ||
      data1.data.ceremonyLatitude !== null ||
      data1.data.ceremonyLongitude !== null ||
      data1.data.receptionEnabled !== false
    ) {
      throw new Error(`Test 1 payload values mismatch: ${JSON.stringify(data1.data)}`);
    }
    console.log("✓ Ceremony hall name saved and null coordinates permitted.");

    // 2. Test reception enabled = true with optional hall name (Scenario 6)
    console.log("\n[Test 2] Testing reception enabled = true with hall name and coordinates...");
    const scenario2Payload = {
      receptionEnabled: true,
      receptionVenueName: "Galle Face Hotel",
      receptionHallName: "Grand Ballroom",
      receptionAddress: "2 Galle Road, Colombo 03",
      receptionDate: "2026-12-18",
      receptionTime: "18:30",
      receptionLatitude: 6.9197,
      receptionLongitude: 79.8453,
      receptionDescription: "Cocktails and dinner on the Grand Sea Lawn.",
    };

    const res2 = await fetch(`${baseUrl}/wedding`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify(scenario2Payload),
    });
    const data2 = await res2.json();
    if (res2.status !== 200 || !data2.success) {
      throw new Error(`Test 2 failed: ${data2.message}`);
    }
    if (
      data2.data.receptionEnabled !== true ||
      data2.data.receptionVenueName !== "Galle Face Hotel" ||
      data2.data.receptionHallName !== "Grand Ballroom" ||
      data2.data.receptionLatitude !== 6.9197 ||
      data2.data.receptionLongitude !== 79.8453
    ) {
      throw new Error(`Test 2 reception values mismatch: ${JSON.stringify(data2.data)}`);
    }
    console.log("✓ Reception enabled with hall name and coordinates saved.");

    // 3. Test partial update preservation
    console.log("\n[Test 3] Testing non-venue and cross-field preservation...");
    if (
      data2.data.ceremonyVenueName !== "Cinnamon Lakeside Colombo" ||
      data2.data.ceremonyHallName !== "Lotus Ballroom" ||
      !data2.data.weddingTitle
    ) {
      throw new Error("Partial update failed: previous ceremony or weddingTitle overwritten!");
    }
    console.log("✓ Ceremony details and weddingTitle preserved across partial update.");

    // 4. Test reception disabled keeps saved data
    console.log("\n[Test 4] Testing reception disabled preserves existing reception data...");
    const res3 = await fetch(`${baseUrl}/wedding`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({ receptionEnabled: false }),
    });
    const data3 = await res3.json();
    if (
      res3.status !== 200 ||
      data3.data.receptionEnabled !== false ||
      data3.data.receptionVenueName !== "Galle Face Hotel" ||
      data3.data.receptionHallName !== "Grand Ballroom"
    ) {
      throw new Error("Disabling reception failed or wiped saved reception fields.");
    }
    console.log("✓ Disabling reception kept existing reception records intact.");

    // 5. Test coordinate validation
    console.log("\n[Test 5] Testing coordinate validation rules...");

    // 5a. Out of range latitude
    const badLatRes = await fetch(`${baseUrl}/wedding`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({ ceremonyLatitude: 100, ceremonyLongitude: 79.84 }),
    });
    const badLatData = await badLatRes.json();
    if (badLatRes.status !== 400 || !badLatData.message.includes("latitude")) {
      throw new Error(`Expected 400 for latitude 100, got ${badLatRes.status}: ${badLatData.message}`);
    }
    console.log("✓ Out-of-bounds latitude correctly rejected (400).");

    // 5b. Out of range longitude
    const badLngRes = await fetch(`${baseUrl}/wedding`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({ ceremonyLatitude: 6.92, ceremonyLongitude: 200 }),
    });
    const badLngData = await badLngRes.json();
    if (badLngRes.status !== 400 || !badLngData.message.includes("longitude")) {
      throw new Error(`Expected 400 for longitude 200, got ${badLngRes.status}: ${badLngData.message}`);
    }
    console.log("✓ Out-of-bounds longitude correctly rejected (400).");

    // 5c. Only latitude provided without longitude
    const singleLatRes = await fetch(`${baseUrl}/wedding`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({ ceremonyLatitude: 6.9271 }),
    });
    const singleLatData = await singleLatRes.json();
    if (singleLatRes.status !== 400 || !singleLatData.message.includes("both")) {
      throw new Error(`Expected 400 for single latitude, got ${singleLatRes.status}: ${singleLatData.message}`);
    }
    console.log("✓ Latitude without longitude correctly rejected (400).");

    // 5d. Only longitude provided without latitude
    const singleLngRes = await fetch(`${baseUrl}/wedding`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({ receptionLongitude: 79.8453 }),
    });
    const singleLngData = await singleLngRes.json();
    if (singleLngRes.status !== 400 || !singleLngData.message.includes("both")) {
      throw new Error(`Expected 400 for single longitude, got ${singleLngRes.status}: ${singleLngData.message}`);
    }
    console.log("✓ Longitude without latitude correctly rejected (400).");

    // 5e. Both coordinates empty strings / null -> allowed and resets to null
    const clearCoordsRes = await fetch(`${baseUrl}/wedding`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({ ceremonyLatitude: "", ceremonyLongitude: "" }),
    });
    const clearCoordsData = await clearCoordsRes.json();
    if (
      clearCoordsRes.status !== 200 ||
      clearCoordsData.data.ceremonyLatitude !== null ||
      clearCoordsData.data.ceremonyLongitude !== null
    ) {
      throw new Error(`Expected 200 with null coordinates, got ${clearCoordsRes.status}`);
    }
    console.log("✓ Empty coordinate strings correctly cleared coordinates to null.");

    // 6. Test Google Maps URL Validation
    console.log("\n[Test 6] Testing Google Maps URL validation...");

    // 6a. Dangerous javascript: protocol
    const dangerousUrlRes = await fetch(`${baseUrl}/wedding`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({ ceremonyGoogleMapsUrl: "javascript:alert('xss')" }),
    });
    const dangerousUrlData = await dangerousUrlRes.json();
    if (dangerousUrlRes.status !== 400) {
      throw new Error(`Expected 400 for javascript: URL, got ${dangerousUrlRes.status}`);
    }
    console.log("✓ Dangerous javascript: protocol correctly rejected (400).");

    // 6b. Dangerous data: protocol
    const dataUrlRes = await fetch(`${baseUrl}/wedding`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({ receptionGoogleMapsUrl: "data:text/html,<script>alert(1)</script>" }),
    });
    if (dataUrlRes.status !== 400) {
      throw new Error(`Expected 400 for data: URL, got ${dataUrlRes.status}`);
    }
    console.log("✓ Dangerous data: protocol correctly rejected (400).");

    // 6c. Valid Google Maps sharing URLs
    const validUrlRes = await fetch(`${baseUrl}/wedding`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({
        ceremonyGoogleMapsUrl: "https://maps.app.goo.gl/zhptzfRZGCNeuBRt7",
        receptionGoogleMapsUrl: "https://maps.google.com/?q=Galle+Face+Hotel",
      }),
    });
    const validUrlData = await validUrlRes.json();
    if (
      validUrlRes.status !== 200 ||
      validUrlData.data.ceremonyGoogleMapsUrl !== "https://maps.app.goo.gl/zhptzfRZGCNeuBRt7"
    ) {
      throw new Error(`Expected 200 for valid maps URLs, got ${validUrlRes.status}`);
    }
    console.log("✓ Valid Google Maps sharing URLs accepted (200).");

    // 7. Test Hall Name validation (max 150 chars)
    console.log("\n[Test 7] Testing hall name length validation (>150)...");
    const longHallRes = await fetch(`${baseUrl}/wedding`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({ ceremonyHallName: "H".repeat(151) }),
    });
    if (longHallRes.status !== 400) {
      throw new Error(`Expected 400 for hall name > 150 chars, got ${longHallRes.status}`);
    }
    console.log("✓ Excessively long hall name correctly rejected (400).");

    // 8. Public GET /api/wedding
    console.log("\n[Test 8] Testing public GET /api/wedding returns all new fields...");
    const publicGetRes = await fetch(`${baseUrl}/wedding`);
    const publicGetData = await publicGetRes.json();
    if (
      publicGetRes.status !== 200 ||
      !publicGetData.success ||
      publicGetData.data.ceremonyHallName === undefined ||
      publicGetData.data.receptionEnabled === undefined ||
      publicGetData.data.receptionHallName === undefined
    ) {
      throw new Error("Public GET did not return ceremonyHallName, receptionEnabled, or receptionHallName");
    }
    console.log("✓ Public GET returns ceremonyHallName, receptionEnabled, and receptionHallName.");

    console.log("\n>>> ALL VENUE API & INTEGRATION TESTS PASSED! <<<\n");
  } finally {
    server.close();
    await mongoose.connection.close();
  }
}

testVenue().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
