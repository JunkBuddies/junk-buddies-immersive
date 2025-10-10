// File: src/utils/pricing.js

export const fullLoadPoints = 550;
export const pricePerPoint = 1.82;
export const minimumPrice = 100;
export const quarterLoadThreshold = fullLoadPoints * 0.25; // 137.5
export const quarterLoadPrice = 250;

export function calculatePrice(cart) {
  const totalVolume = cart.reduce((sum, item) => sum + item.volume, 0);
  const totalItemPrice = cart.reduce((sum, item) => sum + item.price, 0);
  const highestItemPrice = cart.reduce((max, item) => Math.max(max, item.price), 0);

  const volumePrice = totalVolume * pricePerPoint;

  // ✅ NEW: If cart is empty, total must be 0
  if (totalVolume === 0) {
    return { finalPrice: 0, totalVolume };
  }

  // ✅ 1) Single high-value item rule
  if (cart.length === 1 && highestItemPrice > quarterLoadPrice) {
    return { finalPrice: highestItemPrice, totalVolume };
  }

  // ✅ 2) UNDER 1/4 load logic
  if (totalVolume < quarterLoadThreshold) {
    if (totalItemPrice < quarterLoadPrice) {
      // Still under $250 – use higher of min or item price
      return { finalPrice: Math.max(minimumPrice, totalItemPrice), totalVolume };
    } else {
      // Crossed $250 → switch entirely to volume-based pricing
      return { finalPrice: volumePrice, totalVolume };
    }
  }

  // ✅ 3) 1/4 load and above – tier snapping for FIRST truck only
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

    // If not within rounding zone → fall back to raw volume
    return { finalPrice: volumePrice, totalVolume };
  }

  // ✅ 4) MULTIPLE TRUCKS → flat 1000 per full + cubic on remainder
  return {
    finalPrice: fullLoads * 1000 + remainderCost,
    totalVolume,
  };
}

// ✅ Needed for load bar labeling and UI
export function getLoadLabel(volume) {
  if (volume === 0) return 'Empty';
  const loadNum = Math.floor(volume / fullLoadPoints) + 1;
  const segment = volume % fullLoadPoints;
  if (segment === 0) return `Load ${loadNum}`;
  if (segment <= fullLoadPoints * 0.25) return `Load ${loadNum} - 1/4`;
  if (segment <= fullLoadPoints * 0.5) return `Load ${loadNum} - 1/2`;
  if (segment <= fullLoadPoints * 0.75) return `Load ${loadNum} - 3/4`;
  return `Load ${loadNum} - Full`;
}
