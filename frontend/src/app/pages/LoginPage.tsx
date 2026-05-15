import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { useNavigate } from "react-router";
import {
  BarChartIcon,
  CheckCircledIcon,
  EnvelopeClosedIcon,
  EyeClosedIcon,
  EyeOpenIcon,
  LockClosedIcon,
  MagnifyingGlassIcon,
} from "@radix-ui/react-icons";
import { Logo } from "../components/Header";
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

export function LoginPage() {
  const { login, authError, clearAuthError, isLoggedIn, authLoading } =
    useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isLoggedIn) {
      navigate("/dashboard", { replace: true });
    }
  }, [authLoading, isLoggedIn, navigate]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setFormError("Email and password are required.");
      return;
    }

    setIsLoading(true);
    setFormError(null);
    clearAuthError();

    try {
      await login(trimmedEmail, trimmedPassword);
      navigate("/dashboard");
    } catch (error) {
      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError("Authentication failed.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="veriai-academic-bg min-h-screen">
      <main className="veriai-reveal mx-auto flex min-h-screen max-w-[1280px] items-center px-4 pb-10 pt-8 sm:px-6 lg:px-8">
        <section
          className="veriai-card-surface grid w-full overflow-hidden rounded-[20px] lg:grid-cols-[0.98fr_1.02fr]"
          style={{ alignItems: "stretch" }}
        >
          <div className="relative hidden min-h-[720px] overflow-hidden bg-[#f8fafc] p-6 sm:p-10 lg:block">
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
                Sign in to continue academic AI review.
              </h1>
              <p className="mt-4 max-w-[540px] text-[16px] leading-7 text-[#40516d]">
                Access the review workspace for source documents, probability
                scoring, model attribution, and highlighted evidence.
              </p>

              <div className="veriai-stagger mt-8 space-y-6">
                <Feature
                  icon={<LockClosedIcon className="h-5 w-5" />}
                  title="Secure sign-in"
                  text="Your analysis history and account access stay protected by the existing authentication flow."
                />
                <Feature
                  icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                  title="Document-first review"
                  text="Once inside, paste or upload a source and read the evidence beside the text."
                />
                <Feature
                  icon={<BarChartIcon className="h-5 w-5" />}
                  title="Transparent results"
                  text="Scores, model attribution, and highlighted passages stay grouped for easier interpretation."
                />
              </div>

              <div className="veriai-reveal mt-10 max-w-[480px] rounded-[14px] border border-[#d7dfed] bg-white/72 p-5 shadow-[0_14px_34px_rgba(39,65,105,0.08)] backdrop-blur">
                <p className="flex items-center gap-2 text-[13px] font-semibold text-[#17633f]">
                  <CheckCircledIcon className="h-4 w-4" /> Privacy first
                </p>
                <p className="mt-3 text-[14px] leading-6 text-[#40516d]">
                  Data is encrypted, access is controlled, and review activity
                  stays tied to your VeriAI account.
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white/88 px-6 py-10 sm:px-12 lg:px-14 lg:py-14"
          >
            {/* Logo — only visible on mobile/tablet when left panel is hidden */}
            <div className="mb-7 flex items-center gap-3 lg:hidden">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="veriai-icon-button inline-flex rounded-[10px] p-0.5"
              >
                <Logo className="h-9 w-auto" />
              </button>
              <span className="text-[14px] font-semibold text-[#40516d]">
                VeriAI
              </span>
            </div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
              VeriAI access
            </p>
            <h2 className="veriai-display-font mt-3 text-[36px] font-semibold leading-none tracking-[-0.04em] text-[#0F172A]">
              Sign in to your account
            </h2>
            <p className="mt-3 max-w-[48ch] text-[14px] leading-6 text-[#40516d]">
              Use your existing account, or create a new account in a dedicated
              signup flow.
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
                  placeholder="Enter your password"
                  autoComplete="current-password"
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
              {isLoading ? "Signing in..." : "Sign in"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/signup")}
              disabled={isLoading}
              className="veriai-pressable mt-3 h-[50px] w-full rounded-[10px] border border-[#cbd7ea] bg-white text-[15px] font-semibold text-[#172033] hover:bg-[#f8fbff] disabled:opacity-60"
            >
              Create account
            </button>

            <p className="mt-8 text-center text-[13px] leading-6 text-[#40516d]">
              By signing in, you agree to our{" "}
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
