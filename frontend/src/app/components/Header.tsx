import { Shield, Sun, Moon, LogOut, ChevronDown, LayoutDashboard, Clock, BookOpen } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface HeaderProps {
  variant?: "guest" | "auth";
}

export function Header({ variant = "auth" }: HeaderProps) {
  const { isDark, toggleTheme, isLoggedIn, logout, user } = useApp();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Spatial glass tokens
  const islandBg = isDark
    ? "bg-[rgba(15,17,26,0.80)] backdrop-blur-[40px] border-[rgba(255,255,255,0.07)]"
    : "bg-[rgba(255,255,255,0.85)] backdrop-blur-[40px] border-[rgba(255,255,255,0.90)]";
  const islandShadow = isDark
    ? "shadow-[0_8px_40px_rgba(0,0,0,0.50),inset_0_1px_0_rgba(255,255,255,0.04)]"
    : "shadow-[0_8px_32px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.04)]";
  const textPrimary = isDark ? "text-[rgba(255,255,255,0.88)]" : "text-[#0F111A]";
  const textSecondary = isDark ? "text-[rgba(255,255,255,0.4)]" : "text-[#6B7280]";
  const navActive = isDark
    ? "bg-[rgba(255,255,255,0.08)] text-[rgba(255,255,255,0.92)]"
    : "bg-[rgba(99,102,241,0.08)] text-[#4338CA]";
  const navDefault = isDark
    ? "text-[rgba(255,255,255,0.38)] hover:bg-[rgba(255,255,255,0.05)] hover:text-[rgba(255,255,255,0.7)]"
    : "text-[#6B7280] hover:bg-[rgba(0,0,0,0.04)] hover:text-[#374151]";
  const themeBtn = isDark
    ? "text-[rgba(255,255,255,0.3)] hover:text-[rgba(255,255,255,0.6)] hover:bg-[rgba(255,255,255,0.06)]"
    : "text-[#9CA3AF] hover:text-[#4B5563] hover:bg-[rgba(0,0,0,0.04)]";
  const dropdownBg = isDark
    ? "bg-[rgba(12,12,18,0.92)] backdrop-blur-[40px] border-[rgba(255,255,255,0.07)]"
    : "bg-[rgba(255,255,255,0.92)] backdrop-blur-[40px] border-[rgba(0,0,0,0.08)] shadow-[0_16px_64px_rgba(0,0,0,0.12)]";

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard },
    { label: "History", icon: Clock },
    { label: "Docs", icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-50 flex justify-center px-4 pt-4 pb-2">
      <div className={`flex items-center gap-1.5 rounded-full border px-2 py-1.5 ${islandBg} ${islandShadow}`}>
        {/* Logo */}
        <button
          onClick={() => navigate(isLoggedIn ? "/dashboard" : "/")}
          className="flex items-center gap-2 pl-2 pr-3"
        >
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg"
            style={{
              background: "linear-gradient(135deg, #4F46E5, #6366F1)",
              boxShadow: "0 2px 12px rgba(79,70,229,0.3)",
            }}
          >
            <Shield className="h-3.5 w-3.5 text-white" />
          </div>
          <span className={`text-[14px] tracking-tight ${textPrimary}`} style={{ fontWeight: 600 }}>
            Veri<span style={{ color: "#6366F1" }}>AI</span>
          </span>
        </button>

        {/* Separator */}
        <div className={`h-5 w-px ${isDark ? "bg-white/[0.06]" : "bg-black/[0.06]"}`} />

        {/* Nav items */}
        {variant === "auth" && isLoggedIn && (
          <nav className="hidden items-center gap-0.5 px-1 md:flex">
            {navItems.map((item, i) => (
              <button
                key={item.label}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] transition-all ${
                  i === 0 ? navActive : navDefault
                }`}
                style={{ fontWeight: i === 0 ? 500 : 400 }}
              >
                <item.icon className="h-3 w-3" />
                {item.label}
              </button>
            ))}
          </nav>
        )}

        {variant === "guest" && !isLoggedIn && (
          <nav className="hidden items-center gap-0.5 px-1 md:flex">
            <button className={`rounded-full px-3.5 py-1.5 text-[12px] ${navActive}`} style={{ fontWeight: 500 }}>
              Analyze
            </button>
            <button className={`rounded-full px-3.5 py-1.5 text-[12px] ${navDefault}`}>
              Pricing
            </button>
            <button className={`rounded-full px-3.5 py-1.5 text-[12px] ${navDefault}`}>
              API
            </button>
          </nav>
        )}

        {/* Separator */}
        <div className={`h-5 w-px ${isDark ? "bg-white/[0.06]" : "bg-black/[0.06]"}`} />

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className={`flex h-7 w-7 items-center justify-center rounded-full transition-all ${themeBtn}`}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          <AnimatePresence mode="wait">
            {isDark ? (
              <motion.div
                key="sun"
                initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 90, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <Sun className="h-3.5 w-3.5" />
              </motion.div>
            ) : (
              <motion.div
                key="moon"
                initial={{ opacity: 0, rotate: 90, scale: 0.8 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: -90, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <Moon className="h-3.5 w-3.5" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        {/* Guest actions */}
        {variant === "guest" && !isLoggedIn && (
          <>
            <button
              onClick={() => navigate("/login")}
              className={`rounded-full px-3.5 py-1.5 text-[12px] transition-all ${navDefault}`}
              style={{ fontWeight: 500 }}
            >
              Log In
            </button>
            <button
              onClick={() => navigate("/login")}
              className="rounded-full px-4 py-1.5 text-[12px] text-white transition-all"
              style={{
                fontWeight: 500,
                background: "linear-gradient(135deg, #4F46E5, #6366F1)",
                boxShadow: "0 2px 12px rgba(79,70,229,0.3)",
              }}
            >
              Get Started
            </button>
          </>
        )}

        {/* Auth user menu */}
        {variant === "auth" && isLoggedIn && user && (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`flex items-center gap-1.5 rounded-full p-1 pr-2 transition-all ${
                isDark ? "hover:bg-white/[0.05]" : "hover:bg-slate-100"
              }`}
            >
              <div
                className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] text-white"
                style={{ fontWeight: 600, background: "linear-gradient(135deg, #4F46E5, #6366F1)" }}
              >
                {user.initials}
              </div>
              <ChevronDown
                className={`h-3 w-3 transition-transform ${dropdownOpen ? "rotate-180" : ""} ${textSecondary}`}
              />
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className={`absolute right-0 top-full mt-2 w-52 rounded-2xl border p-1.5 ${dropdownBg}`}
                >
                  <div className={`px-3 py-2.5 border-b mb-1 ${isDark ? "border-white/[0.06]" : "border-slate-100"}`}>
                    <div className={`text-[12px] ${textPrimary}`} style={{ fontWeight: 500 }}>{user.name}</div>
                    <div className={`text-[11px] ${textSecondary} truncate`}>{user.email}</div>
                  </div>
                  {["Profile Settings", "Billing", "API Keys"].map((item) => (
                    <button
                      key={item}
                      className={`w-full text-left rounded-lg px-3 py-2 text-[12px] transition-all ${
                        isDark ? "text-white/55 hover:bg-white/[0.05] hover:text-white/85" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                  <div className={`border-t mt-1 pt-1 ${isDark ? "border-white/[0.06]" : "border-slate-100"}`}>
                    <button
                      onClick={() => { logout(); navigate("/"); setDropdownOpen(false); }}
                      className="w-full text-left flex items-center gap-2 rounded-lg px-3 py-2 text-[12px] text-red-400 hover:bg-red-500/[0.06] transition-all"
                    >
                      <LogOut className="h-3 w-3" />
                      Sign out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </header>
  );
}