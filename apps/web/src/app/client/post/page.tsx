"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import Link from "next/link";

const CATEGORIES = [
  { icon: "monitor", label: "Display Units", desc: "Monitors, TVs, screens" },
  { icon: "laptop_mac", label: "Laptops & PCs", desc: "Computers, workstations" },
  { icon: "smartphone", label: "Mobile Devices", desc: "Phones, tablets" },
  { icon: "dns", label: "IT Equipment", desc: "Servers, networking gear" },
  { icon: "battery_charging_full", label: "Batteries", desc: "Li-ion, lead-acid" },
  { icon: "cable", label: "Cables & Wiring", desc: "Copper, fiber cables" },
  { icon: "print", label: "Printers", desc: "Laser, inkjet printers" },
  { icon: "memory", label: "Components", desc: "RAM, CPUs, circuit boards" },
  { icon: "power", label: "Power Equipment", desc: "UPS, generators" },
  { icon: "devices_other", label: "Other", desc: "Miscellaneous e-waste" },
];

const REQUIRED_DOCS = [
  { id: "auction_notice", label: "Auction Notice / Sale Notice", required: true },
  { id: "terms", label: "Terms & Conditions of Auction", required: true },
  { id: "asset_details", label: "Asset Details / Description Document", required: true },
  { id: "inventory_doc", label: "Inventory Document", required: true },
  { id: "material_list", label: "Material List (Excel Only)", required: true },
  { id: "weight_cert", label: "Weight Certificate", required: true },
  { id: "location_proof", label: "Location Proof", required: true },
  { id: "ownership", label: "Title Documents / Ownership Proof", required: true },
  { id: "encumbrance", label: "Encumbrance Certificate", required: false, optionalText: "(if applicable)" },
  { id: "inspection", label: "Inspection Report / Valuations", required: false, optionalText: "(if available)" },
  { id: "possession", label: "Possession Notice", required: false, optionalText: "(SARFAESI Act)" },
  { id: "sale_agreement", label: "Draft Sale Agreement", required: false, optionalText: "(optional)" }
];

