import React, { useEffect } from "react";
import emailjs from "emailjs-com";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function ConfirmationPremiumPage() {
  const navigate = useNavigate();
  const { state = {} } = useLocation();
  const firstName = state.name ? state.name.split(" ")[0] : "";

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    if (!state?.orderNumber || !state?.email) return;

    const sentKey = "jb_booking_emails_sent_" + state.orderNumber;
    if (sessionStorage.getItem(sentKey) === "1") return;

    const items = Array.isArray(state.items) ? state.items : [];
    const itemsText = items
      .map((item) => {
        return (
          (item.qty > 1 ? item.qty + "x " : "") +
          item.name +
          ": $" +
          Number(item.price || 0).toFixed(2)
        );
      })
      .join("\n");

    const itemsHtml =
      "<ul>" +
      items
        .map((item) => {
          return (
            "<li><strong>" +
            (item.qty > 1 ? item.qty + "x " : "") +
            item.name +
            "</strong>: $" +
            Number(item.price || 0).toFixed(2) +
            "</li>"
          );
        })
        .join("") +
      "</ul>";

    const emailParams = {
      name: state.name || "",
      email: state.email || "",
      phone: state.phone || "",
      street: state.street || "",
      city: state.city || "",
      state: state.stateName || "TX",
      zip: state.zip || "",
      date: state.formattedDate || state.date || "",
      time: state.time || "",
      fullAddress: state.fullAddress || [state.street, state.city, state.stateName, state.zip].filter(Boolean).join(" "),
      orderNumber: state.orderNumber,
      customerEmail: state.email,
      total: "$" + Number(state.total || 0).toFixed(2),
      itemsText,
      itemsHtml,
      partnerCode: state.partnerCode || "",
    };

    sessionStorage.setItem(sentKey, "1");

    Promise.allSettled([
      emailjs.send(
        "JunkBuddies.info",
        "Junk_Buddies_Booking",
        { ...emailParams, items: itemsHtml, email: state.email },
        "QCl4Akw_LZ3T8IvUd"
      ),
      emailjs.send(
        "JunkBuddies.info",
        "template_57eij3s",
        { ...emailParams, items: itemsText, email: state.email },
        "QCl4Akw_LZ3T8IvUd"
      ),
    ]).then((results) => {
      const anyFailed = results.some((result) => result.status === "rejected");

      if (anyFailed) {
        sessionStorage.removeItem(sentKey);
      }

      results.forEach((result, index) => {
        if (result.status === "rejected") {
          console.warn(
            index === 0
              ? "Customer confirmation email failed."
              : "Owner lead email failed.",
            result.reason
          );
        }
      });
    });
  }, [state]);

  return (
    <main className="fixed inset-0 z-[9999] overflow-y-auto bg-[#050505] px-4 py-6 text-white sm:py-10">
      <style>{`
        @keyframes jb-confirm-pop {
          0% { transform: scale(.15) rotate(-12deg); opacity: 0; }
          60% { transform: scale(1.18) rotate(3deg); opacity: 1; }
          100% { transform: scale(1) rotate(0); opacity: 1; }
        }
        @keyframes jb-confirm-ring {
          0% { transform: scale(.45); opacity: .85; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes jb-confetti {
          0% { transform: translate3d(0,-16vh,0) rotate(0deg); opacity: 0; }
          8% { opacity: 1; }
          100% { transform: translate3d(var(--drift),115vh,0) rotate(720deg); opacity: 0; }
        }
        @keyframes jb-spark {
          0%, 100% { transform: scale(.4); opacity: 0; }
          45% { transform: scale(1.35); opacity: 1; }
        }
        @keyframes jb-card-rise {
          0% { transform: translateY(24px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      <div className="pointer-events-none fixed inset-0 z-[10000] overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(200,180,119,.22),transparent_38%)]" />
        {Array.from({ length: 52 }).map((_, index) => (
          <span
            key={"confetti-" + index}
            className="absolute top-0 rounded-sm"
            style={{
              left: ((index * 29) % 100) + "%",
              width: index % 3 === 0 ? "6px" : "4px",
              height: index % 4 === 0 ? "18px" : "11px",
              background:
                index % 7 === 0
                  ? "#ffffff"
                  : index % 4 === 0
                  ? "#8b6914"
                  : index % 3 === 0
                  ? "#f2df9b"
                  : "#c8b477",
              opacity: 0,
              "--drift": ((index % 9) - 4) * 26 + "px",
              animation:
                "jb-confetti " +
                (3.2 + (index % 6) * 0.38) +
                "s cubic-bezier(.14,.72,.28,1) " +
                ((index % 11) * 0.06) +
                "s 1",
            }}
          />
        ))}
        {Array.from({ length: 14 }).map((_, index) => (
          <span
            key={"spark-" + index}
            className="absolute h-2 w-2 rounded-full bg-[#f2df9b]"
            style={{
              left: 10 + ((index * 17) % 80) + "%",
              top: 8 + ((index * 13) % 32) + "%",
              boxShadow: "0 0 18px rgba(242,223,155,.95)",
              animation:
                "jb-spark 1.2s ease-in-out " +
                ((index % 7) * 0.09) +
                "s 2",
            }}
          />
        ))}
      </div>

      <div className="relative z-[10001] mx-auto flex min-h-full w-full max-w-3xl items-start justify-center pt-3 sm:items-center sm:pt-0">
        <section
          className="relative w-full rounded-[30px] border border-[#c8b477]/40 bg-gradient-to-b from-[#15120d] via-[#0a0a0a] to-[#060606] p-5 text-center shadow-[0_25px_100px_rgba(0,0,0,.7),0_0_80px_rgba(200,180,119,.13)] sm:p-10"
          style={{ animation: "jb-card-rise .55s ease-out both" }}
        >
          <div className="relative mx-auto flex h-24 w-24 items-center justify-center sm:h-28 sm:w-28">
            <div
              className="absolute inset-2 rounded-full border-2 border-[#c8b477]"
              style={{ animation: "jb-confirm-ring 1.25s ease-out .2s 1 both" }}
            />
            <div
              className="absolute inset-0 rounded-full border border-[#f2df9b]/40"
              style={{ animation: "jb-confirm-ring 1.55s ease-out .35s 1 both" }}
            />
            <div
              className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-[#c8b477] text-4xl font-black text-black shadow-[0_0_55px_rgba(200,180,119,.45)] sm:h-24 sm:w-24 sm:text-5xl"
              style={{
                animation:
                  "jb-confirm-pop .82s cubic-bezier(.2,.9,.25,1.2) both",
              }}
            >
              ✓
            </div>
          </div>

          <p className="mt-4 text-xs font-bold uppercase tracking-[0.24em] text-[#e0cf91] sm:mt-6">
            Pickup locked in
          </p>
          <h1 className="mt-2 text-3xl font-black sm:text-5xl">
            You're on the schedule.
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/55 sm:mt-4 sm:text-lg">
            Thanks{firstName ? ", " + firstName : ""}. Your Junk Buddies pickup
            request is saved. We will contact you if anything needs to be
            confirmed before arrival.
          </p>

          {state.orderNumber && (
            <div className="mt-5 inline-flex rounded-full border border-[#c8b477]/30 bg-[#c8b477]/10 px-4 py-2 text-sm font-black text-[#f0dda0]">
              Confirmation {state.orderNumber}
            </div>
          )}

          <div className="mt-6 grid gap-2 text-left sm:mt-8 sm:grid-cols-2 sm:gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3.5 sm:p-4">
              <div className="text-[10px] uppercase tracking-wider text-white/30 sm:text-xs">
                Preferred pickup
              </div>
              <div className="mt-1 font-bold">
                {state.formattedDate || state.date || "Scheduled"}
              </div>
              <div className="mt-0.5 text-xs text-white/45 sm:text-sm">
                {state.time || "Arrival window saved"}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3.5 sm:p-4">
              <div className="text-[10px] uppercase tracking-wider text-white/30 sm:text-xs">
                Estimated total
              </div>
              <div className="mt-1 text-xl font-black text-[#e0cf91] sm:text-2xl">
                {"$"}{Number(state.total || 0).toFixed(2)}
              </div>
              <div className="mt-0.5 text-xs text-white/45 sm:text-sm">
                {state.itemCount || 0} item{state.itemCount === 1 ? "" : "s"} selected
              </div>
            </div>

            {state.fullAddress && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3.5 sm:col-span-2 sm:p-4">
                <div className="text-[10px] uppercase tracking-wider text-white/30 sm:text-xs">
                  Pickup address
                </div>
                <div className="mt-1 text-sm font-bold sm:text-base">
                  {state.fullAddress}
                </div>
              </div>
            )}
          </div>

          {Array.isArray(state.items) && state.items.length > 0 && (
            <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left">
              <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/30 sm:text-xs">
                Items in this pickup
              </div>
              <div className="mt-2 divide-y divide-white/10">
                {state.items.map((item, index) => (
                  <div
                    key={(item.name || "item") + "-" + index}
                    className="flex items-center justify-between gap-4 py-2.5"
                  >
                    <span className="min-w-0 truncate text-sm font-semibold text-white/75">
                      {item.qty > 1 ? item.qty + "x " : ""}
                      {item.name}
                    </span>
                    <span className="shrink-0 text-xs text-white/35">
                      {"$"}{Number(item.price || 0).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 rounded-2xl border border-[#c8b477]/20 bg-[#c8b477]/[0.06] p-4 sm:mt-6">
            <div className="font-black text-[#e0cf91]">
              No payment was taken.
            </div>
            <div className="mt-1 text-xs text-white/45 sm:text-sm">
              You don't pay until the job is done.
            </div>
          </div>

          <div className="mt-5 grid gap-2 sm:mt-7 sm:grid-cols-2 sm:gap-3">
            <a
              href="tel:3465936080"
              className="jb-polished-gold-button text-center"
            >
              Call Junk Buddies
            </a>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="rounded-xl border border-white/15 bg-white/[0.04] px-6 py-3 font-bold text-white"
            >
              Back to Home
            </button>
          </div>

          <div className="mt-4 flex flex-col items-center gap-2 sm:mt-6">
            <Link
              to="/lookup"
              className="text-xs font-bold text-[#e0cf91]/70 hover:text-[#e0cf91] sm:text-sm"
            >
              Look up this booking later
            </Link>
            <Link
              to="/itemized"
              className="text-xs font-bold text-white/30 hover:text-[#e0cf91] sm:text-sm"
            >
              Need another pickup? Start a new estimate
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
