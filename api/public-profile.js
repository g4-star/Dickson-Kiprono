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

    const [imageRows, cvRows] = await Promise.all([
      sql`
        SELECT file_url
        FROM portfolio_content
        WHERE content_type = 'profile_image'
          AND published = TRUE
        ORDER BY updated_at DESC, created_at DESC
        LIMIT 1;
      `,
      sql`
        SELECT file_url, file_name, file_type, updated_at
        FROM portfolio_content
        WHERE content_type = 'cv'
          AND published = TRUE
          AND file_url IS NOT NULL
        ORDER BY updated_at DESC, created_at DESC
        LIMIT 1;
      `,
    ]);

    const cv = cvRows[0] || null;

    return res.status(200).json({
      success: true,
      image_url: imageRows[0]?.file_url || null,
      cv_url: cv?.file_url || null,
      cv_file_name: cv?.file_name || null,
      cv_file_type: cv?.file_type || null,
      cv_updated_at: cv?.updated_at || null,
    });
  } catch (error) {
    console.error("Public profile error:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to load profile image.",
    });
  }
}
