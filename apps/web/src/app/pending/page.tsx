"use client";

import { useApp } from "@/context/AppContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

const STATUS_TIMELINE = [
  { key: "submitted", label: "Application Submitted", desc: "Your documents and details have been received.", icon: "send" },
  { key: "review", label: "Document Review", desc: "Our compliance team is verifying your certifications.", icon: "fact_check" },
  { key: "background", label: "Background Verification", desc: "Cross-checking with CPCB and regulatory databases.", icon: "manage_search" },
  { key: "approved", label: "Account Activation", desc: "You'll receive email notification once approved.", icon: "verified" },
];

export default function PendingPage() {
  const { currentUser, logout } = useApp();
  const router = useRouter();

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1e40af 100%)' }}>
        <div className="glass-card p-10 rounded-3xl text-center border-white/10 relative z-10">
          <p className="text-white/60 mb-6">No active session found.</p>
          <button onClick={() => router.push('/get-started')} className="btn-primary px-8 py-3 rounded-xl font-bold">Return to Login</button>
        </div>
      </div>
    );
  }

  // Current stage based on onboarding step
  const stage = currentUser.status === "active" ? "approved" :
    currentUser.onboardingStep && currentUser.onboardingStep >= 5 ? "review" : "submitted";

  const stageIndex = { submitted: 0, review: 1, background: 2, approved: 3 };
  const currentStageIdx = stageIndex[stage as keyof typeof stageIndex] ?? 1;

  const docs = currentUser.documents || [];
  const profile = currentUser.onboardingProfile;

  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)' }}>
      
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-[#1E8E3E] rounded-full blur-[120px] opacity-10 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-[#0B5ED7] rounded-full blur-[120px] opacity-10 pointer-events-none" />

      {/* Header */}
      <header className="glass-header border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 z-50 !bg-transparent backdrop-blur-xl">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
          <img 
            src="/logo%203.png" 
            alt="We Connect" 
            className="h-10 md:h-12 w-auto object-contain brightness-0 invert"
          />
        </div>
        <button onClick={logout}
          className="flex items-center gap-2 text-sm text-white/60 hover:text-red-400 transition-colors font-bold uppercase tracking-widest">
          <span className="material-symbols-outlined text-base">logout</span>
          Sign Out
        </button>
      </header>

      <div className="flex-1 p-6 max-w-3xl mx-auto w-full pb-16 relative z-10">
        {/* Hero */}
        <div className="text-center py-12">
          <div className="relative inline-block mb-8">
            <div className="w-24 h-24 rounded-full bg-amber-500/10 border-2 border-amber-500/20 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-5xl text-amber-500 animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>pending</span>
            </div>
            <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-[#1E8E3E] border-2 border-[#0f172a] flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-sm text-white">schedule</span>
            </div>
          </div>
          <h1 className="text-[2.5rem] font-headline font-extrabold text-white tracking-tight mb-4 drop-shadow-md">
            Application Under Review
          </h1>
          <p className="text-white/60 text-lg max-w-md mx-auto leading-relaxed">
            Welcome, <strong className="text-white">{currentUser.name || profile?.companyName || "Applicant"}</strong>! Your vendor application is being processed. 
          </p>
          <div className="mt-6 inline-flex items-center gap-3 bg-white/5 border border-white/10 text-white/80 px-5 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
            Application ID: <span className="font-mono text-[#FFC107]">{currentUser.id}</span>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="glass-card !rounded-3xl p-8 mb-8 border-white/5">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 mb-8 flex items-center gap-3">
            <span className="material-symbols-outlined text-lg text-[#1E8E3E]">timeline</span>
            Verification Progress
          </h3>
          <div className="space-y-0">
            {STATUS_TIMELINE.map((step, idx) => {
              const isDone = idx < currentStageIdx;
              const isActive = idx === currentStageIdx;
              return (
                <div key={step.key} className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                      isDone ? "bg-[#1E8E3E] text-white shadow-[0_0_20px_rgba(30,142,62,0.3)]" :
                      isActive ? "bg-amber-500 text-[#0f172a] shadow-[0_0_20px_rgba(245,158,11,0.3)] animate-bounce-in" :
                      "bg-white/5 text-white/20 border border-white/5"
                    }`}>
                      <span className="material-symbols-outlined text-xl"
                        style={isDone ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                        {isDone ? "check" : step.icon}
                      </span>
                    </div>
                    {idx < STATUS_TIMELINE.length - 1 && (
                      <div className={`w-0.5 h-10 my-1 ${isDone ? "bg-[#1E8E3E]" : "bg-white/5"}`} />
                    )}
                  </div>
                  <div className="flex-1 pb-10">
                    <div className="flex items-center gap-3">
                      <p className={`font-bold text-base ${isActive ? "text-amber-500" : isDone ? "text-[#1E8E3E]" : "text-white/30"}`}>
                        {step.label}
                      </p>
                      {isActive && <span className="text-[9px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2.5 py-1 rounded-full font-black uppercase tracking-widest">In Progress</span>}
                      {isDone && <span className="text-[9px] bg-[#1E8E3E]/10 text-[#1E8E3E] border border-[#1E8E3E]/20 px-2.5 py-1 rounded-full font-black uppercase tracking-widest">Complete</span>}
                    </div>
                    <p className="text-sm text-white/40 mt-1 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Profile Summary */}
        {profile && (
          <div className="glass-card !rounded-3xl p-8 mb-8 border-white/5">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 mb-6 flex items-center gap-3">
              <span className="material-symbols-outlined text-lg text-[#0B5ED7]">business</span>
              Submitted Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
              {profile.companyName && (
                <div className="space-y-1.5">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/20">Organization</p>
                  <p className="font-bold text-white text-base">{profile.companyName}</p>
                </div>
              )}
              {profile.contactPerson && (
                <div className="space-y-1.5">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/20">Point of Contact</p>
                  <p className="font-bold text-white text-base">{profile.contactPerson}</p>
                </div>
              )}
              {profile.city && (
                <div className="space-y-1.5">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/20">Operational Base</p>
                  <p className="font-bold text-white text-base">{profile.city}, {profile.state}</p>
                </div>
              )}
              {(profile.cpcbNo || profile.gstin) && (
                <div className="space-y-1.5">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/20">{profile.cpcbNo ? "License Registry" : "Tax Identifier"}</p>
                  <p className="font-bold font-mono text-sm text-[#FFC107] tracking-wider">{profile.cpcbNo || profile.gstin}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Documents */}
        {docs.length > 0 && (
          <div className="glass-card !rounded-3xl p-8 mb-8 border-white/5">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 mb-6 flex items-center gap-3">
              <span className="material-symbols-outlined text-lg text-[#FFC107]">upload_file</span>
              Verified Documents ({docs.length})
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {docs.map((doc, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#1E8E3E]">
                      <span className="material-symbols-outlined text-xl">description</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white tracking-wide">{doc.fileName}</p>
                      <p className="text-[10px] text-white/30 uppercase tracking-widest mt-0.5">{doc.size}</p>
                    </div>
                  </div>
                  <span className="text-[9px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2.5 py-1 rounded-full font-black uppercase tracking-widest">Verification Pending</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Support */}
        <div className="bg-gradient-to-r from-[#1E8E3E] to-[#0B5ED7] rounded-[2rem] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-white/5 animate-pulse pointer-events-none" />
          <div className="relative z-10 text-center md:text-left">
            <h4 className="font-headline font-extrabold text-xl mb-2 tracking-tight">Need Priority Assistance?</h4>
            <p className="text-white/70 text-sm font-medium">Our compliance experts are available Mon–Fri, 9AM–6PM IST.</p>
          </div>
          <div className="relative z-10">
            <a href="mailto:support@WeConnect.com"
              className="bg-white text-[#0f172a] hover:bg-slate-100 transition-all px-8 py-3.5 rounded-xl text-sm font-black uppercase tracking-widest flex items-center gap-3 shadow-lg hover:-translate-y-1 dark:bg-slate-900">
              <span className="material-symbols-outlined text-[20px]">mail</span>
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
