import { clearSessionCookie } from "./_admin-auth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  }

  res.setHeader("Set-Cookie", clearSessionCookie());

  return res.status(200).json({
    success: true,
  });
}
