// api/chat.js — Conversational router + AI-first estimator with your pricing + itemData
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const POINTS_PER_CUFT = Number(process.env.POINTS_PER_CUFT || 1); // points == cu ft by default

// -------- utils --------
const norm = (s = "") => String(s).toLowerCase().trim();
const slug = (s = "") => norm(s).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function lev(a = "", b = "") {
  const m = a.length, n = b.length;
  if (!m) return n; if (!n) return m;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

function parseDims(t = "") {
  const s = t.toLowerCase().replace(/,/g, " ");
  let m = s.match(/(\d+(?:\.\d+)?)\s*(?:ft|feet)['"]?\s*[x×]\s*(\d+(?:\.\d+)?)\s*(?:ft|feet)['"]?\s*[x×]\s*(\d+(?:\.\d+)?)\s*(?:ft|feet)/);
  if (m) return { L:+m[1], W:+m[2], H:+m[3], unit:"ft" };
  m = s.match(/(\d+(?:\.\d+)?)\s*(?:in|inch|inches)['"]?\s*[x×]\s*(\d+(?:\.\d+)?)\s*(?:in|inch|inches)['"]?\s*[x×]\s*(\d+(?:\.\d+)?)\s*(?:in|inch|inches)/);
  if (m) return { L:+m[1], W:+m[2], H:+m[3], unit:"in" };
  m = s.match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/);
  if (m) return { L:+m[1], W:+m[2], H:+m[3], unit:"in" };
  return null;
}
function dimsToCuFt(d){ if (!d || !d.L || !d.W || !d.H) return null; return d.unit==="ft" ? d.L*d.W*d.H : (d.L/12)*(d.W/12)*(d.H/12); }

function countWithQty(text, base){
  const re = new RegExp(`(?:^|\\b)(\\d{1,3})?\\s*${base}\\b`, "g");
  let m, total = 0;
  while ((m = re.exec(text)) !== null) total += Math.max(1, parseInt(m[1] || "1", 10));
  return total;
}

function flattenCatalog(nested = []) {
  const flat = [];
  for (const cat of nested) {
    const category = cat.category || "";
    for (const it of (cat.items || [])) {
      flat.push({
        id: slug(`${category}-${it.name || "Item"}`),
        name: it.name || "Item",
        price: it.price ?? 0,
        volume: it.volume ?? 0,
        category
      });
    }
  }
  return flat;
}

function indexByName(items){
  const get = (eq) => items.find(it => norm(it.name) === eq) || null;
  const inc = (frag) => items.find(it => norm(it.name).includes(frag)) || null;
  return {
    // sofas
    sofa:        get("sofa") || inc("sofa"),
    couchLove:   inc("couch / loveseat") || inc("loveseat"),
    reclSofa:    inc("reclining sofa"),
    sleeperSofa: inc("sleeper sofa"),
    sectional2:  inc("sectional sofa - 2 pieces"),
    sectional3:  inc("sectional sofa - 3 pieces"),
    // treadmill
    tread:       get("treadmill") || inc("treadmill"),
    treadComm:   inc("treadmill - commercial"),
    treadRes:    inc("treadmill - residential"),
    // mattresses
    matt:        get("mattress") || inc("mattress"),
    mattQueen:   inc("mattress - queen"),
    mattKing:    inc("mattress - king"),
    mattKingCal: inc("mattress - king/cal king") || inc("mattress - king/"),
    mattFull:    inc("mattress - full"),
    mattTwin:    inc("mattress - twin"),
  };
}

function buildExactNameMatchers(items) {
  return items.map(it => {
    const base = norm(it.name);
    const parts = base.split(/[\/–—-]/).map(s => s.trim()).filter(Boolean);
    const labels = [...new Set([base, ...parts])].map(escRe);
    const pattern = labels.length ? `(?:${labels.join("|")})(?:es|s)?` : null;
    return pattern ? {
      id: it.id, name: it.name,
      volume: Number(it.volume||0), price: Number(it.price||0),
      re: new RegExp(`(?:^|\\b)(\\d{1,3})?\\s*(?:x|×)?\\s*(${pattern})\\b`, "g")
    } : null;
  }).filter(Boolean);
}

const SYN = [
  ["couch","sofa"], ["love seat","loveseat"],
  ["tv","television"], ["fridge","refrigerator"],
  ["coffee table","table - coffee"], ["table coffee","table - coffee"]
];
function bestCatalogMatch(raw, items){
  const q0 = norm(raw);
  const q = q0.replace(/\b(coffee table)\b/g, "table - coffee");
  let best = { score: Infinity, item: null };
  for (const it of items) {
    const a = norm(it.name);
    if (a.includes(q) || q.includes(a)) {
      const score = Math.abs(a.length - q.length);
      if (score < best.score) best = { score, item: it };
      continue;
    }
    let qSyn = q;
    for (const [from,to] of SYN) qSyn = qSyn.replace(new RegExp(`\\b${escRe(from)}\\b`,"g"), to);
    const d = lev(qSyn, a);
    const score = d / Math.max(1, Math.max(qSyn.length, a.length));
    if (score < best.score) best = { score, item: it };
  }
  return best.score <= 0.45 ? best.item : null;
}

// -------- AI helpers --------
function oaiHeaders() {
  const h = {
    "Content-Type": "application/json",
  };
  if (OPENAI_API_KEY) h["Authorization"] = `Bearer ${OPENAI_API_KEY}`;
  if (process.env.OPENAI_PROJECT) h["OpenAI-Project"] = process.env.OPENAI_PROJECT.trim();
  return h;
}

// Decide response mode per turn: "chat" | "estimate" | "both"
async function aiRoute(messages, catalogNames = []) {
  if (!OPENAI_API_KEY) {
    return { mode: "estimate", chat: null, items: [] }; // no key => estimator only
  }

  const sys = `
You are a helpful assistant for a junk removal site.
Decide the response mode each turn:

- "chat": user is only asking a question; answer briefly (1–2 sentences).
- "estimate": user listed items/qty/dimensions; extract items for pricing.
- "both": there is a general question AND items; give a short friendly line, then we will estimate.

Return STRICT JSON:
{"mode":"chat|estimate|both","chat":"string or null","items":[{"name":"string","qty":number,"dims":"optional raw dims"}]}

If items are present, prefer "estimate" or "both".
Catalog examples: ${catalogNames.slice(0,120).join(", ")}
`.trim();

  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: oaiHeaders(),
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: sys },
        ...messages.map(m => ({ role: m.role, content: String(m.content || "") }))
      ]
    })
  });

  if (!r.ok) return { mode: "estimate", chat: null, items: [] };

  let obj = {};
  try {
    const j = await r.json();
    obj = JSON.parse(j.choices?.[0]?.message?.content || "{}");
  } catch {}
  const mode = (obj.mode === "chat" || obj.mode === "both") ? obj.mode : "estimate";
  const chat = (typeof obj.chat === "string" && obj.chat.trim()) ? obj.chat.trim() : null;
  const items = Array.isArray(obj.items) ? obj.items.map(it => ({
    name: String(it.name||"").trim(),
    qty: Math.max(1, parseInt(it.qty||1, 10)),
    dims: typeof it.dims === "string" ? it.dims : null
  })) : [];

  return { mode, chat, items };
}

