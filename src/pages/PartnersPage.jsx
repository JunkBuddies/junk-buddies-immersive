import React, { useMemo, useState } from "react";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

const partnerTypes = [
  {
    key: "property",
    label: "Property Managers",
    title: "A dependable removal partner for the property.",
    text: "Use Junk Buddies for turnovers, abandoned furniture, appliances, bulk items, storage areas, resident move-outs, and recurring property cleanups.",
    bullets: ["Unit turnovers", "Bulk-item removal", "Resident referrals"],
  },
  {
    key: "realtor",
    label: "Realtors",
    title: "Clear the property before the next showing or closing.",
    text: "Give sellers and buyers a direct removal option when furniture, appliances, garage items, or move-out debris need to disappear quickly.",
    bullets: ["Pre-listing cleanups", "Move-out support", "Client referral codes"],
  },
  {
    key: "storage",
    label: "Storage",
    title: "A cleaner exit for abandoned or unwanted contents.",
    text: "Support unit cleanouts and customer referrals without searching for a new hauler every time a unit needs attention.",
    bullets: ["Unit cleanouts", "Abandoned contents", "Customer referrals"],
  },
  {
    key: "contractor",
    label: "Contractors",
    title: "Keep projects moving without hauling becoming another job.",
    text: "A local removal option for light renovation debris, fixtures, furniture, appliances, and non-hazardous project cleanups.",
    bullets: ["Project cleanup", "Fixture removal", "Client handoffs"],
  },
  {
    key: "moving",
    label: "Movers",
    title: "Give customers somewhere to send what does not make the move.",
    text: "When a customer decides something is not coming with them, your team can hand them directly to Junk Buddies.",
    bullets: ["Pre-move purge", "Left-behind items", "Referral support"],
  },
  {
    key: "estate",
    label: "Estates & Senior Services",
    title: "A more considerate path through difficult cleanouts.",
    text: "Coordinate removal for downsizing, estate transitions, family cleanouts, and larger household projects with one local point of contact.",
    bullets: ["Downsizing", "Estate cleanouts", "Family coordination"],
  },
  {
    key: "business",
    label: "Local Businesses",
    title: "A preferred local option when space needs to be cleared.",
    text: "Use the program for office furniture, back-room cleanouts, equipment removal, recurring bulk items, or customer referrals.",
    bullets: ["Office cleanouts", "Bulk-item pickups", "Local referrals"],
  },
];

const steps = [
  ["Join", "Tell us about your business and how you expect to use the partnership."],
  ["Get approved", "Approved partners receive a unique Junk Buddies partner code."],
  ["Share or book", "Use the code for qualifying projects, residents, clients, or customers."],
  ["We track it", "Jobs are connected back to your partner relationship automatically."],
];

const initialApplication = {
  businessName: "",
  category: "Property Managers",
  website: "",
  serviceArea: "",
  contactName: "",
  role: "",
  phone: "",
  email: "",
  audience: "",
  volume: "",
  notes: "",
};

