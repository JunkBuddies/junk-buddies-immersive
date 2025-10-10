// File: src/components/chat/ChatWidget.jsx
import { useEffect, useMemo, useRef, useState, useRef as useRef2 } from "react";
import { useCart } from "../../context/CartContext";
import { calculatePrice } from "../../utils/pricing";
import { useNavigate } from "react-router-dom";

// 🔗 Firestore
import { db } from "../../lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

// ✉️ EmailJS
import emailjs from "emailjs-com";

const GOLD = "#d4af37";
const SILVER = "#C0C0C0";
const BLUE = "#1e90ff";
const BLACK = "#0b0b0b";
const DISCOUNT_RATE = 0.10;
const TIP_COOLDOWN_MS = 10 * 60 * 1000;

const TEST_MODE = true; // ⬅️ toggle for unlimited captures

const ASSISTANT_NAME = "Your Junk Buddy";

// EmailJS config
const EMAILJS_SERVICE_ID = "JunkBuddies.info";
const EMAILJS_TEMPLATE_ID = "Junk-Buddies-Leads";
const EMAILJS_PUBLIC_KEY = "QCl4Akw_LZ3T8IvUd";

// ✅ GA4 event helper
function sendGAEvent(name, params = {}) {
  if (window.gtag) {
    window.gtag("event", name, params);
    console.log("📊 GA event sent:", name, params);
  } else {
    console.warn("⚠️ gtag not ready, event skipped:", name, params);
  }
}

