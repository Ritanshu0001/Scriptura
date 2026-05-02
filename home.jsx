import { useState } from "react";

const RELIGIONS = [
  {
    id: "buddhism",
    label: "Buddhism",
    symbol: "☸",
    color: "#C4873A",
    bg: "#1a1208",
    accent: "#e8a84c",
    glow: "rgba(196,135,58,0.3)",
    desc: "The Dhamma",
  },
  {
    id: "christianity",
    label: "Christianity",
    symbol: "✝",
    color: "#6B9FD4",
    bg: "#080f1a",
    accent: "#9dc4f0",
    glow: "rgba(107,159,212,0.3)",
    desc: "The Scripture",
  },
  {
    id: "hinduism",
    label: "Hinduism",
    symbol: "ॐ",
    color: "#C45B3A",
    bg: "#1a0d08",
    accent: "#e8784c",
    glow: "rgba(196,91,58,0.3)",
    desc: "The Vedas",
  },
  {
    id: "islam",
    label: "Islam",
    symbol: "☽",
    color: "#4AAD8B",
    bg: "#08141a",
    accent: "#6ecfae",
    glow: "rgba(74,173,139,0.3)",
    desc: "The Quran",
  },
  {
    id: "sikhism",
    label: "Sikhism",
    symbol: "☬",
    color: "#D4A017",
    bg: "#181200",
    accent: "#f0c040",
    glow: "rgba(212,160,23,0.3)",
    desc: "The Guru Granth Sahib",
  },
  {
    id: "judaism",
    label: "Judaism",
    symbol: "✡",
    color: "#7B9FD4",
    bg: "#08101a",
    accent: "#a8c8f8",
    glow: "rgba(123,159,212,0.3)",
    desc: "The Torah & Talmud",
  },
  {
    id: "taoism",
    label: "Taoism",
    symbol: "☯",
    color: "#7DAF8A",
    bg: "#081410",
    accent: "#a8d4b4",
    glow: "rgba(125,175,138,0.3)",
    desc: "The Tao Te Ching",
  },
  {
    id: "stoicism",
    label: "Stoicism",
    symbol: "⚖",
    color: "#A09080",
    bg: "#111010",
    accent: "#d4c4b0",
    glow: "rgba(160,144,128,0.3)",
    desc: "The Stoic Masters",
  },
];

const SYSTEM_PROMPT = (religion) => `You are a compassionate spiritual guide well-versed in ${religion}. 
When given a personal struggle or problem, respond with:
1. A direct, authentic quote from ${religion}'s sacred texts or teachings (with its source/reference)
2. A warm, thoughtful explanation (3–5 sentences) of how this teaching speaks to the person's specific situation.

Format your response as JSON only, no markdown:
{
  "quote": "the exact quote here",
  "source": "book/chapter/verse or teaching name",
  "explanation": "your explanation here"
}`;

