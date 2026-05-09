import { useState } from "react";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { ModelLogo } from "./DesignIcons";

interface Segment {
  text: string;
  isAI: boolean;
}
interface ModelAttribution {
  name: string;
  score: number;
}

export interface ResultsData {
  aiScore: number;
  humanScore: number;
  confidence: number;
  label: string;
  model: string;
  submittedText?: string;
  wordCount?: number;
  submittedAt?: string;
  modelAttributions?: ModelAttribution[];
  segments?: Segment[];
  chunks: { text: string; score: number }[];
  stats: { analyzed: number; flagged: number; clean: number };
  fullReportAvailable?: boolean;
  accessLevel?: "FREE" | "PREMIUM";
}

const previewData: ResultsData = {
  aiScore: 92,
  humanScore: 8,
  confidence: 92,
  label: "Likely AI-generated",
  model: "GPT-4",
  wordCount: 1248,
  submittedAt: "2025-05-14T10:32:00",
  modelAttributions: [
    { name: "GPT-4", score: 93 },
    { name: "Claude 3", score: 89 },
    { name: "Gemini 1.5", score: 91 },
    { name: "Llama 3", score: 86 },
  ],
  chunks: [
    { text: "RoBERTa Classifier", score: 60 },
    { text: "Stylistic Analysis", score: 20 },
    { text: "Statistical Analysis", score: 20 },
  ],
  stats: { analyzed: 36, flagged: 18, clean: 18 },
  segments: [],
  fullReportAvailable: true,
  accessLevel: "PREMIUM",
};

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function toneMeta(tone: "human" | "mixed" | "ai") {
  if (tone === "human") return { dot: "bg-[#2fa56d]", text: "text-[#17633f]" };
  if (tone === "mixed") return { dot: "bg-[#f6b52d]", text: "text-[#8a5200]" };
  return { dot: "bg-[#ef3a43]", text: "text-[#b32635]" };
}

function ScoreRing({ score }: { score: number }) {
  const normalized = clampScore(score);
  const angle = normalized * 3.6;

  return (
    <div
      className="relative flex h-[122px] w-[122px] shrink-0 items-center justify-center rounded-full"
      style={{
        background: `conic-gradient(#f7a51c 0deg ${angle}deg, #e8edf5 ${angle}deg 360deg)`,
      }}
      aria-label={`Confidence ${normalized}%`}
      role="img"
    >
      <div className="flex h-[94px] w-[94px] flex-col items-center justify-center rounded-full bg-white">
        <span className="text-[34px] font-bold leading-none tracking-[-0.045em] text-[#07112f]">
          {normalized}%
        </span>
      </div>
    </div>
  );
}

function MiniBars({ tone }: { tone: "human" | "mixed" | "ai" }) {
  const color =
    tone === "human"
      ? "bg-[#1263F1]"
      : tone === "mixed"
        ? "bg-[#1263F1]"
        : "bg-[#1263F1]";
  const heights = [
    12, 17, 21, 14, 28, 11, 9, 18, 13, 25, 15, 10, 20, 16, 12, 19, 14, 9, 17,
    13,
  ];

  return (
    <div className="mt-4 flex h-8 items-end gap-1">
      {heights.map((height, index) => (
        <span
          key={index}
          className={`${color} w-[3px] rounded-t-[2px]`}
          style={{ height: `${height}px`, opacity: 0.25 + (index % 5) * 0.14 }}
        />
      ))}
    </div>
  );
}

