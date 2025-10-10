// api/aihealth.js
export default async function handler(req, res) {
  const key = process.env.OPENAI_API_KEY || "";
  const org = process.env.OPENAI_ORG || "";        // optional (org_...)
  const proj = process.env.OPENAI_PROJECT || "";   // optional (proj_...)

  res.setHeader("Cache-Control", "no-store");
  res.setHeader(
    "Access-Control-Expose-Headers",
    "X-AI,X-OpenAI-Status,X-Try1,X-Try2,X-Try3"
  );
  res.setHeader("X-AI", key ? "on" : "off");

  if (!key) {
    return res.status(200).json({ ok: false, error: "OPENAI_API_KEY missing" });
  }

  async function ping(extraHeaders = {}) {
    const controller = new AbortController();
    const to = setTimeout(() => controller.abort(), 8000);
    try {
      const r = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${key}`,
          ...extraHeaders
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: "Return JSON only." },
            { role: "user", content: "Return {\"ping\":true} exactly." }
          ]
        })
      });
      const text = await r.text();
      clearTimeout(to);
      return { ok: r.ok, status: r.status, sample: text.slice(0, 200) };
    } catch (e) {
      clearTimeout(to);
      return { ok: false, status: "error", error: String(e?.message || e) };
    }
  }

  // Try 1: plain
  const t1 = await ping();
  res.setHeader("X-Try1", String(t1.status));
  if (t1.ok) {
    res.setHeader("X-OpenAI-Status", String(t1.status));
    return res.status(200).json({ ok: true, via: "plain", t1 });
  }

  // Try 2: add Project header if you set OPENAI_PROJECT=proj_...
  let t2 = null;
  if (proj) {
    t2 = await ping({ "OpenAI-Project": proj });
    res.setHeader("X-Try2", String(t2.status));
    if (t2.ok) {
      res.setHeader("X-OpenAI-Status", String(t2.status));
      return res.status(200).json({ ok: true, via: "project", t1, t2 });
    }
  }

  // Try 3: add Organization header if you set OPENAI_ORG=org_...
  let t3 = null;
  if (org) {
    t3 = await ping({
      ...(proj ? { "OpenAI-Project": proj } : {}),
      "OpenAI-Organization": org
    });
    res.setHeader("X-Try3", String(t3.status));
    if (t3.ok) {
      res.setHeader("X-OpenAI-Status", String(t3.status));
      return res.status(200).json({ ok: true, via: "org+project", t1, t2, t3 });
    }
  }

  // All failed
  res.setHeader(
    "X-OpenAI-Status",
    String(t1?.status || t2?.status || t3?.status || "error")
  );
  return res.status(200).json({ ok: false, t1, t2, t3, hint:
    "If all tries are 401, the key is wrong or revoked. Regenerate a new Secret key (sk- / sk-proj-) and redeploy. If Try2 or Try3 succeed after you set OPENAI_PROJECT/OPENAI_ORG, keep those env vars."
  });
}
