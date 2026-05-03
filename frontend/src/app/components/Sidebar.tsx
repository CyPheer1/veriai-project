import {
  CheckCircledIcon,
  FileTextIcon,
  InfoCircledIcon,
} from "@radix-ui/react-icons";
import { useApp } from "../context/AppContext";

export function Sidebar() {
  const { user } = useApp();
  const isPro = user?.plan?.toUpperCase() === "PRO";
  const usedToday = user?.dailySubmissionCount ?? 0;
  const remaining = isPro ? "Unlimited" : Math.max(0, 3 - usedToday).toString();

  return (
    <aside className="grid gap-4 xl:sticky xl:top-[88px]">
      <section className="rounded-2xl border border-[#d8e0ec] bg-[#fbfcff] p-5 shadow-[0_12px_34px_rgba(39,65,105,0.07)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#64748b]">Review context</p>
        <div className="mt-5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eaf2ff] text-[#2563EB]">
            <FileTextIcon className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[13px] font-semibold text-[#0d1526]">Submission path</p>
            <p className="mt-1 text-[12px] leading-5 text-[#52627a]">Text is sent to Spring Boot, then processed by the internal AI service.</p>
          </div>

          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ecf8f2] text-[#22855a]">
            <CheckCircledIcon className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[13px] font-semibold text-[#0d1526]">Current allowance</p>
            <p className="mt-1 text-[12px] leading-5 text-[#52627a]">
              {remaining} {isPro ? "submissions available" : "FREE scans remaining"} today.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[#d8e0ec] bg-[#fbfcff] p-5 shadow-[0_12px_34px_rgba(39,65,105,0.07)]">
        <div className="flex items-start gap-3">
          <InfoCircledIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#2563EB]" />
          <div>
            <p className="text-[13px] font-semibold text-[#0d1526]">Interpret carefully</p>
            <p className="mt-2 text-[12px] leading-5 text-[#52627a]">
              High scores flag patterns, not misconduct. Review highlighted passages, confidence, and policy before making a decision.
            </p>
          </div>
        </div>
      </section>
    </aside>
  );
}
