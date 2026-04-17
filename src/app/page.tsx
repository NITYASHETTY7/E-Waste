"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { UserRole } from "@/types";

type AuthTab = "login" | "register";

export default function LandingPage() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { login } = useApp();

  const searchParams = useSearchParams();
  const isAdminMode = searchParams.get('admin') === 'true';

  // Auth States
  const [tab, setTab] = useState<AuthTab>("register");
  const [loginRole, setLoginRole] = useState<UserRole>("client");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Registration States
  const [regRole, setRegRole] = useState<"client" | "vendor">("client");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // Simulation of auth
      await new Promise(r => setTimeout(r, 1000));
      login(loginRole, loginEmail);
      
      if (loginRole === 'admin') router.push('/admin/dashboard');
      else if (loginRole === 'client') router.push('/client/dashboard');
      else if (loginRole === 'vendor') router.push('/vendor/dashboard');
      else router.push('/user/dashboard');
    } catch (err) {
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await new Promise(r => setTimeout(r, 1000));
      // In a real app, we'd call a register API here
      login(regRole as UserRole, regEmail);
      router.push(`/onboarding/${regRole}/step1`);
    } catch (err) {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  if (!mounted) return null;

  return (
    <div className="bg-[#F5F7FA] min-h-screen flex flex-col relative text-[#1A1A2E]">
      {/* 1. NAVBAR */}
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 bg-[#FFFFFF] border-b border-[#E2E8F0] ${isScrolled ? 'shadow-[0_4px_16px_rgba(0,0,0,0.1)]' : 'shadow-[0_1px_3px_rgba(0,0,0,0.08)]'}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-3 md:py-4 flex items-center justify-between w-full">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
            <img src="/logo%203.png" alt="We Connect" className="h-[40px] md:h-[50px] object-contain brightness-0" />
            <span className="text-xl font-black text-slate-900 tracking-tighter hidden sm:block">WE CONNECT</span>
          </div>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-8 relative">
            <button suppressHydrationWarning onClick={() => window.scrollTo(0, 0)} className="text-[#4A5568] hover:text-[#1E8E3E] font-bold transition-colors">Home</button>
            <button suppressHydrationWarning onClick={() => scrollTo('about')} className="text-[#4A5568] hover:text-[#1E8E3E] font-bold transition-colors">About</button>
            
            <div className="relative">
              <button 
                suppressHydrationWarning
                onClick={() => setLoginDropdownOpen(!loginDropdownOpen)}
                onBlur={() => setTimeout(() => setLoginDropdownOpen(false), 200)}
                className="text-[#4A5568] hover:text-[#1E8E3E] font-bold transition-colors flex items-center gap-1"
              >
                Login <span className="material-symbols-outlined text-[18px]">expand_more</span>
              </button>
              
              {loginDropdownOpen && (
                <div className="absolute top-full right-0 mt-3 w-56 bg-white border border-[#E2E8F0] shadow-[0_10px_40px_rgba(0,0,0,0.12)] rounded-xl flex flex-col overflow-hidden z-50 animate-fade-in">
                  <button suppressHydrationWarning onMouseDown={() => router.push('/client-login')} className="text-left px-5 py-3 text-sm font-bold text-[#4A5568] hover:bg-[#E8F5E9] hover:text-[#1E8E3E] transition-colors flex items-center gap-3">
                    <span className="material-symbols-outlined text-[18px] text-[#1E8E3E]">corporate_fare</span> Client Login
                  </button>
                  <button suppressHydrationWarning onMouseDown={() => router.push('/vendor-login')} className="text-left px-5 py-3 text-sm font-bold text-[#4A5568] hover:bg-[#E3EEFF] hover:text-[#0B5ED7] transition-colors flex items-center gap-3">
                    <span className="material-symbols-outlined text-[18px] text-[#0B5ED7]">local_shipping</span> Vendor Login
                  </button>
                  <button suppressHydrationWarning onMouseDown={() => router.push('/user-login')} className="text-left px-5 py-3 text-sm font-bold text-[#4A5568] hover:bg-[#FFF8E1] hover:text-[#FFC107] transition-colors flex items-center gap-3">
                    <span className="material-symbols-outlined text-[18px] text-[#FFC107]">person</span> User Login
                  </button>
                  <div className="border-t border-[#E2E8F0] my-1"></div>
                  <button suppressHydrationWarning onMouseDown={() => router.push('/admin-login')} className="text-left px-5 py-3 text-sm font-bold text-[#4A5568] hover:bg-gray-100 hover:text-gray-900 transition-colors flex items-center gap-3">
                    <span className="material-symbols-outlined text-[18px] text-gray-700">admin_panel_settings</span> Admin Login
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Toggle */}
          <button suppressHydrationWarning className="lg:hidden text-[#1A1A2E] p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <span className="material-symbols-outlined text-[28px]">{mobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-white shadow-xl py-4 px-6 flex flex-col gap-4 animate-fade-in border-t border-[#E2E8F0]">
            <button suppressHydrationWarning onClick={() => { window.scrollTo(0, 0); setMobileMenuOpen(false); }} className="text-left text-base font-bold text-[#1A1A2E] py-3 border-b border-[#E2E8F0]">Home</button>
            <button suppressHydrationWarning onClick={() => scrollTo('about')} className="text-left text-base font-bold text-[#1A1A2E] py-3 border-b border-[#E2E8F0]">About</button>
            <div className="flex flex-col gap-3 mt-2">
              <button suppressHydrationWarning onClick={() => router.push('/client-login')} className="w-full text-left py-3 text-base font-bold text-[#1E8E3E] border-b border-[#E2E8F0]">Client Login</button>
              <button suppressHydrationWarning onClick={() => router.push('/vendor-login')} className="w-full text-left py-3 text-base font-bold text-[#0B5ED7] border-b border-[#E2E8F0]">Vendor Login</button>
              <button suppressHydrationWarning onClick={() => router.push('/user-login')} className="w-full text-left py-3 text-base font-bold text-[#FFC107] border-b border-[#E2E8F0]">User Login</button>
              <button suppressHydrationWarning onClick={() => router.push('/admin-login')} className="w-full text-left py-3 text-base font-bold text-gray-700">Admin Login</button>
            </div>
          </div>
        )}
      </nav>

      {/* 2. MAIN LAYOUT - Hero Section */}
      <main id="home" className="flex flex-col w-full relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1e40af 100%)', minHeight: '100vh' }}>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#1E8E3E] rounded-full blur-[150px] opacity-20 animate-pulse pointer-events-none" />
        
        <section className="flex w-full relative z-10 flex-col justify-center px-4 sm:px-8 lg:px-20 pt-32 pb-16 lg:py-20 min-h-screen items-center text-center">
          
          <div className="w-full max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center text-left">
            
            {/* Left: Hero Copy */}
            <div className="flex flex-col items-start pr-0 lg:pr-8">
              {/* Badge */}
              <span className="inline-block px-5 py-2 bg-white/10 text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full mb-8 backdrop-blur-md border border-white/10">
                Transforming Industrial Waste
              </span>
              
              {/* Headline */}
              <h1 className="text-[3rem] sm:text-[4rem] lg:text-[5rem] leading-[1.05] font-headline font-black text-white mb-8 drop-shadow-2xl tracking-tighter">
                INDIA'S SMART <br /> <span className="text-emerald-400">E-WASTE</span> AUCTION
              </h1>
              
              {/* Subtext */}
              <p className="text-white/70 text-[1rem] lg:text-[1.2rem] font-medium leading-relaxed mb-12 max-w-lg">
                Transparent bidding, verified recyclers, and full EPR compliance. Sell your scrap at true market value directly on our secure platform.
              </p>

              {/* Trust Indicators */}
              <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 pt-8 border-t border-white/10 w-full">
                <div className="flex items-center gap-3">    
                  <span className="material-symbols-outlined text-emerald-400 text-[24px]">verified</span>
                  <span className="text-white/80 text-xs font-bold uppercase tracking-widest">CPCB Authorized Recyclers</span>
                </div>
                <div className="flex items-center gap-3">    
                  <span className="material-symbols-outlined text-emerald-400 text-[24px]">balance</span>
                  <span className="text-white/80 text-xs font-bold uppercase tracking-widest">Transparent Live Bidding</span>
                </div>
              </div>
            </div>

            {/* Right: Auth Card */}
            <div className="w-full bg-white rounded-[2.5rem] shadow-2xl p-8 sm:p-12 relative overflow-hidden border border-slate-100">
              <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-emerald-50 rounded-full blur-[40px] pointer-events-none" />
              
              <div className="relative z-10 w-full">
                <AnimatePresence mode="wait">
                  {tab === "register" ? (
                    <motion.div 
                      key="register" 
                      initial={{ opacity: 0, scale: 0.95 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      exit={{ opacity: 0, scale: 0.95 }} 
                      className="space-y-8 w-full"
                    >
                      <div className="space-y-2">
                        <h3 className="text-3xl font-black text-slate-900 leading-tight">Join We Connect</h3>
                        <p className="text-slate-500 text-sm font-medium">Select your role to start disposing responsibly.</p>
                      </div>

                      <div className="grid grid-cols-1 gap-5">
                        <button 
                          onClick={() => router.push('/client-login?tab=register')}
                          className="group relative p-8 bg-emerald-600 rounded-3xl text-left transition-all hover:bg-emerald-700 hover:shadow-2xl hover:shadow-emerald-900/20 overflow-hidden active:scale-[0.98]"
                        >
                          <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
                          <div className="relative z-10 flex items-center gap-6">
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                              <span className="material-symbols-outlined text-white text-3xl">add_shopping_cart</span>
                            </div>
                            <div>
                              <p className="text-white font-black text-xl">Post E-Waste</p>
                              <p className="text-white/70 text-xs font-bold uppercase tracking-[0.2em] mt-1">For Clients & Corporates</p>
                            </div>
                            <span className="material-symbols-outlined text-white/40 ml-auto group-hover:translate-x-1 transition-transform">arrow_forward</span>
                          </div>
                        </button>

                        <button 
                          onClick={() => router.push('/vendor-login?tab=register')}
                          className="group relative p-8 bg-white border-2 border-slate-100 rounded-3xl text-left transition-all hover:border-blue-600 hover:shadow-2xl hover:shadow-blue-900/10 overflow-hidden active:scale-[0.98]"
                        >
                          <div className="relative z-10 flex items-center gap-6">
                            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center transition-colors group-hover:bg-blue-600">
                              <span className="material-symbols-outlined text-blue-600 text-3xl group-hover:text-white transition-colors">verified_user</span>
                            </div>
                            <div>
                              <p className="text-slate-900 font-black text-xl">Join as Vendor</p>
                              <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mt-1">For Authorized Recyclers</p>
                            </div>
                            <span className="material-symbols-outlined text-slate-300 ml-auto group-hover:translate-x-1 transition-transform group-hover:text-blue-600">arrow_forward</span>
                          </div>
                        </button>
                      </div>

                      <div className="pt-8 border-t border-slate-100 text-center">
                        <button 
                          onClick={() => setTab("login")}
                          className="text-xs text-slate-400 font-black uppercase tracking-[0.2em] hover:text-emerald-600 transition-colors flex items-center justify-center gap-3 w-full"
                        >
                          Already have an account? <span className="text-emerald-600 underline">Login to Portal</span>
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="login" 
                      initial={{ opacity: 0, x: 20 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      exit={{ opacity: 0, x: -20 }} 
                      className="space-y-8 w-full"
                    >
                      <div className="space-y-2">
                        <h3 className="text-2xl font-black text-slate-900">Access Portal</h3>
                        <p className="text-slate-500 text-sm font-medium">Select your portal to continue with secured login.</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {([["client", "corporate_fare", "Client", "#1E8E3E"], ["vendor", "local_shipping", "Vendor", "#0B5ED7"], ["user", "person", "Individual", "#FFC107"]] as const)
                          .concat(isAdminMode ? [["admin", "admin_panel_settings", "Admin", "#0f172a"]] : [])
                          .map(([r, icon, title, color]) => (
                          <button key={r} type="button" onClick={() => router.push(`/${r}-login`)}
                            suppressHydrationWarning
                            className="group p-5 rounded-2xl border-2 border-slate-50 bg-slate-50/50 text-left transition-all hover:border-slate-900 hover:bg-white active:scale-[0.98]">
                            <div className="w-10 h-10 rounded-xl mb-4 flex items-center justify-center bg-white shadow-sm ring-1 ring-slate-200 group-hover:ring-slate-900 transition-all">
                              <span className="material-symbols-outlined text-xl" style={{ color }}>{icon}</span>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-slate-900 transition-colors">{title}</p>
                          </button>
                        ))}
                      </div>

                      <div className="pt-6 border-t border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-center mb-6">Quick Access Demo</p>
                        <div className="space-y-3">
                          {([
                            ["Client", "client@weconnect.com", "password", "#1E8E3E"], 
                            ["Vendor", "vendor@weconnect.com", "password", "#0B5ED7"],
                            ["Guest", "guest@weconnect.com", "password", "#FFC107"]
                          ] as const).map(([label, email, pw, color]) => (
                            <button key={email} onClick={() => { 
                              login(label.toLowerCase() as UserRole, email);
                              if (label === 'Client') router.push('/client/dashboard');
                              else if (label === 'Vendor') router.push('/vendor/dashboard');
                              else router.push('/consumer/pickup');
                            }}
                              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between group hover:bg-white hover:border-slate-900 transition-all">
                              <div className="flex items-center gap-4">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                                <div className="text-left">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">{label} Portal</p>
                                  <p className="text-[9px] font-bold text-slate-400 lowercase">{email} / {pw}</p>
                                </div>
                              </div>
                              <span className="material-symbols-outlined text-slate-300 group-hover:text-slate-900 text-lg transition-colors">login</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="pt-6 text-center">
                        <button onClick={() => setTab("register")} className="text-[10px] font-black text-slate-400 hover:text-emerald-600 transition-colors uppercase tracking-[0.2em] flex items-center justify-center gap-2 w-full">
                          <span className="material-symbols-outlined text-sm">arrow_back</span> Back to Registration
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 3. VALUE SECTION */}
      <section className="py-20 px-6 md:px-10 relative z-10 bg-[#FFFFFF] border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: "monetization_on", title: "Get Best Price" },
              { icon: "gavel", title: "Transparent Bidding" },
              { icon: "workspace_premium", title: "Compliance Certificates" },
              { icon: "local_shipping", title: "Hassle-Free Pickup" }
            ].map((val, i) => (
              <div key={i} className="bg-[#FFFFFF] border border-[#E2E8F0] shadow-[0_4px_16px_rgba(0,0,0,0.06)] rounded-[16px] p-8 text-center flex flex-col items-center justify-center hover:-translate-y-1 transition-transform">
                <span className="material-symbols-outlined text-[40px] text-[#1E8E3E] mb-4">{val.icon}</span>
                <h3 className="text-lg font-bold text-[#1A1A2E] tracking-wide">{val.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. ABOUT SECTION */}
      <section id="about" className="py-24 px-6 md:px-10 relative z-10 bg-[#F5F7FA]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold text-[#1E8E3E] uppercase tracking-[0.2em] mb-4">Our Vision</h2>
            <h3 className="text-4xl font-headline font-extrabold text-[#1A1A2E]">About Us</h3>
            <div className="w-20 h-1 bg-gradient-to-r from-[#1E8E3E] to-[#0B5ED7] mx-auto mt-6 rounded-full" />
          </div>
          
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xl text-[#1A1A2E] leading-relaxed font-medium">
                <span className="text-[#1E8E3E] font-extrabold">We Connect</span> is a digital e-waste aggregator platform that connects corporates, manufacturers, and individuals with authorized recyclers through a transparent auction system.
              </p>
              <p className="mt-6 text-[#4A5568] leading-relaxed">
                By bridging the gap between waste generators and certified processors, we ensure that electronic waste is handled responsibly while maximizing value for all stakeholders.
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {[
                { title: "Maximize scrap value", desc: "Our competitive bidding process ensures you get the best market price for your electronic waste.", icon: "trending_up" },
                { title: "Ensure legal compliance", desc: "Full documentation and tracking to meet CPCB and state regulatory requirements.", icon: "gavel" },
                { title: "Provide end-to-end tracking", desc: "Real-time visibility from pickup to final disposal with verified certificates.", icon: "track_changes" }
              ].map((point, i) => (
                <div key={i} className="flex gap-5 p-6 bg-[#FFFFFF] border border-[#E2E8F0] shadow-[0_4px_16px_rgba(0,0,0,0.06)] rounded-[16px] group hover:border-[#1E8E3E] transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-[#E8F5E9] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[#1E8E3E]">{point.icon}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1A1A2E] mb-1">{point.title}</h4>
                    <p className="text-sm text-[#4A5568] leading-relaxed">{point.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-24 px-6 md:px-10 relative z-10 bg-[#FFFFFF]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold text-[#1E8E3E] uppercase tracking-[0.2em] mb-4">Process</h2>
            <h3 className="text-4xl font-headline font-extrabold text-[#1A1A2E]">How It Works</h3>
            <div className="w-20 h-1 bg-gradient-to-r from-[#1E8E3E] to-[#0B5ED7] mx-auto mt-6 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative mt-12">
             <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-[#1E8E3E] to-[#0B5ED7] z-0"></div>

             {[
               { step: "01", title: "Upload Your Scrap", desc: "List your e-waste materials with detailed specifications — type, quantity, condition, and photos. Our smart categorization ensures maximum visibility to the right buyers.", icon: "upload_file", tag: "Takes 5 minutes" },
               { step: "02", title: "Sealed Bidding", desc: "Verified and authorized recyclers review your listing and submit sealed bids confidentially. No bid manipulation — pure market-driven pricing ensures you get the best value.", icon: "gavel", tag: "24-48 hour window" },
               { step: "03", title: "Live Auction", desc: "Top bidders enter a transparent live auction round. Watch bids in real-time as vendors compete. Auto-extension ensures no last-second sniping.", icon: "sensors", tag: "Live & Transparent" },
               { step: "04", title: "Pickup & Payment", desc: "The winning vendor coordinates material pickup at your premises. Track the pickup in real-time. Payment is processed securely through the platform.", icon: "local_shipping", tag: "Fully Tracked" },
               { step: "05", title: "Certification", desc: "Receive legally valid recycling certificates and e-waste disposal documentation. All certificates comply with E-Waste Management Rules. Download anytime.", icon: "workspace_premium", tag: "Legally Valid" }
             ].map((item, i) => (
               <div key={i} className="relative z-10 flex flex-col items-center text-center group bg-[#FFFFFF] border border-[#E2E8F0] shadow-[0_4px_16px_rgba(0,0,0,0.06)] rounded-[16px] p-6 hover:-translate-y-2 hover:border-[#1E8E3E] transition-all">
                 <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full flex items-center justify-center mb-6 shadow-md bg-gradient-to-br from-[#1E8E3E] to-[#0B5ED7] group-hover:shadow-[0_0_20px_rgba(30,142,62,0.4)] transition-all duration-300">
                   <span className="material-symbols-outlined text-[32px] lg:text-[40px] text-white">{item.icon}</span>
                 </div>
                 <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#1E8E3E] text-white font-bold text-sm mb-4 border-2 border-white shadow-sm">
                   {item.step}
                 </div>
                 <h4 className="font-bold text-[#1A1A2E] text-lg tracking-wide mb-3">{item.title}</h4>
                 <p className="text-sm text-[#4A5568] leading-relaxed mb-4">{item.desc}</p>
                 <span className="mt-auto px-3 py-1 bg-[#E8F5E9] text-[#1E8E3E] font-bold text-xs uppercase rounded-full">{item.tag}</span>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* 6. FOR CLIENTS & VENDORS */}
      <section className="py-20 px-6 md:px-10 relative z-10 bg-[#F5F7FA]">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 lg:gap-12">
          
          {/* For Clients */}
          <div className="bg-[#FFFFFF] border-l-4 border-l-[#1E8E3E] shadow-[0_4px_16px_rgba(0,0,0,0.06)] rounded-r-[16px] rounded-l-[4px] p-10 lg:p-12 flex flex-col hover:-translate-y-1 transition-transform">
            <span className="material-symbols-outlined text-[48px] text-[#1E8E3E] mb-4">corporate_fare</span>
            <h3 className="text-3xl font-headline font-extrabold text-[#1A1A2E] mb-2 tracking-tight">For Clients & Corporates</h3>
            <p className="text-[#4A5568] font-medium mb-8">Maximize returns on your e-waste disposal</p>
            
            <ul className="space-y-6 mb-12">
              <li className="flex gap-4">
                <span className="material-symbols-outlined text-[#1E8E3E] text-[24px] shrink-0 mt-1">trending_up</span>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <strong className="text-[#1A1A2E] text-lg">Higher Revenue (5–20% More)</strong>
                    <span className="px-2 py-0.5 bg-[#E8F5E9] text-[#1E8E3E] text-[10px] font-bold uppercase rounded-full">#1 Benefit</span>
                  </div>
                  <span className="text-sm text-[#4A5568] leading-relaxed block">Our competitive bidding model consistently delivers 5–20% higher returns compared to traditional scrap dealers. Let the market set the price — not a middleman.</span>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="material-symbols-outlined text-[#1E8E3E] text-[24px] shrink-0 mt-1">assignment</span>
                <div>
                  <strong className="text-[#1A1A2E] text-lg mb-1 block">Easy Auction Creation</strong>
                  <span className="text-sm text-[#4A5568] leading-relaxed block">Create a fully detailed auction listing in under 5 minutes. Add material specs, photos, reserve price, and pickup availability. Our guided form makes it effortless.</span>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="material-symbols-outlined text-[#1E8E3E] text-[24px] shrink-0 mt-1">location_on</span>
                <div>
                  <strong className="text-[#1A1A2E] text-lg mb-1 block">Full Real-Time Tracking</strong>
                  <span className="text-sm text-[#4A5568] leading-relaxed block">Track every stage — from bid submission to pickup completion. Get instant notifications and live status updates throughout the entire process.</span>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="material-symbols-outlined text-[#1E8E3E] text-[24px] shrink-0 mt-1">download</span>
                <div>
                  <strong className="text-[#1A1A2E] text-lg mb-1 block">Download Compliance Certificates</strong>
                  <span className="text-sm text-[#4A5568] leading-relaxed block">Instantly download legally valid e-waste recycling certificates for every completed auction. Stay audit-ready with organized disposal documentation.</span>
                </div>
              </li>
            </ul>
            <button suppressHydrationWarning onClick={() => router.push('/client-login')} className="mt-auto w-full btn-primary font-bold text-[15px] tracking-widest uppercase py-4">
              Post Your Scrap Today
            </button>
          </div>

          {/* For Vendors */}
          <div className="bg-[#FFFFFF] border-l-4 border-l-[#0B5ED7] shadow-[0_4px_16px_rgba(0,0,0,0.06)] rounded-r-[16px] rounded-l-[4px] p-10 lg:p-12 flex flex-col hover:-translate-y-1 transition-transform">
            <span className="material-symbols-outlined text-[48px] text-[#0B5ED7] mb-4">local_shipping</span>
            <h3 className="text-3xl font-headline font-extrabold text-[#1A1A2E] mb-2 tracking-tight">For Vendors & Recyclers</h3>
            <p className="text-[#4A5568] font-medium mb-8">Grow your recycling business sustainably</p>
            
            <ul className="space-y-6 mb-12">
              <li className="flex gap-4">
                <span className="material-symbols-outlined text-[#0B5ED7] text-[24px] shrink-0 mt-1">inventory_2</span>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <strong className="text-[#1A1A2E] text-lg">Access to Bulk Verified Scrap</strong>
                    <span className="px-2 py-0.5 bg-[#E3EEFF] text-[#0B5ED7] text-[10px] font-bold uppercase rounded-full">Verified Listings</span>
                  </div>
                  <span className="text-sm text-[#4A5568] leading-relaxed block">Browse a curated marketplace of genuine bulk e-waste listings from IT companies, manufacturers, corporates, and institutions. All listings are verified — no fake postings.</span>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="material-symbols-outlined text-[#0B5ED7] text-[24px] shrink-0 mt-1">gavel</span>
                <div>
                  <strong className="text-[#1A1A2E] text-lg mb-1 block">Fair & Transparent Bidding</strong>
                  <span className="text-sm text-[#4A5568] leading-relaxed block">Participate in a regulated, tamper-proof bidding system. Sealed bids prevent collusion, live auction rounds ensure transparency, and EMD deposits confirm serious buyers.</span>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="material-symbols-outlined text-[#0B5ED7] text-[24px] shrink-0 mt-1">trending_up</span>
                <div>
                  <strong className="text-[#1A1A2E] text-lg mb-1 block">Business Growth Opportunities</strong>
                  <span className="text-sm text-[#4A5568] leading-relaxed block">Build your brand reputation through our rating and review system. Access a consistent pipeline of materials, expand your geographic reach, and scale your operations.</span>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="material-symbols-outlined text-[#0B5ED7] text-[24px] shrink-0 mt-1">shield</span>
                <div>
                  <strong className="text-[#1A1A2E] text-lg mb-1 block">Secure Transaction Processing</strong>
                  <span className="text-sm text-[#4A5568] leading-relaxed block">All payments are processed through our secure escrow system. Earnest Money Deposits protect both parties. No payment disputes — just smooth, reliable transactions.</span>
                </div>
              </li>
            </ul>
            <button suppressHydrationWarning onClick={() => router.push('/vendor-login')} className="mt-auto w-full btn-secondary font-bold text-[15px] tracking-widest uppercase py-4">
              Join as Vendor Today
            </button>
          </div>
        </div>
      </section>

      {/* 7. TRUST */}
      <section className="py-24 px-6 md:px-10 relative z-10 bg-[#FFFFFF]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-headline font-extrabold text-[#1A1A2E]">Trust & Security</h3>
            <div className="w-20 h-1 bg-gradient-to-r from-[#1E8E3E] to-[#0B5ED7] mx-auto mt-6 rounded-full" />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Verified vendors", icon: "verified_user" },
              { title: "Secure platform", icon: "security" },
              { title: "Compliance-driven", icon: "rule" }
            ].map((feat, i) => (
              <div key={i} className="bg-[#F5F7FA] border border-[#E2E8F0] shadow-[0_4px_16px_rgba(0,0,0,0.06)] rounded-[16px] p-10 text-center flex flex-col items-center justify-center hover:-translate-y-1 transition-transform">
                <span className="material-symbols-outlined text-[48px] text-[#1E8E3E] mb-6">{feat.icon}</span>
                <h4 className="font-bold text-[#1A1A2E] text-xl">{feat.title}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. CTA */}
      <section className="py-24 px-6 md:px-10 relative z-10 bg-[#E8F5E9] border-t border-[#E2E8F0]">
        <div className="max-w-4xl mx-auto text-center bg-[#FFFFFF] shadow-[0_10px_40px_rgba(0,0,0,0.12)] p-12 lg:p-20 rounded-[3rem] border border-[#E2E8F0] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#E8F5E9] to-transparent pointer-events-none" />
          <h2 className="relative z-10 text-[2.5rem] md:text-[3.5rem] font-headline font-extrabold text-[#1A1A2E] mb-8 leading-tight tracking-tight">
            Start Selling Your <br />E-Waste Today
          </h2>
          <div className="relative z-10 flex flex-col sm:flex-row gap-6 justify-center">
             <button suppressHydrationWarning onClick={() => router.push('/client-login?tab=register')} className="btn-primary font-bold text-[18px] px-12 py-5 shadow-[0_4px_16px_rgba(30,142,62,0.35)]">
               Get Started
             </button>
          </div>
        </div>
      </section>

      {/* 9. FOOTER */}
      <footer className="py-12 px-6 md:px-10 bg-[#1A1A2E] text-[rgba(255,255,255,0.8)] border-t-[3px] border-t-[#1E8E3E]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
            <img src="/logo 3.png" alt="We Connect" className="w-[120px] h-auto object-contain brightness-0 invert" />
          </div>
          <p className="text-[12px] uppercase tracking-widest font-medium">
            © 2026 We Connect Vendors LLP. All Rights Reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy", "Terms", "Contact"].map(item => (
              <button key={item} className="text-[12px] uppercase tracking-widest font-bold text-[rgba(255,255,255,0.6)] hover:text-[#1E8E3E] transition-colors">{item}</button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