// Extract list-like items from a single user message (backup parser)
async function aiParseItems(userText, exampleNames = []) {
  if (!OPENAI_API_KEY) return [];
  const sys = "Extract a shopping list for junk removal. Reply ONLY with JSON {\"items\":[{\"name\":\"string\",\"qty\":number,\"dims\":\"optional raw dims if present\"}]}";
  const hint = `Catalog examples: ${exampleNames.slice(0, 120).join(", ")}`;
  const body = {
    model: "gpt-4o-mini",
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: sys },
      { role: "system", content: hint },
      { role: "user", content: userText }
    ]
  };
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: oaiHeaders(),
    body: JSON.stringify(body)
  });
  if (!r.ok) return [];
  const j = await r.json();
  let parsed;
  try { parsed = JSON.parse(j.choices?.[0]?.message?.content || "{}"); } catch { parsed = {}; }
  const arr = Array.isArray(parsed.items) ? parsed.items : [];
  return arr.map(it => ({
    name: String(it.name || "").trim(),
    qty: Math.max(1, parseInt(it.qty || 1, 10)),
    dims: typeof it.dims === "string" ? it.dims : null
  }));
}

async function aiEstimateCuFt(label) {
  if (!OPENAI_API_KEY) return 15;
  const sys = "You return a conservative typical cubic-foot estimate for a household item. JSON only.";
  const user = `Item: ${label}\nReturn {"cuft": number} with cuft between 1 and 300.`;
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: oaiHeaders(),
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [{ role:"system", content: sys }, { role:"user", content: user }]
    })
  });
  if (!r.ok) return 15;
  const j = await r.json();
  try { return Number(JSON.parse(j.choices?.[0]?.message?.content || "{}")?.cuft || 15); }
  catch { return 15; }
}

