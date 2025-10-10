// /api/smart-selector.js
// ESM Vercel function → calls OpenAI directly (no GCP, no CORS headaches)

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS, GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method === "GET") {
    return res.status(200).json({ ok: true, where: "vercel" });
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const body = typeof req.body === "object" ? req.body : JSON.parse(req.body || "{}");
    const history = Array.isArray(body.messages) ? body.messages : [];

    // Accept [{sender,text}] OR OpenAI [{role,content}]
    const msgs = history.map(m =>
      m.role && m.content ? m : { role: m.sender === "user" ? "user" : "assistant", content: m.text || "" }
    );

    const system = `
You are "Junk Buddies Smart Selector".
- Greet casually and explain: list items or apply a 10% discount now to see discounted prices as the cart builds.
- After each user message, confirm items you added and show a concise current list.
- Keep asking in varied ways: "add more or see price?"
- When showing price, if discount not applied, offer "see price with discount?"
- If user shares name + phone, acknowledge and provide /schedule link.
Keep replies short and clear. Do not invent prices; the site handles pricing.
`.trim();

    const r = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: system }, ...msgs],
        temperature: 0.7
      })
    });

    const data = await r.json();
    if (!r.ok) {
      console.error("OpenAI error:", data);
      return res.status(r.status).json({ error: data?.error?.message || "OpenAI failed" });
    }

    const reply = data?.choices?.[0]?.message?.content || "Got it!";
    // Start simple: return reply only (we’ll add item matching later)
    return res.status(200).json({ reply, cartItems: [] });
  } catch (e) {
    console.error("Smart Selector fatal:", e);
    return res.status(500).json({ error: "Server error" });
  }
}
