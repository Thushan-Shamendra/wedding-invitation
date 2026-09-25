const http = require("http");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const mongoose = require("mongoose");

dotenv.config({ path: path.join(__dirname, "../.env") });

const authRoutes = require("../routes/authRoutes");
const scheduleRoutes = require("../routes/scheduleRoutes");
const Schedule = require("../models/Schedule");

async function testSchedule() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected.");

  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use("/api/auth", authRoutes);
  app.use("/api/schedule", scheduleRoutes);

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5096, resolve));
  const baseUrl = "http://localhost:5096/api";

  // Login
  const loginRes = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@wedding.com", password: "admin123456" }),
  });
  const loginData = await loginRes.json();
  const token = loginData.token;

  // 1. Public GET
  console.log("\n--- Testing Public GET /api/schedule ---");
  const getRes1 = await fetch(`${baseUrl}/schedule`);
  const getData1 = await getRes1.json();
  console.log("Status:", getRes1.status, "Existing count:", getData1.count);
  if (getRes1.status === 200 && getData1.success) {
    console.log("✓ Public GET passed");
  } else {
    throw new Error("Public GET failed");
  }

  // 2. Protected POST unauthorized
  console.log("\n--- Testing Unauthorized POST ---");
  const unauthRes = await fetch(`${baseUrl}/schedule`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventName: "Unauthorized Event", startTime: "12:00" }),
  });
  console.log("Status:", unauthRes.status);
  if (unauthRes.status === 401) {
    console.log("✓ Protected POST correctly rejected");
  } else {
    throw new Error("Protected POST failed to reject");
  }

  // 3. Validation failure: missing startTime
  console.log("\n--- Testing Validation (Missing startTime) ---");
  const valRes = await fetch(`${baseUrl}/schedule`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ eventName: "Incomplete Event" }),
  });
  console.log("Status:", valRes.status);
  if (valRes.status === 400) {
    console.log("✓ Missing startTime correctly rejected");
  } else {
    throw new Error("Validation failure test failed");
  }

  // 4. Create 3 events in reverse order to test sorting
  console.log("\n--- Creating Events with Orders ---");
  const create1 = await fetch(`${baseUrl}/schedule`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      eventName: "Reception & Dinner",
      startTime: "18:30",
      description: "Cocktails and dinner on the Grand Sea Lawn.",
      order: 3,
    }),
  });
  const data1 = await create1.json();
  const event3Id = data1.data._id;

  const create2 = await fetch(`${baseUrl}/schedule`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      eventName: "Guest Arrival",
      startTime: "14:00",
      description: "Guests arrive and take their seats.",
      order: 1,
    }),
  });
  const data2 = await create2.json();
  const event1Id = data2.data._id;

  const create3 = await fetch(`${baseUrl}/schedule`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      eventName: "Wedding Ceremony",
      startTime: "15:00",
      description: "Marriage ceremony begins in the Lotus Ballroom.",
      order: 2,
    }),
  });
  const data3 = await create3.json();
  const event2Id = data3.data._id;

  // 5. Verify sorting: order 1 should be first, order 2 second, order 3 third
  console.log("\n--- Testing Timeline Sorting ---");
  const sortedRes = await fetch(`${baseUrl}/schedule`);
  const sortedData = await sortedRes.json();
  const sortedEvents = sortedData.data;
  console.log(
    "Order returned:",
    sortedEvents.map((e) => `${e.order}: ${e.eventName} (${e.startTime})`)
  );
  if (
    sortedEvents[0].eventName === "Guest Arrival" &&
    sortedEvents[1].eventName === "Wedding Ceremony" &&
    sortedEvents[2].eventName === "Reception & Dinner"
  ) {
    console.log("✓ Sorting by order passed");
  } else {
    throw new Error("Sorting failed");
  }

  // 6. Test PUT update
  console.log("\n--- Testing PUT update ---");
  const updateRes = await fetch(`${baseUrl}/schedule/${event2Id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      description: "Sacred vows and exchanging rings.",
    }),
  });
  const updateData = await updateRes.json();
  console.log("Updated description:", updateData.data.description);
  if (updateData.data.description === "Sacred vows and exchanging rings.") {
    console.log("✓ PUT update passed");
  } else {
    throw new Error("PUT update failed");
  }

  // 7. Test DELETE
  console.log("\n--- Testing DELETE ---");
  const deleteRes = await fetch(`${baseUrl}/schedule/${event3Id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  console.log("Delete status:", deleteRes.status);
  if (deleteRes.status === 200) {
    console.log("✓ DELETE passed");
  } else {
    throw new Error("DELETE failed");
  }

  // Verify deletion count
  const postDelRes = await fetch(`${baseUrl}/schedule`);
  const postDelData = await postDelRes.json();
  console.log("Count after delete:", postDelData.count);

  // Clean up remaining test events
  await Schedule.findByIdAndDelete(event1Id);
  await Schedule.findByIdAndDelete(event2Id);
  console.log("✓ Test cleanup completed");

  server.close();
  await mongoose.connection.close();
  console.log("\n>>> ALL SCHEDULE API TESTS PASSED! <<<\n");
}

testSchedule().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
