import { useEffect, useMemo, useRef, useState } from "react";
import {
  DownloadIcon,
  FontBoldIcon,
  FontItalicIcon,
  ListBulletIcon,
  ResetIcon,
  TextAlignCenterIcon,
  TextAlignLeftIcon,
  TextAlignRightIcon,
  TrashIcon,
  UploadIcon,
} from "@radix-ui/react-icons";
import { DocumentSearchButtonIcon } from "./DesignIcons";

export type AnalyzePayload =
  | { mode: "text"; text: string }
  | { mode: "file"; file: File };

interface InputPanelProps {
  onAnalyze: (payload: AnalyzePayload) => void | Promise<void>;
  onDraftChange?: () => void;
  documentTitle?: string;
  isAnalyzing: boolean;
  errorMessage?: string | null;
  userPlan?: string | null;
  dailyCreditsRemaining?: number | null;
  textWordLimit?: number | null;
  premiumMonthlyPriceUsd?: number;
  resetKey?: number;
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function countWords(value: string): number {
  return value.trim() ? value.trim().split(/\s+/).length : 0;
}

function toExportFilename(title: string | undefined): string {
  const normalized = (title ?? "untitled-scan")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return `${normalized || "untitled-scan"}.txt`;
}

function ToolbarButton({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="veriai-icon-button flex h-9 w-9 items-center justify-center rounded-[7px] text-[#274169] hover:bg-[#eef3f9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
    >
      {children}
    </button>
  );
}

export function InputPanel({
  onAnalyze,
  onDraftChange,
  documentTitle,
  isAnalyzing,
  errorMessage = null,
  userPlan = null,
  dailyCreditsRemaining = null,
  textWordLimit = null,
  premiumMonthlyPriceUsd = 10,
  resetKey = 0,
}: InputPanelProps) {
  const [mode, setMode] = useState<"text" | "file">("text");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [statusExpanded, setStatusExpanded] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);
  const wordCount = useMemo(() => countWords(text), [text]);
  const characterCount = text.length;
  const isPro = userPlan?.toUpperCase() === "PRO";
  const exceedsFreeWordLimit = !isPro && textWordLimit != null && wordCount > textWordLimit;
  const exceedsFreeCredits = !isPro && dailyCreditsRemaining != null && wordCount > dailyCreditsRemaining;
  const canSubmitText =
    mode === "text" &&
    text.trim().length > 0 &&
    !exceedsFreeWordLimit &&
    !exceedsFreeCredits;
  const canSubmitFile = mode === "file" && Boolean(file) && isPro;
  const canExportDraft = mode === "text" && text.trim().length > 0;

  useEffect(() => {
    if (resetKey === 0) return;

    setMode("text");
    setText("");
    setFile(null);
    setLocalError(null);
    setStatusExpanded(true);
  }, [resetKey]);

  const selectFile = (selectedFile: File | null) => {
    setLocalError(null);

    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      setFile(null);
      setLocalError("Files must be 10MB or smaller.");
      return;
    }

