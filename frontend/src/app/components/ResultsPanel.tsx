import { useState } from "react";
import { InfoCircledIcon } from "@radix-ui/react-icons";

function InfoTooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <InfoCircledIcon className="h-[14px] w-[14px] cursor-default text-[#9aacbf] transition-colors hover:text-[#1263F1]" />
      {show && (
        <span className="pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 z-50 w-[210px] -translate-x-1/2 rounded-[10px] border border-[#d7dfed] bg-white px-3 py-2.5 text-left text-[12px] font-medium leading-[1.55] text-[#52627a] shadow-[0_8px_28px_rgba(31,45,71,0.13)]">
          {text}
          {/* arrow */}
          <span
            className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-[#d7dfed]"
            style={{ marginTop: 0 }}
          />
          <span
            className="absolute left-1/2 top-full -translate-x-1/2 border-[3.5px] border-transparent border-t-white"
            style={{ marginTop: -1 }}
          />
        </span>
      )}
    </span>
  );
}
import { ModelLogo } from "./DesignIcons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

interface Segment {
  text: string;
  isAI: boolean;
}
interface ModelAttribution {
  name: string;
  score: number;
}

interface WritingCharacteristics {
  vocabularyDiversity: number | null;
  avgSentenceLength: number | null;
  sentenceLengthVariance: number | null;
  burstinessScore: number | null;
  perplexity: number | null;
  avgTokenEntropy: number | null;
  logicalConnectorRatio: number | null;
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
  layer1Score?: number;
  layer2Score?: number;
  layer3Score?: number;
  writingCharacteristics?: WritingCharacteristics | null;
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
  chunks: [],
  stats: { analyzed: 36, flagged: 18, clean: 18 },
  layer1Score: 60,
  layer2Score: 25,
  layer3Score: 15,
  segments: [
    {
      text: "The methodology section follows standard academic structure.",
      isAI: false,
    },
    {
      text: "Background context is grounded in cited literature.",
      isAI: false,
    },
    {
      text: "Theoretical framing references established frameworks accurately.",
      isAI: false,
    },
    {
      text: "The analysis presents insights with notable AI-like fluency.",
      isAI: true,
    },
    {
      text: "Conclusions offer novel framing that mirrors AI generation patterns.",
      isAI: true,
    },
    {
      text: "The discussion synthesises points in a structured, predictable manner.",
      isAI: true,
    },
  ],
  fullReportAvailable: true,
  accessLevel: "PREMIUM",
  writingCharacteristics: {
    vocabularyDiversity: 0.61,
    avgSentenceLength: 17.5,
    sentenceLengthVariance: 29.0,
    burstinessScore: 1.65,
    perplexity: 42.0,
    avgTokenEntropy: 3.8,
    logicalConnectorRatio: 0.042,
  },
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

