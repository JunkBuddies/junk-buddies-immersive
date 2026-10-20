export async function onRequestGet({ env }) {
  return new Response(
    JSON.stringify({
      runtime: "cloudflare-pages",
      hasOpenAIKey: Boolean(env.OPENAI_API_KEY),
      hasOpenAIProject: Boolean(env.OPENAI_PROJECT),
      hasOpenAIOrg: Boolean(env.OPENAI_ORG),
      pointsPerCuFt: env.POINTS_PER_CUFT || "default:1"
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      }
    }
  );
}
