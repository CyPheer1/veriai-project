import { useState, useEffect } from "react";
import { ShieldCheck, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Header } from "../components/Header";
import { AnalyzePayload, InputPanel } from "../components/InputPanel";
import { ResultsData, ResultsPanel } from "../components/ResultsPanel";
import { Sidebar } from "../components/Sidebar";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router";
import {
  getErrorMessage,
  pollSubmissionResult,
  submitFileRequest,
  submitTextRequest,
} from "../services/api";

export function LoggedInDashboard() {
  const { isDark, user, isLoggedIn, authLoading, token, refreshUser } = useApp();
  const navigate = useNavigate();
  const [results, setResults] = useState<ResultsData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn && !authLoading) {
      navigate("/");
    }
  }, [isLoggedIn, authLoading, navigate]);

  const textPrimary = isDark ? "text-[rgba(255,255,255,0.92)]" : "text-[#0F111A]";
  const textMuted = isDark ? "text-[rgba(255,255,255,0.32)]" : "text-[#6B7280]";
  const badgeBg = isDark
    ? "border-[rgba(99,102,241,0.18)] bg-[rgba(99,102,241,0.06)] text-[rgba(165,180,252,0.8)]"
    : "border-[rgba(99,102,241,0.12)] bg-[rgba(99,102,241,0.05)] text-[#4338CA]";

  const welcomeGlass: React.CSSProperties = {
    background: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.5)",
    backdropFilter: "blur(40px)",
    border: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.05)",
    boxShadow: isDark
      ? "0 8px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03)"
      : "0 8px 40px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.7)",
  };

  const handleAnalyze = async (payload: AnalyzePayload) => {
    if (!token) {
      navigate("/login");
      return;
    }

    setIsAnalyzing(true);
    setResults(null);
    setAnalysisError(null);

    try {
      const accepted = payload.mode === "text"
        ? await submitTextRequest(token, payload.text)
        : await submitFileRequest(token, payload.file);

      const detail = await pollSubmissionResult(token, accepted.submissionId);

      if (detail.status === "ERROR") {
        throw new Error(detail.errorMessage ?? "Analysis failed in processing pipeline.");
      }

      if (!detail.frontendPayload) {
        throw new Error("Backend did not return the expected frontend payload.");
      }

      setResults(detail.frontendPayload);
      void refreshUser().catch(() => {});
    } catch (error) {
      setAnalysisError(getErrorMessage(error, "Unable to analyze this content."));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const plan = user?.plan ?? "FREE";
  const usageLabel = plan === "FREE"
    ? `${user?.dailySubmissionCount ?? 0}/3 scans used today`
    : "Unlimited scans";

  return (
    <div>
      <Header variant="auth" />

      <main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex-1 min-w-0 space-y-6">
            <AnimatePresence>
              {!results && !isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {/* Welcome strip */}
                  <div className="flex items-center justify-between rounded-2xl px-4 py-3" style={welcomeGlass}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg text-[11px] text-white"
                        style={{ fontWeight: 600, background: "linear-gradient(135deg, #4F46E5, #6366F1)" }}>
                        {user?.initials || "JD"}
                      </div>
                      <div>
                        <span className={`text-[12px] ${textPrimary}`} style={{ fontWeight: 500 }}>
                          Welcome back, {user?.name?.split(" ")[0] || "User"}
                        </span>
                        <p className={`text-[10px] ${textMuted}`}>{plan} Plan  ·  {usageLabel}</p>
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px]"
                      style={{
                        background: "rgba(20,184,166,0.06)",
                        border: "1px solid rgba(20,184,166,0.1)",
                        color: isDark ? "rgba(94,234,212,0.7)" : "#0F766E",
                        fontWeight: 500,
                      }}>
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      All systems operational
                    </div>
                  </div>

                  <div className="text-center lg:text-left">
                    <div className={`mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] ${badgeBg}`}
                      style={{ fontWeight: 500 }}>
                      <ShieldCheck className="h-3 w-3" />
                      Enterprise-grade AI detection · Powered by 6 models
                    </div>
                    <h1 className={`mb-2 tracking-tight ${textPrimary}`}
                      style={{ fontSize: "30px", fontWeight: 700, lineHeight: 1.2, letterSpacing: "-0.5px" }}>
                      Detect AI-Generated Content
                    </h1>
                    <p className={`text-[13px] max-w-xl ${textMuted}`} style={{ lineHeight: "1.7" }}>
                      Paste text or upload a document to instantly analyze whether content was written by a human or generated by AI.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <InputPanel onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} errorMessage={analysisError} />

            <AnimatePresence>
              {isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-16"
                >
                  <div className="relative mb-5">
                    <div className="h-16 w-16 rounded-2xl flex items-center justify-center"
                      style={{ background: "rgba(99,102,241,0.08)" }}>
                      <Sparkles className="h-7 w-7 text-indigo-400 animate-pulse" />
                    </div>
                    <div className="absolute inset-0 h-16 w-16 animate-ping rounded-2xl"
                      style={{ background: "rgba(99,102,241,0.04)" }} />
                  </div>
                  <p className={`text-[13px] ${textMuted}`}>Analyzing content patterns...</p>
                  <p className={`text-[10px] mt-1 ${isDark ? "text-white/15" : "text-slate-400"}`}>
                    Running 6-model detection pipeline
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {results && <ResultsPanel data={results} />}
          </div>

          <div className="w-full lg:w-[310px] shrink-0">
            <Sidebar variant="auth" />
          </div>
        </div>
      </main>
    </div>
  );
}
