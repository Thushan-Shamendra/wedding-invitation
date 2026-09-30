/**
 * Utility functions for generating invitation links, normalized messages,
 * and sharing URLs for WhatsApp, SMS, and Native Web Share.
 */

export function getInvitationUrl(token: string): string {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : "http://localhost:3000");

  const cleanBase = baseUrl.replace(/\/+$/, "");
  return `${cleanBase}/invite/${encodeURIComponent(token)}`;
}

/**
 * Normalizes phone numbers for WhatsApp API (wa.me/NUMBER).
 * Handles Sri Lankan numbers:
 * - 0771234567 -> 94771234567
 * - +94771234567 -> 94771234567
 * - 94771234567 -> 94771234567
 * Strips +, spaces, -, brackets, etc.
 */
export function normalizePhoneForWhatsApp(phone?: string | null): string {
  if (!phone) return "";

  let cleaned = phone.replace(/[^\d+]/g, "").trim();

  // If starts with + (international format), strip +
  if (cleaned.startsWith("+")) {
    cleaned = cleaned.substring(1);
  } else if (cleaned.startsWith("00")) {
    cleaned = cleaned.substring(2);
  } else if (cleaned.startsWith("0") && cleaned.length === 10) {
    // Standard 10-digit Sri Lankan phone number (e.g. 0771234567 -> 94771234567)
    cleaned = "94" + cleaned.substring(1);
  }

  // Remove any remaining non-digits
  return cleaned.replace(/\D/g, "");
}

export interface BuildInvitationMessageParams {
  brideName?: string;
  groomName?: string;
  guestName: string;
  personalMessage?: string;
  invitationUrl: string;
}

/**
 * Builds the personalized invitation message.
 * Example output:
 *
 * You're invited to Amanda & Daniel's wedding 💍
 *
 * Dear Kasun Perera,
 *
 * We would love to celebrate our special day with you.
 *
 * View your personal invitation:
 * https://ourwedding.com/invite/kasun-perera-xxxx
 *
 * We look forward to celebrating with you ❤️
 */
export function buildInvitationShareMessage({
  brideName,
  groomName,
  guestName,
  personalMessage,
  invitationUrl,
}: BuildInvitationMessageParams): string {
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

/**
 * Builds a direct WhatsApp chat URL with message pre-filled.
 * Uses wa.me/NUMBER?text=ENCODED_MESSAGE or wa.me/?text=ENCODED_MESSAGE.
 * Does not automatically send the message.
 */
export function buildWhatsAppUrl(phone?: string | null, message: string = ""): string {
  const normalizedPhone = normalizePhoneForWhatsApp(phone);
  const encodedText = encodeURIComponent(message);

  if (normalizedPhone) {
    return `https://wa.me/${normalizedPhone}?text=${encodedText}`;
  }

  return `https://wa.me/?text=${encodedText}`;
}

/**
 * Builds an SMS URI with recipient and message pre-filled.
 * Example: sms:0771234567?body=ENCODED_MESSAGE
 */
export function buildSmsUrl(phone?: string | null, message: string = ""): string {
  const cleanPhone = phone ? phone.replace(/[^\d+]/g, "").trim() : "";
  const encodedBody = encodeURIComponent(message);

  if (cleanPhone) {
    return `sms:${cleanPhone}?body=${encodedBody}`;
  }

  return `sms:?body=${encodedBody}`;
}