// -------- main handler --------
export default async function handler(req, res){
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Access-Control-Expose-Headers", "X-AI, X-Catalog, X-Error, X-Mode");
  res.setHeader("X-AI", OPENAI_API_KEY ? "on" : "off");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error:"Method not allowed" });

  try {
    // imports
    const pricing = await import(new URL("../src/utils/pricing.js", import.meta.url).href);
    const mod = await import(new URL("../src/data/itemData.js", import.meta.url).href);
    const nested = mod.default || mod.items || mod.ITEMS || mod.data || [];
    if (!Array.isArray(nested)) throw new Error("itemData is not an array");
    const ITEMS = flattenCatalog(nested);
    res.setHeader("X-Catalog", "/src/data/itemData.js");

    // input
    const { messages = [], sessionId } = req.body || {};
    const lastRaw = messages[messages.length - 1]?.content || "";
    const text = norm(lastRaw);
    const catalogNames = ITEMS.map(i => i.name);

    // ---- Conversational router ----
    let mode = "estimate";
    let chatLine = null;
    let seedItems = [];
    try {
      const routed = await aiRoute(messages, catalogNames); // {mode, chat, items}
      mode = routed.mode;
      chatLine = routed.chat;
      seedItems = Array.isArray(routed.items) ? routed.items : [];
      res.setHeader("X-Mode", mode);
    } catch {
      // if router fails, we just estimate as usual
      res.setHeader("X-Mode", "estimate");
    }

    // If pure chat, return early
    if (mode === "chat" && chatLine) {
      return res.status(200).json({
        reply: chatLine,
        parsed: { cart: [], finalPrice: 0, totalVolume: 0, loadLabel: "Empty" }
      });
    }

    // ==== Build CART ====
    let cart = [];

    // A) If router gave us items, try to price them
    if (seedItems.length) {
      for (const row of seedItems) {
        const qty = Math.max(1, Number(row.qty || 1));
        const dims = row.dims ? parseDims(row.dims) : parseDims(row.name);
        const matched = bestCatalogMatch(row.name, ITEMS);

        if (matched) {
          cart.push({
            id: matched.id,
            name: matched.name,
            qty,
            volume: Number(matched.volume || 0) * qty,
            price: Number(matched.price || 0) * qty
          });
        } else {
          let cuft = dimsToCuFt(dims);
          if (cuft == null) cuft = await aiEstimateCuFt(row.name);
          const points = Math.max(1, Math.min(300, cuft * POINTS_PER_CUFT)) * qty;
          cart.push({
            id: "unlisted-" + slug(row.name),
            name: row.name,
            qty,
            volume: points,
            price: 0
          });
        }
      }
    }

    // B) If router gave nothing, try your AI single-turn extractor
    if (!cart.length) {
      try {
        const aiItems = await aiParseItems(lastRaw, catalogNames);
        for (const row of aiItems) {
          const qty = Math.max(1, Number(row.qty || 1));
          const dims = row.dims ? parseDims(row.dims) : parseDims(row.name);
          const matched = bestCatalogMatch(row.name, ITEMS);

          if (matched) {
            cart.push({
              id: matched.id,
              name: matched.name,
              qty,
              volume: Number(matched.volume || 0) * qty,
              price: Number(matched.price || 0) * qty
            });
          } else {
            let cuft = dimsToCuFt(dims);
            if (cuft == null) cuft = await aiEstimateCuFt(row.name);
            const points = Math.max(1, Math.min(300, cuft * POINTS_PER_CUFT)) * qty;
            cart.push({
              id: "unlisted-" + slug(row.name),
              name: row.name,
              qty,
              volume: points,
              price: 0
            });
          }
        }
      } catch {}
    }

    // C) If still nothing, fallback to your regex/exact-name logic (sofa/treadmill/mattress + exact names)
    if (!cart.length) {
      const idx = indexByName(ITEMS);
      const qtyById = new Map();

      // sofas
      const hasSectional = /\bsectional\b/.test(text);
      const hasSleeper   = /\bsleeper\b/.test(text);
      const hasRecliner  = /\brecliner|reclining\b/.test(text);
      const couchQty     = countWithQty(text, "couch(?:es)?");
      const sofaQty      = countWithQty(text, "sofa(?:s)?");
      const loveQty      = countWithQty(text, "loveseat(?:s)?");

      if (hasSectional) {
        const secQty = countWithQty(text, "sectional(?:\\s+sofa)?s?");
        const pick = idx.sectional3 || idx.sectional2;
        if (pick && secQty) qtyById.set(pick.id, secQty);
      } else if (hasSleeper && idx.sleeperSofa) {
        const q = Math.max(couchQty, sofaQty, countWithQty(text, "sleeper(?:\\s+sofa)?s?"));
        if (q) qtyById.set(idx.sleeperSofa.id, q);
      } else if (hasRecliner && idx.reclSofa) {
        const q = Math.max(couchQty, sofaQty, countWithQty(text, "recliner(?:s)?"));
        if (q) qtyById.set(idx.reclSofa.id, q);
      } else {
        if (couchQty) {
          const pick = idx.couchLove || idx.sofa;
          if (pick) qtyById.set(pick.id, (qtyById.get(pick.id)||0) + couchQty);
        } else if (sofaQty) {
          const pick = idx.sofa || idx.couchLove;
          if (pick) qtyById.set(pick.id, (qtyById.get(pick.id)||0) + sofaQty);
        }
        if (loveQty && idx.couchLove) {
          qtyById.set(idx.couchLove.id, (qtyById.get(idx.couchLove.id)||0) + loveQty);
        }
      }

      // treadmill
      const treadQty = countWithQty(text, "treadmill(?:s)?");
      if (treadQty) {
        const pick = /\bcommercial\b/.test(text) ? (idx.treadComm || idx.tread)
                  : /\bresidential\b/.test(text) ? (idx.treadRes  || idx.tread)
                  : idx.tread;
        if (pick) qtyById.set(pick.id, (qtyById.get(pick.id)||0) + treadQty);
      }

      // mattress
      const mattQty = countWithQty(text, "mattress(?:es)?");
      if (mattQty) {
        let pick = null;
        if (/\bqueen\b/.test(text) && idx.mattQueen) pick = idx.mattQueen;
        else if (/\b(cal(?:ifornia)?\s*)?king\b/.test(text) && (idx.mattKingCal || idx.mattKing)) pick = idx.mattKingCal || idx.mattKing;
        else if (/\bfull\b/.test(text) && idx.mattFull) pick = idx.mattFull;
        else if (/\btwin\b/.test(text) && idx.mattTwin) pick = idx.mattTwin;
        else pick = idx.matt || idx.mattQueen;
        if (pick) qtyById.set(pick.id, (qtyById.get(pick.id)||0) + mattQty);
      }

      // exact-name for everything else
      const familyWord = /(sofa|couch|loveseat|sectional|treadmill|mattress)/;
      const others = ITEMS.filter(it => !familyWord.test(norm(it.name)));
      const matchers = buildExactNameMatchers(others);
      for (const m of matchers) {
        m.re.lastIndex = 0;
        let hit;
        while ((hit = m.re.exec(text)) !== null) {
          const qty = Math.max(1, parseInt(hit[1] || "1", 10));
          qtyById.set(m.id, (qtyById.get(m.id) || 0) + qty);
        }
      }

      for (const it of ITEMS) {
        const qty = qtyById.get(it.id) || 0;
        if (!qty) continue;
        cart.push({
          id: it.id, name: it.name, qty,
          volume: (Number(it.volume)||0) * qty,
          price:  (Number(it.price)||0) * qty
        });
      }
    }

    // nothing parsed at all
    if (!cart.length) {
      return res.status(200).json({
        reply: `Tell me items like “2 couches + treadmill + queen mattress”. I’ll total the volume and price using our catalog.`,
        parsed: { cart: [], finalPrice: 0, totalVolume: 0, loadLabel: "Empty" }
      });
    }

    // price with your rules
    const { calculatePrice, fullLoadPoints, getLoadLabel } = pricing;
    const { finalPrice, totalVolume } = calculatePrice(cart);
    const loadLabel = getLoadLabel(totalVolume);

    // === Minimal change: clean output (no load label, no % of next, no points) ===
    const bullets = cart.map(li => `• ${li.qty}× ${li.name}`).join("\n");
    const totalLine = `Estimated total: $${finalPrice.toFixed(2)}`;
    const estimateText = `${bullets}\n\n${totalLine}`;
    const reply = (mode === "both" && chatLine) ? `${chatLine}\n\n${estimateText}` : estimateText;

    return res.status(200).json({
      reply,
      parsed: { cart, finalPrice: Math.round(finalPrice*100)/100, totalVolume, loadLabel }
    });

  } catch (e) {
    console.error("[/api/chat] error:", e);
    res.setHeader("X-Error", String(e?.message || e));
    return res.status(500).json({ error:"chat_error", detail:String(e?.message||e) });
  }
}
