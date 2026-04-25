import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Info,
  AlignLeft,
  FileText,
  Clock,
  RotateCcw,
  Bot,
  UserRound,
  ShieldAlert,
  ScanLine,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useApp } from "../context/AppContext";

/* ─── Types ─────────────────────────────────────────────────────────────────── */

interface Segment { text: string; isAI: boolean; }
interface ModelAttribution { name: string; score: number; color?: string; accent?: string; }
export interface ResultsData {
  aiScore: number; humanScore: number; confidence: number; label: string; model: string;
  submittedText?: string; wordCount?: number;
  modelAttributions?: ModelAttribution[];
  segments?: Segment[];
  chunks: { text: string; score: number }[];
  stats: { analyzed: number; flagged: number; clean: number };
}

/* ─── Spatial glass style helper ────────────────────────────────────────────── */

function useGlass(isDark: boolean) {
  return {
    card: {
      background: isDark ? "rgba(15,17,26,0.55)" : "rgba(255,255,255,0.65)",
      backdropFilter: isDark ? "blur(40px) saturate(1.4)" : "blur(40px) saturate(1.3)",
      WebkitBackdropFilter: isDark ? "blur(40px) saturate(1.4)" : "blur(40px) saturate(1.3)",
      border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(255,255,255,0.80)",
      boxShadow: isDark
        ? "0 8px 32px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.04)"
        : "0 8px 32px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)",
    } as React.CSSProperties,
    inner: {
      background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
      border: isDark ? "1px solid rgba(255,255,255,0.04)" : "1px solid rgba(0,0,0,0.05)",
    } as React.CSSProperties,
    textHeading: isDark ? "text-[rgba(255,255,255,0.92)]" : "text-[#0F111A]",
    textBody: isDark ? "text-[rgba(255,255,255,0.58)]" : "text-[#4B5563]",
    textMuted: isDark ? "text-[rgba(255,255,255,0.28)]" : "text-[#9CA3AF]",
    textCaption: isDark ? "text-[rgba(255,255,255,0.2)]" : "text-[#B0B7C3]",
    chipBrand: isDark
      ? "bg-[rgba(99,102,241,0.1)] border-[rgba(99,102,241,0.18)] text-[rgba(165,180,252,0.85)]"
      : "bg-[rgba(99,102,241,0.06)] border-[rgba(99,102,241,0.12)] text-[#4338CA]",
    tagBg: isDark
      ? "bg-[rgba(255,255,255,0.04)] text-[rgba(255,255,255,0.38)]"
      : "bg-[rgba(0,0,0,0.04)] text-[#6B7280]",
    statusAI: isDark
      ? "bg-[rgba(220,38,38,0.08)] border-[rgba(220,38,38,0.15)] text-[rgba(252,165,165,0.8)]"
      : "bg-[rgba(220,38,38,0.06)] border-[rgba(220,38,38,0.12)] text-[#B91C1C]",
    statusHuman: isDark
      ? "bg-[rgba(20,184,166,0.08)] border-[rgba(20,184,166,0.15)] text-[rgba(94,234,212,0.8)]"
      : "bg-[rgba(20,184,166,0.06)] border-[rgba(20,184,166,0.12)] text-[#0F766E]",
    statusMixed: isDark
      ? "bg-[rgba(245,158,11,0.08)] border-[rgba(245,158,11,0.15)] text-[rgba(252,211,77,0.8)]"
      : "bg-[rgba(245,158,11,0.06)] border-[rgba(245,158,11,0.12)] text-[#B45309]",
    btnSecondary: isDark
      ? "border-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.4)] hover:bg-[rgba(255,255,255,0.04)] hover:text-[rgba(255,255,255,0.65)]"
      : "border-[rgba(0,0,0,0.07)] text-[#6B7280] hover:bg-[rgba(0,0,0,0.03)] hover:text-[#374151]",
  };
}

/* ─── 3D Glass Ring Donut ───────────────────────────────────────────────────── */

