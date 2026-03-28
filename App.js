import { useState, useEffect, useRef } from "react";

// ─── Theme ───────────────────────────────────────────────────────────────────
const C = {
  sage: "#7BAE9A",
  sageLight: "#EAF2EE",
  sageDark: "#4A7A68",
  blush: "#E8A598",
  blushLight: "#FDF1EE",
  cream: "#FAF7F2",
  stone: "#2C2C2C",
  mist: "#8A9BA8",
  white: "#FFFFFF",
  crisis: "#D64545",
  crisisLight: "#FFF0F0",
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const TOPICS = [
  { id: "puberty", icon: "🌱", label: "Puberty & Growth", bg: "#EAF2EE", accent: C.sage },
  { id: "mental", icon: "🧠", label: "Mental Health", bg: "#EDF2F7", accent: "#6B8CAE" },
  { id: "nutrition", icon: "🥗", label: "Nutrition & Diet", bg: "#FFF8EE", accent: "#C4955A" },
  { id: "sleep", icon: "🌙", label: "Sleep", bg: "#F0EEF7", accent: "#8B7BAE" },
  { id: "skin", icon: "✨", label: "Skin & Hair", bg: "#FDF1EE", accent: C.blush },
  { id: "periods", icon: "🩸", label: "Periods & Cycles", bg: "#FEF0F0", accent: "#D4736A" },
  { id: "stress", icon: "💆", label: "Stress & Anxiety", bg: "#EEF7F5", accent: "#5A9E8F" },
  { id: "fitness", icon: "🏃", label: "Fitness & Body", bg: "#F3F7EE", accent: "#7AAE5A" },
];

const MYTHS = [
  { myth: "You only use 10% of your brain", truth: "You use virtually all of your brain — different regions are active at different times, and brain scans show widespread activity throughout the day.", emoji: "🧠" },
  { myth: "Cracking knuckles causes arthritis", truth: "No evidence supports this. The sound comes from gas bubbles in joint fluid popping. Long-term studies show no link to arthritis.", emoji: "🤚" },
  { myth: "You should drink 8 glasses of water a day", truth: "Water needs vary by body size, activity level, and climate. A better guide: drink when you're thirsty and check that your urine is pale yellow.", emoji: "💧" },
  { myth: "Eating before bed makes you gain weight", truth: "Total calories consumed vs. burned matters more than timing. Late-night eating can be an issue if it leads to eating more overall.", emoji: "🌙" },
  { myth: "Cold weather gives you a cold", truth: "Colds are caused by viruses, not temperature. People get more colds in winter because they spend more time indoors in close contact.", emoji: "🤧" },
  { myth: "You need to detox your body regularly", truth: "Your liver and kidneys detox your body 24/7. No juice cleanse or supplement is needed — your organs already do this naturally.", emoji: "🧪" },
  { myth: "Sugar makes kids hyperactive", truth: "Multiple controlled studies have found no link between sugar and hyperactivity. The effect is likely due to expectations and exciting contexts (like parties).", emoji: "🍬" },
  { myth: "You lose most body heat through your head", truth: "You lose heat proportionally through any uncovered skin. Your head isn't special — wear a hat because it's cold, not because it's a heat-loss hotspot.", emoji: "🧢" },
];

const SYMPTOMS = [
  "Headache", "Fatigue", "Nausea", "Stomach pain", "Sore throat",
  "Dizziness", "Rash", "Cramps", "Shortness of breath", "Fever",
  "Anxiety", "Trouble sleeping", "Back pain", "Chest tightness", "Brain fog"
];

const MOODS = ["😄", "🙂", "😐", "😔", "😩"];
const MOOD_LABELS = ["Great", "Good", "Okay", "Low", "Rough"];

const CRISIS_KEYWORDS = [
  "suicide", "kill myself", "self harm", "cutting", "hurt myself",
  "end my life", "don't want to live", "want to die", "overdose"
];

function hasCrisisKeyword(text) {
  const lower = text.toLowerCase();
  return CRISIS_KEYWORDS.some(k => lower.includes(k));
}

// ─── API ──────────────────────────────────────────────────────────────────────
const SYSTEM = `You are Harbor, a teen health assistant. You speak like a calm, warm nurse — clinical but simple, never scary or preachy. Your audience is teenagers aged 13–18.

Rules:
- 3–5 sentences max unless truly necessary
- Plain language, define any medical terms
- Never diagnose — always say "see a doctor" for anything needing diagnosis
- Be reassuring: most things teens worry about are normal
- For mental health distress: acknowledge feelings, then gently mention professional support
- Plain text only, no markdown or bullet points`;

async function callClaude(messages, system = SYSTEM) {
  const apiKey = process.env.REACT_APP_ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === "your_api_key_here") {
    return "⚠️ No API key found. Please open the .env file and paste your Anthropic API key next to REACT_APP_ANTHROPIC_API_KEY=";
  }
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-opus-4-5",
      max_tokens: 1000,
      system,
      messages,
    }),
  });
  const d = await res.json();
  if (d.error) return `Error: ${d.error.message}`;
  return d.content?.map(b => b.text || "").join("") || "Something went wrong. Please try again.";
}

