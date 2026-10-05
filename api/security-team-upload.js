import fs from "node:fs/promises";
import crypto from "node:crypto";
import { put } from "@vercel/blob";
import { neon } from "@neondatabase/serverless";
import { formidable } from "formidable";
import { isAdminSessionValid } from "./_admin-auth.js";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export const config = {
  api: {
    bodyParser: false,
  },
};

function getSingleFile(value) {
  if (Array.isArray(value)) {
    return value[0] || null;
  }

  return value || null;
}

function extensionForType(type) {
  if (type === "image/jpeg") return "jpg";
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";

  return null;
}

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

  if (!process.env.DATABASE_URL) {
    return res.status(500).json({
      success: false,
      error: "DATABASE_URL is not configured",
    });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(500).json({
      success: false,
      error: "BLOB_READ_WRITE_TOKEN is not configured",
    });
  }

  let uploadedFilePath = null;

  try {
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
        error: "Image must be 5 MB or smaller",
      });
    }

    const extension = extensionForType(mimeType);
    const imageBuffer = await fs.readFile(file.filepath);

    const filename =
      `security-team/${crypto.randomUUID()}.${extension}`;

    const blob = await put(filename, imageBuffer, {
      access: "public",
      addRandomSuffix: false,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      contentType: mimeType,
    });

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
        NULL,
        NULL,
        NULL,
        ${blob.url},
        NULL,
        NULL,
        NULL,
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
        image_url,
        display_order,
        created_at
    `;

    return res.status(201).json({
      success: true,
      member: result[0],
    });
  } catch (error) {
    console.error("Security team upload error:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to upload image",
    });
  } finally {
    if (uploadedFilePath) {
      try {
        await fs.unlink(uploadedFilePath);
      } catch {
        // Temporary upload file may already be removed.
      }
    }
  }
}
