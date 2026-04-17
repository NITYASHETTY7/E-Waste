"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminLoginPage() {
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
    await new Promise(r => setTimeout(r, 1200));

    const user = users.find(u => u.email.toLowerCase() === loginEmail.toLowerCase());

    if (!user) {
      if (loginEmail === "admin@weconnect.com" && loginPassword === "password") {
         login("admin", loginEmail);
         router.push("/admin/dashboard");
      } else {
         setError("Invalid administrative credentials.");
      }
      setLoading(false);
      return;
    }

    if (user.role !== "admin") {
      setError("Unauthorized access. Admin privileges required.");
      setLoading(false);
      return;
    }

    login("admin", user.email);
    router.push("/admin/dashboard");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[#F5F7FA]">
      {/* Brand Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#0B5ED7]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#1E8E3E]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-[480px] relative z-10">
        {/* Security Badge */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6 flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-4 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-slate-500 text-sm">shield_lock</span>
            </div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Administrative Control</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em]">Live</span>
          </div>
        </motion.div>

        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#0B5ED7]/5 rounded-full blur-3xl pointer-events-none" />
          
          {/* Branding */}
          <div className="flex justify-center mb-10 cursor-pointer" onClick={() => router.push('/')}>
            <img src="/logo%203.png" alt="We Connect" className="h-10 object-contain brightness-0" />
          </div>

          <div className="text-center mb-10">
            <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Access Portal</h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Enterprise Login</p>
          </div>

          {error && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3"
            >
              <span className="material-symbols-outlined text-red-500 text-sm">error</span>
              <p className="text-red-700 text-xs font-bold">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 mb-2 block">Admin Identifier</label>
              <input type="text" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                placeholder="admin@weconnect.com" 
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-300 focus:border-[#0B5ED7] focus:bg-white focus:ring-4 focus:ring-[#0B5ED7]/5 outline-none transition-all font-medium" 
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Pin Code</label>
                <button type="button" className="text-[10px] font-black text-[#0B5ED7] uppercase tracking-widest hover:underline">Reset</button>
              </div>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} required value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-300 focus:border-[#0B5ED7] focus:bg-white focus:ring-4 focus:ring-[#0B5ED7]/5 outline-none transition-all font-mono" 
                />
                <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors">
                  <span className="material-symbols-outlined text-xl">{showPassword ? "visibility_off" : "visibility"}</span>
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full py-5 bg-[#0B5ED7] text-white font-black text-[11px] uppercase tracking-[0.3em] rounded-2xl mt-8 hover:bg-[#084295] shadow-xl hover:shadow-[#0B5ED7]/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50">
              {loading ? <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span> : <><span className="material-symbols-outlined text-lg">admin_panel_settings</span> Secure Admin Login</>}
            </button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.4em]">Proprietary System — Unauthorized trace will occur</p>
          </div>
        </div>
      </div>
    </div>
  );
}
