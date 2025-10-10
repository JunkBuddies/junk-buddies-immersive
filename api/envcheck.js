// api/envcheck.js
export default async function handler(req, res) {
  const key = process.env.OPENAI_API_KEY || "";
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({
    hasKey: !!key,
    keyPreview: key ? key.slice(0,7) + "…" + key.slice(-4) : null,
    keyLen: key ? key.length : 0,
    projectId: process.env.VERCEL_PROJECT_ID || null,
    projectName: process.env.VERCEL_PROJECT_NAME || null,
    env: process.env.VERCEL_ENV || null,    // "preview" or "production"
    region: process.env.VERCEL_REGION || null
  });
}
