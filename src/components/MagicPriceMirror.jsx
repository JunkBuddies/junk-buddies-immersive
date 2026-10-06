import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useCart } from "../context/CartContext";
import { calculatePrice } from "../utils/pricing";
import itemData from "../data/itemData";

const allItems = itemData.flatMap((section) => section.items);
const aliases = { couch:"Couch / Loveseat", sofa:"Sofa", loveseat:"Couch / Loveseat", mattress:"Mattress", fridge:"Refrigerator", refrigerator:"Refrigerator", washer:"Washer", dryer:"Dryer", desk:"Desk", recliner:"Recliner", trampoline:"Trampoline", dresser:"Dresser", table:"Table", chair:"Chair", microwave:"Microwave", freezer:"Freezer", treadmill:"Treadmill" };

function getSessionId() {
  const key = "jb_chat_session";
  let id = localStorage.getItem(key);
  if (!id) { id = "sess_" + Math.random().toString(36).slice(2); localStorage.setItem(key, id); }
  return id;
}
function parseItems(text) {
  const lower = text.toLowerCase(), found = [], used = new Set();
  Object.entries(aliases).forEach(([word, exact]) => {
    if (lower.includes(word) && !used.has(exact)) {
      const item = allItems.find((x) => x.name === exact);
      if (item) { found.push(item); used.add(exact); }
    }
  });
  allItems.forEach((item) => {
    const base = item.name.toLowerCase().split(" - ")[0].replace(/[/"']/g, "").trim();
    if (base.length > 4 && lower.includes(base) && !used.has(item.name)) { found.push(item); used.add(item.name); }
  });
  return found;
}

export default function MagicPriceMirror() {
  const navigate = useNavigate();
  const { setCart } = useCart();
  const sessionId = useMemo(getSessionId, []);
  const [stage, setStage] = useState("items");
  const [prompt, setPrompt] = useState("Want a guaranteed price now?");
  const [subPrompt, setSubPrompt] = useState("List what you need removed. One line is enough.");
  const [value, setValue] = useState("");
  const [items, setItems] = useState([]);
  const [price, setPrice] = useState(0);
  const [discounted, setDiscounted] = useState(false);
  const [fading, setFading] = useState(false);
  const [typedPrompt, setTypedPrompt] = useState("");
  const [typedSubPrompt, setTypedSubPrompt] = useState("");
  const [mirrorActive, setMirrorActive] = useState(false);
  const [hierarchyFlipped, setHierarchyFlipped] = useState(false);
  const inputRef = useRef(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    setTypedPrompt("");
    setTypedSubPrompt("");
    setHierarchyFlipped(false);
    if (!mirrorActive) return;

    let promptIndex = 0;
    let subIndex = 0;
    let promptTimer;
    let subTimer;
    let flipTimer;

    promptTimer = window.setInterval(() => {
      promptIndex += 1;
      setTypedPrompt(prompt.slice(0, promptIndex));
      if (promptIndex >= prompt.length) {
        window.clearInterval(promptTimer);
        flipTimer = window.setTimeout(() => {
          setHierarchyFlipped(true);
          subTimer = window.setInterval(() => {
            subIndex += 1;
            setTypedSubPrompt(subPrompt.slice(0, subIndex));
            if (subIndex >= subPrompt.length) window.clearInterval(subTimer);
          }, 38);
        }, 180);
      }
    }, 42);

    return () => {
      window.clearInterval(promptTimer);
      window.clearInterval(subTimer);
      window.clearTimeout(flipTimer);
    };
  }, [prompt, subPrompt, mirrorActive]);


  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const scroller = section.closest("main");
    if (!scroller || typeof IntersectionObserver === "undefined") return;

    let captured = false;
    let released = false;
    let arriving = false;
    let holding = false;
    let targetTop = 0;
    let animationFrame = 0;
    let holdTimer = 0;
    let quietTimer = 0;
    let momentumActive = false;

    const getTarget = () => {
      const sectionRect = section.getBoundingClientRect();
      const scrollerRect = scroller.getBoundingClientRect();
      return scroller.scrollTop + sectionRect.top - scrollerRect.top;
    };

    const pinExact = () => {
      if (!holding) return;
      scroller.scrollTop = targetTop;
      animationFrame = window.requestAnimationFrame(pinExact);
    };

    const capture = () => {
      if (captured || released || arriving || holding) return;
      captured = true;
      arriving = true;
      setMirrorActive(false);
      targetTop = getTarget();

      // Smooth scene arrival. Continued wheel/touch input is consumed while arriving.
      scroller.scrollTo({ top: targetTop, behavior: "smooth" });

      window.setTimeout(() => {
        arriving = false;
        holding = true;
        scroller.scrollTop = targetTop;
        window.cancelAnimationFrame(animationFrame);
        animationFrame = window.requestAnimationFrame(pinExact);
        setMirrorActive(true);

        // Keep the scene physically pinned long enough for the triggering gesture to die.
        holdTimer = window.setTimeout(() => {
          holding = false;
          window.cancelAnimationFrame(animationFrame);
          scroller.scrollTop = targetTop;
          momentumActive = true;
          window.clearTimeout(quietTimer);
          quietTimer = window.setTimeout(() => { momentumActive = false; }, 260);
        }, 1600);
      }, 720);
    };

    const consumeOrRelease = (event) => {
      const meaningful = event.type !== "wheel" || Math.abs(event.deltaY || 0) >= 5;

      if (arriving || holding || momentumActive) {
        if (event.cancelable) event.preventDefault();
        if (meaningful && !holding && !arriving) {
          momentumActive = true;
          window.clearTimeout(quietTimer);
          quietTimer = window.setTimeout(() => { momentumActive = false; }, 260);
        }
        return;
      }

      if (!captured || released || !meaningful) return;

      // Only a fresh gesture after arrival + hold + momentum silence unlocks the scene.
      released = true;
      captured = false;
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.intersectionRatio < 0.08) {
        captured = false;
        released = false;
        arriving = false;
        holding = false;
        momentumActive = false;
        window.cancelAnimationFrame(animationFrame);
        window.clearTimeout(holdTimer);
        window.clearTimeout(quietTimer);
        setMirrorActive(false);
        return;
      }
      if (entry.intersectionRatio >= 0.85) capture();
    }, { root: scroller, threshold: [0.08, 0.5, 0.84, 0.85, 0.95, 1] });

    observer.observe(section);
    scroller.addEventListener("wheel", consumeOrRelease, { passive: false });
    scroller.addEventListener("touchmove", consumeOrRelease, { passive: false });

    return () => {
      observer.disconnect();
      scroller.removeEventListener("wheel", consumeOrRelease);
      scroller.removeEventListener("touchmove", consumeOrRelease);
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(holdTimer);
      window.clearTimeout(quietTimer);
    };
  }, []);

  const transition = (nextPrompt, nextSub, nextStage, delay = 360) => {
    setFading(true);
    setTimeout(() => {
      setPrompt(nextPrompt); setSubPrompt(nextSub); setStage(nextStage); setValue(""); setFading(false);
      setTimeout(() => inputRef.current?.focus(), 80);
    }, delay);
  };

  const submit = async (e) => {
    e.preventDefault();
    const clean = value.trim();
    if (!clean) return;
    if (stage === "items" || stage === "more") {
      const parsed = parseItems(clean);
      if (!parsed.length) { transition("I want to price that correctly.", "Try simple item names — couch, mattress, dresser, refrigerator.", stage); return; }
      const nextItems = stage === "more" ? [...items, ...parsed] : parsed;
      const result = calculatePrice(nextItems);
      setItems(nextItems); setPrice(result.finalPrice); setCart(nextItems);
      transition("Getting your price…", "Matching your items to Junk Buddies pricing.", "loading", 220);
      setTimeout(() => transition("Your price is ready.", "Want 10% off before I show you the total? Type yes or no.", "discount", 520), 850);
      return;
    }
    if (stage === "discount") {
      const yes = /^(y|yes|sure|ok|okay|yeah|yep)/i.test(clean);
      setDiscounted(yes); localStorage.setItem("jb_disc_on_" + sessionId, yes ? "1" : "0");
      transition(yes ? "Done. 10% is yours." : "No problem.", yes ? "Enter the best phone number for this quote. No payment required." : "Enter a phone number so this quote stays attached to you.", "phone");
      return;
    }
    if (stage === "phone") {
      const digits = clean.replace(/\D/g, "");
      if (digits.length < 10) { transition("That number looks a little short.", "Enter a 10-digit phone number.", "phone"); return; }
      localStorage.setItem("jb_lead_phone_" + sessionId, clean); localStorage.setItem("jb_lead_" + sessionId, "1");
      try { await addDoc(collection(db, "leadCaptures"), { phone: clean, sessionId, source:"landing_magic_mirror", enteredAt:serverTimestamp() }); } catch (err) { console.error("Magic Mirror lead capture:", err); }
      const total = discounted ? Math.round(price * 0.9 * 100) / 100 : price;
      transition("$" + total.toFixed(2), items.map((x) => x.name).join(" · ") + (discounted ? " · 10% discount applied" : ""), "result");
      return;
    }
    if (stage === "result") {
      if (/add|more|another|yes/i.test(clean)) transition("What else should we take?", "List the additional item or items.", "more");
      else if (/schedule|book|date|pickup/i.test(clean)) navigate("/schedule");
      else transition("No pressure.", "Type “add” for more items or “schedule” for a no-commitment pickup date. Free cancellation.", "result");
    }
  };

  const resultStage = stage === "result";
  return (
    <section ref={sectionRef} className="relative box-border h-[calc(100svh-56px)] lg:h-[calc(100svh-64px)] w-full min-w-0 max-w-full snap-start snap-always scroll-mt-0 overflow-x-clip overflow-y-hidden bg-[#111110] text-white">
      <div aria-hidden="true" className="absolute inset-0" style={{background:"radial-gradient(circle at 50% 45%, rgba(184,134,55,.09), transparent 25%), linear-gradient(145deg,#171716,#0c0c0b 62%,#050505)"}} />
      <div aria-hidden="true" className="absolute inset-[clamp(18px,7vw,110px)] border border-[#c8b477]/10" />
      <div aria-hidden="true" className="absolute inset-[clamp(36px,14vw,210px)] border border-white/[0.035]" />
      <div aria-hidden="true" className="absolute left-1/2 top-0 h-full w-px bg-gradient-to-b from-transparent via-[#c8b477]/10 to-transparent" />
      <div className="relative z-10 mx-auto flex h-full w-[calc(100%-24px)] min-w-0 max-w-[calc(100%-24px)] box-border flex-col justify-between overflow-hidden pb-24 pt-12 sm:w-[calc(100%-36px)] sm:max-w-[calc(100%-36px)] lg:grid lg:w-[calc(100%-64px)] lg:max-w-[calc(100%-64px)] lg:grid-cols-[minmax(0,56%)_minmax(0,44%)] lg:items-center lg:gap-0 lg:px-0 lg:py-16">
        <div className={"box-border w-full min-w-0 max-w-full overflow-hidden pr-4 lg:pr-[clamp(24px,3vw,52px)] transition-opacity duration-500 " + (fading ? "opacity-0" : "opacity-100")}>
          <div className="mb-5 flex items-center gap-2.5 text-[10px] uppercase tracking-[.34em] text-[#c8b477]"><span className="h-px w-8 bg-[#c8b477]/70"/>Instant price</div>
          <div className="w-full min-w-0 max-w-full">
            <div
              className={(hierarchyFlipped ? "text-[17px] sm:text-lg lg:text-xl text-white/55 leading-[1.55] " : (resultStage ? "text-[clamp(3rem,9vw,8rem)] " : "text-[clamp(2.25rem,5.6vw,6rem)] ") + "text-white leading-[.98] tracking-[-.035em] ") + "w-full min-w-0 max-w-full whitespace-normal font-semibold transition-all duration-500"}
              style={{ overflowWrap: "anywhere", wordBreak: "normal" }}
            >
              {typedPrompt.split("").map((char, index) => (
                <span key={index} className="inline" style={{ animation: "jbMirrorLetterIn 260ms ease-out both" }}>{char}</span>
              ))}
            </div>
            <div
              className={(hierarchyFlipped ? "mt-4 pb-[0.14em] text-[clamp(2.15rem,5.2vw,5.4rem)] font-semibold leading-[1.12] tracking-[-.035em] text-white " : "mt-5 text-[17px] leading-[1.55] text-white/55 sm:text-lg lg:text-xl ") + "w-full min-w-0 max-w-full transition-all duration-500"}
              style={{ overflowWrap: "anywhere", wordBreak: "normal" }}
            >
              {typedSubPrompt.split("").map((char, index) => (
                <span key={index} className="inline" style={{ animation: "jbMirrorLetterIn 260ms ease-out both" }}>{char}</span>
              ))}
            </div>
          </div>
        </div>
        <form onSubmit={submit} className="mb-5 box-border w-full min-w-0 max-w-full overflow-hidden lg:mb-0 lg:self-end lg:justify-self-start lg:w-[min(100%,500px)] lg:pl-[clamp(10px,1vw,16px)] lg:pr-0 lg:pb-[12vh]">
          <label className="mb-3 block text-[10px] uppercase tracking-[.28em] text-white/30">{stage === "items" || stage === "more" ? "Your items" : stage === "phone" ? "Phone number" : "Your response"}</label>
          <div className="flex items-end gap-3 border-b border-[#c8b477]/35 pb-3 transition-colors focus-within:border-[#e0cf91]/80">
            <input ref={inputRef} value={value} onChange={(e)=>setValue(e.target.value)} disabled={stage === "loading"} inputMode={stage === "phone" ? "tel" : "text"} autoComplete={stage === "phone" ? "tel" : "off"} placeholder={stage === "items" ? "couch, mattress, dresser…" : stage === "result" ? "add more or schedule…" : "type here…"} className="min-w-0 flex-1 bg-transparent py-2 text-lg text-white outline-none placeholder:text-white/18 sm:text-xl" />
            <button type="submit" disabled={stage === "loading"} className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-[#c8b477]/40 text-[#d8c47c] transition hover:bg-[#c8b477]/10 disabled:opacity-20" aria-label="Send">→</button>
          </div>
          <p className="mt-3 text-[10px] leading-relaxed text-white/25">Press Enter. Your response disappears as the conversation moves forward.</p>
        </form>
      </div>
      <style>{`
        @keyframes jbMirrorLetterIn {
          from { opacity: 0; filter: blur(2px); }
          to { opacity: 1; filter: blur(0); }
        }
      `}</style>
    </section>
  );
}
