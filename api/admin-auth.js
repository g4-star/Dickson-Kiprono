import crypto from "node:crypto";
import {
  createAdminSession,
  sessionCookie,
  clearSessionCookie,
} from "./_admin-auth.js";

function verifyPassword(password, storedHash) {
  try {
    const [algorithm, salt, expectedHash] =
      storedHash.split("$");

    if (
      algorithm !== "scrypt" ||
      !salt ||
      !expectedHash
    ) {
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

    const expected = Buffer.from(
      expectedHash,
      "hex"
    );

    if (derived.length !== expected.length) {
      return false;
    }

    return crypto.timingSafeEqual(
      derived,
      expected
    );
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

  const action =
    String(req.query?.action || "").toLowerCase();

  if (action === "logout") {
    res.setHeader(
      "Set-Cookie",
      clearSessionCookie()
    );

    return res.status(200).json({
      success: true,
    });
  }

  if (action !== "login") {
    return res.status(400).json({
      success: false,
      error: "Invalid authentication action",
    });
  }

  try {
    const storedHash =
      process.env.ADMIN_PASSWORD_HASH;

    if (!storedHash) {
      return res.status(500).json({
        success: false,
        error:
          "Admin authentication is not configured",
      });
    }

    const password =
      typeof req.body?.password === "string"
        ? req.body.password
        : "";

    if (
      !password ||
      password.length > 256
    ) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    const valid = verifyPassword(
      password,
      storedHash
    );

    if (!valid) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    const token = createAdminSession();

    res.setHeader(
      "Set-Cookie",
      sessionCookie(token)
    );

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Admin authentication error:",
      error
    );

    return res.status(500).json({
      success: false,
      error: "Unable to authenticate",
    });
  }
}
