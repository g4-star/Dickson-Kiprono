import { neon } from "@neondatabase/serverless";
import { requirePrivateAdmin } from "./_private-admin-auth.js";

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const ALLOWED_CONTENT_TYPES = new Set([
  "report",
  "certificate",
  "cv",
  "project_document",
  "profile_image",
]);

const MAX_BLOB_SIZE = 5 * 1024 * 1024 * 1024 * 1024;

function cleanText(value, max = 20000) {
  return String(value || "").trim().slice(0, max);
}

function checkEnvironment(res) {
  if (!process.env.DATABASE_URL) {
    res.status(500).json({
      success: false,
      error: "DATABASE_URL is not configured.",
    });
    return false;
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    res.status(500).json({
      success: false,
      error: "BLOB_READ_WRITE_TOKEN is not configured.",
    });
    return false;
  }

  return true;
}

async function ensureTable(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS portfolio_content (
      id SERIAL PRIMARY KEY,
      content_type VARCHAR(40) NOT NULL,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      objective TEXT DEFAULT '',
      category TEXT DEFAULT '',
      file_url TEXT,
      file_name TEXT,
      file_type TEXT,
      file_size BIGINT DEFAULT 0,
      published BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS portfolio_content_type_idx
    ON portfolio_content(content_type);
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS portfolio_content_published_idx
    ON portfolio_content(published);
  `;
}

function isValidBlobUrl(value) {
  try {
    const url = new URL(value);

    return (
      url.protocol === "https:" &&
      url.hostname.endsWith(".public.blob.vercel-storage.com")
    );
  } catch {
    return false;
  }
}

function safeFileName(value) {
  const name = cleanText(value, 300)
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  return name || "upload";
}

export default async function handler(req, res) {
  const authenticated = await requirePrivateAdmin(req, res);

  if (!authenticated) {
    return;
  }

  if (!checkEnvironment(res)) {
    return;
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");

    return res.status(405).json({
      success: false,
      error: "Method not allowed.",
    });
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    await ensureTable(sql);

    let body = req.body;

    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        return res.status(400).json({
          success: false,
          error: "Invalid JSON request.",
        });
      }
    }

    const contentType = cleanText(body?.content_type, 40);
    const title = cleanText(body?.title, 300);
    const description = cleanText(body?.description);
    const objective = cleanText(body?.objective);
    const category = cleanText(body?.category, 300);
    const fileUrl = cleanText(body?.file_url, 2000);
    const fileName = safeFileName(body?.file_name);
    const fileType = cleanText(body?.file_type, 150);
    const fileSize = Number(body?.file_size);
    const published = body?.published === true;

    if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
      return res.status(400).json({
        success: false,
        error: "Invalid content type.",
      });
    }

    if (!title) {
      return res.status(400).json({
        success: false,
        error: "Title is required.",
      });
    }

    if (!isValidBlobUrl(fileUrl)) {
      return res.status(400).json({
        success: false,
        error: "Invalid Vercel Blob URL.",
      });
    }

    if (!ALLOWED_TYPES.has(fileType)) {
      return res.status(400).json({
        success: false,
        error:
          "Unsupported file type. Use PDF, DOC, DOCX, JPG, PNG or WebP.",
      });
    }

    if (
      !Number.isSafeInteger(fileSize) ||
      fileSize <= 0 ||
      fileSize > MAX_BLOB_SIZE
    ) {
      return res.status(400).json({
        success: false,
        error: "Invalid file size.",
      });
    }

    if (contentType === "profile_image") {
      await sql`
        UPDATE portfolio_content
        SET
          published = FALSE,
          updated_at = NOW()
        WHERE content_type = 'profile_image';
      `;
    }

    const rows = await sql`
      INSERT INTO portfolio_content (
        content_type,
        title,
        description,
        objective,
        category,
        file_url,
        file_name,
        file_type,
        file_size,
        published
      )
      VALUES (
        ${contentType},
        ${title},
        ${description},
        ${objective},
        ${category},
        ${fileUrl},
        ${fileName},
        ${fileType},
        ${fileSize},
        ${published}
      )
      RETURNING *;
    `;

    return res.status(201).json({
      success: true,
      item: rows[0],
    });
  } catch (error) {
    console.error("Private admin metadata error:", error);

    return res.status(500).json({
      success: false,
      error:
        error.message ||
        "Unable to save portfolio content.",
    });
  }
}
