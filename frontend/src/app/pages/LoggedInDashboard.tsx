import { useEffect, useState } from "react";
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

export function LoggedInDashboard() {
    const { isLoggedIn, authLoading, token, refreshUser, user } = useApp();
    const navigate = useNavigate();
    const [results, setResults] = useState<ResultsData | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState<string | null>(null);

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

            setResults({
                ...detail.frontendPayload,
                submittedAt: detail.completedAt ?? detail.submittedAt,
            });
            void refreshUser().catch(() => { });
        } catch (error) {
            setAnalysisError(getErrorMessage(error, "Unable to analyze this content."));
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="veriai-academic-bg h-screen overflow-hidden text-[#121a2b]">
            <Header variant="dashboard" />



            <main className="h-[calc(100vh-72px)] overflow-hidden px-6 pt-[18px]">
                <div className="grid h-full min-h-0 items-stretch gap-5 xl:grid-cols-[minmax(0,0.63fr)_minmax(520px,0.37fr)]">
                    <section className="min-h-0 min-w-0">
                        <InputPanel
                            onAnalyze={handleAnalyze}
                            isAnalyzing={isAnalyzing}
                            errorMessage={analysisError}
                            userPlan={user?.plan}
                        />
                    </section>

                    <section className="min-h-0 min-w-0">
                        <ResultsPanel data={results} isAnalyzing={isAnalyzing} />
                    </section>
                </div>
            </main>


        </div>
    );
}
