"use client";

import React from "react";
import { motion } from "framer-motion";

export function AiAssistantCard() {
  return (
    <div className="mx-4 mt-6 p-5 rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 relative overflow-hidden shadow-xl shadow-indigo-500/20 group cursor-default">
      {/* Decorative Orbs */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />
      <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-purple-400/20 rounded-full blur-xl animate-pulse" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-lg animate-bounce">auto_awesome</span>
          </div>
          <span className="text-white font-bold text-sm tracking-tight">AI Assistant</span>
          <div className="ml-auto flex gap-0.5">
            {[1,2].map(i => <div key={i} className="w-1 h-1 rounded-full bg-white/40" />)}
          </div>
        </div>
        
        <p className="text-white/80 text-[10px] font-medium leading-relaxed mb-4 pr-2">
          Get insights and automate your daily tasks with our new smart assistant.
        </p>
        
        <button className="w-full h-9 bg-white text-indigo-600 rounded-xl text-xs font-black flex items-center justify-center gap-2 hover:bg-slate-50 active:scale-95 transition-all shadow-lg dark:bg-slate-900">
          Ask AI Assistant
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