    setFile(selectedFile);
    setMode("file");
    onDraftChange?.();
  };

  const submit = () => {
    setLocalError(null);

    if (mode === "file") {
      if (!isPro) {
        setLocalError(`PDF and DOCX uploads are available on Premium ($${premiumMonthlyPriceUsd}/month).`);
        return;
      }

      if (file) void onAnalyze({ mode: "file", file });
      return;
    }

    if (exceedsFreeWordLimit) {
      setLocalError(`Free text scans are limited to ${textWordLimit?.toLocaleString()} words.`);
      return;
    }

    if (exceedsFreeCredits) {
      setLocalError(`This scan needs ${wordCount.toLocaleString()} credits, but you have ${dailyCreditsRemaining?.toLocaleString()} left today.`);
      return;
    }

    if (text.trim()) void onAnalyze({ mode: "text", text: text.trim() });
  };

  const exportDraft = () => {
    const draft = text.trim();
    if (!draft) return;

    const blob = new Blob([draft], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = toExportFilename(documentTitle);
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[14px] border border-[#d7dfed] bg-[#eef3f8]">
      <div className="flex h-[72px] shrink-0 flex-wrap items-center justify-between gap-4 border-b border-[#d7dfed] bg-[#fbfcff] px-[26px]">
        <div className="flex h-full items-end gap-8" role="tablist" aria-label="Analysis input mode">

          <button
            type="button"
            role="tab"
            aria-selected={mode === "text"}
            onClick={() => {
              setMode("text");
              setLocalError(null);
            }}
            className={`veriai-pressable flex h-full items-center gap-3 border-b-2 px-0 pt-1 text-[15px] font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] ${
              mode === "text" ? "border-[#2563EB] text-[#2563EB]" : "border-transparent text-[#52627a] hover:text-[#0d1526]"
            }`}
          >
            <ListBulletIcon className="h-5 w-5" />
            Text input
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={mode === "file"}
            onClick={() => {
              setMode("file");
              setLocalError(null);
            }}
            className={`veriai-pressable flex h-full items-center gap-3 border-b-2 px-0 pt-1 text-[15px] font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] ${
              mode === "file" ? "border-[#2563EB] text-[#2563EB]" : "border-transparent text-[#52627a] hover:text-[#0d1526]"
            }`}
          >
            <UploadIcon className="h-5 w-5" />
            Upload file
          </button>
        </div>

        <button
          type="button"
          onClick={submit}
          disabled={isAnalyzing || (!canSubmitText && !canSubmitFile)}
          className="veriai-pressable flex h-11 min-w-[154px] items-center justify-center gap-3 rounded-[8px] bg-[#1263F1] px-5 text-[15px] font-bold text-white shadow-[0_14px_28px_-18px_rgba(18,99,241,0.95)] hover:bg-[#0d54d5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <DocumentSearchButtonIcon className="h-5 w-5" />
          {isAnalyzing ? "Analyzing..." : mode === "file" ? "Analyze file" : "Analyze text"}
        </button>
      </div>

      {mode === "text" ? (

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
          <div className="flex min-h-[52px] shrink-0 items-center border-b border-[#d7dfed] bg-white px-5">
            <div className="flex flex-wrap items-center gap-1.5">
              <button type="button" className="veriai-pressable flex h-9 items-center gap-5 rounded-[7px] px-2.5 text-[14px] font-semibold text-[#274169] hover:bg-[#eef3f9]">
                Paragraph <span className="text-[#64748b]">⌄</span>
              </button>
              <div className="mx-1.5 h-8 w-px bg-[#d7dfed]" />
              <ToolbarButton label="Bold"><FontBoldIcon className="h-4 w-4" /></ToolbarButton>
              <ToolbarButton label="Italic"><FontItalicIcon className="h-4 w-4" /></ToolbarButton>
              <ToolbarButton label="Underline"><span className="text-[16px] font-bold underline">U</span></ToolbarButton>
              <div className="mx-1.5 h-8 w-px bg-[#d7dfed]" />
              <ToolbarButton label="Bulleted list"><ListBulletIcon className="h-4 w-4" /></ToolbarButton>
              <ToolbarButton label="Numbered list"><ListBulletIcon className="h-4 w-4" /></ToolbarButton>
              <div className="mx-1.5 h-8 w-px bg-[#d7dfed]" />
              <ToolbarButton label="Align left"><TextAlignLeftIcon className="h-4 w-4" /></ToolbarButton>
              <ToolbarButton label="Align center"><TextAlignCenterIcon className="h-4 w-4" /></ToolbarButton>
              <ToolbarButton label="Align right"><TextAlignRightIcon className="h-4 w-4" /></ToolbarButton>
              <div className="mx-1.5 h-8 w-px bg-[#d7dfed]" />
              <ToolbarButton label="Undo"><ResetIcon className="h-4 w-4" /></ToolbarButton>
              <ToolbarButton label="Redo"><ResetIcon className="h-4 w-4 scale-x-[-1]" /></ToolbarButton>
            </div>
          </div>

          <div className="relative min-h-0 flex-1 bg-white">
            <div className="h-full overflow-y-auto bg-white">
              <div className="relative min-h-[1180px] w-full bg-white">
                <label className="sr-only" htmlFor="analysis-text">Text to analyze</label>
                <textarea
                  id="analysis-text"
                  value={text}
                  onChange={(event) => {
                    setText(event.target.value);
                    setLocalError(null);
                    onDraftChange?.();
                  }}
                  className="veriai-document-font min-h-[1180px] w-full resize-none bg-transparent px-[14%] py-[68px] text-[20px] font-medium leading-[1.82] tracking-[-0.012em] text-[#07112f] outline-none placeholder:text-[#94a3b8] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#2563EB]"
                  placeholder="Paste academic text here..."
                  spellCheck={true}
                  disabled={isAnalyzing}
                />
              </div>
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex justify-end px-4">
              <div
                className={`pointer-events-auto flex h-10 items-center justify-end overflow-hidden rounded-full border border-[#cbd7e8]/85 bg-white/78 text-[12px] font-semibold text-[#274169] shadow-[0_12px_34px_rgba(31,45,71,0.13)] backdrop-blur-md transition-[max-width,opacity] duration-200 ${
                  statusExpanded ? "max-w-[620px] pl-4" : "max-w-10"
                }`}
                aria-label="Document status"
              >
                <div className={`flex min-w-0 items-center gap-2 whitespace-nowrap pr-3 text-[12px] font-semibold ${statusExpanded ? "opacity-100" : "opacity-0"}`}>
                  <span className="inline-flex h-7 items-center gap-1.5 rounded-full px-2 text-[#274169]" title="Words" aria-label={`${wordCount.toLocaleString()} words`}>
                    <ListBulletIcon className="h-3.5 w-3.5 text-[#64748b]" />
                    <span>
                      {wordCount.toLocaleString()}
                      {!isPro && textWordLimit ? ` / ${textWordLimit.toLocaleString()}` : ""}
                    </span>
                  </span>
                  <span className="inline-flex h-7 items-center gap-1.5 rounded-full px-2 text-[#274169]" title="Characters" aria-label={`${characterCount.toLocaleString()} characters`}>
                    <span className="text-[12px] font-semibold text-[#64748b]">#</span>
                    <span>{characterCount.toLocaleString()}</span>
                  </span>
                  <span className="mx-1 h-5 w-px bg-[#cbd7e8]" aria-hidden="true" />
                  <button
                    type="button"
                    onClick={exportDraft}
                    disabled={!canExportDraft || isAnalyzing}
                    className="inline-flex h-7 items-center gap-1.5 rounded-full px-2 text-[12px] font-semibold text-[#274169] hover:bg-[#eef3f9] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-transparent"
                    aria-label="Export draft"
                    title="Export draft"
                  >
                    <DownloadIcon className="h-3.5 w-3.5" />
                    Export
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setText("");
                      setFile(null);
                      setLocalError(null);
                      onDraftChange?.();
                    }}
                    disabled={isAnalyzing}
                    className="inline-flex h-7 items-center gap-1.5 rounded-full px-2 text-[12px] font-semibold text-[#274169] hover:bg-[#eef3f9] disabled:opacity-60"
                    aria-label="Clear text"
                    title="Clear text"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                    Clear
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setStatusExpanded((value) => !value)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[18px] font-bold text-[#274169] hover:bg-[#eef3f9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
                  aria-label={statusExpanded ? "Hide document status" : "Show document status"}
                  title={statusExpanded ? "Hide status" : "Show status"}
                >
                  {statusExpanded ? "›" : "‹"}
                </button>
              </div>
            </div>
          </div>

        </div>

      ) : (

        <div className="p-6">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={!isPro || isAnalyzing}
            className="veriai-pressable flex min-h-[420px] w-full flex-col items-center justify-center rounded-[12px] border border-dashed border-[#9bb8f7] bg-[#f8fbff] px-8 text-center hover:bg-[#f2f7ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] disabled:cursor-not-allowed disabled:opacity-70"
          >
            <UploadIcon className="h-11 w-11 text-[#1263F1]" />
            <span className="mt-5 max-w-full">
              <span className="block truncate text-[20px] font-semibold tracking-[-0.02em] text-[#0d1526]">
                {file ? file.name : isPro ? "Drop a PDF or DOCX here" : "File upload requires Premium"}
              </span>
              <span className="mt-3 block text-[14px] leading-6 text-[#52627a]">
                {file ? formatFileSize(file.size) : isPro ? "Click anywhere in this area to choose a document. Up to 10MB." : `Premium ($${premiumMonthlyPriceUsd}/month) unlocks PDF and DOCX analysis. Text analysis is still available.`}
              </span>
            </span>
          </button>
        </div>

      )}

      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        onChange={(event) => selectFile(event.target.files?.[0] ?? null)}
        disabled={!isPro || isAnalyzing}
      />

      {(localError || errorMessage) && (
        <p role="alert" className="mx-5 mb-5 rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-bold text-red-700">
          {localError || errorMessage}
        </p>
      )}
    </div>
  );
}
