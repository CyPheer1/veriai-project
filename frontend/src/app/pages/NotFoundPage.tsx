import { useNavigate } from "react-router";
import { useApp } from "../context/AppContext";

export function NotFoundPage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useApp();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f4f7fb] px-6 text-center">
      {/* Decorative ring */}
      <div className="relative mb-8 flex h-28 w-28 items-center justify-center">
        <div className="absolute inset-0 rounded-full border-[2px] border-dashed border-[#c3d1e8] opacity-60" />
        <div className="absolute inset-3 rounded-full border-[1.5px] border-[#d8e3f2] opacity-40" />
        <span className="veriai-mono relative text-[42px] font-bold tracking-tight text-[#1263F1]">
          404
        </span>
      </div>

      {/* Logo mark */}
      <div className="mb-6 flex h-10 w-10 items-center justify-center">
        <img
          src="/assets/veri4i-sidebar-mark.png"
          alt="veri4i"
          className="h-10 w-10 object-contain opacity-70"
          draggable={false}
        />
      </div>

      <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-[#07112f]">
        Page not found
      </h1>
      <p className="mt-3 max-w-[34ch] text-[14px] font-medium leading-6 text-[#52627a]">
        The page you're looking for doesn't exist or may have been moved.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="veriai-pressable flex h-10 items-center gap-2 rounded-[10px] border border-[#d0dcea] bg-white px-5 text-[14px] font-semibold text-[#274169] shadow-[0_1px_3px_rgba(15,23,42,0.06)] hover:bg-[#f0f5fb]"
        >
          ← Go back
        </button>
        <button
          type="button"
          onClick={() => navigate(isLoggedIn ? "/dashboard" : "/")}
          className="veriai-pressable flex h-10 items-center gap-2 rounded-[10px] bg-[#1263F1] px-5 text-[14px] font-semibold text-white shadow-[0_10px_24px_-16px_rgba(18,99,241,0.9)] hover:bg-[#0d54d5]"
        >
          {isLoggedIn ? "Go to dashboard" : "Go to home"}
        </button>
      </div>
    </div>
  );
}
