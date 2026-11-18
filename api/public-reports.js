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

    // Ensure skill fields exist before querying published content.
    await sql`
      ALTER TABLE portfolio_content
      ADD COLUMN IF NOT EXISTS technologies TEXT DEFAULT '';
    `;

    await sql`
      ALTER TABLE portfolio_content
      ADD COLUMN IF NOT EXISTS features TEXT DEFAULT '';
    `;

    const [reports, projects, skills] = await Promise.all([
      sql`
        SELECT
          id,
          title,
          description,
          objective,
          category,
          file_url,
          file_name,
          file_type,
          created_at
        FROM portfolio_content
        WHERE content_type = 'report'
          AND published = TRUE
        ORDER BY created_at DESC;
      `,

      sql`
        SELECT
          id,
          title,
          description,
          objective,
          category,
          file_url,
          file_name,
          file_type,
          created_at
        FROM portfolio_content
        WHERE content_type = 'project_code'
          AND published = TRUE
        ORDER BY created_at DESC;
      `,

      sql`
        SELECT
          id,
          title,
          description,
          objective,
          category,
          technologies,
          features,
          file_url,
          file_name,
          created_at
        FROM portfolio_content
        WHERE content_type = 'skill'
          AND published = TRUE
        ORDER BY created_at DESC;
      `,
    ]);

    return res.status(200).json({
      success: true,
      reports,
      projects,
      skills,
    });
  } catch (error) {
    console.error("Public lab content error:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to load lab content.",
    });
  }
}
