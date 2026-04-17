"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { motion, AnimatePresence } from "framer-motion";

type AuthTab = "login" | "register";

export default function UserLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useApp();
  
  const initialTab = (searchParams.get("tab") as AuthTab) || "login";
  const [activeTab, setActiveTab] = useState<AuthTab>(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t === "login" || t === "register") {
      setActiveTab(t);
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    login("user", loginEmail);
    router.push("/consumer/pickup");
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (regPassword !== regConfirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    login("user", regEmail);
    router.push("/consumer/pickup");
    setLoading(false);
  };

  const quickDemo = () => {
    setLoginEmail("guest@weconnect.com");
    setLoginPassword("password");
    setActiveTab("login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[#F5F7FA]">
      {/* Brand Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#FFC107]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#1E8E3E]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-[480px] relative z-10">
        {/* Quick Demo Access Bar */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6 flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-4 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FFC107]/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#e6ae06] text-sm">info</span>
            </div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Testing the portal?</p>
          </div>
          <button 
            onClick={quickDemo}
            className="px-4 py-2 bg-[#FFC107] text-[#0f172a] text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-[#e6ae06] transition-all shadow-md active:scale-95"
          >
            Quick Demo
          </button>
        </motion.div>

        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFC107]/5 rounded-full blur-3xl pointer-events-none" />
          
          {/* Branding */}
          <div className="flex justify-center mb-10 cursor-pointer" onClick={() => router.push('/')}>
            <img src="/logo%203.png" alt="We Connect" className="h-10 object-contain brightness-0" />
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-slate-50 p-1.5 rounded-2xl mb-10 border border-slate-100">
            {(["login", "register"] as const).map(t => (
              <button 
                key={t}
                onClick={() => { setActiveTab(t); setError(""); }}
                className={`flex-1 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all ${
                  activeTab === t 
                    ? "bg-[#FFC107] text-[#0f172a] shadow-lg shadow-yellow-700/20" 
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {t === "login" ? "Sign In" : "Register"}
              </button>
            ))}
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

          <AnimatePresence mode="wait">
            {activeTab === "login" ? (
              <motion.div 
                key="login"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">User Portal</h2>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Individual Generator</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 mb-2 block">Email Address</label>
                    <input type="email" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                      placeholder="name@example.com" 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-300 focus:border-[#FFC107] focus:bg-white focus:ring-4 focus:ring-[#FFC107]/5 outline-none transition-all font-medium" 
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Password</label>
                      <button type="button" className="text-[10px] font-black text-[#e6ae06] uppercase tracking-widest hover:underline">Forgot?</button>
                    </div>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} required value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                        placeholder="••••••••" 
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-300 focus:border-[#FFC107] focus:bg-white focus:ring-4 focus:ring-[#FFC107]/5 outline-none transition-all font-mono" 
                      />
                      <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors">
                        <span className="material-symbols-outlined text-xl">{showPassword ? "visibility_off" : "visibility"}</span>
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="w-full py-5 bg-[#FFC107] text-[#0f172a] font-black text-[11px] uppercase tracking-[0.3em] rounded-2xl mt-8 hover:bg-[#e6ae06] hover:shadow-2xl hover:shadow-[#FFC107]/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50">
                    {loading ? <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span> : <><span className="material-symbols-outlined text-lg">login</span> Secure Entry</>}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div 
                key="register"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Join We Connect</h2>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Dispose E-Waste Responsibly</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Full Name</label>
                      <input type="text" required value={regName} onChange={e => setRegName(e.target.value)} placeholder="John Doe" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:border-[#FFC107] outline-none transition-all" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Phone</label>
                      <input type="tel" required value={regPhone} onChange={e => setRegPhone(e.target.value)} placeholder="+91..." className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:border-[#FFC107] outline-none transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Email Address</label>
                    <input type="email" required value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="contact@example.com" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:border-[#FFC107] outline-none transition-all" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Password</label>
                      <input type="password" required value={regPassword} onChange={e => setRegPassword(e.target.value)} placeholder="Min. 8" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:border-[#FFC107] outline-none transition-all font-mono" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Confirm</label>
                      <input type="password" required value={regConfirm} onChange={e => setRegConfirm(e.target.value)} placeholder="Repeat" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:border-[#FFC107] outline-none transition-all font-mono" />
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="w-full py-5 bg-[#FFC107] text-[#0f172a] font-black text-[11px] uppercase tracking-[0.3em] rounded-2xl mt-6 hover:bg-[#e6ae06] shadow-xl hover:shadow-[#FFC107]/20 transition-all active:scale-[0.98]">
                    {loading ? <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span> : "Create Account"}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
