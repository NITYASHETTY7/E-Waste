"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";

export default function AdminLogin() {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { login, users } = useApp();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));

    const user = users.find(u => u.email.toLowerCase() === loginEmail.toLowerCase() && u.role === "admin");

    if (!user) {
      // If no seeded admin exists and they use an admin email, just mock login them
      if (loginEmail.toLowerCase().includes("admin")) {
        login("admin", loginEmail.split("@")[0] || "Admin");
        router.push("/admin/dashboard");
      } else {
        setError("Invalid admin credentials or account does not exist.");
        setLoading(false);
      }
      return;
    }

    login("admin", user.name);
    router.push("/admin/dashboard");
    setLoading(false);
  };

  const loadDemoAdmin = () => {
    setLoginEmail("admin@weconnect.com");
    setLoginPassword("password");
  };

  return (
    <main className="min-h-screen bg-[color:var(--color-surface)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle Background */}
      <div className="absolute inset-0 overflow-hidden -z-10 bg-slate-900">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-500 opacity-10 blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-blue-500 opacity-10 blur-3xl" />
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-700">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
            <span className="material-symbols-outlined text-emerald-400 text-xl">admin_panel_settings</span>
          </div>
          <div>
            <h1 className="font-headline font-extrabold text-slate-900 text-xl tracking-tighter dark:text-white">WeConnect Admin</h1>
            <p className="text-[9px] uppercase tracking-[0.2em] text-slate-500 font-bold -mt-0.5">Secure Console</p>
          </div>
        </div>

        {error && (
          <div className="mb-5 flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-xl text-xs font-bold animate-fade-in border border-red-100">
            <span className="material-symbols-outlined text-base">error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-1 block">Administrator Email</label>
            <input type="email" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
              placeholder={process.env.ADMIN_EMAIL} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:bg-white dark:focus:bg-slate-800 dark:focus:text-white transition-all font-medium dark:bg-slate-950 dark:border-slate-700" />
          </div>
          <div>
            <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-1 block">Security Key</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} required value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)} placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:bg-white dark:focus:bg-slate-800 dark:focus:text-white transition-all font-mono pr-12 dark:bg-slate-950 dark:border-slate-700" />
              <button type="button" onClick={() => setShowPassword(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700">
                <span className="material-symbols-outlined text-lg">{showPassword ? "visibility_off" : "visibility"}</span>
              </button>
            </div>
          </div>
          
          <button type="submit" disabled={loading}
            className="w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-70 transition-colors shadow-lg shadow-slate-900/20 mt-6">
            {loading ? (
              <><span className="material-symbols-outlined animate-spin text-lg">progress_activity</span> Authenticating...</>
            ) : (
              <><span className="material-symbols-outlined text-base">lock_open</span> Access Console</>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-100 pt-6 dark:border-slate-800">
          <p className="text-[10px] text-slate-500 mb-3">For presentation purposes only</p>
          <button type="button" onClick={loadDemoAdmin} className="text-xs font-bold text-emerald-600 hover:underline bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 transition-colors">
            Load Demo Credentials
          </button>
        </div>
      </div>
    </main>
  );
}