export default function PartnersPage() {
  const [activeType, setActiveType] = useState(partnerTypes[0].key);
  const [applicationOpen, setApplicationOpen] = useState(false);
  const [appStep, setAppStep] = useState(0);
  const [application, setApplication] = useState(initialApplication);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const active = useMemo(
    () => partnerTypes.find((item) => item.key === activeType) || partnerTypes[0],
    [activeType]
  );

  const fieldClass =
    "w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-[15px] text-[#171512] outline-none transition placeholder:text-black/30 focus:border-[#b89b46] focus:ring-4 focus:ring-[#b89b46]/10";

  const update = (name, value) => {
    setApplication((current) => ({ ...current, [name]: value }));
    setError("");
  };

  const openApplication = () => {
    setApplicationOpen(true);
    setSubmitted(false);
    setError("");
    requestAnimationFrame(() => {
      document.getElementById("partner-application")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const validateStep = () => {
    if (appStep === 0 && (!application.businessName.trim() || !application.category.trim())) {
      return "Add your business name and partner type.";
    }
    if (
      appStep === 1 &&
      (!application.contactName.trim() ||
        !application.phone.trim() ||
        !application.email.trim())
    ) {
      return "Add your name, phone number, and email.";
    }
    return "";
  };

  const nextApplicationStep = () => {
    const message = validateStep();
    if (message) {
      setError(message);
      return;
    }
    setAppStep((current) => Math.min(current + 1, 2));
  };

  const submitApplication = async () => {
    const message = validateStep();
    if (message) {
      setError(message);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await addDoc(collection(db, "partnerApplications"), {
        ...application,
        status: "New",
        source: "partners-page",
        createdAt: Timestamp.now(),
      });
      setSubmitted(true);
      setAppStep(0);
      setApplication(initialApplication);
    } catch (err) {
      console.error("Partner application failed:", err);
      setError("We couldn't submit the application yet. Please try again or call 346-593-6080.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f0e7] text-[#171512]">
      <section className="relative overflow-hidden border-b border-black/10 bg-[#f7f3eb] px-5 py-16 sm:px-8 sm:py-24 lg:py-28">
        <div className="absolute -right-20 top-10 h-72 w-72 rounded-full bg-[#c8b477]/20 blur-3xl" />
        <div className="absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-white blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#b89b46]/25 bg-white/70 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#8e742a] shadow-sm backdrop-blur">
              Junk Buddies Partner Network
            </div>
            <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[1.02] sm:text-6xl lg:text-7xl">
              Built for better
              <span className="block font-serif font-medium italic text-[#9f8031]">
                business relationships.
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-black/58 sm:text-lg">
              Give residents, clients, customers, and teams a dependable local removal option with preferred partner pricing and a direct relationship with Junk Buddies.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={openApplication} className="jb-polished-gold-button">
                Become a Partner
              </button>
              <a
                href="#how-it-works"
                className="rounded-xl border border-black/15 bg-white/70 px-6 py-3 text-center font-bold text-black/75 transition hover:border-black/25 hover:bg-white"
              >
                See How It Works
              </a>
            </div>

            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-sm text-black/45">
              <span>No minimum job requirement</span>
              <span>•</span>
              <span>Houston-area service</span>
              <span>•</span>
              <span>Unique partner code</span>
            </div>
          </div>

          <div className="rounded-[34px] border border-black/10 bg-[#171512] p-5 text-white shadow-[0_30px_80px_rgba(42,34,17,.18)] sm:p-8">
            <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[.08] to-transparent p-6 sm:p-8">
              <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#d9c37a]">
                The relationship
              </div>
              <div className="mt-8 space-y-5">
                {[
                  ["01", "Your business"],
                  ["02", "Junk Buddies"],
                  ["03", "Your customer"],
                ].map(([num, label], index) => (
                  <div key={label}>
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#c8b477]/35 bg-[#c8b477]/10 text-xs font-black text-[#e0cf91]">
                        {num}
                      </div>
                      <div className="text-xl font-black">{label}</div>
                    </div>
                    {index < 2 && (
                      <div className="ml-[21px] h-8 w-px bg-gradient-to-b from-[#c8b477]/80 to-[#c8b477]/10" />
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-8 rounded-2xl border border-[#c8b477]/20 bg-[#c8b477]/10 p-4 text-sm leading-6 text-white/65">
                One local relationship, one partner code, and a cleaner handoff when removal work comes up.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-black/10 bg-white/55 px-5 py-14 sm:px-8 sm:py-18">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[.8fr_1.2fr] md:items-center">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#9a7d2f]">
              Partnership, not a coupon
            </div>
            <h2 className="mt-3 text-3xl font-black sm:text-5xl">
              A stronger reason to keep Junk Buddies in your network.
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["Preferred pricing", "Qualifying standard projects may receive up to 30% preferred partner pricing."],
              ["Direct relationship", "Your team has a known local removal company instead of searching every time."],
              ["Better handoff", "Residents and clients get a clear next step from a business they already trust."],
            ].map(([title, text]) => (
              <article key={title} className="rounded-3xl border border-black/8 bg-[#fbf9f4] p-5 shadow-sm">
                <h3 className="text-lg font-black">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-black/50">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#9a7d2f]">Who it's for</div>
            <h2 className="mt-3 text-3xl font-black sm:text-5xl">
              Different industries. One removal partner.
            </h2>
          </div>

          <div className="mt-9 overflow-x-auto pb-2">
            <div className="flex min-w-max gap-2">
              {partnerTypes.map((item) => {
                const selected = item.key === activeType;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setActiveType(item.key)}
                    className={
                      "rounded-full border px-4 py-2.5 text-sm font-bold transition " +
                      (selected
                        ? "border-[#171512] bg-[#171512] text-white shadow-md"
                        : "border-black/10 bg-white/65 text-black/55 hover:bg-white")
                    }
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5 grid gap-8 rounded-[34px] border border-black/10 bg-white/70 p-6 shadow-sm sm:p-9 lg:grid-cols-[1fr_.8fr]">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#9a7d2f]">{active.label}</div>
              <h3 className="mt-3 max-w-2xl text-2xl font-black sm:text-4xl">{active.title}</h3>
              <p className="mt-4 max-w-2xl text-base leading-7 text-black/55">{active.text}</p>
            </div>
            <div className="grid gap-3">
              {active.bullets.map((bullet, index) => (
                <div key={bullet} className="flex items-center gap-4 rounded-2xl border border-black/8 bg-[#f5f1e8] px-4 py-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#171512] text-[10px] font-black text-[#d7bf70]">
                    0{index + 1}
                  </span>
                  <span className="font-bold text-black/70">{bullet}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-y border-black/10 bg-[#171512] px-5 py-16 text-white sm:px-8 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#d5bd70]">How it works</div>
            <h2 className="mt-3 text-3xl font-black sm:text-5xl">Simple enough to actually use.</h2>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-4">
            {steps.map(([title, text], index) => (
              <article key={title} className="group rounded-3xl border border-white/10 bg-white/[.04] p-5 transition hover:-translate-y-1 hover:border-[#c8b477]/35 hover:bg-white/[.06]">
                <div className="text-xs font-black tracking-[0.18em] text-[#d4bd70]">0{index + 1}</div>
                <h3 className="mt-7 text-xl font-black">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/50">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#9a7d2f]">Preferred partner rate</div>
            <div className="mt-4 text-6xl font-black tracking-tight text-[#171512] sm:text-7xl">Up to 30%</div>
            <p className="mt-4 max-w-md text-base leading-7 text-black/55">
              Preferred pricing applies to qualifying standard removal projects. The program is designed to support an ongoing business relationship, not one-time coupon hunting.
            </p>
          </div>

          <div className="rounded-[34px] border border-black/10 bg-white/70 p-6 sm:p-9">
            <h3 className="text-2xl font-black">What stays outside the partner discount</h3>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                "Specialty disposal fees",
                "Hazardous or restricted materials",
                "Third-party disposal charges",
                "Premium fixed-price items",
                "Custom cleanouts requiring review",
                "Other special-service costs",
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-black/8 bg-[#f5f1e8] px-4 py-4 text-sm font-semibold text-black/65">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="partner-application" className="border-t border-black/10 bg-[#ede6d8] px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-5xl">
          {!applicationOpen ? (
            <div className="rounded-[36px] border border-black/10 bg-[#171512] p-8 text-center text-white shadow-[0_25px_70px_rgba(42,34,17,.2)] sm:p-12">
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#d5bd70]">Become a partner</div>
              <h2 className="mt-3 text-3xl font-black sm:text-5xl">Make the next cleanout easier.</h2>
              <p className="mx-auto mt-4 max-w-2xl text-white/50">
                Apply once. If approved, we'll set up your partner relationship and unique Junk Buddies code.
              </p>
              <button type="button" onClick={openApplication} className="jb-polished-gold-button mt-8">
                Start Partner Application
              </button>
            </div>
          ) : submitted ? (
            <div className="rounded-[36px] border border-black/10 bg-white/80 p-8 text-center shadow-sm sm:p-12">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#171512] text-2xl text-[#d8c176]">✓</div>
              <h2 className="mt-5 text-3xl font-black sm:text-4xl">Application received.</h2>
              <p className="mx-auto mt-3 max-w-xl text-black/55">
                We'll review your information and contact you regarding your Junk Buddies partner account.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-[36px] border border-black/10 bg-white/80 shadow-sm">
              <div className="border-b border-black/8 px-6 py-5 sm:px-8">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9a7d2f]">Partner application</div>
                    <h2 className="mt-1 text-2xl font-black">Step {appStep + 1} of 3</h2>
                  </div>
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map((index) => (
                      <div key={index} className={"h-1.5 w-9 rounded-full " + (index <= appStep ? "bg-[#b89b46]" : "bg-black/10")} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                {appStep === 0 && (
                  <div>
                    <h3 className="text-2xl font-black">Tell us about the business.</h3>
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      <input className={fieldClass} value={application.businessName} onChange={(e) => update("businessName", e.target.value)} placeholder="Business name" />
                      <select className={fieldClass} value={application.category} onChange={(e) => update("category", e.target.value)}>
                        {partnerTypes.map((item) => <option key={item.key}>{item.label}</option>)}
                      </select>
                      <input className={fieldClass} value={application.website} onChange={(e) => update("website", e.target.value)} placeholder="Website (optional)" />
                      <input className={fieldClass} value={application.serviceArea} onChange={(e) => update("serviceArea", e.target.value)} placeholder="Primary service area" />
                    </div>
                  </div>
                )}

                {appStep === 1 && (
                  <div>
                    <h3 className="text-2xl font-black">Who should we contact?</h3>
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      <input className={fieldClass} value={application.contactName} onChange={(e) => update("contactName", e.target.value)} placeholder="Your name" />
                      <input className={fieldClass} value={application.role} onChange={(e) => update("role", e.target.value)} placeholder="Role / title" />
                      <input className={fieldClass} value={application.phone} onChange={(e) => update("phone", e.target.value)} placeholder="Phone number" type="tel" />
                      <input className={fieldClass} value={application.email} onChange={(e) => update("email", e.target.value)} placeholder="Email address" type="email" />
                    </div>
                  </div>
                )}

                {appStep === 2 && (
                  <div>
                    <h3 className="text-2xl font-black">How would you use the partnership?</h3>
                    <div className="mt-6 grid gap-4">
                      <input className={fieldClass} value={application.audience} onChange={(e) => update("audience", e.target.value)} placeholder="Residents, clients, customers, properties, projects..." />
                      <input className={fieldClass} value={application.volume} onChange={(e) => update("volume", e.target.value)} placeholder="Approximate monthly opportunities (optional)" />
                      <textarea className={fieldClass + " min-h-32 resize-y"} value={application.notes} onChange={(e) => update("notes", e.target.value)} placeholder="Anything else we should know?" />
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mt-5 rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {error}
                  </div>
                )}

                <div className="mt-7 flex gap-3">
                  {appStep > 0 && (
                    <button type="button" onClick={() => { setError(""); setAppStep((current) => current - 1); }} className="rounded-xl border border-black/15 bg-white px-5 py-3 font-bold text-black/65">
                      Back
                    </button>
                  )}
                  {appStep < 2 ? (
                    <button type="button" onClick={nextApplicationStep} className="jb-polished-gold-button flex-1">
                      Continue
                    </button>
                  ) : (
                    <button type="button" onClick={submitApplication} disabled={submitting} className="jb-polished-gold-button flex-1 disabled:opacity-50">
                      {submitting ? "Submitting..." : "Submit Application"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          <p className="mx-auto mt-6 max-w-3xl text-center text-xs leading-5 text-black/38">
            Partner pricing applies only to qualifying standard removal services and is subject to approval. Specialty disposal, hazardous materials, premium fixed-price items, third-party charges, and custom projects may be excluded.
          </p>
        </div>
      </section>
    </main>
  );
}
