import crypto from "node:crypto";

const COOKIE_NAME = "security_admin_session";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not configured");
  }

  return secret;
}

function sign(value) {
  return crypto
    .createHmac("sha256", getSecret())
    .update(value)
    .digest("base64url");
}

export function createAdminSession() {
  const expires = Date.now() + SESSION_TTL_MS;
  const payload = `admin:${expires}`;
  const signature = sign(payload);

  return `${payload}.${signature}`;
}

export function isAdminSessionValid(req) {
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

    if (!token) {
      return false;
    }

    const parts = token.split(".");

    if (parts.length !== 2) {
      return false;
    }

    const [payload, suppliedSignature] = parts;

    const [type, expiresRaw] = payload.split(":");
    const expires = Number(expiresRaw);

    if (type !== "admin" || !Number.isFinite(expires)) {
      return false;
    }

    if (Date.now() > expires) {
      return false;
    }

    const expectedSignature = sign(payload);

    const supplied = Buffer.from(suppliedSignature);
    const expected = Buffer.from(expectedSignature);

    if (supplied.length !== expected.length) {
      return false;
    }

    return crypto.timingSafeEqual(supplied, expected);
  } catch {
    return false;
  }
}

export function sessionCookie(token) {
  return [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    "HttpOnly",
    "Secure",
    "SameSite=Strict",
    "Path=/",
    `Max-Age=${SESSION_TTL_MS / 1000}`,
  ].join("; ");
}

export function clearSessionCookie() {
  return [
    `${COOKIE_NAME}=`,
    "HttpOnly",
    "Secure",
    "SameSite=Strict",
    "Path=/",
    "Max-Age=0",
  ].join("; ");
}
