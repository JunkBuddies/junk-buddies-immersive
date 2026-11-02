// File: src/utils/pricing.js

export const fullLoadPoints = 450;
export const pricePerPoint = 2.22;
export const minimumPrice = 150;
export const quarterLoadThreshold = fullLoadPoints * 0.25;
export const quarterLoadPrice = 250;
export const transitionFloorPrice = 250;

const qty = (item) => Math.max(1, Number(item?.qty || 1));
const nameOf = (item) => String(item?.name || "").toLowerCase();

function tierUnit(count, tiers) {
  for (const tier of tiers) {
    if (count <= tier.max) return tier.unit;
  }
  return tiers[tiers.length - 1].unit;
}

export function premiumType(item) {
  const name = nameOf(item);

  if (/cleanout/.test(name)) return "custom";
  if (/tractor|off[- ]?road|commercial tire|semi tire|box truck tire/.test(name)) return "custom";
  if (/oil[- ]?based paint|industrial paint|bulk paint/.test(name)) return "custom";
  if (/propane tank - 120|propane tank - 250|large propane/.test(name)) return "custom";
  if (/concrete|dirt|soil|brick|shingle|roofing|gravel/.test(name)) return "custom";
  if (/hot tub|piano|pool table|safe - large/.test(name)) return "custom";

  if (/automotive rim and tire|tire.*rim|rim.*tire/.test(name)) return "tire-rim";
  if (/\btire\b/.test(name)) return "tire";
  if (/paint.*5 gallon|5 gallon.*paint/.test(name)) return "paint-5";
  if (/paint/.test(name)) {
    if (/dry/.test(name)) return "paint-dry";
    return "paint-wet";
  }
  if (/proof of disposal/.test(name)) return "proof-disposal";
  if (/proof of recycling/.test(name)) return "proof-recycling";
  if (/propane tank - 20\s*lb|20\s*lb.*propane/.test(name)) return "propane-20";
  if (/window unit|window ac|air conditioner/.test(name)) return "window-ac";
  if (/refrigerator|freezer/.test(name)) return "refrigerant";
  if (/crt|tube tv|projection tv/.test(name)) return "tv-crt";
  if (/television|\btv\b/.test(name)) return "tv-flat";
  if (/computer monitor/.test(name)) return "monitor";
  if (/desktop computer/.test(name)) return "desktop";
  if (/laptop/.test(name)) return "laptop";
  if (/printer/.test(name)) return "printer";
  if (/electronics/.test(name)) return "ewaste";

  return null;
}

const PREMIUM_TIERS = {
  tire: [
    { max: 1, unit: 35 },
    { max: 4, unit: 25 },
    { max: 9, unit: 20 },
    { max: Infinity, unit: 17 },
  ],
  "tire-rim": [
    { max: 1, unit: 45 },
    { max: 4, unit: 38 },
    { max: 9, unit: 32 },
    { max: Infinity, unit: 28 },
  ],
  "paint-dry": [
    { max: 1, unit: 10 },
    { max: 4, unit: 8 },
    { max: 9, unit: 7 },
    { max: Infinity, unit: 6 },
  ],
  "paint-wet": [
    { max: 1, unit: 15 },
    { max: 4, unit: 12 },
    { max: 9, unit: 10 },
    { max: Infinity, unit: 8 },
  ],
  "paint-5": [
    { max: 1, unit: 40 },
    { max: 3, unit: 35 },
    { max: 7, unit: 30 },
    { max: Infinity, unit: 25 },
  ],
  "propane-20": [
    { max: 1, unit: 30 },
    { max: 4, unit: 25 },
    { max: Infinity, unit: 20 },
  ],
  refrigerant: [
    { max: 1, unit: 125 },
    { max: 3, unit: 105 },
    { max: Infinity, unit: 95 },
  ],
  "window-ac": [
    { max: 1, unit: 85 },
    { max: 3, unit: 75 },
    { max: Infinity, unit: 65 },
  ],
  "tv-flat": [
    { max: 1, unit: 70 },
    { max: 4, unit: 50 },
    { max: Infinity, unit: 40 },
  ],
  "tv-crt": [
    { max: 1, unit: 100 },
    { max: 4, unit: 85 },
    { max: Infinity, unit: 75 },
  ],
  monitor: [
    { max: 1, unit: 60 },
    { max: 4, unit: 40 },
    { max: Infinity, unit: 30 },
  ],
  desktop: [
    { max: 1, unit: 60 },
    { max: 4, unit: 40 },
    { max: Infinity, unit: 30 },
  ],
  laptop: [
    { max: 1, unit: 40 },
    { max: 4, unit: 30 },
    { max: Infinity, unit: 25 },
  ],
  printer: [
    { max: 1, unit: 55 },
    { max: 4, unit: 45 },
    { max: Infinity, unit: 35 },
  ],
  ewaste: [
    { max: 1, unit: 60 },
    { max: 4, unit: 40 },
    { max: Infinity, unit: 30 },
  ],
};

