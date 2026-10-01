import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

function LandingPage() {
  const navigate = useNavigate();
  const [topTheme, setTopTheme] = useState(() => localStorage.getItem("jb_top_theme") || "night");

  useEffect(() => {
    const syncTheme = (event) => setTopTheme(event.detail || document.documentElement.dataset.jbTopTheme || "night");
    window.addEventListener("jb-top-theme", syncTheme);
    return () => window.removeEventListener("jb-top-theme", syncTheme);
  }, []);

  // === HERO SLIDES ===
  const slides = [
    { id: 0, image: "/images/houston-skyline.png", alt: "Houston Skyline" },
    { id: 1, image: "/images/donation-drop.png", alt: "Donation Drop" },
    { id: 2, image: "/images/truck-fleet.png", alt: "Junk Buddies Fleet" },
  ];

  const [centerIndex, setCenterIndex] = useState(0);
  const leftIndex = (centerIndex - 1 + slides.length) % slides.length;
  const rightIndex = (centerIndex + 1) % slides.length;

  useEffect(() => {
    const timer = setInterval(() => {
      setCenterIndex((p) => (p + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const goNext = () => setCenterIndex((p) => (p + 1) % slides.length);
  const goPrev = () => setCenterIndex((p) => (p - 1 + slides.length) % slides.length);

  // === DEVICE DETECTION ===
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 768 : false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getImage = (img) => {
    if (!img.endsWith(".webp")) return img;
    return isMobile ? img.replace(".webp", "-mobile.webp") : img;
  };

  // === SERVICE DATA ===
  const mainServices = [
    { title: "Mattress Removal", image: "/images/mattress.webp", link: "/mattress-removal" },
    { title: "Couch Removal", image: "/images/couch.webp", link: "/couch-removal" },
    { title: "Fridge Removal", image: "/images/fridge.webp", link: "/fridge-removal" },
    { title: "Washer & Dryer Removal", image: "/images/washer-dryer.webp", link: "/washer-dryer-removal" },
    { title: "Desk Removal", image: "/images/desk.webp", link: "/desk-removal" },
  ];

  const otherServices = [
    { title: "Bed Removal", image: "/images/bed.webp", link: "/bed-removal" },
    { title: "Trampoline Removal", image: "/images/trampoline.webp", link: "/trampoline-removal" },
    { title: "Recliner Removal", image: "/images/recliner.webp", link: "/recliner-removal" },
    { title: "Sectional Removal", image: "/images/sectional-couch.webp", link: "/sectional-couch" },
    { title: "Table Removal", image: "/images/table.webp", link: "/table-removal" },
  ];

  const cities = [
    { title: "Houston", image: "/images/Houston.webp", link: "/houston" },
    { title: "Katy", image: "/images/Katy.webp", link: "/katy" },
    { title: "Sugar Land", image: "/images/Sugar-Land.webp", link: "/sugar-land" },
    { title: "Pearland", image: "/images/Pearland.webp", link: "/pearland" },
    { title: "The Woodlands", image: "/images/the-woodlands.webp", link: "/the-woodlands" },
  ];

  const blogs = [
    { title: "How Much Does Junk Removal Cost?", image: "/images/pricing.webp", link: "/blog/junk-removal-cost" },
    { title: "Save Money on Junk Removal", image: "/images/save-money.webp", link: "/blog/save-money" },
    { title: "Eco-Friendly Disposal in Houston", image: "/images/eco.webp", link: "/blog/eco-friendly" },
    { title: "Top 10 Items We Remove Most Often", image: "/images/top10.webp", link: "/blog/top-10-items" },
    { title: "Houston's Guide to Responsible Recycling", image: "/images/recycle.webp", link: "/blog/houston-recycling" },
  ];

  const faqs = [
    {
      q: "Do I need to be home?",
      a: "Not always! We can remove items curbside or from access areas.",
      image: "/images/faq-home.webp",
      link: "/faq#do-i-need-to-be-home",
    },
    {
      q: "When do I pay?",
      a: "You don’t pay until the job is complete and you’re satisfied.",
      image: "/images/faq-payment.webp",
      link: "/faq#when-do-i-pay",
    },
    {
      q: "Do you recycle?",
      a: "Yes! We donate and recycle whenever possible to reduce landfill waste.",
      image: "/images/faq-recycle.webp",
      link: "/faq#do-you-recycle",
    },
    {
      q: "Do you take hazardous materials?",
      a: "We follow safety guidelines and local laws — contact us for specifics.",
      image: "/images/faq-hazard.webp",
      link: "/faq#hazardous-materials",
    },
    {
      q: "Can I get a same-day pickup?",
      a: "Yes, depending on truck availability and your location. Book early to lock in.",
      image: "/images/faq-sameday.webp",
      link: "/faq#same-day-pickup",
    },
  ];

  const mainServicesRef = useRef(null);
  const serviceDrag = useRef({ active: false, startX: 0, startScrollLeft: 0, moved: false });

  const handleServiceWheel = (event) => {
    const rail = mainServicesRef.current;
    if (!rail || rail.scrollWidth <= rail.clientWidth) return;

    // Preserve native two-finger horizontal trackpad scrolling.
    // A regular vertical wheel over this rail is translated horizontally.
    if (Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;

    const delta = event.deltaY;
    const atStart = rail.scrollLeft <= 0;
    const atEnd = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 1;
    if ((delta < 0 && atStart) || (delta > 0 && atEnd)) return;

    event.preventDefault();
    rail.scrollLeft += delta;
  };

  const startServiceDrag = (event) => {
    const rail = mainServicesRef.current;
    if (!rail) return;
    serviceDrag.current = {
      active: true,
      startX: event.clientX,
      startScrollLeft: rail.scrollLeft,
      moved: false,
    };
    rail.setPointerCapture?.(event.pointerId);
  };

  const moveServiceDrag = (event) => {
    const rail = mainServicesRef.current;
    const drag = serviceDrag.current;
    if (!rail || !drag.active) return;
    const distance = event.clientX - drag.startX;
    if (Math.abs(distance) > 5) drag.moved = true;
    rail.scrollLeft = drag.startScrollLeft - distance;
  };

  const endServiceDrag = (event) => {
    const rail = mainServicesRef.current;
    if (rail?.hasPointerCapture?.(event.pointerId)) rail.releasePointerCapture(event.pointerId);
    serviceDrag.current.active = false;
  };

  const openService = (link) => {
    if (serviceDrag.current.moved) {
      serviceDrag.current.moved = false;
      return;
    }
    navigate(link);
  };

  const rowRefs = {
    other: useRef(null),
    cities: useRef(null),
    blogs: useRef(null),
    faq: useRef(null),
  };

  const heroHeight = isMobile
    ? "h-[140px]"
    : "h-[200px] sm:h-[250px] md:h-[275px] lg:h-[300px]";

  return (
    <div className="w-full bg-black text-white overflow-x-hidden overflow-y-auto relative">

      {/* === FULL-VIEWPORT EDITORIAL INTRO === */}
      <section className="relative isolate min-h-[calc(100svh-56px)] lg:min-h-[calc(100svh-64px)] w-full overflow-hidden bg-[#1b1b1a]">
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 76% 45%, rgba(184,134,55,0.13), transparent 28%), radial-gradient(circle at 62% 72%, rgba(212,175,55,0.06), transparent 24%), linear-gradient(135deg, #20201f 0%, #181817 52%, #111110 100%)",
          }}
        />
        <div aria-hidden="true" className="absolute inset-0 opacity-[0.16]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.018) 1px, transparent 1px)", backgroundSize: "42px 42px" }} />

        <div className="relative z-20 mx-auto flex min-h-[calc(100svh-56px)] lg:min-h-[calc(100svh-64px)] w-full max-w-[1600px] items-center px-6 sm:px-10 lg:px-16 xl:px-20">
          <div className="relative z-30 w-full max-w-[650px] pb-[42vh] sm:pb-[36vh] lg:pb-0 lg:w-[47%]">
            <div className="mb-5 flex items-center gap-4 text-[10px] sm:text-xs font-medium uppercase tracking-[0.34em]">
              <span className="h-px w-10 bg-[#aa9257]" />
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(180deg, #6f4d12 0%, #b88722 10%, #f6df86 22%, #fff7c7 31%, #d6a936 38%, #8a5c10 48%, #f2cf63 58%, #fff3ad 66%, #c18b20 75%, #765014 88%, #d4a63e 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  filter: "drop-shadow(0 1px 0 rgba(255,248,205,0.34)) drop-shadow(0 5px 12px rgba(0,0,0,0.34))",
                  textShadow: "0 -1px 0 rgba(255,255,220,0.16), 0 1px 0 rgba(72,43,4,0.32)",
                }}
              >
                Junk Buddies
              </span>
            </div>
            <h1 className="max-w-[620px] text-[clamp(2.65rem,7.2vw,6.8rem)] font-semibold leading-[0.91] tracking-[-0.055em] text-[#f3f1ec]">
              Making space
              <span
                className="mt-2 block bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(180deg, #6f4d12 0%, #b88722 10%, #f6df86 22%, #fff7c7 31%, #d6a936 38%, #8a5c10 48%, #f2cf63 58%, #fff3ad 66%, #c18b20 75%, #765014 88%, #d4a63e 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  filter: "drop-shadow(0 1px 0 rgba(255,248,205,0.34)) drop-shadow(0 5px 12px rgba(0,0,0,0.34))",
                  textShadow: "0 -1px 0 rgba(255,255,220,0.16), 0 1px 0 rgba(72,43,4,0.32)",
                }}
              >
                For what matters.
              </span>
            </h1>
            <p className="mt-6 max-w-[520px] text-sm sm:text-base lg:text-lg leading-relaxed text-white/52">
              Houston junk removal with upfront pricing, flexible scheduling, and no payment until the job is done.
            </p>
            <button
              type="button"
              onClick={() => document.getElementById("jb-open-button")?.click()}
              className="group mt-8 inline-flex items-center gap-5 rounded-full border border-[#a99056]/70 bg-black/10 px-7 py-3.5 text-xs sm:text-sm font-medium uppercase tracking-[0.18em] text-[#c8b477] backdrop-blur-sm transition duration-300 hover:border-[#cbb77a] hover:bg-[#aa9257]/10 hover:text-[#e0cf91]"
            >
              Get instant price
              <span className="text-lg transition-transform duration-300 group-hover:translate-x-1">→</span>
            </button>
          </div>

          {/* Viewport-safe art stage: never lets the artwork escape the physical screen */}
          <div className="pointer-events-none absolute inset-x-6 bottom-14 top-[57%] sm:inset-x-10 sm:top-[52%] lg:inset-y-[12%] lg:left-[54%] lg:right-[5%] xl:left-[56%] xl:right-[7%]">
            <div className="relative h-full w-full overflow-visible">
              {/* Sparse museum-display geometry: deliberately broken so it reads as space, not a card */}
              <div aria-hidden="true" className="absolute inset-[7%] opacity-45">
                <span className="absolute left-0 top-0 h-px w-[38%] bg-gradient-to-r from-[#c8b477]/65 to-transparent" />
                <span className="absolute left-0 top-0 h-[30%] w-px bg-gradient-to-b from-[#c8b477]/55 to-transparent" />
                <span className="absolute bottom-0 right-0 h-px w-[34%] bg-gradient-to-l from-white/25 to-transparent" />
                <span className="absolute bottom-0 right-0 h-[26%] w-px bg-gradient-to-t from-white/20 to-transparent" />
              </div>
              <div aria-hidden="true" className="absolute left-[4%] right-[3%] top-[48%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <div aria-hidden="true" className="absolute left-[54%] top-[10%] h-[70%] w-px bg-gradient-to-b from-transparent via-[#c8b477]/12 to-transparent" />
              <div aria-hidden="true" className="absolute left-[17%] top-[31%] h-px w-[16%] rotate-[-8deg] bg-white/10" />
              <div aria-hidden="true" className="absolute right-[9%] top-[29%] h-px w-[11%] rotate-[7deg] bg-[#c8b477]/18" />
              <div aria-hidden="true" className="absolute left-[8%] top-[47%] flex items-center gap-2 opacity-35">
                <span className="h-1 w-1 rounded-full bg-[#e0cf91]" />
                <span className="h-px w-5 bg-[#c8b477]" />
              </div>
              <div aria-hidden="true" className="absolute bottom-[8%] left-[23%] h-[7%] w-[58%] rounded-[50%] border border-white/[0.06] bg-black/15 blur-[1px] shadow-[0_18px_34px_rgba(0,0,0,0.38)]" />
              <div aria-hidden="true" className="absolute bottom-[17%] left-[54%] h-[12%] w-px bg-gradient-to-b from-[#c8b477]/20 to-transparent" />
              <div aria-hidden="true" className="absolute bottom-[16%] left-[calc(54%-5px)] h-px w-[11px] bg-[#c8b477]/25" />

              <div className="absolute inset-0 flex items-center justify-center transition-transform duration-500 ease-out hover:-translate-y-1">
                <img
                  src="/images/jb-buddies-sculpture.png?v=20260930-2"
                  alt="Two sculptural Junk Buddies figures"
                  className="block max-h-full max-w-full object-contain drop-shadow-[0_30px_48px_rgba(0,0,0,0.62)]"
                  style={{ width: "auto", height: "auto" }}
                />
              </div>
              <div className="absolute left-[11%] top-[16%] h-[40%] w-[22%] rotate-[31deg] lg:left-[5%] lg:top-[18%] lg:h-[48%] lg:w-[21%]">
                <img
                  src="/images/jb-gold-shovel.png"
                  alt=""
                  className="h-full w-full object-contain drop-shadow-[0_24px_38px_rgba(0,0,0,0.55)]"
                />
              </div>
              <div aria-hidden="true" className="absolute bottom-[5%] left-[18%] h-[16%] w-[64%] rounded-[50%] bg-[#aa9257]/8 blur-3xl" />
            </div>
          </div>

          <div className="absolute bottom-5 left-1/2 z-30 -translate-x-1/2 text-center text-[9px] uppercase tracking-[0.28em] text-white/30">
            Scroll to explore
            <div className="mx-auto mt-2 h-7 w-px bg-gradient-to-b from-[#b7a064]/70 to-transparent" />
          </div>
        </div>
      </section>

      {/* =========================
          STACK A: TOP (Hero + Rows)
          Isolated to prevent horizontal overflow affecting the rest
         ========================= */}
      <div
        id="stack-a"
        className={`relative w-full overflow-x-hidden isolate transition-colors duration-700 ${topTheme === "day" ? "bg-[#25241f]" : "bg-black"}`}
        style={{ contain: "layout paint" }}
      >
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ${topTheme === "day" ? "opacity-100" : "opacity-0"}`}
          style={{
            background:
              "radial-gradient(circle at 50% 12%, rgba(212,175,55,0.14), transparent 32%), linear-gradient(180deg, #343128 0%, #25241f 48%, #171717 100%)",
          }}
        />
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ${topTheme === "night" ? "opacity-100" : "opacity-0"}`}
          style={{
            background:
              "radial-gradient(circle at 50% 8%, rgba(212,175,55,0.07), transparent 28%), linear-gradient(180deg, #090909 0%, #050505 62%, #000 100%)",
          }}
        />

{/* === HERO: VIEWPORT-CENTERED CINEMATIC CAROUSEL === */}
<section className="relative mt-4 sm:mt-6 mb-4 py-2 sm:py-3" style={{ height: "clamp(156px, 22vw, 324px)" }}>
  <div
    className="absolute overflow-hidden"
    style={{
      left: "50vw",
      width: "100vw",
      transform: "translateX(-50%)",
      top: 0,
      height: "100%",
    }}
  >
    {/* Previous preview — smaller, separated, partially off-screen */}
    <button
      type="button"
      onClick={goPrev}
      aria-label="Show previous hero image"
      className="absolute overflow-hidden rounded-2xl border border-gold/25 shadow-xl opacity-60 transition-all duration-700 ease-in-out hover:opacity-80 focus:outline-none"
      style={{
        width: "clamp(220px, 34vw, 560px)",
        height: "82%",
        left: "calc(50% - min(32vw, 520px) - min(29vw, 475px) - 24px)",
        top: "9%",
      }}
    >
      <img src={slides[leftIndex].image} alt={slides[leftIndex].alt} className="w-full h-full object-cover" />
    </button>

    {/* Active card — its center is always the physical viewport center */}
    <div
      className="absolute z-20 overflow-hidden rounded-2xl border border-gold/50 shadow-2xl transition-all duration-700 ease-in-out"
      style={{
        width: "min(64vw, 1040px)",
        height: "100%",
        left: "50%",
        top: 0,
        transform: "translateX(-50%)",
      }}
    >
      <img src={slides[centerIndex].image} alt={slides[centerIndex].alt} className="w-full h-full object-cover" />
      <div className={`absolute inset-0 transition-colors duration-700 ${topTheme === "day" ? "bg-gradient-to-t from-black/55 via-black/10 to-transparent" : "bg-gradient-to-t from-black via-black/25 to-transparent"}`} />
    </div>

    {/* Next preview — exact mirror of previous with a visible 24px+ gap */}
    <button
      type="button"
      onClick={goNext}
      aria-label="Show next hero image"
      className="absolute overflow-hidden rounded-2xl border border-gold/25 shadow-xl opacity-60 transition-all duration-700 ease-in-out hover:opacity-80 focus:outline-none"
      style={{
        width: "clamp(220px, 34vw, 560px)",
        height: "82%",
        right: "calc(50% - min(32vw, 520px) - min(29vw, 475px) - 24px)",
        top: "9%",
      }}
    >
      <img src={slides[rightIndex].image} alt={slides[rightIndex].alt} className="w-full h-full object-cover" />
    </button>
  </div>
</section>


{/* === MAIN SERVICES === */}
<section className="relative z-30 px-2 sm:px-4 md:px-10 pt-6 pb-10 md:pt-12 md:pb-20 flex justify-center items-center">
  <div
    ref={mainServicesRef}
    onWheel={handleServiceWheel}
    onPointerDown={startServiceDrag}
    onPointerMove={moveServiceDrag}
    onPointerUp={endServiceDrag}
    onPointerCancel={endServiceDrag}
    className="flex flex-nowrap overflow-x-auto overscroll-x-contain snap-x snap-proximity scrollbar-hide
               touch-pan-x scroll-smooth w-full max-w-[1600px] mx-auto gap-4 sm:gap-5 md:gap-7
               px-3 sm:px-4 md:px-8 pb-3 cursor-grab active:cursor-grabbing"
    style={{
      WebkitOverflowScrolling: "touch",
      scrollbarWidth: "none",
      msOverflowStyle: "none",
      touchAction: "pan-x",
      userSelect: "none",
    }}
  >
    {mainServices.map((s) => (
      <div
        key={s.title}
        onClick={() => openService(s.link)}
        draggable={false}
        className={`cursor-pointer flex flex-col items-center flex-none snap-start
                   w-[42vw] sm:w-[220px] md:w-[260px] lg:w-[300px]
                   aspect-square
                   ${topTheme === "day" ? "bg-[#343128]/95" : "bg-zinc-900/90"} border border-gold/30 hover:border-gold rounded-xl
                   overflow-hidden shadow-md hover:scale-105 transition-transform`}
      >
        <img
          src={getImage(s.image)}
          alt={s.title}
          draggable="false"
          className="w-full h-full object-cover"
        />
        <h3 className="text-gold font-semibold text-[2.5vw] sm:text-xs md:text-sm mt-2 text-center">
          {s.title}
        </h3>
      </div>
    ))}
  </div>
</section>


        {/* === REUSABLE SCROLL ROWS === */}
        {[
          { key: "other", label: "Other Services", data: otherServices },
          { key: "cities", label: "Cities", data: cities },
          { key: "blogs", label: "Blogs & Articles", data: blogs },
          { key: "faq", label: "FAQ", data: faqs },
        ].map((section) => (
          <section key={section.key} className="relative z-30 px-4 md:px-8 pb-14 md:pb-16">
            <div className="text-gold text-sm font-semibold mb-2 pl-3">{section.label}</div>

            <div className="relative flex items-center">
              <div
                ref={rowRefs[section.key]}
                className="flex overflow-x-auto snap-x snap-mandatory gap-4 md:gap-7 pb-6 scrollbar-hide w-full px-[20px]"
              >
                {section.data.map((item, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div
                      onClick={() => item.link && navigate(item.link)}
                      className={`cursor-pointer flex-shrink-0 ${
                        isMobile
                          ? "w-[96px] h-[144px]"
                          : "w-[240px] md:w-[320px] h-[140px] md:h-[190px]"
                      } bg-zinc-900/90 border border-gold/30 hover:border-gold rounded-xl 
                        overflow-hidden shadow-lg snap-center hover:scale-105 transition-transform`}
                    >
                      {"image" in item ? (
                        <img
                          src={getImage(item.image)}
                          alt={item.title || item.q}
                          className="w-full h-full object-cover"
                        />
                      ) : null}
                    </div>
                    <h3 className="text-gold font-semibold text-xs md:text-base mt-2 px-2 text-center">
                      {item.title || item.q}
                    </h3>
                    {item.a && <p className="text-gray-400 text-xs mt-1 px-2 text-center">{item.a}</p>}
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* =========================
          STACK B: EVERYTHING FROM "Require service today" DOWN
          Fully separated so it behaves independently
         ========================= */}
      <main
        id="stack-b"
        className="relative w-full max-w-[100vw] overflow-x-clip isolate"
        style={{ contain: "layout paint" }}
      >
        {/* REQUIRE SERVICE TODAY BAR */}
        <div className="w-full text-center text-lg text-white py-10 px-6 about-reveal silver">
          <p className="text-xl mb-4">
            Require service today? Call us directly for immediate scheduling — your Same-Day Pickup is just a call away.
          </p>
          <a href="tel:3465936080" className="cta-metallic-button inline-block">
            Call Now
          </a>
        </div>

        {/* === INTRO: JUNK REMOVAL HOUSTON & SURROUNDING AREAS (SUBTLE VERSION) === */}
        <section className="bg-white text-gray-700 py-4 px-3 text-center border-t border-gold opacity-60 hover:opacity-80 transition-opacity duration-300">
          <h1 className="text-xs sm:text-sm font-semibold text-gold mb-1 tracking-wide">
            Junk Removal in Houston & Surrounding Areas
          </h1>
          <p className="max-w-3xl mx-auto text-[10px] sm:text-xs leading-snug text-gray-500">
            Junk Buddies LLC provides fast, affordable junk removal in Houston, TX and nearby areas like 
            Katy, Pearland, Pasadena, Cypress, Sugar Land, and The Woodlands. From furniture and appliances 
            to full property cleanouts, we make junk removal easy with same-day service, upfront pricing, 
            and eco-friendly recycling on every job.
          </p>
          <div className="flex justify-center mt-2">
            <button
              className="ai-price-button text-[10px] sm:text-xs px-2 py-1"
              onClick={() => document.getElementById('jb-open-button')?.click()}
            >
              View Price In Seconds
            </button>
          </div>
        </section>

        {/* === WHITE GLOVE SERVICE SECTION === */}
        <section className="relative w-full bg-[#fafafa] py-20 px-6 overflow-hidden">
          {/* Badge */}
          <div className="absolute top-6 left-6 flex items-center space-x-2">
            <span className="bg-gold text-black font-bold px-3 py-1 rounded-full text-xs shadow-md">
              ✓ White Glove
            </span>
          </div>

          <div className="max-w-7xl mx-auto flex flex-col lg:grid lg:grid-cols-2 gap-12 items-start relative">
            {/* Left Column */}
            <div className="text-gray-800 z-10 w-full">
              <h2 className="text-3xl sm:text-4xl font-bold text-gold mb-6">
                Junk Buddies: White Glove Junk Removal – For Your Peace of Mind
              </h2>
              <p className="text-lg mb-6 text-gray-700 leading-relaxed">
                From single-item pickups to full estate cleanouts, Junk Buddies handles it all with 
                care and precision. Whether it’s your home, office, storage unit, or yard, 
                we treat every removal like it’s our own space.
              </p>

              {/* Top 8 list with 2 images alongside (MOBILE ONLY) */}
              <div className="flex lg:hidden items-start gap-4">
                {/* List */}
                <ul className="w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left text-gray-900 mt-8">
                  <li>🛋️ Furniture</li>
                  <li>🏠 Appliances</li>
                  <li>💻 Electronics</li>
                  <li>🌳 Yard Waste & Debris</li>
                  <li>🗂️ Office Cleanouts</li>
                  <li>📦 Storage Units</li>
                  <li>🧹 Hoarder Cleanouts</li>
                  <li>🏡 Full Property Refresh</li>
                </ul>

                {/* First 2 images (stacked) */}
                <div className="w-1/2 grid grid-cols-1 gap-4">
                  <img
                    src="/images/proof-hoarder.jpg"
                    alt="Hoarder garage cleanout"
                    className="rounded-lg shadow-md border border-gold/30 hover:scale-105 transition-transform"
                  />
                  <img
                    src="/images/proof-home.jpg"
                    alt="Home cleanout"
                    className="rounded-lg shadow-md border border-gold/30 hover:scale-105 transition-transform"
                  />
                </div>
              </div>

              {/* Desktop Top 8 List (unchanged, no images) */}
              <ul className="hidden lg:grid grid-cols-1 sm:grid-cols-2 gap-4 text-left text-gray-900">
                <li>🛋️ Furniture</li>
                <li>🏠 Appliances</li>
                <li>💻 Electronics</li>
                <li>🌳 Yard Waste & Debris</li>
                <li>🗂️ Office Cleanouts</li>
                <li>📦 Storage Units</li>
                <li>🧹 Hoarder Cleanouts</li>
                <li>🏡 Full Property Refresh</li>
              </ul>

              {/* Minimalist Divider */}
              <div className="my-6">
                <hr className="border-t border-gray-300 w-4/5 mx-auto" />
              </div>

              {/* Extended list */}
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left text-gray-900">
                <li>🛏️ Mattresses & Box Springs</li>
                <li>🚪 Doors, Windows & Fixtures</li>
                <li>🪞 Household Clutter & Decor</li>
                <li>🏗️ Hot Tubs & Above-Ground Pools</li>
                <li>🎹 Pianos & Large Specialty Items</li>
                <li>🏋️ Exercise Equipment</li>
                <li>🪵 Construction Debris & Lumber</li>
                <li>🏚️ Estate & Rental Cleanouts</li>
              </ul>
            </div>

            {/* Right Column (DESKTOP ONLY, all 4 images in grid) */}
            <div className="relative z-10 grid grid-cols-2 gap-4 w-full hidden lg:grid">
              <img
                src="/images/proof-hoarder.jpg"
                alt="Hoarder garage cleanout"
                className="rounded-lg shadow-md border border-gold/30 hover:scale-105 transition-transform"
              />
              <img
                src="/images/proof-home.jpg"
                alt="Home cleanout"
                className="rounded-lg shadow-md border border-gold/30 hover:scale-105 transition-transform"
              />
              <img
                src="/images/proof-storage-before.png"
                alt="Storage cleanout before"
                className="rounded-lg shadow-md border border-gold/30 hover:scale-105 transition-transform"
              />
              <img
                src="/images/proof-storage-after.png"
                alt="Storage cleanout after"
                className="rounded-lg shadow-md border border-gold/30 hover:scale-105 transition-transform"
              />
            </div>
          </div>

          {/* Last 2 images (MOBILE ONLY, under full list) */}
          <div className="grid grid-cols-2 gap-4 mt-6 lg:hidden max-w-7xl mx-auto">
            <img
              src="/images/proof-storage-before.png"
              alt="Storage cleanout before"
              className="rounded-lg shadow-md border border-gold/30 hover:scale-105 transition-transform"
            />
            <img
              src="/images/proof-storage-after.png"
              alt="Storage cleanout after"
              className="rounded-lg shadow-md border border-gold/30 hover:scale-105 transition-transform"
            />
          </div>

          {/* Questions Line */}
          <div className="max-w-7xl mx-auto mt-8 text-center lg:text-left">
            <p className="hidden lg:block font-semibold text-sm text-gray-700">
              ❓ Questions? All your answers can be found with{" "}
              <span className="relative font-bold text-gray-900 rgb-underline">
                Junk Buddies’ Assistant
              </span>
            </p>

            {/* CTA Button: View Price In Seconds (tablet & desktop) */}
            <div className="hidden sm:flex justify-center mt-4">
              <button
                className="ai-price-button"
                onClick={() => document.getElementById('jb-open-button')?.click()}
              >
                View Price In Seconds
              </button>
            </div>

            {/* Mobile: stacked */}
            <div className="lg:hidden">
              <p className="font-semibold text-sm text-gray-700">
                ❓ Questions? All your answers can be found with —
              </p>
              <p className="font-bold text-gray-900 rgb-underline mt-1 inline-block">
                Junk Buddies’ Assistant
              </p>

              {/* CTA Button: See Price In Seconds */}
              <div className="flex justify-center mt-4">
                <button
                  className="ai-price-button"
                  onClick={() => document.getElementById('jb-open-button')?.click()}
                >
                  View Price In Seconds
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* === DONATION & RECYCLING SECTION === */}
        <section className="relative w-full bg-[#fafafa] overflow-hidden">
          {/* Top Grey Separator Bar */}
          <div className="w-full h-4 bg-gray-200"></div>

          <div className="max-w-7xl mx-auto flex flex-row items-stretch relative">
            {/* Eco-Friendly Icons in Corners */}
            <div className="absolute top-4 left-4 text-green-600 text-2xl">♻️</div>
            <div className="absolute top-4 right-4 text-green-600 text-2xl">🌱</div>

            {/* Left Side – Photos */}
            <div className="bg-gray-100 flex flex-col justify-center items-center 
                            p-2 xs:p-3 sm:p-4 w-1/2 space-y-2 sm:space-y-4">
              <img
                src="/images/donation-placeholder1.png"
                alt="Donation proof 1"
                className="w-full sm:max-w-[80%] lg:max-w-[70%] h-auto object-cover 
                           rounded-lg shadow-md border border-gold/30"
              />
              <img
                src="/images/donation-placeholder2.png"
                alt="Donation proof 2"
                className="w-full sm:max-w-[80%] lg:max-w-[70%] h-auto object-cover 
                           rounded-lg shadow-md border border-gold/30"
              />
            </div>

            {/* Gold Divider */}
            <div className="w-px bg-gold"></div>

            {/* Right Side – Text */}
            <div className="w-1/2 flex-1 text-gray-800 
                            py-4 px-2 xs:py-6 xs:px-4 sm:py-10 sm:px-6 
                            lg:py-20 lg:px-12 bg-white">
              <h2 className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gold mb-4 sm:mb-6">
                Donation & Recycling — Built Into Every Job
              </h2>
              <p className="text-sm xs:text-base sm:text-lg mb-6 leading-relaxed text-gray-700">
                At Junk Buddies, responsible sorting is not optional — it’s how we operate. 
                Every pickup is evaluated for donation and recycling first, reducing landfill 
                impact, ensuring reusable items find a second life, and keeping your final price lower.
              </p>
              <p className="text-sm xs:text-base sm:text-lg mb-6 leading-relaxed text-gray-700 font-semibold">
                This approach means less waste, stronger communities, and better value in every service.
              </p>
              <p className="text-sm xs:text-base sm:text-lg mb-6 leading-relaxed text-gray-700">
                When you choose Junk Buddies, you’re not just clearing space — you’re{" "}
                <span className="font-bold text-gold">Making Space For What Matters.</span>
              </p>
              <p className="text-xs xs:text-sm font-semibold text-gray-600">
                Donation and recycling: included with every service, at no extra charge.
              </p>
            </div>
          </div>

          {/* Bottom Grey Separator Bar */}
          <div className="w-full h-4 bg-gray-200"></div>

          {/* Partner Logos */}
          <div className="max-w-7xl mx-auto mt-12 px-6">
            <h3 className="text-xl font-bold text-center text-gray-800 mb-6">
              Proud Partners In Donation & Recycling
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 items-center justify-items-center">
              {/* Goodwill */}
              <div className="relative w-full h-16 sm:h-20 flex items-center justify-center group cursor-pointer">
                <img
                  src="/images/goodwill-logo.png"
                  alt="Goodwill"
                  className="max-h-16 sm:max-h-20 object-contain transition duration-300 group-hover:opacity-0"
                />
                <p className="absolute inset-0 flex items-center justify-center text-xs sm:text-sm text-gray-700 font-semibold opacity-0 group-hover:opacity-100 transition duration-300 text-center px-2">
                  Goodwill: creating jobs & supporting communities.
                </p>
              </div>

              {/* Salvation Army */}
              <div className="relative w-full h-16 sm:h-20 flex items-center justify-center group cursor-pointer">
                <img
                  src="/images/Salvation-Army-logo.webp"
                  alt="Salvation Army"
                  className="max-h-16 sm:max-h-20 object-contain transition duration-300 group-hover:opacity-0"
                />
                <p className="absolute inset-0 flex items-center justify-center text-xs sm:text-sm text-gray-700 font-semibold opacity-0 group-hover:opacity-100 transition duration-300 text-center px-2">
                  Salvation Army: relief, shelter & family aid.
                </p>
              </div>

              {/* Habitat for Humanity */}
              <div className="relative w-full h-16 sm:h-20 flex items-center justify-center group cursor-pointer">
                <img
                  src="/images/Habitat_for_humanity_logo.png"
                  alt="Habitat for Humanity"
                  className="max-h-16 sm:max-h-20 object-contain transition duration-300 group-hover:opacity-0"
                />
                <p className="absolute inset-0 flex items-center justify-center text-xs sm:text-sm text-gray-700 font-semibold opacity-0 group-hover:opacity-100 transition duration-300 text-center px-2">
                  Habitat: building affordable homes for families.
                </p>
              </div>

              {/* Houston Furniture Bank */}
              <div className="relative w-full h-16 sm:h-20 flex items-center justify-center group cursor-pointer">
                <img
                  src="/images/Houston-furniture-bank-logo.png"
                  alt="Houston Furniture Bank"
                  className="max-h-16 sm:max-h-20 object-contain transition duration-300 group-hover:opacity-0"
                />
                <p className="absolute inset-0 flex items-center justify-center text-xs sm:text-sm text-gray-700 font-semibold opacity-0 group-hover:opacity-100 transition duration-300 text-center px-2">
                  Houston Furniture Bank: furnishing homes for those in need.
                </p>
              </div>

              {/* Books Between Kids */}
              <div className="relative w-full h-16 sm:h-20 flex items-center justify-center group cursor-pointer">
                <img
                  src="/images/books-between-kids-logo.png"
                  alt="Books Between Kids"
                  className="max-h-16 sm:max-h-20 object-contain transition duration-300 group-hover:opacity-0"
                />
                <p className="absolute inset-0 flex items-center justify-center text-xs sm:text-sm text-gray-700 font-semibold opacity-0 group-hover:opacity-100 transition duration-300 text-center px-2">
                  Books Between Kids: free books for Houston children.
                </p>
              </div>

              {/* Houston Children’s Charity */}
              <div className="relative w-full h-16 sm:h-20 flex items-center justify-center group cursor-pointer">
                <img
                  src="/images/Houston-Children’s-Charity-logo.png"
                  alt="Houston Children’s Charity"
                  className="max-h-16 sm:max-h-20 object-contain transition duration-300 group-hover:opacity-0"
                />
                <p className="absolute inset-0 flex items-center justify-center text-xs sm:text-sm text-gray-700 font-semibold opacity-0 group-hover:opacity-100 transition duration-300 text-center px-2">
                  Houston Children’s Charity: improving the lives of underprivileged kids.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* === SECTION 3: PROOF & VISUAL TRUST === */}
        <section className="relative w-full bg-white py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-center text-gold mb-12">
              See The Difference
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Card 1 */}
              <div className="bg-gray-50 rounded-lg shadow-md p-4 hover:shadow-lg transition">
                <img
                  src="/images/before-after.jpg"
                  alt="Before & After"
                  className="rounded-md mb-4 object-cover w-full h-40"
                />
                <p className="text-sm font-semibold text-center">Before & After Results</p>
              </div>
              {/* Card 2 */}
              <div className="bg-gray-50 rounded-lg shadow-md p-4 hover:shadow-lg transition">
                <img
                  src="/images/crew.png"
                  alt="Crew in Uniform"
                  className="rounded-md mb-4 object-cover w-full h-40"
                />
                <p className="text-sm font-semibold text-center">Professional Crew in Uniform</p>
              </div>
              {/* Card 3 */}
              <div className="bg-gray-50 rounded-lg shadow-md p-4 hover:shadow-lg transition">
                <img
                  src="/images/donation-drop.png"
                  alt="Donation Drop-Off"
                  className="rounded-md mb-4 object-cover w-full h-40"
                />
                <p className="text-sm font-semibold text-center">Donation Drop-Offs</p>
              </div>
              {/* Card 4 */}
              <div className="bg-gray-50 rounded-lg shadow-md p-4 hover:shadow-lg transition">
                <img
                  src="/images/truck-fleet.png"
                  alt="Junk Buddies Trucks"
                  className="rounded-md mb-4 object-cover w-full h-40"
                />
                <p className="text-sm font-semibold text-center">Clean, Modern Fleet</p>
              </div>
            </div>

            {/* CTA Button: See Price In Seconds (all devices, centered) */}
            <div className="flex justify-center mt-8">
              <button
                className="ai-price-button"
                onClick={() => document.getElementById('jb-open-button')?.click()}
              >
                View Price In Seconds
              </button>
            </div>
          </div>
        </section>

        {/* === SECTION 4: WHY HOUSTON TRUSTS US === */}
        <section className="relative w-full bg-[#f8f8f8] py-20 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gold mb-12">
              Why Houston Trusts Junk Buddies
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
              {/* Badge 1 */}
              <div className="flex flex-col items-center transform hover:-translate-y-2 transition">
                <span className="text-4xl">🚚</span>
                <p className="mt-2 font-semibold">Same-Day Service</p>
              </div>
              {/* Badge 2 */}
              <div className="flex flex-col items-center transform hover:-translate-y-2 transition">
                <span className="text-4xl">💵</span>
                <p className="mt-2 font-semibold">Upfront Pricing</p>
              </div>
              {/* Badge 3 */}
              <div className="flex flex-col items-center transform hover:-translate-y-2 transition">
                <span className="text-4xl">🌎</span>
                <p className="mt-2 font-semibold">Eco Commitment</p>
              </div>
              {/* Badge 4 */}
              <div className="flex flex-col items-center transform hover:-translate-y-2 transition">
                <span className="text-4xl">🤝</span>
                <p className="mt-2 font-semibold">Local & Trusted</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* === SECTION 4: NEIGHBORHOODS / COVERAGE AREA === */}
        <section className="relative w-full bg-gray-100 py-20 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side – Map */}
            <div
              className="w-full h-80 sm:h-96 lg:h-[500px] rounded-lg shadow-md overflow-hidden transform transition duration-700 hover:scale-[1.01]"
              data-aos="fade-right"
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d55857.01948076882!2d-95.4012917!3d29.7604267!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8640bf3b5d08b73b%3A0x8a89a3a0f4a0b9b4!2sHouston%2C%20TX!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Junk Buddies Houston Coverage Map"
              ></iframe>
            </div>

            {/* Right Side – Coverage List */}
            <div className="text-gray-800" data-aos="fade-up">
              <h2 className="text-3xl sm:text-4xl font-bold text-gold mb-8">
                Neighborhoods & Coverage Areas
              </h2>
              <ul className="space-y-4 text-base sm:text-lg leading-relaxed">
                <li>
                  <span className="text-gold font-semibold">Central Houston →</span>{" "}
                  77002, 77003, 77004, 77006, 77007
                </li>
                <li>
                  <span className="text-gold font-semibold">West Houston →</span>{" "}
                  77042, 77055, 77057, 77063, 77077
                </li>
                <li>
                  <span className="text-gold font-semibold">North Houston →</span>{" "}
                  77014, 77032, 77038, 77060, 77073
                </li>
                <li>
                  <span className="text-gold font-semibold">South Houston →</span>{" "}
                  77034, 77047, 77061, 77089
                </li>
                <li>
                  <span className="text-gold font-semibold">Suburbs & Beyond →</span>{" "}
                  Katy, Sugar Land, Pearland, Pasadena, The Woodlands, League City,
                  Baytown, Tomball, Missouri City, Humble, Rosenberg, Richmond, Deer
                  Park, Alvin, Channelview, La Porte, Friendswood
                </li>
              </ul>
            </div>
          </div>
        </section>
        
        {/* === SECTION 5: OFFICIAL JUNK BUDDIES — HOUSTON, TX === */}
        <section className="relative w-full bg-white overflow-hidden">
          {/* Top Gold Divider */}
          <div className="w-full h-1 bg-gold"></div>

          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-16 px-6">
            {/* Left Side – Badge */}
            <div className="flex justify-center items-center" data-aos="zoom-in">
              <div className="flex flex-col items-center space-y-4">
                {/* Gold Badge */}
                <div className="w-40 h-40 flex items-center justify-center rounded-full border-4 border-gold shadow-xl relative">
                  <p className="text-center font-bold text-gold text-sm">
                    Official<br />Junk Buddies<br />Houston, TX
                  </p>
                </div>
                {/* Trust Indicators */}
                <ul className="text-sm text-gray-700 font-semibold space-y-2 text-center">
                  <li>✅ Texas LLC Registered</li>
                  <li>✅ Eco-Friendly Partner</li>
                </ul>
              </div>
            </div>

            {/* Right Side – Authority Text */}
            <div className="text-gray-800" data-aos="fade-up">
              <h2 className="text-3xl sm:text-4xl font-bold text-gold mb-6">
                The Official Junk Buddies — Serving Houston, Texas with Pride
              </h2>
              <p className="text-base sm:text-lg mb-4 leading-relaxed">
                <span className="font-bold">Junk Buddies LLC</span> is a Texas-registered 
                company headquartered in Houston. We’ve built our reputation on fast 
                service, eco-friendly donation & recycling, and upfront pricing trusted 
                by thousands of Houston families and businesses.
              </p>
              <p className="text-base sm:text-lg mb-4 leading-relaxed">
                <span className="font-bold">Important:</span> We are <u>not affiliated </u> 
                 with companies in Michigan or North Carolina operating under the same name. 
                Those are separate businesses.
              </p>
              <p className="text-base sm:text-lg leading-relaxed font-semibold">
                When you choose Junk Buddies in Houston, you’re choosing the original 
                Houston-founded team — local, reliable, and committed to{" "}
                <span className="text-gold font-bold">Making Space For What Matters.</span>
              </p>
            </div>
          </div>

          {/* CTA Button: See Price In Seconds (all devices, centered) */}
          <div className="flex justify-center mt-8 mb-8">
            <button
              className="ai-price-button"
              onClick={() => document.getElementById('jb-open-button')?.click()}
            >
              View Price In Seconds
            </button>
          </div>

          {/* Houston Skyline Banner */}
          <div
            className="relative w-full h-64 sm:h-80 lg:h-96 overflow-hidden"
            data-aos="fade-in"
          >
            <img
              src="/images/houston-skyline.png"
              alt="Houston Skyline"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20"></div>
          </div>

          {/* Bottom Gold Divider */}
          <div className="w-full h-1 bg-gold"></div>

          {/* Crawlable SEO Line */}
          <div className="w-full bg-gray-100 py-4 px-6 text-center text-xs sm:text-sm text-gray-700 font-semibold">
            Junk Buddies LLC — Official Junk Removal in Houston, TX | Harris County | Katy | Sugar Land | Pearland | Pasadena | Cypress | The Woodlands | League City | Baytown | Missouri City | Tomball | Richmond | Rosenberg | Friendswood | Humble | La Porte | Channelview | Deer Park | Alvin | Greater Houston Metro
          </div>
        </section>

        <footer className="bg-black text-gray-400 py-10 px-6 text-center border-t border-gold">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Blog and FAQ */}
            <div className="space-y-2">
              <Link to="/blog" className="text-gold font-semibold hover:underline block">
                📝 Read Our Blog — Junk Removal Tips, Pricing & More
              </Link>
              <Link to="/faq" className="text-gold hover:underline block">
                📌 Frequently Asked Questions
              </Link>
            </div>

            {/* City Links Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-sm text-white pt-6 border-t border-gold mt-4">
              <Link to="/service-areas/houston">Houston</Link>
              <Link to="/service-areas/katy">Katy</Link>
              <Link to="/service-areas/sugar-land">Sugar Land</Link>
              <Link to="/service-areas/pearland">Pearland</Link>
              <Link to="/service-areas/cypress">Cypress</Link>
              <Link to="/service-areas/spring">Spring</Link>
              <Link to="/service-areas/humble">Humble</Link>
              <Link to="/service-areas/missouri-city">Missouri City</Link>
              <Link to="/service-areas/pasadena">Pasadena</Link>
              <Link to="/service-areas/the-woodlands">The Woodlands</Link>
              <Link to="/service-areas/league-city">League City</Link>
              <Link to="/service-areas/baytown">Baytown</Link>
              <Link to="/service-areas/friendswood">Friendswood</Link>
              <Link to="/service-areas/channelview">Channelview</Link>
              <Link to="/service-areas/richmond">Richmond</Link>
              <Link to="/service-areas/rosenberg">Rosenberg</Link>
              <Link to="/service-areas/tomball">Tomball</Link>
              <Link to="/service-areas/alvin">Alvin</Link>
              <Link to="/service-areas/deer-park">Deer Park</Link>
              <Link to="/service-areas/la-porte">La Porte</Link>
            </div>

            {/* Copyright */}
            <div className="text-xs text-gray-500 pt-6 border-t border-gold">
              © {new Date().getFullYear()} Junk Buddies LLC. All rights reserved.
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default LandingPage;
