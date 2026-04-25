import { useEffect, useState } from "react";
import { Clock, FileText, TrendingUp, BarChart3, ArrowUpRight, Lock, Sparkles, Zap, Shield } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { listSubmissionsRequest, SubmissionListItemResponse } from "../services/api";

const fallbackHistory = [
  { title: "Research Paper - Methodology", score: 92, time: "2 min ago", status: "ai" },
  { title: "Blog Post - Introduction", score: 18, time: "15 min ago", status: "human" },
  { title: "Essay - Climate Change", score: 67, time: "1 hr ago", status: "mixed" },
  { title: "Product Description v2", score: 95, time: "3 hrs ago", status: "ai" },
  { title: "Cover Letter - Marketing", score: 12, time: "Yesterday", status: "human" },
];

const scanData = [40, 65, 48, 80, 72, 90, 75, 95, 88, 100, 92, 98];
const accuracyData = [94, 96, 95, 97, 96, 98, 97, 99, 98, 97, 99, 98];

interface HistoryRow {
  title: string;
  score: number;
  time: string;
  status: "ai" | "human" | "mixed";
}

function formatRelativeTime(isoDate: string): string {
  const timestamp = new Date(isoDate).getTime();
  if (Number.isNaN(timestamp)) {
    return "Unknown";
  }

  const deltaSeconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));

  if (deltaSeconds < 60) {
    return "Just now";
  }

  const deltaMinutes = Math.floor(deltaSeconds / 60);
  if (deltaMinutes < 60) {
    return `${deltaMinutes} min ago`;
  }

  const deltaHours = Math.floor(deltaMinutes / 60);
  if (deltaHours < 24) {
    return `${deltaHours} hr ago`;
  }

  const deltaDays = Math.floor(deltaHours / 24);
  if (deltaDays === 1) {
    return "Yesterday";
  }

  return `${deltaDays} days ago`;
}