export function premiumUnitPrice(type, count = 1) {
  if (type === "proof-disposal") return 20;
  if (type === "proof-recycling") return 25;
  const tiers = PREMIUM_TIERS[type];
  return tiers ? tierUnit(count, tiers) : null;
}

export function premiumPriceSummary(cart = []) {
  const counts = {};
  let customQuote = false;

  for (const item of cart) {
    const type = premiumType(item);
    if (type === "custom") {
      customQuote = true;
      continue;
    }
    if (!type) continue;
    counts[type] = (counts[type] || 0) + qty(item);
  }

  let total = 0;
  const lines = [];

  for (const [type, count] of Object.entries(counts)) {
    const unitPrice = premiumUnitPrice(type, count);
    if (unitPrice == null) continue;
    const lineTotal = unitPrice * count;
    total += lineTotal;
    lines.push({ type, count, unitPrice, lineTotal });
  }

  return { total, lines, customQuote };
}

export function isCustomQuoteItem(item) {
  return premiumType(item) === "custom" || Boolean(item?.customQuote);
}

export function isFixedPriceAddon(item) {
  const type = premiumType(item);
  return Boolean(type && type !== "custom");
}

function basePriceFor(normalCart) {
  if (!normalCart.length) {
    return { finalPrice: 0, totalVolume: 0 };
  }

  const totalVolume = normalCart.reduce(
    (sum, item) => sum + Number(item?.volume || 0) * qty(item),
    0
  );

  const totalItemPrice = normalCart.reduce(
    (sum, item) => sum + Number(item?.price || 0) * qty(item),
    0
  );

  const highestSingleItemPrice = normalCart.reduce(
    (max, item) => Math.max(max, Number(item?.price || 0)),
    0
  );

  const volumePrice = totalVolume * pricePerPoint;

  // Single-item exception: a genuinely high-priced single item can exceed
  // the normal under-quarter cap.
  if (
    normalCart.length === 1 &&
    qty(normalCart[0]) === 1 &&
    highestSingleItemPrice > quarterLoadPrice
  ) {
    return { finalPrice: highestSingleItemPrice, totalVolume };
  }

  // Under 1/4 truck: charge the highest of item pricing, minimum pickup,
  // or volume pricing, but do not exceed $250 unless volume itself has
  // crossed the quarter-truck threshold.
  if (totalVolume < quarterLoadThreshold) {
    return {
      finalPrice: Math.min(
        quarterLoadPrice,
        Math.max(minimumPrice, totalItemPrice, volumePrice)
      ),
      totalVolume,
    };
  }

  // From 1/4 truck through just under a full truck, price directly by volume.
  if (totalVolume < fullLoadPoints) {
    return {
      finalPrice: Math.round(volumePrice * 100) / 100,
      totalVolume,
    };
  }

  // Full truck is exactly $1,000. Additional volume continues into
  // subsequent loads at the same 450-point / $1,000 relationship.
  const fullLoads = Math.floor(totalVolume / fullLoadPoints);
  const remainder = totalVolume % fullLoadPoints;

  return {
    finalPrice:
      fullLoads * 1000 +
      Math.round(remainder * pricePerPoint * 100) / 100,
    totalVolume,
  };
}

export function calculatePrice(cart = []) {
  const safeCart = Array.isArray(cart) ? cart : [];
  if (!safeCart.length) {
    return {
      finalPrice: 0,
      totalVolume: 0,
      fixedAddonTotal: 0,
      customQuote: false,
      premiumLines: [],
    };
  }

  const premium = premiumPriceSummary(safeCart);
  const normalCart = safeCart.filter((item) => !premiumType(item));
  const base = basePriceFor(normalCart);

  const hasPricedItems = normalCart.length > 0 || premium.total > 0;
  const pricedSubtotal = hasPricedItems
    ? normalCart.length
      ? base.finalPrice + premium.total
      : Math.max(minimumPrice, premium.total)
    : 0;

  return {
    finalPrice: pricedSubtotal,
    pricedSubtotal,
    totalVolume: safeCart.reduce(
      (sum, item) => sum + Number(item?.volume || 0),
      0
    ),
    fixedAddonTotal: premium.total,
    customQuote: premium.customQuote,
    customOnly: premium.customQuote && !hasPricedItems,
    premiumLines: premium.lines,
  };
}

export function getLoadLabel(volume) {
  if (volume === 0) return "Empty";
  const loadNum = Math.floor(volume / fullLoadPoints) + 1;
  const segment = volume % fullLoadPoints;
  if (segment === 0) return `Load ${loadNum}`;
  if (segment <= fullLoadPoints * 0.25) return `Load ${loadNum} - 1/4`;
  if (segment <= fullLoadPoints * 0.5) return `Load ${loadNum} - 1/2`;
  if (segment <= fullLoadPoints * 0.75) return `Load ${loadNum} - 3/4`;
  return `Load ${loadNum} - Full`;
}
