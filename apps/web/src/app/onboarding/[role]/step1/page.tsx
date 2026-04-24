"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { OnboardingProfile } from "@/types";

const INDIA_STATES = ["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Chandigarh","Puducherry"];

const CLIENT_SECTORS = ["IT & Technology","Banking & Finance","Healthcare","Manufacturing","Retail & E-Commerce","Education","Real Estate","Government / PSU","Hospitality","Telecom","Other"];

const VENDOR_SPECIALIZATIONS = ["Circuit Boards","Li-ion Batteries","CRT / LCD Monitors","Smartphones & Tablets","Server Equipment","Copper Wiring","Printers & Peripherals","UPS & Power Equipment","Industrial Electronics","Mixed E-Waste"];

export default function OnboardingStep1() {
  const params = useParams();
  const role = params.role as string;
  const router = useRouter();
  const { currentUser, pendingOnboardingRole, pendingOnboardingEmail, saveOnboardingProfile } = useApp();

  const effectiveRole = role || pendingOnboardingRole || currentUser?.role || "client";

  const [form, setForm] = useState<Partial<OnboardingProfile>>({
    companyName: "",
    contactPerson: "",
    email: pendingOnboardingEmail || currentUser?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    companyRegistrationNo: "",
    processingCapacity: "",
    materialSpecializations: [],
    cpcbNo: "",
    gstin: "",
    industrySector: "",
    numberOfEmployees: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: keyof OnboardingProfile, val: string) => {
    setForm(prev => ({ ...prev, [key]: val }));
    setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
  };

  const toggleSpec = (spec: string) => {
    const current = form.materialSpecializations || [];
    if (current.includes(spec)) {
      setForm(prev => ({ ...prev, materialSpecializations: current.filter(s => s !== spec) }));
    } else {
      setForm(prev => ({ ...prev, materialSpecializations: [...current, spec] }));
    }
  };

  const fillDemo = () => {
    const isVendor = effectiveRole === "vendor";
    const isConsumer = effectiveRole === "consumer";
    setForm({
      companyName: isVendor ? "GreenCycle Pvt Ltd" : isConsumer ? "Rahul Sharma" : "Accenture India Ltd",
      contactPerson: isVendor ? "Rajesh Kumar" : isConsumer ? "Rahul Sharma" : "Sanjay Mehta",
      email: pendingOnboardingEmail || (isVendor ? "ops@greencycle.in" : isConsumer ? "rahul@example.com" : "procurement@accenture.com"),
      phone: "+91 98765 43210",
      address: "Plot 45, Peenya Industrial Area, 2nd Phase",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560058",
      companyRegistrationNo: (isVendor || !isConsumer) ? "CIN-U72900KA2020PTC136422" : "",
      processingCapacity: isVendor ? "500 MT/month" : "",
      materialSpecializations: isVendor ? ["Circuit Boards", "Li-ion Batteries", "Server Equipment"] : [],
      cpcbNo: isVendor ? "CPCB/EWRE/KAR/2024/001" : "",
      gstin: (!isVendor && !isConsumer) ? "29AABCU9603R1ZX" : "",
      industrySector: (!isVendor && !isConsumer) ? "IT & Technology" : "",
      numberOfEmployees: (!isVendor && !isConsumer) ? "500+" : "",
    });
    setErrors({});
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.companyName?.trim()) e.companyName = "Required";
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    saveOnboardingProfile(form as OnboardingProfile);
    router.push(`/onboarding/${effectiveRole}/step2`);
  };


  return (
    <div>
      <div className="mb-8">
        <span className="inline-flex items-center gap-2 bg-[color:var(--color-secondary-container)] text-[color:var(--color-on-secondary-container)] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
          <span className="material-symbols-outlined text-sm">person_pin</span>
          {effectiveRole === "vendor" ? "Vendor" : effectiveRole === "consumer" ? "Individual" : "Client"} Registration
        </span>
        <h1 className="text-3xl font-headline font-extrabold text-[color:var(--color-on-surface)] tracking-tight">
          Company Profile
        </h1>
        <p className="text-[color:var(--color-on-surface-variant)] mt-1">
          Tell us about your organization. All fields are required unless marked optional.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Demo fill button */}
        <div className="flex justify-end">
          <button type="button" onClick={fillDemo}
            className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-bold hover:bg-amber-100 transition-all">
            <span className="material-symbols-outlined text-sm">auto_awesome</span>
            Fill Demo Data
          </button>
        </div>
        {/* Basic Info */}
        <div className="card p-6 space-y-5">
          <h3 className="text-sm font-black uppercase tracking-widest text-[color:var(--color-on-surface-variant)] flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-[color:var(--color-primary)]">business</span>
            Organization Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label">{effectiveRole === 'consumer' ? 'Full Name *' : 'Company / Organization Name *'}</label>
              <input className={`input-base ${errors.companyName ? "ring-2 ring-red-400" : ""}`}
                value={form.companyName} onChange={e => set("companyName", e.target.value)}
                placeholder="e.g. Green Solutions Pvt Ltd" />
              {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>}
            </div>
            {effectiveRole !== 'consumer' && (
              <div>
                <label className="label">Contact Person Name *</label>
                <input className={`input-base ${errors.contactPerson ? "ring-2 ring-red-400" : ""}`}
                  value={form.contactPerson} onChange={e => set("contactPerson", e.target.value)}
                  placeholder="Authorized signatory name" />
                {errors.contactPerson && <p className="text-red-500 text-xs mt-1">{errors.contactPerson}</p>}
              </div>
            )}
            <div>
              <label className="label">Business Email *</label>
              <input type="email" className={`input-base ${errors.email ? "ring-2 ring-red-400" : ""}`}
                value={form.email} onChange={e => set("email", e.target.value)}
                placeholder="contact@company.com" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="label">Phone Number *</label>
              <input type="tel" className={`input-base ${errors.phone ? "ring-2 ring-red-400" : ""}`}
                value={form.phone} onChange={e => set("phone", e.target.value)}
                placeholder="+91 98765 43210" maxLength={15} />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="card p-6 space-y-5">
          <h3 className="text-sm font-black uppercase tracking-widest text-[color:var(--color-on-surface-variant)] flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-[color:var(--color-primary)]">location_on</span>
            Registered Address
          </h3>
          <div>
            <label className="label">Street Address *</label>
            <input className={`input-base ${errors.address ? "ring-2 ring-red-400" : ""}`}
              value={form.address} onChange={e => set("address", e.target.value)}
              placeholder="Building no., Street name, Area" />
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">City *</label>
              <input className={`input-base ${errors.city ? "ring-2 ring-red-400" : ""}`}
                value={form.city} onChange={e => set("city", e.target.value)} placeholder="Bangalore" />
              {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
            </div>
            <div>
              <label className="label">State *</label>
              <select className={`input-base ${errors.state ? "ring-2 ring-red-400" : ""}`}
                value={form.state} onChange={e => set("state", e.target.value)}>
                <option value="">Select State</option>
                {INDIA_STATES.map(s => <option key={s}>{s}</option>)}
              </select>
              {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
            </div>
            <div>
              <label className="label">PIN Code *</label>
              <input className={`input-base ${errors.pincode ? "ring-2 ring-red-400" : ""}`}
                value={form.pincode} onChange={e => set("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="560001" maxLength={6} />
              {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
            </div>
          </div>
        </div>

        {/* Role-specific */}
        {effectiveRole === "vendor" ? (
          <div className="card p-6 space-y-5">
            <h3 className="text-sm font-black uppercase tracking-widest text-[color:var(--color-on-surface-variant)] flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-[color:var(--color-primary)]">recycling</span>
              Recycler Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">CPCB Authorization No. *</label>
                <input className={`input-base font-mono ${errors.cpcbNo ? "ring-2 ring-red-400" : ""}`}
                  value={form.cpcbNo} onChange={e => set("cpcbNo", e.target.value.toUpperCase())}
                  placeholder="CPCB/EWRE/KAR/2024/001" />
                {errors.cpcbNo && <p className="text-red-500 text-xs mt-1">{errors.cpcbNo}</p>}
              </div>
              <div>
                <label className="label">Company Reg. No. *</label>
                <input className={`input-base font-mono`}
                  value={form.companyRegistrationNo} onChange={e => set("companyRegistrationNo", e.target.value)}
                  placeholder="CRN-2024-XXXXXX" />
              </div>
              <div className="md:col-span-2">
                <label className="label">Monthly Processing Capacity</label>
                <input className="input-base"
                  value={form.processingCapacity} onChange={e => set("processingCapacity", e.target.value)}
                  placeholder="e.g. 500 MT/month" />
              </div>
              <div className="md:col-span-2">
                <label className="label">Material Specializations (select all that apply)</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {VENDOR_SPECIALIZATIONS.map(spec => {
                    const selected = form.materialSpecializations?.includes(spec);
                    return (
                      <button key={spec} type="button" onClick={() => toggleSpec(spec)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${
                          selected
                            ? "bg-[color:var(--color-primary)] text-white border-[color:var(--color-primary)]"
                            : "bg-transparent text-[color:var(--color-on-surface-variant)] border-[color:var(--color-outline-variant)] hover:border-[color:var(--color-primary)]/50"
                        }`}
                      >
                        {spec}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : effectiveRole === "client" ? (
          <div className="card p-6 space-y-5">
            <h3 className="text-sm font-black uppercase tracking-widest text-[color:var(--color-on-surface-variant)] flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-[color:var(--color-primary)]">domain</span>
              Client Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="label">GSTIN *</label>
                <input className={`input-base font-mono ${errors.gstin ? "ring-2 ring-red-400" : ""}`}
                  value={form.gstin} onChange={e => set("gstin", e.target.value.toUpperCase())}
                  placeholder="22AAAAA0000A1Z5" maxLength={15} />
                {errors.gstin && <p className="text-red-500 text-xs mt-1">{errors.gstin}</p>}
              </div>
              <div>
                <label className="label">Industry Sector</label>
                <select className="input-base" value={form.industrySector} onChange={e => set("industrySector", e.target.value)}>
                  <option value="">Select Sector</option>
                  {CLIENT_SECTORS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Number of Employees</label>
                <select className="input-base" value={form.numberOfEmployees} onChange={e => set("numberOfEmployees", e.target.value)}>
                  <option value="">Select Range</option>
                  <option>1–10</option><option>11–50</option><option>51–200</option>
                  <option>201–500</option><option>500+</option>
                </select>
              </div>
            </div>
          </div>
        ) : null}

        <button type="submit" className="btn-tertiary w-full py-4 rounded-xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg">
          Continue to Document Upload
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </form>
    </div>
  );
}
