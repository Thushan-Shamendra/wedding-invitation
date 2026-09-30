const assert = require("assert");

// Import the compiled logic or test identical functions
function normalizePhoneForWhatsApp(phone) {
  if (!phone) return "";
  let cleaned = phone.replace(/[^\d+]/g, "").trim();
  if (cleaned.startsWith("+")) {
    cleaned = cleaned.substring(1);
  } else if (cleaned.startsWith("00")) {
    cleaned = cleaned.substring(2);
  } else if (cleaned.startsWith("0") && cleaned.length === 10) {
    cleaned = "94" + cleaned.substring(1);
  }
  return cleaned.replace(/\D/g, "");
}

function buildInvitationShareMessage({
  brideName,
  groomName,
  guestName,
  personalMessage,
  invitationUrl,
}) {
  const bName = brideName?.trim();
  const gName = groomName?.trim();

  let coupleTitle = "Our";
  if (bName && gName) {
    coupleTitle = `${bName} & ${gName}'s`;
  } else if (bName || gName) {
    coupleTitle = `${bName || gName}'s`;
  } else {
    coupleTitle = "our";
  }

  const heading =
    coupleTitle === "our"
      ? "You're invited to our wedding 💍"
      : `You're invited to ${coupleTitle} wedding 💍`;

  const salutation = `Dear ${guestName.trim() || "Guest"},`;

  const body =
    personalMessage && personalMessage.trim()
      ? personalMessage.trim()
      : "We would love to celebrate our special day with you.";

  const linkBlock = `View your personal invitation:\n${invitationUrl}`;

  const closing = "We look forward to celebrating with you ❤️";

  return `${heading}\n\n${salutation}\n\n${body}\n\n${linkBlock}\n\n${closing}`;
}

function buildWhatsAppUrl(phone, message = "") {
  const normalizedPhone = normalizePhoneForWhatsApp(phone);
  const encodedText = encodeURIComponent(message);
  if (normalizedPhone) {
    return `https://wa.me/${normalizedPhone}?text=${encodedText}`;
  }
  return `https://wa.me/?text=${encodedText}`;
}

function buildSmsUrl(phone, message = "") {
  const cleanPhone = phone ? phone.replace(/[^\d+]/g, "").trim() : "";
  const encodedBody = encodeURIComponent(message);
  if (cleanPhone) {
    return `sms:${cleanPhone}?body=${encodedBody}`;
  }
  return `sms:?body=${encodedBody}`;
}

console.log("=== RUNNING INVITATION SHARE UNIT TESTS ===");

// 1. Phone Normalization tests
console.log("\n[Test 1] Testing phone normalization...");
assert.strictEqual(normalizePhoneForWhatsApp("0771234567"), "94771234567");
assert.strictEqual(normalizePhoneForWhatsApp("+94771234567"), "94771234567");
assert.strictEqual(normalizePhoneForWhatsApp("94771234567"), "94771234567");
assert.strictEqual(normalizePhoneForWhatsApp("071-123 4567"), "94711234567");
assert.strictEqual(normalizePhoneForWhatsApp("+94 (77) 123-4567"), "94771234567");
assert.strictEqual(normalizePhoneForWhatsApp(""), "");
assert.strictEqual(normalizePhoneForWhatsApp(null), "");
assert.strictEqual(normalizePhoneForWhatsApp(undefined), "");
console.log("✓ Phone normalization passed all Sri Lankan and International formats.");

// 2. Invitation Share Message Generator tests
console.log("\n[Test 2] Testing invitation message generation...");
const testMessage1 = buildInvitationShareMessage({
  brideName: "Amanda",
  groomName: "Daniel",
  guestName: "Kasun Perera",
  invitationUrl: "https://ourwedding.com/invite/kasun-perera-7f1a",
});

const expected1 = [
  "You're invited to Amanda & Daniel's wedding 💍",
  "",
  "Dear Kasun Perera,",
  "",
  "We would love to celebrate our special day with you.",
  "",
  "View your personal invitation:",
  "https://ourwedding.com/invite/kasun-perera-7f1a",
  "",
  "We look forward to celebrating with you ❤️",
].join("\n");

assert.strictEqual(testMessage1, expected1);
console.log("✓ Default message structure exactly matches requirements.");

// Test with custom personalMessage
const testMessage2 = buildInvitationShareMessage({
  brideName: "Amanda",
  groomName: "Daniel",
  guestName: "Kasun Perera",
  personalMessage: "Looking forward to seeing you at our celebration!",
  invitationUrl: "https://ourwedding.com/invite/kasun-perera-7f1a",
});

assert(testMessage2.includes("Looking forward to seeing you at our celebration!"));
console.log("✓ Custom personal message correctly substituted.");

// 3. WhatsApp URL generation
console.log("\n[Test 3] Testing WhatsApp URL generation...");
const waWithPhone = buildWhatsAppUrl("0771234567", testMessage1);
assert(waWithPhone.startsWith("https://wa.me/94771234567?text="));
assert(waWithPhone.includes(encodeURIComponent("Dear Kasun Perera,")));
console.log("✓ WhatsApp URL with phone generated:", waWithPhone.substring(0, 60) + "...");

const waWithoutPhone = buildWhatsAppUrl("", testMessage1);
assert(waWithoutPhone.startsWith("https://wa.me/?text="));
console.log("✓ Generic WhatsApp URL generated when phone missing:", waWithoutPhone.substring(0, 45) + "...");

// 4. SMS URL generation
console.log("\n[Test 4] Testing SMS URL generation...");
const smsWithPhone = buildSmsUrl("0771234567", testMessage1);
assert(smsWithPhone.startsWith("sms:0771234567?body="));
assert(smsWithPhone.includes(encodeURIComponent("Dear Kasun Perera,")));
console.log("✓ SMS URL generated:", smsWithPhone.substring(0, 50) + "...");

console.log("\n>>> ALL INVITATION SHARING UNIT TESTS PASSED! 🎉 <<<\n");
