import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { calculatePrice } from "../utils/pricing";

export default function ScheduleCartEnhancer() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, setCart } = useCart();
  const [mountNode, setMountNode] = useState(null);
  const [lastRemoved, setLastRemoved] = useState(null);

  const cartSummary = useMemo(() => {
    return Object.values(
      cart.reduce((groups, item, index) => {
        const key = item.name || `Item-${index}`;
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

  const addOne = (summaryItem) => {
    setCart((prev) => {
      const source = prev.find((item) => item.name === summaryItem.name) || summaryItem.sample;
      if (!source) return prev;
      const sourceQty = Math.max(1, Number(source.qty || 1));
      const unitPrice = Number(source.price || 0) / sourceQty;
      const unitVolume = Number(source.volume || 0) / sourceQty;
      return [...prev, { ...source, qty: 1, price: unitPrice, volume: unitVolume }];
    });
  };

  const minusOne = (summaryItem) => {
    setCart((prev) => {
      const next = [...prev];
      const index = next.map((item) => item.name).lastIndexOf(summaryItem.name);
      if (index < 0) return prev;

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
        return next;
      }

      next.splice(index, 1);
      return next;
    });
  };

  const removeAll = (summaryItem) => {
    setCart((prev) => {
      const removed = prev.filter((item) => item.name === summaryItem.name);
      setLastRemoved({ name: summaryItem.name, items: removed });
      return prev.filter((item) => item.name !== summaryItem.name);
    });
  };

  const addAgain = () => {
    if (!lastRemoved?.items?.length) return;
    setCart((prev) => [...prev, ...lastRemoved.items]);
    setLastRemoved(null);
  };

  const resumeMirror = (relatedPrompt = "") => {
    let sessionId = localStorage.getItem("jb_chat_session");
    if (!sessionId) {
      sessionId = "sess_" + Math.random().toString(36).slice(2);
      localStorage.setItem("jb_chat_session", sessionId);
    }
    localStorage.setItem("jb_mirror_resume_" + sessionId, "more");
    if (relatedPrompt) localStorage.setItem("jb_mirror_related_prompt_" + sessionId, relatedPrompt);
    navigate("/");
  };

  const hasMattress = cart.some((item) => /mattress/i.test(item.name || ""));
  const hasBedSupport = cart.some((item) =>
    /(bed frame|bedframe|bed base|foundation|bunky board|side rail)/i.test(item.name || "")
  );

  return createPortal(
    <div className="bg-gray-800 text-white p-4 rounded-xl">
      <h2 className="text-lg font-bold mb-3">Your Cart:</h2>

      {cartSummary.length ? (
        <ul className="mb-3 divide-y divide-white/10">
          {cartSummary.map((item) => (
            <li key={item.key} className="flex items-center gap-3 py-3 first:pt-0">
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-white">
                  {item.name}
                  <span className="ml-2 text-gold">×{item.qty}</span>
                </div>
                <div className="mt-1 text-sm text-gray-400">${item.price.toFixed(2)}</div>
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                <button type="button" onClick={() => minusOne(item)} className="grid h-9 w-9 place-items-center rounded-lg border border-white/15 text-lg font-semibold text-white/65 transition hover:border-gold/60 hover:text-gold active:scale-95">−</button>
                <button type="button" onClick={() => addOne(item)} className="grid h-9 w-9 place-items-center rounded-lg border border-white/15 text-lg font-semibold text-white/65 transition hover:border-gold/60 hover:text-gold active:scale-95">+</button>
                <button type="button" onClick={() => removeAll(item)} className="ml-1 rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-white/65 transition hover:border-gold/60 hover:text-gold active:scale-95">Remove</button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-3 text-sm text-gray-400">Your cart is empty.</p>
      )}

      {lastRemoved && (
        <div className="mb-3 flex items-center justify-between rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/55">
          <span>{lastRemoved.name} removed</span>
          <button type="button" onClick={addAgain} className="font-semibold text-gold hover:text-white">Add again</button>
        </div>
      )}

      {hasMattress && !hasBedSupport && (
        <div className="mb-3 flex items-center justify-between gap-3 rounded-lg border border-[#c8b477]/20 bg-black/20 px-3 py-3">
          <div>
            <div className="text-sm font-semibold text-white/85">Have any bed frames or bases too?</div>
            <div className="mt-1 text-xs text-white/35">We can add them to the same pickup.</div>
          </div>
          <button type="button" onClick={() => resumeMirror("bed frame or bed base")} className="shrink-0 rounded-lg border border-gold/40 px-3 py-2 text-xs font-semibold text-gold transition hover:border-gold hover:bg-gold/10">Add</button>
        </div>
      )}

      <p className="font-bold">Total: ${finalPrice.toFixed(2)}</p>
      <p className="mt-2 italic text-[#e0cf91]">You don't pay until the job is done!</p>
    </div>,
    mountNode
  );
}
