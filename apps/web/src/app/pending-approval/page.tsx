"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { motion } from "framer-motion";

function PendingApprovalContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "your email";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA] dark:bg-slate-950 p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#1E8E3E]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#0B5ED7]/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-10 text-center shadow-2xl relative z-10"
      >
        <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-8 relative">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
            className="absolute inset-0 border-4 border-dashed border-emerald-200 dark:border-emerald-800/50 rounded-full" 
          />
          <span className="material-symbols-outlined text-4xl text-[#1E8E3E]">verified</span>
        </div>

        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
          Registration Complete - Under Review
        </h1>
        
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6 font-medium">
          Thank you for completing your registration! Your account is currently being reviewed by our admin team.
        </p>

        <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 mb-8 inline-block">
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            You will be notified about the updates via email at:<br/>
            <strong className="text-slate-900 dark:text-white mt-1 block">{email}</strong><br/>
            within 24-72 hours. Thank you for your patience.
          </p>
        </div>

        <button 
          onClick={() => router.push('/')}
          className="w-full py-4 bg-[#1E8E3E] hover:bg-emerald-700 text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">home</span>
          Back to Home
        </button>
      </motion.div>
    </div>
  );
}

export default function PendingApprovalPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA] dark:bg-slate-950">
        <div className="w-8 h-8 border-4 border-[#1E8E3E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <PendingApprovalContent />
    </Suspense>
  );
}