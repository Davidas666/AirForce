export function getUserFromCookie() {
  const userCookie = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("telegram_user="));
  if (!userCookie) return null;
  try {
    return JSON.parse(decodeURIComponent(userCookie.split("=")[1]));
  } catch {
    return null;
  }
}