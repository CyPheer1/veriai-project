import { useEffect, useMemo, useState } from "react";
import { ClockIcon, FileTextIcon } from "@radix-ui/react-icons";
import { useNavigate } from "react-router";
import { Header } from "../components/Header";
import { ResultsPanel, ResultsData } from "../components/ResultsPanel";
import { useApp } from "../context/AppContext";
import {
  getErrorMessage,
  getSubmissionRequest,
  listSubmissionsRequest,
  SubmissionDetailResponse,
  SubmissionListItemResponse,
} from "../services/api";

function formatDate(value: string | null | undefined): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function statusLabel(status: string): string {
  switch (status) {
    case "PENDING":
      return "Queued";
    case "PROCESSING":
      return "Processing";
    case "COMPLETED":
      return "Completed";
    case "ERROR":
      return "Failed";
    default:
      return status;
  }
}

function toResults(detail: SubmissionDetailResponse): ResultsData | null {
  if (!detail.frontendPayload) return null;
  return {
    ...detail.frontendPayload,
    submittedAt: detail.completedAt ?? detail.submittedAt,
  };
}

export function ScanHistoryPage() {
  const { token, isLoggedIn, user, upgradeToPro } = useApp();
  const navigate = useNavigate();
  const [items, setItems] = useState<SubmissionListItemResponse[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<SubmissionDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUpgrading, setIsUpgrading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    if (!token) return;
    setIsLoading(true);
    setError(null);

    listSubmissionsRequest(token)
      .then((response) => {
        setItems(response.items);
        if (response.items.length > 0) {
          setSelectedId(response.items[0].submissionId);
        }
      })
      .catch((err) => setError(getErrorMessage(err, "Unable to load scan history.")))
      .finally(() => setIsLoading(false));
  }, [token]);

  useEffect(() => {
    if (!token || !selectedId) {
      setSelectedDetail(null);
      return;
    }

    setDetailLoading(true);
    getSubmissionRequest(token, selectedId)
      .then((detail) => setSelectedDetail(detail))
      .catch((err) => setError(getErrorMessage(err, "Unable to load scan details.")))
      .finally(() => setDetailLoading(false));
  }, [token, selectedId]);

  const results = useMemo(() => (selectedDetail ? toResults(selectedDetail) : null), [selectedDetail]);
  const usageLabel =
    user?.plan?.toUpperCase() === "PRO"
      ? "Unlimited credits"
      : `${(user?.dailyCreditsRemaining ?? 0).toLocaleString()} / ${(user?.dailyCreditLimit ?? 3000).toLocaleString()} credits`;

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    setError(null);
    try {
      await upgradeToPro();
    } catch (err) {
      setError(getErrorMessage(err, "Unable to upgrade account."));
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <div className="veriai-academic-bg min-h-screen text-[#121a2b]">
      <Header
        variant="dashboard"
        contextTitle="Scan history"
        contextDetail={`${items.length} ${items.length === 1 ? "submission" : "submissions"}`}
        contextStatus={error ? "Failed" : isLoading ? "Loading" : "Ready"}
        usageLabel={usageLabel}
      />
      <main className="mx-auto max-w-[1320px] px-5 pb-14 pt-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#64748b]">Scan history</p>
            <h1 className="veriai-display-font mt-2 text-[34px] font-semibold tracking-[-0.03em] text-[#0d1526]">
              Review past submissions.
            </h1>
          </div>
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="veriai-pressable h-11 rounded-[10px] bg-[#1263F1] px-5 text-[14px] font-semibold text-white shadow-[0_14px_28px_-18px_rgba(18,99,241,0.95)] hover:bg-[#0d54d5]"
          >
            Start new scan
          </button>
        </div>

        {error && (
          <p className="mt-6 rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-700">
            {error}
          </p>
        )}

        <section className="mt-8 grid gap-6 lg:grid-cols-[360px_1fr]">
          <div className="veriai-card-surface rounded-[16px] p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-semibold text-[#0d1526]">Recent scans</h2>
              <span className="text-[12px] font-semibold text-[#64748b]">{items.length}</span>
            </div>

            {isLoading ? (
              <p className="mt-5 text-[13px] text-[#52627a]">Loading history…</p>
            ) : items.length === 0 ? (
              <div className="mt-6 rounded-[12px] border border-dashed border-[#cbd7ea] bg-white/75 p-5 text-center text-[13px] text-[#52627a]">
                No scans yet. Start a new scan to populate this list.
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {items.map((item) => {
                  const isActive = selectedId === item.submissionId;
                  return (
                    <button
                      key={item.submissionId}
                      type="button"
                      onClick={() => setSelectedId(item.submissionId)}
                      className={`w-full rounded-[12px] border px-4 py-3 text-left transition-colors ${
                        isActive
                          ? "border-[#1263F1] bg-[#edf4ff]"
                          : "border-[#d7dfed] bg-white/80 hover:bg-[#f8fbff]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[14px] font-semibold text-[#0d1526]">{item.globalLabel ?? "Pending review"}</p>
                          <p className="mt-1 text-[12px] text-[#52627a]">{formatDate(item.submittedAt)}</p>
                        </div>
                        <span className="veriai-mono text-[12px] font-semibold text-[#1263F1]">
                          {item.globalConfidence != null ? `${Math.round(item.globalConfidence)}%` : statusLabel(item.status)}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-[11px] font-semibold text-[#64748b]">
                        <ClockIcon className="h-3.5 w-3.5" />
                        {statusLabel(item.status)}
                        <span className="text-[#cbd5e1]">•</span>
                        <FileTextIcon className="h-3.5 w-3.5" />
                        {item.wordCount} words
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="min-h-[520px]">
            {detailLoading && !selectedDetail ? (
              <div className="veriai-card-surface rounded-[16px] p-6 text-[13px] text-[#52627a]">Loading scan details…</div>
            ) : selectedDetail ? (
              <div className="space-y-5">
                <div className="veriai-card-surface rounded-[16px] p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#64748b]">Submission details</p>
                      <h2 className="mt-2 text-[20px] font-semibold text-[#0d1526]">{selectedDetail.sourceFilename ?? "Text submission"}</h2>
                    </div>
                    <span className="rounded-full bg-[#eef3f9] px-3 py-1 text-[11px] font-semibold text-[#274169]">
                      {statusLabel(selectedDetail.status)}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-3 text-[13px] text-[#52627a] sm:grid-cols-3">
                    <div>
                      <span className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#94a3b8]">Source</span>
                      <span className="mt-1 block font-semibold text-[#0d1526]">{selectedDetail.sourceType}</span>
                    </div>
                    <div>
                      <span className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#94a3b8]">Submitted</span>
                      <span className="mt-1 block font-semibold text-[#0d1526]">{formatDate(selectedDetail.submittedAt)}</span>
                    </div>
                    <div>
                      <span className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#94a3b8]">Word count</span>
                      <span className="mt-1 block font-semibold text-[#0d1526]">{selectedDetail.wordCount}</span>
                    </div>
                  </div>
                </div>

                {results ? (
                  <ResultsPanel
                    data={results}
                    isAnalyzing={selectedDetail.status === "PROCESSING"}
                    onUpgrade={handleUpgrade}
                    isUpgrading={isUpgrading}
                  />
                ) : (
                  <div className="veriai-card-surface rounded-[16px] p-6 text-[13px] text-[#52627a]">
                    {selectedDetail.status === "ERROR"
                      ? selectedDetail.errorMessage ?? "This scan failed during processing."
                      : "Results are not ready yet. Check back in a moment."}
                  </div>
                )}
              </div>
            ) : (
              <div className="veriai-card-surface rounded-[16px] p-6 text-[13px] text-[#52627a]">
                Select a scan to see its details.
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
