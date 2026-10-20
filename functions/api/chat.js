import itemData from "../../src/data/itemData.js";
import { calculatePrice, getLoadLabel } from "../../src/utils/pricing.js";

let OPENAI_PROJECT = "";
let OPENAI_ORG = "";

// api/chat.js — Conversational router + AI-first estimator with your pricing + itemData
let OPENAI_API_KEY = "";
let POINTS_PER_CUFT = 1; // points == cu ft by default

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
  if (OPENAI_PROJECT) h["OpenAI-Project"] = OPENAI_PROJECT.trim();
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

\nfunction jsonResponse(data, status = 200, extraHeaders = {}) {\n  return new Response(JSON.stringify(data), {\n    status,\n    headers: {\n      "Content-Type": "application/json",\n      "Cache-Control": "no-store",\n      "Access-Control-Allow-Origin": "*",\n      "Access-Control-Allow-Headers": "Content-Type",\n      "Access-Control-Allow-Methods": "POST,OPTIONS",\n      "Access-Control-Expose-Headers": "X-AI, X-Catalog, X-Error, X-Mode",\n      ...extraHeaders,\n    },\n  });\n}\n\nexport async function onRequestOptions() {\n  return new Response(null, {\n    status: 204,\n    headers: {\n      "Access-Control-Allow-Origin": "*",\n      "Access-Control-Allow-Headers": "Content-Type",\n      "Access-Control-Allow-Methods": "POST,OPTIONS",\n    },\n  });\n}\n\nexport async function onRequestPost(context) {\n  const { request, env } = context;\n  OPENAI_API_KEY = env.OPENAI_API_KEY || "";\n  OPENAI_PROJECT = env.OPENAI_PROJECT || "";\n  OPENAI_ORG = env.OPENAI_ORG || "";\n  POINTS_PER_CUFT = Number(env.POINTS_PER_CUFT || 1);\n\n  try {\n    const body = await request.json().catch(() => ({}));\n    const messages = Array.isArray(body.messages) ? body.messages : [];\n    const lastRaw = messages[messages.length - 1]?.content || "";\n    const ITEMS = flattenCatalog(itemData);\n    const catalogNames = ITEMS.map((i) => i.name);\n\n    let mode = "estimate";\n    let chatLine = null;\n    let seedItems = [];\n    try {\n      const routed = await aiRoute(messages, catalogNames);\n      mode = routed.mode;\n      chatLine = routed.chat;\n      seedItems = Array.isArray(routed.items) ? routed.items : [];\n    } catch {}\n\n    const commonHeaders = {\n      "X-AI": OPENAI_API_KEY ? "on" : "off",\n      "X-Catalog": "/src/data/itemData.js",\n      "X-Mode": mode,\n    };\n\n    if (mode === "chat" && chatLine) {\n      return jsonResponse({\n        reply: chatLine,\n        parsed: { cart: [], finalPrice: 0, totalVolume: 0, loadLabel: "Empty" },\n      }, 200, commonHeaders);\n    }\n\n    let cart = [];\n    const addRows = async (rows) => {\n      for (const row of rows) {\n        const qty = Math.max(1, Number(row.qty || 1));\n        const dims = row.dims ? parseDims(row.dims) : parseDims(row.name);\n        const matched = bestCatalogMatch(row.name, ITEMS);\n        if (matched) {\n          cart.push({\n            id: matched.id,\n            name: matched.name,\n            qty,\n            volume: Number(matched.volume || 0) * qty,\n            price: Number(matched.price || 0) * qty,\n          });\n        } else {\n          let cuft = dimsToCuFt(dims);\n          if (cuft == null) cuft = await aiEstimateCuFt(row.name);\n          const points = Math.max(1, Math.min(300, cuft * POINTS_PER_CUFT)) * qty;\n          cart.push({\n            id: "unlisted-" + slug(row.name),\n            name: row.name,\n            qty,\n            volume: points,\n            price: 0,\n          });\n        }\n      }\n    };\n\n    if (seedItems.length) await addRows(seedItems);\n\n    if (!cart.length && lastRaw) {\n      try {\n        const aiItems = await aiParseItems(lastRaw, catalogNames);\n        if (aiItems.length) await addRows(aiItems);\n      } catch {}\n    }\n\n    if (!cart.length) {\n      return jsonResponse({\n        reply: "Tell me items like “2 couches + treadmill + queen mattress”. I’ll total the volume and price using our catalog.",\n        parsed: { cart: [], finalPrice: 0, totalVolume: 0, loadLabel: "Empty" },\n      }, 200, commonHeaders);\n    }\n\n    const result = calculatePrice(cart);\n    const finalPrice = result.finalPrice;\n    const totalVolume = result.totalVolume;\n    const loadLabel = getLoadLabel(totalVolume);\n    const bullets = cart.map((li) => "• " + li.qty + "× " + li.name).join("\n");\n    const estimateText = bullets + "\n\nEstimated total: $" + finalPrice.toFixed(2);\n    const reply = mode === "both" && chatLine ? chatLine + "\n\n" + estimateText : estimateText;\n\n    return jsonResponse({\n      reply,\n      parsed: {\n        cart,\n        finalPrice: Math.round(finalPrice * 100) / 100,\n        totalVolume,\n        loadLabel,\n      },\n    }, 200, commonHeaders);\n  } catch (e) {\n    return jsonResponse({ error: "chat_error", detail: String(e?.message || e) }, 500, {\n      "X-AI": OPENAI_API_KEY ? "on" : "off",\n      "X-Error": String(e?.message || e),\n    });\n  }\n}