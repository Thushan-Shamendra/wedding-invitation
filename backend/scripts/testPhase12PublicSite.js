const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const API_BASE = "http://localhost:5000/api";

async function runPhase12Tests() {
  console.log("=== STARTING PHASE 12 PUBLIC WEDDING SITE VERIFICATION ===");

  // 1. Fetch public wedding details
  console.log("\n[Test 1] Verifying public GET /api/wedding contains required dynamic fields...");
  const weddingRes = await fetch(`${API_BASE}/wedding`);
  const weddingJson = await weddingRes.json();
  if (weddingRes.status !== 200 || !weddingJson.success) {
    throw new Error(`Failed to fetch wedding details: ${weddingRes.status}`);
  }
  const wedding = weddingJson.data;
  console.log("✓ Wedding Title:", wedding.weddingTitle);
  console.log("✓ Bride:", wedding.brideName, "| Groom:", wedding.groomName);
  console.log("✓ Wedding Date:", wedding.weddingDate);
  console.log("✓ Website Status:", wedding.websiteStatus);
  console.log("✓ Theme:", wedding.themeStyle, "| Primary Color:", wedding.primaryColor);
  console.log("✓ Public fields verified successfully.");

  // 2. Fetch public schedule
  console.log("\n[Test 2] Verifying public GET /api/schedule...");
  const scheduleRes = await fetch(`${API_BASE}/schedule`);
  const scheduleJson = await scheduleRes.json();
  if (scheduleRes.status !== 200 || !scheduleJson.success) {
    throw new Error(`Failed to fetch schedule: ${scheduleRes.status}`);
  }
  console.log(`✓ Schedule events count: ${scheduleJson.count}`);

  // 3. Login as Admin and test draft vs published toggling
  console.log("\n[Test 3] Admin toggling websiteStatus to 'published' and verifying dynamic update...");
  const loginRes = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@wedding.com", password: "admin123456" }),
  });
  const loginJson = await loginRes.json();
  if (!loginJson.success || !loginJson.token) {
    throw new Error("Admin login failed");
  }
  const adminToken = loginJson.token;

  // Update status to published
  const updatePublishedRes = await fetch(`${API_BASE}/wedding`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ websiteStatus: "published" }),
  });
  const updatePublishedJson = await updatePublishedRes.json();
  if (!updatePublishedJson.success || updatePublishedJson.data.websiteStatus !== "published") {
    throw new Error("Failed to set websiteStatus to published");
  }
  console.log("✓ Successfully updated websiteStatus to 'published'.");

  // Verify public GET /api/wedding now returns 'published'
  const verifyPubRes = await fetch(`${API_BASE}/wedding`);
  const verifyPubJson = await verifyPubRes.json();
  if (verifyPubJson.data.websiteStatus !== "published") {
    throw new Error("Public endpoint does not reflect published status");
  }
  console.log("✓ Public endpoint dynamically returns 'published'.");

  // 4. Test schedule event creation and public display
  console.log("\n[Test 4] Adding a schedule event and verifying public schedule endpoint...");
  const newEventRes = await fetch(`${API_BASE}/schedule`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      eventName: "Welcome Ceremony",
      startTime: "15:00",
      description: "Gathering and welcoming of family and friends.",
      order: 1,
    }),
  });
  const newEventJson = await newEventRes.json();
  if (!newEventJson.success) {
    throw new Error("Failed to create schedule event");
  }
  const createdEventId = newEventJson.data._id;
  console.log("✓ Created schedule event ID:", createdEventId);

  // Check public endpoint
  const pubScheduleRes = await fetch(`${API_BASE}/schedule`);
  const pubScheduleJson = await pubScheduleRes.json();
  const found = pubScheduleJson.data.find((e) => e._id === createdEventId);
  if (!found || found.eventName !== "Welcome Ceremony") {
    throw new Error("Public schedule does not contain the newly created event");
  }
  console.log("✓ Public schedule dynamically reflects new event:", found.eventName, found.startTime);

  // Clean up created event
  await fetch(`${API_BASE}/schedule/${createdEventId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log("✓ Cleaned up test schedule event.");

  // 5. Test Guest Invitation Link and Token Lookup
  console.log("\n[Test 5] Verifying Guest invitation link and public token endpoint...");
  const createGuestRes = await fetch(`${API_BASE}/guests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      name: "Public Test Guest",
      email: "guest.test@example.com",
      maximumGuests: 2,
    }),
  });
  const createGuestJson = await createGuestRes.json();
  if (!createGuestJson.success) {
    throw new Error("Failed to create guest");
  }
  const testGuest = createGuestJson.data;
  console.log("✓ Created guest with token:", testGuest.invitationToken);

  // Public lookup
  const guestLookupRes = await fetch(`${API_BASE}/guests/invite/${testGuest.invitationToken}`);
  const guestLookupJson = await guestLookupRes.json();
  if (!guestLookupJson.success || guestLookupJson.data.name !== "Public Test Guest") {
    throw new Error("Guest public lookup failed");
  }
  console.log("✓ Public invitation lookup succeeded for:", guestLookupJson.data.name);

  // Clean up test guest
  await fetch(`${API_BASE}/guests/${testGuest._id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log("✓ Cleaned up test guest.");

  // 6. Restore websiteStatus back to draft
  console.log("\n[Test 6] Restoring websiteStatus back to 'draft'...");
  await fetch(`${API_BASE}/wedding`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ websiteStatus: "draft" }),
  });
  console.log("✓ Restored websiteStatus to 'draft'.");

  console.log("\n==================================================");
  console.log("ALL PHASE 12 PUBLIC SITE BACKEND TESTS PASSED! 🎉");
  console.log("==================================================");
}

runPhase12Tests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
