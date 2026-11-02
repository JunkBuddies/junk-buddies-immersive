import itemData from "../../src/data/itemData.js";
import premiumItems from "../../src/data/premiumItems.js";
import { calculatePrice, getLoadLabel } from "../../src/utils/pricing.js";

const norm = (value = "") => String(value).toLowerCase().trim();
const slug = (value = "") =>
  norm(value).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

function flattenCatalog(groups = []) {
  return groups.flatMap((group) =>
    (group.items || []).map((item) => ({
      id: slug((group.category || "") + "-" + (item.name || "item")),
      name: item.name || "Item",
      price: Number(item.price || 0),
      volume: Number(item.volume || 0),
      category: group.category || "",
    }))
  );
}

function similarity(a = "", b = "") {
  const aa = norm(a);
  const bb = norm(b);
  if (!aa || !bb) return 0;
  if (aa === bb) return 1;
  if (aa.includes(bb) || bb.includes(aa)) {
    return Math.min(0.95, Math.min(aa.length, bb.length) / Math.max(aa.length, bb.length) + 0.35);
  }

  const aWords = new Set(aa.split(/\s+/).filter(Boolean));
  const bWords = new Set(bb.split(/\s+/).filter(Boolean));
  const overlap = [...aWords].filter((word) => bWords.has(word)).length;
  return overlap / Math.max(1, Math.max(aWords.size, bWords.size));
}

function bestCatalogMatch(label, items) {
  const aliases = {
    couch: "Couch / Loveseat",
    sofa: "Sofa",
    loveseat: "Couch / Loveseat",
    fridge: "Refrigerator",
    refrigerator: "Refrigerator",
    tv: "Television",
    rug: "Area Rug 6x9 or Smaller",
  };

  const lower = norm(label);
  if (aliases[lower]) {
    const exact = items.find((item) => item.name === aliases[lower]);
    if (exact) return exact;
  }

  let best = null;
  let bestScore = 0;

  for (const item of items) {
    const score = similarity(label, item.name);
    if (score > bestScore) {
      bestScore = score;
      best = item;
    }
  }

  return bestScore >= 0.62 ? best : null;
}

function parseDims(text = "") {
  const s = String(text).toLowerCase().replace(/,/g, " ");
  let match = s.match(
    /(\d+(?:\.\d+)?)\s*(?:ft|feet|')?\s*[x×]\s*(\d+(?:\.\d+)?)\s*(?:ft|feet|')?\s*[x×]\s*(\d+(?:\.\d+)?)\s*(?:ft|feet|')?/
  );
  if (match) {
    return {
      L: Number(match[1]),
      W: Number(match[2]),
      H: Number(match[3]),
      unit: /ft|feet|'/.test(match[0]) ? "ft" : "in",
    };
  }
  return null;
}

function dimsToCuFt(dims) {
  if (!dims?.L || !dims?.W || !dims?.H) return null;
  if (dims.unit === "ft") return dims.L * dims.W * dims.H;
  return (dims.L / 12) * (dims.W / 12) * (dims.H / 12);
}

function headers(env, extra = {}) {
  return {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "X-AI": env.OPENAI_API_KEY ? "on" : "off",
    ...extra,
  };
}

function json(data, env, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: headers(env, extra),
  });
}

async function openAIJson(env, messages) {
  if (!env.OPENAI_API_KEY) return null;

  const requestHeaders = {
    "Content-Type": "application/json",
    Authorization: "Bearer " + env.OPENAI_API_KEY,
  };

  if (env.OPENAI_PROJECT) {
    requestHeaders["OpenAI-Project"] = String(env.OPENAI_PROJECT).trim();
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: requestHeaders,
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0,
      response_format: { type: "json_object" },
      messages,
    }),
  });

  if (!response.ok) {
    throw new Error("OpenAI request failed with status " + response.status);
  }

  const body = await response.json();
  const text = body.choices?.[0]?.message?.content || "{}";
  return JSON.parse(text);
}

async function extractItems(env, userText, catalogNames) {
  const prompt = [
    "Extract junk-removal items from the customer's message.",
    "Return strict JSON only:",
    '{"items":[{"name":"string","qty":1,"dims":"optional dimensions or null"}]}',
    "Use the customer's wording when no exact catalog item is obvious.",
    "Do not invent cleanout contents.",
    "Catalog examples: " + catalogNames.slice(0, 160).join(", "),
  ].join("\n");

  const parsed = await openAIJson(env, [
    { role: "system", content: prompt },
    { role: "user", content: userText },
  ]);

  return Array.isArray(parsed?.items)
    ? parsed.items
        .map((item) => ({
          name: String(item?.name || "").trim(),
          qty: Math.max(1, Number(item?.qty || 1)),
          dims:
            typeof item?.dims === "string" && item.dims.trim()
              ? item.dims.trim()
              : null,
        }))
        .filter((item) => item.name)
    : [];
}

