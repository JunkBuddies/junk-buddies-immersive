import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { useCart } from "../context/CartContext";
import { calculatePrice, minimumPrice } from "../utils/pricing";
import { db } from "../lib/firebase";

const STEPS = ["Contact", "Property", "Date & time", "Review"];
const WINDOWS = [
  { label: "Morning", value: "7:00 AM – 12:00 PM", sub: "7 AM – 12 PM" },
  { label: "Afternoon", value: "12:00 PM – 5:00 PM", sub: "12 PM – 5 PM" },
  { label: "Evening", value: "5:00 PM – 9:00 PM", sub: "5 PM – 9 PM" },
];

const makeDates = () =>
  Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() + index);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return {
      value: year + "-" + month + "-" + day,
      label:
        index === 0
          ? "Today"
          : index === 1
          ? "Tomorrow"
          : date.toLocaleDateString("en-US", { weekday: "short" }),
      sub: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    };
  });

export default function SchedulePremiumPage() {
  const { cart } = useCart();
  const navigate = useNavigate();
  const stepRef = useRef(null);
  const { finalPrice: rawFinalPrice } = calculatePrice(cart);

  const sessionId = localStorage.getItem("jb_chat_session") || "";
  const discountActive =
    sessionId && localStorage.getItem("jb_disc_on_" + sessionId) === "1";

  const finalPrice = discountActive
    ? Math.round(rawFinalPrice * 0.9 * 100) / 100
    : rawFinalPrice;

  const itemSubtotal = cart.reduce(
    (sum, item) => sum + Number(item.price || 0),
    0
  );
  const minimumApplied =
    rawFinalPrice === minimumPrice && itemSubtotal < minimumPrice;
  const discountSavings = Math.max(0, rawFinalPrice - finalPrice);

  const dates = useMemo(makeDates, []);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "TX",
    zip: "",
    date: "",
    time: "",
  });

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
          };
        }

        groups[key].qty += qty;
        groups[key].price += Number(item.price || 0);
        return groups;
      }, {})
    );
  }, [cart]);

  const fieldClass =
    "w-full rounded-2xl border border-white/10 bg-[#111111] px-4 py-3 text-base text-white placeholder:text-white/35 outline-none transition focus:border-[#c8b477] focus:ring-2 focus:ring-[#c8b477]/15 sm:py-3.5";

  const update = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
    setError("");
  };

  const validate = (target = step) => {
    if (
      target === 0 &&
      (!form.name.trim() || !form.email.trim() || !form.phone.trim())
    ) {
      return "Add your name, email, and phone number.";
    }

    if (
      target === 1 &&
      (!form.street.trim() || !form.city.trim() || !form.zip.trim())
    ) {
      return "Add the pickup address.";
    }

    if (target === 2 && (!form.date || !form.time)) {
      return "Choose a pickup date and arrival window.";
    }

    return "";
  };

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      if (stepRef.current) {
        stepRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });

    return () => cancelAnimationFrame(id);
  }, [step]);

  const goNext = () => {
    const message = validate();

    if (message) {
      setError(message);
      return;
    }

    setStep((current) => Math.min(current + 1, 3));
  };

  const goBack = () => {
    setError("");
    setStep((current) => Math.max(current - 1, 0));
  };

  const addMoreItems = () => {
    let id = localStorage.getItem("jb_chat_session");

    if (!id) {
      id = "sess_" + Math.random().toString(36).slice(2);
      localStorage.setItem("jb_chat_session", id);
    }

    localStorage.setItem("jb_mirror_resume_" + id, "more");
    navigate("/");
  };

  const formatDate = () => {
    if (!form.date) return "";

    const parts = form.date.split("-").map(Number);

    return new Date(
      parts[0],
      parts[1] - 1,
      parts[2]
    ).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  const submit = async () => {
    if (submitting) return;

    const message = validate(2);

    if (message) {
      setError(message);
      setStep(2);
      return;
    }

    setSubmitting(true);
    setError("");

    const orderNumber =
      "JB-" + Math.floor(100000 + Math.random() * 900000);
    const fullAddress =
      form.street +
      ", " +
      form.city +
      ", " +
      form.state +
      " " +
      form.zip;

    const timeOfDay = form.time.startsWith("7:00")
      ? "Morning"
      : form.time.startsWith("12:00")
      ? "Afternoon"
      : "Evening";

    try {
      await addDoc(collection(db, "jobs"), {
        ...form,
        fullAddress,
        timeOfDay,
        orderNumber,
        items: cart,
        total: finalPrice,
        discountActive: Boolean(discountActive),
        Latitude: null,
        Longitude: null,
        status: "Scheduled",
        bookingSource: "immersive-premium",
        createdAt: Timestamp.now(),
      });

      navigate("/confirmation", {
        state: {
          orderNumber,
          name: form.name,
          email: form.email,
          phone: form.phone,
          fullAddress,
          date: form.date,
          formattedDate: formatDate(),
          time: form.time,
          total: finalPrice,
          discountActive: Boolean(discountActive),
          itemCount: cartSummary.reduce(
            (sum, item) => sum + item.qty,
            0
          ),
        },
      });
    } catch (err) {
      console.error("Booking save failed:", err);
      setSubmitting(false);
      setError(
        "We could not lock in the booking yet. Try again or call 346-593-6080."
      );
    }
  };

  const PricingBridge = ({ compact = false }) => {
    if (minimumApplied) {
      return (
        <div
          className={
            compact
              ? "mt-3 border-t border-white/10 pt-3 text-xs leading-relaxed text-white/55"
              : "mt-4 rounded-xl border border-white/10 bg-black/25 p-3 text-xs leading-relaxed text-white/50"
          }
        >
          Items <span className="font-semibold text-white/75">{"$"}</span>
          {itemSubtotal.toFixed(2)}
          <span className="mx-1.5 text-white/25">→</span>
          minimum pickup <span className="font-semibold text-white/75">{"$"}</span>
          {minimumPrice.toFixed(2)}
          {discountActive && (
            <>
              <span className="mx-1.5 text-white/25">→</span>
              10% off ={" "}
              <b className="text-[#e0cf91]">
                {"$"}{finalPrice.toFixed(2)}
              </b>
            </>
          )}
        </div>
      );
    }

    if (discountActive) {
      return (
        <div
          className={
            compact
              ? "mt-3 border-t border-white/10 pt-3 text-xs leading-relaxed text-white/55"
              : "mt-4 rounded-xl border border-white/10 bg-black/25 p-3 text-xs leading-relaxed text-white/50"
          }
        >
          Regular total {"$"}{rawFinalPrice.toFixed(2)}
          <span className="mx-1.5 text-white/25">→</span>
          10% off{" "}
          <b className="text-[#e0cf91]">
            −{"$"}{discountSavings.toFixed(2)}
          </b>
        </div>
      );
    }

    return null;
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <section className="border-b border-white/10 bg-black/80 px-4 py-4 sm:px-6 sm:py-8">
        <div className="mx-auto max-w-5xl text-center">
          <span className="inline-flex rounded-full border border-[#c8b477]/30 bg-[#c8b477]/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#e0cf91] sm:text-xs">
            No payment today
          </span>

          <h1 className="mt-3 text-2xl font-black sm:mt-4 sm:text-5xl">
            Lock in your pickup.
          </h1>

          <p className="mx-auto mt-2 max-w-2xl text-sm text-white/50 sm:mt-3 sm:text-base">
            Four quick steps, a clear review, and you are done.
          </p>
        </div>
      </section>

      <section
        ref={stepRef}
        className="mx-auto max-w-7xl scroll-mt-20 px-4 py-4 sm:px-6 sm:py-10"
      >
        <div className="mx-auto grid max-w-4xl grid-cols-4 gap-2">
          {STEPS.map((label, index) => (
            <div key={label} className="min-w-0">
              <div
                className={
                  "h-1.5 rounded-full transition " +
                  (index <= step ? "bg-[#c8b477]" : "bg-white/10")
                }
              />
              <div
                className={
                  "mt-2 truncate text-[10px] font-semibold sm:text-sm " +
                  (index === step
                    ? "text-[#e0cf91]"
                    : "text-white/30")
                }
              >
                {label}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-5 sm:mt-7 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <section className="rounded-[24px] border border-white/10 bg-[#0b0b0b] p-4 shadow-2xl sm:rounded-[28px] sm:p-8">
            {step === 0 && (
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c8b477] sm:text-xs">
                  Step 1 of 4
                </div>
                <h2 className="mt-2 text-xl font-black sm:text-3xl">
                  Who should we keep updated?
                </h2>
                <p className="mt-1.5 text-xs text-white/45 sm:mt-2 sm:text-sm">
                  We will use this information for your pickup details.
                </p>

                <div className="mt-5 space-y-3 sm:mt-7 sm:space-y-4">
                  <input
                    className={fieldClass}
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="Your name"
                    autoComplete="name"
                  />
                  <input
                    className={fieldClass}
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="Email address"
                    type="email"
                    autoComplete="email"
                  />
                  <input
                    className={fieldClass}
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    placeholder="Phone number"
                    type="tel"
                    autoComplete="tel"
                  />
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c8b477] sm:text-xs">
                  Step 2 of 4
                </div>
                <h2 className="mt-2 text-xl font-black sm:text-3xl">
                  Where are we picking up?
                </h2>
                <p className="mt-1.5 text-xs text-white/45 sm:mt-2 sm:text-sm">
                  Enter the service address. We can confirm access details later.
                </p>

                <div className="mt-5 space-y-3 sm:mt-7 sm:space-y-4">
                  <input
                    className={fieldClass}
                    value={form.street}
                    onChange={(e) => update("street", e.target.value)}
                    placeholder="Street address"
                    autoComplete="street-address"
                  />

                  <div className="grid grid-cols-[1fr_76px_90px] gap-2 sm:grid-cols-[1fr_110px_120px] sm:gap-4">
                    <input
                      className={fieldClass}
                      value={form.city}
                      onChange={(e) => update("city", e.target.value)}
                      placeholder="City"
                    />
                    <select
                      className={fieldClass}
                      value={form.state}
                      onChange={(e) => update("state", e.target.value)}
                    >
                      <option value="TX">TX</option>
                    </select>
                    <input
                      className={fieldClass}
                      value={form.zip}
                      onChange={(e) => update("zip", e.target.value)}
                      placeholder="ZIP"
                      inputMode="numeric"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c8b477] sm:text-xs">
                  Step 3 of 4
                </div>
                <h2 className="mt-2 text-xl font-black sm:text-3xl">
                  Pick what works for you.
                </h2>
                <p className="mt-1.5 text-xs text-white/45 sm:mt-2 sm:text-sm">
                  Choose a preferred day and arrival window.
                </p>

                <div className="mt-5 flex gap-2 overflow-x-auto pb-1 sm:mt-7 sm:grid sm:grid-cols-3 sm:gap-3 sm:overflow-visible sm:pb-0">
                  {dates.map((date) => {
                    const active = form.date === date.value;

                    return (
                      <button
                        key={date.value}
                        type="button"
                        onClick={() => update("date", date.value)}
                        className={
                          "min-w-[88px] rounded-2xl border p-3 text-left transition sm:min-w-0 sm:p-4 " +
                          (active
                            ? "border-[#c8b477] bg-[#c8b477] text-black"
                            : "border-white/10 bg-white/[0.035] hover:border-[#c8b477]/50")
                        }
                      >
                        <div className="text-sm font-black sm:text-base">
                          {date.label}
                        </div>
                        <div
                          className={
                            "mt-0.5 text-xs " +
                            (active
                              ? "text-black/60"
                              : "text-white/40")
                          }
                        >
                          {date.sub}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <label className="mt-3 block sm:mt-4">
                  <span className="text-[10px] text-white/35 sm:text-xs">
                    Or choose another date
                  </span>
                  <input
                    type="date"
                    className={
                      fieldClass + " mt-1.5 [color-scheme:dark] sm:mt-2"
                    }
                    min={dates[0].value}
                    value={form.date}
                    onChange={(e) => update("date", e.target.value)}
                  />
                </label>

                <div className="mt-5 grid grid-cols-3 gap-2 sm:mt-7 sm:gap-3">
                  {WINDOWS.map((window) => {
                    const active = form.time === window.value;

                    return (
                      <button
                        key={window.value}
                        type="button"
                        onClick={() => update("time", window.value)}
                        className={
                          "rounded-2xl border p-3 text-center transition sm:p-4 sm:text-left " +
                          (active
                            ? "border-[#c8b477] bg-[#c8b477] text-black"
                            : "border-white/10 bg-white/[0.035] hover:border-[#c8b477]/50")
                        }
                      >
                        <div className="text-xs font-black sm:text-base">
                          {window.label}
                        </div>
                        <div
                          className={
                            "mt-1 text-[9px] leading-tight sm:text-xs " +
                            (active
                              ? "text-black/60"
                              : "text-white/40")
                          }
                        >
                          {window.sub}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c8b477] sm:text-xs">
                  Step 4 of 4
                </div>
                <h2 className="mt-2 text-xl font-black sm:text-3xl">
                  One last look.
                </h2>
                <p className="mt-1.5 text-xs text-white/45 sm:mt-2 sm:text-sm">
                  Nothing is charged today. Confirm the essentials below.
                </p>

                <div className="mt-5 space-y-2 sm:mt-7 sm:space-y-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3 sm:p-4">
                    <div className="text-[10px] uppercase tracking-wider text-white/30 sm:text-xs">Contact</div>
                    <div className="mt-1 text-sm font-bold sm:text-base">{form.name}</div>
                    <div className="text-xs text-white/50 sm:text-sm">{form.email} · {form.phone}</div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3 sm:p-4">
                    <div className="text-[10px] uppercase tracking-wider text-white/30 sm:text-xs">Pickup</div>
                    <div className="mt-1 text-sm font-bold sm:text-base">{form.street}</div>
                    <div className="text-xs text-white/50 sm:text-sm">{form.city}, {form.state} {form.zip}</div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3 sm:p-4">
                    <div className="text-[10px] uppercase tracking-wider text-white/30 sm:text-xs">Preferred time</div>
                    <div className="mt-1 text-sm font-bold sm:text-base">{formatDate()}</div>
                    <div className="text-xs text-white/50 sm:text-sm">{form.time}</div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-5 rounded-2xl border border-[#c8b477]/20 bg-[#c8b477]/[0.055] p-3 lg:hidden">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/35">Estimated total</div>
                  <div className="mt-0.5 text-2xl font-black text-[#e0cf91]">{"$"}{finalPrice.toFixed(2)}</div>
                </div>
                <button type="button" onClick={addMoreItems} className="text-xs font-bold text-[#e0cf91]">Edit items</button>
              </div>
              <PricingBridge compact />
            </div>

            {error && <div className="mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">{error}</div>}

            <div className="mt-5 flex gap-2 sm:mt-8 sm:gap-3">
              {step > 0 && <button type="button" onClick={goBack} className="rounded-2xl border border-white/15 px-4 py-3 font-bold text-white/70 sm:px-5 sm:py-3.5">Back</button>}
              {step < 3 ? (
                <button type="button" onClick={goNext} className="jb-polished-gold-button flex-1">Continue</button>
              ) : (
                <button type="button" onClick={submit} disabled={submitting || !cart.length} className="jb-polished-gold-button flex-1 disabled:cursor-not-allowed disabled:opacity-40">
                  {submitting ? "Locking it in…" : "Confirm Pickup"}
                </button>
              )}
            </div>

            <p className="mt-3 text-center text-[10px] text-white/30 sm:mt-4 sm:text-xs">You don't pay until the job is done.</p>
          </section>

          <aside className="hidden rounded-[28px] border border-[#c8b477]/20 bg-gradient-to-b from-[#15120a] to-[#090909] p-5 lg:sticky lg:top-24 lg:block">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-black">Your pickup</h2>
              <button type="button" onClick={addMoreItems} className="text-xs font-bold text-[#e0cf91] hover:text-white">Add more</button>
            </div>

            <div className="mt-5 max-h-64 space-y-3 overflow-y-auto pr-1">
              {cartSummary.length ? cartSummary.map((item) => (
                <div key={item.key} className="flex items-start justify-between gap-4 text-sm">
                  <span className="text-white/70">
                    {item.qty > 1 && <b className="text-[#e0cf91]">{item.qty}x </b>}
                    {item.name}
                  </span>
                  <span className="shrink-0 text-white/40">{"$"}{item.price.toFixed(2)}</span>
                </div>
              )) : <div className="text-sm text-white/40">Your cart is empty. Add items before scheduling.</div>}
            </div>

            <div className="mt-5 border-t border-white/10 pt-5">
              {discountActive && <div className="mb-3 inline-flex rounded-full border border-[#c8b477]/25 bg-[#c8b477]/10 px-3 py-1 text-xs font-bold text-[#e0cf91]">10% offer applied</div>}
              <div className="text-xs uppercase tracking-wider text-white/30">Estimated total</div>
              <div className="mt-1 text-3xl font-black text-[#e0cf91]">{"$"}{finalPrice.toFixed(2)}</div>
              <div className="mt-2 text-xs text-white/35">Pay after completion.</div>
              <PricingBridge />
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
