import { useApp } from "../context/AppContext";

/**
 * 4-layer animated background for VeriAI:
 * L1: Deep void / crystal base
 * L3: Ambient fluid gradient orbs
 * L4: Dot-grid micro-texture overlay
 * Bonus: Scan line sweep effect
 * (L2 neural network is handled by NeuralBackground canvas)
 */
export function AmbientBackground() {
  const { isDark } = useApp();

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* ── LAYER 1 — Deep Void / Crystal Base ──────────────────────── */}
      <div
        className="absolute inset-0"
        style={{
          background: isDark
            ? "radial-gradient(ellipse at center, #06070D 0%, #030408 100%)"
            : "radial-gradient(ellipse at center, #FAFBFF 0%, #F0F1F8 100%)",
        }}
      />

      {/* ── LAYER 3 — Ambient Fluid Gradient Orbs ──────────────────── */}

      {/* ── DARK MODE ─────────────────────────────────────────────────── */}
      {isDark && (
        <>
          {/* Orb 1 — Electric Indigo, top-center area */}
          <div
            className="absolute"
            style={{
              top: "-20%",
              left: "10%",
              width: "60vw",
              height: "50vh",
              borderRadius: "50%",
              background:
                "radial-gradient(ellipse at center, rgba(79,70,229,0.08) 0%, transparent 70%)",
              filter: "blur(150px)",
              animation: "vOrb1 20s ease-in-out infinite",
            }}
          />

          {/* Orb 2 — Deep Sapphire Blue, bottom-right area */}
          <div
            className="absolute"
            style={{
              bottom: "-15%",
              right: "-10%",
              width: "50vw",
              height: "45vh",
              borderRadius: "50%",
              background:
                "radial-gradient(ellipse at center, rgba(30,58,138,0.06) 0%, transparent 70%)",
              filter: "blur(180px)",
              animation: "vOrb2 25s ease-in-out infinite",
            }}
          />

          {/* Orb 3 — Soft Violet, top-left area */}
          <div
            className="absolute"
            style={{
              top: "-10%",
              left: "-15%",
              width: "40vw",
              height: "35vh",
              borderRadius: "50%",
              background:
                "radial-gradient(ellipse at center, rgba(124,58,237,0.05) 0%, transparent 70%)",
              filter: "blur(140px)",
              animation: "vOrb3 18s ease-in-out infinite",
            }}
          />
        </>
      )}

      {/* ── LIGHT MODE ────────────────────────────────────────────────── */}
      {!isDark && (
        <>
          {/* Orb 1 — Soft Lavender */}
          <div
            className="absolute"
            style={{
              top: "-30%",
              left: "-15%",
              width: "75vw",
              height: "65vh",
              borderRadius: "50%",
              background:
                "radial-gradient(ellipse at center, rgba(224,231,255,0.50) 0%, rgba(224,231,255,0.20) 40%, transparent 70%)",
              filter: "blur(200px)",
              animation: "vOrb1 24s ease-in-out infinite",
            }}
          />

          {/* Orb 2 — Pale Sky Blue */}
          <div
            className="absolute"
            style={{
              top: "15%",
              right: "-20%",
              width: "60vw",
              height: "55vh",
              borderRadius: "50%",
              background:
                "radial-gradient(ellipse at center, rgba(219,234,254,0.40) 0%, rgba(219,234,254,0.16) 40%, transparent 70%)",
              filter: "blur(220px)",
              animation: "vOrb2 30s ease-in-out infinite",
            }}
          />

          {/* Orb 3 — Blush Pink */}
          <div
            className="absolute"
            style={{
              bottom: "-18%",
              left: "20%",
              width: "50vw",
              height: "45vh",
              borderRadius: "50%",
              background:
                "radial-gradient(ellipse at center, rgba(252,231,243,0.25) 0%, transparent 65%)",
              filter: "blur(180px)",
              animation: "vOrb3 20s ease-in-out infinite",
            }}
          />
        </>
      )}

      {/* ── LAYER 4 — Micro-Texture Dot Grid ──────────────────────── */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: isDark
            ? "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)"
            : "radial-gradient(circle, rgba(0,0,0,0.025) 1px, transparent 1px)",
          backgroundSize: "31px 31px",
        }}
      />

      {/* ── BONUS — Scan Line Sweep ───────────────────────────────── */}
      <div
        className="absolute left-0 right-0"
        style={{
          height: "1px",
          background: isDark
            ? "linear-gradient(90deg, rgba(79,70,229,0.04) 0%, rgba(79,70,229,0.08) 50%, rgba(79,70,229,0.04) 100%)"
            : "linear-gradient(90deg, rgba(79,70,229,0.02) 0%, rgba(79,70,229,0.05) 50%, rgba(79,70,229,0.02) 100%)",
          animation: "vScanLine 9s linear infinite",
        }}
      />

      <style>{`
        @keyframes vOrb1 {
          0%,  100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(5vw, 4vh) scale(1.06); }
          66%       { transform: translate(-3vw, 2vh) scale(0.96); }
        }
        @keyframes vOrb2 {
          0%,  100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(-5vw, 5vh) scale(1.04); }
          66%       { transform: translate(4vw, -4vh) scale(0.97); }
        }
        @keyframes vOrb3 {
          0%,  100% { transform: translate(0, 0) scale(1); }
          40%       { transform: translate(4vw, -5vh) scale(1.05); }
          70%       { transform: translate(-5vw, 3vh) scale(0.94); }
        }
        @keyframes vScanLine {
          0%   { top: -2px; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  );
}
