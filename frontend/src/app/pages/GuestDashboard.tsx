import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router";
import {
  ArrowRightIcon,
  CheckCircledIcon,
  ReaderIcon,
} from "@radix-ui/react-icons";
import {
  DocumentSearchButtonIcon,
  GraduationCapIcon,
  LayeredDetectionIcon,
  LockLineIcon,
  ResultsBarsIcon,
  ShieldCheckIcon,
} from "../components/DesignIcons";
import { Header } from "../components/Header";
import { AmbientBackground } from "../components/AmbientBackground";
import { useApp } from "../context/AppContext";

const trustFeatures = [
  {
    title: "Privacy first",
    text: "Your data is encrypted and never stored.",
    icon: ShieldCheckIcon,
  },
  {
    title: "Built for academia",
    text: "Designed for educators, by education experts.",
    icon: GraduationCapIcon,
  },
  {
    title: "Transparent results",
    text: "See clear scoring, labels, and report depth based on your plan.",
    icon: ResultsBarsIcon,
  },
  {
    title: "Plan-ready workflow",
    text: "Start with daily text credits or use Premium for unlimited document review.",
    icon: LockLineIcon,
  },
];

function FeatureTile({
  title,
  text,
  icon,
  className = "",
}: {
  title: string;
  text: string;
  icon: ReactNode;
  className?: string;
}) {
  return (
    <article
      className={`veriai-card-surface veriai-hover-lift rounded-[16px] p-6 ${className}`}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-[#e7eef8] text-[#1f5cc4]">
        {icon}
      </div>
      <h3 className="mt-5 text-[20px] font-semibold tracking-[-0.02em] text-[#0d1526]">
        {title}
      </h3>
      <p className="mt-3 max-w-[42ch] text-[14px] leading-6 text-[#40516d]">
        {text}
      </p>
    </article>
  );
}

function HighlightPreview() {
  return (
    <div className="veriai-card-surface rounded-[14px] p-4 backdrop-blur">
      <div className="mb-4 flex items-center justify-between border-b border-[#e4eaf3] pb-3">
        <span className="text-[12px] font-bold text-[#40516d]">
          academic-integrity-review.txt
        </span>
        <span className="veriai-mono rounded-[6px] bg-[#fff4dd] px-2.5 py-1 text-[11px] font-bold text-[#6d4a00]">
          92%
        </span>
      </div>
      <p className="veriai-document-font text-[15px] font-medium leading-8 text-[#172033]">
        The growth of artificial intelligence has changed how students draft and
        revise work.
        <mark className="mx-1 rounded-[5px] bg-[#dff4e7] px-1.5 py-0.5 text-[#17633f]">
          Human revisions still show local uncertainty
        </mark>
        while some passages use
        <mark className="mx-1 rounded-[5px] bg-[#fff1d3] px-1.5 py-0.5 text-[#8a5200]">
          repeated transitional structure
        </mark>
        and
        <mark className="mx-1 rounded-[5px] bg-[#ffdfe4] px-1.5 py-0.5 text-[#991b2c]">
          uniformly polished claims with low specificity
        </mark>
        .
      </p>
      <div className="mt-5 grid grid-cols-3 gap-2 text-[11px] font-semibold text-[#40516d]">
        <span className="rounded-[8px] bg-[#f6f8fc] px-3 py-2">Human-like</span>
        <span className="rounded-[8px] bg-[#f6f8fc] px-3 py-2">Uncertain</span>
        <span className="rounded-[8px] bg-[#f6f8fc] px-3 py-2">AI-like</span>
      </div>
    </div>
  );
}

function PlanRow({
  children,
  muted = false,
}: {
  children: ReactNode;
  muted?: boolean;
}) {
  return (
    <li
      className={`flex items-start gap-2 text-[13px] leading-6 ${muted ? "text-[#7185a3]" : "text-[#274169]"}`}
    >
      <CheckCircledIcon
        className={`mt-1 h-4 w-4 shrink-0 ${muted ? "text-[#9aacbf]" : "text-[#1f5cc4]"}`}
      />
      <span>{children}</span>
    </li>
  );
}

export function GuestDashboard() {
  const { isLoggedIn } = useApp();
  const navigate = useNavigate();
  const [scanMode, setScanMode] = useState<"text" | "file">("text");
  const [scanText, setScanText] = useState("");
  const [scanFile, setScanFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isLoggedIn) navigate("/dashboard");
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    const handleMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth) * 100;
      const y = (event.clientY / window.innerHeight) * 100;
      document.documentElement.style.setProperty("--x", `${x}%`);
      document.documentElement.style.setProperty("--y", `${y}%`);
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  const handleQuickScan = () => {
    navigate("/login");
  };

  return (
    <div className="veriai-academic-bg veriai-landing-shell min-h-screen">
      <div className="veriai-ambient-layer" aria-hidden="true">
        <div className="veriai-ambient-shape lg" />
        <div className="veriai-ambient-shape md" />
        <div className="veriai-ambient-shape sm" />
        <div className="veriai-scroll-spotlight" />
      </div>
      <AmbientBackground />
      <Header variant="landing" />

      <main>
        <section className="veriai-reveal mx-auto grid max-w-[1320px] gap-10 px-5 pb-14 pt-8 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:px-8">
          <div className="max-w-[680px]">
            <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#667892]">
              Academic AI evidence review
            </p>
            <h1 className="veriai-display-font mt-4 text-[46px] font-semibold leading-[0.98] tracking-[-0.045em] text-[#0d1526] text-balance md:text-[66px]">
              Verify writing without losing the document context.
            </h1>
            <p className="mt-4 max-w-[56ch] text-[16px] leading-7 text-[#40516d]">
              VeriAI brings paste, upload, probability scoring, model
              attribution, and passage highlights into one clean academic
              workflow.
            </p>

            <div className="veriai-stagger mt-7 flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/signup")}
                className="veriai-pressable flex h-11 items-center gap-3 rounded-[9px] bg-[#1f5cc4] px-5 text-[15px] font-semibold text-white shadow-[0_14px_28px_-18px_rgba(31,92,196,0.95)] hover:bg-[#174ca8]"
              >
                <DocumentSearchButtonIcon className="h-5 w-5" /> Start review
              </button>
              <button
                onClick={() =>
                  document
                    .getElementById("plans")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="veriai-pressable flex h-11 items-center gap-3 rounded-[9px] border border-[#cbd7ea] bg-white/80 px-5 text-[15px] font-semibold text-[#172033] hover:bg-white"
              >
                See plans <ArrowRightIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="veriai-card-surface veriai-reveal mt-7 grid max-w-[500px] grid-cols-3 overflow-hidden rounded-[12px] text-center">
              <div className="px-3 py-4">
                <strong className="veriai-mono block text-[21px] text-[#0d1526]">
                  3k
                </strong>
                <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#64748b]">
                  Daily credits
                </span>
              </div>
              <div className="border-l border-[#d7dfed] px-3 py-4">
                <strong className="veriai-mono block text-[21px] text-[#0d1526]">
                  3
                </strong>
                <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#64748b]">
                  Model layers
                </span>
              </div>
              <div className="border-l border-[#d7dfed] px-3 py-4">
                <strong className="veriai-mono block text-[21px] text-[#0d1526]">
                  0
                </strong>
                <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#64748b]">
                  Stored files
                </span>
              </div>
            </div>
          </div>

          <div className="veriai-reveal-slow relative">
            <img
              src="/assets/generated/academic-desk.png"
              alt="Academic desk with an annotated paper and AI detection review notes"
              className="veriai-ink-shadow veriai-hero-float aspect-[16/10] w-full rounded-[18px] border border-[#cbd7ea] object-cover"
              draggable={false}
            />
            <div className="mt-4 lg:absolute lg:bottom-6 lg:left-6 lg:w-[500px]">
              <div className="veriai-hero-float-subtle">
                <HighlightPreview />
              </div>
            </div>
          </div>
        </section>

        <section
          id="workflow"
          className="veriai-reveal border-y border-[#d7dfed] bg-[#fbfcff]/72 backdrop-blur"
        >
          <div className="mx-auto grid max-w-[1320px] gap-10 px-5 py-14 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:px-8">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#64748b]">
                The review flow
              </p>
              <h2 className="veriai-display-font mt-4 max-w-[620px] text-[40px] font-semibold leading-[1.05] tracking-[-0.04em] text-[#0d1526] text-balance">
                Built around the source document, not a detached score.
              </h2>
              <div className="mt-8 space-y-5">
                {[
                  "Paste or upload the draft",
                  "Run layered model analysis",
                  "Read highlighted evidence beside the result",
                ].map((item, index) => (
                  <div key={item} className="flex items-center gap-4">
                    <span className="veriai-mono flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#e7eef8] text-[12px] font-bold text-[#1f5cc4]">
                      {index + 1}
                    </span>
                    <span className="text-[16px] font-semibold text-[#172033]">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <img
              src="/assets/generated/document-closeup.png"
              alt="Close-up of a digital document with AI detection highlights"
              className="veriai-ink-shadow aspect-[4/3] w-full rounded-[18px] border border-[#cbd7ea] object-cover"
              draggable={false}
            />
          </div>
        </section>

        <section className="veriai-reveal mx-auto max-w-[860px] px-5 py-14 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#64748b]">
              Try it now
            </p>
            <h2 className="veriai-display-font mt-3 text-[36px] font-semibold leading-[1.05] tracking-[-0.04em] text-[#0d1526]">
              Paste a draft and see what the scan looks like.
            </h2>
          </div>
          <div>
            {/* ── Scan card ── */}
            <div className="veriai-card-surface overflow-hidden rounded-[18px]">
              {/* Tab bar */}
              <div className="flex h-[62px] items-end justify-between gap-4 border-b border-[#d7dfed] bg-[#fbfcff] px-5">
                <div
                  className="flex h-full items-end gap-7"
                  role="tablist"
                  aria-label="Scan input mode"
                >
                  {(
                    [
                      ["text", "Text input"],
                      ["file", "Upload file"],
                    ] as const
                  ).map(([mode, label]) => (
                    <button
                      key={mode}
                      type="button"
                      role="tab"
                      aria-selected={scanMode === mode}
                      onClick={() => setScanMode(mode)}
                      className={`veriai-pressable flex h-full items-center gap-2 border-b-2 pb-px text-[14px] font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1263F1] ${
                        scanMode === mode
                          ? "border-[#1263F1] text-[#1263F1]"
                          : "border-transparent text-[#52627a] hover:text-[#0d1526]"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleQuickScan}
                  className="veriai-pressable mb-2.5 flex h-[38px] items-center gap-2 rounded-[8px] bg-[#1263F1] px-5 text-[14px] font-bold text-white shadow-[0_14px_28px_-18px_rgba(18,99,241,0.9)] hover:bg-[#0d54d5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1263F1]"
                >
                  <DocumentSearchButtonIcon className="h-4 w-4" />
                  Run scan
                </button>
              </div>

              {/* Formatting toolbar */}
              <div
                className="flex min-h-[44px] items-center gap-1 border-b border-[#d7dfed] bg-white px-4"
                aria-hidden="true"
              >
                <button
                  type="button"
                  tabIndex={-1}
                  className="flex h-8 items-center gap-1 rounded-[6px] px-2.5 text-[13px] font-semibold text-[#274169] hover:bg-[#eef3f9]"
                >
                  Paragraph <span className="ml-0.5 text-[#94a3b8]">⌄</span>
                </button>
                <div className="mx-1.5 h-6 w-px bg-[#d7dfed]" />
                {(["B", "I", "U"] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    tabIndex={-1}
                    className="flex h-8 w-8 items-center justify-center rounded-[6px] text-[13px] font-bold text-[#274169] hover:bg-[#eef3f9]"
                  >
                    {f}
                  </button>
                ))}
                <div className="mx-1.5 h-6 w-px bg-[#d7dfed]" />
                <button
                  type="button"
                  tabIndex={-1}
                  className="flex h-8 items-center gap-1 rounded-[6px] px-2 text-[12px] font-semibold text-[#94a3b8] hover:bg-[#eef3f9]"
                >
                  ¶
                </button>
              </div>

              {/* Input area */}
              {scanMode === "text" ? (
                <div className="bg-white">
                  <label className="sr-only" htmlFor="landing-text">
                    Paste text to scan
                  </label>
                  <textarea
                    id="landing-text"
                    value={scanText}
                    onChange={(event) => setScanText(event.target.value)}
                    rows={11}
                    className="w-full resize-none bg-transparent px-5 py-5 text-[15px] leading-7 text-[#0d1526] outline-none placeholder:text-[#94a3b8]"
                    placeholder="Paste the draft you want to review…"
                  />
                </div>
              ) : (
                <div className="bg-white px-5 py-5">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="veriai-pressable flex min-h-[220px] w-full flex-col items-center justify-center gap-3 rounded-[12px] border-2 border-dashed border-[#9bb8f7] bg-[#f8fbff] text-[#1263F1] hover:bg-[#f2f7ff]"
                  >
                    <DocumentSearchButtonIcon className="h-8 w-8 opacity-70" />
                    <span className="text-[14px] font-semibold">
                      {scanFile ? scanFile.name : "Click to choose PDF or DOCX"}
                    </span>
                    {!scanFile && (
                      <span className="text-[12px] font-medium text-[#94a3b8]">
                        Max 10 MB · Sign in for full file analysis
                      </span>
                    )}
                  </button>
                </div>
              )}

              <input
                ref={fileRef}
                type="file"
                className="hidden"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(event) =>
                  setScanFile(event.target.files?.[0] ?? null)
                }
              />

              {/* Status bar */}
              <div className="flex items-center border-t border-[#d7dfed] bg-[#fbfcff] px-5 py-2.5">
                <span className="veriai-mono text-[12px] text-[#64748b]">
                  {scanText.trim() === ""
                    ? "0 words"
                    : `${scanText.trim().split(/\s+/).length} words · ${scanText.length} chars`}
                </span>
              </div>
            </div>

            {/* ── CTA strip ── */}
            <div className="mt-5 flex items-center justify-between rounded-[14px] border border-[#d7dfed] bg-white/80 px-6 py-4">
              <p className="text-[14px] text-[#52627a]">
                Free includes 3,000 daily credits. Premium is $10/month.
              </p>
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="veriai-pressable flex h-10 items-center gap-2 rounded-[9px] bg-[#1263F1] px-5 text-[14px] font-bold text-white shadow-[0_14px_28px_-18px_rgba(18,99,241,0.9)] hover:bg-[#0d54d5]"
              >
                <DocumentSearchButtonIcon className="h-4 w-4" />
                Get started free
              </button>
            </div>
          </div>
        </section>

        <section className="veriai-reveal border-y border-[#d7dfed] bg-[#fbfcff]/72 backdrop-blur">
          <div className="mx-auto grid max-w-[1320px] gap-4 px-5 py-14 sm:grid-cols-2 sm:px-6 lg:px-8">
            <FeatureTile
              title="Context-preserving input"
              text="Paste or upload sources with the document structure intact for accurate highlighting."
              icon={<ReaderIcon className="h-6 w-6" />}
            />
            <FeatureTile
              title="Layered model agreement"
              text="Scores, attribution, and confidence stay grouped so reviewers can explain decisions."
              icon={<LayeredDetectionIcon className="h-6 w-6" />}
            />
            <FeatureTile
              title="Evidence-first highlights"
              text="Passages are tagged by likelihood, making follow-up reviews deliberate and transparent."
              icon={<ResultsBarsIcon className="h-6 w-6" />}
            />
            <FeatureTile
              title="Reviewer-ready exports"
              text="Download reports with the verdict, rationale, and model signals included."
              icon={<DocumentSearchButtonIcon className="h-6 w-6" />}
            />
          </div>
        </section>

        <section className="veriai-reveal mx-auto grid max-w-[1320px] gap-8 px-5 py-14 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-stretch lg:px-8">
          <img
            src="/assets/generated/study-setting.png"
            alt="Quiet university study setting for academic writing review"
            className="veriai-ink-shadow h-full min-h-[420px] rounded-[18px] border border-[#cbd7ea] object-cover"
            draggable={false}
          />
          <div className="veriai-card-surface veriai-reveal rounded-[18px] p-6 sm:p-7">
            <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#64748b]">
              Institutional trust
            </p>
            <h2 className="veriai-display-font mt-4 text-[38px] font-semibold leading-[1.06] tracking-[-0.04em] text-[#0d1526]">
              Serious enough for a classroom showcase.
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {trustFeatures.map(({ title, text, icon: Icon }) => (
                <article
                  key={title}
                  className="rounded-[12px] border border-[#d7dfed] bg-[#f8fafc]/75 p-5"
                >
                  <Icon className="h-8 w-8 text-[#1f5cc4]" />
                  <h3 className="mt-4 text-[16px] font-semibold text-[#0d1526]">
                    {title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-6 text-[#40516d]">
                    {text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="plans"
          className="veriai-reveal border-y border-[#d7dfed] bg-[#fbfcff]/72 backdrop-blur"
        >
          <div className="mx-auto max-w-[1120px] px-5 py-16 sm:px-6 lg:px-8">
            <div className="max-w-[620px]">
              <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#64748b]">
                Plans
              </p>
              <h2 className="veriai-display-font mt-3 text-[38px] font-semibold leading-[1.06] tracking-[-0.04em] text-[#0d1526]">
                Start with text review, expand when the report needs more depth.
              </h2>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              <article className="flex flex-col rounded-[16px] border border-[#d7dfed] bg-white/86 p-8 shadow-[0_18px_46px_rgba(31,45,71,0.08)] min-h-[460px]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-[22px] font-semibold tracking-[-0.025em] text-[#0d1526]">
                      Free
                    </h3>
                    <p className="mt-2 text-[13px] font-medium leading-6 text-[#52627a]">
                      Best for quick checks and text-only review.
                    </p>
                  </div>
                  <span className="rounded-full border border-[#d7dfed] bg-[#f8fafc] px-3 py-1 text-[12px] font-bold text-[#52627a]">
                    Included
                  </span>
                </div>
                <div className="mt-6 flex items-end gap-2">
                  <strong className="veriai-display-font text-[42px] font-semibold leading-none tracking-[-0.04em] text-[#0d1526]">
                    3,000
                  </strong>
                  <span className="pb-1 text-[14px] font-semibold text-[#64748b]">
                    credits/day
                  </span>
                </div>
                <ul className="mt-6 grow space-y-2">
                  <PlanRow>Plain text input</PlanRow>
                  <PlanRow>1,000 words per scan</PlanRow>
                  <PlanRow>Layer 1 score and label</PlanRow>
                  <PlanRow muted>
                    PDF, DOCX, attribution, and full reports stay locked
                  </PlanRow>
                </ul>
              </article>

              <article className="flex flex-col rounded-[16px] border border-[#9bb8f7] bg-[#f8fbff] p-8 shadow-[0_22px_56px_rgba(31,92,196,0.14)] min-h-[460px]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-[22px] font-semibold tracking-[-0.025em] text-[#0d1526]">
                      Premium
                    </h3>
                    <p className="mt-2 text-[13px] font-medium leading-6 text-[#52627a]">
                      For full document evidence and unlimited review.
                    </p>
                  </div>
                  <span className="rounded-full bg-[#1263F1] px-3 py-1 text-[12px] font-bold text-white">
                    Full report
                  </span>
                </div>
                <div className="mt-6 flex items-end gap-2">
                  <strong className="veriai-display-font text-[42px] font-semibold leading-none tracking-[-0.04em] text-[#0d1526]">
                    $10
                  </strong>
                  <span className="pb-1 text-[14px] font-semibold text-[#64748b]">
                    per month
                  </span>
                </div>
                <ul className="mt-6 grow space-y-2">
                  <PlanRow>PDF, DOCX, and text input</PlanRow>
                  <PlanRow>Unlimited credits</PlanRow>
                  <PlanRow>Full three-layer ensemble</PlanRow>
                  <PlanRow>
                    Attribution, confidence, statistics, and report export
                  </PlanRow>
                </ul>
              </article>
            </div>
          </div>
        </section>

        <footer className="veriai-reveal bg-[#101828] px-5 py-10 text-white sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-[1320px] flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#4a6080]">
                VeriAI
              </p>
              <h2 className="veriai-display-font mt-3 text-[32px] font-semibold tracking-[-0.035em]">
                Detect AI-generated writing with evidence you can explain.
              </h2>
              <p className="mt-3 max-w-[44ch] text-[14px] leading-6 text-[#6b84a3]">
                Built for educators and reviewers who need more than a score.
              </p>
            </div>
            <button
              onClick={() => navigate("/signup")}
              className="veriai-pressable h-11 rounded-[9px] bg-white px-6 text-[15px] font-semibold text-[#0d1526] hover:bg-[#eaf2ff]"
            >
              Create account
            </button>
          </div>
          <div className="mx-auto mt-8 max-w-[1320px] border-t border-white/10 pt-6 text-[12px] font-semibold text-[#9bb8f7]">
            © 2026 VeriAI. All rights reserved.
          </div>
        </footer>
      </main>
    </div>
  );
}
