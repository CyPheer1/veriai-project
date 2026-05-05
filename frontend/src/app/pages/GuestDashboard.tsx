import { useEffect } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router";
import {
    ArrowRightIcon,
    CheckCircledIcon,
    LockClosedIcon,
    ReaderIcon,
    UploadIcon,
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
import { useApp } from "../context/AppContext";

const coreFeatures = [
    {
        title: "Paste your text",
        text: "Simply paste your content and get an instant AI detection analysis with confidence score.",
        icon: <ReaderIcon className="h-6 w-6" />,
    },
    {
        title: "Upload PDF or DOCX",
        text: "Upload academic papers, essays, or reports and analyze full documents in seconds.",
        icon: <UploadIcon className="h-6 w-6" />,
    },
    {
        title: "Layered detection",
        text: "Our multi-model approach analyzes patterns across leading AI models for more accurate results.",
        icon: <LayeredDetectionIcon className="h-7 w-7" />,
    },
];

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
        text: "See detailed highlights and model-level insights.",
        icon: ResultsBarsIcon,
    },
    {
        title: "Institutional ready",
        text: "FERPA-aligned and secure for campus-wide use.",
        icon: LockLineIcon,
    },
];

function FeatureTile({ title, text, icon, large = false }: { title: string; text: string; icon: ReactNode; large?: boolean }) {
    return (
        <article className={`veriai-card-surface veriai-hover-lift rounded-[16px] p-6 ${large ? "md:col-span-2" : ""}`}>
            <div className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-[#e7eef8] text-[#1f5cc4]">
                {icon}
            </div>
            <h3 className="mt-5 text-[20px] font-semibold tracking-[-0.02em] text-[#0d1526]">{title}</h3>
            <p className="mt-3 max-w-[42ch] text-[14px] leading-6 text-[#40516d]">{text}</p>
        </article>
    );
}

function HighlightPreview() {
    return (
        <div className="veriai-card-surface rounded-[14px] p-4 backdrop-blur">
            <div className="mb-4 flex items-center justify-between border-b border-[#e4eaf3] pb-3">
                <span className="text-[12px] font-bold text-[#40516d]">academic-integrity-review.txt</span>
                <span className="veriai-mono rounded-[6px] bg-[#fff4dd] px-2.5 py-1 text-[11px] font-bold text-[#6d4a00]">92%</span>
            </div>
            <p className="veriai-document-font text-[15px] font-medium leading-8 text-[#172033]">
                The growth of artificial intelligence has changed how students draft and revise work.
                <mark className="mx-1 rounded-[5px] bg-[#dff4e7] px-1.5 py-0.5 text-[#17633f]">Human revisions still show local uncertainty</mark>
                while some passages use
                <mark className="mx-1 rounded-[5px] bg-[#fff1d3] px-1.5 py-0.5 text-[#8a5200]">repeated transitional structure</mark>
                and
                <mark className="mx-1 rounded-[5px] bg-[#ffdfe4] px-1.5 py-0.5 text-[#991b2c]">uniformly polished claims with low specificity</mark>.
            </p>
            <div className="mt-5 grid grid-cols-3 gap-2 text-[11px] font-semibold text-[#40516d]">
                <span className="rounded-[8px] bg-[#f6f8fc] px-3 py-2">Human-like</span>
                <span className="rounded-[8px] bg-[#f6f8fc] px-3 py-2">Uncertain</span>
                <span className="rounded-[8px] bg-[#f6f8fc] px-3 py-2">AI-like</span>
            </div>
        </div>
    );
}

export function GuestDashboard() {
    const { isLoggedIn } = useApp();
    const navigate = useNavigate();

    useEffect(() => {
        if (isLoggedIn) navigate("/dashboard");
    }, [isLoggedIn, navigate]);

    return (
        <div className="veriai-academic-bg min-h-screen">
            <Header variant="landing" />

            <main>
                <section className="veriai-reveal mx-auto grid max-w-[1320px] gap-10 px-5 pb-14 pt-8 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:px-8">
                    <div className="max-w-[680px]">
                        <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#667892]">Academic AI evidence review</p>
                        <h1 className="veriai-display-font mt-4 text-[46px] font-semibold leading-[0.98] tracking-[-0.045em] text-[#0d1526] text-balance md:text-[66px]">
                            Verify writing without losing the document context.
                        </h1>
                        <p className="mt-4 max-w-[56ch] text-[16px] leading-7 text-[#40516d]">
                            VeriAI brings paste, upload, probability scoring, model attribution, and passage highlights into one clean academic workflow.
                        </p>

                        <div className="veriai-stagger mt-7 flex flex-wrap gap-3">
                            <button
                                onClick={() => navigate("/signup")}
                                className="veriai-pressable flex h-11 items-center gap-3 rounded-[9px] bg-[#1f5cc4] px-5 text-[15px] font-semibold text-white shadow-[0_14px_28px_-18px_rgba(31,92,196,0.95)] hover:bg-[#174ca8]"
                            >
                                <DocumentSearchButtonIcon className="h-5 w-5" /> Start review
                            </button>
                            <button
                                onClick={() => document.getElementById("workflow")?.scrollIntoView({ behavior: "smooth" })}
                                className="veriai-pressable flex h-11 items-center gap-3 rounded-[9px] border border-[#cbd7ea] bg-white/80 px-5 text-[15px] font-semibold text-[#172033] hover:bg-white"
                            >
                                See workflow <ArrowRightIcon className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="veriai-card-surface veriai-reveal mt-7 grid max-w-[500px] grid-cols-3 overflow-hidden rounded-[12px] text-center">
                            <div className="px-3 py-4">
                                <strong className="veriai-mono block text-[21px] text-[#0d1526]">3</strong>
                                <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#64748b]">Free scans</span>
                            </div>
                            <div className="border-l border-[#d7dfed] px-3 py-4">
                                <strong className="veriai-mono block text-[21px] text-[#0d1526]">4</strong>
                                <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#64748b]">Model layers</span>
                            </div>
                            <div className="border-l border-[#d7dfed] px-3 py-4">
                                <strong className="veriai-mono block text-[21px] text-[#0d1526]">0</strong>
                                <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#64748b]">Stored files</span>
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

                <section id="workflow" className="veriai-reveal border-y border-[#d7dfed] bg-[#fbfcff]/72 backdrop-blur">
                    <div className="mx-auto grid max-w-[1320px] gap-10 px-5 py-14 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:px-8">
                        <div>
                            <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#64748b]">The review flow</p>
                            <h2 className="veriai-display-font mt-4 max-w-[620px] text-[40px] font-semibold leading-[1.05] tracking-[-0.04em] text-[#0d1526] text-balance">
                                Built around the source document, not a detached score.
                            </h2>
                            <div className="mt-8 space-y-5">
                                {["Paste or upload the draft", "Run layered model analysis", "Read highlighted evidence beside the result"].map((item, index) => (
                                    <div key={item} className="flex items-center gap-4">
                                        <span className="veriai-mono flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#e7eef8] text-[12px] font-bold text-[#1f5cc4]">{index + 1}</span>
                                        <span className="text-[16px] font-semibold text-[#172033]">{item}</span>
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

                <section className="veriai-reveal mx-auto max-w-[1320px] px-5 py-14 sm:px-6 lg:px-8">
                    <div className="veriai-stagger grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {coreFeatures.map((feature, index) => (
                            <FeatureTile key={feature.title} {...feature} large={index === 0} />
                        ))}
                    </div>
                </section>

                <section className="veriai-reveal mx-auto grid max-w-[1320px] gap-8 px-5 pb-14 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-stretch lg:px-8">
                    <img
                        src="/assets/generated/study-setting.png"
                        alt="Quiet university study setting for academic writing review"
                        className="veriai-ink-shadow h-full min-h-[420px] rounded-[18px] border border-[#cbd7ea] object-cover"
                        draggable={false}
                    />
                    <div className="veriai-card-surface veriai-reveal rounded-[18px] p-6 sm:p-7">
                        <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#64748b]">Institutional trust</p>
                        <h2 className="veriai-display-font mt-4 text-[38px] font-semibold leading-[1.06] tracking-[-0.04em] text-[#0d1526]">
                            Serious enough for a classroom showcase.
                        </h2>
                        <div className="mt-8 grid gap-4 sm:grid-cols-2">
                            {trustFeatures.map(({ title, text, icon: Icon }) => (
                                <article key={title} className="rounded-[12px] border border-[#d7dfed] bg-[#f8fafc]/75 p-5">
                                    <Icon className="h-8 w-8 text-[#1f5cc4]" />
                                    <h3 className="mt-4 text-[16px] font-semibold text-[#0d1526]">{title}</h3>
                                    <p className="mt-2 text-[13px] leading-6 text-[#40516d]">{text}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="veriai-reveal bg-[#101828] px-5 py-10 text-white sm:px-6 lg:px-8">
                    <div className="mx-auto flex max-w-[1320px] flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="flex items-center gap-2 text-[13px] font-bold text-[#9bb8f7]"><CheckCircledIcon className="h-4 w-4" /> Frontend ready for the existing backend</p>
                            <h2 className="veriai-display-font mt-3 text-[32px] font-semibold tracking-[-0.035em]">Start with a scan, then review the evidence.</h2>
                        </div>
                        <button
                            onClick={() => navigate("/signup")}
                            className="veriai-pressable h-11 rounded-[9px] bg-white px-6 text-[15px] font-semibold text-[#0d1526] hover:bg-[#eaf2ff]"
                        >
                            Create account
                        </button>
                    </div>
                </section>
            </main>
        </div>
    );
}
