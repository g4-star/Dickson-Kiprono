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
      SELECT
        id,
        title,
        description,
        category,
        file_url,
        file_name,
        file_type,
        created_at
      FROM portfolio_content
      WHERE content_type = 'certificate'
        AND published = TRUE
      ORDER BY created_at DESC;
    `;

    return res.status(200).json({
      success: true,
      certificates: rows,
    });
  } catch (error) {
    console.error("Public certificates error:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to load certificates.",
    });
  }
}
