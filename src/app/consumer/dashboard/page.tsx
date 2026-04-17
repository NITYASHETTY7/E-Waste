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
    { label: "Impact Score", value: "98/100", icon: "star", color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Rewards", value: "2,450", icon: "payments", color: "text-purple-600", bg: "bg-purple-50" },
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
    <div className="min-h-screen bg-[#F5F7FA] p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
              Welcome back, <span className="text-[#1E8E3E]">{currentUser?.name?.split(' ')[0]}</span>!
            </h1>
            <p className="text-slate-500 font-medium">Your e-waste disposal is making a difference today.</p>
          </div>
          <Link href="/consumer/pickup" className="btn-primary flex items-center gap-2 px-8 py-4 shadow-xl shadow-emerald-700/20 active:scale-95 transition-all">
            <span className="material-symbols-outlined">add_circle</span>
            Schedule New Pickup
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
            <motion.div key={i} variants={item} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl ${s.bg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                  <span className={`material-symbols-outlined ${s.color}`}>{s.icon}</span>
                </div>
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Lifetime</span>
              </div>
              <p className="text-3xl font-black text-slate-900 mb-1">{s.value}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Active Pickups */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Active Requests</h2>
              <button className="text-xs font-black text-[#1E8E3E] uppercase tracking-widest hover:underline">View History</button>
            </div>
            
            <div className="space-y-4">
              {userPickups.length > 0 ? (
                userPickups.map((pickup) => (
                  <div key={pickup.id} className="bg-white border border-slate-100 p-6 rounded-[2rem] flex items-center justify-between hover:border-[#1E8E3E]/30 transition-all shadow-sm">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                        <span className="material-symbols-outlined text-slate-400 text-2xl">inventory_2</span>
                      </div>
                      <div>
                        <p className="font-black text-slate-900">{pickup.title}</p>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Requested: {formatDate(pickup.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs font-black text-slate-300 uppercase tracking-widest mb-1">Status</p>
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          pickup.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                          pickup.status === 'verified' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {pickup.status}
                        </span>
                      </div>
                      <button className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 transition-colors">
                        <span className="material-symbols-outlined">chevron_right</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white border-2 border-dashed border-slate-200 p-12 rounded-[2.5rem] text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                    <span className="material-symbols-outlined text-slate-300 text-3xl">local_shipping</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">No active requests</h3>
                    <p className="text-sm text-slate-400 font-medium">Clear some space and help the planet by scheduling a pickup.</p>
                  </div>
                  <Link href="/consumer/pickup" className="inline-block px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transform active:scale-95 transition-all">
                    Schedule Now
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Environmental Impact Card */}
          <div className="space-y-6">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight px-2">Global Impact</h2>
            <div className="bg-[#0B5ED7] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-900/20">
              <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute bottom-[-10%] left-[-10%] w-32 h-32 bg-white/5 rounded-full blur-2xl" />
              
              <div className="relative z-10 space-y-8">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-2xl">public</span>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-bold text-blue-100 opacity-80 uppercase tracking-widest">Carbon Neutralized</p>
                  <p className="text-5xl font-black tracking-tighter">42.8<span className="text-xl font-bold ml-2">Tons</span></p>
                </div>

                <div className="pt-6 border-t border-white/10">
                  <p className="text-xs font-medium text-blue-100 leading-relaxed mb-6">
                    Join thousands of users across We Connect who are building a sustainable circular economy.
                  </p>
                  <button className="w-full py-4 bg-white text-[#0B5ED7] rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-50 transition-all">
                    Share My Contribution
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
