import fs from "node:fs/promises";
import crypto from "node:crypto";
import { formidable } from "formidable";
import { put, del } from "@vercel/blob";
import { neon } from "@neondatabase/serverless";
import { requireAdmin } from "./_admin-auth.js";

export const config = {
  api: { bodyParser: false },
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_TOTAL_SIZE = 50 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function getFiles(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function extensionForType(type) {
  if (type === "image/jpeg") return "jpg";
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return null;
}

async function deleteBlob(url) {
  if (!url || !process.env.BLOB_READ_WRITE_TOKEN) return;

  try {
    await del(url, { token: process.env.BLOB_READ_WRITE_TOKEN });
  } catch (error) {
    console.error("General gallery Blob deletion warning:", error);
  }
}

function checkEnvironment(res) {
  if (!process.env.DATABASE_URL || !process.env.BLOB_READ_WRITE_TOKEN) {
    res.status(500).json({
      success: false,
      error: "Database or Blob storage is not configured.",
    });
    return false;
  }

  return true;
}

async function handleUpload(req, res, sql) {
  const form = formidable({
    multiples: true,
    maxFileSize: MAX_IMAGE_SIZE,
    maxTotalFileSize: MAX_TOTAL_SIZE,
    allowEmptyFiles: false,
    keepExtensions: true,
  });

  const [, files] = await form.parse(req);
  const uploads = getFiles(files.images);

  if (!uploads.length) {
    return res.status(400).json({
      success: false,
      error: "Choose at least one image to upload.",
    });
  }

  if (uploads.length > 50) {
    return res.status(400).json({
      success: false,
      error: "Upload no more than 50 images at a time.",
    });
  }

  const uploaded = [];

  try {
    for (const file of uploads) {
      const type = file.mimetype || "";
      const extension = extensionForType(type);

      if (!ALLOWED_TYPES.has(type) || !extension) {
        throw new Error("Only JPG, PNG and WebP images are allowed.");
      }

      if (!file.size || file.size > MAX_IMAGE_SIZE) {
        throw new Error("Each image must be larger than 0 and no more than 5 MB.");
      }

      const buffer = await fs.readFile(file.filepath);
      const blob = await put(
        `security-team/general/${crypto.randomUUID()}.${extension}`,
        buffer,
        {
          access: "public",
          addRandomSuffix: false,
          token: process.env.BLOB_READ_WRITE_TOKEN,
          contentType: type,
        },
      );

      uploaded.push(blob.url);
    }

    for (const url of uploaded) {
      await sql`
        INSERT INTO security_team_gallery_images (image_url)
        VALUES (${url});
      `;
    }

    const galleryImages = await sql`
      SELECT id, image_url, display_order, created_at
      FROM security_team_gallery_images
      ORDER BY display_order ASC, created_at ASC, id ASC;
    `;

    return res.status(201).json({
      success: true,
      galleryImages,
    });
  } catch (error) {
    for (const url of uploaded) {
      try {
        await sql`
          DELETE FROM security_team_gallery_images
          WHERE image_url = ${url};
        `;
      } catch (cleanupError) {
        console.error("Gallery database cleanup warning:", cleanupError);
      }

      await deleteBlob(url);
    }

    throw error;
  }
}

async function handleDelete(req, res, sql) {
  const id = Number(req.query?.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      error: "A valid gallery image ID is required.",
    });
  }

  const rows = await sql`
    SELECT id, image_url
    FROM security_team_gallery_images
    WHERE id = ${id}
    LIMIT 1;
  `;

  if (!rows.length) {
    return res.status(404).json({
      success: false,
      error: "General gallery image not found.",
    });
  }

  await sql`
    DELETE FROM security_team_gallery_images
    WHERE id = ${id};
  `;

  await deleteBlob(rows[0].image_url);

  return res.status(200).json({ success: true });
}

export default async function handler(req, res) {
  const auth = await requireAdmin(req, res);
  if (!auth) return;

  if (!checkEnvironment(res)) return;

  const sql = neon(process.env.DATABASE_URL);

  try {
    if (req.method === "POST") {
      return await handleUpload(req, res, sql);
    }

    if (req.method === "DELETE") {
      return await handleDelete(req, res, sql);
    }

    res.setHeader("Allow", "POST, DELETE");
    return res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  } catch (error) {
    console.error("security-team-gallery API error:", error);

    const status = error?.httpCode === 413 ? 413 : 500;
    return res.status(status).json({
      success: false,
      error:
        status === 413
          ? "The selected images exceed the upload size limit."
          : error?.message || "Unable to manage the general gallery.",
    });
  }
}
