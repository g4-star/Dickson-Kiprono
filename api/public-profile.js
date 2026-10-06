import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");

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

  try {
    const sql = neon(process.env.DATABASE_URL);

    const rows = await sql`
      SELECT file_url
      FROM portfolio_content
      WHERE content_type = 'profile_image'
        AND published = TRUE
      ORDER BY created_at DESC
      LIMIT 1;
    `;

    return res.status(200).json({
      success: true,
      image_url: rows[0]?.file_url || null,
    });
  } catch (error) {
    console.error("Public profile error:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to load profile image.",
    });
  }
}
