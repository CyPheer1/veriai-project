import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  BellIcon,
  CheckCircledIcon,
  ExitIcon,
  QuestionMarkCircledIcon,
} from "@radix-ui/react-icons";
import { useApp } from "../context/AppContext";

interface HeaderProps {
  variant?: "landing" | "login" | "dashboard";
  contextTitle?: string;
  onContextTitleChange?: (title: string) => void;
  contextDetail?: string;
  contextStatus?: string;
  usageLabel?: string;
}

export function Logo({
  className = "h-[60px] w-auto",
}: {
  className?: string;
}) {
  return (
    <img
      src="/assets/veri4i-logo.png"
      alt="veri4i"
      className={className}
      draggable={false}
    />
  );
}

export function Header({
  variant = "landing",
  contextTitle = "Dashboard",
  onContextTitleChange,
  contextDetail,
  contextStatus,
  usageLabel,
}: HeaderProps) {
  const navigate = useNavigate();
  const { isLoggedIn, user, logout, upgradeToPro } = useApp();
  const [scrollY, setScrollY] = useState(0);
  const [openPanel, setOpenPanel] = useState<"help" | "notifications" | null>(
    null,
  );
  const [isUpgrading, setIsUpgrading] = useState(false);

  useEffect(() => {
    if (variant === "dashboard") return;

    const onScroll = () => {
      setScrollY(window.scrollY);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [variant]);

  if (variant === "dashboard") {
    const accountUsage =
      usageLabel ??
      (user?.plan?.toUpperCase() === "PRO"
        ? "Unlimited credits"
        : `${(user?.dailyCreditsRemaining ?? 0).toLocaleString()} / ${(user?.dailyCreditLimit ?? 3000).toLocaleString()} credits`);
    const planLabel = user?.plan ? user.plan.toUpperCase() : "FREE";
    const isPro = user?.plan?.toUpperCase() === "PRO";
    const handleUpgrade = async () => {
      setIsUpgrading(true);
      try {
        await upgradeToPro();
      } finally {
        setIsUpgrading(false);
      }
    };
    const statusTone = contextStatus?.toLowerCase().includes("fail")
      ? "text-[#b32635]"
      : contextStatus?.toLowerCase().includes("analyz")
        ? "text-[#1f5cc4]"
        : contextStatus?.toLowerCase().includes("draft")
          ? "text-[#8a5200]"
          : "text-[#17633f]";

    return (
      <header className="sticky top-0 z-20 border-b border-[#d8e0ec] bg-[#fbfcff]/88 backdrop-blur-xl">
        <div className="grid h-[72px] w-full grid-cols-[1fr_auto] items-center gap-4 px-6">
          <div className="hidden min-w-0 items-center justify-start gap-3 text-[14px] font-semibold text-[#274169] md:flex">
            {onContextTitleChange ? (
              <input
                value={contextTitle}
                onChange={(event) => onContextTitleChange(event.target.value)}
                onBlur={(event) => {
                  if (!event.target.value.trim()) {
                    onContextTitleChange("Untitled scan");
                  }
                }}
                aria-label="Scan title"
                className="h-5 w-[104px] shrink-0 rounded-[5px] border border-transparent bg-transparent p-0 font-semibold leading-5 text-[#0d1526] outline-none transition-colors hover:bg-[#eef3f9]/70 focus:border-[#1263F1] focus:bg-white focus:px-1 focus:ring-2 focus:ring-[#1263F1]/10"
              />
            ) : (
              <span className="max-w-[240px] truncate text-[#0d1526]">
                {contextTitle}
              </span>
            )}
            {contextDetail && (
              <>
                <span className="text-[#94a3b8]">•</span>
                <span>{contextDetail}</span>
              </>
            )}
            {contextStatus && (
              <>
                <span className="text-[#94a3b8]">•</span>
                <span className={`flex items-center gap-1.5 ${statusTone}`}>
                  {contextStatus === "Saved" && (
                    <CheckCircledIcon className="h-4 w-4" />
                  )}
                  {contextStatus}
                </span>
              </>
            )}
          </div>
          <div className="flex min-w-0 items-center justify-end gap-3 text-[#111827]">
            <div
              className="hidden rounded-[10px] bg-[conic-gradient(#2563eb_0deg_238deg,#d8e3f2_238deg_360deg)] p-0.5 text-[14px] font-semibold text-[#274169] shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:block"
              aria-label={`${accountUsage}, ${planLabel} plan`}
            >
              <span className="block rounded-[8px] bg-white/95 px-[18px] py-[7px] shadow-[inset_0_1px_0_rgba(255,255,255,0.95)]">
                <span className="font-bold text-[#2563EB]">{accountUsage}</span>
                <span className="ml-1 text-[#52627a]">{planLabel}</span>
              </span>
            </div>
            {!isPro && (
              <button
                type="button"
                onClick={handleUpgrade}
                disabled={isUpgrading}
                className="hidden h-9 rounded-[9px] bg-[#1263F1] px-3 text-[12px] font-bold text-white shadow-[0_12px_24px_-18px_rgba(18,99,241,0.95)] hover:bg-[#0d54d5] disabled:opacity-60 md:block"
              >
                {isUpgrading ? "Upgrading..." : "Upgrade"}
              </button>
            )}
            <div className="relative hidden lg:block">
              <button
                type="button"
                onClick={() =>
                  setOpenPanel((panel) => (panel === "help" ? null : "help"))
                }
                aria-label="Help"
                aria-expanded={openPanel === "help"}
                className="veriai-icon-button flex h-9 w-9 items-center justify-center rounded-[9px] text-[#274169] hover:bg-[#eef3f9]"
              >
                <QuestionMarkCircledIcon className="h-5 w-5" />
              </button>
              {openPanel === "help" && (
                <div className="absolute right-0 top-11 z-30 w-[280px] rounded-[14px] border border-[#d8e0ec] bg-white p-4 text-left shadow-[0_22px_54px_rgba(31,45,71,0.16)]">
                  <p className="text-[13px] font-semibold text-[#0d1526]">
                    Dashboard help
                  </p>
                  <p className="mt-2 text-[12px] font-medium leading-5 text-[#52627a]">
                    Free accounts get 3,000 daily credits, one credit per word,
                    and reset every day. Premium unlocks unlimited credits,
                    PDF/DOCX upload, and the full ensemble report.
                  </p>
                </div>
              )}
            </div>
            <div className="relative hidden lg:block">
              <button
                type="button"
                onClick={() =>
                  setOpenPanel((panel) =>
                    panel === "notifications" ? null : "notifications",
                  )
                }
                aria-label="Notifications"
                aria-expanded={openPanel === "notifications"}
                className="veriai-icon-button flex h-9 w-9 items-center justify-center rounded-[9px] text-[#274169] hover:bg-[#eef3f9]"
              >
                <BellIcon className="h-5 w-5" />
              </button>
              {openPanel === "notifications" && (
                <div
                  className="absolute right-0 top-11 z-30 h-[180px] w-[280px] rounded-[14px] border border-[#d8e0ec] bg-white shadow-[0_22px_54px_rgba(31,45,71,0.16)]"
                  aria-label="Notifications panel"
                />
              )}
            </div>
            <div className="flex min-w-0 items-center gap-2 border-l border-[#d8e0ec] pl-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#edf4ff] text-[12px] font-bold text-[#193b8f]">
                {user?.initials ?? "AK"}
              </span>
              <span className="hidden max-w-[180px] truncate text-[13px] font-semibold text-[#172033] md:block">
                {user?.name ?? user?.email ?? "Reviewer"}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                logout();
                navigate("/");
              }}
              className="veriai-icon-button flex h-9 items-center justify-center gap-2 rounded-lg px-3 text-[13px] font-semibold text-[#42526f] hover:bg-[#eef3f9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
            >
              <ExitIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>
    );
  }

  const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max);
  const shrinkEnd = 140;
  const shrinkProgress = clamp(scrollY / shrinkEnd, 0, 1);

  const headerHeight = 84 - 24 * shrinkProgress;
  const containerWidth = 1390 - (1390 - 980) * shrinkProgress;
  const containerRadius = 18 + 28 * shrinkProgress;
  const containerPaddingY = 18 - 6 * shrinkProgress;
  const containerPaddingX = 24 + 12 * shrinkProgress;

  return (
    <header
      className="sticky top-0 z-20 backdrop-blur-xl"
      style={{
        height: `${headerHeight}px`,
        borderBottom: `1px solid rgba(215, 224, 238, ${1 - shrinkProgress})`,
        backgroundColor: `rgba(251, 252, 255, ${0.92 * (1 - shrinkProgress)})`,
        transition: "height 700ms cubic-bezier(0.23,1,0.32,1)",
      }}
    >
      <div
        className="mx-auto flex items-center justify-between gap-4 transition-[max-width,box-shadow,border-color,background-color,padding] duration-700 ease-out"
        style={{
          maxWidth: `${containerWidth}px`,
          paddingTop: `${containerPaddingY}px`,
          paddingBottom: `${containerPaddingY}px`,
          paddingLeft: `${containerPaddingX}px`,
          paddingRight: `${containerPaddingX}px`,
          borderRadius: `${containerRadius}px`,
          border:
            shrinkProgress > 0
              ? "1px solid rgba(215, 224, 238, 0.7)"
              : "1px solid transparent",
          boxShadow:
            shrinkProgress > 0 ? "0 14px 36px rgba(15,23,42,0.12)" : "none",
          backgroundColor:
            shrinkProgress > 0 ? "rgba(255, 255, 255, 0.75)" : "transparent",
        }}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="veriai-icon-button rounded-[14px] p-1.5"
          >
            <Logo
              className={
                shrinkProgress > 0 ? "h-[40px] w-auto" : "h-[46px] w-auto"
              }
            />
          </button>
          <div className="hidden sm:block">
            <p className="text-[15px] font-semibold tracking-[-0.01em] text-[#1d2a44]">
              VeriAI Review
            </p>
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#6b7b94]">
              Academic integrity
            </p>
          </div>
        </div>

        <div className="hidden lg:block" aria-hidden="true" />

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
