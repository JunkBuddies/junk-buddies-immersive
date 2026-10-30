import React, { useState } from "react";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";

function normalizeOrder(value) {
  const cleaned = String(value || "").trim().toUpperCase();
  if (!cleaned) return "";
  return cleaned.startsWith("JB-") ? cleaned : "JB-" + cleaned.replace(/^JB[-\s]*/i, "");
}

export default function OrderLookupPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [job, setJob] = useState(null);
  const [error, setError] = useState("");

  const lookup = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setJob(null);

    const normalizedOrder = normalizeOrder(orderNumber);
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedOrder || !normalizedEmail) {
      setLoading(false);
      setError("Enter your confirmation number and booking email.");
      return;
    }

    try {
      const jobsRef = collection(db, "jobs");
      const lookupQuery = query(
        jobsRef,
        where("orderNumber", "==", normalizedOrder),
        limit(5)
      );
      const snapshot = await getDocs(lookupQuery);
      const match = snapshot.docs
        .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
        .find((record) => {
          const savedEmail = String(record.emailLower || record.email || "")
            .trim()
            .toLowerCase();
          return savedEmail === normalizedEmail;
        });

      if (!match) {
        setError("We couldn't match that confirmation number and email.");
      } else {
        setJob(match);
      }
    } catch (lookupError) {
      console.error("Order lookup failed:", lookupError);
      setError("We couldn't retrieve that booking right now. Please call 346-593-6080.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (value) => {
    if (!value) return "Scheduled";
    const parts = String(value).split("-").map(Number);
    if (parts.length !== 3 || parts.some(Number.isNaN)) return value;
    return new Date(parts[0], parts[1] - 1, parts[2]).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-8 text-white sm:px-6 sm:py-14">
      <section className="mx-auto max-w-3xl">
        <div className="text-center">
          <span className="inline-flex rounded-full border border-[#c8b477]/25 bg-[#c8b477]/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#e0cf91] sm:text-xs">
            Booking lookup
          </span>
          <h1 className="mt-4 text-3xl font-black sm:text-5xl">Find your pickup.</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/45 sm:text-base">
            Enter the JB confirmation number and the same email used when scheduling.
          </p>
        </div>

        <form onSubmit={lookup} className="mx-auto mt-8 rounded-[28px] border border-white/10 bg-[#0b0b0b] p-5 shadow-2xl sm:p-8">
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/35 sm:text-xs">
              Confirmation number
            </span>
            <input
              value={orderNumber}
              onChange={(event) => setOrderNumber(event.target.value)}
              placeholder="JB-330102"
              autoCapitalize="characters"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-[#111] px-4 py-3.5 text-base font-bold uppercase tracking-[0.08em] text-white placeholder:text-white/20 outline-none focus:border-[#c8b477]"
            />
          </label>

          <label className="mt-4 block">
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/35 sm:text-xs">
              Booking email
            </span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-[#111] px-4 py-3.5 text-base text-white placeholder:text-white/20 outline-none focus:border-[#c8b477]"
            />
          </label>

          {error && (
            <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/[0.08] p-4 text-sm text-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="jb-polished-gold-button mt-5 w-full disabled:opacity-50"
          >
            {loading ? "Finding pickup…" : "Look Up Pickup"}
          </button>
        </form>

        {job && (
          <section className="mt-6 overflow-hidden rounded-[28px] border border-[#c8b477]/25 bg-gradient-to-b from-[#15120d] to-[#090909]">
            <div className="border-b border-white/10 p-5 sm:p-7">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#c8b477]">
                {job.status || "Scheduled"}
              </div>
              <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black">{job.orderNumber}</h2>
                  <div className="mt-1 text-sm text-white/40">
                    {job.name || "Junk Buddies customer"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] uppercase tracking-[0.14em] text-white/30">Estimate</div>
                  <div className="mt-1 text-2xl font-black text-[#e0cf91]">
                    {"$"}{Number(job.total || 0).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-7">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-[9px] uppercase tracking-[0.14em] text-white/30">Pickup</div>
                <div className="mt-1 font-bold">{formatDate(job.date)}</div>
                <div className="mt-1 text-sm text-white/45">{job.time || job.timeOfDay || ""}</div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-[9px] uppercase tracking-[0.14em] text-white/30">Address</div>
                <div className="mt-1 text-sm font-bold leading-relaxed">
                  {job.fullAddress || [job.street, job.city, job.state, job.zip].filter(Boolean).join(", ")}
                </div>
              </div>

              {Array.isArray(job.items) && job.items.length > 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:col-span-2">
                  <div className="text-[9px] uppercase tracking-[0.14em] text-white/30">Items</div>
                  <div className="mt-2 divide-y divide-white/10">
                    {job.items.map((item, index) => (
                      <div key={(item.name || "item") + "-" + index} className="flex justify-between gap-4 py-2.5 text-sm">
                        <span className="text-white/70">
                          {Number(item.qty || 1) > 1 ? Number(item.qty || 1) + "x " : ""}
                          {item.name || "Item"}
                        </span>
                        <span className="shrink-0 text-white/35">
                          {"$"}{Number(item.price || 0).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-white/10 p-5 text-center sm:p-6">
              <div className="text-sm font-bold text-[#e0cf91]">You don't pay until the job is done.</div>
              <a href="tel:3465936080" className="mt-3 inline-block text-sm text-white/45 hover:text-white">
                Need help? 346-593-6080
              </a>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