async function estimateTypicalCuFt(env, label) {
  const dims = parseDims(label);
  const measured = dimsToCuFt(dims);
  if (measured != null) return measured;

  if (!env.OPENAI_API_KEY) return 15;

  try {
    const parsed = await openAIJson(env, [
      {
        role: "system",
        content:
          'Estimate a realistic typical hauled cubic-foot size for one household/commercial item. Return JSON only: {"cuft":number}. Use an average real-world size, not an extreme.',
      },
      { role: "user", content: "Item: " + label },
    ]);

    const cuft = Number(parsed?.cuft);
    if (Number.isFinite(cuft) && cuft > 0) {
      return Math.max(1, Math.min(300, cuft));
    }
  } catch (error) {
    console.warn("Typical-size estimate failed:", error);
  }

  return 15;
}

function fallbackCatalogParse(text, items) {
  const lower = norm(text);
  const found = [];
  const used = new Set();

  for (const item of items) {
    const base = norm(item.name).split(" - ")[0].trim();
    if (base.length < 4 || !lower.includes(base) || used.has(item.name)) continue;

    found.push({
      name: item.name,
      qty: 1,
      dims: null,
    });
    used.add(item.name);
  }

  return found;
}

export async function onRequestOptions({ env }) {
  return new Response(null, {
    status: 204,
    headers: headers(env),
  });
}

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json().catch(() => ({}));
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const userText = String(messages[messages.length - 1]?.content || "").trim();

    if (!userText) {
      return json(
        {
          reply: "Tell me what you need removed.",
          parsed: { cart: [], finalPrice: 0, totalVolume: 0, loadLabel: "Empty" },
        },
        env
      );
    }

    const catalog = flattenCatalog([...itemData, premiumItems]);
    const catalogNames = catalog.map((item) => item.name);

    let extracted = [];
    try {
      extracted = await extractItems(env, userText, catalogNames);
    } catch (error) {
      console.warn("AI item extraction failed:", error);
    }

    if (!extracted.length) {
      extracted = fallbackCatalogParse(userText, catalog);
    }

    if (!extracted.length) {
      extracted = [{ name: userText, qty: 1, dims: null }];
    }

    const cart = [];

    for (const row of extracted) {
      const qty = Math.max(1, Number(row.qty || 1));
      const matched = bestCatalogMatch(row.name, catalog);

      if (matched) {
        cart.push({
          id: matched.id,
          name: matched.name,
          qty,
          volume: Number(matched.volume || 0) * qty,
          price: Number(matched.price || 0) * qty,
        });
        continue;
      }

      const labelWithDims = row.dims ? row.name + " " + row.dims : row.name;
      const cuft = await estimateTypicalCuFt(env, labelWithDims);
      const unitPoints = Math.max(1, Math.min(300, cuft * Number(env.POINTS_PER_CUFT || 1)));
      const unitPrice = Math.round(unitPoints * 2.22 * 100) / 100;

      cart.push({
        id: "unlisted-" + slug(row.name),
        name: row.name,
        qty,
        volume: unitPoints * qty,
        price: unitPrice * qty,
        pricingMode: "estimated",
      });
    }

    // Convert totals back to unit values only for pricing, because the public
    // cart payload keeps the historical total-by-row shape for compatibility.
    const pricingCart = cart.map((item) => ({
      ...item,
      volume: Number(item.volume || 0) / Math.max(1, Number(item.qty || 1)),
      price:
        item.price == null
          ? null
          : Number(item.price || 0) / Math.max(1, Number(item.qty || 1)),
    }));

    const result = calculatePrice(pricingCart);
    const finalPrice = Number(result.finalPrice || 0);
    const totalVolume = Number(result.totalVolume || 0);

    return json(
      {
        reply: "Estimated total: $" + finalPrice.toFixed(2),
        parsed: {
          cart,
          finalPrice: Math.round(finalPrice * 100) / 100,
          totalVolume,
          loadLabel: getLoadLabel(totalVolume),
          customQuote: Boolean(result.customQuote),
          customOnly: Boolean(result.customOnly),
        },
      },
      env,
      200,
      { "X-Catalog": "standard+premium" }
    );
  } catch (error) {
    console.error("[functions/api/chat] error:", error);
    return json(
      {
        error: "chat_error",
        detail: String(error?.message || error),
      },
      env,
      500,
      { "X-Error": String(error?.message || error) }
    );
  }
}
