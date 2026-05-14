import { useEffect, useRef, useState } from "react";
import { FileTextIcon, PlusIcon } from "@radix-ui/react-icons";
import {
  patchSubmissionTitleRequest,
  extractFileTextRequest,
} from "../services/api";
import { useNavigate } from "react-router";
import { Header } from "../components/Header";
import { AnalyzePayload, InputPanel } from "../components/InputPanel";
import { ResultsData, ResultsPanel } from "../components/ResultsPanel";
import { useApp } from "../context/AppContext";
import {
  getErrorMessage,
  getSubmissionRequest,
  listSubmissionsRequest,
  pollSubmissionResult,
  submitFileRequest,
  submitTextRequest,
} from "../services/api";

interface ScanHistoryItem {
  id: string;
  title: string;
  score: number;
  model: string;
  timestamp: string;
  results: ResultsData | null;
}

function formatRelativeTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatHeaderDate(value?: string | null): string {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return "Today";

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function scanUsageLabel(user: ReturnType<typeof useApp>["user"]): string {
  if (!user || user.plan.toUpperCase() === "PRO") {
    return "Unlimited credits";
  }

  const remaining = user.dailyCreditsRemaining ?? 0;
  const limit = user.dailyCreditLimit ?? 3000;
  return `${remaining.toLocaleString()} / ${limit.toLocaleString()} credits`;
}

function normalizeScanTitle(value: string): string {
  const trimmed = value.trim();
  return trimmed || "Untitled scan";
}

function ScanDock({
  history,
  activeId,
  onNewScan,
  onRestore,
  onHistory,
  mobileOpen = false,
  onMobileClose,
}: {
  history: ScanHistoryItem[];
  activeId: string | null;
  onNewScan: () => void;
  onRestore: (item: ScanHistoryItem) => void;
  onHistory: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex min-h-0 w-[260px] shrink-0 flex-col border-r border-[#d8e2ee] bg-[#f6f9fd] px-3 py-3 shadow-[8px_0_34px_-32px_rgba(31,45,71,0.45)] transition-transform duration-300 ease-out md:relative md:inset-auto md:z-auto md:w-[220px] md:translate-x-0 md:transition-none ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
    >
      {/* Logo row */}
      <div className="flex items-center justify-between py-2">
        <div
          className="hidden h-10 w-10 items-center justify-center md:flex"
          title="veri4i"
        >
          <img
            src="/assets/veri4i-sidebar-mark.png"
            alt="veri4i"
            className="h-10 w-10 object-contain"
            draggable={false}
          />
        </div>
        <span className="pl-1 text-[13px] font-semibold text-[#274169] md:hidden">
          Scans
        </span>
        <button
          type="button"
          onClick={onMobileClose}
          aria-label="Close sidebar"
          className="flex h-8 w-8 items-center justify-center rounded-[8px] text-[#52627a] hover:bg-[#eef3f9] md:hidden"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M1 1l12 12M13 1L1 13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* New Scan button */}
      <button
        type="button"
        onClick={onNewScan}
        className="veriai-pressable mt-2 flex w-full items-center justify-center gap-2 rounded-[9px] bg-[#1263F1] px-4 py-2 text-[13px] font-semibold text-white shadow-[0_10px_20px_-14px_rgba(18,99,241,0.9)] hover:bg-[#0d54d5]"
        aria-label="Start a new scan"
      >
        <PlusIcon className="h-4 w-4" />
        New scan
      </button>

      <div className="my-3 h-px w-full bg-[#dbe4f1]" />

      {/* Recent scans list */}
      <div className="veriai-hide-scrollbar flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
        {history.length ? (
          <>
            <p className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-wide text-[#9aacbf]">
              Recent scans
            </p>
            {history.map((item) => {
              const isActive = activeId === item.id;
              const tone =
                item.score >= 65 ? "ai" : item.score <= 35 ? "human" : "mixed";
              const pillStyle =
                tone === "ai"
                  ? "bg-[#fff0f0] text-[#b32635] border border-[#fca5a5]/40"
                  : tone === "human"
                    ? "bg-[#f0fdf4] text-[#17633f] border border-[#86efac]/40"
                    : "bg-[#fffbeb] text-[#8a5200] border border-[#fcd34d]/40";
              const pillLabel =
                tone === "ai" ? "AI" : tone === "human" ? "Human" : "Mixed";
              const displayScore =
                tone === "human" ? 100 - item.score : item.score;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onRestore(item)}
                  className={`flex w-full flex-col gap-0.5 rounded-[10px] px-2.5 py-2 text-left transition-colors ${
                    isActive ? "bg-[#edf4ff]" : "hover:bg-[#eef3f9]"
                  }`}
                  aria-label={`Restore scan: ${item.title}, ${displayScore}% ${pillLabel}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`truncate text-[12px] leading-tight ${
                        isActive
                          ? "font-semibold text-[#1263F1]"
                          : "font-medium text-[#0d1526]"
                      }`}
                    >
                      {item.title}
                    </span>
                    <span
                      className={`shrink-0 rounded-[5px] px-1.5 py-0.5 text-[10px] font-semibold ${pillStyle}`}
                    >
                      {displayScore}% {pillLabel}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#7185a3]">
                    {formatRelativeTime(item.timestamp)}
                  </span>
                </button>
              );
            })}
          </>
        ) : (
          <p className="px-1 pt-1 text-[11px] text-[#9aacbf]">
            No scans yet. Paste text and click Analyze.
          </p>
        )}
      </div>

      {/* View all */}
      <button
        type="button"
        onClick={onHistory}
        disabled={!history.length}
        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-[8px] py-1.5 text-[11px] font-semibold text-[#7185a3] transition-colors hover:bg-[#eef3f9] hover:text-[#1263F1] disabled:cursor-default disabled:opacity-40"
      >
        <FileTextIcon className="h-3.5 w-3.5" />
        View all scans
      </button>
    </aside>
  );
}

export function LoggedInDashboard() {
  const { isLoggedIn, authLoading, token, refreshUser, user, upgradeToPro } =
    useApp();
  const navigate = useNavigate();
  const [results, setResults] = useState<ResultsData | null>(null);

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn, authLoading, navigate]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
  const historyLoadedRef = useRef(false);
  const [activeScanId, setActiveScanId] = useState<string | null>(null);
  const [inputResetKey, setInputResetKey] = useState(0);
  const [documentTitle, setDocumentTitle] = useState("Untitled scan");
  const [hasDraftChanges, setHasDraftChanges] = useState(false);
  const [showHighlights, setShowHighlights] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const headerTitle = documentTitle;
  const headerStatus = analysisError
    ? "Failed"
    : isAnalyzing
      ? "Analyzing"
      : results && !hasDraftChanges
        ? "Saved"
        : "Draft";

  // Load recent scans from backend on first mount
  useEffect(() => {
    if (!token || historyLoadedRef.current) return;
    historyLoadedRef.current = true;
    listSubmissionsRequest(token, 0, 20)
      .then((page) => {
        const items: ScanHistoryItem[] = page.items
          .filter((item) => item.status === "COMPLETED")
          .map((item) => ({
            id: item.submissionId,
            title: item.customTitle || `Scan · ${item.wordCount} words`,
            score: Math.round((item.globalConfidence ?? 0) * 100),
            model: item.globalLabel ?? "",
            timestamp: item.completedAt ?? item.submittedAt,
            results: null,
          }));
        setScanHistory((prev) => {
          // merge: keep in-session items, append backend items not already present
          const existingIds = new Set(prev.map((h) => h.id));
          const fresh = items.filter((i) => !existingIds.has(i.id));
          return [...prev, ...fresh].slice(0, 20);
        });
      })
      .catch(() => {});
  }, [token]);

  const handleNewScan = () => {
    setResults(null);
    setAnalysisError(null);
    setActiveScanId(null);
    setDocumentTitle("Untitled scan");
    setHasDraftChanges(false);
    setShowHighlights(false);
    setInputResetKey((value) => value + 1);
  };

  const restoreScan = async (item: ScanHistoryItem) => {
    setAnalysisError(null);
    setActiveScanId(item.id);
    setDocumentTitle(item.title);
    setHasDraftChanges(false);
    setShowHighlights(false);

    if (item.results) {
      setResults(item.results);
      setShowHighlights(true);
      return;
    }

    if (!token) return;
    setIsAnalyzing(true);
    try {
      const detail = await getSubmissionRequest(token, item.id);
      if (detail.frontendPayload) {
        const nextResults: ResultsData = {
          ...detail.frontendPayload,
          submittedAt: detail.completedAt ?? detail.submittedAt,
        };
        setResults(nextResults);
        setShowHighlights(true);
        setHasDraftChanges(false);
        setScanHistory((prev) =>
          prev.map((h) =>
            h.id === item.id ? { ...h, results: nextResults } : h,
          ),
        );
      }
    } catch {
      setAnalysisError("Could not load this scan.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTitleChange = (title: string) => {
    setDocumentTitle(title);
  };

  const handleExtractFile = async (file: File): Promise<string> => {
    if (!token) throw new Error("Not authenticated");
    const result = await extractFileTextRequest(token, file);
    return result.text;
  };

  const handleTitleBlur = () => {
    if (!activeScanId || !token) return;
    const title = normalizeScanTitle(documentTitle);
    setDocumentTitle(title);
    void patchSubmissionTitleRequest(token, activeScanId, title).catch(
      () => {},
    );
  };

  const handleDraftChange = () => {
    setAnalysisError(null);
    setHasDraftChanges(true);
  };

  const handleAnalyze = async (payload: AnalyzePayload) => {
    if (!token) {
      navigate("/login");
      return;
    }

    setResults(null);
    setShowHighlights(false);
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const accepted =
        payload.mode === "text"
          ? await submitTextRequest(token, payload.text)
          : await submitFileRequest(token, payload.file);

      void refreshUser().catch(() => {});

      const detail = await pollSubmissionResult(token, accepted.submissionId);

      if (detail.status === "ERROR") {
        throw new Error(
          detail.errorMessage ?? "Analysis failed in processing pipeline.",
        );
      }

      if (!detail.frontendPayload) {
        throw new Error(
          "Backend did not return the expected frontend payload.",
        );
      }

      const nextResults: ResultsData = {
        ...detail.frontendPayload,
        submittedAt: detail.completedAt ?? detail.submittedAt,
      };
      const scanTitle = normalizeScanTitle(documentTitle);
      void patchSubmissionTitleRequest(
        token,
        accepted.submissionId,
        scanTitle,
      ).catch(() => {});
      const historyItem: ScanHistoryItem = {
        id: accepted.submissionId,
        title: scanTitle,
        score: Math.round(nextResults.aiScore),
        model: nextResults.model,
        timestamp:
          detail.completedAt ?? detail.submittedAt ?? new Date().toISOString(),
        results: nextResults,
      };

      setResults(nextResults);
      setShowHighlights(true);
      setActiveScanId(historyItem.id);
      setDocumentTitle(historyItem.title);
      setHasDraftChanges(false);
      setScanHistory((items) =>
        [
          historyItem,
          ...items.filter((item) => item.id !== historyItem.id),
        ].slice(0, 20),
      );
      void refreshUser().catch(() => {});
    } catch (error) {
      setAnalysisError(
        getErrorMessage(error, "Unable to analyze this content."),
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    setAnalysisError(null);
    try {
      await upgradeToPro();
    } catch (error) {
      setAnalysisError(getErrorMessage(error, "Unable to upgrade account."));
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <div className="veriai-academic-bg h-screen overflow-hidden text-[#121a2b]">
      <div className="grid h-screen min-h-0 grid-cols-1 overflow-hidden md:grid-cols-[220px_1fr]">
        {/* Mobile backdrop */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/40 md:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}
        <ScanDock
          history={scanHistory}
          activeId={activeScanId}
          onNewScan={handleNewScan}
          onRestore={restoreScan}
          onHistory={() => navigate("/history")}
          mobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />

        <div className="flex min-w-0 flex-col overflow-hidden">
          <Header
            variant="dashboard"
            contextTitle={headerTitle}
            onContextTitleChange={handleTitleChange}
            onContextTitleBlur={handleTitleBlur}
            contextDetail={formatHeaderDate(
              hasDraftChanges ? null : results?.submittedAt,
            )}
            contextStatus={headerStatus}
            usageLabel={scanUsageLabel(user)}
          />

          {/* Mobile-only: hamburger to open sidebar */}
          <div className="flex shrink-0 items-center gap-3 border-b border-[#d8e2ee] bg-[#f6f9fd] px-4 py-2 md:hidden">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] text-[#274169] hover:bg-[#e4ecf7]"
              aria-label="Open scan history"
            >
              <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
                <rect width="18" height="2" rx="1" fill="currentColor" />
                <rect y="6" width="18" height="2" rx="1" fill="currentColor" />
                <rect y="12" width="18" height="2" rx="1" fill="currentColor" />
              </svg>
            </button>
            <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-[#274169]">
              {activeScanId ? "Scan history" : "New scan"}
            </span>
          </div>

          <main className="overflow-y-auto px-3 pb-6 pt-3 md:h-[calc(100vh-72px)] md:overflow-hidden md:px-6 md:pb-0 md:pt-[18px]">
            <div className="flex min-h-0 flex-col gap-4 md:h-full md:flex-row md:gap-0">
              <section className="flex w-full flex-col gap-4 md:grid md:min-h-0 md:min-w-0 md:flex-1 md:items-stretch md:gap-5 xl:grid-cols-[minmax(0,0.63fr)_minmax(520px,0.37fr)]">
                <div className="h-[62vh] min-h-[380px] md:h-auto md:min-h-0 md:min-w-0">
                  <InputPanel
                    onAnalyze={handleAnalyze}
                    onDraftChange={handleDraftChange}
                    documentTitle={documentTitle}
                    isAnalyzing={isAnalyzing}
                    errorMessage={analysisError}
                    userPlan={user?.plan}
                    dailyCreditsRemaining={user?.dailyCreditsRemaining}
                    textWordLimit={user?.textWordLimit}
                    premiumMonthlyPriceUsd={user?.premiumMonthlyPriceUsd}
                    onUpgrade={handleUpgrade}
                    isUpgrading={isUpgrading}
                    resetKey={inputResetKey}
                    highlightSegments={
                      showHighlights && !!results && !isAnalyzing
                        ? (results?.segments ?? [])
                        : undefined
                    }
                    onExitHighlight={() => setShowHighlights(false)}
                    onExtractFile={
                      user?.plan?.toUpperCase() === "PRO"
                        ? handleExtractFile
                        : undefined
                    }
                    restoreText={
                      showHighlights &&
                      !!results &&
                      !isAnalyzing &&
                      (results?.segments?.length ?? 0) === 0 &&
                      results?.submittedText
                        ? results.submittedText
                        : null
                    }
                  />
                </div>

                <div className="min-h-[260px] md:min-h-0 md:min-w-0">
                  <ResultsPanel
                    data={results}
                    isAnalyzing={isAnalyzing}
                    onUpgrade={handleUpgrade}
                    isUpgrading={isUpgrading}
                  />
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