function GlassRing({ aiScore, isDark, g }: { aiScore: number; isDark: boolean; g: ReturnType<typeof useGlass> }) {
  const R = 78;
  const STROKE = 10;
  const SIZE = (R + STROKE) * 2 + 8;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const CIRC = 2 * Math.PI * R;
  const aiDash = (aiScore / 100) * CIRC;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        {/* Glow behind ring */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${isDark ? "rgba(99,102,241,0.1)" : "rgba(99,102,241,0.08)"} 30%, transparent 70%)`,
            filter: "blur(20px)",
          }}
        />

        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ transform: "rotate(-90deg)" }}>
          <defs>
            <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4338CA" />
              <stop offset="50%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#818CF8" />
            </linearGradient>
            <filter id="ring-glow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Track */}
          <circle cx={CX} cy={CY} r={R} fill="none"
            stroke={isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)"}
            strokeWidth={STROKE}
          />

          {/* Human arc */}
          <motion.circle cx={CX} cy={CY} r={R} fill="none"
            stroke={isDark ? "rgba(20,184,166,0.15)" : "rgba(20,184,166,0.12)"}
            strokeWidth={STROKE - 3}
            strokeLinecap="round"
            strokeDasharray={`${((100 - aiScore) / 100) * CIRC - 4} ${CIRC - (((100 - aiScore) / 100) * CIRC - 4)}`}
            strokeDashoffset={-(aiDash + 2)}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          />

          {/* AI arc — glowing 3D glass */}
          <motion.circle cx={CX} cy={CY} r={R} fill="none"
            stroke="url(#ring-grad)"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRC}
            filter="url(#ring-glow)"
            initial={{ strokeDashoffset: CIRC }}
            animate={{ strokeDashoffset: CIRC - aiDash + 2 }}
            transition={{ duration: 1.4, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 }}
          />
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            style={{
              fontSize: "33px",
              fontWeight: 700,
              letterSpacing: "-1px",
              lineHeight: 1,
              color: isDark ? "rgba(255,255,255,0.93)" : "#0F111A",
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, delay: 0.75 }}
          >
            {aiScore}%
          </motion.span>
          <motion.span
            style={{
              fontSize: "10px",
              fontWeight: 600,
              marginTop: "6px",
              letterSpacing: "0.12em",
              textTransform: "uppercase" as const,
              color: isDark ? "rgba(255,255,255,0.30)" : "#9CA3AF",
            }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.95 }}
          >
            {aiScore >= 75 ? "HIGH LIKELIHOOD" : aiScore >= 45 ? "MIXED SIGNAL" : "LIKELY HUMAN"}
          </motion.span>
        </div>
      </div>

      {/* Split label */}
      <motion.div
        className={`flex items-center gap-3 text-[11px] ${g.textBody}`}
        style={{ marginTop: "-4px" }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 1.05 }}
      >
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-[6px] w-[6px] rounded-full" style={{ backgroundColor: "rgba(20,184,166,0.6)" }} />
          Human {100 - aiScore}%
        </span>
        <span className={g.textCaption}>|</span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-[6px] w-[6px] rounded-full" style={{ background: "linear-gradient(135deg, #4338CA, #6366F1)" }} />
          AI {aiScore}%
        </span>
      </motion.div>
    </div>
  );
}

/* ─── Model Attribution — Glowing Pills ─────────────────────────────────────── */

function ModelPill({ name, score, rank, isDark, g }: {
  name: string; score: number; rank: number; isDark: boolean; g: ReturnType<typeof useGlass>;
}) {
  const intensities = [1, 0.6, 0.38, 0.22];
  const opacity = intensities[rank] ?? 0.15;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.1 + 0.3, duration: 0.35 }}
    >
      <div className="mb-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={g.textCaption}
            style={{ fontSize: "9px", fontWeight: 700, fontVariantNumeric: "tabular-nums", width: "14px", letterSpacing: "0.05em" }}
          >
            {String(rank + 1).padStart(2, "0")}
          </span>
          <span className={g.textBody}
            style={{ fontSize: "11px", fontWeight: rank === 0 ? 600 : 400, letterSpacing: "0.04em", textTransform: "uppercase" }}
          >
            {name}
          </span>
        </div>
        <span className={g.textBody}
          style={{ fontSize: "11px", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}
        >
          {score}%
        </span>
      </div>
      {/* Glowing pill track */}
      <div className="overflow-hidden rounded-full" style={{
        height: "5px",
        background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)",
      }}>
        <motion.div
          style={{
            height: "100%",
            borderRadius: "9999px",
            background: rank === 0
              ? "linear-gradient(to right, #4338CA, #6366F1, #818CF8)"
              : `rgba(99,102,241,${opacity})`,
            boxShadow: rank === 0
              ? `0 0 12px rgba(99,102,241,0.4)`
              : `0 0 6px rgba(99,102,241,${opacity * 0.5})`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ delay: rank * 0.1 + 0.45, duration: 0.75, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
}

/* ─── Ethereal Sentence Highlight ───────────────────────────────────────────── */

function EtherealSentence({ seg, idx, isDark }: { seg: Segment; idx: number; isDark: boolean }) {
  if (seg.isAI) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -4 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.04 * idx + 0.35, duration: 0.45 }}
        style={{
          display: "block",
          padding: "8px 14px",
          marginBottom: "6px",
          borderRadius: "6px",
          borderLeft: "2px solid rgba(220,60,60,0.55)",
          background: isDark
            ? "rgba(220,60,60,0.06)"
            : "rgba(220,60,60,0.04)",
          fontSize: "13px",
          lineHeight: "1.75",
          color: isDark ? "rgba(255,255,255,0.82)" : "#1E293B",
        }}
      >
        {seg.text}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -4 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.04 * idx + 0.35, duration: 0.45 }}
      style={{
        display: "block",
        padding: "8px 14px",
        marginBottom: "6px",
        borderRadius: "6px",
        borderLeft: "2px solid rgba(20,184,166,0.55)",
        background: isDark
          ? "rgba(20,184,166,0.05)"
          : "rgba(20,184,166,0.04)",
        fontSize: "13px",
        lineHeight: "1.75",
        color: isDark ? "rgba(255,255,255,0.88)" : "#0F172A",
      }}
    >
      {seg.text}
    </motion.div>
  );
}

/* ─── Main ResultsPanel ────────────────────────────────────────────────────── */

export function ResultsPanel({ data }: { data: ResultsData }) {
  const { isDark } = useApp();
  const g = useGlass(isDark);
  const [showInfo, setShowInfo] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const wordCount = data.wordCount ?? 350;
  const submittedText = data.submittedText ??
    "The implications of artificial intelligence on modern education systems cannot be overstated. As we navigate the complexities of integrating technology into traditional learning environments, educators must remain vigilant about preserving the integrity of academic work. However, critics argue that the over-reliance on automated tools may diminish the value of critical thinking skills that are fundamental to intellectual growth. In my own experience teaching high school students, I've noticed a growing trend where students prefer to use AI rather than develop their own analytical frameworks. The research conducted by Johnson et al. (2024) demonstrates a statistically significant correlation between AI usage in academic writing and decreased originality scores. I genuinely believe that we need to find a middle ground — one that embraces innovation while preserving the authenticity of human thought and expression. Ultimately, the responsibility falls on institutions to create clear, enforceable policies that both leverage the benefits of AI assistance and uphold the standards of original scholarship.";

  const modelAttributions: ModelAttribution[] = data.modelAttributions ?? [
    { name: "GPT-4 Turbo", score: 62 },
    { name: "Claude 3 Opus", score: 18 },
    { name: "Gemini 1.5 Pro", score: 13 },
    { name: "Llama 3 70B", score: 7 },
  ];

  const segments: Segment[] = data.segments ?? [
    { text: "The implications of artificial intelligence on modern education systems cannot be overstated.", isAI: true },
    { text: "As we navigate the complexities of integrating technology into traditional learning environments, educators must remain vigilant about preserving the integrity of academic work.", isAI: true },
    { text: "However, critics argue that the over-reliance on automated tools may diminish the value of critical thinking skills that are fundamental to intellectual growth.", isAI: true },
    { text: "In my own experience teaching high school students, I've noticed a growing trend where students prefer to use AI rather than develop their own analytical frameworks.", isAI: false },
    { text: "The research conducted by Johnson et al. (2024) demonstrates a statistically significant correlation between AI usage in academic writing and decreased originality scores.", isAI: true },
    { text: "I genuinely believe that we need to find a middle ground — one that embraces innovation while preserving the authenticity of human thought and expression.", isAI: false },
    { text: "Ultimately, the responsibility falls on institutions to create clear, enforceable policies that both leverage the benefits of AI assistance and uphold the standards of original scholarship.", isAI: true },
  ];

  const aiSentences = segments.filter((s) => s.isAI).length;
  const humanSentences = segments.filter((s) => !s.isAI).length;

  const previewText = submittedText.slice(0, 180) + (submittedText.length > 180 ? "..." : "");
  const needsExpand = submittedText.length > 180;

  const scoreStatus =
    data.aiScore >= 75
      ? { label: "AI-Generated", cls: g.statusAI, icon: Bot }
      : data.aiScore >= 45
      ? { label: "Mixed Content", cls: g.statusMixed, icon: ScanLine }
      : { label: "Human-Written", cls: g.statusHuman, icon: UserRound };

  const StatusIcon = scoreStatus.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="space-y-4"
    >
      {/* 1. INPUT HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-2xl p-5"
        style={g.card}
      >
        <div className="mb-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
              style={{ background: isDark ? "rgba(99,102,241,0.1)" : "rgba(99,102,241,0.06)" }}>
              <AlignLeft className="h-3.5 w-3.5" style={{ color: "#6366F1" }} />
            </div>
            <span className={g.textBody} style={{ fontSize: "12px", fontWeight: 500 }}>
              Submitted Text
            </span>
          </div>
          <span className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] ${scoreStatus.cls}`}
            style={{ fontWeight: 600, letterSpacing: "0.03em", textTransform: "uppercase" }}>
            <StatusIcon className="h-3 w-3" />
            {scoreStatus.label}
          </span>
        </div>

        <div className="rounded-xl p-4" style={g.inner}>
          <p className={g.textBody} style={{ fontSize: "12px", lineHeight: "1.7" }}>
            {expanded ? submittedText : previewText}
          </p>
          {needsExpand && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="mt-2 flex items-center gap-1 text-[10px] transition-colors"
              style={{ color: "#6366F1" }}
            >
              {expanded ? <><ChevronUp className="h-3 w-3" /> Collapse</> : <><ChevronDown className="h-3 w-3" /> Expand full text</>}
            </button>
          )}
        </div>

        <div className="mt-3.5 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { icon: FileText, label: `${wordCount} words` },
              { icon: Clock, label: "Just now" },
              { icon: ScanLine, label: `${data.confidence}% confidence` },
            ].map((chip) => (
              <span key={chip.label} className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[10px] ${g.tagBg}`}>
                <chip.icon className="h-3 w-3" />
                {chip.label}
              </span>
            ))}
          </div>
          <button className={`flex items-center gap-1.5 rounded-lg border px-3.5 py-1.5 text-[11px] transition-all ${g.btnSecondary}`}
            style={{ fontWeight: 500 }}>
            <RotateCcw className="h-3 w-3" />
            Re-analyze
          </button>
        </div>
      </motion.div>

      {/* 2. HIGH-LEVEL METRICS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* LEFT: Global AI Probability */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.4 }}
          className="rounded-2xl p-6"
          style={g.card}
        >
          <div className="mb-6 flex items-center justify-between">
            <span className={g.textCaption}
              style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" }}>
              Global AI Probability
            </span>
            <Info className="h-3.5 w-3.5" style={{ color: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.2)" }} />
          </div>

          <div className="flex justify-center">
            <GlassRing aiScore={data.aiScore} isDark={isDark} g={g} />
          </div>

          <div className="mt-6 grid grid-cols-3 rounded-xl overflow-hidden" style={g.inner}>
            {[
              { label: "SCANNED", value: data.stats.analyzed },
              { label: "FLAGGED", value: data.stats.flagged },
              { label: "CLEAN", value: data.stats.clean },
            ].map((s, i) => (
              <div key={s.label} className="flex flex-col items-center py-3.5"
                style={{
                  borderRight: i < 2
                    ? isDark ? "1px solid rgba(255,255,255,0.04)" : "1px solid rgba(0,0,0,0.05)"
                    : "none",
                }}>
                <span className={g.textHeading}
                  style={{ fontSize: "18px", fontWeight: 700, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
                  <motion.span key={s.value} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}>{s.value}</motion.span>
                </span>
                <span className={g.textCaption}
                  style={{ fontSize: "9px", marginTop: "4px", fontWeight: 700, letterSpacing: "0.12em" }}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* RIGHT: Model Attribution */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14, duration: 0.4 }}
          className="rounded-2xl p-6"
          style={g.card}
        >
          <div className="mb-6 flex items-center justify-between">
            <span className={g.textCaption}
              style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" }}>
              Model Attribution
            </span>
            <div className="relative">
              <button onClick={() => setShowInfo((v) => !v)} className="flex items-center justify-center rounded-md transition-opacity hover:opacity-70">
                <Info className="h-3.5 w-3.5" style={{ color: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.2)" }} />
              </button>
              <AnimatePresence>
                {showInfo && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.94, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.94, y: -4 }}
                    transition={{ duration: 0.14 }}
                    className="absolute right-0 top-7 z-30 w-60 rounded-xl p-3.5"
                    style={{
                      ...g.card,
                      boxShadow: "0 16px 48px rgba(0,0,0,0.2)",
                    }}
                  >
                    <p className={g.textBody} style={{ fontSize: "11px", lineHeight: "1.65" }}>
                      Scores represent stylometric similarity to each model's known output patterns across 12 independent classifiers.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="space-y-5">
            {modelAttributions.map((m, i) => (
              <ModelPill key={m.name} name={m.name} score={m.score} rank={i} isDark={isDark} g={g} />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.85 }}
            className="mt-5 rounded-lg px-3 py-2.5"
            style={g.inner}
          >
            <p className={g.textCaption} style={{ fontSize: "10px" }}>
              +8 additional models tested — each scored below 5% attribution threshold.
            </p>
          </motion.div>

          <p className={g.textCaption}
            style={{ fontSize: "10px", marginTop: "14px", fontStyle: "italic", lineHeight: "1.6" }}>
            Attribution is probabilistic. Results reflect pattern similarity, not definitive model identification.
          </p>
        </motion.div>
      </div>

      {/* 3. SEMANTIC BREAKDOWN */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22, duration: 0.45 }}
        className="rounded-2xl p-6"
        style={g.card}
      >
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className={g.textHeading} style={{ fontSize: "14px", fontWeight: 600 }}>
              Semantic Breakdown
            </span>
            <span className={`rounded-md border px-2 py-0.5 text-[9px] ${g.chipBrand}`}
              style={{ fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Sentence-level
            </span>
          </div>

          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <span className="inline-block rounded-full" style={{
                width: "8px", height: "8px",
                background: isDark ? "rgba(20,184,166,0.5)" : "rgba(20,184,166,0.4)",
                boxShadow: `0 0 6px ${isDark ? "rgba(20,184,166,0.3)" : "rgba(20,184,166,0.2)"}`,
              }} />
              <span className={g.textBody} style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                Human
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block rounded-full" style={{
                width: "8px", height: "8px",
                background: isDark ? "rgba(220,80,80,0.5)" : "rgba(220,60,60,0.4)",
                boxShadow: `0 0 6px ${isDark ? "rgba(220,80,80,0.3)" : "rgba(220,60,60,0.2)"}`,
              }} />
              <span className={g.textBody} style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                AI-Generated
              </span>
            </div>
          </div>
        </div>

        <div className={`mb-5 h-px ${isDark ? "bg-[rgba(255,255,255,0.04)]" : "bg-[rgba(0,0,0,0.05)]"}`} />

        {/* Ethereal text analysis */}
        <div className="rounded-xl p-5" style={g.inner}>
          <div style={{ fontSize: "13.5px", lineHeight: "1.8" }}>
            {segments.map((seg, i) => (
              <EtherealSentence key={i} seg={seg} idx={i} isDark={isDark} />
            ))}
          </div>
        </div>

        {/* Summary pills */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {[
            {
              icon: Bot, label: `${aiSentences} AI sentences`,
              style: isDark
                ? { bg: "rgba(220,60,60,0.06)", border: "rgba(220,60,60,0.12)", color: "rgba(252,165,165,0.75)" }
                : { bg: "rgba(220,60,60,0.05)", border: "rgba(220,60,60,0.1)", color: "#B91C1C" },
            },
            {
              icon: UserRound, label: `${humanSentences} human sentences`,
              style: isDark
                ? { bg: "rgba(20,184,166,0.06)", border: "rgba(20,184,166,0.12)", color: "rgba(94,234,212,0.75)" }
                : { bg: "rgba(20,184,166,0.05)", border: "rgba(20,184,166,0.1)", color: "#0F766E" },
            },
            {
              icon: ScanLine, label: `${data.confidence}% avg. confidence`,
              style: isDark
                ? { bg: "rgba(99,102,241,0.08)", border: "rgba(99,102,241,0.15)", color: "rgba(165,180,252,0.8)" }
                : { bg: "rgba(99,102,241,0.06)", border: "rgba(99,102,241,0.12)", color: "#4338CA" },
            },
            {
              icon: ShieldAlert,
              label: data.aiScore >= 75 ? "High risk" : data.aiScore >= 45 ? "Medium risk" : "Low risk",
              style: isDark
                ? { bg: "rgba(245,158,11,0.06)", border: "rgba(245,158,11,0.12)", color: "rgba(252,211,77,0.75)" }
                : { bg: "rgba(245,158,11,0.06)", border: "rgba(245,158,11,0.12)", color: "#B45309" },
            },
          ].map((pill, i) => (
            <motion.span
              key={pill.label}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 + 0.07 * i, duration: 0.3 }}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
              style={{
                fontSize: "10px", fontWeight: 600,
                background: pill.style.bg,
                border: `1px solid ${pill.style.border}`,
                color: pill.style.color,
                letterSpacing: "0.02em",
              }}
            >
              <pill.icon style={{ width: "10px", height: "10px" }} />
              {pill.label}
            </motion.span>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}