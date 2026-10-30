import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function ConfirmationPremiumPage() {
  const navigate = useNavigate();
  const { state = {} } = useLocation();
  const firstName = state.name ? state.name.split(" ")[0] : "";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] px-4 py-12 text-white flex items-center justify-center">
      <style>{`
        @keyframes jb-confirm-pop {0%{transform:scale(.2);opacity:0}65%{transform:scale(1.12);opacity:1}100%{transform:scale(1);opacity:1}}
        @keyframes jb-confetti {0%{transform:translateY(-12vh) rotate(0deg);opacity:0}12%{opacity:.9}100%{transform:translateY(105vh) rotate(540deg);opacity:0}}
      `}</style>

      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {Array.from({ length: 26 }).map((_, index) => (
          <span key={index} className="absolute top-0 h-2.5 w-1 rounded-sm" style={{
            left: ((index * 37) % 100) + "%",
            background: index % 5 === 0 ? "#ffffff" : index % 3 === 0 ? "#8b6914" : "#c8b477",
            opacity: 0,
            animation: "jb-confetti " + (3 + (index % 5) * 0.35) + "s ease-in " + ((index % 9) * 0.1) + "s 1",
          }} />
        ))}
      </div>

      <section className="relative z-10 w-full max-w-2xl rounded-[32px] border border-[#c8b477]/30 bg-gradient-to-b from-[#11100c] to-[#080808] p-6 text-center shadow-2xl sm:p-10">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#c8b477] text-4xl font-black text-black shadow-[0_0_50px_rgba(200,180,119,.28)]" style={{ animation: "jb-confirm-pop .72s cubic-bezier(.2,.9,.25,1.2) both" }}>✓</div>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.22em] text-[#e0cf91]">Pickup locked in</p>
        <h1 className="mt-2 text-4xl font-black sm:text-5xl">You're on the schedule.</h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/55 sm:text-lg">Thanks{firstName ? ", " + firstName : ""}. Your Junk Buddies pickup request has been saved. We will contact you if anything needs to be confirmed before arrival.</p>

        {state.orderNumber && <div className="mt-6 inline-flex rounded-full border border-[#c8b477]/25 bg-[#c8b477]/10 px-4 py-2 text-sm font-black text-[#e0cf91]">Confirmation {state.orderNumber}</div>}

        <div className="mt-8 grid gap-3 text-left sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"><div className="text-xs uppercase tracking-wider text-white/30">Preferred pickup</div><div className="mt-1 font-bold">{state.formattedDate || state.date || "Scheduled"}</div><div className="text-sm text-white/45">{state.time || "Arrival window saved"}</div></div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"><div className="text-xs uppercase tracking-wider text-white/30">Estimated total</div><div className="mt-1 text-2xl font-black text-[#e0cf91]">{'$'}{Number(state.total || 0).toFixed(2)}</div><div className="text-sm text-white/45">{state.itemCount || 0} item{state.itemCount === 1 ? "" : "s"} selected</div></div>
          {state.fullAddress && <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:col-span-2"><div className="text-xs uppercase tracking-wider text-white/30">Pickup address</div><div className="mt-1 font-bold">{state.fullAddress}</div></div>}
        </div>

        <div className="mt-7 rounded-2xl border border-[#c8b477]/20 bg-black/30 p-5"><div className="font-black text-[#e0cf91]">No payment was taken.</div><div className="mt-1 text-sm text-white/45">You don't pay until the job is done.</div></div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <a href="tel:3465936080" className="jb-polished-gold-button text-center">Call Junk Buddies</a>
          <button type="button" onClick={() => navigate("/")} className="rounded-xl border border-white/15 bg-white/[0.04] px-6 py-3 font-bold text-white">Back to Home</button>
        </div>

        <Link to="/itemized" className="mt-6 inline-block text-sm font-bold text-white/35 hover:text-[#e0cf91]">Need another pickup? Start a new estimate</Link>
      </section>
    </main>
  );
}
