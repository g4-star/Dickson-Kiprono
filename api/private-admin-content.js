import crypto from "node:crypto";
import { handleUpload } from "@vercel/blob/client";
import { del } from "@vercel/blob";
import { neon } from "@neondatabase/serverless";
import { requirePrivateAdmin } from "./_private-admin-auth.js";

const ALLOWED_TYPES = new Set([
  // Documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

  // Images
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",

  // Code / text
  "text/plain",
  "text/html",
  "text/css",
  "text/javascript",
  "application/javascript",
  "application/json",
  "application/xml",
  "text/xml",
  "text/markdown",
  "application/sql",
  "text/x-python",
  "application/x-python-code",
  "text/x-java-source",
  "text/x-c",
  "text/x-c++src",
  "text/x-csharp",
  "text/x-php",
  "text/x-rust",
  "text/x-go",
  "text/x-shellscript",
  "application/x-sh",
  "application/dart",
  "application/octet-stream",
]);

const ALLOWED_CONTENT_TYPES = new Set([
  "report",
  "certificate",
  "cv",
  "project_document",
  "project_code",
  "profile_image",
]);

const ALLOWED_EXTENSIONS = new Set([
  "pdf",
  "doc",
  "docx",

  "jpg",
  "jpeg",
  "png",
  "webp",
  "svg",

  "py",
  "html",
  "htm",
  "css",
  "js",
  "jsx",
  "ts",
  "tsx",
  "dart",
  "java",
  "php",
  "c",
  "cpp",
  "cs",
  "rs",
  "go",
  "sh",
  "bash",
  "sql",
  "json",
  "xml",
  "md",
  "txt",
]);

function getFileExtension(fileName) {
  const name = String(fileName || "").toLowerCase();
  const index = name.lastIndexOf(".");

  if (index === -1) {
    return "";
  }

  return name.slice(index + 1);
}

const MAX_BLOB_SIZE = 100 * 1024 * 1024;

function cleanText(value, max = 20000) {
  return String(value || "").trim().slice(0, max);
}

function safeFileName(value) {
  const name = cleanText(value, 300)
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  return name || "upload";
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

async function deleteBlob(url) {
  if (!url) {
    return;
  }

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

async function handleBlobUpload(req, res) {
  try {
    const jsonResponse = await handleUpload({
      body: req.body,
      request: req,

      onBeforeGenerateToken: async (
        pathname,
        clientPayload,
        multipart
      ) => {
        let payload = {};

        try {
          payload = clientPayload
            ? JSON.parse(clientPayload)
            : {};
        } catch {
          throw new Error("Invalid upload payload.");
        }

        const contentType = cleanText(
          payload.content_type,
          40
        );

        if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
          throw new Error("Invalid content type.");
        }

        const originalName = safeFileName(
          payload.file_name
        );

        const serverPathname =
          `portfolio/${contentType}/` +
          `${crypto.randomUUID()}-${originalName}`;

        return {
          pathname: serverPathname,
          allowedContentTypes: [...ALLOWED_TYPES],
          maximumSizeInBytes: MAX_BLOB_SIZE,
          addRandomSuffix: false,
          multipart: Boolean(multipart),

          tokenPayload: JSON.stringify({
            content_type: contentType,
            file_name: originalName,
          }),
        };
      },

      onUploadCompleted: async ({
        blob,
        tokenPayload,
      }) => {
        console.log(
          "Private admin Blob upload completed:",
          blob.url,
          tokenPayload
        );
      },
    });

    return res.status(200).json(jsonResponse);
  } catch (error) {
    console.error(
      "Private admin Blob upload error:",
      error
    );

    return res.status(400).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to prepare Blob upload.",
    });
  }
}

async function createContent(req, res, sql) {
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

  const fileExtension = getFileExtension(fileName);

  if (
    !ALLOWED_TYPES.has(fileType) &&
    !ALLOWED_EXTENSIONS.has(fileExtension)
  ) {
    return res.status(400).json({
      success: false,
      error: "Unsupported file type.",
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
}

async function updateContent(req, res, sql) {
  const id = Number(req.query?.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      error: "Valid content ID is required.",
    });
  }

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

  const current = content[0];

  const isFullEdit =
    "content_type" in (body || {}) ||
    "title" in (body || {}) ||
    "description" in (body || {}) ||
    "objective" in (body || {}) ||
    "category" in (body || {}) ||
    "file_url" in (body || {}) ||
    "file_name" in (body || {}) ||
    "file_type" in (body || {}) ||
    "file_size" in (body || {});

  if (!isFullEdit) {
    if (typeof body?.published !== "boolean") {
      return res.status(400).json({
        success: false,
        error: "A valid published value is required.",
      });
    }

    const published = body.published;

    if (current.content_type === "profile_image" && published) {
      await sql`
        UPDATE portfolio_content
        SET
          published = FALSE,
          updated_at = NOW()
        WHERE content_type = 'profile_image'
          AND id <> ${id};
      `;
    }

    const rows = await sql`
      UPDATE portfolio_content
      SET
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

  const contentType = cleanText(
    body?.content_type ?? current.content_type,
    40
  );

  const title = cleanText(
    body?.title ?? current.title,
    300
  );

  const description = cleanText(
    body?.description ?? current.description
  );

  const objective = cleanText(
    body?.objective ?? current.objective
  );

  const category = cleanText(
    body?.category ?? current.category,
    300
  );

  const fileUrl = cleanText(
    body?.file_url ?? current.file_url,
    2000
  );

  const fileName = safeFileName(
    body?.file_name ?? current.file_name
  );

  const fileType = cleanText(
    body?.file_type ?? current.file_type,
    150
  );

  const fileSize = Number(
    body?.file_size ?? current.file_size
  );

  const published =
    typeof body?.published === "boolean"
      ? body.published
      : current.published;

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

  const fileExtension = getFileExtension(fileName);

  if (
    !ALLOWED_TYPES.has(fileType) &&
    !ALLOWED_EXTENSIONS.has(fileExtension)
  ) {
    return res.status(400).json({
      success: false,
      error: "Unsupported file type.",
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

  if (contentType === "profile_image" && published) {
    await sql`
      UPDATE portfolio_content
      SET
        published = FALSE,
        updated_at = NOW()
      WHERE content_type = 'profile_image'
        AND id <> ${id};
    `;
  }

  const rows = await sql`
    UPDATE portfolio_content
    SET
      content_type = ${contentType},
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

  if (!authenticated) {
    return;
  }

  if (req.method === "POST") {
    const contentType =
      String(req.headers["content-type"] || "").toLowerCase();

    if (
      contentType.includes("application/json") &&
      typeof req.body === "object" &&
      req.body !== null &&
      (
        "file_url" in req.body ||
        "content_type" in req.body
      )
    ) {
      if (!checkEnvironment(res)) {
        return;
      }

      const sql = neon(process.env.DATABASE_URL);

      try {
        await ensureTable(sql);
        return await createContent(req, res, sql);
      } catch (error) {
        console.error(
          "Private admin metadata error:",
          error
        );

        return res.status(500).json({
          success: false,
          error:
            error.message ||
            "Unable to save portfolio content.",
        });
      }
    }

    return handleBlobUpload(req, res);
  }

  if (!checkEnvironment(res)) {
    return;
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    await ensureTable(sql);

    if (req.method === "GET") {
      return listContent(res, sql);
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
    console.error(
      "Private admin content error:",
      error
    );

    return res.status(500).json({
      success: false,
      error:
        error.message ||
        "Unable to manage portfolio content.",
    });
  }
}