// ✅ Session ID
function getSessionId() {
  const key = "jb_chat_session";
  let s = localStorage.getItem(key);
  if (!s) {
    s = "sess_" + Date.now() + "_" + Math.random().toString(36).slice(2);
    localStorage.setItem(key, s);
  }
  return s;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [aiStatus, setAiStatus] = useState("unknown");
  const [lastParsed, setLastParsed] = useState(null);

  const [discountActive, setDiscountActive] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [introShown, setIntroShown] = useState(false);
  const [introTyping, setIntroTyping] = useState(false);
  const [gate, setGate] = useState(null);
  const [leadDraft, setLeadDraft] = useState({ name: "", phone: "" });

  const lastDiscountSig = useRef2("");
  const endRef = useRef(null);
  const sessionId = useMemo(getSessionId, []);
  const { setCart } = useCart() || { setCart: () => {} };
  const navigate = useNavigate();

  // Hydrate
  useEffect(() => {
    const d = localStorage.getItem(`jb_disc_on_${sessionId}`) === "1";
    const l = localStorage.getItem(`jb_lead_${sessionId}`) === "1";
    const n = localStorage.getItem(`jb_lead_name_${sessionId}`) || "";
    const p = localStorage.getItem(`jb_lead_phone_${sessionId}`) || "";
    setDiscountActive(d);
    setLeadCaptured(l);
    setLeadDraft({ name: n, phone: p });
  }, [sessionId]);

  // Persist
  useEffect(() => {
    localStorage.setItem(`jb_disc_on_${sessionId}`, discountActive ? "1" : "0");
  }, [discountActive, sessionId]);
  useEffect(() => {
    localStorage.setItem(`jb_lead_${sessionId}`, leadCaptured ? "1" : "0");
  }, [leadCaptured, sessionId]);

  // Autoscroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, loading, gate]);

  // ✅ Greeting + First Offer Gate
  useEffect(() => {
    if (!open) return;
    if (!leadCaptured || TEST_MODE) {
      setIntroTyping(true);
      const t = setTimeout(() => {
        setMessages([
          {
            role: "assistant",
            content:
              "Hey there! I’m your Junk Buddy 👋\n" +
              "I can select all your junk in seconds.\n" +
              "You list it, I’ll add it.\n" +
              "(Ex: fridge, couch, sectional 3 piece, 2 ellipticals)",
          },
        ]);
        setIntroTyping(false);
        setIntroShown(true);

        // First attempt: Yes / No gate (not form yet)
        setTimeout(() => {
          setGate({
            id: "offer_first",
            text: "Want to claim your 10% OFF + 1 FREE item now?",
          });
          sendGAEvent("lead_form_view", { type: "offer_first", sessionId });
          try {
            addDoc(collection(db, "leadViews"), {
              sessionId,
              type: "offer_first",
              shownAt: serverTimestamp(),
            });
          } catch (err) {
            console.error("❌ Firestore log error:", err);
          }
        }, 800);
      }, 600);
      return () => clearTimeout(t);
    }
  }, [open, leadCaptured, sessionId]);

  function discountedPrice(base) {
    return Math.max(
      0,
      Math.round((base * (1 - DISCOUNT_RATE) + Number.EPSILON) * 100) / 100
    );
  }

  function validPhone(p) {
    const digits = (p || "").replace(/\D/g, "");
    return digits.length >= 10;
  }

  // Send message
  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    if (gate) return;

    setError("");
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          messages: [...messages, { role: "user", content: text }],
        }),
      });

      const aiHeader = (res.headers.get("x-ai") || "").toLowerCase();
      setAiStatus(
        aiHeader === "on" ? "on" : aiHeader === "off" ? "off" : "unknown"
      );

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Request failed");
      setLastParsed(json.parsed || null);

      // ✅ AI response and post-offer logic
      setMessages((prev) => {
        const next = [...prev, { role: "assistant", content: json.reply }];
        const hasCart = (json.parsed?.cart?.length || 0) > 0;

        if (hasCart) {
          const base = json.parsed.finalPrice ?? 0;
          const sig = `${base}|${json.parsed?.totalVolume || 0}`;
          if (discountActive) {
            if (lastDiscountSig.current !== sig) {
              lastDiscountSig.current = sig;
              const disc = discountedPrice(base);
              next.push({
                role: "assistant",
                content: `With your 10% discount applied, your total comes to $${disc.toFixed(
                  2
                )} (regularly $${base.toFixed(2)}). Ready to schedule your pickup or add more items?`,
              });
            }
          } else {
            // No discount yet — natural flow
            next.push({
              role: "assistant",
              content: `Your current total is about $${base.toFixed(
                2
              )}. Would you like to see your price with 10% off + 1 free item?`,
            });
            // Trigger the post-offer capture naturally
            setTimeout(() => {
              setGate({
                id: "offer_post",
                text: "Want to see your price with 10% OFF + 1 FREE item?",
              });
              sendGAEvent("lead_form_view", { type: "offer_post", sessionId });
            }, 600);
          }
        }
        return next;
      });
    } catch (e) {
      setError("Trouble responding. Try again.");
      setAiStatus((s) => (s === "unknown" ? "off" : s));
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  function addParsedToCart() {
    if (!lastParsed?.cart?.length) return;
    setCart((prev) => [...prev, ...lastParsed.cart]);
  }
  // Gating flow
  async function onGateChoice(action) {
    if (!gate) return;

    if (gate.id === "offer_first") {
      if (action === "yes") {
        setGate({
          id: "lead_capture",
          text:
            "Enter your name & phone — I’ll attach 10% OFF + 1 FREE item to your account.",
        });
      } else {
        setGate(null);
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content:
              "No worries — just list your items and I’ll price them instantly.",
          },
        ]);
      }
      return;
    }

    if (gate.id === "offer_post") {
      if (action === "yes") {
        setGate({
          id: "lead_capture",
          text:
            "Enter your name & phone — I’ll attach 10% OFF + 1 FREE item and show your discounted price.",
        });
      } else {
        setGate(null);
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content:
              "All good — showing regular pricing. You can keep adding more items anytime.",
          },
        ]);
      }
      return;
    }

  if (gate.id === "lead_capture" && action === "submit") {
  if (!leadDraft.name.trim() || !validPhone(leadDraft.phone)) {
    setMessages((m) => [
      ...m,
      {
        role: "assistant",
        content: "Please add a name and valid phone (10+ digits).",
      },
    ]);
    return;
  }

  // 📊 Log attempt to GA4 + Firestore
  sendGAEvent("generate_lead", {
    name: leadDraft.name.trim(),
    phone: leadDraft.phone.trim(),
    sessionId,
  });

  try {
    await addDoc(collection(db, "leadCaptures"), {
      name: leadDraft.name.trim(),
      phone: leadDraft.phone.trim(),
      enteredAt: serverTimestamp(),
      sessionId,
    });
  } catch (err) {
    console.error("❌ Firestore lead error:", err);
  }

  // ✉️ EmailJS
  try {
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        name: leadDraft.name.trim(),
        phone: leadDraft.phone.trim(),
        sessionId,
        enteredAt: new Date().toLocaleString(),
      },
      EMAILJS_PUBLIC_KEY
    );
  } catch (err) {
    console.error("❌ EmailJS send error:", err);
  }

  // ✅ Persist lead info
  localStorage.setItem(`jb_lead_name_${sessionId}`, leadDraft.name.trim());
  localStorage.setItem(`jb_lead_phone_${sessionId}`, leadDraft.phone);
  setLeadCaptured(true);
  setDiscountActive(true);

  // ✅ Close gate without wiping context
  setGate(null);

  // ✅ Append confirmation naturally to existing chat
  setMessages((m) => [
    ...m,
    {
      role: "assistant",
      content: `Awesome, ${leadDraft.name}! Your 10% OFF + 1 FREE item is attached ✅ Just keep listing items — I’ll keep your totals updated.`,
    },
  ]);
}

    if (gate.id === "lead_capture" && action === "decline") {
      setGate(null);
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: "No problem — we’ll keep showing standard pricing.",
        },
      ]);
    }
  }

  // ------------------------------------------
  // 🎨 Chat UI below
  // ------------------------------------------
   return (
    <>
      {/* ✨ Glassy neon chat container styling */}
      <style>{`
        .chat-container {
          background: rgba(0, 0, 0, 0.95);
          border: 2px solid rgba(212, 175, 55, 0.8);
          box-shadow: 0 0 25px rgba(212, 175, 55, 0.6);
          border-radius: 20px;
          backdrop-filter: blur(6px);
          color: #d4af37;
          font-family: 'Orbitron', sans-serif;
          display: flex;
          flex-direction: column;
          height: 560px;
          max-height: 85vh;
          width: 360px;
          max-width: 90vw;
        }
        .message {
          border: 1px solid rgba(212, 175, 55, 0.4);
          border-radius: 12px;
          background: rgba(0, 0, 0, 0.7);
          box-shadow: inset 0 0 10px rgba(212, 175, 55, 0.25);
          padding: 10px 14px;
          margin: 8px 0;
          white-space: pre-wrap;
        }
        .user-message {
          align-self: flex-end;
          background: rgba(212, 175, 55, 0.1);
          border: 1px solid rgba(212, 175, 55, 0.6);
          color: #fff;
        }
        .send-button {
          background: rgba(212, 175, 55, 0.15);
          border: 1px solid rgba(212, 175, 55, 0.8);
          box-shadow: 0 0 8px rgba(212, 175, 55, 0.6);
          color: #d4af37;
          font-weight: 600;
          border-radius: 10px;
          padding: 6px 12px;
          transition: all 0.25s ease;
        }
        .send-button:hover {
          background: rgba(212, 175, 55, 0.3);
          box-shadow: 0 0 15px rgba(212, 175, 55, 0.9);
        }
      `}</style>

      {/* 💬 Floating launcher */}
      {!open && (
        <>
          <button
            onClick={() => {
              setOpen(true);
              setShowTip(false);
              navigate("/itemized");
            }}
            style={{
              position: "fixed",
              right: 90,
              bottom: 26,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              zIndex: 9999,
              color: "#fff",
              fontWeight: "bold",
              fontSize: "14px",
              textShadow:
                "0 0 8px rgba(30,144,255,0.8), 0 0 12px rgba(255,0,255,0.7)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            🎁 Free Item + 10% Off <span style={{ fontSize: "18px" }}>→</span>
          </button>

          <button
            onClick={() => {
              setOpen(true);
              setShowTip(false);
              navigate("/itemized");
            }}
            className="jb-pulse"
            style={{
              position: "fixed",
              right: 16,
              bottom: 16,
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: GOLD,
              border: `2px solid ${BLACK}`,
              fontWeight: 700,
              cursor: "pointer",
              zIndex: 9999,
            }}
            title="Chat with Your Junk Buddy"
          >
            💬
          </button>
        </>
      )}

      {/* 🪩 Neon glass chat window */}
      {open && (
        <div
          className="chat-container"
          style={{
            position: "fixed",
            right: 16,
            bottom: 16,
            zIndex: 10000,
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "10px",
              borderBottom: `1px solid ${GOLD}`,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ fontWeight: "bold", flex: 1 }}>{ASSISTANT_NAME}</span>
            <span
              style={{
                fontSize: 12,
                padding: "2px 8px",
                borderRadius: 999,
                border: `1px solid ${GOLD}`,
                color:
                  aiStatus === "on"
                    ? "#22c55e"
                    : aiStatus === "off"
                    ? "#9ca3af"
                    : "#f59e0b",
                background: "#111",
              }}
            >
              AI: {aiStatus.toUpperCase()}
            </span>
            <button
              onClick={() => setOpen(false)}
              style={{
                marginLeft: 8,
                background: "transparent",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                fontSize: 18,
              }}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "10px 14px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={`message ${m.role === "user" ? "user-message" : ""}`}
              >
                {m.content}
              </div>
            ))}

            {gate && (
              <div className="message" style={{ background: "#151515" }}>
                <div style={{ marginBottom: 8, fontWeight: 600 }}>
                  {gate.text}
                </div>

                {gate.id === "lead_capture" ? (
                  <div style={{ display: "grid", gap: 6 }}>
                    <label style={{ fontSize: 12 }}>
                      Name
                      <input
                        value={leadDraft.name}
                        onChange={(e) =>
                          setLeadDraft((d) => ({ ...d, name: e.target.value }))
                        }
                        placeholder="e.g., Jamie"
                        style={{
                          width: "100%",
                          marginTop: 4,
                          padding: "6px 8px",
                          borderRadius: 8,
                          background: "#111",
                          color: "#fff",
                          border: `1px solid ${GOLD}`,
                        }}
                      />
                    </label>
                    <label style={{ fontSize: 12 }}>
                      Phone
                      <input
                        value={leadDraft.phone}
                        onChange={(e) =>
                          setLeadDraft((d) => ({ ...d, phone: e.target.value }))
                        }
                        placeholder="(###) ###-####"
                        style={{
                          width: "100%",
                          marginTop: 4,
                          padding: "6px 8px",
                          borderRadius: 8,
                          background: "#111",
                          color: "#fff",
                          border: `1px solid ${GOLD}`,
                        }}
                      />
                    </label>
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        marginTop: 6,
                        flexWrap: "wrap",
                      }}
                    >
                      <button
                        onClick={() => onGateChoice("submit")}
                        className="send-button"
                      >
                        Apply 10% Off
                      </button>
                      <button
                        onClick={() => onGateChoice("decline")}
                        style={{
                          borderRadius: 8,
                          padding: "6px 10px",
                          cursor: "pointer",
                          fontWeight: 700,
                          background: "#222",
                          color: "#fff",
                          border: `1px solid ${GOLD}`,
                        }}
                      >
                        No Thanks
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button
                      onClick={() => onGateChoice("yes")}
                      className="send-button"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => onGateChoice("no")}
                      className="send-button"
                      style={{ background: "transparent" }}
                    >
                      No
                    </button>
                  </div>
                )}
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div
            style={{
              borderTop: `1px solid ${GOLD}`,
              padding: 10,
              opacity: gate ? 0.6 : 1,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={
                gate ? "Please choose an option above…" : "Type your message..."
              }
              disabled={!!gate}
              style={{
                flex: 1,
                borderRadius: 8,
                padding: "6px 10px",
                background: "#111",
                color: "#fff",
                border: `1px solid ${GOLD}`,
                resize: "none",
              }}
            />
            <button
              onClick={send}
              disabled={loading || !!gate}
              className="send-button"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
