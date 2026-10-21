import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { calculatePrice } from "../utils/pricing";
import itemData from "../data/itemData";

const catalogItems = itemData.flatMap((section) => section.items);

function catalogItem(name) {
  return catalogItems.find((item) => item.name === name) || null;
}

function bedSizeFromName(name = "") {
  const value = name.toLowerCase();
  if (value.includes("king/cal king") || value.includes("cal king") || value.includes("king")) return "king";
  if (value.includes("queen")) return "queen";
  if (value.includes("full")) return "full";
  if (value.includes("twin")) return "twin";
  if (value.includes("crib")) return "crib";
  return "";
}

function relatedCatalogItems(name = "") {
  const lower = name.toLowerCase();
  const results = [];

  const add = (label, itemName) => {
    const item = catalogItem(itemName);
    if (item && !results.some((entry) => entry.item.name === item.name)) {
      results.push({ label, item });
    }
  };

  const isMattress =
    lower === "mattress" ||
    /^mattress - /.test(lower);

  const isBedSupport =
    /bed frame|bed base|bed foundation|adjustable bed base/.test(lower);

  if (isMattress) {
    const size = bedSizeFromName(name);

    if (size === "king") {
      add("Bed frame", "Bed Frame - King/Cal King");
      add("Bed base / foundation", "Bed Base/Foundation - King/Cal King");
    } else if (size === "queen") {
      add("Bed frame", "Bed Frame - Full/Queen");
      add("Bed base / foundation", "Bed Base/Foundation - Queen");
    } else if (size === "full") {
      add("Bed frame", "Bed Frame - Full/Queen");
      add("Bed base / foundation", "Bed Base/Foundation - Full");
    } else if (size === "twin") {
      add("Bed frame", "Bed Frame - Twin");
      add("Bed base / foundation", "Bed Base/Foundation - Twin");
    } else if (!size) {
      add("Bed frame", "Bed Frame");
      add("Bed foundation", "Bed Foundation");
    }
  }

  if (isBedSupport) {
    const size = bedSizeFromName(name);

    if (lower.includes("full/queen")) {
      add("Full mattress", "Mattress - Full");
      add("Queen mattress", "Mattress - Queen");
    } else if (size === "king") {
      add("Matching mattress", "Mattress - King/Cal King");
    } else if (size === "queen") {
      add("Matching mattress", "Mattress - Queen");
    } else if (size === "full") {
      add("Matching mattress", "Mattress - Full");
    } else if (size === "twin") {
      add("Matching mattress", "Mattress - Twin");
    } else {
      add("Mattress", "Mattress");
    }
  }

  if (/(couch|sofa|loveseat|sectional)/i.test(name)) {
    add("Ottoman", "Ottoman");
  }

  if (name === "Ottoman") {
    add("Couch / loveseat", "Couch / Loveseat");
    add("Sofa", "Sofa");
  }

  if (name === "Washer") add("Dryer", "Dryer");
  if (name === "Dryer") add("Washer", "Washer");

  if (/^Television/.test(name)) add("TV stand", "TV Stand");
  if (name === "TV Stand") add("Television", "Television");

  return results;
}

