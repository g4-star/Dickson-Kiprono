import crypto from "node:crypto";
import {
  createPrivateAdminSession,
  privateAdminSessionCookie,
} from "./_private-admin-auth.js";

function verifyPassword(password, storedHash) {
  try {
    const [algorithm, salt, expectedHash] = storedHash.split("$");

    if (algorithm !== "scrypt" || !salt || !expectedHash) {
      return false;
    }

    const derived = crypto.scryptSync(
      password,
      salt,
      64,
      {
        N: 16384,
        r: 8,
        p: 1,
        maxmem: 32 * 1024 * 1024,
      }
    );

    const expected = Buffer.from(expectedHash, "hex");

    if (derived.length !== expected.length) {
      return false;
    }

    return crypto.timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");

    return res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  }

  try {
    const storedHash = process.env.PRIVATE_ADMIN_PASSWORD_HASH;

    if (!storedHash) {
      return res.status(500).json({
        success: false,
        error: "Private admin authentication is not configured",
      });
    }

    const password =
      typeof req.body?.password === "string"
        ? req.body.password
        : "";

    if (!password || password.length > 256) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    if (!verifyPassword(password, storedHash)) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    const token = createPrivateAdminSession();

    res.setHeader(
      "Set-Cookie",
      privateAdminSessionCookie(token)
    );

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error("Private admin login error:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to authenticate",
    });
  }
}
