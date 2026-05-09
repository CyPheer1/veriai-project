import { useState } from "react";
import { useNavigate } from "react-router";
import type { FormEvent, ReactNode } from "react";
import {
  CheckCircledIcon,
  EnvelopeClosedIcon,
  EyeClosedIcon,
  EyeOpenIcon,
  LockClosedIcon,
  RocketIcon,
  TimerIcon,
} from "@radix-ui/react-icons";
import { Logo } from "../components/Header";
import { ShieldCheckIcon } from "../components/DesignIcons";
import { useApp } from "../context/AppContext";

function Feature({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] border border-[#d7dfed] bg-white/88 text-[#1f5cc4]">
        {icon}
      </div>
      <div>
        <h3 className="text-[15px] font-semibold text-[#0F172A]">{title}</h3>
        <p className="mt-1 max-w-[330px] text-[13px] leading-6 text-[#40516d]">
          {text}
        </p>
      </div>
    </div>
  );
}

export function SignupPage() {
  const { register, authError, clearAuthError } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    if (!trimmedEmail || !trimmedPassword || !trimmedConfirmPassword) {
      setFormError("Email, password, and confirmation are required.");
      return;
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    setFormError(null);
    clearAuthError();

    try {
      await register(trimmedEmail, trimmedPassword, "FREE");
      navigate("/dashboard");
    } catch (error) {
      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError("Unable to create account.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="veriai-academic-bg min-h-screen">
      <main className="veriai-reveal mx-auto flex min-h-screen max-w-[1280px] items-center px-5 pb-12 pt-10 sm:px-6 lg:px-8">
        <section className="veriai-card-surface grid w-full overflow-hidden rounded-[20px] lg:grid-cols-[0.98fr_1.02fr]">
          <div className="relative min-h-[720px] overflow-hidden bg-[#f8fafc] p-6 sm:p-10">
            <img
              src="/assets/generated/study-setting.png"
              alt="Academic workspace with research material prepared for review"
              className="absolute inset-0 h-full w-full object-cover opacity-[0.22]"
              draggable={false}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#fbfcff]/95 via-[#f4f7fb]/82 to-[#dfe8f4]/64" />
            <div className="veriai-reveal-slow veriai-hero-float-subtle relative">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="veriai-icon-button inline-flex rounded-[10px] p-0.5"
              >
                <Logo className="h-11 w-auto" />
              </button>
              <h1 className="veriai-display-font mt-8 max-w-[520px] text-[44px] font-semibold leading-[1.02] tracking-[-0.045em] text-[#0d1526] text-balance md:text-[58px]">
                Create your academic review workspace.
              </h1>
              <p className="mt-4 max-w-[540px] text-[16px] leading-7 text-[#40516d]">
                Launch a free VeriAI account to review documents, track
                submissions, and interpret evidence with clarity.
              </p>

              <div className="veriai-stagger mt-8 space-y-6">
                <Feature
                  icon={<ShieldCheckIcon className="h-5 w-5" />}
                  title="Secure by default"
                  text="Authentication keeps access protected with encrypted session storage."
                />
                <Feature
                  icon={<TimerIcon className="h-5 w-5" />}
                  title="Fast onboarding"
                  text="Start your first scan in minutes and keep results aligned with your review workflow."
                />
                <Feature
                  icon={<RocketIcon className="h-5 w-5" />}
                  title="Ready for reviewers"
                  text="Evidence-first layouts keep highlights, scores, and model signals in one place."
                />
              </div>

              <div className="veriai-reveal mt-10 max-w-[480px] rounded-[14px] border border-[#d7dfed] bg-white/72 p-5 shadow-[0_14px_34px_rgba(39,65,105,0.08)] backdrop-blur">
                <p className="flex items-center gap-2 text-[13px] font-semibold text-[#17633f]">
                  <CheckCircledIcon className="h-4 w-4" /> Free plan includes 3
                  scans
                </p>
                <p className="mt-3 text-[14px] leading-6 text-[#40516d]">
                  Upgrade any time to unlock PDF and DOCX uploads for deeper
                  document review.
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white/88 px-6 py-10 sm:px-12 lg:px-14 lg:py-14"
          >
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
              Create your account
            </p>
            <h2 className="veriai-display-font mt-3 text-[36px] font-semibold leading-none tracking-[-0.04em] text-[#0F172A]">
              Start with a free account
            </h2>
            <p className="mt-3 max-w-[48ch] text-[14px] leading-6 text-[#40516d]">
              Use any email address. We will set up a reviewer workspace in
              seconds.
            </p>

            <label className="mt-8 block text-[14px] font-semibold text-[#0F172A]">
              Email
              <div className="mt-3 flex h-[56px] items-center gap-4 rounded-[10px] border border-[#cbd7ea] bg-white px-4 transition-colors focus-within:border-[#1f5cc4] focus-within:ring-4 focus-within:ring-[#1f5cc4]/10">
                <EnvelopeClosedIcon className="h-5 w-5 text-[#40516d]" />
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full bg-transparent text-[15px] text-[#0F172A] outline-none placeholder:text-[#94a3b8]"
                />
              </div>
            </label>

            <label className="mt-6 block text-[14px] font-semibold text-[#0F172A]">
              Password
              <div className="mt-3 flex h-[56px] items-center gap-4 rounded-[10px] border border-[#cbd7ea] bg-white px-4 transition-colors focus-within:border-[#1f5cc4] focus-within:ring-4 focus-within:ring-[#1f5cc4]/10">
                <LockClosedIcon className="h-5 w-5 text-[#40516d]" />
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  autoComplete="new-password"
                  required
                  className="w-full bg-transparent text-[15px] text-[#0F172A] outline-none placeholder:text-[#94a3b8]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="veriai-icon-button flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] text-[#40516d] hover:bg-[#f1f5f9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f5cc4]"
                >
                  {showPassword ? (
                    <EyeClosedIcon className="h-5 w-5" />
                  ) : (
                    <EyeOpenIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </label>

            <label className="mt-6 block text-[14px] font-semibold text-[#0F172A]">
              Confirm password
              <div className="mt-3 flex h-[56px] items-center gap-4 rounded-[10px] border border-[#cbd7ea] bg-white px-4 transition-colors focus-within:border-[#1f5cc4] focus-within:ring-4 focus-within:ring-[#1f5cc4]/10">
                <LockClosedIcon className="h-5 w-5 text-[#40516d]" />
                <input
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  required
                  className="w-full bg-transparent text-[15px] text-[#0F172A] outline-none placeholder:text-[#94a3b8]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  className="veriai-icon-button flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] text-[#40516d] hover:bg-[#f1f5f9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f5cc4]"
                >
                  {showConfirmPassword ? (
                    <EyeClosedIcon className="h-5 w-5" />
                  ) : (
                    <EyeOpenIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </label>

            {(formError || authError) && (
              <p className="mt-5 rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-bold text-red-700">
                {formError || authError}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="veriai-pressable mt-8 h-[54px] w-full rounded-[10px] bg-[#1f5cc4] text-[16px] font-semibold text-white shadow-[0_14px_28px_-18px_rgba(31,92,196,0.95)] hover:bg-[#174ca8] disabled:opacity-60"
            >
              {isLoading ? "Creating account..." : "Create free account"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/login")}
              disabled={isLoading}
              className="veriai-pressable mt-3 h-[50px] w-full rounded-[10px] border border-[#cbd7ea] bg-white text-[15px] font-semibold text-[#172033] hover:bg-[#f8fbff] disabled:opacity-60"
            >
              Already have an account? Sign in
            </button>

            <p className="mt-8 text-center text-[13px] leading-6 text-[#40516d]">
              By creating an account, you agree to our{" "}
              <span className="font-semibold text-[#1f5cc4]">
                Terms of Service
              </span>{" "}
              and{" "}
              <span className="font-semibold text-[#1f5cc4]">
                Privacy Policy
              </span>
              .
            </p>
          </form>
        </section>
      </main>
    </div>
  );
}