// ─── Crisis Banner ────────────────────────────────────────────────────────────
function CrisisBanner({ onDismiss }) {
  return (
    <div style={{
      background: C.crisisLight,
      border: `1.5px solid ${C.crisis}33`,
      borderRadius: 16, padding: 16, margin: "12px 16px",
      animation: "fadeSlideIn 0.3s ease"
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <span style={{ fontSize: 22, flexShrink: 0 }}>💙</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13.5, fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 700, color: C.crisis, marginBottom: 4 }}>
            It sounds like you might be going through something really hard.
          </div>
          <div style={{ fontSize: 12.5, color: "#5a3a3a", lineHeight: 1.6, fontFamily: "Georgia, serif" }}>
            You don't have to deal with this alone. Please reach out to someone who can really help:
          </div>
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
            <a href="sms:741741&body=HOME" style={{ background: C.crisis, color: "#fff", borderRadius: 10, padding: "8px 14px", fontSize: 12.5, fontFamily: "Georgia, serif", textDecoration: "none", display: "block", textAlign: "center" }}>
              📱 Text HOME to 741741 (Crisis Text Line)
            </a>
            <a href="tel:988" style={{ background: "#fff", border: `1.5px solid ${C.crisis}`, color: C.crisis, borderRadius: 10, padding: "8px 14px", fontSize: 12.5, fontFamily: "Georgia, serif", textDecoration: "none", display: "block", textAlign: "center" }}>
              📞 Call or text 988 (Suicide & Crisis Lifeline)
            </a>
          </div>
          <button onClick={onDismiss} style={{ background: "none", border: "none", color: C.mist, fontSize: 11, fontFamily: "Georgia, serif", cursor: "pointer", marginTop: 8, padding: 0 }}>
            Continue to Harbor's response ↓
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────
function Header({ tab, setTab }) {
  const tabs = ["Ask", "Topics", "Symptoms", "Myths", "Track"];
  return (
    <div style={{
      background: C.white,
      borderBottom: `1px solid ${C.sageLight}`,
      position: "sticky", top: 0, zIndex: 100,
      boxShadow: "0 2px 16px rgba(123,174,154,0.12)"
    }}>
      <div style={{ padding: "18px 20px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{
            width: 34, height: 34, borderRadius: "50%",
            background: `linear-gradient(135deg, ${C.sage}, ${C.sageDark})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 17, boxShadow: `0 4px 12px ${C.sage}55`
          }}>⚓</div>
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 22, fontWeight: 700, color: C.stone, letterSpacing: "-0.3px" }}>
              Harbor
            </div>
            <div style={{ color: C.mist, fontSize: 10, fontFamily: "Georgia, serif", fontStyle: "italic", marginTop: -2 }}>
              a safe place for your health questions
            </div>
          </div>
        </div>
        <div style={{ display: "flex", overflowX: "auto", scrollbarWidth: "none" }}>
          {tabs.map((t, i) => (
            <button key={t} onClick={() => setTab(i)} style={{
              flexShrink: 0, background: "none", border: "none",
              padding: "8px 14px",
              color: tab === i ? C.sageDark : C.mist,
              fontFamily: "Georgia, serif",
              fontSize: 12.5, fontWeight: tab === i ? 700 : 400,
              cursor: "pointer", transition: "all 0.2s",
              borderBottom: tab === i ? `2px solid ${C.sage}` : "2px solid transparent",
              whiteSpace: "nowrap"
            }}>{t}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Ask Tab ──────────────────────────────────────────────────────────────────
function AskTab() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCrisis, setShowCrisis] = useState(false);
  const [pendingCrisisMsg, setPendingCrisisMsg] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, showCrisis]);

  async function send(text) {
    const q = (text || input).trim();
    if (!q || loading) return;
    setInput("");
    if (hasCrisisKeyword(q)) {
      setPendingCrisisMsg(q);
      setShowCrisis(true);
      return;
    }
    await sendMessage(q);
  }

  async function sendMessage(q) {
    const newMessages = [...messages, { role: "user", content: q }];
    setMessages(newMessages);
    setLoading(true);
    setShowCrisis(false);
    setPendingCrisisMsg(null);
    try {
      const reply = await callClaude(newMessages);
      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Something went wrong. Please try again." }]);
    }
    setLoading(false);
  }

  const starters = [
    "Is it normal to feel tired all the time?",
    "What causes acne and how do I help it?",
    "How do I know if I'm stressed or anxious?",
    "Why do I get headaches so often?"
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 118px)" }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px", background: C.cream }}>
        {messages.length === 0 && !showCrisis && (
          <div style={{ textAlign: "center", padding: "30px 16px 20px" }}>
            <div style={{ fontSize: 52, marginBottom: 10 }}>⚓</div>
            <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 24, color: C.stone, marginBottom: 6 }}>
              What's on your mind?
            </div>
            <div style={{ color: C.mist, fontSize: 12.5, lineHeight: 1.7, fontFamily: "Georgia, serif", maxWidth: 280, margin: "0 auto 24px" }}>
              Ask anything about your health. Everything here is anonymous — no judgment, ever.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {starters.map(s => (
                <button key={s} onClick={() => send(s)} style={{
                  background: C.white, border: `1px solid ${C.sageLight}`,
                  borderRadius: 20, padding: "10px 18px",
                  color: C.sageDark, fontSize: 12.5, fontFamily: "Georgia, serif",
                  cursor: "pointer", textAlign: "left",
                  boxShadow: "0 2px 8px rgba(123,174,154,0.1)",
                  transition: "all 0.2s"
                }}>{s}</button>
              ))}
            </div>
          </div>
        )}

        {showCrisis && (
          <CrisisBanner onDismiss={() => {
            if (pendingCrisisMsg) sendMessage(pendingCrisisMsg);
            else setShowCrisis(false);
          }} />
        )}

        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 14, display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            {m.role === "assistant" && (
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: `linear-gradient(135deg, ${C.sage}, ${C.sageDark})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, marginRight: 8, flexShrink: 0, alignSelf: "flex-end"
              }}>⚓</div>
            )}
            <div style={{
              maxWidth: "80%",
              background: m.role === "user" ? `linear-gradient(135deg, ${C.sage}, ${C.sageDark})` : C.white,
              color: m.role === "user" ? "#fff" : C.stone,
              borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              padding: "11px 15px", fontSize: 13.5, lineHeight: 1.7,
              fontFamily: "Georgia, serif",
              boxShadow: "0 2px 10px rgba(0,0,0,0.07)"
            }}>{m.content}</div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: `linear-gradient(135deg, ${C.sage}, ${C.sageDark})`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14
            }}>⚓</div>
            <div style={{ background: C.white, borderRadius: "18px 18px 18px 4px", padding: "14px 18px", boxShadow: "0 2px 10px rgba(0,0,0,0.07)", display: "flex", gap: 5, alignItems: "center" }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: C.sage, display: "inline-block", animation: `dot 1.2s ${i * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: "10px 16px 18px", background: C.white, borderTop: `1px solid ${C.sageLight}` }}>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Type your question..."
            rows={2}
            style={{
              flex: 1, border: `1.5px solid ${C.sageLight}`, borderRadius: 16,
              padding: "10px 14px", fontSize: 13, fontFamily: "Georgia, serif",
              resize: "none", outline: "none", background: C.cream,
              color: C.stone, lineHeight: 1.5, transition: "border-color 0.2s"
            }}
            onFocus={e => e.target.style.borderColor = C.sage}
            onBlur={e => e.target.style.borderColor = C.sageLight}
          />
          <button onClick={() => send()} disabled={!input.trim() || loading} style={{
            width: 42, height: 42, borderRadius: "50%",
            background: input.trim() && !loading ? `linear-gradient(135deg, ${C.sage}, ${C.sageDark})` : "#e2e8f0",
            border: "none", cursor: input.trim() && !loading ? "pointer" : "default",
            fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: input.trim() && !loading ? `0 4px 12px ${C.sage}55` : "none",
            transition: "all 0.2s", color: "#fff"
          }}>→</button>
        </div>
        <div style={{ fontSize: 10, color: C.mist, textAlign: "center", marginTop: 8, fontFamily: "Georgia, serif", fontStyle: "italic" }}>
          Not a substitute for professional medical advice. Always see a doctor for diagnosis.
        </div>
      </div>

      <style>{`
        @keyframes dot { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1)} }
        @keyframes fadeSlideIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}

