import {
  ChartNoAxesColumnIncreasing,
  FileSearch,
  GraduationCap,
  Layers,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { SiClaude, SiGooglegemini, SiMeta, SiOpenai } from "react-icons/si";

interface IconProps {
  className?: string;
}

export function DocumentSearchButtonIcon({ className = "h-8 w-8" }: IconProps) {
  return <FileSearch className={className} strokeWidth={2.15} />;
}

export function LayeredDetectionIcon({ className = "h-10 w-10" }: IconProps) {
  return <Layers className={className} strokeWidth={2.25} />;
}

export function ShieldCheckIcon({ className = "h-9 w-9" }: IconProps) {
  return <ShieldCheck className={className} strokeWidth={2.1} />;
}

export function GraduationCapIcon({ className = "h-9 w-9" }: IconProps) {
  return <GraduationCap className={className} strokeWidth={2.1} />;
}

export function ResultsBarsIcon({ className = "h-9 w-9" }: IconProps) {
  return <ChartNoAxesColumnIncreasing className={className} strokeWidth={2.1} />;
}

export function LockLineIcon({ className = "h-9 w-9" }: IconProps) {
  return <LockKeyhole className={className} strokeWidth={2.1} />;
}

export function ModelLogo({ name, className = "h-5 w-5" }: { name: string; className?: string }) {
  const normalized = name.toLowerCase();

  if (normalized.includes("claude")) return <SiClaude className={className} style={{ color: "#D96B2B" }} aria-hidden="true" />;
  if (normalized.includes("gemini")) return <SiGooglegemini className={className} style={{ color: "#1263F1" }} aria-hidden="true" />;
  if (normalized.includes("llama")) return <SiMeta className={className} style={{ color: "#1263F1" }} aria-hidden="true" />;
  return <SiOpenai className={className} style={{ color: "#111827" }} aria-hidden="true" />;
}
