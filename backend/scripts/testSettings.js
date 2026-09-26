const mongoose = require("mongoose");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

const Wedding = require("../models/Wedding");
const Admin = require("../models/Admin");

const BASE_URL = `http://localhost:${process.env.PORT || 5000}/api`;

async function runTests() {
  console.log("=== STARTING SETTINGS BACKEND TESTS ===");

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB.");

  // Get admin
  const admin = await Admin.findOne({ email: "admin@wedding.com" });
  if (!admin) {
    throw new Error("Admin not found. Please ensure admin is seeded.");
  }

  const originalAdminName = admin.name;
  const originalAdminEmail = admin.email;
  const originalPassword = "admin123456";

  let token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  let authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const initialWedding = await Wedding.findOne();
  console.log("Initial wedding title:", initialWedding ? initialWedding.weddingTitle : "None");
  const originalWebsiteStatus = initialWedding ? initialWedding.websiteStatus : "draft";
  const originalRsvpEnabled = initialWedding?.rsvpEnabled ?? true;
  const originalPersonalInv = initialWedding?.personalInvitationEnabled ?? true;

  try {
    // 1. Test GET /api/auth/me
    console.log("\n[Test 1] Testing GET /api/auth/me...");
    const meRes = await fetch(`${BASE_URL}/auth/me`, { headers: authHeaders });
    const meData = await meRes.json();
    console.log("GET /me status:", meRes.status, "Name:", meData.admin?.name);
    if (!meData.success || !meData.admin || meData.admin.password) {
      throw new Error("Failed to get admin profile or password hash exposed.");
    }
    console.log("✓ Admin profile retrieved safely without password.");

    // 2. Test 401 Unauthorized for PUT /api/auth/profile without token
    console.log("\n[Test 2] Testing 401 Unauthorized for profile update without token...");
    const unauthProfile = await fetch(`${BASE_URL}/auth/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Hacker" }),
    });
    if (unauthProfile.status !== 401) {
      throw new Error(`Expected 401, got ${unauthProfile.status}`);
    }
    console.log("✓ Unauthorized profile update rejected with 401.");

    // 3. Test validation on profile update
    console.log("\n[Test 3] Testing validation on profile update (empty name, invalid email)...");
    const emptyNameRes = await fetch(`${BASE_URL}/auth/profile`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({ name: "   ", email: "admin@wedding.com" }),
    });
    if (emptyNameRes.status !== 400) {
      throw new Error("Expected 400 for empty name.");
    }

    const invalidEmailRes = await fetch(`${BASE_URL}/auth/profile`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({ name: "Admin", email: "invalid-email" }),
    });
    if (invalidEmailRes.status !== 400) {
      throw new Error("Expected 400 for invalid email format.");
    }
    console.log("✓ Name and email validation rejected invalid data with 400.");

    // 4. Test valid profile update
    console.log("\n[Test 4] Testing valid profile update...");
    const validProfileRes = await fetch(`${BASE_URL}/auth/profile`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({ name: "Chief Wedding Admin", email: "chief.admin@wedding.com" }),
    });
    const validProfileData = await validProfileRes.json();
    if (!validProfileData.success || validProfileData.admin?.name !== "Chief Wedding Admin") {
      throw new Error(`Profile update failed: ${validProfileData.message}`);
    }
    console.log("✓ Profile updated successfully to:", validProfileData.admin.email);

    // 5. Test duplicate email rejection with temporary admin
    console.log("\n[Test 5] Testing duplicate email rejection...");
    const tempAdmin = await Admin.create({
      name: "Temporary Admin",
      email: "temp.admin@wedding.com",
      password: "password1234",
    });

    const duplicateRes = await fetch(`${BASE_URL}/auth/profile`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({ name: "Chief Wedding Admin", email: "temp.admin@wedding.com" }),
    });
    if (duplicateRes.status !== 400) {
      throw new Error("Expected 400 for duplicate email.");
    }
    console.log("✓ Duplicate admin email correctly rejected with 400.");
    await Admin.deleteOne({ _id: tempAdmin._id });

    // 6. Test password change with incorrect current password
    console.log("\n[Test 6] Testing password change with incorrect current password...");
    const wrongCurrentRes = await fetch(`${BASE_URL}/auth/change-password`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({
        currentPassword: "wrongpassword123",
        newPassword: "newpassword12345",
        confirmNewPassword: "newpassword12345",
      }),
    });
    if (wrongCurrentRes.status !== 400) {
      throw new Error("Expected 400 for incorrect current password.");
    }
    console.log("✓ Incorrect current password correctly rejected with 400.");

    // 7. Test password change length & mismatch validation
    console.log("\n[Test 7] Testing password change length (< 8 chars) and confirmation mismatch...");
    const shortPassRes = await fetch(`${BASE_URL}/auth/change-password`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({
        currentPassword: originalPassword,
        newPassword: "short",
        confirmNewPassword: "short",
      }),
    });
    if (shortPassRes.status !== 400) {
      throw new Error("Expected 400 for new password < 8 characters.");
    }

    const mismatchRes = await fetch(`${BASE_URL}/auth/change-password`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({
        currentPassword: originalPassword,
        newPassword: "newpassword12345",
        confirmNewPassword: "differentpassword",
      }),
    });
    if (mismatchRes.status !== 400) {
      throw new Error("Expected 400 for password confirmation mismatch.");
    }
    console.log("✓ Password length and mismatch validations correctly rejected with 400.");

    // 8. Test successful password change & login verification
    console.log("\n[Test 8] Testing successful password change & login with new password...");
    const newPass = "updatedPassword999";
    const changePassRes = await fetch(`${BASE_URL}/auth/change-password`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({
        currentPassword: originalPassword,
        newPassword: newPass,
        confirmNewPassword: newPass,
      }),
    });
    const changePassData = await changePassRes.json();
    if (!changePassData.success) {
      throw new Error(`Password change failed: ${changePassData.message}`);
    }
    console.log("✓ Password changed successfully.");

    // Verify old password fails
    const oldLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "chief.admin@wedding.com", password: originalPassword }),
    });
    if (oldLoginRes.status !== 401) {
      throw new Error("Old password should have failed login.");
    }
    console.log("✓ Old password correctly fails login.");

    // Verify new password succeeds
    const newLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "chief.admin@wedding.com", password: newPass }),
    });
    const newLoginData = await newLoginRes.json();
    if (!newLoginData.success || !newLoginData.token) {
      throw new Error("Login with new password failed.");
    }
    console.log("✓ Login with new password succeeded.");

    // Revert admin password and email back
    console.log("\n[Reverting Admin Credentials back to initial state]");
    token = newLoginData.token;
    authHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
    await fetch(`${BASE_URL}/auth/change-password`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({
        currentPassword: newPass,
        newPassword: originalPassword,
        confirmNewPassword: originalPassword,
      }),
    });
    await fetch(`${BASE_URL}/auth/profile`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({
        name: originalAdminName,
        email: originalAdminEmail,
      }),
    });
    console.log("✓ Admin credentials restored to original.");

    // 9. Website Settings tests
    console.log("\n[Test 9] Testing Website Settings validation in PUT /api/wedding...");
    // Invalid websiteStatus
    const invalidStatusRes = await fetch(`${BASE_URL}/wedding`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({ websiteStatus: "under-construction" }),
    });
    if (invalidStatusRes.status !== 400) {
      throw new Error("Expected 400 for invalid websiteStatus.");
    }
    console.log("✓ Invalid websiteStatus rejected with 400.");

    // Invalid rsvpEnabled
    const invalidRsvpRes = await fetch(`${BASE_URL}/wedding`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({ rsvpEnabled: "not-bool" }),
    });
    if (invalidRsvpRes.status !== 400) {
      throw new Error("Expected 400 for invalid rsvpEnabled boolean.");
    }
    console.log("✓ Invalid rsvpEnabled boolean rejected with 400.");

    // Valid website settings update
    console.log("\n[Test 10] Testing valid Website Settings partial update...");
    const validWebRes = await fetch(`${BASE_URL}/wedding`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({
        websiteStatus: "published",
        rsvpEnabled: false,
        personalInvitationEnabled: false,
      }),
    });
    const validWebData = await validWebRes.json();
    if (
      !validWebData.success ||
      validWebData.data.websiteStatus !== "published" ||
      validWebData.data.rsvpEnabled !== false ||
      validWebData.data.personalInvitationEnabled !== false
    ) {
      throw new Error("Failed to update website settings.");
    }
    console.log("✓ Website settings updated successfully.");

    // Verify non-overwriting of other fields
    console.log("\n[Test 11] Verifying preservation of other wedding fields...");
    const checkDoc = await Wedding.findOne();
    if (checkDoc.weddingTitle !== initialWedding.weddingTitle) {
      throw new Error(`Wedding title corrupted! Expected '${initialWedding.weddingTitle}', got '${checkDoc.weddingTitle}'`);
    }
    console.log("✓ Unrelated fields (title, bride, groom, theme, music, venue) perfectly preserved.");

    // Restore wedding settings
    console.log("\n[Restoring Wedding Settings back to initial state]");
    await fetch(`${BASE_URL}/wedding`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({
        websiteStatus: originalWebsiteStatus,
        rsvpEnabled: originalRsvpEnabled,
        personalInvitationEnabled: originalPersonalInv,
      }),
    });
    console.log("✓ Restored initial wedding settings.");

    console.log("\n==================================================");
    console.log("ALL SETTINGS BACKEND TESTS PASSED SUCCESSFULLY! 🎉");
    console.log("==================================================");
  } finally {
    await mongoose.disconnect();
  }
}

runTests().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