// ─── Topics Tab ───────────────────────────────────────────────────────────────
function TopicsTab() {
  const [selected, setSelected] = useState(null);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadTopic(t) {
    setSelected(t); setResponse(""); setLoading(true);
    try {
      const r = await callClaude([{
        role: "user",
        content: `Give a warm, nurse-like overview of "${t.label}" for a teen. Cover: what's normal, common concerns teens have, and when to see a doctor. 4–5 sentences, reassuring tone.`
      }]);
      setResponse(r);
    } catch { setResponse("Couldn't load this topic. Please try again."); }
    setLoading(false);
  }

  return (
    <div style={{ padding: 16, overflowY: "auto", height: "calc(100vh - 118px)", background: C.cream }}>
      {!selected ? (
        <>
          <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 22, color: C.stone, marginBottom: 4 }}>Browse Topics</div>
          <div style={{ color: C.mist, fontSize: 12, fontFamily: "Georgia, serif", marginBottom: 18 }}>Tap a topic to learn what's normal</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {TOPICS.map(t => (
              <button key={t.id} onClick={() => loadTopic(t)} style={{
                background: t.bg, border: `1px solid ${t.accent}22`,
                borderRadius: 16, padding: "18px 14px", cursor: "pointer",
                textAlign: "left", transition: "transform 0.2s",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
              }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
              >
                <div style={{ fontSize: 28, marginBottom: 6 }}>{t.icon}</div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: C.stone, fontFamily: "Georgia, serif", lineHeight: 1.3 }}>{t.label}</div>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div>
          <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: C.sage, fontSize: 13, cursor: "pointer", fontFamily: "Georgia, serif", marginBottom: 16, padding: 0 }}>← All Topics</button>
          <div style={{ background: selected.bg, borderRadius: 20, padding: 20, marginBottom: 16 }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>{selected.icon}</div>
            <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 24, color: C.stone }}>{selected.label}</div>
          </div>
          {loading
            ? <div style={{ textAlign: "center", padding: 30, color: C.mist, fontFamily: "Georgia, serif", fontStyle: "italic" }}>Loading...</div>
            : <div style={{ background: C.white, borderRadius: 16, padding: 18, fontSize: 14, lineHeight: 1.75, fontFamily: "Georgia, serif", color: "#334155", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>{response}</div>
          }
        </div>
      )}
    </div>
  );
}

