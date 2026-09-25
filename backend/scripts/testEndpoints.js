const http = require("http");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const mongoose = require("mongoose");

dotenv.config({ path: path.join(__dirname, "../.env") });

const authRoutes = require("../routes/authRoutes");

async function runTests() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB.");

  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use("/api/auth", authRoutes);

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5099, resolve));
  const baseUrl = "http://localhost:5099/api/auth";

  console.log("\n--- Testing Invalid Login ---");
  const res1 = await fetch(`${baseUrl}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@wedding.com", password: "wrongpassword" }),
  });
  const data1 = await res1.json();
  console.log("Status:", res1.status, "Response:", data1);
  if (res1.status === 401 && data1.message === "Invalid email or password.") {
    console.log("✓ Invalid login test passed");
  } else {
    throw new Error("Invalid login test failed");
  }

  console.log("\n--- Testing Valid Login ---");
  const res2 = await fetch(`${baseUrl}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@wedding.com", password: "admin123456" }),
  });
  const data2 = await res2.json();
  console.log("Status:", res2.status, "Has Token:", !!data2.token, "Admin:", data2.admin);
  if (res2.status === 200 && data2.token && data2.admin.email === "admin@wedding.com") {
    console.log("✓ Valid login test passed");
  } else {
    throw new Error("Valid login test failed");
  }

  const token = data2.token;

  console.log("\n--- Testing GET /me without Token ---");
  const res3 = await fetch(`${baseUrl}/me`);
  const data3 = await res3.json();
  console.log("Status:", res3.status, "Response:", data3);
  if (res3.status === 401) {
    console.log("✓ GET /me unauthorized test passed");
  } else {
    throw new Error("GET /me unauthorized test failed");
  }

  console.log("\n--- Testing GET /me with Token ---");
  const res4 = await fetch(`${baseUrl}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data4 = await res4.json();
  console.log("Status:", res4.status, "Admin:", data4.admin);
  if (res4.status === 200 && data4.admin.email === "admin@wedding.com") {
    console.log("✓ GET /me authorized test passed");
  } else {
    throw new Error("GET /me authorized test failed");
  }

  server.close();
  await mongoose.connection.close();
  console.log("\n>>> ALL BACKEND AUTH TESTS PASSED SUCCESSFULLY! <<<\n");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
