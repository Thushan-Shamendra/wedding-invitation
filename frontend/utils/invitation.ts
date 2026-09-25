export function getInvitationUrl(token: string): string {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : "http://localhost:3000");

  const cleanBase = baseUrl.replace(/\/+$/, "");
  return `${cleanBase}/invite/${encodeURIComponent(token)}`;
}
