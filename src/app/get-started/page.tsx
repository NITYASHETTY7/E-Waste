"use client";

import { useRouter } from "next/navigation";

export default function GetStartedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 py-12 relative overflow-hidden bg-[#F5F7FA]">
      
      {/* Decorative background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#1E8E3E] rounded-full blur-[150px] opacity-[0.08] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#0B5ED7] rounded-full blur-[150px] opacity-[0.08] pointer-events-none" />

      <div className="w-full max-w-[1200px] relative z-10 flex flex-col items-center">
        
        {/* Header */}
        <div className="text-center mb-16 cursor-pointer" onClick={() => router.push('/')}>
          <img src="/logo%203.png" alt="We Connect" className="w-[180px] mx-auto object-contain mb-8" />
          <h1 className="text-[2.5rem] md:text-[3.5rem] font-headline font-extrabold text-[#1A1A2E] mb-4 tracking-tight">Choose Your Role</h1>
          <p className="text-[#4A5568] text-lg md:text-xl font-medium max-w-2xl mx-auto">Select how you'd like to participate in the We Connect digital ecosystem</p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mb-16 max-w-[1200px]">
          
          {/* Client Card */}
          <div 
            onClick={() => router.push('/client-login')}
            className="bg-white/80 backdrop-blur-xl border border-slate-200 !rounded-3xl hover:border-[#1E8E3E] hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 p-8 flex flex-col items-center text-center cursor-pointer group"
          >
            <div className="w-16 h-16 bg-[#1E8E3E]/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#1E8E3E] transition-all duration-300">
              <span className="material-symbols-outlined text-[32px] text-[#1E8E3E] group-hover:text-white">corporate_fare</span>
            </div>
            <h2 className="text-xl font-bold text-[#1A1A2E] mb-4">Corporate / Client</h2>
            <p className="text-sm text-[#4A5568] leading-relaxed flex-1">List and auction your e-waste to verified recyclers. Get the best market price with full compliance documentation.</p>
            <div className="mt-8 text-[#1E8E3E] font-bold text-sm uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">
              Continue <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </div>
          </div>

          {/* Vendor Card */}
          <div 
            onClick={() => router.push('/vendor-login')}
            className="bg-white/80 backdrop-blur-xl border border-slate-200 !rounded-3xl hover:border-[#0B5ED7] hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 p-8 flex flex-col items-center text-center cursor-pointer group"
          >
            <div className="w-16 h-16 bg-[#0B5ED7]/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#0B5ED7] transition-all duration-300">
              <span className="material-symbols-outlined text-[32px] text-[#0B5ED7] group-hover:text-white">local_shipping</span>
            </div>
            <h2 className="text-xl font-bold text-[#1A1A2E] mb-4">Vendor / Recycler</h2>
            <p className="text-sm text-[#4A5568] leading-relaxed flex-1">Access verified scrap auctions, submit bids, and grow your recycling business with a steady supply pipeline.</p>
            <div className="mt-8 text-[#0B5ED7] font-bold text-sm uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">
              Continue <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </div>
          </div>

          {/* User Card */}
          <div 
            onClick={() => router.push('/user-login')}
            className="bg-white/80 backdrop-blur-xl border border-slate-200 !rounded-3xl hover:border-[#FFC107] hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 p-8 flex flex-col items-center text-center cursor-pointer group"
          >
            <div className="w-16 h-16 bg-[#FFC107]/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#FFC107] transition-all duration-300">
              <span className="material-symbols-outlined text-[32px] text-[#FFC107] group-hover:text-[#0f172a]">person</span>
            </div>
            <h2 className="text-xl font-bold text-[#1A1A2E] mb-4">General User</h2>
            <p className="text-sm text-[#4A5568] leading-relaxed flex-1">Browse active auctions, track e-waste activity in your organization, and stay updated on compliance status.</p>
            <div className="mt-8 text-[#FFC107] font-bold text-sm uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">
              Continue <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </div>
          </div>



        </div>

        {/* Back Link */}
        <button onClick={() => router.push('/')} className="text-slate-400 hover:text-[#1E8E3E] font-bold transition-all flex items-center gap-2 group">
          <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">arrow_back</span> Back to Home
        </button>
        
      </div>
    </div>
  );
}
