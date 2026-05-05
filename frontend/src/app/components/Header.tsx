import { useNavigate } from "react-router";
import { BellIcon, CheckCircledIcon, ExitIcon, QuestionMarkCircledIcon } from "@radix-ui/react-icons";
import { useApp } from "../context/AppContext";

interface HeaderProps {
  variant?: "landing" | "login" | "dashboard";
}

export function Logo({ className = "h-[60px] w-auto" }: { className?: string }) {
  return (
    <img
      src="/assets/veri4i-logo.png"
      alt="veri4i"
      className={className}
      draggable={false}
    />
  );
}

export function Header({ variant = "landing" }: HeaderProps) {
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useApp();

  if (variant === "dashboard") {
    return (
      <header className="sticky top-0 z-20 border-b border-[#d8e0ec] bg-[#fbfcff]/88 backdrop-blur-xl">

        <div className="grid h-[72px] w-full grid-cols-[1fr_auto] items-center gap-4 px-6">
          <div className="hidden min-w-0 justify-start gap-3 text-[14px] font-semibold text-[#274169] md:flex">
            <span className="text-[#0d1526]">Essay review</span>
            <span className="text-[#94a3b8]">•</span>
            <span>May 14, 2025</span>
            <span className="text-[#94a3b8]">•</span>
            <span className="flex items-center gap-1.5 text-[#17633f]"><CheckCircledIcon className="h-4 w-4" /> Saved</span>
          </div>
          <div className="flex min-w-0 items-center justify-end gap-3 text-[#111827]">
            <div
              className="hidden rounded-[10px] bg-[conic-gradient(#2563eb_0deg_176deg,#d8e3f2_176deg_360deg)] p-0.5 text-[14px] font-semibold text-[#274169] shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:block"
              aria-label="2,450 of 5,000 credits remaining"
            >
              <span className="block rounded-[8px] bg-white/95 px-[18px] py-[7px] shadow-[inset_0_1px_0_rgba(255,255,255,0.95)]">
                <span className="font-bold text-[#2563EB]">2,450 / 5,000</span>
                <span className="ml-1 text-[#52627a]">credits</span>
              </span>
            </div>
            <button type="button" aria-label="Help" className="veriai-icon-button hidden h-9 w-9 items-center justify-center rounded-[9px] text-[#274169] hover:bg-[#eef3f9] lg:flex">
              <QuestionMarkCircledIcon className="h-5 w-5" />
            </button>
            <button type="button" aria-label="Notifications" className="veriai-icon-button hidden h-9 w-9 items-center justify-center rounded-[9px] text-[#274169] hover:bg-[#eef3f9] lg:flex">
              <BellIcon className="h-5 w-5" />
            </button>
            <div className="flex min-w-0 items-center gap-2 border-l border-[#d8e0ec] pl-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#edf4ff] text-[12px] font-bold text-[#193b8f]">{user?.initials ?? "AK"}</span>
              <span className="hidden max-w-[180px] truncate text-[13px] font-semibold text-[#172033] md:block">{user?.name ?? user?.email ?? "Reviewer"}</span>
            </div>
            <button type="button" onClick={() => { logout(); navigate("/"); }} className="veriai-icon-button flex h-9 items-center justify-center gap-2 rounded-lg px-3 text-[13px] font-semibold text-[#42526f] hover:bg-[#eef3f9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]">
              <ExitIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

      </header>
    );
  }

  return (
    <header className="sticky top-0 z-20 h-[84px] border-b border-[#d7e0ee] bg-[#fbfcff]/92 backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-[1390px] items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="veriai-icon-button rounded-[14px] p-1.5"
          >
            <Logo className="h-[46px] w-auto" />
          </button>
          <div className="hidden sm:block">
            <p className="text-[15px] font-semibold tracking-[-0.01em] text-[#1d2a44]">VeriAI Review</p>
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#6b7b94]">Academic integrity</p>
          </div>
        </div>

        <p className="hidden max-w-[48ch] text-center text-[14px] font-medium leading-6 text-[#31446f] lg:block">
          AI text detection for academic review workflows
        </p>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(isLoggedIn ? "/dashboard" : "/login")}
            className="veriai-pressable h-[40px] rounded-[10px] border border-transparent px-3 text-[14px] font-semibold text-[#0f1a2f] hover:border-[#d7e0ee] hover:bg-white"
          >
            {isLoggedIn ? "Dashboard" : "Sign in"}
          </button>
          {variant === "landing" && (
            <button
              type="button"
              onClick={() => navigate("/signup")}
              className="veriai-pressable hidden h-[44px] items-center rounded-[10px] bg-[#2563EB] px-5 text-[14px] font-semibold text-white shadow-[0_12px_26px_-18px_rgba(37,99,235,0.9)] hover:bg-[#1554df] sm:inline-flex"
            >
              Get started
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
