"use client";

import { useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { UploadedDoc } from "@/types";

interface DocSlot {
  key: string;
  label: string;
  description: string;
  required: boolean;
  icon: string;
}

const VENDOR_DOCS: DocSlot[] = [
  { key: "company_reg", label: "Certificate of Incorporation", description: "Certificate of Incorporation / MOA", required: true, icon: "business_center" },
  { key: "gst_cert", label: "GST Registration Certificate", description: "Valid GST certificate matching your GSTIN", required: true, icon: "receipt_long" },
  { key: "company_pan", label: "Company PAN Card", description: "Valid PAN card of the bidding entity", required: true, icon: "credit_card" },
  { key: "pan_card", label: "Personal PAN Card (Director/Owner)", description: "PAN card of the primary director or owner", required: true, icon: "badge" },
  { key: "signatory_id", label: "Authorized Signatory ID Proof", description: "Aadhaar / PAN card of authorized signatory", required: true, icon: "badge" },
  { key: "board_resolution", label: "Board Resolution / Authorization Letter", description: "Authorization letter for the signatory", required: true, icon: "assignment" },
  { key: "kyc_form", label: "KYC Form / Bidder Registration Form", description: "Filled and signed KYC document", required: true, icon: "how_to_reg" },
  { key: "emd_proof", label: "EMD Proof (Earnest Money Deposit)", description: "Transfer receipt or deposit proof", required: true, icon: "payments" },
  { key: "terms", label: "Acceptance of Terms & Conditions", description: "Signed Terms & Conditions acceptance form", required: true, icon: "gavel" },
  { key: "pcb_auth", label: "Pollution Control Board Authorization", description: "Valid PCB consent to operate", required: true, icon: "factory" },
  { key: "recycler_license", label: "E-Waste Recycler License", description: "State or Central valid e-waste recycling license", required: true, icon: "recycling" },
  { key: "factory_license", label: "Factory License", description: "Valid factory operating license", required: true, icon: "domain" },
  { key: "epr_cert", label: "EPR Compliance Certificate", description: "Valid EPR Authorization document", required: true, icon: "verified" },
  { key: "insurance", label: "Business Insurance", description: "Valid liability or business insurance", required: false, icon: "shield" },
  { key: "vendor_onboarding", label: "Vendor Onboarding Form", description: "Filled and signed Vendor Onboarding form", required: true, icon: "assignment_ind" },
];

const CLIENT_DOCS: DocSlot[] = [
  { key: "gst_cert", label: "GST Registration Certificate", description: "Valid GST certificate matching your GSTIN", required: true, icon: "receipt_long" },
  { key: "incorporation_cert", label: "Certificate of Incorporation / MOA", description: "Issued by MCA / Registrar of Companies", required: true, icon: "business_center" },
  { key: "pan_card", label: "PAN Card", description: "Permanent Account Number card of the entity", required: true, icon: "credit_card" },
  { key: "signatory_id", label: "Authorized Signatory ID Proof", description: "Aadhaar / PAN of the authorized signatory", required: true, icon: "badge" },
  { key: "auth_letter", label: "Authorization Letter", description: "Letter authorizing the signatory to dispose of e-waste", required: true, icon: "assignment_ind" },
  { key: "address_proof", label: "Address Proof (Utility Bill)", description: "Electricity / water bill not older than 3 months", required: true, icon: "home" },
  { key: "e_waste_declaration", label: "E-Waste Declaration", description: "Signed E-Waste Declaration Form", required: true, icon: "gavel" },
];

const CONSUMER_DOCS: DocSlot[] = [
  { key: "aadhar_card", label: "Aadhar Card", description: "Front and back scan of your Aadhar card", required: true, icon: "badge" },
  { key: "pan_card", label: "PAN Card", description: "Clear scan of your personal PAN card", required: true, icon: "credit_card" },
  { key: "gst_card", label: "GST Card / Registration", description: "GST registration certificate (if applicable)", required: true, icon: "receipt_long" },
];

export default function OnboardingStep2() {
  const params = useParams();
  const role = params.role as string;
  const router = useRouter();
  const { currentUser, pendingOnboardingRole, saveOnboardingDocuments } = useApp();
  const effectiveRole = role || pendingOnboardingRole || currentUser?.role || "client";
  const slots = effectiveRole === "vendor" ? VENDOR_DOCS : effectiveRole === "consumer" ? CONSUMER_DOCS : CLIENT_DOCS;

  const [uploads, setUploads] = useState<Record<string, UploadedDoc | null>>({});
  const [dragging, setDragging] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleFile = (key: string, file: File) => {
    if (file.size > 10 * 1024 * 1024) { alert("File must be under 10MB"); return; }
    const reader = new FileReader();
    reader.onloadend = () => {
      const doc: UploadedDoc = {
        name: key,
        fileName: file.name,
        size: file.size > 1024 * 1024 ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : `${Math.round(file.size / 1024)} KB`,
        uploadedAt: new Date().toISOString(),
        status: "pending",
        url: reader.result as string,
      };
      setUploads(prev => ({ ...prev, [key]: doc }));
      setErrors(prev => prev.filter(e => e !== key));
    };
    reader.readAsDataURL(file);
  };

  const removeUpload = (key: string) => {
    setUploads(prev => { const n = { ...prev }; delete n[key]; return n; });
  };

  const fillDemoDocs = () => {
    const demoUploads: Record<string, UploadedDoc> = {};
    slots.forEach(slot => {
      demoUploads[slot.key] = {
        name: slot.key,
        fileName: `${slot.key.replace(/_/g, '-')}-demo.pdf`,
        size: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`,
        uploadedAt: new Date().toISOString(),
        status: "pending",
      };
    });
    setUploads(demoUploads);
    setErrors([]);
  };

  const handleSubmit = () => {
    const missing = slots.filter(s => s.required && !uploads[s.key]).map(s => s.key);
    if (missing.length > 0) {
      setErrors(missing);
      return;
    }

    const docs = Object.values(uploads).filter(Boolean) as UploadedDoc[];
    saveOnboardingDocuments(docs);
    router.push(`/onboarding/${effectiveRole}/step3`);
  };

  return (
    <div>
      <div className="mb-8">
        <span className="inline-flex items-center gap-2 bg-[color:var(--color-secondary-container)] text-[color:var(--color-on-secondary-container)] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
          <span className="material-symbols-outlined text-sm">upload_file</span>
          Step 2 — Document Upload
        </span>
        <h1 className="text-3xl font-headline font-extrabold text-[color:var(--color-on-surface)] tracking-tight">
          Compliance Documents
        </h1>
        <p className="text-[color:var(--color-on-surface-variant)] mt-1">
          Upload clear scans or photos. Accepted formats: PDF, JPG, PNG (max 10MB each).
        </p>
      </div>

      <div className="flex justify-end mb-4">
        <button type="button" onClick={fillDemoDocs}
          className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-bold hover:bg-amber-100 transition-all">
          <span className="material-symbols-outlined text-sm">auto_awesome</span>
          Auto-fill Demo Docs
        </button>
      </div>
      <div className="space-y-4 mb-8">
        {slots.map(slot => {
          const uploaded = uploads[slot.key];
          const hasError = errors.includes(slot.key);
          const isDraggingOver = dragging === slot.key;

          return (
            <div key={slot.key}
              className={`rounded-xl border-2 transition-all ${
                uploaded ? "border-[color:var(--color-primary)] bg-[color:var(--color-primary-fixed)]/5" :
                hasError ? "border-red-400 bg-red-50" :
                isDraggingOver ? "border-[color:var(--color-tertiary)] bg-[color:var(--color-surface-container)]" :
                "border-[color:var(--color-outline-variant)] bg-white hover:border-[color:var(--color-primary)]/40"
              }`}
              onDragOver={e => { e.preventDefault(); setDragging(slot.key); }}
              onDragLeave={() => setDragging(null)}
              onDrop={e => {
                e.preventDefault(); setDragging(null);
                const f = e.dataTransfer.files[0];
                if (f) handleFile(slot.key, f);
              }}
            >
              {uploaded ? (
                <div className="flex items-center gap-4 p-4">
                  <div className="w-12 h-12 rounded-xl bg-[color:var(--color-primary-fixed)] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[color:var(--color-on-primary-fixed)]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-[color:var(--color-on-surface)] truncate">{slot.label}</p>
                    <p className="text-xs text-[color:var(--color-primary)] truncate">{uploaded.fileName}</p>
                    <p className="text-[10px] text-[color:var(--color-on-surface-variant)]">{uploaded.size} · Uploaded</p>
                  </div>
                  <button onClick={() => removeUpload(slot.key)}
                    className="w-8 h-8 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 flex items-center justify-center shrink-0 transition-colors">
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              ) : (
                <div className="p-5 flex items-center gap-4 cursor-pointer" onClick={() => inputRefs.current[slot.key]?.click()}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    hasError ? "bg-red-100 text-red-500" : "bg-[color:var(--color-secondary-container)] text-[color:var(--color-primary)]"
                  }`}>
                    <span className="material-symbols-outlined">{slot.icon}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-[color:var(--color-on-surface)]">
                      {slot.label}
                      {slot.required && <span className="text-red-500 ml-1">*</span>}
                    </p>
                    <p className="text-xs text-[color:var(--color-on-surface-variant)]">{slot.description}</p>
                    {hasError && <p className="text-xs text-red-500 font-bold mt-0.5">This document is required</p>}
                  </div>
                  <div className="shrink-0 flex flex-col items-center gap-1 text-[color:var(--color-primary)]">
                    <span className="material-symbols-outlined text-2xl">cloud_upload</span>
                    <span className="text-[10px] font-bold uppercase tracking-wide">Upload</span>
                  </div>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png"
                    ref={el => { inputRefs.current[slot.key] = el; }}
                    className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(slot.key, f); }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-[color:var(--color-surface-container-low)] rounded-xl p-4 flex gap-3 mb-8">
        <span className="material-symbols-outlined text-[color:var(--color-primary)] shrink-0">security</span>
        <p className="text-xs text-[color:var(--color-on-surface-variant)]">
          <strong className="text-[color:var(--color-on-surface)]">Secure & Confidential.</strong> All documents are encrypted and only reviewed by authorized WeConnect compliance officers. They will not be shared with third parties.
        </p>
      </div>

      <div className="flex gap-4">
        <button onClick={() => router.back()}
          className="btn-outline flex-1 py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back
        </button>
        <button onClick={handleSubmit}
          className="btn-tertiary flex-1 py-4 rounded-xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg">
          Continue to Bank Details
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
