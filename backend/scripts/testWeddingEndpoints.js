const http = require("http");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

dotenv.config({ path: path.join(__dirname, "../.env") });

const Admin = require("../models/Admin");
const authRoutes = require("../routes/authRoutes");
const weddingRoutes = require("../routes/weddingRoutes");

async function testWedding() {
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

  // Login to get token
  const loginRes = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@wedding.com", password: "admin123456" }),
  });
  const loginData = await loginRes.json();
  const token = loginData.token;
  console.log("Auth token acquired:", !!token);

  // 1. GET /api/wedding public
  console.log("\n--- Testing GET /api/wedding (public) ---");
  const getRes1 = await fetch(`${baseUrl}/wedding`);
  const getData1 = await getRes1.json();
  console.log("Status:", getRes1.status, "Title:", getData1.data?.weddingTitle);
  if (getRes1.status === 200 && getData1.success) {
    console.log("✓ GET /api/wedding passed");
  } else {
    throw new Error("GET /api/wedding failed");
  }

  // 2. PUT /api/wedding without token
  console.log("\n--- Testing PUT /api/wedding (unauthorized) ---");
  const putRes1 = await fetch(`${baseUrl}/wedding`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ weddingTitle: "Hacked Wedding" }),
  });
  console.log("Status:", putRes1.status);
  if (putRes1.status === 401) {
    console.log("✓ Protected PUT rejected unauthorized request");
  } else {
    throw new Error("Protected PUT failed to reject unauthorized request");
  }

  // 3. PUT /api/wedding with token (Updating Wedding Details)
  console.log("\n--- Testing PUT /api/wedding with token ---");
  const updatePayload = {
    weddingTitle: "Amanda & Daniel's Wedding",
    brideName: "Amanda Silva",
    groomName: "Daniel Perera",
    weddingDate: "2026-12-18",
    startTime: "14:00",
    endTime: "22:00",
    dressCode: "Formal / Black Tie",
    contactBride: "+94 77 123 4567",
    contactGroom: "+94 71 987 6543",
    contactCoordinator: "+94 70 555 4321",
  };
  const putRes2 = await fetch(`${baseUrl}/wedding`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updatePayload),
  });
  const putData2 = await putRes2.json();
  console.log("Status:", putRes2.status, "Updated Title:", putData2.data?.weddingTitle);
  if (
    putRes2.status === 200 &&
    putData2.data?.weddingTitle === "Amanda & Daniel's Wedding" &&
    putData2.data?.dressCode === "Formal / Black Tie"
  ) {
    console.log("✓ Wedding details updated successfully");
  } else {
    throw new Error("PUT wedding details failed");
  }

  // 4. PUT /api/wedding with Couple Details ONLY -> Check non-displayed fields are preserved!
  console.log("\n--- Testing Couple Details Partial Update (Field Preservation) ---");
  const couplePayload = {
    brideName: "Amanda Silva",
    brideDescription: "A creative soul who loves art and music.",
    groomName: "Daniel Perera",
    groomDescription: "An adventurous engineer with a passion for travel.",
  };
  const putRes3 = await fetch(`${baseUrl}/wedding`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(couplePayload),
  });
  const putData3 = await putRes3.json();
  console.log(
    "Bride Description:",
    putData3.data?.brideDescription,
    "Preserved Dress Code:",
    putData3.data?.dressCode,
    "Preserved Date:",
    putData3.data?.weddingDate
  );
  if (
    putData3.data?.brideDescription === "A creative soul who loves art and music." &&
    putData3.data?.dressCode === "Formal / Black Tie" &&
    putData3.data?.weddingDate === "2026-12-18"
  ) {
    console.log("✓ Field preservation test passed: non-displayed fields NOT erased!");
  } else {
    throw new Error("Field preservation failed");
  }

  server.close();
  await mongoose.connection.close();
  console.log("\n>>> ALL WEDDING API TESTS PASSED! <<<\n");
}

testWedding().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
