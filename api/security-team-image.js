import { neon } from "@neondatabase/serverless";
import { del } from "@vercel/blob";
import { requireAdmin } from "./_admin-auth.js";

export default async function handler(req, res) {
  const auth = await requireAdmin(req, res);
  if (!auth) return;

  if (req.method !== "DELETE") {
    res.setHeader("Allow", "DELETE");

    return res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  }

  if (!process.env.DATABASE_URL) {
    return res.status(500).json({
      success: false,
      error: "DATABASE_URL is not configured.",
    });
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    const imageId = Number(req.query?.id);

    if (!Number.isInteger(imageId) || imageId <= 0) {
      return res.status(400).json({
        success: false,
        error: "Valid image ID is required.",
      });
    }

    const rows = await sql`
      SELECT id, image_url, member_id
      FROM security_team_images
      WHERE id = ${imageId}
      LIMIT 1;
    `;

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        error: "Image not found.",
      });
    }

    const image = rows[0];

    await sql`
      DELETE FROM security_team_images
      WHERE id = ${imageId};
    `;

    if (image.image_url && process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        await del(image.image_url, {
          token: process.env.BLOB_READ_WRITE_TOKEN,
        });
      } catch (blobError) {
        console.error("Blob deletion warning:", blobError);
      }
    }

    return res.status(200).json({
      success: true,
      member_id: image.member_id,
    });
  } catch (error) {
    console.error("security-team-image error:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to delete image.",
    });
  }
}
