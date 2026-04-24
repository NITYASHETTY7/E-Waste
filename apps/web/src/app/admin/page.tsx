"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useApp();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise(r => setTimeout(r, 600)); // Simulate auth check
    if (password === "admin123") {
      login("admin", "Super Admin");
      router.push("/admin/dashboard");
    } else {
      setError("Invalid access key. Please verify your credentials.");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#0b1f1e] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Subtle background grid pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(150,243,228,0.4) 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[color:var(--color-primary)] opacity-10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-[color:var(--color-primary-fixed)] opacity-10 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10">
        {/* Security badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-[color:var(--color-primary-fixed)]/10 border border-[color:var(--color-primary-fixed)]/20 text-[color:var(--color-primary-fixed-dim)] px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
            <span className="material-symbols-outlined text-sm">security</span>
            Restricted Access — Admin Only
          </div>
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[color:var(--color-primary-container)] flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-3xl text-[color:var(--color-on-primary-container)]">admin_panel_settings</span>
          </div>
          <h1 className="text-3xl font-bold font-headline text-white mb-2">WeConnect Console</h1>
          <p className="text-slate-400 text-sm">Enterprise administration portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#0F2A3F] rounded-2xl p-8 border border-slate-700/50 shadow-[0_32px_64px_rgba(0,0,0,0.4)]">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 block">
                Administrator Access Key
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#203433] border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-[color:var(--color-primary-fixed)] outline-none font-mono placeholder-slate-600 transition-all"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-800/30 rounded-lg">
                <span className="material-symbols-outlined text-red-400 text-sm">error</span>
                <p className="text-red-400 text-xs">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-4 rounded-xl justify-center disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                  Authenticating...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">lock_open</span>
                  Authenticate
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-700/50 text-center space-y-2">
            <p className="text-xs text-slate-500">
              Demo credentials: <span className="text-slate-300 font-mono">admin123</span>
            </p>
            <a href="/" className="text-xs text-slate-500 hover:text-slate-300 transition-colors block">
              ← Return to public gateway
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
