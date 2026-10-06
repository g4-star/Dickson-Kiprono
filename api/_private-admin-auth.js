import crypto from "node:crypto";

const COOKIE_NAME = "private_main_admin_session";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

function getSecret() {
  const secret = process.env.PRIVATE_ADMIN_SESSION_SECRET;

  if (!secret) {
    throw new Error("PRIVATE_ADMIN_SESSION_SECRET is not configured");
  }

  return secret;
}

function sign(value) {
  return crypto
    .createHmac("sha256", getSecret())
    .update(value)
    .digest("base64url");
}

export function createPrivateAdminSession() {
  const expires = Date.now() + SESSION_TTL_MS;
  const payload = `private-admin:${expires}`;
  const signature = sign(payload);

  return `${payload}.${signature}`;
}

export function isPrivateAdminSessionValid(req) {
  try {
    const cookieHeader = req.headers.cookie || "";

    const cookies = Object.fromEntries(
      cookieHeader
        .split(";")
        .map((part) => part.trim())
        .filter(Boolean)
        .map((part) => {
          const index = part.indexOf("=");
          return [
            part.slice(0, index),
            decodeURIComponent(part.slice(index + 1)),
          ];
        })
    );

    const token = cookies[COOKIE_NAME];

    if (!token) return false;

    const parts = token.split(".");

    if (parts.length !== 2) return false;

    const [payload, suppliedSignature] = parts;
    const [type, expiresRaw] = payload.split(":");

    const expires = Number(expiresRaw);

    if (
      type !== "private-admin" ||
      !Number.isFinite(expires) ||
      Date.now() > expires
    ) {
      return false;
    }

    const expectedSignature = sign(payload);

    const supplied = Buffer.from(suppliedSignature);
    const expected = Buffer.from(expectedSignature);

    if (supplied.length !== expected.length) return false;

    return crypto.timingSafeEqual(supplied, expected);
  } catch {
    return false;
  }
}

export function privateAdminSessionCookie(token) {
  const isProduction = process.env.NODE_ENV === "production";

  return [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    "HttpOnly",
    ...(isProduction ? ["Secure"] : []),
    "SameSite=Strict",
    "Path=/",
    `Max-Age=${SESSION_TTL_MS / 1000}`,
  ].join("; ");
}

export function clearPrivateAdminSessionCookie() {
  return [
    `${COOKIE_NAME}=`,
    "HttpOnly",
    "Secure",
    "SameSite=Strict",
    "Path=/",
    "Max-Age=0",
  ].join("; ");
}

export async function requirePrivateAdmin(req, res) {
  if (!isPrivateAdminSessionValid(req)) {
    res.status(401).json({
      success: false,
      error: "Unauthorized",
    });

    return false;
  }

  return true;
}