export default function App() {
  const [selected, setSelected] = useState(null);
  const [problem, setProblem] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const religion = RELIGIONS.find((r) => r.id === selected);

  const ask = async () => {
    if (!selected || !problem.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT(religion.label),
          messages: [{ role: "user", content: problem.trim() }],
        }),
      });
      const data = await res.json();
      const text = data.content?.map((b) => b.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResult(parsed);
    } catch (e) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setProblem("");
  };

  const bg = religion?.bg || "#0e0e0e";
  const accent = religion?.accent || "#888";
  const glow = religion?.glow || "rgba(255,255,255,0.1)";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: bg,
        transition: "background 0.8s ease",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "40px 20px 80px",
        fontFamily: "'Georgia', serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient glow orb */}
      <div
        style={{
          position: "fixed",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`,
          pointerEvents: "none",
          transition: "background 0.8s ease",
          zIndex: 0,
        }}
      />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "680px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <div
            style={{
              fontSize: "11px",
              letterSpacing: "0.4em",
              color: accent,
              opacity: 0.7,
              marginBottom: "16px",
              textTransform: "uppercase",
              fontFamily: "'Georgia', serif",
            }}
          >
            Sacred Wisdom
          </div>
          <h1
            style={{
              fontSize: "clamp(28px, 5vw, 44px)",
              fontWeight: "400",
              color: "#f0ece4",
              margin: "0 0 12px",
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
              fontFamily: "'Georgia', serif",
            }}
          >
            Seek guidance from<br />
            <em style={{ color: accent, fontStyle: "italic" }}>ancient wisdom</em>
          </h1>
          <p style={{ color: "#888", fontSize: "14px", margin: 0, lineHeight: 1.6 }}>
            Share your struggle. Receive a teaching.
          </p>
        </div>

        {/* Step 1 — Choose tradition */}
        <div style={{ marginBottom: "32px" }}>
          <div
            style={{
              fontSize: "10px",
              letterSpacing: "0.3em",
              color: "#555",
              textTransform: "uppercase",
              marginBottom: "16px",
            }}
          >
            01 — Choose your tradition
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "10px",
            }}
          >
            {RELIGIONS.map((r) => (
              <button
                key={r.id}
                onClick={() => { setSelected(r.id); setResult(null); }}
                style={{
                  background:
                    selected === r.id
                      ? `linear-gradient(135deg, ${r.color}22, ${r.color}11)`
                      : "rgba(255,255,255,0.03)",
                  border: `1px solid ${selected === r.id ? r.color : "rgba(255,255,255,0.08)"}`,
                  borderRadius: "12px",
                  padding: "14px 14px",
                  cursor: "pointer",
                  color: selected === r.id ? r.accent : "#666",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  transition: "all 0.3s ease",
                  textAlign: "left",
                  boxShadow: selected === r.id ? `0 0 24px ${r.glow}` : "none",
                }}
              >
                <span
                  style={{
                    fontSize: "24px",
                    lineHeight: 1,
                    opacity: selected === r.id ? 1 : 0.4,
                    transition: "opacity 0.3s",
                    flexShrink: 0,
                  }}
                >
                  {r.symbol}
                </span>
                <div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      letterSpacing: "0.01em",
                      fontFamily: "Georgia, serif",
                    }}
                  >
                    {r.label}
                  </div>
                  <div style={{ fontSize: "11px", opacity: 0.5, marginTop: "2px" }}>
                    {r.desc}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2 — Enter problem */}
        <div
          style={{
            marginBottom: "28px",
            opacity: selected ? 1 : 0.3,
            transition: "opacity 0.4s ease",
            pointerEvents: selected ? "auto" : "none",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              letterSpacing: "0.3em",
              color: "#555",
              textTransform: "uppercase",
              marginBottom: "16px",
            }}
          >
            02 — Describe your struggle
          </div>
          <textarea
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            placeholder="What weighs on your heart? Be honest — the more you share, the more meaningful the guidance..."
            rows={5}
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${problem && selected ? accent + "44" : "rgba(255,255,255,0.08)"}`,
              borderRadius: "12px",
              padding: "18px",
              color: "#e8e2d8",
              fontSize: "15px",
              lineHeight: "1.7",
              resize: "vertical",
              outline: "none",
              fontFamily: "Georgia, serif",
              boxSizing: "border-box",
              transition: "border-color 0.3s",
            }}
          />
        </div>

        {/* Submit button */}
        <button
          onClick={result ? reset : ask}
          disabled={loading || (!result && (!selected || !problem.trim()))}
          style={{
            width: "100%",
            padding: "18px",
            background:
              loading
                ? "rgba(255,255,255,0.05)"
                : result
                ? "rgba(255,255,255,0.05)"
                : `linear-gradient(135deg, ${accent}cc, ${religion?.color || "#888"}aa)`,
            border: `1px solid ${accent || "#444"}44`,
            borderRadius: "12px",
            color: result || loading ? "#888" : "#0e0e0e",
            fontSize: "14px",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            cursor: loading || (!result && (!selected || !problem.trim())) ? "not-allowed" : "pointer",
            fontFamily: "Georgia, serif",
            fontWeight: "600",
            transition: "all 0.3s ease",
            marginBottom: "40px",
          }}
        >
          {loading ? "Seeking wisdom..." : result ? "← Ask another question" : "Receive guidance"}
        </button>

        {/* Loading shimmer */}
        {loading && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div
              style={{
                fontSize: "36px",
                animation: "pulse 2s ease-in-out infinite",
                marginBottom: "16px",
              }}
            >
              {religion?.symbol}
            </div>
            <p style={{ color: "#555", fontSize: "13px", letterSpacing: "0.1em" }}>
              Consulting the {religion?.desc}...
            </p>
            <style>{`@keyframes pulse { 0%,100%{opacity:0.3;transform:scale(1)} 50%{opacity:1;transform:scale(1.1)} }`}</style>
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            style={{
              background: "rgba(255,80,80,0.08)",
              border: "1px solid rgba(255,80,80,0.2)",
              borderRadius: "12px",
              padding: "20px",
              color: "#ff8080",
              fontSize: "14px",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        {/* Result */}
        {result && !loading && (
          <div
            style={{
              animation: "fadeUp 0.6s ease forwards",
              opacity: 0,
            }}
          >
            <style>{`
              @keyframes fadeUp {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}</style>

            {/* Quote block */}
            <div
              style={{
                background: `linear-gradient(135deg, ${religion?.color}18, ${religion?.color}08)`,
                border: `1px solid ${religion?.color}33`,
                borderLeft: `3px solid ${accent}`,
                borderRadius: "0 12px 12px 0",
                padding: "32px",
                marginBottom: "24px",
                position: "relative",
                boxShadow: `0 0 40px ${glow}`,
              }}
            >
              <div
                style={{
                  fontSize: "64px",
                  color: accent,
                  opacity: 0.2,
                  lineHeight: 0.8,
                  position: "absolute",
                  top: "20px",
                  left: "24px",
                  fontFamily: "Georgia, serif",
                }}
              >
                "
              </div>
              <p
                style={{
                  color: "#f0ece4",
                  fontSize: "clamp(16px, 2.5vw, 20px)",
                  lineHeight: "1.75",
                  fontStyle: "italic",
                  margin: "0 0 20px",
                  paddingTop: "16px",
                  fontFamily: "Georgia, serif",
                }}
              >
                {result.quote}
              </p>
              <div
                style={{
                  fontSize: "12px",
                  color: accent,
                  letterSpacing: "0.1em",
                  opacity: 0.8,
                }}
              >
                — {result.source}
              </div>
            </div>

            {/* Explanation */}
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "12px",
                padding: "28px",
              }}
            >
              <div
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.3em",
                  color: accent,
                  opacity: 0.6,
                  textTransform: "uppercase",
                  marginBottom: "16px",
                }}
              >
                {religion?.symbol} How this speaks to you
              </div>
              <p
                style={{
                  color: "#b0a898",
                  fontSize: "15px",
                  lineHeight: "1.85",
                  margin: 0,
                  fontFamily: "Georgia, serif",
                }}
              >
                {result.explanation}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}