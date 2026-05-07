import React from 'react';
import { motion } from 'framer-motion';

export type DealStage = 
  | "onboarded" 
  | "requirement_finalized" 
  | "audit" 
  | "sealed_bid" 
  | "auction" 
  | "finalized" 
  | "payment" 
  | "pickup" 
  | "completed";

const STAGES: { id: DealStage; label: string; icon: string }[] = [
  { id: "onboarded", label: "Onboarded", icon: "how_to_reg" },
  { id: "requirement_finalized", label: "Requirement", icon: "list_alt" },
  { id: "audit", label: "Audit", icon: "fact_check" },
  { id: "sealed_bid", label: "Sealed Bid", icon: "lock" },
  { id: "auction", label: "Auction", icon: "gavel" },
  { id: "finalized", label: "Finalized", icon: "handshake" },
  { id: "payment", label: "Payment", icon: "payments" },
  { id: "pickup", label: "Pickup", icon: "local_shipping" },
  { id: "completed", label: "Completed", icon: "verified" },
];

export function StatusStepper({ currentStage }: { currentStage: DealStage }) {
  const currentIndex = STAGES.findIndex(s => s.id === currentStage);

  return (
    <div className="w-full py-6 overflow-x-auto hide-scrollbar">
      <div className="min-w-[800px] flex items-center justify-between relative px-4">
        {/* Background Line */}
        <div className="absolute top-5 left-8 right-8 h-1 bg-slate-200 dark:bg-slate-800 -z-10" />
        
        {/* Progress Line */}
        <motion.div 
          className="absolute top-5 left-8 h-1 bg-[#1E8E3E] -z-10"
          initial={{ width: "0%" }}
          animate={{ width: `${(currentIndex / (STAGES.length - 1)) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          style={{ width: `calc(${(currentIndex / (STAGES.length - 1)) * 100}% - 2rem)` }}
        />

        {STAGES.map((stage, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          
          return (
            <div key={stage.id} className="flex flex-col items-center gap-2 relative z-10 w-20">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${
                  isCompleted ? "bg-[#1E8E3E] border-[#1E8E3E] text-white" :
                  isCurrent ? "bg-white border-[#1E8E3E] text-[#1E8E3E] dark:bg-slate-900" :
                  "bg-white border-slate-200 text-slate-400 dark:bg-slate-900 dark:border-slate-800"
                } ${isCurrent ? "shadow-[0_0_0_4px_rgba(30,142,62,0.2)] animate-pulse-slow" : ""}`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isCompleted ? "check" : stage.icon}
                </span>
              </div>
              <span className={`text-[10px] font-black uppercase text-center leading-tight tracking-wider ${
                isCompleted || isCurrent ? "text-slate-900 dark:text-white" : "text-slate-400"
              }`}>
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}