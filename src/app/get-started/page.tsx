"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { UserRole } from "@/types";

type AuthTab = "login" | "register";

export default function GetStartedPage() {
  const router = useRouter();
  const { login } = useApp();
  
  // States
  const [tab, setTab] = useState<AuthTab>("login");
  const [role, setRole] = useState<"client" | "vendor">("client");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      // Mimic API call
      await new Promise(r => setTimeout(r, 800));
      
      if (tab === "login") {
        login(role as UserRole, email);
        if (role === "client") router.push("/client/dashboard");
        else router.push("/vendor/dashboard");
      } else {
        router.push(`/onboarding/${role}/step1`);
      }
    } catch (err) {
      setError("Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (role: UserRole, emailAddr: string) => {
    login(role, emailAddr);
    if (role === "admin") router.push("/admin/dashboard");
    else if (role === "client") router.push("/client/dashboard");
    else if (role === "vendor") router.push("/vendor/dashboard");
    else router.push("/");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row overflow-hidden font-sans">
      
      {/* --- LEFT SIDEBAR (Emerald Green) --- */}
      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full lg:w-[40%] bg-[#065F46] p-8 lg:p-16 flex flex-col justify-between relative overflow-hidden text-white"
      >
        {/* Abstract Background Decor */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] border-[1px] border-white rounded-full" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] border-[1px] border-white rounded-full" />
        </div>

        <div className="relative z-10">
          <div className="mb-20 flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
             <img src="/logo%203.png" alt="We Connect" className="h-[40px] object-contain" />
             <span className="text-xl font-black tracking-tighter uppercase">We Connect</span>
          </div>

          <div className="space-y-4 mb-12">
            <p className="text-emerald-300 text-[10px] font-black uppercase tracking-[0.3em]">Sustainable Future</p>
            <h1 className="text-[2.5rem] lg:text-[3.5rem] font-black leading-[1.1] tracking-tighter mb-8">
              Transform E-Waste Into <br />
              <span className="italic text-emerald-300">Value</span>
            </h1>
            <p className="text-emerald-100/70 text-sm lg:text-base leading-relaxed max-w-md">
              India's leading platform connecting corporations with certified e-waste recyclers through transparent, real-time bidding.
            </p>
          </div>

          <div className="space-y-6">
            {[
              { icon: "verified", text: "CPCB Certified Vendors" },
              { icon: "rocket_launch", text: "Real-Time Bidding Engine" },
              { icon: "security", text: "Secure Settlements" },
              { icon: "energy_savings_leaf", text: "Verified Carbon Credits" }
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 + (idx * 0.1) }}
                className="flex items-center gap-4 group cursor-default"
              >
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/5 transition-all group-hover:bg-white/20 group-hover:scale-110">
                  <span className="material-symbols-outlined text-emerald-300 text-[20px]">{item.icon}</span>
                </div>
                <span className="text-sm font-bold text-white/90 group-hover:text-white transition-colors">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative z-10 pt-10 mt-20 border-t border-white/10">
          <div className="flex items-center gap-6">
            <div className="flex -space-x-4">
              {['GN', 'SC', 'ER', 'TK'].map((initials, i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-[#065F46] bg-emerald-700 flex items-center justify-center text-[10px] font-black shadow-xl ring-2 ring-emerald-900/20">
                  {initials}
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs font-black text-white">500+ Active Organizations</p>
              <p className="text-[10px] font-bold text-emerald-300">2.4K MT recycled this quarter</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* --- RIGHT CONTENT AREA (Light) --- */}
      <div className="flex-1 bg-[#F5F7FA] p-8 lg:p-16 flex flex-col items-center justify-center relative overflow-y-auto">
        <div className="w-full max-w-[500px] space-y-10">
          
          {/* Tabs */}
          <div className="flex p-1 bg-white rounded-2xl shadow-sm border border-slate-100">
            <button 
              onClick={() => setTab("login")}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${tab === 'login' ? 'bg-[#065F46] text-white shadow-lg shadow-emerald-900/20' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Sign In
            </button>
            <button 
              onClick={() => setTab("register")}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${tab === 'register' ? 'bg-[#065F46] text-white shadow-lg shadow-emerald-900/20' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Create Account
            </button>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-black text-slate-900 leading-tight">
              {tab === 'login' ? 'Welcome Back' : 'Get Started Now'}
            </h2>
            <p className="text-slate-500 text-sm font-medium">
              {tab === 'login' ? 'Sign in to your We Connect portal.' : 'Join the circular economy movement today.'}
            </p>
          </div>

          {/* Role Selection */}
          <div className="flex flex-col space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Login As</p>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setRole("client")}
                className={`p-4 rounded-2xl flex items-center justify-center gap-3 border-2 transition-all ${role === 'client' ? 'border-[#065F46] bg-emerald-50/50 shadow-sm' : 'border-slate-100 bg-white hover:border-slate-200'}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${role === 'client' ? 'bg-[#065F46] text-white' : 'bg-slate-50 text-slate-400'}`}>
                   <span className="material-symbols-outlined text-[18px]">corporate_fare</span>
                </div>
                <span className={`text-xs font-black uppercase tracking-widest ${role === 'client' ? 'text-[#065F46]' : 'text-slate-400'}`}>Corporate</span>
              </button>
              <button 
                onClick={() => setRole("vendor")}
                className={`p-4 rounded-2xl flex items-center justify-center gap-3 border-2 transition-all ${role === 'vendor' ? 'border-[#065F46] bg-emerald-50/50 shadow-sm' : 'border-slate-100 bg-white hover:border-slate-200'}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${role === 'vendor' ? 'bg-[#065F46] text-white' : 'bg-slate-50 text-slate-400'}`}>
                   <span className="material-symbols-outlined text-[18px]">recycling</span>
                </div>
                <span className={`text-xs font-black uppercase tracking-widest ${role === 'vendor' ? 'text-[#065F46]' : 'text-slate-400'}`}>Vendor</span>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Email Address</label>
              <div className="relative group">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full h-14 bg-white border border-slate-100 rounded-2xl px-5 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-[#065F46] transition-all shadow-sm group-hover:border-slate-200"
                  required
                />
                <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 text-[20px] pointer-events-none">mail</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Password</label>
                <button type="button" className="text-[9px] font-black text-emerald-600 uppercase tracking-widest hover:underline">Forgot?</button>
              </div>
              <div className="relative group">
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-14 bg-white border border-slate-100 rounded-2xl px-5 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-[#065F46] transition-all shadow-sm group-hover:border-slate-200"
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {error && (
              <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-[10px] font-bold uppercase tracking-widest px-1">
                {error}
              </motion.p>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-[#065F46] rounded-2xl text-white text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-900/20 hover:bg-[#064e40] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:pointer-events-none"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">login</span>
                  {tab === 'login' ? 'Sign In' : 'Create Account'}
                </>
              )}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="pt-10 border-t border-slate-100 space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Demo Accounts</p>
              <span className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-widest rounded-full border border-emerald-100">
                <div className="w-1 h-1 bg-emerald-600 rounded-full animate-pulse" />
                One-click login
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: "Client", email: "client@weconnect.com", role: "client" },
                { label: "Vendor", email: "vendor@weconnect.com", role: "vendor" },
                { label: "Admin", email: "admin@weconnect.com", role: "admin" }
              ].map((demo, i) => (
                <button 
                  key={i}
                  onClick={() => quickLogin(demo.role as UserRole, demo.email)}
                  className="bg-emerald-50/50 border border-emerald-100/50 rounded-2xl p-4 text-left hover:border-emerald-600 hover:bg-white transition-all group shadow-sm hover:shadow-md"
                >
                  <p className="text-[10px] font-black text-[#065F46] uppercase tracking-widest mb-1 group-hover:scale-105 transition-transform origin-left">{demo.label}</p>
                  <p className="text-[9px] font-bold text-[#1A4D2E]/60 lowercase truncate">{demo.email}</p>
                </button>
              ))}
            </div>

            <div className="text-center pt-2">
              <p className="text-[10px] font-bold text-slate-400">
                Admin portal: <button 
                  onClick={() => quickLogin("admin", "admin@weconnect.com")}
                  className="text-emerald-600 font-black hover:underline cursor-pointer"
                >
                  We Connect Console
                </button>
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