export default function ClientPost() {
  const { addListing, currentUser, users } = useApp();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [form, setForm] = useState({
    title: "", weight: "", description: "", location: "",
    pickupAddress: "", urgency: "medium" as "low" | "medium" | "high",
    sealedBidStartDate: "", sealedBidEndDate: "",
    invitationDeadline: "",
  });
  const [images, setImages] = useState<string[]>([]);
  const [documents, setDocuments] = useState<{name: string, url: string, type: string}[]>([]);

  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState<"category" | "details" | "auction" | "media" | "invites">("category");
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: string) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => { const n = {...p}; delete n[k]; return n; }); };

  const handleNext = () => {
    const errs: Record<string, string> = {};
    if (step === "details") {
      if (!form.title) errs.title = "Required";
      if (!form.weight || isNaN(Number(form.weight))) errs.weight = "Valid weight required";
      if (!form.description) errs.description = "Required";
      if (!form.location) errs.location = "Required";
      if (!form.pickupAddress) errs.pickupAddress = "Required";
      if (Object.keys(errs).length > 0) { setErrors(errs); return; }
      setStep("auction");
    } else if (step === "auction") {
      if (!form.sealedBidStartDate) errs.sealedBidStartDate = "Required";
      if (!form.sealedBidEndDate) errs.sealedBidEndDate = "Required";
      if (Object.keys(errs).length > 0) { setErrors(errs); return; }
      setStep("media");
    } else if (step === "media") {
      const missingDocs = REQUIRED_DOCS.filter(d => d.required && !documents.some(doc => doc.type === d.id));
      if (missingDocs.length > 0) { 
        setErrors({ media: `Missing required documents: ${missingDocs.map(d => d.label).join(', ')}` }); 
        return; 
      }
      setStep("invites");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) { setErrors({ media: "Please upload at least one image." }); return; }
    
    addListing({
      title: form.title, category: selectedCategory, weight: Number(form.weight),
      location: form.location, userId: currentUser?.id || "", userName: currentUser?.name || "",
      description: form.description, urgency: form.urgency,
      pickupAddress: form.pickupAddress,
      sealedBidStartDate: new Date(form.sealedBidStartDate).toISOString(),
      sealedBidEndDate: new Date(form.sealedBidEndDate).toISOString(),
      invitationDeadline: form.invitationDeadline ? new Date(form.invitationDeadline).toISOString() : undefined,
      invitedVendorIds: selectedVendors,
      images, documents
    });
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="max-w-xl mx-auto text-center py-16">
        <div className="w-24 h-24 rounded-full bg-[color:var(--color-primary-fixed)] flex items-center justify-center mx-auto mb-6 animate-bounce">
          <span className="material-symbols-outlined text-5xl text-[color:var(--color-on-primary-fixed)]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        </div>
        <h2 className="text-3xl font-headline font-extrabold text-[color:var(--color-on-surface)] mb-3">Auction Scheduled!</h2>
        <p className="text-[color:var(--color-on-surface-variant)] mb-6">Your e-waste auction is verified and scheduled. Vendors will be notified.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/client/listings" className="btn-primary">View My Auctions</Link>
          <a href="/client/post" className="btn-outline">Post Another</a>
        </div>
      </div>
    );
  }

  const stepsList = ["Category", "Details", "Sealed Bid", "Media", "Invites"];
  const currentStepIndex = step === "category" ? 0 : step === "details" ? 1 : step === "auction" ? 2 : step === "media" ? 3 : 4;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div>
        <h2 className="text-3xl font-headline font-extrabold tracking-tight text-[color:var(--color-on-surface)]">Post E-Waste Listing</h2>
        <p className="text-[color:var(--color-on-surface-variant)] mt-1">Configure your listing for a transparent, legitimate e-auction.</p>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-2 px-2 md:mx-0 md:px-0">
        {stepsList.map((s, i) => (
          <div key={s} className="flex items-center gap-2 whitespace-nowrap">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-colors ${
              i < currentStepIndex ? "bg-[color:var(--color-primary)] text-[color:var(--color-on-primary)]" :
              i === currentStepIndex ? "bg-[color:var(--color-tertiary)] text-[color:var(--color-on-tertiary)]" :
              "bg-[color:var(--color-surface-dim)] text-[color:var(--color-on-surface-variant)]"
            }`}>
              {i < currentStepIndex ? <span className="material-symbols-outlined text-sm">check</span> : i + 1}
            </div>
            <span className={`text-xs font-bold ${i <= currentStepIndex ? "text-[color:var(--color-on-surface)]" : "text-[color:var(--color-outline)]"}`}>{s}</span>
            {i !== stepsList.length - 1 && <div className="w-8 h-px bg-[color:var(--color-outline-variant)] mx-2" />}
          </div>
        ))}
      </div>

      {step === "category" && (
        <div className="animate-fade-in card p-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-[color:var(--color-on-surface-variant)] mb-4">Select Category</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {CATEGORIES.map(cat => (
              <button key={cat.label} type="button" onClick={() => setSelectedCategory(cat.label)}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  selectedCategory === cat.label
                    ? "border-[color:var(--color-primary)] bg-[color:var(--color-secondary-container)]"
                    : "border-[color:var(--color-outline-variant)] bg-white hover:border-[color:var(--color-primary)]/30"
                }`}>
                <span className={`material-symbols-outlined text-3xl block mb-2 ${selectedCategory === cat.label ? "text-[color:var(--color-primary)]" : "text-[color:var(--color-on-surface-variant)]"}`}
                  style={selectedCategory === cat.label ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                  {cat.icon}
                </span>
                <p className="font-black text-xs text-[color:var(--color-on-surface)] leading-tight">{cat.label}</p>
              </button>
            ))}
          </div>
          <div className="mt-8 flex justify-end">
             <button onClick={() => { if (selectedCategory) setStep("details"); }} disabled={!selectedCategory} className={`btn-primary px-8 py-3 rounded-xl font-black text-sm uppercase tracking-widest ${!selectedCategory ? "opacity-50" : ""}`}>Next Step →</button>
          </div>
        </div>
      )}

      {step === "details" && (
        <div className="animate-fade-in space-y-6">
          <div className="card p-6 space-y-4">
             <h3 className="text-sm font-black uppercase tracking-widest text-[color:var(--color-on-surface-variant)]">Basic Information</h3>
             <div>
               <label className="label">Listing Title *</label>
               <input className={`input-base ${errors.title ? "ring-2 ring-red-400" : ""}`} value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Batch of 15 CRT Monitors" />
             </div>
             <div>
                <label className="label">Total Weight (KG) *</label>
                <input type="number" className={`input-base ${errors.weight ? "ring-2 ring-red-400" : ""}`} value={form.weight} onChange={e => set("weight", e.target.value)} placeholder="50" min="0.1" step="0.1" />
             </div>
             <div>
               <label className="label">Description & Condition *</label>
               <textarea rows={3} className={`input-base resize-none ${errors.description ? "ring-2 ring-red-400" : ""}`} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Describe condition, quantity, special handling requirements..." />
             </div>
          </div>
          <div className="card p-6 space-y-4">
             <h3 className="text-sm font-black uppercase tracking-widest text-[color:var(--color-on-surface-variant)]">Logistics</h3>
             <div>
               <label className="label">City / Area *</label>
               <input className={`input-base ${errors.location ? "ring-2 ring-red-400" : ""}`} value={form.location} onChange={e => set("location", e.target.value)} placeholder="e.g. Koramangala, Bangalore" />
             </div>
             <div>
               <label className="label">Full Pickup Address *</label>
               <textarea rows={2} className={`input-base resize-none ${errors.pickupAddress ? "ring-2 ring-red-400" : ""}`} value={form.pickupAddress} onChange={e => set("pickupAddress", e.target.value)} placeholder="Building, floor, landmark..." />
             </div>
             <div>
               <label className="label">Pickup Urgency</label>
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-1">
                 {[["low", "Low", "Within 2 weeks"], ["medium", "Medium", "Within 1 week"], ["high", "High", "ASAP (1–2 days)"]].map(([val, label, desc]) => (
                   <button key={val} type="button" onClick={() => set("urgency", val)}
                     className={`p-3 rounded-xl border-2 text-left transition-all ${
                       form.urgency === val
                         ? val === "high" ? "border-red-400 bg-red-50" : val === "medium" ? "border-amber-400 bg-amber-50" : "border-[color:var(--color-primary)] bg-[color:var(--color-secondary-container)]"
                         : "border-[color:var(--color-outline-variant)] bg-white"
                     }`}>
                     <p className="text-[10px] font-black uppercase tracking-widest">{label}</p>
                     <p className="text-[9px] text-[color:var(--color-on-surface-variant)] mt-0.5">{desc}</p>
                   </button>
                 ))}
               </div>
             </div>
          </div>
          <div className="flex flex-col-reverse sm:flex-row gap-4 justify-between mt-8">
            <button onClick={() => setStep("category")} className="btn-outline w-full sm:w-auto px-8 py-3 rounded-xl font-bold">← Back</button>
            <button onClick={handleNext} className="btn-primary w-full sm:w-auto px-8 py-3 rounded-xl font-black text-sm uppercase tracking-widest">Next Step →</button>
          </div>
        </div>
      )}

      {step === "auction" && (
        <div className="animate-fade-in space-y-6">
          <div className="card p-6 space-y-6">
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-[color:var(--color-on-surface-variant)]">Sealed Bid Window</h3>
              <p className="text-xs text-[color:var(--color-on-surface-variant)] mt-1">Set when the sealed bidding phase opens and closes. Typically 2–3 hours. Vendors who accept your invitation will bid privately during this window.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Sealed Bid Opens *</label>
                <input
                  type="datetime-local"
                  className={`input-base ${errors.sealedBidStartDate ? "ring-2 ring-red-400" : ""}`}
                  value={form.sealedBidStartDate}
                  onChange={e => { set("sealedBidStartDate", e.target.value); }}
                  onInput={e => { if (e.currentTarget.value.length >= 16) e.currentTarget.blur(); }}
                />
                {errors.sealedBidStartDate && <p className="text-red-500 text-xs mt-1">{errors.sealedBidStartDate}</p>}
              </div>
              <div>
                <label className="label">Sealed Bid Closes *</label>
                <input
                  type="datetime-local"
                  className={`input-base ${errors.sealedBidEndDate ? "ring-2 ring-red-400" : ""}`}
                  value={form.sealedBidEndDate}
                  onChange={e => { set("sealedBidEndDate", e.target.value); }}
                  onInput={e => { if (e.currentTarget.value.length >= 16) e.currentTarget.blur(); }}
                />
                {errors.sealedBidEndDate && <p className="text-red-500 text-xs mt-1">{errors.sealedBidEndDate}</p>}
              </div>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
              <span className="material-symbols-outlined text-blue-500 text-base mt-0.5">info</span>
              <p className="text-xs text-blue-700 leading-relaxed">
                <strong>Base price, tick size, and open bidding schedule</strong> are configured after invitation responses are received. You will set these when you click <em>"Schedule Open Bidding"</em> on your listings page.
              </p>
            </div>
          </div>
          <div className="card p-6 space-y-4">
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-[color:var(--color-on-surface-variant)]">Invitation Deadline</h3>
              <p className="text-xs text-[color:var(--color-on-surface-variant)] mt-1">Optional: deadline by which invited vendors must respond.</p>
            </div>
            <div>
              <label className="label">Vendor Response Deadline (optional)</label>
              <input
                type="datetime-local"
                className="input-base"
                value={form.invitationDeadline}
                onChange={e => { set("invitationDeadline", e.target.value); }}
                onInput={e => { if (e.currentTarget.value.length >= 16) e.currentTarget.blur(); }}
              />
            </div>
          </div>
          <div className="flex flex-col-reverse sm:flex-row gap-4 justify-between mt-8">
            <button onClick={() => setStep("details")} className="btn-outline w-full sm:w-auto px-8 py-3 rounded-xl font-bold">← Back</button>
            <button onClick={handleNext} className="btn-primary w-full sm:w-auto px-8 py-3 rounded-xl font-black text-sm uppercase tracking-widest">Next Step →</button>
          </div>
        </div>
      )}

      {step === "media" && (
        <form onSubmit={handleSubmit} className="animate-fade-in space-y-6">
          <div className="card p-6 space-y-4">
             <h3 className="text-sm font-black uppercase tracking-widest text-[color:var(--color-on-surface-variant)] flex items-center justify-between">
               Images of Equipment
               <span className="text-[10px] bg-[color:var(--color-primary-container)] text-[color:var(--color-on-primary-container)] px-2 py-1 rounded">Required</span>
             </h3>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
               {images.map((img, i) => (
                 <div key={i} className="aspect-square bg-[color:var(--color-surface-dim)] rounded-xl border border-[color:var(--color-outline-variant)] overflow-hidden">
                   <img src={img} alt="e-waste" className="w-full h-full object-cover" />
                 </div>
               ))}
               <label className="aspect-square bg-[color:var(--color-surface)] border-2 border-dashed border-[color:var(--color-outline-variant)] rounded-xl flex flex-col items-center justify-center text-[color:var(--color-primary)] hover:bg-[color:var(--color-secondary-container)] transition-colors cursor-pointer text-center p-2">
                 <input 
                    type="file" 
                    accept="image/*" 
                    capture="environment" 
                    className="hidden" 
                    onChange={(e) => {
                      if (e.target.files?.length) {
                        Array.from(e.target.files).forEach(file => {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setImages(prev => [...prev, reader.result as string]);
                          };
                          reader.readAsDataURL(file);
                        });
                      }
                    }} 
                 />
                 <span className="material-symbols-outlined text-2xl">photo_camera</span>
                 <span className="text-[10px] font-black uppercase mt-2">Open Camera to Take Photo</span>
               </label>
             </div>
          </div>

          <div className="card p-6 space-y-4">
             <h3 className="text-sm font-black uppercase tracking-widest text-[color:var(--color-on-surface-variant)] flex items-center justify-between">
               Legal & Compliance Documents
               <span className="text-[10px] bg-[color:var(--color-primary-container)] text-[color:var(--color-on-primary-container)] px-2 py-1 rounded">Required</span>
             </h3>
             <p className="text-xs text-[color:var(--color-on-surface-variant)] -mt-2">Upload the following critical legal documents to secure platform approval for this auction block.</p>
             <div className="space-y-3">
               {REQUIRED_DOCS.map(docReq => {
                 const uploadedDoc = documents.find(d => d.type === docReq.id);
                 return (
                   <div key={docReq.id} className={`flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 border rounded-xl transition-colors ${uploadedDoc ? "bg-emerald-50/30 border-emerald-200" : "bg-slate-50 border-slate-100"}`}>
                      <div>
                        <p className="text-sm font-bold text-[color:var(--color-on-surface)] flex items-center gap-2">
                           {docReq.label}
                           {docReq.required 
                            ? <span className="text-[9px] text-red-500 bg-red-50 px-1.5 py-0.5 rounded font-black uppercase shadow-sm">Req</span> 
                            : <span className="text-[9px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-black uppercase tracking-widest">{docReq.optionalText}</span>}
                        </p>
                      </div>
                      <div className="shrink-0">
                         {uploadedDoc ? (
                            <div className="flex items-center gap-2 bg-white text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-200 shadow-sm">
                               <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                               <span className="text-xs font-bold truncate max-w-[140px] md:max-w-[180px]">{uploadedDoc.name}</span>
                               <button type="button" onClick={() => setDocuments(documents.filter(d => d.type !== docReq.id))} className="ml-2 hover:text-red-500 transition-colors"><span className="material-symbols-outlined text-sm">close</span></button>
                            </div>
                         ) : (
                            <label className="btn-outline px-4 py-2 text-xs font-black uppercase tracking-widest rounded-lg cursor-pointer flex items-center gap-2 hover:bg-slate-100 w-fit">
                               <input 
                                 type="file" 
                                 accept={docReq.id === "material_list" ? ".xlsx,.xls,.csv" : ".pdf,.doc,.docx"} 
                                 className="hidden" 
                                 onChange={(e) => {
                                  if (e.target.files?.length) {
                                     const file = e.target.files[0];
                                     const reader = new FileReader();
                                     reader.onloadend = () => {
                                        setDocuments([...documents, { name: file.name, url: reader.result as string, type: docReq.id }]);
                                     };
                                     reader.readAsDataURL(file);
                                  }
                               }} />
                               <span className="material-symbols-outlined text-sm">upload_file</span> Upload
                            </label>
                         )}
                      </div>
                   </div>
                 )
               })}
             </div>
             {errors.media && <p className="text-red-500 text-xs text-center font-bold">{errors.media}</p>}
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-4 justify-between mt-8">
            <button type="button" onClick={() => setStep("auction")} className="btn-outline w-full sm:w-auto px-8 py-4 rounded-xl font-bold">← Back</button>
            <button type="button" onClick={handleNext} className="btn-primary w-full sm:flex-1 py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg flex items-center justify-center gap-2">
               Next Step →
            </button>
          </div>
        </form>
      )}

      {step === "invites" && (
        <form onSubmit={handleSubmit} className="animate-fade-in space-y-6">
          <div className="card p-6 space-y-4">
             <h3 className="text-sm font-black uppercase tracking-widest text-[color:var(--color-on-surface-variant)]">Step 5: Select Vendors</h3>
             <p className="text-xs text-[color:var(--color-on-surface-variant)]">Choose specialized vendors to invite for this auction. They will receive an invitation to bid.</p>
             
             <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {users.filter(u => u.role === 'vendor' && u.status === 'active').map(vendor => (
                  <label key={vendor.id} className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${selectedVendors.includes(vendor.id) ? "border-[color:var(--color-primary)] bg-[color:var(--color-secondary-container)]" : "border-[color:var(--color-outline-variant)] bg-white hover:border-[color:var(--color-primary)]/30"}`}>
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 accent-[color:var(--color-primary)]"
                      checked={selectedVendors.includes(vendor.id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedVendors([...selectedVendors, vendor.id]);
                        else setSelectedVendors(selectedVendors.filter(id => id !== vendor.id));
                      }}
                    />
                    <div>
                      <p className="font-black text-sm text-[color:var(--color-on-surface)]">{vendor.name}</p>
                      <p className="text-[10px] text-[color:var(--color-on-surface-variant)] uppercase font-bold tracking-wider">{vendor.onboardingProfile?.materialSpecializations?.join(', ') || 'General Recycler'}</p>
                    </div>
                  </label>
                ))}
             </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-4 justify-between mt-8">
            <button type="button" onClick={() => setStep("media")} className="btn-outline w-full sm:w-auto px-8 py-4 rounded-xl font-bold">← Back</button>
            <button type="submit" className="btn-tertiary w-full sm:flex-1 py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">send</span>
              Submit & Send Invitations
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