function toHistoryRow(item: SubmissionListItemResponse): HistoryRow {
  const title = item.sourceType === "TEXT"
    ? `Text submission - ${item.wordCount} words`
    : `${item.sourceType} upload - ${item.wordCount} words`;

  if (item.status === "PENDING" || item.status === "PROCESSING") {
    return {
      title,
      score: 50,
      time: formatRelativeTime(item.submittedAt),
      status: "mixed",
    };
  }

  if (item.status === "ERROR") {
    return {
      title,
      score: 0,
      time: formatRelativeTime(item.submittedAt),
      status: "mixed",
    };
  }

  const confidence = item.globalConfidence ?? 0;
  const roundedScore = Math.max(0, Math.min(100, Math.round(confidence * 100)));

  return {
    title,
    score: roundedScore,
    time: formatRelativeTime(item.submittedAt),
    status: item.globalLabel === "human" ? "human" : "ai",
  };
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const W = 68;
  const H = 28;
  const points = data
    .map((d, i) => `${(i / (data.length - 1)) * W},${H - ((d - min) / range) * (H - 4) - 2}`)
    .join(" ");

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
      <defs>
        <linearGradient id={`sg-${color.replace("#", "")}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="1" />
        </linearGradient>
      </defs>
      <polyline points={points} fill="none" stroke={`url(#sg-${color.replace("#", "")})`}
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface SidebarProps { variant?: "guest" | "auth"; }

export function Sidebar({ variant = "auth" }: SidebarProps) {
  const { isDark, token, isLoggedIn } = useApp();
  const navigate = useNavigate();
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [totalScans, setTotalScans] = useState<number | null>(null);

  useEffect(() => {
    if (variant !== "auth" || !isLoggedIn || !token) {
      return;
    }

    let cancelled = false;
    setHistoryLoading(true);

    void listSubmissionsRequest(token, 0, 5)
      .then((page) => {
        if (cancelled) {
          return;
        }

        setTotalScans(page.totalItems);
        setHistory(page.items.map(toHistoryRow));
      })
      .catch(() => {
        if (!cancelled) {
          setHistory([]);
          setTotalScans(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setHistoryLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [variant, isLoggedIn, token]);

  const glass: React.CSSProperties = {
    background: isDark ? "rgba(15,17,26,0.55)" : "rgba(255,255,255,0.65)",
    backdropFilter: isDark ? "blur(40px) saturate(1.4)" : "blur(40px) saturate(1.3)",
    WebkitBackdropFilter: isDark ? "blur(40px) saturate(1.4)" : "blur(40px) saturate(1.3)",
    border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(255,255,255,0.80)",
    boxShadow: isDark
      ? "0 8px 32px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.04)"
      : "0 8px 32px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)",
  };

  const textPrimary = isDark ? "text-[rgba(255,255,255,0.88)]" : "text-[#0F111A]";
  const textSecondary = isDark ? "text-[rgba(255,255,255,0.48)]" : "text-[#4B5563]";
  const textMuted = isDark ? "text-[rgba(255,255,255,0.25)]" : "text-[#9CA3AF]";
  const hoverRow = isDark ? "hover:bg-[rgba(255,255,255,0.03)]" : "hover:bg-[rgba(0,0,0,0.02)]";

  const getStatusBadge = (status: string, score: number) => {
    const configs: Record<string, { bg: string; color: string; border: string }> = {
      ai: {
        bg: "rgba(220,60,60,0.06)",
        color: isDark ? "rgba(252,165,165,0.75)" : "#B91C1C",
        border: "rgba(220,60,60,0.1)",
      },
      human: {
        bg: "rgba(20,184,166,0.06)",
        color: isDark ? "rgba(94,234,212,0.75)" : "#0F766E",
        border: "rgba(20,184,166,0.1)",
      },
      mixed: {
        bg: "rgba(245,158,11,0.06)",
        color: isDark ? "rgba(252,211,77,0.75)" : "#B45309",
        border: "rgba(245,158,11,0.1)",
      },
    };
    const c = configs[status] || configs.mixed;
    return (
      <span className="rounded-full px-2.5 py-0.5 text-[9px]"
        style={{ fontWeight: 700, background: c.bg, color: c.color, border: `1px solid ${c.border}`, letterSpacing: "0.03em" }}>
        {score}% AI
      </span>
    );
  };

  if (variant === "guest") {
    return (
      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl overflow-hidden"
          style={glass}
        >
          <div className="relative p-5 pb-6 overflow-hidden"
            style={{ background: "linear-gradient(135deg, rgba(79,70,229,0.15), rgba(99,102,241,0.08))" }}>
            <div className="absolute -top-6 -right-6 h-28 w-28 rounded-full bg-indigo-400/5 blur-2xl" />
            <div className="relative">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: "rgba(99,102,241,0.15)", backdropFilter: "blur(8px)" }}>
                <Lock className="h-4 w-4 text-indigo-300" />
              </div>
              <h3 className={`${textPrimary} mb-1`} style={{ fontSize: "14px", fontWeight: 600 }}>
                Unlock Full Access
              </h3>
              <p className={textSecondary} style={{ fontSize: "12px", lineHeight: 1.5 }}>
                Save unlimited scans, access advanced analytics, and view your full history.
              </p>
            </div>
          </div>

          <div className="p-4 space-y-2.5">
            {[
              { icon: Clock, text: "Unlimited scan history" },
              { icon: BarChart3, text: "Advanced analytics dashboard" },
              { icon: Zap, text: "Faster multi-model analysis" },
              { icon: Shield, text: "API access & webhooks" },
            ].map((b, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg"
                  style={{ background: "rgba(99,102,241,0.08)" }}>
                  <b.icon className="h-3.5 w-3.5 text-indigo-400" />
                </div>
                <span className={`text-[12px] ${textSecondary}`}>{b.text}</span>
              </div>
            ))}

            <button
              onClick={() => navigate("/login")}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[12px] text-white transition-all hover:opacity-95"
              style={{
                fontWeight: 500,
                background: "linear-gradient(135deg, #4F46E5, #6366F1)",
                boxShadow: "0 4px 20px rgba(99,102,241,0.25)",
              }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Log In to Save Scans
            </button>
            <button
              onClick={() => navigate("/login")}
              className={`flex w-full items-center justify-center gap-1 text-[11px] transition-all ${textMuted} hover:text-indigo-400`}
            >
              Create free account <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
        </motion.div>

        <div className="rounded-xl p-4" style={glass}>
          <div className={`text-[9px] uppercase tracking-widest mb-3 ${textMuted}`} style={{ fontWeight: 700, letterSpacing: "0.14em" }}>
            Free Plan Limits
          </div>
          <div className="space-y-2">
            {[
              { label: "Scans per day", value: "3" },
              { label: "Max file size", value: "10 MB" },
              { label: "History saved", value: "None" },
              { label: "Models", value: "Standard" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className={`text-[11px] ${textSecondary}`}>{item.label}</span>
                <span className={`text-[11px] ${textPrimary}`} style={{ fontWeight: 600 }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Auth sidebar
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {[
          {
            label: "Total Scans", value: totalScans == null ? "--" : totalScans.toLocaleString(), icon: BarChart3,
            color: "text-indigo-400", bg: "bg-indigo-500/8",
            sparkData: scanData, sparkColor: "#6366f1", trend: "+12%",
          },
          {
            label: "Accuracy", value: "98.7%", icon: TrendingUp,
            color: "text-emerald-400", bg: "bg-emerald-500/8",
            sparkData: accuracyData, sparkColor: "#34d399", trend: "+0.3%",
          },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-4" style={glass}>
            <div className={`mb-2.5 flex h-8 w-8 items-center justify-center rounded-lg ${s.bg} ${s.color}`}>
              <s.icon className="h-3.5 w-3.5" />
            </div>
            <p className={`text-[18px] ${s.color}`} style={{ fontWeight: 700 }}>{s.value}</p>
            <p className={`text-[9px] ${textMuted}`} style={{ fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {s.label}
            </p>
            <div className="mt-2.5 flex items-end justify-between">
              <Sparkline data={s.sparkData} color={s.sparkColor} />
              <span className="text-[9px] text-emerald-400" style={{ fontWeight: 600 }}>{s.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl p-4" style={glass}>
        <div className="mb-4 flex items-center justify-between">
          <div className={`flex items-center gap-1.5 text-[11px] ${textMuted}`}>
            <Clock className="h-3.5 w-3.5" />
            <span style={{ fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", fontSize: "9px" }}>Recent Scans</span>
          </div>
          <button className="flex items-center gap-0.5 text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors">
            View all <ArrowUpRight className="h-2.5 w-2.5" />
          </button>
        </div>
        <div className="space-y-0.5">
          {historyLoading && (
            <p className={`px-2.5 py-3 text-[10px] ${textMuted}`}>Loading submissions...</p>
          )}

          {!historyLoading && history.length === 0 && (
            <p className={`px-2.5 py-3 text-[10px] ${textMuted}`}>
              No submissions yet. Run your first scan to populate history.
            </p>
          )}

          {!historyLoading && history.length > 0 && history.map((h, i) => (
            <div key={i} className={`flex items-center justify-between rounded-lg px-2.5 py-2.5 cursor-pointer transition-all ${hoverRow}`}>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${isDark ? "bg-white/[0.03]" : "bg-slate-100/50"}`}>
                  <FileText className={`h-3.5 w-3.5 ${textMuted}`} />
                </div>
                <div className="min-w-0">
                  <p className={`truncate text-[11px] ${textSecondary}`} style={{ fontWeight: 500 }}>{h.title}</p>
                  <p className={`text-[9px] ${textMuted}`}>{h.time}</p>
                </div>
              </div>
              {getStatusBadge(h.status, h.score)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}