  if (isAnalyzing) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-[14px] border border-[#d7dfed] bg-white/70 px-8 text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-[#d8e3f2] border-t-[#1263F1]" />
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
  const shownModels = fullReportAvailable ? models : [];
  const shownChunks = fullReportAvailable ? chunks : previewData.chunks;
  const analysisLayers = [
    {
      label: "RoBERTa Classifier",
      score: display.layer1Score ?? 0,
      tone: "ai" as const,
    },
    {
      label: "Stylistic Analysis",
      score: fullReportAvailable ? (display.layer2Score ?? 0) : 62,
      tone: "mixed" as const,
    },
    {
      label: "Statistical Analysis",
      score: fullReportAvailable ? (display.layer3Score ?? 0) : 45,
      tone: "human" as const,
    },
  ];
  const rawSegments = display.segments ?? [];
  const humanSegments = rawSegments.filter((s) => !s.isAI);
  const aiSegments = rawSegments.filter((s) => s.isAI);
  const primaryModel = models[0]?.name ?? display.model;
  const isHumanResult = (display.aiScore ?? 0) < 50;
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

  // Chart data
  const layerChartData = analysisLayers.map((l) => ({
    name: l.label.split(" ")[0],
    score: clampScore(l.score),
  }));

  const wc = display.writingCharacteristics;
  const radarData = wc
    ? [
        {
          metric: "Vocabulary",
          value: Math.min(100, Math.round((wc.vocabularyDiversity ?? 0) * 100)),
        },
        {
          metric: "Variation",
          value: Math.min(100, Math.round(wc.sentenceLengthVariance ?? 0)),
        },
        {
          metric: "Burstiness",
          value: Math.min(100, Math.round((wc.burstinessScore ?? 0) * 25)),
        },
        {
          metric: "Unpredictability",
          value: Math.min(100, Math.round((wc.perplexity ?? 0) / 2)),
        },
        {
          metric: "Entropy",
          value: Math.min(100, Math.round((wc.avgTokenEntropy ?? 0) * 16)),
        },
      ]
    : [];

  const tabHeader = (
    <div className="flex h-[58px] shrink-0 items-center border-b border-[#d7dfed] bg-[#fbfcff]/75 px-7">
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
        <section className="relative min-h-0 overflow-hidden">
          {/* Blurred step-1 question wizard */}
          <div className="pointer-events-none h-full select-none overflow-hidden blur-[3px]">
            <div className="grid h-full min-h-0 grid-rows-[1fr_auto] px-7 py-6">
              <div className="flex min-h-0 items-center justify-center">
                <div className="w-full max-w-[560px] rounded-[14px] border border-[#d7dfed] bg-[#f8fafc]/75 p-6 shadow-[0_18px_42px_rgba(31,45,71,0.08)]">
                  <div className="flex items-center justify-between gap-3">
                    <span className="veriai-mono text-[12px] font-semibold text-[#7185a3]">
                      Question 1 of 5
                    </span>
                    <span className="rounded-[8px] border border-[#d7dfed] bg-white px-2.5 py-1 text-[12px] font-semibold text-[#274169]">
                      Verdict summary
                    </span>
                  </div>
                  <h2 className="mt-6 text-[24px] font-semibold leading-[1.15] tracking-[-0.035em] text-[#07112f]">
                    Include the verdict summary?
                  </h2>
                  <p className="mt-3 text-[14px] font-medium leading-7 text-[#52627a]">
                    AI signal, label, top model, and submission date.
                  </p>
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      className="rounded-[12px] border border-[#1263F1] bg-[#edf4ff] px-4 py-4 text-left"
                    >
                      <span className="block text-[15px] font-semibold text-[#1263F1]">
                        Include
                      </span>
                      <span className="mt-1 block text-[12px] font-medium leading-5 text-[#7185a3]">
                        Add this block to the final report
                      </span>
                    </button>
                    <button
                      type="button"
                      className="rounded-[12px] border border-[#d7dfed] bg-white px-4 py-4 text-left"
                    >
                      <span className="block text-[15px] font-semibold text-[#274169]">
                        Skip
                      </span>
                      <span className="mt-1 block text-[12px] font-medium leading-5 text-[#7185a3]">
                        Leave this block out
                      </span>
                    </button>
                  </div>
                  <div className="mt-5 rounded-[12px] border border-[#d7dfed] bg-white p-4">
                    <span className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7185a3]">
                      Block preview
                    </span>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {(
                        [
                          ["Verdict", "AI generated"],
                          ["Top model", "GPT-4"],
                          ["Date", "May 14, 2025"],
                        ] as [string, string][]
                      ).map(([label, value]) => (
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
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-[#d7dfed] pt-4">
                <button
                  type="button"
                  className="flex h-10 items-center gap-2 rounded-[9px] border border-[#d7dfed] bg-white px-4 text-[14px] font-semibold text-[#274169] opacity-45"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  className="flex h-10 items-center gap-2 rounded-[9px] bg-[#1263F1] px-4 text-[14px] font-semibold text-white"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
          {/* Upgrade overlay */}
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
                    {(
                      [
                        [true, "Include", "Add this block to the final report"],
                        [false, "Skip", "Leave this block out"],
                      ] as [boolean, string, string][]
                    ).map(([value, label, help]) => {
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
                        {(
                          [
                            ["Verdict", display.label],
                            ["Top model", primaryModel],
                            ["Date", submittedDate],
                          ] as [string, string][]
                        ).map(([label, value]) => (
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

  // Analysis tab
  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-[14px] border border-[#a6b5cd]/70 bg-white/88 shadow-[0_22px_70px_rgba(45,67,98,0.1),inset_0_1px_0_rgba(255,255,255,0.9)]">
      {tabHeader}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* Verdict section */}
        <section className="border-b border-[#d7dfed]">
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

        {/* Confidence across text (AreaChart) — PRO + has chunks */}
        {fullReportAvailable && chunks.length > 0 && (
          <section className="border-b border-[#d7dfed] px-[22px] pb-[14px] pt-4">
            <div className="flex items-center justify-between pb-3">
              <h2 className="flex items-center gap-2 text-[15px] font-semibold text-[#07112f]">
                Confidence across text{" "}
                <InfoTooltip text="Per-chunk AI confidence score across the document. Red peaks indicate likely AI-generated passages; blue troughs indicate likely human-written ones." />
              </h2>
              <span className="text-[12px] font-medium text-[#64748b]">
                {chunks.length} chunks
              </span>
            </div>
            <ResponsiveContainer width="100%" height={80}>
              <AreaChart
                data={chunks.map((c, i) => ({ i: i + 1, score: c.score }))}
                margin={{ top: 4, right: 0, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="chunkGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef3a43" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#ef3a43" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="i" hide />
                <YAxis domain={[0, 100]} hide />
                <Tooltip
                  formatter={(v) => [`${v}%`, "AI confidence"]}
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                    border: "1px solid #d7dfed",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#ef3a43"
                  strokeWidth={1.5}
                  fill="url(#chunkGrad)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </section>
        )}

        {/* Confidence across text — FREE blurred preview */}
        {!fullReportAvailable && (
          <section className="border-b border-[#d7dfed] px-[22px] pb-[14px] pt-4">
            <div className="pointer-events-none select-none blur-[3px]">
              <div className="flex items-center justify-between pb-3">
                <h2 className="flex items-center gap-2 text-[15px] font-semibold text-[#07112f]">
                  Confidence across text
                </h2>
                <span className="text-[12px] font-medium text-[#64748b]">
                  8 chunks
                </span>
              </div>
              <ResponsiveContainer width="100%" height={80}>
                <AreaChart
                  data={[42, 61, 78, 88, 95, 82, 74, 65].map((s, i) => ({
                    i: i + 1,
                    score: s,
                  }))}
                  margin={{ top: 4, right: 0, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="chunkGradFree"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#ef3a43"
                        stopOpacity={0.25}
                      />
                      <stop offset="95%" stopColor="#ef3a43" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="i" hide />
                  <YAxis domain={[0, 100]} hide />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#ef3a43"
                    strokeWidth={1.5}
                    fill="url(#chunkGradFree)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {/* Model attribution */}
        {!isHumanResult && (
          <section className="relative grid min-h-0 grid-rows-[auto_1fr] border-b border-[#d7dfed] px-[22px] pb-[14px] pt-4">
            <div className="flex items-center justify-between pb-3">
              <h2 className="flex items-center gap-2 text-[15px] font-semibold text-[#07112f]">
                Model attribution{" "}
                <InfoTooltip text="Estimates which AI model most likely generated this text based on statistical pattern matching. Results are probabilistic, not definitive." />
              </h2>
              <span className="text-[12px] font-medium text-[#64748b]">
                ranked by confidence
              </span>
            </div>
            {fullReportAvailable ? (
              <div className="grid grid-cols-2 content-stretch gap-2.5">
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
                          <ModelLogo
                            name={model.name}
                            className="h-6 w-6 shrink-0"
                          />
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
            ) : (
              <div className="pointer-events-none select-none blur-[3px]">
                <div className="grid grid-cols-2 content-stretch gap-2.5">
                  {previewData.modelAttributions.slice(0, 4).map((model) => {
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
                            <ModelLogo
                              name={model.name}
                              className="h-6 w-6 shrink-0"
                            />
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
              </div>
            )}
          </section>
        )}

        {/* Sentence-level highlights */}
        <section className="relative grid min-h-0 grid-rows-[auto_1fr] border-b border-[#d7dfed] px-[22px] pb-[14px] pt-4">
          <div className="flex items-center justify-between pb-3">
            <h2 className="flex items-center gap-2 text-[15px] font-semibold text-[#07112f]">
              Sentence-level highlights{" "}
              <InfoTooltip text="Each chunk of text is scored individually. Green = likely human-written. Red = likely AI-generated." />
            </h2>
            <span className="text-[12px] font-medium text-[#64748b]">
              {fullReportAvailable
                ? `${humanSegments.length + aiSegments.length} ${
                    humanSegments.length + aiSegments.length === 1
                      ? "sentence"
                      : "sentences"
                  }`
                : ""}
            </span>
          </div>
          {fullReportAvailable ? (
            <div className="grid content-stretch gap-[9px]">
              {[
                {
                  tone: "human" as const,
                  label: "Likely human-written",
                  count: humanSegments.length,
                },
                {
                  tone: "ai" as const,
                  label: "Likely AI-generated",
                  count: aiSegments.length,
                },
              ].map(({ tone, label, count }) => {
                const meta = toneMeta(tone);
                return (
                  <div
                    key={tone}
                    className="grid grid-cols-[18px_1fr_auto] items-center gap-3 rounded-[10px] border border-[#d7dfed] bg-[#f8fafc]/70 px-3.5 py-2.5"
                  >
                    <span className={`h-3 w-3 rounded-full ${meta.dot}`} />
                    <span className="text-[14px] font-medium text-[#07112f]">
                      {label}
                    </span>
                    <span className="text-[12px] font-medium text-[#274169]">
                      {count} {count === 1 ? "sentence" : "sentences"}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="pointer-events-none select-none blur-[3px]">
              <div className="grid content-stretch gap-[9px]">
                {[
                  {
                    tone: "human" as const,
                    label: "Likely human-written",
                    count: 12,
                  },
                  {
                    tone: "ai" as const,
                    label: "Likely AI-generated",
                    count: 7,
                  },
                ].map(({ tone, label, count }) => {
                  const meta = toneMeta(tone);
                  return (
                    <div
                      key={tone}
                      className="grid grid-cols-[18px_1fr_auto] items-center gap-3 rounded-[10px] border border-[#d7dfed] bg-[#f8fafc]/70 px-3.5 py-2.5"
                    >
                      <span className={`h-3 w-3 rounded-full ${meta.dot}`} />
                      <span className="text-[14px] font-medium text-[#07112f]">
                        {label}
                      </span>
                      <span className="text-[12px] font-medium text-[#274169]">
                        {count} sentences
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* Writing characteristics — FREE blurred preview (human results only) */}
        {isHumanResult && !fullReportAvailable && (
          <section className="border-b border-[#d7dfed] px-[22px] pb-[14px] pt-4">
            <div className="pointer-events-none select-none blur-[3px]">
              <div className="pb-3">
                <h2 className="flex items-center gap-2 text-[15px] font-semibold text-[#07112f]">
                  Writing characteristics
                </h2>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <RadarChart
                  data={[
                    { metric: "Vocabulary", value: 61 },
                    { metric: "Variation", value: 44 },
                    { metric: "Burstiness", value: 58 },
                    { metric: "Unpredictability", value: 72 },
                    { metric: "Entropy", value: 53 },
                  ]}
                  margin={{ top: 8, right: 24, left: 24, bottom: 8 }}
                >
                  <PolarGrid stroke="#e5ebf4" />
                  <PolarAngleAxis
                    dataKey="metric"
                    tick={{ fontSize: 10, fill: "#7185a3", fontWeight: 500 }}
                  />
                  <PolarRadiusAxis
                    domain={[0, 100]}
                    tick={false}
                    axisLine={false}
                  />
                  <Radar
                    dataKey="value"
                    stroke="#1263F1"
                    fill="#1263F1"
                    fillOpacity={0.12}
                    strokeWidth={1.5}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {/* Writing characteristics (RadarChart) — human results + PRO only */}
        {isHumanResult && fullReportAvailable && radarData.length > 0 && (
          <section className="border-b border-[#d7dfed] px-[22px] pb-[14px] pt-4">
            <div className="flex items-center justify-between pb-3">
              <h2 className="flex items-center gap-2 text-[15px] font-semibold text-[#07112f]">
                Writing characteristics
                <InfoTooltip text="Linguistic and statistical features that characterise this text as human-written. Higher values indicate stronger human signals." />
              </h2>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <RadarChart
                data={radarData}
                margin={{ top: 8, right: 24, left: 24, bottom: 8 }}
              >
                <PolarGrid stroke="#e5ebf4" />
                <PolarAngleAxis
                  dataKey="metric"
                  tick={{ fontSize: 10, fill: "#7185a3", fontWeight: 500 }}
                />
                <PolarRadiusAxis
                  domain={[0, 100]}
                  tick={false}
                  axisLine={false}
                />
                <Radar
                  dataKey="value"
                  stroke="#1263F1"
                  fill="#1263F1"
                  fillOpacity={0.12}
                  strokeWidth={1.5}
                />
                <Tooltip
                  formatter={(v) => [`${v}`, "Human signal"]}
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                    border: "1px solid #d7dfed",
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </section>
        )}

        {/* Analysis layers (BarChart) */}
        <section className="relative grid min-h-0 grid-rows-[auto_1fr] px-[22px] pb-[14px] pt-4">
          <div className="flex items-center justify-between pb-3">
            <h2 className="flex items-center gap-2 text-[15px] font-semibold text-[#07112f]">
              Analysis layers{" "}
              <InfoTooltip text="RoBERTa: fine-tuned transformer classifier (primary signal). Stylistic: linguistic feature analysis. Statistical: perplexity and entropy scoring." />
            </h2>
            <span className="text-[12px] font-medium text-[#64748b]">
              signal mix
            </span>
          </div>
          <div
            className={`${!fullReportAvailable ? "pointer-events-none blur-[2px] opacity-60" : ""}`}
          >
            <ResponsiveContainer width="100%" height={140}>
              <BarChart
                data={layerChartData}
                barCategoryGap="35%"
                maxBarSize={56}
                margin={{ top: 16, right: 4, left: 4, bottom: 0 }}
              >
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#7185a3", fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis domain={[0, 100]} hide />
                <Tooltip
                  cursor={{ fill: "rgba(18,99,241,0.05)" }}
                  formatter={(value) => [`${value}%`, "AI signal"]}
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                    border: "1px solid #d7dfed",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                />
                <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                  {layerChartData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={
                        entry.score >= 65
                          ? "#ef3a43"
                          : entry.score >= 45
                            ? "#f6b52d"
                            : "#1263F1"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="mt-1 text-center text-[11px] font-medium text-[#9aacbf]">
              {analysisLayers[0] &&
                `RoBERTa ${clampScore(analysisLayers[0].score)}% · Stylistic ${clampScore(analysisLayers[1]?.score ?? 0)}% · Statistical ${clampScore(analysisLayers[2]?.score ?? 0)}%`}
            </p>
          </div>
        </section>

        {/* Upgrade overlay — sticky at bottom of scroll container */}
        {!fullReportAvailable && (
          <div className="sticky bottom-0 flex items-center justify-center bg-gradient-to-t from-white/95 to-white/60 px-4 pb-4 pt-8">
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
    </div>
  );
}
