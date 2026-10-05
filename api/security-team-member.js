import fs from "node:fs/promises";
import crypto from "node:crypto";
import { put, del } from "@vercel/blob";
import { neon } from "@neondatabase/serverless";
import { formidable } from "formidable";
import { requireAdmin } from "./_admin-auth.js";

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

function fieldValue(fields, name) {
  const value = fields?.[name];

  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function cleanText(value, maxLength = 10000) {
  return String(value || "").trim().slice(0, maxLength);
}

function validateImage(file) {
  if (!file) {
    throw new Error("Image file is missing.");
  }

  const mimeType = file.mimetype || "";

  if (!ALLOWED_TYPES.has(mimeType)) {
    throw new Error("Only JPG, PNG and WebP images are allowed.");
  }

  if (file.size <= 0 || file.size > MAX_IMAGE_SIZE) {
    throw new Error("Each image must be 5 MB or smaller.");
  }

  const extension = extensionForType(mimeType);

  if (!extension) {
    throw new Error("Unsupported image type.");
  }

  return {
    mimeType,
    extension,
  };
}

async function uploadImage(file) {
  const { mimeType, extension } = validateImage(file);
  const imageBuffer = await fs.readFile(file.filepath);

  const filename =
    `security-team/${crypto.randomUUID()}.${extension}`;

  const blob = await put(filename, imageBuffer, {
    access: "public",
    addRandomSuffix: false,
    token: process.env.BLOB_READ_WRITE_TOKEN,
    contentType: mimeType,
  });

  return blob.url;
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

async function handleCreate(req, res, sql) {
  const form = formidable({
    multiples: true,
    maxFileSize: MAX_IMAGE_SIZE,
    maxTotalFileSize: 50 * 1024 * 1024,
    allowEmptyFiles: false,
    keepExtensions: true,
  });

  const [fields, files] = await form.parse(req);

  const name = cleanText(fieldValue(fields, "name"), 120);
  const role = cleanText(fieldValue(fields, "role"), 160);
  const description = cleanText(fieldValue(fields, "description"), 10000);
  const githubUrl = cleanText(fieldValue(fields, "github_url"), 1000);
  const linkedinUrl = cleanText(fieldValue(fields, "linkedin_url"), 1000);
  const portfolioUrl = cleanText(fieldValue(fields, "portfolio_url"), 1000);

  if (!name) {
    return res.status(400).json({
      success: false,
      error: "Name is required.",
    });
  }

  const profileFile = getSingleFile(files.profile_image);
  const additionalFiles = getFiles(files.additional_images);

  let profileUrl = null;
  const additionalUrls = [];

  try {
    if (profileFile) {
      profileUrl = await uploadImage(profileFile);
    }

    for (const file of additionalFiles) {
      additionalUrls.push(await uploadImage(file));
    }

    const result = await sql`
      INSERT INTO security_team (
        name,
        role,
        description,
        image_url,
        profile_image_url,
        github_url,
        linkedin_url,
        portfolio_url,
        display_order,
        is_active
      )
      VALUES (
        ${name},
        ${role || null},
        ${description || null},
        NULL,
        ${profileUrl},
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
        profile_image_url,
        github_url,
        linkedin_url,
        portfolio_url,
        display_order,
        created_at;
    `;

    const member = result[0];

    for (let index = 0; index < additionalUrls.length; index += 1) {
      await sql`
        INSERT INTO security_team_images (
          member_id,
          image_url,
          display_order
        )
        VALUES (
          ${member.id},
          ${additionalUrls[index]},
          ${index}
        );
      `;
    }

    const images = await sql`
      SELECT
        id,
        image_url,
        display_order
      FROM security_team_images
      WHERE member_id = ${member.id}
      ORDER BY display_order ASC, created_at ASC;
    `;

    return res.status(201).json({
      success: true,
      member: {
        ...member,
        images,
      },
    });
  } catch (error) {
    if (profileUrl) await deleteBlob(profileUrl);

    for (const url of additionalUrls) {
      await deleteBlob(url);
    }

    throw error;
  }
}

async function handleUpdate(req, res, sql) {
  const form = formidable({
    multiples: true,
    maxFileSize: MAX_IMAGE_SIZE,
    maxTotalFileSize: 50 * 1024 * 1024,
    allowEmptyFiles: false,
    keepExtensions: true,
  });

  const [fields, files] = await form.parse(req);

  const memberId = Number(fieldValue(fields, "id"));

  if (!Number.isInteger(memberId) || memberId <= 0) {
    return res.status(400).json({
      success: false,
      error: "Valid member ID is required.",
    });
  }

  const existingRows = await sql`
    SELECT
      id,
      name,
      role,
      description,
      profile_image_url,
      image_url,
      github_url,
      linkedin_url,
      portfolio_url
    FROM security_team
    WHERE id = ${memberId}
    LIMIT 1;
  `;

  if (!existingRows.length) {
    return res.status(404).json({
      success: false,
      error: "Team member not found.",
    });
  }

  const existing = existingRows[0];

  const name = cleanText(fieldValue(fields, "name"), 120);
  const role = cleanText(fieldValue(fields, "role"), 160);
  const description = cleanText(fieldValue(fields, "description"), 10000);
  const githubUrl = cleanText(fieldValue(fields, "github_url"), 1000);
  const linkedinUrl = cleanText(fieldValue(fields, "linkedin_url"), 1000);
  const portfolioUrl = cleanText(fieldValue(fields, "portfolio_url"), 1000);

  if (!name) {
    return res.status(400).json({
      success: false,
      error: "Name is required.",
    });
  }

  const profileFile = getSingleFile(files.profile_image);
  const additionalFiles = getFiles(files.additional_images);

  let newProfileUrl = null;
  const newAdditionalUrls = [];

  try {
    if (profileFile) {
      newProfileUrl = await uploadImage(profileFile);
    }

    for (const file of additionalFiles) {
      newAdditionalUrls.push(await uploadImage(file));
    }

    const profileUrl = newProfileUrl || existing.profile_image_url;

    await sql`
      UPDATE security_team
      SET
        name = ${name},
        role = ${role || null},
        description = ${description || null},
        profile_image_url = ${profileUrl},
        github_url = ${githubUrl || null},
        linkedin_url = ${linkedinUrl || null},
        portfolio_url = ${portfolioUrl || null}
      WHERE id = ${memberId};
    `;

    if (newAdditionalUrls.length) {
      const existingImages = await sql`
        SELECT COALESCE(MAX(display_order), -1) AS max_order
        FROM security_team_images
        WHERE member_id = ${memberId};
      `;

      const nextOrder = Number(existingImages[0]?.max_order ?? -1) + 1;

      for (let index = 0; index < newAdditionalUrls.length; index += 1) {
        await sql`
          INSERT INTO security_team_images (
            member_id,
            image_url,
            display_order
          )
          VALUES (
            ${memberId},
            ${newAdditionalUrls[index]},
            ${nextOrder + index}
          );
        `;
      }
    }

    if (newProfileUrl && existing.profile_image_url) {
      await deleteBlob(existing.profile_image_url);
    }

    const memberRows = await sql`
      SELECT
        id,
        name,
        role,
        description,
        profile_image_url,
        github_url,
        linkedin_url,
        portfolio_url,
        display_order,
        created_at
      FROM security_team
      WHERE id = ${memberId}
      LIMIT 1;
    `;

    const images = await sql`
      SELECT
        id,
        image_url,
        display_order
      FROM security_team_images
      WHERE member_id = ${memberId}
      ORDER BY display_order ASC, created_at ASC;
    `;

    return res.status(200).json({
      success: true,
      member: {
        ...memberRows[0],
        images,
      },
    });
  } catch (error) {
    if (newProfileUrl) await deleteBlob(newProfileUrl);

    for (const url of newAdditionalUrls) {
      await deleteBlob(url);
    }

    throw error;
  }
}

async function handleDelete(req, res, sql) {
  const memberId = Number(req.query?.id);

  if (!Number.isInteger(memberId) || memberId <= 0) {
    return res.status(400).json({
      success: false,
      error: "Valid member ID is required.",
    });
  }

  const members = await sql`
    SELECT
      id,
      profile_image_url,
      image_url
    FROM security_team
    WHERE id = ${memberId}
    LIMIT 1;
  `;

  if (!members.length) {
    return res.status(404).json({
      success: false,
      error: "Team member not found.",
    });
  }

  const images = await sql`
    SELECT image_url
    FROM security_team_images
    WHERE member_id = ${memberId};
  `;

  const urls = [
    members[0].profile_image_url,
    members[0].image_url,
    ...images.map((item) => item.image_url),
  ].filter(Boolean);

  await sql`
    DELETE FROM security_team
    WHERE id = ${memberId};
  `;

  for (const url of urls) {
    await deleteBlob(url);
  }

  return res.status(200).json({
    success: true,
  });
}

export default async function handler(req, res) {
  const auth = await requireAdmin(req, res);
  if (!auth) return;

  if (!checkEnvironment(res)) return;

  const sql = neon(process.env.DATABASE_URL);

  try {
    if (req.method === "POST") {
      return await handleCreate(req, res, sql);
    }

    if (req.method === "PUT") {
      return await handleUpdate(req, res, sql);
    }

    if (req.method === "DELETE") {
      return await handleDelete(req, res, sql);
    }

    res.setHeader("Allow", "POST, PUT, DELETE");

    return res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  } catch (error) {
    console.error("security-team-member error:", error);

    return res.status(500).json({
      success: false,
      error: error?.message || "Unable to manage team member.",
    });
  }
}
