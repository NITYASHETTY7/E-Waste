"use client";

import { useApp } from "@/context/AppContext";
import { motion } from "framer-motion";
import { formatDate } from "@/utils/format";
import Link from "next/link";

export default function ConsumerDashboard() {
  const { currentUser, listings } = useApp();
  
  const userPickups = listings.filter(l => l.userId === currentUser?.id);
  
  const stats = [
    { label: "Waste Diverted", value: "124 KG", icon: "eco", color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Pickups Done", value: "8", icon: "local_shipping", color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Impact Score", value: "98/100", icon: "star", color: "text-[#e6ae06]", bg: "bg-[#FFC107]/10" },
    { label: "Earnings", value: "₹2,450", icon: "payments", color: "text-purple-600", bg: "bg-purple-50" },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] p-6 md:p-10 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <p className="text-[10px] font-black text-[#e6ae06] uppercase tracking-[0.3em]">Individual Portal</p>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight dark:text-white">
              Hello, <span className="text-[#FFC107]">{currentUser?.name?.split(' ')[0]}</span>!
            </h1>
            <p className="text-slate-500 font-medium text-sm">Thank you for disposing of your e-waste responsibly with We Connect.</p>
          </div>
          <Link href="/consumer/pickup" className="px-8 py-5 bg-[#FFC107] text-[#0f172a] rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-yellow-700/20 active:scale-95 transition-all flex items-center gap-3">
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            Schedule Pickup
          </Link>
        </div>

        {/* Stats Grid */}
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {stats.map((s, i) => (
            <motion.div key={i} variants={item} className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all group relative overflow-hidden dark:bg-slate-900 dark:border-slate-800">
              <div className="flex items-center justify-between mb-5">
                <div className={`w-14 h-14 rounded-2xl ${s.bg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                  <span className={`material-symbols-outlined text-2xl ${s.color}`}>{s.icon}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Lifetime</span>
                  <div className="w-8 h-1 bg-slate-100 rounded-full dark:bg-slate-800" />
                </div>
              </div>
              <p className="text-3xl font-black text-slate-900 mb-1 dark:text-white">{s.value}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
              
              {/* Subtle mesh background for accent cards */}
              {s.color.includes('amber') || s.color.includes('e6ae06') ? (
                <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-[#FFC107]/5 rounded-full blur-2xl" />
              ) : null}
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
          
          {/* Active Pickups */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-[#FFC107] rounded-full" />
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight dark:text-white">Active Requests</h2>
              </div>
              <button className="text-[10px] font-black text-[#e6ae06] uppercase tracking-[0.2em] border-b-2 border-[#FFC107]/30 hover:border-[#FFC107] pb-0.5 transition-all">View History</button>
            </div>
            
            <div className="space-y-4">
              {userPickups.length > 0 ? (
                userPickups.map((pickup) => (
                  <div key={pickup.id} className="group bg-white border border-slate-100 p-7 rounded-[2.5rem] flex items-center justify-between hover:border-[#FFC107]/40 transition-all shadow-sm hover:shadow-lg dark:bg-slate-900 dark:border-slate-800">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-yellow-50/50 transition-colors dark:bg-slate-950 dark:border-slate-800">
                        <span className="material-symbols-outlined text-slate-400 group-hover:text-[#FFC107] text-2xl transition-colors">inventory_2</span>
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-lg dark:text-white">{pickup.title}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID: {pickup.id}</p>
                          <span className="w-1 h-1 bg-slate-300 rounded-full" />
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{formatDate(pickup.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right hidden sm:block">
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2">Tracking Status</p>
                        <span className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                          pickup.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                          pickup.status === 'verified' ? 'bg-[#FFC107]/20 text-[#e6ae06]' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {pickup.status}
                        </span>
                      </div>
                      <button className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-[#FFC107] group-hover:text-[#0f172a] transition-all duration-300 dark:bg-slate-950">
                        <span className="material-symbols-outlined">chevron_right</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white border-2 border-dashed border-slate-200 p-16 rounded-[3rem] text-center space-y-6 dark:bg-slate-900 dark:border-slate-700">
                  <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto ring-4 ring-white shadow-sm dark:bg-slate-950">
                    <span className="material-symbols-outlined text-slate-300 text-4xl">local_shipping</span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">No active disposal requests</h3>
                    <p className="text-slate-400 font-medium text-sm max-w-xs mx-auto text-balance">Earn rewards and help the environment by recycling your old electronics.</p>
                  </div>
                  <Link href="/consumer/pickup" className="inline-flex px-10 py-4 bg-[#0f172a] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transform active:scale-95 hover:bg-[#FFC107] hover:text-[#0f172a] transition-all">
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Environmental Impact Card */}
          <div className="space-y-6">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight px-2 dark:text-white">Environmental Impact</h2>
            <div className="bg-slate-900 rounded-[3rem] p-9 text-white relative overflow-hidden shadow-2xl shadow-slate-900/30">
              <div className="absolute top-[-10%] right-[-10%] w-40 h-40 bg-[#FFC107]/20 rounded-full blur-[60px]" />
              <div className="absolute bottom-[-10%] left-[-10%] w-40 h-40 bg-emerald-500/10 rounded-full blur-[60px]" />
              
              <div className="relative z-10 space-y-10">
                <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
                  <span className="material-symbols-outlined text-[#FFC107] text-3xl">public</span>
                </div>
                
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-[#FFC107] uppercase tracking-[0.3em]">Carbon Neutralized</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-6xl font-black tracking-tighter">42.8</p>
                    <p className="text-xl font-bold text-slate-400">Tons</p>
                  </div>
                </div>

                <div className="pt-8 border-t border-white/5 space-y-8">
                  <p className="text-xs font-medium text-slate-400 leading-relaxed">
                    Personal disposal contributes significantly to reducing toxic lead and mercury in our local ecosystems. Thank you for your commitment!
                  </p>
                  <button className="w-full py-5 bg-[#FFC107] text-[#0f172a] rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-yellow-100 transition-all shadow-lg hover:shadow-yellow-700/10 active:scale-[0.98]">
                    Share Achievement
                  </button>
                </div>
              </div>
            </div>
            
            {/* Quick Tips */}
            <div className="bg-[#FFC107] p-8 rounded-[2.5rem] relative overflow-hidden group hover:scale-[1.02] transition-all">
              <span className="material-symbols-outlined absolute right-6 top-6 text-yellow-800/10 text-7xl font-black group-hover:scale-110 transition-transform">lightbulb</span>
              <p className="text-[9px] font-black text-yellow-900 uppercase tracking-[0.2em] mb-2">Pro Tip</p>
              <p className="text-sm font-black text-yellow-900 max-w-[80%] leading-relaxed">Remove all rechargeable batteries before packing smaller devices for pickup.</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

