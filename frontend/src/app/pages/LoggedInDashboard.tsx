import { useEffect, useState } from "react";
import {
    ClockIcon,
    FileTextIcon,
    PlusIcon,
} from "@radix-ui/react-icons";
import { useNavigate } from "react-router";
import { Header } from "../components/Header";
import { AnalyzePayload, InputPanel } from "../components/InputPanel";
import { ResultsData, ResultsPanel } from "../components/ResultsPanel";
import { useApp } from "../context/AppContext";
import {
    getErrorMessage,
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
    results: ResultsData;
}

function ScanDock({
    history,
    activeId,
    onNewScan,
    onRestore,
    onHistory,
}: {
    history: ScanHistoryItem[];
    activeId: string | null;
    onNewScan: () => void;
    onRestore: (item: ScanHistoryItem) => void;
    onHistory: () => void;
}) {
    return (

        <aside className="flex min-h-0 w-20 shrink-0 flex-col items-center border-r border-[#d8e2ee] bg-[#f6f9fd] px-3 py-3 shadow-[8px_0_34px_-32px_rgba(31,45,71,0.45)]">
            <div className="flex h-14 w-14 items-center justify-center" title="veri4i">
                <img src="/assets/veri4i-sidebar-mark.png" alt="veri4i" className="h-14 w-14 object-contain" draggable={false} />
            </div>

            <div className="mt-6 flex w-full flex-col items-center gap-2">
                <button
                    type="button"
                    onClick={onNewScan}
                    className="veriai-pressable flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#1263F1] text-white shadow-[0_14px_26px_-20px_rgba(18,99,241,0.95)] hover:bg-[#0d54d5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
                    aria-label="Start a new scan"
                    title="New scan"
                >
                    <PlusIcon className="h-[18px] w-[18px]" />
                </button>
            </div>

            <div className="my-3 h-px w-9 bg-[#dbe4f1]" />

            <div className="flex w-full flex-col items-center gap-2">
                <button
                    type="button"
                    onClick={onHistory}
                    className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#c8daf2] bg-[#edf4ff] text-[#1263F1] shadow-[0_10px_22px_-22px_rgba(18,99,241,0.75)] transition-colors hover:bg-[#e5efff]"
                    aria-label="Scan history"
                    title="Scan history"
                >
                    <ClockIcon className="h-[18px] w-[18px]" />
                </button>
            </div>

            <div className="mt-2 flex min-h-0 w-full flex-1 flex-col items-center gap-2 overflow-y-auto">
                {history.length ? history.slice(0, 6).map((item, index) => {
                    const isActive = activeId === item.id;
                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => onRestore(item)}
                            className={`flex h-9 w-9 items-center justify-center rounded-[10px] border text-[11px] font-black transition-colors ${
                                isActive ? "border-[#c8daf2] bg-[#edf4ff] text-[#1263F1]" : "border-transparent text-[#52627a] hover:border-[#dbe4f1] hover:bg-white"
                            }`}
                            aria-label={`Restore scan ${item.title}`}
                            title={`${item.title}, ${item.score}%`}
                        >
                            {index + 1}
                        </button>
                    );
                }) : null}
            </div>

            <button
                type="button"
                onClick={() => history[0] && onRestore(history[0])}
                disabled={!history.length}
                className="mt-3 flex h-9 w-9 items-center justify-center rounded-[10px] border border-transparent text-[#7185a3] transition-colors hover:border-[#dbe4f1] hover:bg-white disabled:cursor-default disabled:text-[#9aacbf] disabled:hover:border-transparent disabled:hover:bg-transparent"
                aria-label={history.length ? "Restore latest scan" : "Recent scans, no scans yet"}
                title={history.length ? "Restore latest scan" : "Recent scans, no scans yet"}
            >
                <FileTextIcon className="h-[18px] w-[18px]" />
            </button>
        </aside>

    );
}

export function LoggedInDashboard() {
    const { isLoggedIn, authLoading, token, refreshUser, user } = useApp();
    const navigate = useNavigate();
    const [results, setResults] = useState<ResultsData | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState<string | null>(null);
    const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
    const [activeScanId, setActiveScanId] = useState<string | null>(null);
    const [inputResetKey, setInputResetKey] = useState(0);

    const handleNewScan = () => {
        setResults(null);
        setAnalysisError(null);
        setActiveScanId(null);
        setInputResetKey((value) => value + 1);
    };

    const restoreScan = (item: ScanHistoryItem) => {
        setResults(item.results);
        setAnalysisError(null);
        setActiveScanId(item.id);
    };

    const handleAnalyze = async (payload: AnalyzePayload) => {
        if (!token) {
            navigate("/login");
            return;
        }

        setIsAnalyzing(true);
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

            const nextResults: ResultsData = {
                ...detail.frontendPayload,
                submittedAt: detail.completedAt ?? detail.submittedAt,
            };
            const historyItem: ScanHistoryItem = {
                id: accepted.submissionId,
                title: nextResults.label || "Analysis",
                score: Math.round(nextResults.aiScore),
                model: nextResults.model,
                timestamp: detail.completedAt ?? detail.submittedAt ?? new Date().toISOString(),
                results: nextResults,
            };

            setResults(nextResults);
            setActiveScanId(historyItem.id);
            setScanHistory((items) => [historyItem, ...items.filter((item) => item.id !== historyItem.id)].slice(0, 8));
            void refreshUser().catch(() => { });
        } catch (error) {
            setAnalysisError(getErrorMessage(error, "Unable to analyze this content."));
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="veriai-academic-bg h-screen overflow-hidden text-[#121a2b]">
            <div className="grid h-screen min-h-0 grid-cols-[80px_1fr] overflow-hidden">
                    <ScanDock
                        history={scanHistory}
                        activeId={activeScanId}
                        onNewScan={handleNewScan}
                        onRestore={restoreScan}
                        onHistory={() => navigate("/history")}
                    />

                <div className="min-w-0 overflow-hidden">
                    <Header variant="dashboard" />

                    <main className="h-[calc(100vh-72px)] overflow-hidden px-6 pt-[18px]">
                        <div className="flex h-full min-h-0">
                            <section className="grid min-h-0 min-w-0 flex-1 items-stretch gap-5 xl:grid-cols-[minmax(0,0.63fr)_minmax(520px,0.37fr)]">
                                <div className="min-h-0 min-w-0">
                                    <InputPanel
                                        onAnalyze={handleAnalyze}
                                        isAnalyzing={isAnalyzing}
                                        errorMessage={analysisError}
                                        userPlan={user?.plan}
                                        resetKey={inputResetKey}
                                    />
                                </div>

                                <div className="min-h-0 min-w-0">
                                    <ResultsPanel data={results} isAnalyzing={isAnalyzing} />
                                </div>
                            </section>
                        </div>
                    </main>
                </div>
            </div>


        </div>
    );
}
