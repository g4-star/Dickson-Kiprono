import { del } from "@vercel/blob";
import { neon } from "@neondatabase/serverless";
import { isAdminSessionValid } from "./_admin-auth.js";

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    res.setHeader("Allow", "DELETE");

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

  try {
    const id = Number(req.query?.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid image ID",
      });
    }

    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not configured");
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error("BLOB_READ_WRITE_TOKEN is not configured");
    }

    const sql = neon(process.env.DATABASE_URL);

    const rows = await sql`
      SELECT id, image_url
      FROM security_team
      WHERE id = ${id}
      LIMIT 1
    `;

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        error: "Image not found",
      });
    }

    const imageUrl = rows[0].image_url;

    if (imageUrl) {
      try {
        await del(imageUrl, {
          token: process.env.BLOB_READ_WRITE_TOKEN,
        });
      } catch (blobError) {
        console.error("Blob deletion error:", blobError);

        return res.status(500).json({
          success: false,
          error: "Unable to delete image from storage",
        });
      }
    }

    await sql`
      DELETE FROM security_team
      WHERE id = ${id}
    `;

    return res.status(200).json({
      success: true,
      deletedId: id,
    });
  } catch (error) {
    console.error("Security team delete error:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to delete image",
    });
  }
}
