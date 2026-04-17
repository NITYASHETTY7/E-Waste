const fs = require('fs');

const replacement =       {/* SECTION 1 - HERO */}
      <main id="home" className="flex flex-col w-full relative overflow-hidden" style={{ minHeight: '100vh' }}>
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        
        <section className="flex w-full relative z-10 flex-col justify-center px-8 sm:px-12 lg:px-24 pt-32 pb-16 lg:py-20 min-h-screen items-center text-center">
          <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
            {/* Badge */}
            <span className="inline-block px-4 py-1.5 glass-card text-white/90 text-xs font-bold uppercase tracking-[0.2em] rounded-full mb-8">
              <span className="text-[#FFC107]">??</span> The Future of Recycling
            </span>
            
            {/* Headline */}
            <h1 className="text-[3.5rem] sm:text-[4.5rem] lg:text-[5.5rem] leading-[1.1] font-headline font-extrabold text-white mb-6 drop-shadow-lg tracking-tight">
              India's Smart E-Waste <br className="hidden sm:block" />Auction Platform
            </h1>
            
            {/* Subtext */}
            <p className="text-white/80 text-[1.1rem] lg:text-[1.3rem] font-medium leading-relaxed mb-12 max-w-2xl">
              Sell your e-waste with transparent bidding & full compliance
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-5 mb-16 justify-center">
              <button 
                onClick={() => router.push('/client-login')}
                className="btn-post-scrap font-bold text-[15px] uppercase tracking-widest px-10 py-4 shadow-[0_0_20px_rgba(30,142,62,0.4)]"
              >
                Post Scrap
              </button>
              <button 
                onClick={() => router.push('/vendor-login')}
                className="btn-join-vendor font-bold text-[15px] uppercase tracking-widest px-10 py-4"
              >
                Join as Vendor
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* SECTION 2 - VALUE */}
      <section className="py-20 px-6 md:px-10 relative z-10 border-t border-white/10 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "??", title: "Get Best Price" },
              { icon: "??", title: "Transparent Bidding" },
              { icon: "??", title: "Compliance Certificates" },
              { icon: "??", title: "Hassle-Free Pickup" }
            ].map((val, i) => (
              <div key={i} className="glass-card p-8 text-center flex flex-col items-center justify-center hover:-translate-y-2 transition-all">
                <span className="text-4xl mb-4">{val.icon}</span>
                <h3 className="text-lg font-bold text-white tracking-wide">{val.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3 - HOW IT WORKS */}
      <section id="how-it-works" className="py-24 px-6 md:px-10 relative z-10 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold text-[#FFC107] uppercase tracking-[0.2em] mb-4">Process</h2>
            <h3 className="text-4xl font-headline font-extrabold text-white">How It Works</h3>
            <div className="w-20 h-1 bg-gradient-to-r from-[#1E8E3E] to-[#0B5ED7] mx-auto mt-6 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
             <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent z-0"></div>

             {[
               { step: "1", title: "Upload Scrap", icon: "upload_file" },
               { step: "2", title: "Vendors Bid", icon: "gavel" },
               { step: "3", title: "Live Auction", icon: "sensors" },
               { step: "4", title: "Pickup", icon: "local_shipping" },
               { step: "5", title: "Certification", icon: "workspace_premium" }
             ].map((item, i) => (
               <div key={i} className="relative z-10 flex flex-col items-center text-center group">
                 <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full glass-card !rounded-full flex items-center justify-center mb-6 shadow-lg group-hover:bg-[#1E8E3E]/20 transition-all duration-300">
                   <span className="material-symbols-outlined text-[32px] lg:text-[40px] text-[#1E8E3E] group-hover:text-white transition-colors">{item.icon}</span>
                 </div>
                 <h4 className="font-bold text-white text-lg tracking-wide">{item.title}</h4>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* SECTION 4 & 5 - FOR CLIENTS & VENDORS */}
      <section className="py-20 px-6 md:px-10 relative z-10 border-t border-white/10">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 lg:gap-12">
          
          {/* For Clients */}
          <div className="glass-card p-10 lg:p-14 group flex flex-col items-center text-center" style={{ background: 'rgba(30, 142, 62, 0.08)' }}>
            <span className="material-symbols-outlined text-[48px] text-[#1E8E3E] mb-6">corporate_fare</span>
            <h3 className="text-3xl font-headline font-extrabold text-white mb-10 tracking-tight">For Clients</h3>
            <ul className="space-y-6 mb-12 text-left w-full max-w-sm">
              {[
                "Higher revenue",
                "Easy auction creation",
                "Full tracking"
              ].map((li, i) => (
                <li key={i} className="flex items-center gap-4 glass-card px-6 py-4 !rounded-xl">
                  <span className="material-symbols-outlined text-[#1E8E3E] text-[24px]">check_circle</span>
                  <span className="font-bold text-white text-lg">{li}</span>
                </li>
              ))}
            </ul>
            <button onClick={() => router.push('/client-login')} className="mt-auto w-full btn-primary font-bold text-sm tracking-widest uppercase py-4">
              Post Your Scrap
            </button>
          </div>

          {/* For Vendors */}
          <div className="glass-card p-10 lg:p-14 group flex flex-col items-center text-center" style={{ background: 'rgba(11, 94, 215, 0.08)' }}>
            <span className="material-symbols-outlined text-[48px] text-[#0B5ED7] mb-6">local_shipping</span>
            <h3 className="text-3xl font-headline font-extrabold text-white mb-10 tracking-tight">For Vendors</h3>
            <ul className="space-y-6 mb-12 text-left w-full max-w-sm">
              {[
                "Access to bulk scrap",
                "Fair bidding",
                "Business growth"
              ].map((li, i) => (
                <li key={i} className="flex items-center gap-4 glass-card px-6 py-4 !rounded-xl">
                   <span className="material-symbols-outlined text-[#0B5ED7] text-[24px]">check_circle</span>
                   <span className="font-bold text-white text-lg">{li}</span>
                </li>
              ))}
            </ul>
            <button onClick={() => router.push('/vendor-login')} className="mt-auto w-full btn-join-vendor font-bold text-sm tracking-widest uppercase py-4">
              Join as Vendor
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 6 - TRUST */}
      <section className="py-24 px-6 md:px-10 relative z-10 border-t border-white/10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-headline font-extrabold text-white">Trust & Security</h3>
            <div className="w-20 h-1 bg-gradient-to-r from-[#1E8E3E] to-[#0B5ED7] mx-auto mt-6 rounded-full" />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Verified vendors", icon: "verified_user" },
              { title: "Secure platform", icon: "security" },
              { title: "Compliance-driven", icon: "rule" }
            ].map((feat, i) => (
              <div key={i} className="glass-card p-10 text-center flex flex-col items-center justify-center hover:-translate-y-2 transition-all">
                <span className="material-symbols-outlined text-[48px] text-[#FFC107] mb-6">{feat.icon}</span>
                <h4 className="font-bold text-white text-xl">{feat.title}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7 - CTA */}
      <section className="py-24 px-6 md:px-10 relative z-10 border-t border-white/10 bg-[#1E8E3E]/10">
        <div className="max-w-4xl mx-auto text-center glass-card p-12 lg:p-20 !rounded-[3rem] border-[#1E8E3E]/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1E8E3E]/20 to-transparent pointer-events-none" />
          <h2 className="relative z-10 text-[2.5rem] md:text-[3.5rem] font-headline font-extrabold text-white mb-8 leading-tight tracking-tight">
            ?? Start Selling Your <br />E-Waste Today
          </h2>
          <div className="relative z-10 flex flex-col sm:flex-row gap-6 justify-center">
             <button onClick={() => router.push('/client-login')} className="btn-post-scrap font-bold text-lg px-12 py-5 shadow-[0_0_30px_rgba(30,142,62,0.5)]">
               Get Started
             </button>
          </div>
        </div>
      </section>
\;
let c = fs.readFileSync('src/app/page.tsx', 'utf8');
let s = c.indexOf('{/* 2. MAIN LAYOUT - Hero Section (REDESIGNED) */}');
let e = c.indexOf('{/* 9. FOOTER - Minimal */}');

if (s !== -1 && e !== -1) {
  fs.writeFileSync('src/app/page.tsx', c.substring(0, s) + replacement + '\n      ' + c.substring(e));
  console.log('Replaced sections successfully');
} else {
  console.log('Bounds missing');
}
