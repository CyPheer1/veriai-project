import { useEffect, useMemo, useRef, useState, useCallback } from "react";
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
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
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
  onUpgrade?: () => void;
  isUpgrading?: boolean;
  resetKey?: number;
  /** When provided, applies sentence-level colour highlights directly in the editor */
  highlightSegments?: { text: string; isAI: boolean }[];
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const AI_HIGHLIGHT_COLOR = "#fee2e2";
const HUMAN_HIGHLIGHT_COLOR = "#dcfce7";

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

function ToolbarButton({
  children,
  label,
  onClick,
  isActive = false,
  disabled = false,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={isActive}
      onClick={onClick}
      disabled={disabled}
      className={`veriai-icon-button flex h-9 w-9 items-center justify-center rounded-[7px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] disabled:cursor-not-allowed disabled:opacity-40 ${
        isActive
          ? "bg-[#edf4ff] text-[#1263F1]"
          : "text-[#274169] hover:bg-[#eef3f9]"
      }`}
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
  onUpgrade,
  isUpgrading = false,
  resetKey = 0,
  highlightSegments,
}: InputPanelProps) {
  const [mode, setMode] = useState<"text" | "file">("text");
  const [file, setFile] = useState<File | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [statusExpanded, setStatusExpanded] = useState(true);
  const [plainText, setPlainText] = useState("");
  const [isHighlightMode, setIsHighlightMode] = useState(false);
  const isHighlightModeRef = useRef(false);
  const [, forceUpdate] = useState(0);
  const [showParagraphMenu, setShowParagraphMenu] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const paragraphMenuRef = useRef<HTMLDivElement>(null);

  const triggerUpdate = useCallback(() => forceUpdate((n) => n + 1), []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ history: true }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: "Paste academic text here..." }),
      Highlight.configure({ multicolor: true }),
    ],
    editorProps: {
      attributes: {
        class:
          "veriai-document-font min-h-[1180px] w-full px-[14%] py-[68px] text-[20px] font-medium leading-[1.82] tracking-[-0.012em] text-[#07112f] outline-none focus:outline-none",
        spellcheck: "true",
      },
    },
    onUpdate: ({ editor: e }) => {
      if (!isHighlightModeRef.current) {
        setPlainText(e.getText());
        onDraftChange?.();
      }
      setLocalError(null);
    },
    onSelectionUpdate: triggerUpdate,
    onTransaction: triggerUpdate,
  });

  // Close paragraph menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        paragraphMenuRef.current &&
        !paragraphMenuRef.current.contains(e.target as Node)
      ) {
        setShowParagraphMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Sync editable with isAnalyzing AND highlight mode
  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!isAnalyzing && !isHighlightMode);
  }, [isAnalyzing, isHighlightMode, editor]);

  // Apply highlight segments into the editor
  useEffect(() => {
    if (!editor) return;

    if (!highlightSegments || highlightSegments.length === 0) {
      // If we were in highlight mode and segments cleared → exit
      if (isHighlightMode) {
        editor.commands.clearContent();
        editor.setEditable(true);
        isHighlightModeRef.current = false;
        setIsHighlightMode(false);
        setPlainText("");
      }
      return;
    }

    // Build Tiptap JSON doc with highlight marks
    const inlineNodes: object[] = [];
    highlightSegments.forEach((seg, i) => {
      inlineNodes.push({
        type: "text",
        marks: [
          {
            type: "highlight",
            attrs: {
              color: seg.isAI ? AI_HIGHLIGHT_COLOR : HUMAN_HIGHLIGHT_COLOR,
            },
          },
        ],
        text: seg.text,
      });
      if (i < highlightSegments.length - 1) {
        inlineNodes.push({ type: "text", text: " " });
      }
    });

    isHighlightModeRef.current = true;
    editor.commands.setContent({
      type: "doc",
      content: [{ type: "paragraph", content: inlineNodes }],
    });

    setIsHighlightMode(true);
  }, [highlightSegments, editor]);

  // Reset editor when resetKey changes
  useEffect(() => {
    if (resetKey === 0 || !editor) return;
    editor.commands.clearContent();
    editor.setEditable(true);
    isHighlightModeRef.current = false;
    setIsHighlightMode(false);
    setMode("text");
    setFile(null);
    setLocalError(null);
    setPlainText("");
    setStatusExpanded(true);
  }, [resetKey, editor]);

  const wordCount = useMemo(() => countWords(plainText), [plainText]);
  const characterCount = plainText.length;

  const isPro = userPlan?.toUpperCase() === "PRO";
  const exceedsFreeWordLimit =
    !isPro && textWordLimit != null && wordCount > textWordLimit;
  const exceedsFreeCredits =
    !isPro &&
    dailyCreditsRemaining != null &&
    wordCount > dailyCreditsRemaining;
  const canSubmitText =
    mode === "text" &&
    !isHighlightMode &&
    plainText.trim().length > 0 &&
    !exceedsFreeWordLimit &&
    !exceedsFreeCredits;
  const canSubmitFile = mode === "file" && Boolean(file) && isPro;
  const canExportDraft =
    mode === "text" && !isHighlightMode && plainText.trim().length > 0;

  const handleExitHighlight = () => {
    if (!editor) return;
    editor.commands.clearContent();
    editor.setEditable(true);
    isHighlightModeRef.current = false;
    setIsHighlightMode(false);
    setPlainText("");
    onDraftChange?.();
  };

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
        setLocalError(
          `PDF and DOCX uploads are available on Premium ($${premiumMonthlyPriceUsd}/month).`,
        );
        return;
      }
      if (file) void onAnalyze({ mode: "file", file });
      return;
    }

    if (exceedsFreeWordLimit) {
      setLocalError(
        `Free text scans are limited to ${textWordLimit?.toLocaleString()} words.`,
      );
      return;
    }

    if (exceedsFreeCredits) {
      setLocalError(
        `This scan needs ${wordCount.toLocaleString()} credits, but you have ${dailyCreditsRemaining?.toLocaleString()} left today.`,
      );
      return;
    }

    if (plainText.trim())
      void onAnalyze({ mode: "text", text: plainText.trim() });
  };

  const exportDraft = () => {
    const draft = plainText.trim();
    if (!draft) return;
    const blob = new Blob([draft], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = toExportFilename(documentTitle);
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const toolbarDisabled = isAnalyzing || !editor || isHighlightMode;

  const currentBlockLabel = editor?.isActive("heading", { level: 1 })
    ? "Heading 1"
    : editor?.isActive("heading", { level: 2 })
      ? "Heading 2"
      : editor?.isActive("heading", { level: 3 })
        ? "Heading 3"
        : "Paragraph";

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[14px] border border-[#d7dfed] bg-[#eef3f8]">
      {/* Top bar: tabs + analyze button */}
      <div className="flex h-[72px] shrink-0 flex-wrap items-center justify-between gap-4 border-b border-[#d7dfed] bg-[#fbfcff] px-[26px]">
        <div
          className="flex h-full items-end gap-8"
          role="tablist"
          aria-label="Analysis input mode"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === "text"}
            onClick={() => {
              setMode("text");
              setLocalError(null);
            }}
            className={`veriai-pressable flex h-full items-center gap-3 border-b-2 px-0 pt-1 text-[15px] font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] ${
              mode === "text"
                ? "border-[#2563EB] text-[#2563EB]"
                : "border-transparent text-[#52627a] hover:text-[#0d1526]"
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
              mode === "file"
                ? "border-[#2563EB] text-[#2563EB]"
                : "border-transparent text-[#52627a] hover:text-[#0d1526]"
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
          {isAnalyzing
            ? "Analyzing..."
            : mode === "file"
              ? "Analyze file"
              : "Analyze text"}
        </button>
      </div>

      {mode === "text" ? (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
          {/* Highlight mode: legend bar */}
          {isHighlightMode ? (
            <div className="flex shrink-0 items-center justify-between border-b border-[#d7dfed] bg-white px-5 py-2">
              <div className="flex items-center gap-5 text-[12px] font-semibold">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span className="text-[#17633f]">Human-written</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <span className="text-[#b32635]">AI-generated</span>
                </span>
              </div>
              <button
                type="button"
                onClick={handleExitHighlight}
                className="veriai-pressable flex items-center gap-1.5 rounded-[7px] px-2.5 py-1.5 text-[12px] font-semibold text-[#274169] hover:bg-[#eef3f9]"
              >
                ↩ Edit text
              </button>
            </div>
          ) : (
            /* Normal toolbar */
            <div className="flex min-h-[52px] shrink-0 items-center border-b border-[#d7dfed] bg-white px-5">
              <div className="flex flex-wrap items-center gap-1.5">
                {/* Paragraph / Heading dropdown */}
                <div ref={paragraphMenuRef} className="relative">
                  <button
                    type="button"
                    disabled={toolbarDisabled}
                    onClick={() => setShowParagraphMenu((v) => !v)}
                    className="veriai-pressable flex h-9 items-center gap-2 rounded-[7px] px-2.5 text-[14px] font-semibold text-[#274169] hover:bg-[#eef3f9] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {currentBlockLabel}{" "}
                    <span className="text-[#64748b]">⌄</span>
                  </button>
                  {showParagraphMenu && (
                    <div className="absolute left-0 top-full z-30 mt-1 w-36 overflow-hidden rounded-[10px] border border-[#d7dfed] bg-white shadow-[0_8px_24px_rgba(31,45,71,0.12)]">
                      {(
                        [
                          {
                            label: "Paragraph",
                            action: () =>
                              editor?.chain().focus().setParagraph().run(),
                          },
                          {
                            label: "Heading 1",
                            action: () =>
                              editor
                                ?.chain()
                                .focus()
                                .toggleHeading({ level: 1 })
                                .run(),
                          },
                          {
                            label: "Heading 2",
                            action: () =>
                              editor
                                ?.chain()
                                .focus()
                                .toggleHeading({ level: 2 })
                                .run(),
                          },
                          {
                            label: "Heading 3",
                            action: () =>
                              editor
                                ?.chain()
                                .focus()
                                .toggleHeading({ level: 3 })
                                .run(),
                          },
                        ] as { label: string; action: () => void }[]
                      ).map((opt) => (
                        <button
                          key={opt.label}
                          type="button"
                          onClick={() => {
                            opt.action();
                            setShowParagraphMenu(false);
                          }}
                          className={`w-full px-3 py-2 text-left text-[13px] font-semibold hover:bg-[#f0f4fb] ${
                            currentBlockLabel === opt.label
                              ? "text-[#1263F1]"
                              : "text-[#274169]"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mx-1.5 h-8 w-px bg-[#d7dfed]" />

                <ToolbarButton
                  label="Bold"
                  onClick={() => editor?.chain().focus().toggleBold().run()}
                  isActive={editor?.isActive("bold") ?? false}
                  disabled={toolbarDisabled}
                >
                  <FontBoldIcon className="h-4 w-4" />
                </ToolbarButton>

                <ToolbarButton
                  label="Italic"
                  onClick={() => editor?.chain().focus().toggleItalic().run()}
                  isActive={editor?.isActive("italic") ?? false}
                  disabled={toolbarDisabled}
                >
                  <FontItalicIcon className="h-4 w-4" />
                </ToolbarButton>

                <ToolbarButton
                  label="Underline"
                  onClick={() =>
                    editor?.chain().focus().toggleUnderline().run()
                  }
                  isActive={editor?.isActive("underline") ?? false}
                  disabled={toolbarDisabled}
                >
                  <span className="text-[15px] font-bold underline">U</span>
                </ToolbarButton>

                <div className="mx-1.5 h-8 w-px bg-[#d7dfed]" />

                <ToolbarButton
                  label="Bullet list"
                  onClick={() =>
                    editor?.chain().focus().toggleBulletList().run()
                  }
                  isActive={editor?.isActive("bulletList") ?? false}
                  disabled={toolbarDisabled}
                >
                  <ListBulletIcon className="h-4 w-4" />
                </ToolbarButton>

                <ToolbarButton
                  label="Ordered list"
                  onClick={() =>
                    editor?.chain().focus().toggleOrderedList().run()
                  }
                  isActive={editor?.isActive("orderedList") ?? false}
                  disabled={toolbarDisabled}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                  >
                    <path d="M2 2h1v3H2V3H1V2h1zm0 5h1.5a.5.5 0 0 1 0 1H2v.5h1.5a.5.5 0 0 1 0 1H2v1h2v1H1v-2a1 1 0 0 1 1-1V8a1 1 0 0 1-1-1V6h2v1H2zm0 5h1v.5H2v1h1V14H1v-1h1v-.5H1v-1h2v1H2zM5 3.5a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 0 1h-8a.5.5 0 0 1-.5-.5zm0 5a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 0 1h-8A.5.5 0 0 1 5 8.5zm0 5a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 0 1h-8a.5.5 0 0 1-.5-.5z" />
                  </svg>
                </ToolbarButton>

                <div className="mx-1.5 h-8 w-px bg-[#d7dfed]" />

                <ToolbarButton
                  label="Align left"
                  onClick={() =>
                    editor?.chain().focus().setTextAlign("left").run()
                  }
                  isActive={editor?.isActive({ textAlign: "left" }) ?? false}
                  disabled={toolbarDisabled}
                >
                  <TextAlignLeftIcon className="h-4 w-4" />
                </ToolbarButton>

                <ToolbarButton
                  label="Align center"
                  onClick={() =>
                    editor?.chain().focus().setTextAlign("center").run()
                  }
                  isActive={editor?.isActive({ textAlign: "center" }) ?? false}
                  disabled={toolbarDisabled}
                >
                  <TextAlignCenterIcon className="h-4 w-4" />
                </ToolbarButton>

                <ToolbarButton
                  label="Align right"
                  onClick={() =>
                    editor?.chain().focus().setTextAlign("right").run()
                  }
                  isActive={editor?.isActive({ textAlign: "right" }) ?? false}
                  disabled={toolbarDisabled}
                >
                  <TextAlignRightIcon className="h-4 w-4" />
                </ToolbarButton>

                <div className="mx-1.5 h-8 w-px bg-[#d7dfed]" />

                <ToolbarButton
                  label="Undo"
                  onClick={() => editor?.chain().focus().undo().run()}
                  disabled={toolbarDisabled || !editor?.can().undo()}
                >
                  <ResetIcon className="h-4 w-4" />
                </ToolbarButton>

                <ToolbarButton
                  label="Redo"
                  onClick={() => editor?.chain().focus().redo().run()}
                  disabled={toolbarDisabled || !editor?.can().redo()}
                >
                  <ResetIcon className="h-4 w-4 scale-x-[-1]" />
                </ToolbarButton>
              </div>
            </div>
          )}

          {/* Editor area — always present; Tiptap content shows highlights when in highlight mode */}
          <div className="veriai-rich-editor relative min-h-0 flex-1 bg-white">
            <div className="h-full overflow-y-auto bg-white">
              <EditorContent editor={editor} />
            </div>

            {/* Floating status bar (hidden in highlight mode) */}
            {!isHighlightMode && (
              <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex justify-end px-4">
                <div
                  className={`pointer-events-auto flex h-10 items-center justify-end overflow-hidden rounded-full border border-[#cbd7e8]/85 bg-white/78 text-[12px] font-semibold text-[#274169] shadow-[0_12px_34px_rgba(31,45,71,0.13)] backdrop-blur-md transition-[max-width,opacity] duration-200 ${
                    statusExpanded ? "max-w-[620px] pl-4" : "max-w-10"
                  }`}
                  aria-label="Document status"
                >
                  <div
                    className={`flex min-w-0 items-center gap-2 whitespace-nowrap pr-3 text-[12px] font-semibold ${statusExpanded ? "opacity-100" : "opacity-0"}`}
                  >
                    <span
                      className="inline-flex h-7 items-center gap-1.5 rounded-full px-2 text-[#274169]"
                      title="Words"
                      aria-label={`${wordCount.toLocaleString()} words`}
                    >
                      <ListBulletIcon className="h-3.5 w-3.5 text-[#64748b]" />
                      <span>
                        {wordCount.toLocaleString()}
                        {!isPro && textWordLimit
                          ? ` / ${textWordLimit.toLocaleString()}`
                          : ""}
                      </span>
                    </span>
                    <span
                      className="inline-flex h-7 items-center gap-1.5 rounded-full px-2 text-[#274169]"
                      title="Characters"
                      aria-label={`${characterCount.toLocaleString()} characters`}
                    >
                      <span className="text-[12px] font-semibold text-[#64748b]">
                        #
                      </span>
                      <span>{characterCount.toLocaleString()}</span>
                    </span>
                    <span
                      className="mx-1 h-5 w-px bg-[#cbd7e8]"
                      aria-hidden="true"
                    />
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
                        editor?.commands.clearContent();
                        setPlainText("");
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
                    onClick={() => setStatusExpanded((v) => !v)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[18px] font-bold text-[#274169] hover:bg-[#eef3f9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
                    aria-label={
                      statusExpanded
                        ? "Hide document status"
                        : "Show document status"
                    }
                    title={statusExpanded ? "Hide status" : "Show status"}
                  >
                    {statusExpanded ? "›" : "‹"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-6">
          {isPro ? (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={isAnalyzing}
              className="veriai-pressable flex min-h-[420px] w-full flex-col items-center justify-center rounded-[12px] border border-dashed border-[#9bb8f7] bg-[#f8fbff] px-8 text-center hover:bg-[#f2f7ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <UploadIcon className="h-11 w-11 text-[#1263F1]" />
              <span className="mt-5 max-w-full">
                <span className="block truncate text-[20px] font-semibold tracking-[-0.02em] text-[#0d1526]">
                  {file ? file.name : "Drop a PDF or DOCX here"}
                </span>
                <span className="mt-3 block text-[14px] leading-6 text-[#52627a]">
                  {file
                    ? formatFileSize(file.size)
                    : "Click anywhere in this area to choose a document. Up to 10MB."}
                </span>
              </span>
            </button>
          ) : (
            <div className="relative min-h-[420px] overflow-hidden rounded-[12px] border border-dashed border-[#9bb8f7] bg-[#f8fbff]">
              <div className="absolute inset-6 rounded-[12px] border border-[#d7dfed] bg-white/80 p-5 blur-[3px]">
                <div className="h-8 w-44 rounded-[8px] bg-[#e7eef8]" />
                <div className="mt-5 grid gap-3">
                  <div className="h-4 rounded-full bg-[#dbe7f6]" />
                  <div className="h-4 w-4/5 rounded-full bg-[#dbe7f6]" />
                  <div className="h-4 w-2/3 rounded-full bg-[#dbe7f6]" />
                </div>
              </div>
              <div className="relative z-10 flex min-h-[420px] flex-col items-center justify-center px-8 text-center">
                <UploadIcon className="h-11 w-11 text-[#1263F1]" />
                <h3 className="mt-5 text-[20px] font-semibold tracking-[-0.02em] text-[#0d1526]">
                  File upload is Premium
                </h3>
                <p className="mt-3 max-w-[360px] text-[14px] leading-6 text-[#52627a]">
                  Upgrade to unlock PDF and DOCX analysis. Text scans remain
                  available on the Free plan.
                </p>
                {onUpgrade && (
                  <button
                    type="button"
                    onClick={onUpgrade}
                    disabled={isUpgrading}
                    className="veriai-pressable mt-5 h-10 rounded-[9px] bg-[#1263F1] px-5 text-[13px] font-bold text-white shadow-[0_14px_28px_-18px_rgba(18,99,241,0.95)] hover:bg-[#0d54d5] disabled:opacity-60"
                  >
                    {isUpgrading ? "Upgrading..." : "Upgrade account"}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        onChange={(e) => selectFile(e.target.files?.[0] ?? null)}
        disabled={!isPro || isAnalyzing}
      />

      {(localError || errorMessage) && (
        <p
          role="alert"
          className="mx-5 mb-5 rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-bold text-red-700"
        >
          {localError || errorMessage}
        </p>
      )}
    </div>
  );
}
