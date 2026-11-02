import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addDoc, collection, doc, getDoc, getDocs, limit, orderBy, query, Timestamp, where } from "firebase/firestore";
import { useCart } from "../context/CartContext";
import { calculatePrice, minimumPrice, premiumType, premiumUnitPrice } from "../utils/pricing";
import { db } from "../lib/firebase";
import { goToPriceMirror } from "../utils/mirrorNavigation";

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

async function getNextOrderNumber() {
  const jobsRef = collection(db, "jobs");
  const sequenceQuery = query(
    jobsRef,
    where("orderSequence", ">=", 330102),
    orderBy("orderSequence", "desc"),
    limit(1)
  );

  const snapshot = await getDocs(sequenceQuery);
  const latest = snapshot.empty
    ? 330101
    : Number(snapshot.docs[0].data().orderSequence || 330101);
  const next = Math.max(330101, latest) + 1;

  return {
    orderNumber: "JB-" + next,
    orderSequence: next,
  };
}

export default function SchedulePremiumPage() {
  const { cart, setCart } = useCart();
  const navigate = useNavigate();
  const stepRef = useRef(null);
  const [partnerLookup, setPartnerLookup] = useState({
    status: "idle",
    id: "",
    businessName: "",
    code: "",
    discountRate: 0,
  });
  const pricingResult = calculatePrice(cart);
  const rawFinalPrice = pricingResult.finalPrice;
  const customQuote = Boolean(pricingResult.customQuote);
  const customOnly = Boolean(pricingResult.customOnly);
  const fixedAddonTotal = Number(pricingResult.fixedAddonTotal || 0);
  const hasStandardItems = cart.some((item) => !premiumType(item));

  const sessionId = localStorage.getItem("jb_chat_session") || "";
  const discountActive =
    sessionId && localStorage.getItem("jb_disc_on_" + sessionId) === "1";

  const partnerDiscountActive =
    partnerLookup.status === "valid" &&
    Number(partnerLookup.discountRate || 0) > 0 &&
    hasStandardItems &&
    !customOnly;

  const standardEligibleAmount =
    !customOnly && hasStandardItems
      ? Math.max(0, Number(rawFinalPrice || 0) - fixedAddonTotal)
      : 0;

  const partnerSavings = partnerDiscountActive
    ? Math.round(
        standardEligibleAmount * Number(partnerLookup.discountRate || 0) * 100
      ) / 100
    : 0;

  const finalPrice = customOnly
    ? null
    : partnerDiscountActive
    ? Math.round(
        (standardEligibleAmount - partnerSavings + fixedAddonTotal) * 100
      ) / 100
    : discountActive
    ? Math.round(Number(rawFinalPrice || 0) * 0.9 * 100) / 100
    : Number(rawFinalPrice || 0);

  const itemSubtotal = cart.reduce(
    (sum, item) => sum + Number(item.price || 0),
    0
  );
  const minimumApplied =
    !customQuote && rawFinalPrice === minimumPrice && itemSubtotal < minimumPrice;
  const discountSavings = customOnly
    ? 0
    : Math.max(0, Number(rawFinalPrice || 0) - Number(finalPrice || 0));

  const dates = useMemo(makeDates, []);
  const savedBooking = (() => {
    try { return JSON.parse(localStorage.getItem("jb_schedule_draft") || "null"); } catch { return null; }
  })();
  const [step, setStep] = useState(savedBooking?.step ?? 0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(savedBooking?.form || {
    name: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "TX",
    zip: "",
    date: "",
    time: "",
    partnerCode: "",
  });
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  const premiumQtyByType = useMemo(() => {
    return cart.reduce((counts, item) => {
      const type = premiumType(item);
      if (type && type !== "custom") {
        counts[type] = (counts[type] || 0) + Math.max(1, Number(item.qty || 1));
      }
      return counts;
    }, {});
  }, [cart]);

  const displayLinePrice = (item) => {
    const type = premiumType(item);
    if (type === "custom") return null;

    const itemQty = Math.max(1, Number(item.qty || 1));

    if (type) {
      const unit = premiumUnitPrice(type, premiumQtyByType[type] || itemQty);
      if (unit != null) return unit * itemQty;
    }

    const listed = Number(item.price || 0);
    if (listed > 0) return listed * itemQty;

    const volume = Number(item.volume || 0);
    if (volume > 0) return Math.max(1, Math.round(volume * 2.22 * itemQty * 100) / 100);

    return null;
  };

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
            customQuote:
              premiumType(item) === "custom" ||
              Boolean(item.customQuote) ||
              item.pricingMode === "custom",
          };
        }

        groups[key].qty += qty;
        const resolvedLinePrice = displayLinePrice(item);
        groups[key].price += resolvedLinePrice == null ? 0 : Number(resolvedLinePrice);
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
    localStorage.removeItem("jb_return_to_schedule");
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "jb_schedule_draft",
      JSON.stringify({ form, step })
    );
  }, [form, step]);

  useEffect(() => {
    const code = String(form.partnerCode || "").trim().toUpperCase();

    if (!code) {
      setPartnerLookup({
        status: "idle",
        id: "",
        businessName: "",
        code: "",
        discountRate: 0,
      });
      return;
    }

    const timer = setTimeout(async () => {
      setPartnerLookup((current) => ({ ...current, status: "checking" }));

      try {
        const snapshot = await getDoc(doc(db, "partnerCodes", code));

        if (!snapshot.exists()) {
          setPartnerLookup({
            status: "invalid",
            id: "",
            businessName: "",
            code,
            discountRate: 0,
          });
          return;
        }

        const data = snapshot.data();

        if (data.active !== true) {
          setPartnerLookup({
            status: "invalid",
            id: "",
            businessName: "",
            code,
            discountRate: 0,
          });
          return;
        }

        setPartnerLookup({
          status: "valid",
          id: data.partnerApplicationId || "",
          businessName: data.businessName || "Approved partner",
          code,
          discountRate: Number(data.discountRate || 0.3),
        });
      } catch (err) {
        console.error("Partner code lookup failed:", err);
        setPartnerLookup({
          status: "error",
          id: "",
          businessName: "",
          code,
          discountRate: 0,
        });
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [form.partnerCode]);

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

  const persistScheduleDraft = () => {
    localStorage.setItem(
      "jb_schedule_draft",
      JSON.stringify({ form, step })
    );
  };

  const addMoreItems = () => {
    persistScheduleDraft();
    localStorage.setItem("jb_return_to_schedule", "1");
    navigate("/itemized");
  };

  const removeCartItem = (index) => {
    setCart((current) => current.filter((_, itemIndex) => itemIndex !== index));
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
      let nextOrder;

      try {
        nextOrder = await getNextOrderNumber();
      } catch (sequenceError) {
        console.warn(
          "Sequential order lookup unavailable; booking will continue.",
          sequenceError
        );

        const fallbackNumber = String(Date.now()).slice(-8);
        nextOrder = {
          orderNumber: "JB-" + fallbackNumber,
          orderSequence: null,
        };
      }

      const orderNumber = nextOrder.orderNumber;

      await addDoc(collection(db, "jobs"), {
        ...form,
        emailLower: form.email.trim().toLowerCase(),
        partnerCode: partnerLookup.status === "valid" ? partnerLookup.code : "",
        partnerId: partnerLookup.status === "valid" ? partnerLookup.id : "",
        partnerBusinessName:
          partnerLookup.status === "valid" ? partnerLookup.businessName : "",
        partnerDiscountRate: partnerDiscountActive
          ? Number(partnerLookup.discountRate || 0)
          : 0,
        partnerSavings: partnerDiscountActive ? partnerSavings : 0,
        fullAddress,
        timeOfDay,
        orderNumber,
        ...(nextOrder.orderSequence != null ? { orderSequence: nextOrder.orderSequence } : {}),
        items: cart,
        total: customOnly ? null : finalPrice,
        customQuote,
        customOnly,
        discountActive: partnerDiscountActive ? false : Boolean(discountActive),
        partnerDiscountActive,
        Latitude: null,
        Longitude: null,
        status: customOnly ? "Quote Requested" : "Scheduled",
        bookingSource: "immersive-premium",
        createdAt: Timestamp.now(),
      });

      localStorage.removeItem("jb_schedule_draft");
      localStorage.removeItem("jb_return_to_schedule");

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
          total: customOnly ? null : finalPrice,
          customQuote,
          customOnly,
          discountActive: partnerDiscountActive ? false : Boolean(discountActive),
          partnerDiscountActive,
          partnerSavings: partnerDiscountActive ? partnerSavings : 0,
          itemCount: cartSummary.reduce((sum, item) => sum + item.qty, 0),
          items: cartSummary.map((item) => ({ name: item.name, qty: item.qty, price: item.price })),
          street: form.street,
          city: form.city,
          stateName: form.state,
          zip: form.zip,
          partnerCode: partnerLookup.status === "valid" ? partnerLookup.code : "",
          partnerBusinessName:
            partnerLookup.status === "valid" ? partnerLookup.businessName : "",
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
    if (partnerDiscountActive) {
      return (
        <div
          className={
            compact
              ? "mt-3 border-t border-white/10 pt-3 text-xs leading-relaxed text-white/55"
              : "mt-4 rounded-xl border border-[#c8b477]/20 bg-[#c8b477]/[0.06] p-3 text-xs leading-relaxed text-white/55"
          }
        >
          Partner rate applied to qualifying standard removal
          <span className="mx-1.5 text-white/25">→</span>
          <b className="text-[#e0cf91]">
            save {"$"}{partnerSavings.toFixed(2)}
          </b>
          {fixedAddonTotal > 0 && (
            <span className="block mt-1 text-white/35">
              Premium / specialty line items remain at their listed price.
            </span>
          )}
        </div>
      );
    }

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

                <div className="mt-5 sm:mt-7">
                  <div className="sm:hidden">
                    <div className="rounded-[22px] border border-[#c8b477]/20 bg-gradient-to-b from-[#15120d] to-[#0b0b0b] p-3.5">
                      <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
                        <div>
                          <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/35">
                            Preferred day
                          </div>
                          <div className="mt-1 text-base font-black text-white">
                            {form.date ? formatDate() : "Choose a date"}
                          </div>
                        </div>
                        <div className="rounded-xl border border-[#c8b477]/25 bg-[#c8b477]/10 px-3 py-2 text-[10px] font-bold text-[#e0cf91]">
                          Step 3
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {dates.slice(0, 4).map((date) => {
                          const active = form.date === date.value;

                          return (
                            <button
                              key={date.value}
                              type="button"
                              onClick={() => update("date", date.value)}
                              className={
                                "rounded-xl border px-3 py-2.5 text-left transition " +
                                (active
                                  ? "border-[#c8b477] bg-[#c8b477] text-black"
                                  : "border-white/10 bg-white/[0.035] text-white")
                              }
                            >
                              <div className="text-xs font-black">{date.label}</div>
                              <div className={"mt-0.5 text-[10px] " + (active ? "text-black/60" : "text-white/35")}>
                                {date.sub}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      <label className="mt-2 block min-w-0 overflow-hidden">
                        <span className="mb-1.5 block text-[9px] font-semibold uppercase tracking-[0.14em] text-white/35">Calendar</span>
                        <input
                          type="date"
className="block w-full min-w-0 max-w-full rounded-xl border border-white/10 bg-[#111] px-3 py-2.5 text-sm text-white outline-none [color-scheme:dark] focus:border-[#c8b477]"
                          min={dates[0].value}
                          value={form.date}
                          onChange={(e) => update("date", e.target.value)}
                        />
                      </label>
                    </div>

                    <div className="mt-3 rounded-[22px] border border-white/10 bg-[#0d0d0d] p-3.5">
                      <div className="mb-2.5 text-[9px] font-bold uppercase tracking-[0.18em] text-white/35">
                        Arrival window
                      </div>

                      <div className="space-y-2">
                        {WINDOWS.map((window) => {
                          const active = form.time === window.value;

                          return (
                            <button
                              key={window.value}
                              type="button"
                              onClick={() => update("time", window.value)}
                              className={
                                "flex w-full items-center justify-between rounded-xl border px-3.5 py-3 text-left transition " +
                                (active
                                  ? "border-[#c8b477] bg-[#c8b477] text-black"
                                  : "border-white/10 bg-white/[0.03] text-white")
                              }
                            >
                              <div>
                                <div className="text-sm font-black">{window.label}</div>
                                <div className={"mt-0.5 text-[10px] " + (active ? "text-black/60" : "text-white/35")}>
                                  {window.sub}
                                </div>
                              </div>
                              <div className={"flex h-5 w-5 items-center justify-center rounded-full border text-[10px] " + (active ? "border-black/30 bg-black/10" : "border-white/15")}>
                                {active ? "✓" : ""}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="hidden sm:block">
                    <div className="grid grid-cols-3 gap-3">
                      {dates.map((date) => {
                        const active = form.date === date.value;

                        return (
                          <button
                            key={date.value}
                            type="button"
                            onClick={() => update("date", date.value)}
                            className={
                              "rounded-2xl border p-4 text-left transition " +
                              (active
                                ? "border-[#c8b477] bg-[#c8b477] text-black"
                                : "border-white/10 bg-white/[0.035] hover:border-[#c8b477]/50")
                            }
                          >
                            <div className="font-black">{date.label}</div>
                            <div className={"mt-1 text-sm " + (active ? "text-black/60" : "text-white/40")}>
                              {date.sub}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <label className="mt-4 block">
                      <span className="text-xs text-white/35">Or choose another date</span>
                      <input
                        type="date"
                        className={fieldClass + " mt-2 [color-scheme:dark]"}
                        min={dates[0].value}
                        value={form.date}
                        onChange={(e) => update("date", e.target.value)}
                      />
                    </label>

                    <div className="mt-7 grid grid-cols-3 gap-3">
                      {WINDOWS.map((window) => {
                        const active = form.time === window.value;

                        return (
                          <button
                            key={window.value}
                            type="button"
                            onClick={() => update("time", window.value)}
                            className={
                              "rounded-2xl border p-4 text-left transition " +
                              (active
                                ? "border-[#c8b477] bg-[#c8b477] text-black"
                                : "border-white/10 bg-white/[0.035] hover:border-[#c8b477]/50")
                            }
                          >
                            <div className="font-black">{window.label}</div>
                            <div className={"mt-1 text-xs " + (active ? "text-black/60" : "text-white/40")}>
                              {window.sub}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
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

                  <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3 sm:hidden">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-[10px] uppercase tracking-wider text-white/30">Your items</div>
                      <button type="button" onClick={() => setCartDrawerOpen(true)} className="text-[11px] font-bold text-[#e0cf91]">Edit</button>
                    </div>
                    <div className="mt-2 divide-y divide-white/10">
                      {cart.map((item, index) => {
                        const linePrice = displayLinePrice(item);
                        return (
                          <div key={(item.name || "item") + "-review-" + index} className="flex items-start justify-between gap-3 py-2.5">
                            <div className="min-w-0 text-sm text-white/75">
                              {Math.max(1, Number(item.qty || 1)) > 1 && (
                                <b className="mr-1 text-[#e0cf91]">{Math.max(1, Number(item.qty || 1))}x</b>
                              )}
                              <span>{item.name || "Item"}</span>
                            </div>
                            <div className="shrink-0 text-xs font-semibold text-white/45">
                              {premiumType(item) === "custom"
                                ? "Quoted separately"
                                : linePrice != null
                                ? "$" + Number(linePrice).toFixed(2)
                                : "Price included"}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {customQuote && !customOnly && (
                      <div className="mt-2 rounded-xl border border-[#c8b477]/15 bg-[#c8b477]/[0.05] px-3 py-2 text-[10px] leading-relaxed text-white/40">
                        Priced items are shown above. Cleanout/custom work is optional and will be confirmed separately on arrival.
                      </div>
                    )}
                  </div>
                  <div className="rounded-2xl border border-[#c8b477]/15 bg-[#c8b477]/[0.035] p-3 sm:p-4">
                    <label className="block">
                      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#c8b477]/70 sm:text-xs">
                        Partner / property code
                      </span>
                      <input
                        className="mt-2 w-full rounded-xl border border-white/10 bg-black/35 px-3.5 py-2.5 text-sm uppercase tracking-[0.08em] text-white placeholder:normal-case placeholder:tracking-normal placeholder:text-white/25 outline-none focus:border-[#c8b477]"
                        value={form.partnerCode}
                        onChange={(e) => update("partnerCode", e.target.value.toUpperCase())}
                        placeholder="Optional"
                        autoComplete="off"
                      />
                      <span className="mt-1.5 block text-[10px] leading-relaxed text-white/30">
                        For approved property, partner, or QR referral codes. No code is required to book.
                      </span>
                      {form.partnerCode.trim() && (
                        <span
                          className={
                            "mt-2 block text-xs font-bold " +
                            (partnerLookup.status === "valid"
                              ? "text-emerald-300"
                              : partnerLookup.status === "checking"
                              ? "text-white/45"
                              : "text-red-300")
                          }
                        >
                          {partnerLookup.status === "checking"
                            ? "Checking partner code..."
                            : partnerLookup.status === "valid"
                            ? partnerLookup.businessName +
                              " partner rate applied"
                            : partnerLookup.status === "error"
                            ? "Could not verify this code right now."
                            : "This partner code is not active."}
                        </span>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-5 rounded-2xl border border-[#c8b477]/20 bg-[#c8b477]/[0.055] p-3 lg:hidden">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/35">Estimated total</div>
                  <div className="mt-0.5 text-2xl font-black text-[#e0cf91]">{customOnly ? "Custom quote" : "$" + Number(finalPrice || 0).toFixed(2)}</div>
                </div>
                <button type="button" onClick={() => setCartDrawerOpen(true)} className="text-xs font-bold text-[#e0cf91]">Edit items</button>
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
                  {submitting ? "Locking it in…" : customOnly ? "Request Custom Quote" : "Confirm Pickup"}
                </button>
              )}
            </div>

            <p className="mt-3 text-center text-[10px] text-white/30 sm:mt-4 sm:text-xs">You don't pay until the job is done.</p>
          </section>

          <aside className="hidden rounded-[28px] border border-[#c8b477]/20 bg-gradient-to-b from-[#15120a] to-[#090909] p-5 lg:sticky lg:top-24 lg:block">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-black">Your pickup</h2>
<button type="button" onClick={() => setCartDrawerOpen(true)} className="text-xs font-bold text-[#e0cf91] hover:text-white">Edit items</button>
            </div>

            <div className="mt-5 max-h-64 space-y-3 overflow-y-auto pr-1">
              {cartSummary.length ? cartSummary.map((item) => (
                <div key={item.key} className="flex items-start justify-between gap-4 text-sm">
                  <span className="text-white/70">
                    {item.qty > 1 && <b className="text-[#e0cf91]">{item.qty}x </b>}
                    {item.name}
                  </span>
                  <span className="shrink-0 text-white/40">
                    {item.customQuote
                      ? "Quoted separately"
                      : "$" + Number(item.price || 0).toFixed(2)}
                  </span>
                </div>
              )) : <div className="text-sm text-white/40">Your cart is empty. Add items before scheduling.</div>}
            </div>

            <div className="mt-5 border-t border-white/10 pt-5">
              {discountActive && <div className="mb-3 inline-flex rounded-full border border-[#c8b477]/25 bg-[#c8b477]/10 px-3 py-1 text-xs font-bold text-[#e0cf91]">10% offer applied</div>}
              <div className="text-xs uppercase tracking-wider text-white/30">Estimated total</div>
              <div className="mt-1 text-3xl font-black text-[#e0cf91]">{customOnly ? "Custom quote" : "$" + Number(finalPrice || 0).toFixed(2)}</div>
              <div className="mt-2 text-xs text-white/35">Pay after completion.</div>
              <PricingBridge />
            </div>
          </aside>
        </div>
      </section>

      {cartDrawerOpen && (
        <div className="fixed inset-0 z-[9998] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-6">
          <button
            type="button"
            aria-label="Close cart"
            className="absolute inset-0 cursor-default"
            onClick={() => setCartDrawerOpen(false)}
          />
          <section className="relative z-10 flex max-h-[78svh] w-full max-w-lg flex-col overflow-hidden rounded-t-[28px] border border-[#c8b477]/25 bg-[#0b0b0b] shadow-[0_-20px_70px_rgba(0,0,0,.65)] sm:rounded-[28px]">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">Current pickup</div>
                <h3 className="mt-1 text-xl font-black">Edit your items</h3>
              </div>
              <button
                type="button"
                onClick={() => setCartDrawerOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-lg text-white/70"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-3">
              {cart.length ? (
                <div className="divide-y divide-white/10">
                  {cart.map((item, index) => (
                    <div key={(item.name || "item") + "-" + index} className="flex items-center justify-between gap-4 py-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-bold text-white/85">{item.name || "Item"}</div>
                        <div className="mt-0.5 text-xs text-white/35">
                          {premiumType(item) === "custom"
                            ? "Quoted separately"
                            : displayLinePrice(item) != null
                            ? "$" + Number(displayLinePrice(item)).toFixed(2)
                            : "Price included"}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeCartItem(index)}
                        className="shrink-0 rounded-lg border border-red-400/20 bg-red-500/[0.07] px-3 py-1.5 text-xs font-bold text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center text-sm text-white/40">Your cart is empty.</div>
              )}
            </div>

            <div className="border-t border-white/10 bg-[#0d0d0d] p-4">
              <div className="mb-3 flex items-end justify-between">
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/30">Updated estimate</div>
                  <div className="mt-0.5 text-2xl font-black text-[#e0cf91]">{customOnly ? "Custom quote" : "$" + Number(finalPrice || 0).toFixed(2)}</div>
                </div>
                <div className="text-xs text-white/35">{cart.length} selected</div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCartDrawerOpen(false)}
                  className="rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm font-bold text-white"
                >
                  Done
                </button>
                <button
                  type="button"
                  onClick={() => {
                    persistScheduleDraft();
                    localStorage.setItem("jb_mirror_resume_" + sessionId, "more");
                    goToPriceMirror(navigate, () => setCartDrawerOpen(false));
                  }}
                  className="jb-polished-gold-button text-sm"
                >
                  Add items
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

    </main>
  );
}
