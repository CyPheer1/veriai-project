import { useState, useRef } from "react";
import { Type, Upload, FileText, X, Sparkles, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useApp } from "../context/AppContext";

export type AnalyzePayload =
  | { mode: "text"; text: string }
  | { mode: "file"; file: File };

interface InputPanelProps {
  onAnalyze: (payload: AnalyzePayload) => void | Promise<void>;
  isAnalyzing: boolean;
  errorMessage?: string | null;
}

export function InputPanel({ onAnalyze, isAnalyzing, errorMessage = null }: InputPanelProps) {
  const { isDark } = useApp();
  const [mode, setMode] = useState<"text" | "file">("text");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) {
      setFile(dropped);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
    }
  };

  const fileSize = file ? `${(file.size / 1024).toFixed(1)} KB` : null;

  // Spatial glass card
  const cardStyle: React.CSSProperties = {
    background: isDark ? "rgba(15,17,26,0.55)" : "rgba(255,255,255,0.65)",
    backdropFilter: isDark ? "blur(40px) saturate(1.4)" : "blur(40px) saturate(1.3)",
    WebkitBackdropFilter: isDark ? "blur(40px) saturate(1.4)" : "blur(40px) saturate(1.3)",
    border: isDark
      ? "1px solid rgba(255,255,255,0.06)"
      : "1px solid rgba(255,255,255,0.80)",
    boxShadow: isDark
      ? "0 8px 32px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.04)"
      : "0 8px 32px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)",
  };

  const tabBarBg = isDark ? "bg-[rgba(255,255,255,0.03)]" : "bg-[rgba(0,0,0,0.03)]";
  const tabActive = isDark
    ? "bg-[rgba(255,255,255,0.07)] text-[rgba(255,255,255,0.9)] shadow-sm"
    : "bg-white text-[#0F111A] shadow-sm";
  const tabDefault = isDark
    ? "text-[rgba(255,255,255,0.35)] hover:text-[rgba(255,255,255,0.6)]"
    : "text-[#6B7280] hover:text-[#374151]";
  const textareaClass = isDark
    ? "border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.02)] text-[rgba(255,255,255,0.88)] placeholder-[rgba(255,255,255,0.15)] focus:border-[rgba(99,102,241,0.3)] focus:bg-[rgba(255,255,255,0.03)]"
    : "border-[rgba(0,0,0,0.06)] bg-[rgba(255,255,255,0.5)] text-[#0F111A] placeholder-[#B0B7C3] focus:border-[rgba(99,102,241,0.3)] focus:bg-white";
  const counterText = isDark ? "text-[rgba(255,255,255,0.18)]" : "text-[#B0B7C3]";
  const dropZone = isDark
    ? `border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.01)] hover:border-[rgba(99,102,241,0.2)] ${dragOver ? "border-[rgba(99,102,241,0.35)] bg-[rgba(99,102,241,0.04)]" : ""}`
    : `border-[rgba(0,0,0,0.07)] bg-[rgba(0,0,0,0.01)] hover:border-[rgba(99,102,241,0.25)] ${dragOver ? "border-[rgba(99,102,241,0.35)] bg-[rgba(99,102,241,0.04)]" : ""}`;
  const dropText = isDark ? "text-[rgba(255,255,255,0.6)]" : "text-[#4B5563]";
  const dropMuted = isDark ? "text-[rgba(255,255,255,0.22)]" : "text-[#9CA3AF]";
  const fileCard = isDark
    ? "border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.015)]"
    : "border-[rgba(0,0,0,0.05)] bg-white/50";

  const canSubmit = mode === "text" ? !!text.trim() : !!file;

  return (
    <div className="rounded-2xl p-1" style={cardStyle}>
      {/* Tab Switcher */}
      <div className={`mb-1 flex items-center gap-1 rounded-xl p-1 ${tabBarBg}`}>
        {[
          { id: "text" as const, label: "Text Input", icon: Type },
          { id: "file" as const, label: "File Upload", icon: Upload },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setMode(id)}
            className={`relative flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[12px] transition-all ${
              mode === id ? tabActive : tabDefault
            }`}
            style={{ fontWeight: mode === id ? 500 : 400 }}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        {mode === "text" ? (
          <motion.div
            key="text"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            <div className="relative">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste or type the text you want to analyze for AI-generated content..."
                className={`h-[230px] w-full resize-none rounded-xl border p-5 text-[13px] outline-none transition-all ${textareaClass}`}
                style={{ lineHeight: "1.8" }}
              />
              <div className={`absolute bottom-3 right-3 flex items-center gap-3 text-[10px] ${counterText}`}>
                <span style={{ fontVariantNumeric: "tabular-nums" }}>{wordCount} words</span>
                <span className={`h-3 w-px ${isDark ? "bg-white/8" : "bg-slate-200"}`} />
                <span style={{ fontVariantNumeric: "tabular-nums" }}>{text.length} chars</span>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="file"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              accept=".pdf,.docx"
              onChange={handleFileSelect}
            />
            {!file ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleFileDrop}
                onClick={() => fileRef.current?.click()}
                className={`flex h-[230px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all ${dropZone}`}
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/8">
                  <Upload className="h-6 w-6 text-indigo-400" />
                </div>
                <p className={`mb-1 text-[13px] ${dropText}`}>
                  Drop your file here, or{" "}
                  <span className="text-indigo-400">browse</span>
                </p>
                <p className={`text-[11px] ${dropMuted}`}>
                  PDF, DOCX - Max 10MB
                </p>
              </div>
            ) : (
              <div className={`flex h-[230px] flex-col items-center justify-center rounded-xl border ${fileCard}`}>
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/8">
                  <FileText className="h-6 w-6 text-emerald-400" />
                </div>
                <p className={`mb-0.5 text-[13px] ${isDark ? "text-white/75" : "text-slate-800"}`}>{file.name}</p>
                <p className={`mb-3 text-[11px] ${isDark ? "text-white/25" : "text-slate-400"}`}>{fileSize}</p>
                <button
                  onClick={() => {
                    setFile(null);
                    if (fileRef.current) {
                      fileRef.current.value = "";
                    }
                  }}
                  className={`flex items-center gap-1 text-[11px] transition-all ${isDark ? "text-white/25 hover:text-red-400" : "text-slate-400 hover:text-red-500"}`}
                >
                  <X className="h-3 w-3" /> Remove file
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="mt-1 flex gap-2">
        <button
          onClick={() => {
            if (mode === "text" && text.trim()) {
              void onAnalyze({ mode: "text", text: text.trim() });
              return;
            }

            if (mode === "file" && file) {
              void onAnalyze({ mode: "file", file });
            }
          }}
          disabled={isAnalyzing || !canSubmit}
          className={`relative flex flex-1 items-center justify-center gap-2.5 overflow-hidden rounded-xl px-6 py-3.5 text-[13px] text-white transition-all disabled:opacity-25 disabled:shadow-none ${canSubmit && !isAnalyzing ? "analyze-btn-animated" : "analyze-btn-static"}`}
          style={{
            fontWeight: 500,
            boxShadow: canSubmit ? "0 4px 24px rgba(79,70,229,0.3)" : "none",
          }}
        >
          {isAnalyzing ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Analyzing Content...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Analyze Content
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>

        {(text.trim() || file) && !isAnalyzing && (
          <button
            onClick={() => {
              setText("");
              setFile(null);
              if (fileRef.current) {
                fileRef.current.value = "";
              }
            }}
            className={`rounded-xl border px-4 py-3.5 text-[12px] transition-all ${
              isDark
                ? "border-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.3)] hover:bg-[rgba(255,255,255,0.04)] hover:text-[rgba(255,255,255,0.55)]"
                : "border-[rgba(0,0,0,0.06)] text-[#9CA3AF] hover:bg-[rgba(0,0,0,0.03)] hover:text-[#6B7280]"
            }`}
          >
            Clear
          </button>
        )}
      </div>

      {errorMessage && (
        <p className={`mt-3 text-[11px] ${isDark ? "text-red-300/90" : "text-red-700"}`}>
          {errorMessage}
        </p>
      )}

      <style>{`
        .analyze-btn-animated {
          background: linear-gradient(135deg, #4F46E5, #6366F1, #4F46E5);
          background-size: 200% 200%;
          animation: gradientShift 3s ease infinite;
        }
        .analyze-btn-static {
          background: linear-gradient(135deg, #4F46E5, #6366F1);
          background-size: 100% 100%;
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}