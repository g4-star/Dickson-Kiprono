import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({
        error: "DATABASE_URL is not configured",
      });
    }

    const sql = neon(process.env.DATABASE_URL);

    const team = await sql`
      SELECT
        id,
        name,
        role,
        description,
        image_url,
        github_url,
        linkedin_url,
        portfolio_url,
        display_order,
        created_at
      FROM security_team
      WHERE is_active = TRUE
      ORDER BY display_order ASC, created_at ASC
    `;

    return res.status(200).json({
      success: true,
      team,
    });
  } catch (error) {
    console.error("Security team API error:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to load security team",
    });
  }
}
