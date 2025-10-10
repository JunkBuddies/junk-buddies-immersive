import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";

function LandingPage() {
  const navigate = useNavigate();

  // === SLIDES ===
  const slides = [
    { id: 0, image: "/images/houston-skyline.png", alt: "Houston Skyline" },
    { id: 1, image: "/images/donation-drop.png", alt: "Donation Drop" },
    { id: 2, image: "/images/truck-fleet.png", alt: "Junk Buddies Fleet" },
  ];

  const [current, setCurrent] = useState(0);
  const timeoutRef = useRef(null);

  // === Auto-scroll every 6s ===
  useEffect(() => {
    const interval = setInterval(() => goNext(), 6000);
    return () => clearInterval(interval);
  });

  const goNext = () => setCurrent((prev) => (prev + 1) % slides.length);
  const goPrev = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="w-full bg-black text-white overflow-hidden relative">
      {/* === HERO SECTION === */}
      <section className="relative w-full flex justify-center items-center mt-8 sm:mt-12 mb-6 overflow-hidden">
        {/* Left Arrow */}
        <button
          onClick={goPrev}
          className="absolute left-3 md:left-6 z-40 text-gold text-4xl md:text-5xl font-bold hover:scale-110 transition-transform"
        >
          ‹
        </button>

        {/* SLIDER CONTAINER */}
        <div className="relative w-full max-w-[1600px] overflow-hidden">
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{
              transform: `translateX(-${current * 92}vw)`,
              gap: "2vw",
              width: `${slides.length * 92}vw`,
            }}
          >
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className="flex-shrink-0 w-[90vw] sm:w-[90vw] md:w-[88vw] lg:w-[85vw]
                           h-[200px] sm:h-[250px] md:h-[275px] lg:h-[300px] rounded-2xl overflow-hidden 
                           border border-gold/40 shadow-2xl bg-black/40 relative"
              >
                <img
                  src={slide.image}
                  alt={slide.alt}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute bottom-4 left-6">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gold drop-shadow-lg">
                    {slide.alt}
                  </h2>
                </div>

                {/* Dots for current */}
                {index === current && (
                  <div className="absolute bottom-3 right-5 flex gap-2 z-50">
                    {slides.map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                          idx === current ? "bg-gold scale-110" : "bg-gray-500"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Arrow */}
        <button
          onClick={goNext}
          className="absolute right-3 md:right-6 z-40 text-gold text-4xl md:text-5xl font-bold hover:scale-110 transition-transform"
        >
          ›
        </button>

        {/* Cities Button */}
        <div className="absolute top-0 right-6 z-50">
          <Link
            to="/service-areas"
            className="text-gold font-semibold hover:underline bg-black/70 px-3 py-2 text-sm rounded-md shadow-md sm:px-4 sm:text-base"
          >
            Cities We Serve
          </Link>
        </div>
      </section>

      {/* === MAIN SERVICES === */}
      <section className="relative z-30 mt-4 px-4 md:px-8">
        <h2 className="text-xl md:text-2xl font-bold mb-4 text-center text-gold">
          Main Services
        </h2>
        <div className="flex justify-center">
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 md:gap-6 px-2 md:px-4 pb-6 scrollbar-hide">
            {[
              { title: "Mattress Removal", image: "/images/genres/mattress.jpg", link: "/mattress-removal" },
              { title: "Couch Removal", image: "/images/genres/couch.jpg", link: "/couch-removal" },
              { title: "Fridge Removal", image: "/images/genres/fridge.jpg", link: "/fridge-removal" },
              { title: "Furniture & Tables", image: "/images/genres/table.jpg", link: "/itemized" },
              { title: "Recliners & Chairs", image: "/images/genres/recliner.jpg", link: "/itemized" },
            ].map((service) => (
              <div
                key={service.title}
                onClick={() => navigate(service.link)}
                className="cursor-pointer flex-shrink-0 w-[220px] md:w-[300px] h-[130px] md:h-[170px] 
                           bg-zinc-900/90 border border-gold/30 hover:border-gold rounded-xl 
                           flex flex-col items-center justify-center text-center shadow-lg snap-center"
              >
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-16 h-16 md:w-20 md:h-20 object-contain mb-2"
                />
                <h3 className="text-gold font-semibold text-sm md:text-base">{service.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>
    
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
          {/* ↑ bumped from mt-4 → mt-8 for better vertical centering with images */}
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
  {/* Desktop: inline */}
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

  {/* Left Side – Photos (always stacked, responsive) */}
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


    {/* Gold Divider (always visible) */}
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

    </div>
  );
}

export default LandingPage;
 
 
