// File: src/utils/pricing.js

export const fullLoadPoints = 550;
export const pricePerPoint = 1.82;
export const minimumPrice = 100;
export const quarterLoadThreshold = fullLoadPoints * 0.25; // 137.5
export const quarterLoadPrice = 250;
export const transitionFloorPrice = 200;

const FIXED_ADDON_PATTERNS = [
  /\bpaint\b/i,
  /\btire\b/i,
  /\bpropane tank\b/i,
  /proof of disposal/i,
  /proof of recycling/i,
  /^mileage$/i,
  /^moving fee/i,
];

export function isCustomQuoteItem(item) {
  return Boolean(item?.customQuote) || /cleanout/i.test(String(item?.name || ""));
}

export function isFixedPriceAddon(item) {
  if (item?.pricingMode === "fixed") return true;
  const name = String(item?.name || "");
  return FIXED_ADDON_PATTERNS.some((pattern) => pattern.test(name));
}

function basePriceFor(normalCart) {
  const totalVolume = normalCart.reduce(
    (sum, item) => sum + Number(item?.volume || 0),
    0
  );
  const totalItemPrice = normalCart.reduce(
    (sum, item) => sum + Number(item?.price || 0),
    0
  );
  const highestItemPrice = normalCart.reduce(
    (max, item) => Math.max(max, Number(item?.price || 0)),
    0
  );

  if (!normalCart.length) {
    return { finalPrice: minimumPrice, totalVolume: 0 };
  }

  const volumePrice = totalVolume * pricePerPoint;

  if (normalCart.length === 1 && highestItemPrice > quarterLoadPrice) {
    return { finalPrice: highestItemPrice, totalVolume };
  }

  if (totalVolume < quarterLoadThreshold) {
    if (totalItemPrice < quarterLoadPrice) {
      return {
        finalPrice: Math.max(minimumPrice, totalItemPrice),
        totalVolume,
      };
    }

    return {
      finalPrice: Math.max(transitionFloorPrice, volumePrice),
      totalVolume,
    };
  }

  const fullLoads = Math.floor(totalVolume / fullLoadPoints);
  const remainder = totalVolume % fullLoadPoints;
  const remainderCost = remainder * pricePerPoint;

  if (fullLoads === 0) {
    const tiers = [
      { point: quarterLoadThreshold, price: 250 },
      { point: fullLoadPoints * 0.5, price: 500 },
      { point: fullLoadPoints * 0.75, price: 750 },
      { point: fullLoadPoints, price: 1000 },
    ];

    for (const tier of tiers) {
      if (totalVolume > tier.point && totalVolume <= tier.point + 10) {
        return { finalPrice: tier.price, totalVolume };
      }
    }

    return { finalPrice: volumePrice, totalVolume };
  }

  return {
    finalPrice: fullLoads * 1000 + remainderCost,
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
    };
  }

  const customItems = safeCart.filter(isCustomQuoteItem);
  if (customItems.length) {
    return {
      finalPrice: null,
      totalVolume: safeCart.reduce(
        (sum, item) => sum + Number(item?.volume || 0),
        0
      ),
      fixedAddonTotal: safeCart
        .filter(isFixedPriceAddon)
        .reduce((sum, item) => sum + Number(item?.price || 0), 0),
      customQuote: true,
      customItems,
    };
  }

  const fixedAddons = safeCart.filter(isFixedPriceAddon);
  const normalCart = safeCart.filter((item) => !isFixedPriceAddon(item));
  const fixedAddonTotal = fixedAddons.reduce(
    (sum, item) => sum + Number(item?.price || 0),
    0
  );

  // Fixed disposal/premium items are added on top of the normal pickup calculation.
  // If the entire pickup is premium items, the normal pickup minimum still applies.
  const base = basePriceFor(normalCart);

  return {
    finalPrice: base.finalPrice + fixedAddonTotal,
    totalVolume: safeCart.reduce(
      (sum, item) => sum + Number(item?.volume || 0),
      0
    ),
    fixedAddonTotal,
    customQuote: false,
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