export function ResultsPanel({
  data,
  isAnalyzing = false,
  onUpgrade,
  isUpgrading = false,
}: {
  data?: ResultsData | null;
  isAnalyzing?: boolean;
  onUpgrade?: () => void;
  isUpgrading?: boolean;
}) {
  const [activeTab, setActiveTab] = useState<"analysis" | "report">("analysis");
  const [reportSections, setReportSections] = useState({
    verdict: true,
    models: true,
    highlights: true,
    layers: true,
    interpretation: true,
  });
  const [reportStep, setReportStep] = useState(0);

  if (!data && !isAnalyzing) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-[14px] border border-dashed border-[#d7dfed] bg-white/60 px-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-[14px] bg-[#e7eef8] text-[#1f5cc4]">
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>
        <h3 className="mt-5 text-[17px] font-semibold text-[#0d1526]">
          No results yet
        </h3>
        <p className="mt-2 max-w-[28ch] text-[13px] leading-6 text-[#64748b]">
          Paste or upload a document and press{" "}
          <strong className="text-[#0d1526]">Analyze</strong> to see results
          here.
        </p>
      </div>
    );
  }

  if (!data && isAnalyzing) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-[14px] border border-[#d7dfed] bg-white/70 px-8 text-center">
        <div className="h-12 w-12 rounded-full border-[3px] border-[#d8e3f2] border-t-[#1263F1]" />
        <h3 className="mt-5 text-[17px] font-semibold text-[#0d1526]">
          Analyzing text
        </h3>
        <p className="mt-2 max-w-[30ch] text-[13px] leading-6 text-[#64748b]">
          The result panel will update when the detection pipeline finishes.
        </p>
      </div>
    );
  }

  const display = data ?? previewData;
  const score = clampScore(isAnalyzing ? 32 : display.aiScore);
  const models = display.modelAttributions ?? [];
  const chunks = display.chunks ?? [];
  const fullReportAvailable = display.fullReportAvailable !== false;
  const shownModels = fullReportAvailable
    ? models
    : (previewData.modelAttributions ?? []);
  const shownChunks = fullReportAvailable ? chunks : previewData.chunks;
  const primaryModel = models[0]?.name ?? display.model;
  const submittedDate = display.submittedAt
    ? new Date(display.submittedAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Not submitted";
  const setReportSection = (
    key: keyof typeof reportSections,
    value: boolean,
  ) => {
    setReportSections((current) => ({ ...current, [key]: value }));
  };
  const reportSteps: {
    key: keyof typeof reportSections;
    question: string;
    block: string;
    detail: string;
  }[] = [
    {
      key: "verdict",
      question: "Include the verdict summary?",
      block: "Verdict summary",
      detail: "AI signal, label, top model, and submission date.",
    },
    {
      key: "models",
      question: "Include model attribution?",
      block: "Model attribution",
      detail:
        "Ranked confidence scores for GPT, Claude, Gemini, and Llama signals.",
    },
    {
      key: "highlights",
      question: "Include sentence evidence?",
      block: "Sentence evidence",
      detail:
        "Counts for likely human-written, uncertain, and likely AI-generated sentences.",
    },
    {
      key: "layers",
      question: "Include detection layers?",
      block: "Detection layers",
      detail:
        "RoBERTa classifier, stylistic analysis, and statistical analysis contributions.",
    },
    {
      key: "interpretation",
      question: "Include interpretation guidance?",
      block: "Interpretation note",
      detail:
        "Responsible academic review language that frames the result as probabilistic.",
    },
  ];
  const isPreviewStep = reportStep >= reportSteps.length;
  const currentReportStep =
    reportSteps[Math.min(reportStep, reportSteps.length - 1)];
  const reportText = [
    "Veri4i review report",
    reportSections.verdict
      ? `Verdict: ${display.label}. AI signal: ${score}%. Top model: ${primaryModel}. Date: ${submittedDate}.`
      : null,
    reportSections.interpretation
      ? "Interpretation: The submitted text shows a high AI-generation signal. Review highlighted sentences and layer scores before making an academic decision."
      : null,
    reportSections.models
      ? `Model attribution: ${models
          .slice(0, 4)
          .map((model) => `${model.name} ${clampScore(model.score)}%`)
          .join(", ")}.`
      : null,
    reportSections.highlights
      ? "Sentence evidence: 12 likely human-written sentences, 5 uncertain sentences, 7 likely AI-generated sentences."
      : null,
    reportSections.layers
      ? `Detection layers: ${chunks
          .slice(0, 3)
          .map((chunk) => `${chunk.text} ${clampScore(chunk.score)}%`)
          .join(", ")}.`
      : null,
  ]
    .filter(Boolean)
    .join("\n\n");
  const downloadReport = () => {
    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "veri4i-review-report.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  };
  const tabHeader = (
    <div className="flex h-[58px] items-center border-b border-[#d7dfed] bg-[#fbfcff]/75 px-7">
      <div
        className="flex h-full gap-12"
        role="tablist"
        aria-label="Result view"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "analysis"}
          onClick={() => setActiveTab("analysis")}
          className={`border-b-2 px-1 text-[16px] font-semibold transition-colors ${
            activeTab === "analysis"
              ? "border-[#1263F1] text-[#1263F1]"
              : "border-transparent text-[#52627a] hover:text-[#0d1526]"
          }`}
        >
          Analysis
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "report"}
          onClick={() => setActiveTab("report")}
          className={`border-b-2 px-1 text-[16px] font-semibold transition-colors ${
            activeTab === "report"
              ? "border-[#1263F1] text-[#1263F1]"
              : "border-transparent text-[#52627a] hover:text-[#0d1526]"
          }`}
        >
          Report
        </button>
      </div>
    </div>
  );

  if (activeTab === "report" && !fullReportAvailable) {
    return (
      <div className="grid h-full min-h-0 grid-rows-[58px_1fr] overflow-hidden rounded-[14px] border border-[#a6b5cd]/70 bg-white/88 shadow-[0_22px_70px_rgba(45,67,98,0.1),inset_0_1px_0_rgba(255,255,255,0.9)]">
        {tabHeader}
        <section className="relative min-h-0 overflow-hidden p-7">
          <div className="h-full min-h-0 overflow-hidden rounded-[12px] border border-[#d7dfed] bg-[#f8fafc]/75 p-5 blur-[3px]">
            <pre className="veriai-document-font whitespace-pre-wrap text-[14px] font-medium leading-7 text-[#274169]">
              {[
                "Veri4i review report",
                `Verdict: ${display.label}. AI signal: ${score}%.`,
                "Model attribution: GPT-4 93%, Claude 3 89%, Gemini 1.5 91%.",
                "Sentence evidence: likely human, uncertain, and likely AI-generated groups.",
                "Detection layers: RoBERTa classifier, stylistic analysis, statistical analysis.",
              ].join("\n\n")}
            </pre>
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-white/48 px-8">
            <div className="max-w-[360px] rounded-[14px] border border-[#cbd7ea] bg-white p-5 text-center shadow-[0_22px_54px_rgba(31,45,71,0.16)]">
              <h2 className="text-[16px] font-semibold text-[#07112f]">
                Report export is Premium
              </h2>
              <p className="mt-2 text-[13px] font-medium leading-6 text-[#52627a]">
                Upgrade to unlock attribution, sentence evidence, statistics,
                and downloadable reports for this scan.
              </p>
              {onUpgrade && (
                <button
                  type="button"
                  onClick={onUpgrade}
                  disabled={isUpgrading}
                  className="veriai-pressable mt-4 h-10 rounded-[9px] bg-[#1263F1] px-5 text-[13px] font-bold text-white shadow-[0_14px_28px_-18px_rgba(18,99,241,0.95)] hover:bg-[#0d54d5] disabled:opacity-60"
                >
                  {isUpgrading ? "Upgrading..." : "Upgrade account"}
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (activeTab === "report" && fullReportAvailable) {
    return (
      <div className="grid h-full min-h-0 grid-rows-[58px_1fr] overflow-hidden rounded-[14px] border border-[#a6b5cd]/70 bg-white/88 shadow-[0_22px_70px_rgba(45,67,98,0.1),inset_0_1px_0_rgba(255,255,255,0.9)]">
        {tabHeader}
        <section className="min-h-0 overflow-hidden">
          {!isPreviewStep ? (
            <div className="grid h-full min-h-0 grid-rows-[1fr_auto] px-7 py-6">
              <div className="flex min-h-0 items-center justify-center">
                <div className="w-full max-w-[560px] rounded-[14px] border border-[#d7dfed] bg-[#f8fafc]/75 p-6 shadow-[0_18px_42px_rgba(31,45,71,0.08)]">
                  <div className="flex items-center justify-between gap-3">
                    <span className="veriai-mono text-[12px] font-semibold text-[#7185a3]">
                      Question {reportStep + 1} of {reportSteps.length}
                    </span>
                    <span className="rounded-[8px] border border-[#d7dfed] bg-white px-2.5 py-1 text-[12px] font-semibold text-[#274169]">
                      {currentReportStep.block}
                    </span>
                  </div>
                  <h2 className="mt-6 text-[24px] font-semibold leading-[1.15] tracking-[-0.035em] text-[#07112f]">
                    {currentReportStep.question}
                  </h2>
                  <p className="mt-3 text-[14px] font-medium leading-7 text-[#52627a]">
                    {currentReportStep.detail}
                  </p>
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    {[
                      [true, "Include", "Add this block to the final report"],
                      [false, "Skip", "Leave this block out"],
                    ].map(([value, label, help]) => {
                      const selected =
                        reportSections[currentReportStep.key] === value;
                      return (
                        <button
                          key={String(value)}
                          type="button"
                          onClick={() =>
                            setReportSection(
                              currentReportStep.key,
                              Boolean(value),
                            )
                          }
                          className={`rounded-[12px] border px-4 py-4 text-left transition-colors ${
                            selected
                              ? "border-[#1263F1] bg-[#edf4ff] text-[#1263F1]"
                              : "border-[#d7dfed] bg-white text-[#274169] hover:bg-[#f7fbff]"
                          }`}
                        >
                          <span className="block text-[15px] font-semibold">
                            {label}
                          </span>
                          <span className="mt-1 block text-[12px] font-medium leading-5 text-[#7185a3]">
                            {help}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-5 rounded-[12px] border border-[#d7dfed] bg-white p-4">
                    <span className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7185a3]">
                      Block preview
                    </span>
                    {currentReportStep.key === "verdict" && (
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {[
                          ["Verdict", display.label],
                          ["Top model", primaryModel],
                          ["Date", submittedDate],
                        ].map(([label, value]) => (
                          <div
                            key={label}
                            className="rounded-[9px] border border-[#d7dfed] bg-[#f8fafc]/75 px-3 py-2.5"
                          >
                            <span className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-[#7185a3]">
                              {label}
                            </span>
                            <strong className="mt-1 block truncate text-[12px] font-semibold text-[#07112f]">
                              {value}
                            </strong>
                          </div>
                        ))}
                      </div>
                    )}
                    {currentReportStep.key === "models" && (
                      <div className="mt-3 grid gap-2">
                        {models.slice(0, 4).map((model) => (
                          <div
                            key={model.name}
                            className="grid grid-cols-[1fr_auto] items-center gap-3 text-[12px] font-semibold"
                          >
                            <span className="truncate text-[#274169]">
                              {model.name}
                            </span>
                            <span className="veriai-mono text-[#1263F1]">
                              {clampScore(model.score)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    {currentReportStep.key === "highlights" && (
                      <div className="mt-3 grid gap-2 text-[12px] font-semibold text-[#274169]">
                        <div className="flex justify-between">
                          <span>Likely human-written</span>
                          <span>12 sentences</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Uncertain</span>
                          <span>5 sentences</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Likely AI-generated</span>
                          <span>7 sentences</span>
                        </div>
                      </div>
                    )}
                    {currentReportStep.key === "layers" && (
                      <div className="mt-3 grid gap-2">
                        {chunks.slice(0, 3).map((chunk) => (
                          <div
                            key={chunk.text}
                            className="grid grid-cols-[1fr_auto] items-center gap-3 text-[12px] font-semibold"
                          >
                            <span className="truncate text-[#274169]">
                              {chunk.text}
                            </span>
                            <span className="veriai-mono text-[#1263F1]">
                              {clampScore(chunk.score)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    {currentReportStep.key === "interpretation" && (
                      <p className="mt-3 text-[13px] font-medium leading-6 text-[#274169]">
                        The submitted text shows a high AI-generation signal.
                        Review highlighted sentences and layer scores before
                        making an academic decision.
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-[#d7dfed] pt-4">
                <button
                  type="button"
                  onClick={() => setReportStep((step) => Math.max(0, step - 1))}
                  disabled={reportStep === 0}
                  className="flex h-10 items-center gap-2 rounded-[9px] border border-[#d7dfed] bg-white px-4 text-[14px] font-semibold text-[#274169] hover:bg-[#f7fbff] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setReportStep((step) =>
                      Math.min(reportSteps.length, step + 1),
                    )
                  }
                  className="flex h-10 items-center gap-2 rounded-[9px] bg-[#1263F1] px-4 text-[14px] font-semibold text-white shadow-[0_14px_26px_-20px_rgba(18,99,241,0.95)] hover:bg-[#0d54d5]"
                >
                  {reportStep === reportSteps.length - 1 ? "Preview" : "Next"} →
                </button>
              </div>
            </div>
          ) : (
            <div className="grid h-full min-h-0 grid-rows-[auto_1fr] px-7 py-6">
              <div className="flex items-center justify-between gap-4 border-b border-[#d7dfed] pb-4">
                <div>
                  <h2 className="text-[20px] font-semibold tracking-[-0.025em] text-[#07112f]">
                    Report preview
                  </h2>
                  <p className="mt-1 text-[13px] font-medium text-[#64748b]">
                    Review selected blocks before downloading.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setReportStep(reportSteps.length - 1)}
                    className="h-10 rounded-[9px] border border-[#d7dfed] bg-white px-4 text-[14px] font-semibold text-[#274169] hover:bg-[#f7fbff]"
                  >
                    ← Edit
                  </button>
                  <button
                    type="button"
                    onClick={downloadReport}
                    className="h-10 rounded-[9px] bg-[#1263F1] px-4 text-[14px] font-semibold text-white shadow-[0_14px_26px_-20px_rgba(18,99,241,0.95)] hover:bg-[#0d54d5]"
                  >
                    Download
                  </button>
                </div>
              </div>
              <div className="min-h-0 overflow-y-auto py-5">
                <pre className="veriai-document-font whitespace-pre-wrap rounded-[12px] border border-[#d7dfed] bg-[#f8fafc]/75 p-5 text-[14px] font-medium leading-7 text-[#274169]">
                  {reportText}
                </pre>
              </div>
            </div>
          )}
        </section>
      </div>
    );
  }

  return (
    <div
      className={`relative grid h-full min-h-0 overflow-hidden rounded-[14px] border border-[#a6b5cd]/70 bg-white/88 shadow-[0_22px_70px_rgba(45,67,98,0.1),inset_0_1px_0_rgba(255,255,255,0.9)] ${
        fullReportAvailable
          ? "grid-rows-[238px_226px_178px_minmax(198px,1fr)]"
          : "grid-rows-[238px_226px_178px_minmax(198px,1fr)]"
      }`}
    >
      <section className="min-h-0 overflow-hidden border-b border-[#d7dfed]">
        {tabHeader}

        <div className="grid h-[180px] grid-cols-[142px_1fr] items-center gap-5 px-7">
          <ScoreRing score={score} />
          <div className="min-w-0">
            <h2 className="flex items-center gap-3 text-[20px] font-semibold tracking-[-0.02em] text-[#ef3a43]">
              <span className="h-3.5 w-3.5 rounded-full bg-[#ef3a43]" />
              {display.label}
            </h2>
            <p className="mt-3 max-w-[38ch] text-[14px] font-medium leading-6 text-[#152342]">
              {fullReportAvailable
                ? "The full ensemble result includes model attribution, sentence evidence, and analysis-layer scores."
                : "Free analysis uses the layer 1 detector and returns the global score and label."}
            </p>
            <p className="mt-4 flex items-start gap-2 text-[12px] font-medium leading-5 text-[#64748b]">
              <InfoCircledIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#7c8aa5]" />
              <span>
                Probabilistic signal only. Review evidence before making an
                academic judgment.
              </span>
            </p>
          </div>
        </div>
      </section>

      <section className="relative grid min-h-0 grid-rows-[auto_1fr] border-b border-[#d7dfed] px-[22px] pb-[14px] pt-4">
        <div className="flex items-center justify-between pb-3">
          <h2 className="flex items-center gap-2 text-[15px] font-semibold text-[#07112f]">
            Model attribution{" "}
            <InfoCircledIcon className="h-4 w-4 text-[#7c8aa5]" />
          </h2>
          <span className="text-[12px] font-medium text-[#64748b]">
            ranked by confidence
          </span>
        </div>
        <div
          className={`grid grid-cols-2 content-stretch gap-2.5 ${fullReportAvailable ? "" : "blur-[2px] opacity-60"}`}
        >
          {shownModels.slice(0, 4).map((model) => {
            const modelScore = clampScore(model.score);
            const scoreColor =
              modelScore >= 90 ? "text-[#b32635]" : "text-[#07112f]";
            return (
              <article
                key={model.name}
                className="grid min-h-[76px] content-between rounded-[10px] border border-[#d7dfed] bg-[#f8fafc]/70 p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="flex min-w-0 items-center gap-2 text-[14px] font-medium text-[#07112f]">
                    <ModelLogo name={model.name} className="h-6 w-6 shrink-0" />
                    <span className="truncate">{model.name}</span>
                  </span>
                  <span
                    className={`veriai-mono text-[13px] font-semibold ${scoreColor}`}
                  >
                    {modelScore}%
                  </span>
                </div>
                <span className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#e5ebf4]">
                  <span
                    className="veriai-bar-fill block h-full rounded-full bg-[#1263F1]"
                    style={{ width: `${modelScore}%` }}
                  />
                </span>
              </article>
            );
          })}
        </div>
      </section>

      <section className="relative grid min-h-0 grid-rows-[auto_1fr] border-b border-[#d7dfed] px-[22px] pb-[14px] pt-4">
        <div className="flex items-center justify-between pb-3">
          <h2 className="flex items-center gap-2 text-[15px] font-semibold text-[#07112f]">
            Sentence-level highlights{" "}
            <InfoCircledIcon className="h-4 w-4 text-[#7c8aa5]" />
          </h2>
          <span className="text-[12px] font-medium text-[#64748b]">
            24 sentences
          </span>
        </div>
        <div
          className={`grid content-stretch gap-[9px] ${fullReportAvailable ? "" : "blur-[2px] opacity-60"}`}
        >
          {[
            ["human", "Likely human-written", "12 sentences"],
            ["mixed", "Uncertain", "5 sentences"],
            ["ai", "Likely AI-generated", "7 sentences"],
          ].map(([toneValue, label, count]) => {
            const meta = toneMeta(toneValue as "human" | "mixed" | "ai");
            return (
              <div
                key={label}
                className="veriai-highlight-row grid grid-cols-[18px_1fr_auto_18px] items-center gap-3 rounded-[10px] border border-[#d7dfed] bg-[#f8fafc]/70 px-3.5"
              >
                <span className={`h-3 w-3 rounded-full ${meta.dot}`} />
                <span className="text-[14px] font-medium text-[#07112f]">
                  {label}
                </span>
                <span className="text-[12px] font-medium text-[#274169]">
                  {count}
                </span>
                <span className="text-[#07112f]">⌄</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="relative grid min-h-0 grid-rows-[auto_1fr] px-[22px] pb-[14px] pt-4">
        <div className="flex items-center justify-between pb-3">
          <h2 className="flex items-center gap-2 text-[15px] font-semibold text-[#07112f]">
            Analysis layers{" "}
            <InfoCircledIcon className="h-4 w-4 text-[#7c8aa5]" />
          </h2>
          <span className="text-[12px] font-medium text-[#64748b]">
            signal mix
          </span>
        </div>
        <div
          className={`grid min-h-0 grid-cols-3 content-stretch gap-2.5 ${fullReportAvailable ? "" : "blur-[2px] opacity-60"}`}
        >
          {shownChunks.slice(0, 3).map((chunk, index) => {
            const value = clampScore(chunk.score);
            return (
              <article
                key={`${chunk.text}-${index}`}
                className="flex min-h-0 flex-col justify-between rounded-[10px] border border-[#d7dfed] bg-[#f8fafc]/70 p-3"
              >
                <div className="min-w-0">
                  <h3 className="truncate text-[12px] font-semibold text-[#07112f]">
                    {chunk.text}
                  </h3>
                  <strong className="veriai-mono mt-2 block text-[22px] font-semibold leading-none text-[#1263F1]">
                    {value}%
                  </strong>
                </div>
                <MiniBars
                  tone={index === 0 ? "human" : index === 1 ? "mixed" : "ai"}
                />
              </article>
            );
          })}
        </div>
      </section>
      {!fullReportAvailable && (
        <div
          className="absolute inset-x-0 bottom-0 flex items-center justify-center"
          style={{ top: "238px" }}
        >
          <div className="rounded-[14px] border border-[#cbd7ea] bg-white px-7 py-6 text-center shadow-[0_22px_54px_rgba(31,45,71,0.16)]">
            <p className="text-[16px] font-semibold text-[#07112f]">
              Unlock the full report
            </p>
            <p className="mt-2 max-w-[28ch] text-[13px] font-medium leading-6 text-[#52627a]">
              Attribution, sentence evidence, and analysis layers are Premium.
            </p>
            {onUpgrade && (
              <button
                type="button"
                onClick={onUpgrade}
                disabled={isUpgrading}
                className="veriai-pressable mt-4 h-10 rounded-[9px] bg-[#1263F1] px-6 text-[13px] font-bold text-white shadow-[0_14px_28px_-18px_rgba(18,99,241,0.95)] hover:bg-[#0d54d5] disabled:opacity-60"
              >
                {isUpgrading ? "Upgrading..." : "Upgrade account"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
