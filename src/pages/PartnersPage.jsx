import React from "react";
import { Link } from "react-router-dom";

const benefits = [
  ["30% Partner Rate", "Approved property partners receive 30% off qualifying Junk Buddies projects with no minimum work requirement."],
  ["Partner Code", "Approved companies can receive a simple partner code so teams can identify eligible projects quickly."],
  ["Resident Support", "Qualifying savings may also be extended to residents or tenants connected to participating properties."],
  ["Turnover Ready", "Use Junk Buddies for unit cleanouts, abandoned furniture, appliances, turnover debris, storage areas, and bulk items."],
  ["Community Cleanouts", "Coordinate approved cleanout days, resident pickup events, QR materials, and on-site event support."],
  ["Partner Recognition", "With permission, approved partners may be featured on Junk Buddies partner materials and web pages."],
];

export default function PartnersPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <section className="relative overflow-hidden border-b border-[#c8b477]/20 px-5 py-16 sm:px-8 sm:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(200,180,119,.18),transparent_45%)]" />
        <div className="relative mx-auto max-w-5xl text-center">
          <span className="inline-flex rounded-full border border-[#c8b477]/35 bg-[#c8b477]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#e0cf91]">Houston Property Partner Program</span>
          <h1 className="mt-6 text-4xl font-black sm:text-6xl">A better removal option<span className="block text-[#c8b477]">for your properties.</span></h1>
          <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-white/55 sm:text-lg">A simple relationship for property managers and real estate teams that want dependable junk removal and preferred pricing when something comes up.</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a href="tel:3465936080" className="jb-polished-gold-button">Talk About Partnership</a>
            <Link to="/selection" className="rounded-xl border border-white/15 bg-white/[0.04] px-6 py-3 font-bold">View Removal Options</Link>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#0a0a0a]">
        <div className="mx-auto grid max-w-6xl sm:grid-cols-3 sm:divide-x divide-white/10">
          <div className="p-7 text-center"><div className="text-4xl font-black text-[#c8b477]">30%</div><div className="mt-1 text-sm text-white/40">off qualifying projects</div></div>
          <div className="p-7 text-center"><div className="text-4xl font-black text-[#c8b477]">0</div><div className="mt-1 text-sm text-white/40">minimum jobs required</div></div>
          <div className="p-7 text-center"><div className="text-3xl font-black text-[#c8b477]">Houston</div><div className="mt-1 text-sm text-white/40">local service area</div></div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c8b477]">What partners get</p>
          <h2 className="mt-3 text-3xl font-black sm:text-5xl">Useful when you need us. No pressure when you don't.</h2>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {benefits.map(([title, text], index) => <article key={title} className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
            <div className="text-xs font-black tracking-[0.2em] text-[#c8b477]/60">0{index + 1}</div>
            <h3 className="mt-5 text-xl font-black text-[#e0cf91]">{title}</h3>
            <p className="mt-3 leading-relaxed text-white/50">{text}</p>
          </article>)}
        </div>
      </section>

      <section className="border-y border-[#c8b477]/15 bg-[#0d0b08] px-5 py-16 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
          <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c8b477]">Optional property support</p><h2 className="mt-3 text-3xl font-black sm:text-4xl">Make the relationship useful beyond a single cleanout.</h2></div>
          <div className="grid gap-3">
            {["Resident or tenant referral savings on qualifying services","Community cleanout-day coordination","QR cards or leasing-office information","Event signage or feather-flag placement with property approval"].map((item) => <div key={item} className="rounded-2xl border border-white/10 bg-black/30 p-4 font-semibold text-white/70">{item}</div>)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-16 text-center sm:px-8 sm:py-20">
        <h2 className="text-3xl font-black sm:text-5xl">Let's make the next cleanout easier.</h2>
        <p className="mx-auto mt-4 max-w-2xl text-white/50">Call Junk Buddies to talk about setting your company up as an approved property partner.</p>
        <a href="tel:3465936080" className="jb-polished-gold-button mt-8 inline-block">Call 346-593-6080</a>
        <p className="mt-8 text-xs leading-relaxed text-white/25">Partner pricing applies to qualifying standard removal and cleanout services. Specialty disposal, hazardous materials, third-party disposal charges, and other special-service costs may be excluded.</p>
      </section>
    </main>
  );
}
