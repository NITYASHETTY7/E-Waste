const fs = require('fs');

const clientPage = "use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";

type AuthTab = "login" | "register";

export default function ClientLoginPage() {
  const [tab, setTab] = useState<AuthTab>("login");
  
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regCompany, setRegCompany] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { login, users, startOnboarding } = useApp();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));

    const user = users.find(u => u.email.toLowerCase() === loginEmail.toLowerCase());

    if (!user) {
      login("client", loginEmail);
      router.push("/client/dashboard");
      setLoading(false);
      return;
    }

    login(user.role, user.email);
    router.push("/client/dashboard");
    setLoading(false);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!regEmail || !regPassword) { setError("Email and password are required."); return; }
    if (regPassword !== regConfirm) { setError("Passwords do not match."); return; }
    if (regPassword.length < 8) { setError("Password must be at least 8 characters."); return; }
    
    startOnboarding("client", regEmail, regPassword);
    router.push(\/onboarding/client/step1\);
  };

  return (
    <div className="bg-[#F5F7FA] min-h-screen flex items-center justify-center p-6">
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] shadow-[0_10px_40px_rgba(0,0,0,0.12)] rounded-[24px] p-10 w-full max-w-[460px] flex flex-col">
        
        {/* Branding */}
        <div className="flex justify-center mb-8 cursor-pointer" onClick={() => router.push('/')}>
          <img src="/logo%203.png" alt="We Connect" className="h-12 object-contain" />
        </div>

        {/* Tabs Toggle */}
        <div className="flex p-1 bg-[#F0F4F8] rounded-xl mb-8 border border-[#E2E8F0]">
          {(["login", "register"] as AuthTab[]).map(t => (
            <button 
              key={t} 
              onClick={() => { setTab(t); setError(""); }}
              className={\lex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 \\}
            >
              {t === "login" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2 p-3 bg-[#FDEAEA] text-[#BA1A1A] rounded-xl text-xs font-semibold border border-[#BA1A1A]/20">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {error}
          </div>
        )}

        {tab === "login" ? (
          <div className="animate-fade-in">
            <div className="mb-8 text-center">
              <h2 className="text-[28px] font-headline font-extrabold text-[#1A1A2E] tracking-tight leading-none">Client Portal</h2>
              <p className="text-[#4A5568] text-sm mt-2 font-medium">Welcome back! Please enter your details.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
               <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#4A5568] block uppercase tracking-widest">Email Address</label>
                  <input type="email" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="name@company.com" className="w-full px-4 py-3.5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-[#1A1A2E] focus:border-[#1E8E3E] focus:ring-2 focus:ring-[#1E8E3E]/20 outline-none transition-all" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-bold text-[#4A5568] block uppercase tracking-widest">Password</label>
                    <button type="button" className="text-[10px] font-bold text-[#1E8E3E] hover:underline uppercase tracking-wider">Forgot?</button>
                  </div>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} required value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-3.5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-[#1A1A2E] focus:border-[#1E8E3E] focus:ring-2 focus:ring-[#1E8E3E]/20 outline-none transition-all pr-12 font-mono" />
                    <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#718096] hover:text-[#1A1A2E] p-1">
                      <span className="material-symbols-outlined text-[18px]">{showPassword ? "visibility_off" : "visibility"}</span>
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-[#1E8E3E] text-white font-bold rounded-xl py-3.5 flex items-center justify-center gap-2 mt-4 hover:bg-[#166B2E] transition-colors shadow-sm">
                  {loading ? <><span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> Authenticating...</> : <><span className="material-symbols-outlined text-[18px]">login</span> Sign In</>}
                </button>
            </form>

            <div className="mt-6 pt-6 border-t border-[#E2E8F0]">
              <button
                type="button"
                disabled={loading}
                onClick={async () => {
                  setLoading(true);
                  await new Promise(r => setTimeout(r, 600));
                  login("client", "client@WeConnect.com");
                  router.push("/client/dashboard");
                }}
                className="w-full py-3.5 bg-[#E8F5E9] text-[#1E8E3E] hover:bg-[#1E8E3E]/20 font-bold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm border border-[#1E8E3E]/20"
              >
                <span className="text-sm">science</span> Client Demo
              </button>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in">
             <div className="mb-8 text-center">
              <h2 className="text-[28px] font-headline font-extrabold text-[#1A1A2E] tracking-tight leading-none">Create Account</h2>
              <p className="text-[#4A5568] text-sm mt-2 font-medium">Join as a corporate client to post scrap.</p>
            </div>
            
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#4A5568] block uppercase tracking-widest">Full Name</label>
                  <input type="text" required value={regName} onChange={e => setRegName(e.target.value)} placeholder="John Doe" className="w-full px-4 py-3.5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-[#1A1A2E] focus:border-[#1E8E3E] focus:ring-2 focus:ring-[#1E8E3E]/20 outline-none transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#4A5568] block uppercase tracking-widest">Phone</label>
                  <input type="tel" required value={regPhone} onChange={e => setRegPhone(e.target.value)} placeholder="+91..." className="w-full px-4 py-3.5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-[#1A1A2E] focus:border-[#1E8E3E] focus:ring-2 focus:ring-[#1E8E3E]/20 outline-none transition-all" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#4A5568] block uppercase tracking-widest">Company Name</label>
                <input type="text" required value={regCompany} onChange={e => setRegCompany(e.target.value)} placeholder="Your Company Ltd." className="w-full px-4 py-3.5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-[#1A1A2E] focus:border-[#1E8E3E] focus:ring-2 focus:ring-[#1E8E3E]/20 outline-none transition-all" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#4A5568] block uppercase tracking-widest">Work Email</label>
                <input type="email" required value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="contact@company.com" className="w-full px-4 py-3.5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-[#1A1A2E] focus:border-[#1E8E3E] focus:ring-2 focus:ring-[#1E8E3E]/20 outline-none transition-all" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#4A5568] block uppercase tracking-widest">Password</label>
                <input type="password" required value={regPassword} onChange={e => setRegPassword(e.target.value)} placeholder="Min. 8 chars" className="w-full px-4 py-3.5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-[#1A1A2E] focus:border-[#1E8E3E] focus:ring-2 focus:ring-[#1E8E3E]/20 outline-none transition-all font-mono" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#4A5568] block uppercase tracking-widest">Confirm Password</label>
                <input type="password" required value={regConfirm} onChange={e => setRegConfirm(e.target.value)} placeholder="Repeat password" className="w-full px-4 py-3.5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-[#1A1A2E] focus:border-[#1E8E3E] focus:ring-2 focus:ring-[#1E8E3E]/20 outline-none transition-all font-mono" />
              </div>

              <button type="submit" className="w-full bg-[#1E8E3E] text-white font-bold rounded-xl py-3.5 flex items-center justify-center gap-2 mt-4 hover:bg-[#166B2E] transition-colors shadow-sm">
                <span className="material-symbols-outlined text-[18px]">person_add</span> Create Account
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
;

const vendorPage = clientPage
  .replace(/Client Portal/g, 'Vendor Portal')
  .replace(/client@WeConnect\.com/g, 'vendor@WeConnect.com')
  .replace(/client-login/g, 'vendor-login')
  .replace(/Client Demo/g, 'Vendor Demo')
  .replace(/Corporate client/g, 'Vendor')
  .replace(/#1E8E3E/g, '#0B5ED7')
  .replace(/#166B2E/g, '#0847A8')
  .replace(/#E8F5E9/g, '#E3EEFF')
  .replace(/ClientLoginPage/g, 'VendorLoginPage')
  .replace(/"client"/g, '"vendor"')
  .replace(/\/client\/dashboard/g, '/vendor/dashboard');

const adminPage = "use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";

export default function AdminLoginPage() {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { login, users } = useApp();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));

    const user = users.find(u => u.email.toLowerCase() === loginEmail.toLowerCase());

    if (!user || user.role !== "admin") {
      setError("Unauthorized access. Admin privileges required.");
      setLoading(false);
      return;
    }

    login("admin", user.email);
    router.push("/admin/dashboard");
    setLoading(false);
  };

  return (
    <div className="bg-[#1A1A2E] min-h-screen flex items-center justify-center p-6">
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] shadow-[0_24px_64px_rgba(0,0,0,0.6)] rounded-[24px] p-10 w-full max-w-[420px] flex flex-col">
        
        {/* Branding */}
        <div className="flex justify-center mb-8 cursor-pointer" onClick={() => router.push('/')}>
          <img src="/logo%203.png" alt="We Connect" className="h-10 object-contain" />
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2 p-3 bg-[#FDEAEA] text-[#BA1A1A] rounded-xl text-xs font-semibold border border-[#BA1A1A]/20">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {error}
          </div>
        )}

        <div className="animate-fade-in">
          <div className="mb-8 text-center">
            <h2 className="text-[28px] font-headline font-extrabold text-[#1A1A2E] tracking-tight leading-none">Admin Portal</h2>
            <p className="text-[#4A5568] text-sm mt-2 font-medium">System management access</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#4A5568] block uppercase tracking-widest">Admin ID / Email</label>
                <input 
                  type="text" 
                  required 
                  value={loginEmail} 
                  onChange={e => setLoginEmail(e.target.value)} 
                  placeholder="admin@weconnect.com" 
                  className="w-full px-4 py-3.5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-[#1A1A2E] focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/20 outline-none transition-all" 
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#4A5568] block uppercase tracking-widest">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required 
                    value={loginPassword} 
                    onChange={e => setLoginPassword(e.target.value)} 
                    placeholder="••••••••" 
                    className="w-full px-4 py-3.5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-[#1A1A2E] focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/20 outline-none transition-all pr-12 font-mono" 
                  />
                  <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#718096] hover:text-[#1A1A2E] p-1">
                    <span className="material-symbols-outlined text-[18px]">{showPassword ? "visibility_off" : "visibility"}</span>
                  </button>
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-[#1A1A2E] text-white font-bold rounded-xl py-3.5 flex items-center justify-center gap-2 mt-4 hover:bg-[#000000] transition-colors shadow-sm"
              >
                {loading ? <><span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> Authenticating...</> : <><span className="material-symbols-outlined text-[18px]">shield</span> Secure Login</>}
              </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#E2E8F0]">
            <button
              type="button"
              disabled={loading}
              onClick={async () => {
                setLoading(true);
                await new Promise(r => setTimeout(r, 600));
                login("admin", "admin@WeConnect.com");
                router.push("/admin/dashboard");
              }}
              className="w-full py-3.5 bg-[#FFF8E1] text-[#E6A800] hover:bg-[#FFC107]/20 font-bold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm border border-[#FFC107]/20"
            >
              <span className="text-sm">science</span> Admin Demo
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-[#E2E8F0] text-center">
             <div className="inline-flex items-center gap-2 text-[10px] font-bold text-[#BA1A1A] uppercase tracking-widest bg-[#FDEAEA] px-3 py-1.5 rounded-full border border-[#BA1A1A]/20">
               <span className="material-symbols-outlined text-[14px]">warning</span>
               Authorized Personnel Only
             </div>
             <p className="text-[#718096] text-[10px] mt-3">Unauthorized access is strictly prohibited and logged.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
;

fs.writeFileSync('src/app/client-login/page.tsx', clientPage);
fs.writeFileSync('src/app/vendor-login/page.tsx', vendorPage);
fs.writeFileSync('src/app/admin-login/page.tsx', adminPage);
console.log('Logins generated');
