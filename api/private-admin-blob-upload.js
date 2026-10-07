import crypto from "node:crypto";
import { handleUpload } from "@vercel/blob/client";
import { requirePrivateAdmin } from "./_private-admin-auth.js";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/webp",
];

const ALLOWED_CONTENT_TYPES = new Set([
  "report",
  "certificate",
  "cv",
  "project_document",
  "profile_image",
]);

const MAX_BLOB_SIZE = 5 * 1024 * 1024 * 1024 * 1024;

function cleanText(value, max = 300) {
  return String(value || "").trim().slice(0, max);
}

function safeFileName(value) {
  const name = cleanText(value, 140)
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

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");

    return res.status(405).json({
      success: false,
      error: "Method not allowed.",
    });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(500).json({
      success: false,
      error: "BLOB_READ_WRITE_TOKEN is not configured.",
    });
  }

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

          allowedContentTypes: ALLOWED_TYPES,

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
