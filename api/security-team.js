import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");

    return res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  }

  try {
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({
        success: false,
        error: "DATABASE_URL is not configured",
      });
    }

    const sql = neon(process.env.DATABASE_URL);

    const team = await sql`
      SELECT
        st.id,
        st.name,
        st.role,
        st.description,
        st.profile_image_url,
        st.github_url,
        st.linkedin_url,
        st.portfolio_url,
        st.display_order,
        st.created_at,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', sti.id,
                'image_url', sti.image_url,
                'display_order', sti.display_order
              )
              ORDER BY sti.display_order ASC, sti.created_at ASC
            )
            FROM security_team_images sti
            WHERE sti.member_id = st.id
          ),
          '[]'::json
        ) AS images
      FROM security_team st
      WHERE st.is_active = TRUE
      ORDER BY st.display_order ASC, st.created_at ASC
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
