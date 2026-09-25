const mongoose = require("mongoose");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

const Guest = require("../models/Guest");
const RSVP = require("../models/RSVP");
const Admin = require("../models/Admin");

const BASE_URL = `http://localhost:${process.env.PORT || 5000}/api`;

async function runTests() {
  console.log("=== STARTING RSVP BACKEND ENDPOINT TESTS ===");

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB.");

  // 1. Get or create test admin
  let admin = await Admin.findOne({ email: "admin@wedding.com" });
  if (!admin) {
    throw new Error("Admin not found. Please run seedAdmin first.");
  }
  const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // 2. Create a test guest
  const testGuestToken = `test-guest-rsvp-${Date.now()}`;
  const guest = await Guest.create({
    name: "RSVP Test Guest",
    email: "rsvp.test@example.com",
    phone: "+1-555-0199",
    maximumGuests: 3,
    personalMessage: "Welcome to our special day!",
    invitationToken: testGuestToken,
    rsvpStatus: "pending",
  });
  console.log(`Created test guest with token: ${testGuestToken} (max guests: 3)`);

  try {
    // 3. Test public lookup before RSVP exists
    console.log("\n[Test 1] Public lookup for token with no RSVP yet...");
    const lookupRes1 = await fetch(`${BASE_URL}/rsvp/invite/${testGuestToken}`);
    const lookupData1 = await lookupRes1.json();
    console.log("Lookup status:", lookupRes1.status, "Data:", lookupData1);
    if (!lookupData1.success || lookupData1.data !== null) {
      throw new Error("Expected null data when no RSVP exists yet.");
    }
    console.log("✓ Correctly returned null for guest with no RSVP.");

    // 4. Test submitting with invalid token
    console.log("\n[Test 2] Submitting RSVP with nonexistent token...");
    const invalidTokenRes = await fetch(`${BASE_URL}/rsvp/non-existent-token-xyz`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attendanceStatus: "attending", numberOfGuests: 1 }),
    });
    console.log("Invalid token status:", invalidTokenRes.status);
    if (invalidTokenRes.status !== 404) {
      throw new Error(`Expected 404 for invalid token, got ${invalidTokenRes.status}`);
    }
    console.log("✓ Correctly rejected with 404.");

    // 5. Test submitting with guest count exceeding maximumGuests
    console.log("\n[Test 3] Submitting RSVP exceeding maximumGuests limit (4 > 3)...");
    const exceedMaxRes = await fetch(`${BASE_URL}/rsvp/${testGuestToken}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        attendanceStatus: "attending",
        numberOfGuests: 4,
        mealPreference: "Regular",
        message: "Can't wait!",
      }),
    });
    const exceedMaxData = await exceedMaxRes.json();
    console.log("Exceed max status:", exceedMaxRes.status, "Message:", exceedMaxData.message);
    if (exceedMaxRes.status !== 400) {
      throw new Error("Expected 400 when exceeding maximum allowed guests.");
    }
    console.log("✓ Correctly rejected with 400 exceeding max guests.");

    // 6. Test valid RSVP submission (attending, 2 guests)
    console.log("\n[Test 4] Submitting valid RSVP (attending, 2 guests)...");
    const validSubmitRes = await fetch(`${BASE_URL}/rsvp/${testGuestToken}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        attendanceStatus: "attending",
        numberOfGuests: 2,
        mealPreference: "Vegetarian",
        message: "Thrilled to celebrate with you!",
      }),
    });
    const validSubmitData = await validSubmitRes.json();
    console.log("Valid submit status:", validSubmitRes.status, "Data:", validSubmitData.data);
    if (!validSubmitData.success || validSubmitData.data.numberOfGuests !== 2) {
      throw new Error("Failed to submit valid RSVP.");
    }

    // Verify Guest.rsvpStatus synced to attending
    const updatedGuest1 = await Guest.findById(guest._id);
    if (updatedGuest1.rsvpStatus !== "attending") {
      throw new Error(`Expected guest rsvpStatus 'attending', got '${updatedGuest1.rsvpStatus}'`);
    }
    console.log("✓ RSVP submitted and Guest.rsvpStatus synced to 'attending'.");

    // 7. Test public lookup after RSVP exists
    console.log("\n[Test 5] Public lookup after RSVP exists...");
    const lookupRes2 = await fetch(`${BASE_URL}/rsvp/invite/${testGuestToken}`);
    const lookupData2 = await lookupRes2.json();
    console.log("Lookup status:", lookupRes2.status, "Data:", lookupData2.data);
    if (
      !lookupData2.success ||
      lookupData2.data.attendanceStatus !== "attending" ||
      lookupData2.data.numberOfGuests !== 2
    ) {
      throw new Error("Lookup data did not match submitted RSVP.");
    }
    console.log("✓ Public lookup returned correct RSVP details.");

    // 8. Test re-submitting RSVP to update (upsert) to 'declined'
    console.log("\n[Test 6] Re-submitting RSVP via token to change to 'declined'...");
    const updateTokenRes = await fetch(`${BASE_URL}/rsvp/${testGuestToken}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        attendanceStatus: "declined",
        numberOfGuests: 2, // Should be forced to 0
        message: "So sorry, something urgent came up!",
      }),
    });
    const updateTokenData = await updateTokenRes.json();
    console.log("Update via token status:", updateTokenRes.status, "Data:", updateTokenData.data);
    if (updateTokenData.data.attendanceStatus !== "declined" || updateTokenData.data.numberOfGuests !== 0) {
      throw new Error("Declined RSVP should have numberOfGuests = 0.");
    }
    const updatedGuest2 = await Guest.findById(guest._id);
    if (updatedGuest2.rsvpStatus !== "declined") {
      throw new Error(`Expected guest rsvpStatus 'declined', got '${updatedGuest2.rsvpStatus}'`);
    }
    console.log("✓ Re-submitting successfully updated RSVP and synced Guest.rsvpStatus to 'declined'.");

    // 9. Test protected admin statistics
    console.log("\n[Test 7] Fetching Admin RSVP stats summary...");
    const statsRes = await fetch(`${BASE_URL}/rsvp/stats/summary`, {
      headers: authHeaders,
    });
    const statsData = await statsRes.json();
    console.log("Stats response:", statsData);
    if (!statsData.success || typeof statsData.data.totalResponses !== "number") {
      throw new Error("Failed to retrieve RSVP stats.");
    }
    console.log("✓ Admin RSVP stats retrieved successfully.");

    // 10. Test protected admin list
    console.log("\n[Test 8] Fetching Admin RSVP responses list...");
    const listRes = await fetch(`${BASE_URL}/rsvp`, {
      headers: authHeaders,
    });
    const listData = await listRes.json();
    console.log("List count:", listData.count);
    const myRsvp = listData.data.find((r) => r.guest && r.guest._id.toString() === guest._id.toString());
    if (!myRsvp) {
      throw new Error("Test guest RSVP not found in admin list.");
    }
    console.log("✓ Admin RSVP list contains populated guest:", myRsvp.guest.name);

    // 11. Test protected admin update
    console.log("\n[Test 9] Admin updating RSVP back to 'attending' with 3 guests...");
    const adminUpdateRes = await fetch(`${BASE_URL}/rsvp/${myRsvp._id}`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({
        attendanceStatus: "attending",
        numberOfGuests: 3,
        mealPreference: "Gluten Free",
        message: "Admin changed attendance to 3 guests.",
      }),
    });
    const adminUpdateData = await adminUpdateRes.json();
    console.log("Admin update status:", adminUpdateRes.status, "Data:", adminUpdateData.data);
    if (
      !adminUpdateData.success ||
      adminUpdateData.data.attendanceStatus !== "attending" ||
      adminUpdateData.data.numberOfGuests !== 3
    ) {
      throw new Error("Admin update failed.");
    }
    const updatedGuest3 = await Guest.findById(guest._id);
    if (updatedGuest3.rsvpStatus !== "attending") {
      throw new Error("Guest status did not sync after admin update.");
    }
    console.log("✓ Admin update successfully modified RSVP and synced guest status.");

    // 12. Test protected admin delete & status reset to pending
    console.log("\n[Test 10] Admin deleting RSVP...");
    const deleteRes = await fetch(`${BASE_URL}/rsvp/${myRsvp._id}`, {
      method: "DELETE",
      headers: authHeaders,
    });
    const deleteData = await deleteRes.json();
    console.log("Delete status:", deleteRes.status, "Response:", deleteData);
    if (!deleteData.success) {
      throw new Error("Admin delete failed.");
    }

    const verifyRsvp = await RSVP.findById(myRsvp._id);
    if (verifyRsvp) {
      throw new Error("RSVP document was not deleted.");
    }

    const resetGuest = await Guest.findById(guest._id);
    if (!resetGuest) {
      throw new Error("Guest was deleted when only RSVP should be deleted!");
    }
    if (resetGuest.rsvpStatus !== "pending") {
      throw new Error(`Expected guest rsvpStatus to reset to 'pending', got '${resetGuest.rsvpStatus}'`);
    }
    console.log("✓ RSVP deleted and Guest remained intact with rsvpStatus reset to 'pending'.");

    // 13. Test unauthorized access without token
    console.log("\n[Test 11] Checking 401 unauthorized rejection for admin route...");
    const unauthRes = await fetch(`${BASE_URL}/rsvp`);
    if (unauthRes.status !== 401) {
      throw new Error(`Expected 401 for unauthorized admin route, got ${unauthRes.status}`);
    }
    console.log("✓ Admin routes correctly reject unauthenticated requests with 401.");

    console.log("\nALL RSVP BACKEND TESTS PASSED SUCCESSFULLY! 🎉");
  } finally {
    // Cleanup test guest and any orphaned test RSVPs
    await Guest.findByIdAndDelete(guest._id);
    await RSVP.deleteMany({ guest: guest._id });
    await mongoose.disconnect();
    console.log("Cleaned up test data and disconnected from DB.");
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
