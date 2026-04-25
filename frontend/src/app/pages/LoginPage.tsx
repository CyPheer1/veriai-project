import { useState } from "react";
import { Shield, ArrowRight, Eye, EyeOff, Sparkles, CheckCircle, Github, Mail, Lock } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { useApp } from "../context/AppContext";

const features = [
  "Multi-model AI detection with 98.7% accuracy",
  "Chunk-level analysis with highlighted segments",
  "Enterprise-grade API access & webhooks",
  "Full scan history & exportable reports",
];

export function LoginPage() {
  const { isDark, login, register, authError, clearAuthError } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const textPrimary = isDark ? "text-white/90" : "text-slate-900";
  const textSecondary = isDark ? "text-white/45" : "text-slate-500";
  const textMuted = isDark ? "text-white/25" : "text-slate-400";
  const inputBase = isDark
    ? "bg-white/[0.03] border-white/[0.06] text-white/90 placeholder-white/20 focus:border-indigo-500/40 focus:bg-white/[0.05]"
    : "bg-white/80 border-slate-200/80 text-slate-900 placeholder-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";
  const dividerColor = isDark ? "bg-white/[0.05]" : "bg-slate-200";
  const dividerText = isDark ? "text-white/18" : "text-slate-400";
  const socialBtn = isDark
    ? "bg-white/[0.03] border-white/[0.06] text-white/60 hover:bg-white/[0.06] hover:text-white/85"
    : "bg-white/80 border-slate-200/80 text-slate-700 hover:bg-white hover:text-slate-900 shadow-sm";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setFormError("Email and password are required.");
      return;
    }

    if (tab === "signup" && trimmedPassword.length < 8) {
      setFormError("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);
    setFormError(null);
    clearAuthError();

    try {
      if (tab === "login") {
        await login(trimmedEmail, trimmedPassword);
      } else {
        await register(trimmedEmail, trimmedPassword, "FREE");
      }

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
    <div className="min-h-screen flex font-['Inter',sans-serif]">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center p-16"
        style={{
          background: isDark
            ? "linear-gradient(135deg, #050505 0%, #0a0a1a 30%, #050510 100%)"
            : "linear-gradient(135deg, #FBFBFD 0%, #F0EEFF 50%, #FBFBFD 100%)",
        }}>
        {/* Animated mesh blobs */}
        <div className="absolute top-[-15%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[120px]"
          style={{
            background: isDark
              ? "radial-gradient(circle, rgba(49,46,129,0.25) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(199,210,254,0.5) 0%, transparent 70%)",
            animation: "meshFloat1 18s ease-in-out infinite",
          }} />
        <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full blur-[100px]"
          style={{
            background: isDark
              ? "radial-gradient(circle, rgba(30,27,75,0.2) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(196,181,253,0.35) 0%, transparent 70%)",
            animation: "meshFloat2 22s ease-in-out infinite",
          }} />

        {/* Floating mockup cards */}
        <div className="absolute top-[12%] right-[8%]">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="rounded-2xl p-4 w-52"
            style={{
              background: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.5)",
              backdropFilter: "blur(40px)",
              border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)",
              boxShadow: isDark
                ? "0 16px 48px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)"
                : "0 16px 48px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)",
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="h-2 w-2 rounded-full bg-red-400" style={{ boxShadow: "0 0 8px rgba(220,60,60,0.4)" }} />
              <span className={`text-[10px] ${isDark ? "text-white/35" : "text-slate-500"}`} style={{ fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>AI Detected</span>
            </div>
            <div className="text-2xl mb-0.5" style={{
              fontWeight: 700,
              background: "linear-gradient(to bottom, rgba(248,113,113,0.9), rgba(239,68,68,0.7))",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>94%</div>
            <div className={`text-[9px] ${isDark ? "text-white/25" : "text-slate-400"}`}>Likely GPT-4o generated</div>
            <div className="mt-3 h-1 rounded-full" style={{ background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)" }}>
              <div className="h-full w-[94%] rounded-full" style={{
                background: "linear-gradient(to right, #EF4444, #F59E0B)",
                boxShadow: "0 0 8px rgba(239,68,68,0.3)",
              }} />
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-[20%] left-[6%]">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="rounded-2xl p-4 w-48"
            style={{
              background: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.5)",
              backdropFilter: "blur(40px)",
              border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)",
              boxShadow: isDark
                ? "0 16px 48px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)"
                : "0 16px 48px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)",
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="h-2 w-2 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 8px rgba(20,184,166,0.4)" }} />
              <span className={`text-[10px] ${isDark ? "text-white/35" : "text-slate-500"}`} style={{ fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>Human Written</span>
            </div>
            <div className="text-2xl mb-0.5" style={{
              fontWeight: 700,
              background: "linear-gradient(to bottom, rgba(52,211,153,0.9), rgba(16,185,129,0.7))",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>12%</div>
            <div className={`text-[9px] ${isDark ? "text-white/25" : "text-slate-400"}`}>Authentic content</div>
          </motion.div>
        </div>

        <div className="absolute top-[45%] right-[4%]">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="rounded-xl p-3 w-40"
            style={{
              background: isDark ? "rgba(99,102,241,0.06)" : "rgba(99,102,241,0.06)",
              backdropFilter: "blur(20px)",
              border: isDark ? "1px solid rgba(99,102,241,0.15)" : "1px solid rgba(99,102,241,0.12)",
            }}
          >
            <div className={`text-[9px] mb-1 ${isDark ? "text-indigo-300/70" : "text-indigo-600"}`}
              style={{ fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Model Detected</div>
            <div className={`text-[11px] ${isDark ? "text-white/65" : "text-slate-700"}`} style={{ fontWeight: 500 }}>GPT-4o / Claude 3.5</div>
          </motion.div>
        </div>

        {/* Main content */}
        <div className="relative z-10 max-w-md">
          <div className="flex items-center gap-3 mb-10">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl"
              style={{
                background: "linear-gradient(135deg, #4F46E5, #6366F1)",
                boxShadow: "0 4px 20px rgba(99,102,241,0.3)",
              }}>
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className={`text-[22px] tracking-tight ${textPrimary}`} style={{ fontWeight: 600 }}>
              Veri<span className="text-indigo-400">AI</span>
            </span>
          </div>

          <h1 className={textPrimary} style={{ fontSize: "38px", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.5px" }}>
            Detect AI content{" "}
            <span style={{
              background: "linear-gradient(to right, #818CF8, #6366F1)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              with confidence.
            </span>
          </h1>
          <p className={`${textSecondary} mb-10`} style={{ fontSize: "14px", lineHeight: 1.7, marginTop: "12px" }}>
            The most accurate AI content detection platform. Trusted by universities, publishers, and enterprise teams worldwide.
          </p>

          <ul className="space-y-3.5">
            {features.map((f, i) => (
              <motion.li key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i + 0.3, duration: 0.4 }}
                className="flex items-center gap-3"
              >
                <CheckCircle className="h-4 w-4 text-indigo-400 shrink-0" />
                <span className={`text-[13px] ${textSecondary}`}>{f}</span>
              </motion.li>
            ))}
          </ul>

          <div className="mt-12 flex items-center gap-6">
            {[
              { val: "98.7%", label: "Accuracy" },
              { val: "2.4M+", label: "Scans/month" },
              { val: "150+", label: "Enterprise clients" },
            ].map((s, i) => (
              <div key={s.label} className="flex items-center gap-6">
                {i > 0 && <div className={`h-8 w-px ${isDark ? "bg-white/[0.06]" : "bg-slate-200"}`} />}
                <div className="text-center">
                  <div className={textPrimary} style={{ fontWeight: 700, fontSize: "22px" }}>{s.val}</div>
                  <div className={`text-[10px] ${textMuted}`} style={{ fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          @keyframes meshFloat1 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(8vw, 6vh) scale(1.08); }
            66% { transform: translate(-4vw, 3vh) scale(0.95); }
          }
          @keyframes meshFloat2 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(-6vw, 8vh) scale(1.05); }
            66% { transform: translate(5vw, -4vh) scale(0.97); }
          }
        `}</style>
      </div>

      {/* Right panel - Auth form */}
      <div className="flex flex-1 items-center justify-center p-6 lg:max-w-[480px]"
        style={{ background: isDark ? "#050505" : "#FBFBFD" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-[400px]"
        >
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ background: "linear-gradient(135deg, #4F46E5, #6366F1)" }}>
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className={`text-[18px] tracking-tight ${textPrimary}`} style={{ fontWeight: 600 }}>
              Veri<span className="text-indigo-500">AI</span>
            </span>
          </div>

          <div className="rounded-2xl p-8"
            style={{
              background: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.7)",
              backdropFilter: "blur(40px)",
              border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)",
              boxShadow: isDark
                ? "0 16px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)"
                : "0 16px 64px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)",
            }}>
            <div className={`flex mb-8 rounded-xl p-1 ${isDark ? "bg-white/[0.03]" : "bg-slate-100/60"}`}>
              {(["login", "signup"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTab(t);
                    setFormError(null);
                    clearAuthError();
                  }}
                  className={`flex-1 rounded-lg py-2.5 text-[12px] transition-all ${
                    tab === t
                      ? isDark ? "bg-white/[0.08] text-white shadow-sm" : "bg-white text-slate-900 shadow-sm"
                      : isDark ? "text-white/35 hover:text-white/55" : "text-slate-500 hover:text-slate-700"
                  }`}
                  style={{ fontWeight: tab === t ? 500 : 400 }}
                >
                  {t === "login" ? "Sign In" : "Create Account"}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={tab}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}>
                <h2 className={`mb-1 ${textPrimary}`} style={{ fontSize: "20px", fontWeight: 600 }}>
                  {tab === "login" ? "Welcome back" : "Create your account"}
                </h2>
                <p className={`mb-6 text-[12px] ${textSecondary}`}>
                  {tab === "login"
                    ? "Sign in to access your dashboard and scan history."
                    : "Start detecting AI content in seconds. Free plan included."}
                </p>

                {(formError || authError) && (
                  <div
                    className="mb-4 rounded-xl border border-red-500/25 bg-red-500/8 px-3 py-2 text-[11px]"
                    style={{ color: isDark ? "rgba(254,202,202,0.95)" : "#B91C1C" }}
                  >
                    {formError || authError}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3.5">
                  {tab === "signup" && (
                    <div>
                      <label className={`block text-[11px] mb-1.5 ${textSecondary}`} style={{ fontWeight: 500 }}>Full Name</label>
                      <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className={`w-full rounded-xl border px-4 py-3 text-[13px] outline-none transition-all ${inputBase}`} />
                    </div>
                  )}

                  <div>
                    <label className={`block text-[11px] mb-1.5 ${textSecondary}`} style={{ fontWeight: 500 }}>Email Address</label>
                    <div className="relative">
                      <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 ${textMuted}`} />
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        className={`w-full rounded-xl border pl-10 pr-4 py-3 text-[13px] outline-none transition-all ${inputBase}`} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1.5">
                      <label className={`text-[11px] ${textSecondary}`} style={{ fontWeight: 500 }}>Password</label>
                      {tab === "login" && (
                        <button type="button" className="text-[11px] text-indigo-400 hover:text-indigo-300">Forgot password?</button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 ${textMuted}`} />
                      <input type={showPassword ? "text" : "password"} value={password}
                        onChange={(e) => setPassword(e.target.value)} placeholder="--------"
                        className={`w-full rounded-xl border pl-10 pr-11 py-3 text-[13px] outline-none transition-all ${inputBase}`} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className={`absolute right-3.5 top-1/2 -translate-y-1/2 ${textMuted} hover:text-indigo-400 transition-colors`}>
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" disabled={isLoading}
                    className={`mt-2 flex w-full items-center justify-center gap-2.5 rounded-xl py-3.5 text-[13px] text-white transition-all hover:opacity-95 disabled:opacity-60 ${!isLoading ? "login-btn-animated" : "login-btn-static"}`}
                    style={{
                      fontWeight: 500,
                      boxShadow: "0 4px 24px rgba(99,102,241,0.3)",
                    }}>
                    {isLoading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        {tab === "login" ? "Signing in..." : "Creating account..."}
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        {tab === "login" ? "Sign In" : "Get Started Free"}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                </form>

                <div className="flex items-center gap-3 my-5">
                  <div className={`flex-1 h-px ${dividerColor}`} />
                  <span className={`text-[10px] ${dividerText}`}>or continue with</span>
                  <div className={`flex-1 h-px ${dividerColor}`} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Google", icon: "G" },
                    { label: "GitHub", icon: <Github className="h-4 w-4" /> },
                  ].map((s) => (
                    <button key={s.label} type="button"
                      onClick={() => {
                        setFormError("OAuth login is not configured yet. Use email and password.");
                      }}
                      className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-[12px] transition-all ${socialBtn}`}
                      style={{ fontWeight: 500 }}>
                      {typeof s.icon === "string" ? (
                        <span className="text-[14px]" style={{ fontWeight: 700 }}>{s.icon}</span>
                      ) : s.icon}
                      {s.label}
                    </button>
                  ))}
                </div>

                <p className={`mt-5 text-center text-[11px] ${textMuted}`}>
                  {tab === "login" ? "Don't have an account? " : "Already have an account? "}
                  <button
                    type="button"
                    onClick={() => {
                      setTab(tab === "login" ? "signup" : "login");
                      setFormError(null);
                      clearAuthError();
                    }}
                    className="text-indigo-400 hover:text-indigo-300 transition-colors" style={{ fontWeight: 500 }}>
                    {tab === "login" ? "Sign up free" : "Sign in"}
                  </button>
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <p className={`text-center mt-5 text-[10px] ${textMuted}`}>
            By continuing, you agree to our{" "}
            <span className="text-indigo-400 cursor-pointer">Terms of Service</span>
            {" "}and{" "}
            <span className="text-indigo-400 cursor-pointer">Privacy Policy</span>.
          </p>
        </motion.div>
      </div>

      <style>{`
        .login-btn-animated {
          background: linear-gradient(135deg, #4F46E5, #6366F1, #4F46E5);
          background-size: 200% 200%;
          animation: gradientShift 3s ease infinite;
        }
        .login-btn-static {
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