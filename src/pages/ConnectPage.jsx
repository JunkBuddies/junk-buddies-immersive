import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ContactRound, Sparkles, Phone } from "lucide-react";

export default function ConnectPage() {
  const navigate = useNavigate();

  const openPricing = () => {
    const trigger = document.querySelector(
      ".jb-chat-bubble, .chat-widget-trigger, #jb-open-button"
    );
    if (trigger) trigger.click();
    else navigate("/itemized");
  };

  return (
    <section className="relative min-h-[calc(100svh-56px)] lg:min-h-[calc(100svh-64px)] w-full overflow-hidden bg-[#111110] text-white">
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 27%, rgba(184,134,55,.16), transparent 23%), radial-gradient(circle at 50% 78%, rgba(212,175,55,.06), transparent 24%), linear-gradient(145deg,#1a1a18 0%,#0e0e0d 58%,#050505 100%)",
        }}
      />
      <div aria-hidden="true" className="absolute inset-[clamp(14px,4vw,48px)] rounded-[28px] border border-[#c8b477]/18" />
      <div aria-hidden="true" className="absolute inset-[clamp(28px,8vw,96px)] rounded-[24px] border border-white/[0.035]" />
      <div aria-hidden="true" className="absolute left-1/2 top-[10%] h-[80%] w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-[#c8b477]/10 to-transparent" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-56px)] w-full max-w-[760px] flex-col items-center justify-center px-5 py-10 text-center sm:px-8 lg:min-h-[calc(100svh-64px)]">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="group mb-7 flex items-center gap-3"
          aria-label="Go to Junk Buddies homepage"
        >
          <img
            src="/images/logo-icon.png"
            alt=""
            className="h-12 w-12 object-contain sm:h-14 sm:w-14"
          />
          <span className="jb-polished-gold-text text-xl font-semibold sm:text-2xl">
            Junk Buddies
          </span>
        </button>

        <div className="mb-5 flex items-center gap-3 text-[10px] font-medium uppercase tracking-[.32em] text-[#c8b477] sm:text-xs">
          <span className="h-px w-8 bg-[#c8b477]/70" />
          Houston junk removal
          <span className="h-px w-8 bg-[#c8b477]/70" />
        </div>

        <h1 className="max-w-[680px] text-[clamp(2.7rem,8vw,5.6rem)] font-semibold leading-[.94] tracking-[-.05em] text-[#f3f1ec]">
          Keep Junk Buddies
          <span className="jb-polished-gold-text mt-2 block">
            one tap away.
          </span>
        </h1>

        <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/50 sm:text-base">
          Save our number, get an instant price, or head straight to JunkBuddies.info.
        </p>

        <div className="mt-9 grid w-full gap-3 sm:grid-cols-2">
          <a
            href="/Junk-Buddies.vcf"
            type="text/vcard"
            className="group relative min-h-[72px] overflow-hidden rounded-2xl border border-[#c8b477]/45 bg-black/20 px-5 text-left transition duration-300 hover:border-[#fff3ad]/70 hover:bg-[#c8b477]/8 active:scale-[.99]"
          >
            <div className="flex h-full items-center gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#c8b477]/35 text-[#e0cf91]">
                <ContactRound size={21} />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-white">Save Contact</span>
                <span className="mt-1 block text-xs text-white/40">Add Junk Buddies to your phone</span>
              </span>
              <ArrowRight className="ml-auto shrink-0 text-[#d8c47c] transition-transform group-hover:translate-x-1" size={18} />
            </div>
          </a>

          <button
            type="button"
            onClick={openPricing}
            className="group relative min-h-[72px] overflow-hidden rounded-2xl border border-[#c8b477]/45 bg-black/20 px-5 text-left transition duration-300 hover:border-[#fff3ad]/70 hover:bg-[#c8b477]/8 active:scale-[.99]"
          >
            <div className="flex h-full items-center gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#c8b477]/35 text-[#e0cf91]">
                <Sparkles size={21} />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-white">Get Instant Price</span>
                <span className="mt-1 block text-xs text-white/40">List your items and price them</span>
              </span>
              <ArrowRight className="ml-auto shrink-0 text-[#d8c47c] transition-transform group-hover:translate-x-1" size={18} />
            </div>
          </button>
        </div>

        <button
          type="button"
          onClick={() => navigate("/")}
          className="group mt-3 flex min-h-[62px] w-full items-center rounded-2xl border border-white/[0.08] bg-white/[0.025] px-5 text-left transition duration-300 hover:border-[#c8b477]/35 hover:bg-white/[0.04] active:scale-[.99]"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#c8b477]/25 bg-black/20">
            <img src="/images/logo-icon.png" alt="" className="h-7 w-7 object-contain" />
          </span>
          <span className="ml-4 min-w-0">
            <span className="block text-sm font-semibold text-white/85">Visit JunkBuddies.info</span>
            <span className="mt-1 block text-xs text-white/35">View services, pricing and scheduling</span>
          </span>
          <ArrowRight className="ml-auto shrink-0 text-white/35 transition-transform group-hover:translate-x-1 group-hover:text-[#d8c47c]" size={18} />
        </button>

        <a
          href="tel:+13465936080"
          className="mt-7 inline-flex min-h-11 items-center gap-2 px-3 text-sm text-white/45 transition hover:text-[#e0cf91]"
        >
          <Phone size={16} />
          346-593-6080
        </a>

        <p className="mt-2 text-[10px] uppercase tracking-[.22em] text-white/20">
          Making Space For What Matters
        </p>
      </div>
    </section>
  );
}
