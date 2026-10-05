import fs from "node:fs/promises";
import { put, del } from "@vercel/blob";
import { neon } from "@neondatabase/serverless";

import { formidable } from "formidable";
import { isAdminSessionValid } from "./_admin-auth.js";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function cleanText(value, maxLength) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maxLength);
}

function safeExtension(type) {
  if (type === "image/jpeg") return "jpg";
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";

  return null;
}

function getSingleValue(value) {
  if (Array.isArray(value)) {
    return value[0] || "";
  }

  return value || "";
}

function getSingleFile(value) {
  if (Array.isArray(value)) {
    return value[0] || null;
  }

  return value || null;
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");

    return res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  }

  if (!isAdminSessionValid(req)) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized",
    });
  }

  let blobUrl = null;
  let uploadedFilePath = null;

  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not configured");
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error("BLOB_READ_WRITE_TOKEN is not configured");
    }

    const form = formidable({
      multiples: false,
      maxFileSize: MAX_IMAGE_SIZE,
      allowEmptyFiles: false,
      keepExtensions: true,
    });

    const [fields, files] = await form.parse(req);

    const file = getSingleFile(files.image);

    if (!file) {
      return res.status(400).json({
        success: false,
        error: "An image file is required",
      });
    }

    uploadedFilePath = file.filepath;

    const mimeType = file.mimetype || "";

    if (!ALLOWED_TYPES.has(mimeType)) {
      return res.status(400).json({
        success: false,
        error: "Only JPG, PNG and WebP images are allowed",
      });
    }

    if (file.size <= 0 || file.size > MAX_IMAGE_SIZE) {
      return res.status(400).json({
        success: false,
        error: "Image must be between 1 byte and 5 MB",
      });
    }

    const name = cleanText(getSingleValue(fields.name), 120);
    const role = cleanText(getSingleValue(fields.role), 160);
    const description = cleanText(
      getSingleValue(fields.description),
      1000
    );
    const githubUrl = cleanText(
      getSingleValue(fields.github_url),
      500
    );
    const linkedinUrl = cleanText(
      getSingleValue(fields.linkedin_url),
      500
    );
    const portfolioUrl = cleanText(
      getSingleValue(fields.portfolio_url),
      500
    );

    if (!name) {
      return res.status(400).json({
        success: false,
        error: "Name is required",
      });
    }

    if (!role) {
      return res.status(400).json({
        success: false,
        error: "Role is required",
      });
    }

    const extension = safeExtension(mimeType);

    if (!extension) {
      return res.status(400).json({
        success: false,
        error: "Unsupported image type",
      });
    }

    const uniqueName =
      `security-team/${cryptoRandomId()}.${extension}`;

    const imageBuffer = await fs.readFile(file.filepath);

    const blob = await put(uniqueName, imageBuffer, {
      access: "public",
      addRandomSuffix: false,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      contentType: mimeType,
    });

    blobUrl = blob.url;

    const sql = neon(process.env.DATABASE_URL);

    const result = await sql`
      INSERT INTO security_team (
        name,
        role,
        description,
        image_url,
        github_url,
        linkedin_url,
        portfolio_url,
        display_order,
        is_active
      )
      VALUES (
        ${name},
        ${role},
        ${description || null},
        ${blobUrl},
        ${githubUrl || null},
        ${linkedinUrl || null},
        ${portfolioUrl || null},
        COALESCE(
          (
            SELECT MAX(display_order) + 1
            FROM security_team
          ),
          0
        ),
        TRUE
      )
      RETURNING
        id,
        name,
        role,
        description,
        image_url,
        github_url,
        linkedin_url,
        portfolio_url,
        display_order,
        created_at
    `;

    return res.status(201).json({
      success: true,
      member: result[0],
    });
  } catch (error) {
    console.error("Security team upload error:", error);

    if (blobUrl) {
      try {
        await del(blobUrl, {
          token: process.env.BLOB_READ_WRITE_TOKEN,
        });
      } catch (cleanupError) {
        console.error("Blob cleanup error:", cleanupError);
      }
    }

    let message = "Unable to upload security team member";

    if (error?.message) {
      message = error.message;
    }

    return res.status(500).json({
      success: false,
      error: message,
    });
  } finally {
    if (uploadedFilePath) {
      try {
        await fs.unlink(uploadedFilePath);
      } catch {
        // Temporary upload file may already have been removed.
      }
    }
  }
}

function cryptoRandomId() {
  const bytes = new Uint8Array(16);

  if (
    typeof globalThis.crypto !== "undefined" &&
    typeof globalThis.crypto.getRandomValues === "function"
  ) {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }

  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