// ─── Symptoms Tab ─────────────────────────────────────────────────────────────
function SymptomsTab() {
  const [selected, setSelected] = useState([]);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  function toggle(s) {
    setSelected(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
    setResult("");
  }

  async function check() {
    if (!selected.length) return;
    setLoading(true); setResult("");
    const prompt = `A teenager is experiencing: ${selected.join(", ")}. As a nurse, explain in 4–6 sentences: what these symptoms might indicate (common causes in teens), whether this is generally cause for concern, and when to see a doctor. Be reassuring and clear. Do NOT diagnose.`;
    try {
      const r = await callClaude([{ role: "user", content: prompt }]);
      setResult(r);
    } catch { setResult("Something went wrong. Please try again."); }
    setLoading(false);
  }

  return (
    <div style={{ padding: 16, overflowY: "auto", height: "calc(100vh - 118px)", background: C.cream }}>
      <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 22, color: C.stone, marginBottom: 4 }}>Symptom Checker</div>
      <div style={{ color: C.mist, fontSize: 12, fontFamily: "Georgia, serif", marginBottom: 6 }}>Select what you're experiencing and get some context.</div>
      <div style={{ background: `${C.blush}22`, border: `1px solid ${C.blush}44`, borderRadius: 12, padding: "10px 14px", marginBottom: 16 }}>
        <div style={{ fontSize: 11.5, color: "#8a5a55", fontFamily: "Georgia, serif", lineHeight: 1.6 }}>
          ⚠️ This is for general information only and cannot diagnose you. Always see a doctor for persistent or severe symptoms.
        </div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
        {SYMPTOMS.map(s => {
          const on = selected.includes(s);
          return (
            <button key={s} onClick={() => toggle(s)} style={{
              background: on ? C.sage : C.white,
              color: on ? "#fff" : C.stone,
              border: `1.5px solid ${on ? C.sage : C.sageLight}`,
              borderRadius: 20, padding: "7px 14px",
              fontSize: 12.5, fontFamily: "Georgia, serif",
              cursor: "pointer", transition: "all 0.18s",
              boxShadow: on ? `0 3px 10px ${C.sage}44` : "0 1px 4px rgba(0,0,0,0.06)"
            }}>{s}</button>
          );
        })}
      </div>
      {selected.length > 0 && (
        <button onClick={check} disabled={loading} style={{
          width: "100%", padding: 13,
          background: `linear-gradient(135deg, ${C.sage}, ${C.sageDark})`,
          border: "none", borderRadius: 14, color: "#fff",
          fontSize: 14, fontFamily: "Georgia, serif", fontWeight: 600,
          cursor: "pointer", marginBottom: 16,
          boxShadow: `0 4px 14px ${C.sage}44`
        }}>{loading ? "Checking..." : `Check ${selected.length} symptom${selected.length > 1 ? "s" : ""}`}</button>
      )}
      {result && (
        <div style={{ background: C.white, borderRadius: 16, padding: 18, fontSize: 14, lineHeight: 1.75, fontFamily: "Georgia, serif", color: "#334155", boxShadow: "0 2px 12px rgba(0,0,0,0.07)", marginBottom: 16 }}>
          <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 15, fontWeight: 700, color: C.sageDark, marginBottom: 10 }}>
            About: {selected.join(", ")}
          </div>
          {result}
          <button onClick={() => { setSelected([]); setResult(""); }} style={{ marginTop: 14, background: C.sageLight, border: "none", borderRadius: 10, padding: "8px 14px", fontSize: 12, fontFamily: "Georgia, serif", color: C.sageDark, cursor: "pointer" }}>
            Start over
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Myths Tab ────────────────────────────────────────────────────────────────
function MythsTab() {
  const [open, setOpen] = useState(null);
  return (
    <div style={{ padding: 16, overflowY: "auto", height: "calc(100vh - 118px)", background: C.cream }}>
      <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 22, color: C.stone, marginBottom: 4 }}>Health Myth Busters</div>
      <div style={{ color: C.mist, fontSize: 12, fontFamily: "Georgia, serif", marginBottom: 18 }}>Things you've heard that aren't actually true</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {MYTHS.map((m, i) => {
          const isOpen = open === i;
          return (
            <div key={i} onClick={() => setOpen(isOpen ? null : i)} style={{
              background: C.white, borderRadius: 16, overflow: "hidden", cursor: "pointer",
              boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
              border: `1px solid ${isOpen ? C.sage : "transparent"}`,
              transition: "border-color 0.2s"
            }}>
              <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 26, flexShrink: 0 }}>{m.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: C.blush, fontFamily: "Georgia, serif", fontWeight: 600, marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.5px" }}>Myth</div>
                  <div style={{ fontSize: 13.5, color: C.stone, fontFamily: "Georgia, serif", lineHeight: 1.4 }}>{m.myth}</div>
                </div>
                <span style={{ color: C.mist, fontSize: 18, transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "rotate(0)", display: "inline-block" }}>⌄</span>
              </div>
              {isOpen && (
                <div style={{ padding: "0 16px 16px 54px" }}>
                  <div style={{ fontSize: 11, color: C.sageDark, fontFamily: "Georgia, serif", fontWeight: 600, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>✓ The Truth</div>
                  <div style={{ fontSize: 13.5, color: "#334155", fontFamily: "Georgia, serif", lineHeight: 1.7 }}>{m.truth}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Track Tab ────────────────────────────────────────────────────────────────
function TrackTab() {
  const [entries, setEntries] = useState(() => {
    try { return JSON.parse(localStorage.getItem("harbor_entries") || "[]"); } catch { return []; }
  });
  const [mood, setMood] = useState(null);
  const [symptoms, setSymptoms] = useState("");
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  function save() {
    if (mood === null) return;
    const entry = {
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      mood, symptoms, note, ts: Date.now()
    };
    const updated = [entry, ...entries].slice(0, 30);
    setEntries(updated);
    localStorage.setItem("harbor_entries", JSON.stringify(updated));
    setMood(null); setSymptoms(""); setNote("");
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  }

  const avgMood = entries.length ? (entries.reduce((a, e) => a + e.mood, 0) / entries.length).toFixed(1) : null;

  return (
    <div style={{ padding: 16, overflowY: "auto", height: "calc(100vh - 118px)", background: C.cream }}>
      <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 22, color: C.stone, marginBottom: 4 }}>Daily Check-In</div>
      <div style={{ color: C.mist, fontSize: 12, fontFamily: "Georgia, serif", marginBottom: 16 }}>Track how you're feeling over time</div>
      <div style={{ background: C.white, borderRadius: 20, padding: 18, marginBottom: 14, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.stone, fontFamily: "Georgia, serif", marginBottom: 12 }}>How are you feeling today?</div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          {MOODS.map((m, i) => (
            <button key={i} onClick={() => setMood(i)} style={{
              background: mood === i ? C.sageLight : "#f8fafc",
              border: `2px solid ${mood === i ? C.sage : "transparent"}`,
              borderRadius: 14, padding: "10px 6px",
              cursor: "pointer", transition: "all 0.18s",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              flex: 1, margin: "0 3px"
            }}>
              <span style={{ fontSize: 24 }}>{m}</span>
              <span style={{ fontSize: 9, color: C.mist, fontFamily: "Georgia, serif" }}>{MOOD_LABELS[i]}</span>
            </button>
          ))}
        </div>
        <input value={symptoms} onChange={e => setSymptoms(e.target.value)}
          placeholder="Any symptoms? (optional)"
          style={{ width: "100%", border: `1.5px solid ${C.sageLight}`, borderRadius: 10, padding: "9px 12px", fontSize: 13, fontFamily: "Georgia, serif", outline: "none", boxSizing: "border-box", color: C.stone, marginBottom: 10, background: C.cream }} />
        <textarea value={note} onChange={e => setNote(e.target.value)}
          placeholder="Quick note... (optional)" rows={2}
          style={{ width: "100%", border: `1.5px solid ${C.sageLight}`, borderRadius: 10, padding: "9px 12px", fontSize: 13, fontFamily: "Georgia, serif", outline: "none", resize: "none", boxSizing: "border-box", color: C.stone, marginBottom: 14, background: C.cream }} />
        <button onClick={save} disabled={mood === null} style={{
          width: "100%", padding: 12,
          background: mood !== null ? `linear-gradient(135deg, ${C.sage}, ${C.sageDark})` : "#e2e8f0",
          border: "none", borderRadius: 12,
          color: mood !== null ? "#fff" : C.mist,
          fontSize: 14, fontFamily: "Georgia, serif", fontWeight: 600,
          cursor: mood !== null ? "pointer" : "default", transition: "all 0.2s",
          boxShadow: mood !== null ? `0 4px 14px ${C.sage}44` : "none"
        }}>{saved ? "✓ Saved!" : "Save Check-In"}</button>
      </div>
      {entries.length > 0 && (
        <>
          {avgMood !== null && (
            <div style={{ background: C.sageLight, borderRadius: 16, padding: "14px 18px", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 11, color: C.sageDark, fontFamily: "Georgia, serif", fontWeight: 600 }}>AVERAGE MOOD</div>
                <div style={{ fontSize: 12, color: C.mist, fontFamily: "Georgia, serif" }}>Over {entries.length} check-in{entries.length > 1 ? "s" : ""}</div>
              </div>
              <span style={{ fontSize: 36 }}>{MOODS[Math.round(Number(avgMood))]}</span>
            </div>
          )}
          <div style={{ fontSize: 13, fontWeight: 600, color: C.stone, fontFamily: "Georgia, serif", marginBottom: 10 }}>Recent Check-Ins</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {entries.slice(0, 7).map((e, i) => (
              <div key={i} style={{ background: C.white, borderRadius: 14, padding: "12px 16px", boxShadow: "0 1px 6px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 26 }}>{MOODS[e.mood]}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.stone, fontFamily: "Georgia, serif" }}>{e.date} — {MOOD_LABELS[e.mood]}</div>
                  {e.symptoms && <div style={{ fontSize: 11, color: C.mist, fontFamily: "Georgia, serif" }}>{e.symptoms}</div>}
                  {e.note && <div style={{ fontSize: 11, color: "#64748b", fontFamily: "Georgia, serif", fontStyle: "italic" }}>{e.note}</div>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState(0);
  const isDesktop = window.innerWidth >= 768;

  return (
    <div style={{ background: isDesktop ? "#E8EFE8" : C.cream, minHeight: "100vh" }}>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&display=swap" rel="stylesheet" />
      <style>{`
        @media (min-width: 768px) {
          .harbor-shell {
            display: flex;
            align-items: flex-start;
            justify-content: center;
            gap: 32px;
            padding: 40px 32px;
            min-height: 100vh;
            box-sizing: border-box;
          }
          .harbor-sidebar {
            display: flex !important;
            flex-direction: column;
            width: 220px;
            flex-shrink: 0;
            position: sticky;
            top: 40px;
          }
          .harbor-main {
            width: 100%;
            max-width: 600px;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 8px 40px rgba(0,0,0,0.12);
          }
        }
        @media (max-width: 767px) {
          .harbor-shell { display: block; }
          .harbor-sidebar { display: none !important; }
          .harbor-main { border-radius: 0; box-shadow: none; }
        }
      `}</style>

      <div className="harbor-shell">
        {/* Desktop Sidebar */}
        <div className="harbor-sidebar" style={{ display: "none" }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div style={{
                width: 38, height: 38, borderRadius: "50%",
                background: `linear-gradient(135deg, ${C.sage}, ${C.sageDark})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, boxShadow: `0 4px 12px ${C.sage}55`
              }}>⚓</div>
              <div>
                <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 24, fontWeight: 700, color: C.stone }}>Harbor</div>
                <div style={{ color: C.mist, fontSize: 10, fontFamily: "Georgia, serif", fontStyle: "italic" }}>a safe place for your health</div>
              </div>
            </div>
          </div>

          {["Ask", "Topics", "Symptoms", "Myths", "Track"].map((t, i) => {
            const icons = ["💬", "📖", "🩺", "💥", "📅"];
            return (
              <button key={t} onClick={() => setTab(i)} style={{
                display: "flex", alignItems: "center", gap: 12,
                background: tab === i ? C.sageLight : "transparent",
                border: tab === i ? `1.5px solid ${C.sage}44` : "1.5px solid transparent",
                borderRadius: 14, padding: "12px 16px", cursor: "pointer",
                marginBottom: 6, transition: "all 0.2s", textAlign: "left", width: "100%"
              }}>
                <span style={{ fontSize: 18 }}>{icons[i]}</span>
                <span style={{ fontFamily: "Georgia, serif", fontSize: 14, color: tab === i ? C.sageDark : C.mist, fontWeight: tab === i ? 700 : 400 }}>{t}</span>
              </button>
            );
          })}

          <div style={{ marginTop: "auto", paddingTop: 32 }}>
            <div style={{ background: C.sageLight, borderRadius: 14, padding: "14px", fontSize: 11.5, fontFamily: "Georgia, serif", color: C.mist, lineHeight: 1.6, fontStyle: "italic" }}>
              Not a substitute for professional medical advice. Always see a doctor for diagnosis.
            </div>
          </div>
        </div>

        {/* Main App */}
        <div className="harbor-main" style={{ background: C.cream }}>
          <Header tab={tab} setTab={setTab} />
          {tab === 0 && <AskTab />}
          {tab === 1 && <TopicsTab />}
          {tab === 2 && <SymptomsTab />}
          {tab === 3 && <MythsTab />}
          {tab === 4 && <TrackTab />}
        </div>
      </div>
    </div>
  );
}
