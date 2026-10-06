import fs from "node:fs/promises";
import crypto from "node:crypto";
import { put, del } from "@vercel/blob";
import { neon } from "@neondatabase/serverless";
import { formidable } from "formidable";
import { requirePrivateAdmin } from "./_private-admin-auth.js";

export const config = {
  api: {
    bodyParser: false,
  },
};

const MAX_FILE_SIZE = 25 * 1024 * 1024;

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

function cleanText(value, max = 20000) {
  return String(value || "").trim().slice(0, max);
}

function fieldValue(fields, name) {
  const value = fields?.[name];

  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function getSingleFile(value) {
  if (Array.isArray(value)) {
    return value[0] || null;
  }

  return value || null;
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

async function uploadFile(file, contentType) {
  if (!file) {
    throw new Error("A file is required.");
  }

  const mimeType = file.mimetype || "";

  if (!ALLOWED_TYPES.has(mimeType)) {
    throw new Error(
      "Unsupported file type. Use PDF, DOC, DOCX, JPG, PNG or WebP."
    );
  }

  if (!file.size || file.size <= 0) {
    throw new Error("The uploaded file is empty.");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("The maximum file size is 25 MB.");
  }

  const buffer = await fs.readFile(file.filepath);

  const originalName = file.originalFilename || "upload";

  const safeName = originalName
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .slice(-140);

  const blob = await put(
    `portfolio/${contentType}/${crypto.randomUUID()}-${safeName}`,
    buffer,
    {
      access: "public",
      addRandomSuffix: false,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      contentType: mimeType,
    }
  );

  return {
    url: blob.url,
    name: originalName,
    type: mimeType,
    size: file.size,
  };
}

async function deleteBlob(url) {
  if (!url) return;

  try {
    await del(url, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
  } catch (error) {
    console.error("Blob deletion warning:", error);
  }
}

async function listContent(res, sql) {
  const rows = await sql`
    SELECT *
    FROM portfolio_content
    ORDER BY created_at DESC;
  `;

  return res.status(200).json({
    success: true,
    items: rows,
  });
}

async function createContent(req, res, sql) {
  const form = formidable({
    multiples: false,
    maxFileSize: MAX_FILE_SIZE,
    maxTotalFileSize: MAX_FILE_SIZE,
    allowEmptyFiles: false,
    keepExtensions: true,
  });

  const [fields, files] = await form.parse(req);

  const contentType = cleanText(
    fieldValue(fields, "content_type"),
    40
  );

  const title = cleanText(
    fieldValue(fields, "title"),
    300
  );

  const description = cleanText(
    fieldValue(fields, "description")
  );

  const objective = cleanText(
    fieldValue(fields, "objective")
  );

  const category = cleanText(
    fieldValue(fields, "category"),
    300
  );

  const published =
    fieldValue(fields, "published") === "true";

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

  const file = getSingleFile(files?.file);

  if (!file) {
    return res.status(400).json({
      success: false,
      error: "File is required.",
    });
  }

  const uploaded = await uploadFile(file, contentType);

  if (contentType === "profile_image") {
    await sql`
      UPDATE portfolio_content
      SET published = FALSE,
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
      ${uploaded.url},
      ${uploaded.name},
      ${uploaded.type},
      ${uploaded.size},
      ${published}
    )
    RETURNING *;
  `;

  return res.status(201).json({
    success: true,
    item: rows[0],
  });
}

async function updateContent(req, res, sql) {
  const id = Number(req.query?.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      error: "Valid content ID is required.",
    });
  }

  const content = await sql`
    SELECT *
    FROM portfolio_content
    WHERE id = ${id}
    LIMIT 1;
  `;

  if (!content.length) {
    return res.status(404).json({
      success: false,
      error: "Content not found.",
    });
  }

  const form = formidable({
    multiples: false,
    maxFileSize: MAX_FILE_SIZE,
    maxTotalFileSize: MAX_FILE_SIZE,
    allowEmptyFiles: false,
    keepExtensions: true,
  });

  const [fields, files] = await form.parse(req);

  const current = content[0];

  const title =
    fieldValue(fields, "title") !== ""
      ? cleanText(fieldValue(fields, "title"), 300)
      : current.title;

  const description =
    fieldValue(fields, "description") !== ""
      ? cleanText(fieldValue(fields, "description"))
      : current.description;

  const objective =
    fieldValue(fields, "objective") !== ""
      ? cleanText(fieldValue(fields, "objective"))
      : current.objective;

  const category =
    fieldValue(fields, "category") !== ""
      ? cleanText(fieldValue(fields, "category"), 300)
      : current.category;

  const published =
    fieldValue(fields, "published") === "true";

  const newFile = getSingleFile(files?.file);

  let fileUrl = current.file_url;
  let fileName = current.file_name;
  let fileType = current.file_type;
  let fileSize = current.file_size;

  if (newFile) {
    const uploaded = await uploadFile(
      newFile,
      current.content_type
    );

    fileUrl = uploaded.url;
    fileName = uploaded.name;
    fileType = uploaded.type;
    fileSize = uploaded.size;

    await deleteBlob(current.file_url);
  }

  if (current.content_type === "profile_image" && published) {
    await sql`
      UPDATE portfolio_content
      SET published = FALSE,
          updated_at = NOW()
      WHERE content_type = 'profile_image'
        AND id <> ${id};
    `;
  }

  const rows = await sql`
    UPDATE portfolio_content
    SET
      title = ${title},
      description = ${description},
      objective = ${objective},
      category = ${category},
      file_url = ${fileUrl},
      file_name = ${fileName},
      file_type = ${fileType},
      file_size = ${fileSize},
      published = ${published},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *;
  `;

  return res.status(200).json({
    success: true,
    item: rows[0],
  });
}

async function deleteContent(req, res, sql) {
  const id = Number(req.query?.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      error: "Valid content ID is required.",
    });
  }

  const rows = await sql`
    SELECT *
    FROM portfolio_content
    WHERE id = ${id}
    LIMIT 1;
  `;

  if (!rows.length) {
    return res.status(404).json({
      success: false,
      error: "Content not found.",
    });
  }

  await sql`
    DELETE FROM portfolio_content
    WHERE id = ${id};
  `;

  await deleteBlob(rows[0].file_url);

  return res.status(200).json({
    success: true,
  });
}

export default async function handler(req, res) {
  const authenticated = await requirePrivateAdmin(req, res);

  if (!authenticated) return;

  if (!checkEnvironment(res)) return;

  const sql = neon(process.env.DATABASE_URL);

  try {
    await ensureTable(sql);

    if (req.method === "GET") {
      return listContent(res, sql);
    }

    if (req.method === "POST") {
      return createContent(req, res, sql);
    }

    if (req.method === "PUT") {
      return updateContent(req, res, sql);
    }

    if (req.method === "DELETE") {
      return deleteContent(req, res, sql);
    }

    res.setHeader("Allow", "GET, POST, PUT, DELETE");

    return res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  } catch (error) {
    console.error("Private admin content error:", error);

    return res.status(500).json({
      success: false,
      error: error.message || "Unable to manage portfolio content.",
    });
  }
}