export default function ScheduleCartEnhancer() {
  const location = useLocation();
  const { cart, setCart } = useCart();
  const [mountNode, setMountNode] = useState(null);
  const [lastRemoved, setLastRemoved] = useState(null);
  const [openRelated, setOpenRelated] = useState({});

  const cartSummary = useMemo(() => {
    return Object.values(
      cart.reduce((groups, item, index) => {
        const key = item.name || "Item-" + index;
        const qty = Math.max(1, Number(item.qty || 1));

        if (!groups[key]) {
          groups[key] = {
            key,
            name: item.name || "Item",
            qty: 0,
            price: 0,
            volume: 0,
            sample: item,
          };
        }

        groups[key].qty += qty;
        groups[key].price += Number(item.price || 0);
        groups[key].volume += Number(item.volume || 0);
        return groups;
      }, {})
    );
  }, [cart]);

  const { finalPrice } = calculatePrice(cart);

  useEffect(() => {
    if (location.pathname !== "/schedule") {
      setMountNode(null);
      return;
    }

    let cancelled = false;

    const install = () => {
      const headings = Array.from(document.querySelectorAll("h2"));
      const heading = headings.find((node) => node.textContent?.trim() === "Your Cart:");
      const original = heading?.closest(".bg-gray-800");

      if (!original || cancelled) return false;

      let host = document.getElementById("jb-schedule-cart-enhancer");
      if (!host) {
        host = document.createElement("div");
        host.id = "jb-schedule-cart-enhancer";
        original.parentNode?.insertBefore(host, original);
      }

      original.style.display = "none";
      setMountNode(host);
      return true;
    };

    if (install()) return () => { cancelled = true; };

    const observer = new MutationObserver(() => {
      if (install()) observer.disconnect();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [location.pathname]);

  if (location.pathname !== "/schedule" || !mountNode) return null;

  const quantityFor = (name) =>
    cart.reduce(
      (sum, item) =>
        item.name === name ? sum + Math.max(1, Number(item.qty || 1)) : sum,
      0
    );

  const addOneFromSource = (source) => {
    if (!source) return;

    const sourceQty = Math.max(1, Number(source.qty || 1));
    const unitPrice = Number(source.price || 0) / sourceQty;
    const unitVolume = Number(source.volume || 0) / sourceQty;

    setCart((prev) => [
      ...prev,
      {
        ...source,
        qty: 1,
        price: unitPrice,
        volume: unitVolume,
      },
    ]);
  };

  const addOne = (summaryItem) => {
    const source =
      cart.find((item) => item.name === summaryItem.name) ||
      summaryItem.sample;
    addOneFromSource(source);
  };

  const addCatalogItem = (item) => {
    addOneFromSource(item);
  };

  const minusOneByName = (name) => {
    const currentMatching = cart.filter((item) => item.name === name);
    if (!currentMatching.length) return;

    const next = [...cart];
    const index = next.map((item) => item.name).lastIndexOf(name);
    if (index < 0) return;

    const source = next[index];
    const sourceQty = Math.max(1, Number(source.qty || 1));

    if (sourceQty > 1) {
      const unitPrice = Number(source.price || 0) / sourceQty;
      const unitVolume = Number(source.volume || 0) / sourceQty;

      next[index] = {
        ...source,
        qty: sourceQty - 1,
        price: unitPrice * (sourceQty - 1),
        volume: unitVolume * (sourceQty - 1),
      };

      setCart(next);
      return;
    }

    const removedItem = next[index];
    next.splice(index, 1);
    setCart(next);

    if (quantityFor(name) === 1) {
      setLastRemoved({
        name,
        items: [removedItem],
      });
    }
  };

  const minusOne = (summaryItem) => minusOneByName(summaryItem.name);

  const removeAllByName = (name) => {
    const removedItems = cart.filter((item) => item.name === name);
    if (!removedItems.length) return;

    setLastRemoved({
      name,
      items: removedItems.map((item) => ({ ...item })),
    });

    setCart((prev) => prev.filter((item) => item.name !== name));
  };

  const removeAll = (summaryItem) => removeAllByName(summaryItem.name);

  const addAgain = () => {
    if (!lastRemoved?.items?.length) return;

    const restore = lastRemoved.items.map((item) => ({ ...item }));
    setCart((prev) => [...prev, ...restore]);
    setLastRemoved(null);
  };

  const toggleRelated = (name) => {
    setOpenRelated((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  return createPortal(
    <div className="rounded-xl bg-gray-800 p-4 text-white">
      <h2 className="mb-3 text-lg font-bold">Your Cart:</h2>

      {cartSummary.length ? (
        <ul className="mb-3 divide-y divide-white/10">
          {cartSummary.map((item) => {
            const related = relatedCatalogItems(item.name);

            return (
              <li key={item.key} className="py-3 first:pt-0">
                <div className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-white">
                      {item.name}
                      <span className="ml-2 text-gold">×{item.qty}</span>
                    </div>
                    <div className="mt-1 text-sm text-gray-400">
                      \${item.price.toFixed(2)}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => minusOne(item)}
                      className="grid h-9 w-9 place-items-center rounded-lg border border-white/15 text-lg font-semibold text-white/65 transition hover:border-gold/60 hover:text-gold active:scale-95"
                    >
                      −
                    </button>
                    <button
                      type="button"
                      onClick={() => addOne(item)}
                      className="grid h-9 w-9 place-items-center rounded-lg border border-white/15 text-lg font-semibold text-white/65 transition hover:border-gold/60 hover:text-gold active:scale-95"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => removeAll(item)}
                      className="ml-1 rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-white/65 transition hover:border-gold/60 hover:text-gold active:scale-95"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {related.length > 0 && (
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => toggleRelated(item.name)}
                      className="flex items-center gap-2 text-xs font-semibold text-[#e0cf91] transition hover:text-white"
                    >
                      <span>{openRelated[item.name] ? "Hide related items" : "Any related items?"}</span>
                      <span className={"transition-transform " + (openRelated[item.name] ? "rotate-180" : "")}>⌄</span>
                    </button>

                    {openRelated[item.name] && (
                      <div className="mt-2 space-y-2 rounded-xl border border-[#c8b477]/15 bg-black/20 p-3">
                        {related.map(({ label, item: relatedItem }) => {
                          const relatedQty = quantityFor(relatedItem.name);

                          return (
                            <div
                              key={relatedItem.name}
                              className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.08] bg-white/[0.025] px-3 py-2.5"
                            >
                              <div className="min-w-0">
                                <div className="text-sm font-semibold text-white/90">
                                  {label}
                                </div>
                                <div className="mt-0.5 text-xs text-white/35">
                                  {relatedItem.name}
                                  {relatedQty > 0 ? (
                                    <span className="ml-2 text-[#e0cf91]">×{relatedQty}</span>
                                  ) : null}
                                </div>
                              </div>

                              {relatedQty > 0 ? (
                                <div className="flex shrink-0 items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => minusOneByName(relatedItem.name)}
                                    className="grid h-8 w-8 place-items-center rounded-lg border border-white/15 text-base font-semibold text-white/65 transition hover:border-gold/60 hover:text-gold"
                                  >
                                    −
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => addCatalogItem(relatedItem)}
                                    className="grid h-8 w-8 place-items-center rounded-lg border border-white/15 text-base font-semibold text-white/65 transition hover:border-gold/60 hover:text-gold"
                                  >
                                    +
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => removeAllByName(relatedItem.name)}
                                    className="rounded-lg border border-white/15 px-2.5 py-1.5 text-[11px] font-semibold text-white/55 transition hover:border-gold/60 hover:text-gold"
                                  >
                                    Remove
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => addCatalogItem(relatedItem)}
                                  className="shrink-0 rounded-lg border border-[#c8b477]/35 px-3 py-2 text-xs font-semibold text-[#e0cf91] transition hover:border-[#e0cf91] hover:bg-[#c8b477]/10 hover:text-white"
                                >
                                  Add
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mb-3 text-sm text-gray-400">Your cart is empty.</p>
      )}

      {lastRemoved && (
        <div className="mb-3 flex items-center justify-between rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/55">
          <span>{lastRemoved.name} removed</span>
          <button
            type="button"
            onClick={addAgain}
            className="font-semibold text-gold transition hover:text-white"
          >
            Add again
          </button>
        </div>
      )}

      <p className="font-bold">Total: \${finalPrice.toFixed(2)}</p>
      <p className="mt-2 italic text-[#e0cf91]">
        You don't pay until the job is done!
      </p>
    </div>,
    mountNode
  );
}
