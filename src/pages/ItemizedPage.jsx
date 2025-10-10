// File: src/pages/ItemizedPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { calculatePrice, getLoadLabel, fullLoadPoints } from "../utils/pricing";
import itemData from "../data/itemData";

const DISCOUNT_RATE = 0.10;
 
// use same session id scheme as ChatWidget so we can read the discount flag it sets
function getSessionId() {
  const key = "jb_chat_session";
  let s = localStorage.getItem(key);
  if (!s) {
    s = "sess_" + Math.random().toString(36).slice(2);
    localStorage.setItem(key, s);
  }
  return s;
}

function ItemizedPage() {
  const { cart, setCart } = useCart();
  const [search, setSearch] = useState("");
  const [cartVisible, setCartVisible] = useState(false);

  // discount is controlled by ChatWidget; we just reflect it here
  const sessionId = useMemo(getSessionId, []);
  const [discountApplied, setDiscountApplied] = useState(false);

  const navigate = useNavigate();

  // reflect discount flag from ChatWidget (stored in localStorage)
  useEffect(() => {
    const flag = localStorage.getItem(`jb_disc_on_${sessionId}`) === "1";
    setDiscountApplied(flag);

    const onStorage = (e) => {
      if (e.key === `jb_disc_on_${sessionId}`) {
        setDiscountApplied(e.newValue === "1");
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [sessionId]);

  const { finalPrice, totalVolume } = calculatePrice(cart);
  const totalWithDiscount = discountApplied
    ? Math.max(0, Math.round((finalPrice * (1 - DISCOUNT_RATE) + Number.EPSILON) * 100) / 100)
    : finalPrice;

  const truckFillPercent = ((totalVolume % fullLoadPoints) / fullLoadPoints) * 100;
  const loadLabel = getLoadLabel(totalVolume);

  const addToCart = (item) => setCart((prev) => [...prev, item]);
  const removeFromCart = (idx) => setCart((prev) => prev.filter((_, i) => i !== idx));

  const filteredData = itemData.map((section) => ({
    ...section,
    items: section.items.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    ),
  }));

  return (
    <div className="bg-black text-white min-h-screen p-6 pb-32">
      {/* Title */}
      <h1 className="text-4xl mb-6 text-center font-bold">
        <span className="text-white">Manually Select Junk</span>
        <br />
        <span className="jb-glow-text text-lg font-semibold">
          — or add instantly in seconds with the assistant
        </span>
      </h1>

      <style>{`
        @keyframes jbGlowText {
          0% {
            text-shadow:
              0 0 6px rgba(30,144,255,0.8),
              0 0 12px rgba(255,0,255,0.6);
            color: #ffffff;
          }
          50% {
            text-shadow:
              0 0 12px rgba(30,144,255,1),
              0 0 22px rgba(255,0,255,0.9);
            color: #FFD700;
          }
          100% {
            text-shadow:
              0 0 6px rgba(30,144,255,0.8),
              0 0 12px rgba(255,0,255,0.6);
            color: #ffffff;
          }
        }
        .jb-glow-text {
          display: inline-block;
          animation: jbGlowText 2.2s ease-in-out infinite;
        }
      `}</style>

      {/* Search & badges */}
      <div className="mb-6 max-w-2xl mx-auto">
        <div className="mt-4 mb-6 flex flex-wrap justify-center gap-3">
          <div className="compare-badge-silver">
            You Don’t Pay Until the Job Is Done
          </div>
          <div className="compare-badge-silver">
            Compare Prices Instantly in Cart
          </div>
        </div>
        <input
          type="text"
          placeholder="Search items..."
          className="w-full p-3 rounded-xl text-black"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Item Grid */}
      {filteredData.map((section, idx) =>
        section.items.length > 0 ? (
          <div key={idx} className="mb-10">
            <h2 className="text-2xl text-gold mb-4">{section.category}</h2>
            <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {section.items.map((item, i) => (
                <button
                  key={i}
                  className="item-card-button"
                  onClick={() => addToCart(item)}
                >
                  <div className="item-card-button-text">
                    <p className="font-semibold">{item.name}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : null
      )}

      {/* Cart Drawer */}
      {cartVisible && (
        <div className="fixed bottom-0 left-0 w-full sm:w-96 h-2/3 bg-gray-900 border-r border-gold z-50 flex flex-col">
          <div className="flex justify-between items-center p-4 border-b border-gold">
            <h2 className="text-gold font-bold">Your Cart</h2>
            <button
              onClick={() => setCartVisible(false)}
              className="text-white hover:text-gold"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-sm">
            {cart.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <p>{item.name}</p>
                <button
                  onClick={() => removeFromCart(idx)}
                  className="text-red-400 hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-gold bg-gray-800">
            <p className="text-sm text-gray-300 mb-1">Truck Fill: {loadLabel}</p>
            <div className="w-full bg-gray-700 h-2 rounded">
              <div
                style={{
                  width: `${truckFillPercent}%`,
                  backgroundColor: "#FFD700",
                }}
                className="h-2 rounded"
              ></div>
            </div>
            <p className="mt-3 text-lg font-bold">
              Total:{" "}
              {discountApplied
                ? `$${totalWithDiscount.toFixed(2)} (after 10% off)`
                : `$${finalPrice.toFixed(2)}`}
            </p>
            {discountApplied && (
              <p className="text-xs text-yellow-300 mt-1">
                10% discount is already attached to your account.
              </p>
            )}
            <button
              onClick={() => navigate("/schedule")}
              className="mt-4 w-full px-3 py-2 bg-gold text-black font-semibold rounded"
            >
              Continue to Schedule
            </button>
          </div>
        </div>
      )}

      {/* Floating Cart Button */}
      <button
        onClick={() => setCartVisible(true)}
        className="fixed bottom-6 left-6 px-4 py-2 bg-gold text-black font-semibold rounded shadow-lg hover:bg-yellow-500"
      >
        View Cart ({cart.length})
      </button>
    </div>
  );
}

export default ItemizedPage;
