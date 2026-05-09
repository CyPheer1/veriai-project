import { useEffect, useRef, useState } from "react";
import { CheckCircledIcon, CrossCircledIcon } from "@radix-ui/react-icons";
import { useNavigate } from "react-router";
import { Header } from "../components/Header";
import { useApp } from "../context/AppContext";

function BillingStatusShell({
  tone,
  title,
  description,
  actionLabel,
}: {
  tone: "success" | "cancel";
  title: string;
  description: string;
  actionLabel: string;
}) {
  const navigate = useNavigate();
  const { refreshUser, isLoggedIn } = useApp();
  const [isRefreshing, setIsRefreshing] = useState(tone === "success");
  const hasRefreshed = useRef(false);

  useEffect(() => {
    if (!isLoggedIn || tone !== "success" || hasRefreshed.current) {
      setIsRefreshing(false);
      return;
    }

    hasRefreshed.current = true;
    void refreshUser().finally(() => setIsRefreshing(false));
  }, [isLoggedIn, refreshUser, tone]);

  const Icon = tone === "success" ? CheckCircledIcon : CrossCircledIcon;
  const color = tone === "success" ? "text-[#17633f]" : "text-[#8a5200]";

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-[#121a2b]">
      <Header variant="landing" />
      <main className="mx-auto flex min-h-[calc(100vh-72px)] max-w-3xl items-center justify-center px-6 py-16">
        <section className="w-full rounded-[28px] border border-[#d8e0ec] bg-white p-10 text-center shadow-[0_24px_80px_rgba(31,45,71,0.12)]">
          <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#eef4ff] ${color}`}>
            <Icon className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-[32px] font-bold tracking-[-0.03em] text-[#07112f]">
            {title}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-[15px] font-medium leading-7 text-[#52627a]">
            {isRefreshing ? "Finalizing your Premium access..." : description}
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate(isLoggedIn ? "/dashboard" : "/")}
              className="h-11 rounded-[11px] bg-[#1263F1] px-5 text-[14px] font-bold text-white shadow-[0_14px_28px_-18px_rgba(18,99,241,0.95)] hover:bg-[#0d54d5]"
            >
              {isRefreshing ? "Refreshing..." : actionLabel}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export function BillingSuccessPage() {
  return (
    <BillingStatusShell
      tone="success"
      title="Payment complete"
      description="Your Premium account is being activated. If it does not appear immediately, refresh the dashboard after the webhook finishes."
      actionLabel="Go to dashboard"
    />
  );
}

export function BillingCancelPage() {
  return (
    <BillingStatusShell
      tone="cancel"
      title="Checkout canceled"
      description="No payment was completed and your account stayed on the Free plan. You can upgrade again whenever you are ready."
      actionLabel="Back to dashboard"
    />
  );
}
