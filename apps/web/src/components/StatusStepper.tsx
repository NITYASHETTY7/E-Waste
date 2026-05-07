import React, { useEffect, useState } from 'react';

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

const STAGES = [
  { id: "onboarded", label: "Onboarded" },
  { id: "requirement_finalized", label: "Requirement Finalized" },
  { id: "audit", label: "Audit" },
  { id: "sealed_bid", label: "Sealed Bid" },
  { id: "auction", label: "Auction" },
  { id: "finalized", label: "Finalized" },
  { id: "payment", label: "Payment" },
  { id: "pickup", label: "Pickup" },
  { id: "completed", label: "Completed" },
] as const;

export function StatusStepper({ currentStage, role }: { currentStage: string, role: 'client' | 'vendor' }) {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const currentIndex = STAGES.findIndex(s => s.id === currentStage);
  
  let visibleStages = STAGES.map((s, i) => ({ ...s, index: i }));
  
  if (isMobile) {
    // Show current and next stage only on mobile
    visibleStages = visibleStages.filter(s => s.index === currentIndex || s.index === currentIndex + 1);
    if (currentIndex === STAGES.length - 1) {
      visibleStages = [visibleStages[0]]; // Only show completed if at the end
    }
  }

  return (
    <div className="w-full py-4 overflow-x-auto hide-scrollbar">
      <div className={`flex items-center ${isMobile ? 'justify-center' : 'justify-between'} relative px-2 sm:px-4 min-w-max sm:min-w-0`}>
        {/* Background Lines */}
        {!isMobile && (
          <div className="absolute top-4 left-6 right-6 h-[2px] bg-slate-200 dark:bg-slate-700 -z-10" />
        )}
        
        {visibleStages.map((stage, i) => {
          const isCompleted = stage.index < currentIndex;
          const isCurrent = stage.index === currentIndex;
          const isPending = stage.index > currentIndex;

          return (
            <div key={stage.id} className="flex flex-col items-center gap-2 relative z-10 w-24 sm:w-28 shrink-0">
              {/* Connecting line for mobile view */}
              {isMobile && i > 0 && (
                <div className="absolute top-4 -left-1/2 w-full h-[2px] bg-slate-200 dark:bg-slate-700 -z-10" />
              )}
              {/* Completed lines override */}
              {!isMobile && isCompleted && (
                <div 
                  className="absolute top-4 left-1/2 w-full h-[3px] bg-[#1E8E3E] -z-10" 
                  style={{ display: stage.index === STAGES.length - 1 ? 'none' : 'block' }}
                />
              )}

              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center border-[3px] transition-all duration-300 ${
                  isCompleted ? "bg-[#1E8E3E] border-[#1E8E3E] text-white" :
                  isCurrent ? "bg-white border-[#1E8E3E] text-[#1E8E3E] dark:bg-slate-900" :
                  "bg-white border-slate-200 text-slate-300 dark:bg-slate-800 dark:border-slate-700"
                } ${isCurrent ? "shadow-[0_0_0_4px_rgba(30,142,62,0.15)] animate-pulse" : ""}`}
              >
                {isCompleted ? (
                  <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                ) : (
                  <span className="text-[10px] font-black">{stage.index + 1}</span>
                )}
              </div>
              <span className={`text-[9px] sm:text-[10px] font-black uppercase text-center leading-tight tracking-wider px-1 ${
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