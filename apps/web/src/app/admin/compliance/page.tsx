"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

const DOCS = [
  { type: "FORM_6", label: "Form 6", icon: "description" },
  { type: "WEIGHT_SLIP_EMPTY", label: "Weight Slip (Empty)", icon: "scale" },
  { type: "WEIGHT_SLIP_LOADED", label: "Weight Slip (Loaded)", icon: "scale" },
  { type: "RECYCLING_CERTIFICATE", label: "Recycling Certificate", icon: "recycling" },
  { type: "DISPOSAL_CERTIFICATE", label: "Disposal Certificate", icon: "delete_forever" },
] as const;

export default function AdminCompliance() {
  const { listings, bids, users, verifyCompliance } = useApp();
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [verifying, setVerifying] = useState(false);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const openDoc = async (doc: any) => {
    if (!doc?.s3Key) return;
    try {
      const res = await api.get(`/companies/signed-url?s3Key=${encodeURIComponent(doc.s3Key)}&s3Bucket=${encodeURIComponent(doc.s3Bucket)}`);
      const url = res.data?.url || res.data?.signedUrl || res.data;
      if (typeof url === "string") window.open(url, "_blank");
    } catch {
      showToast("Could not generate secure document link", "error");
    }
  };

  const handleVerify = async (listingId: string) => {
    setVerifying(true);
    try {
      await verifyCompliance(listingId);
      showToast("Compliance verified & lot finalized successfully.");
      setConfirmId(null);
    } catch {
      showToast("Failed to verify compliance.", "error");
    } finally {
      setVerifying(false);
    }
  };

  // Listings with compliance documents uploaded
  const complianceListings = listings.filter(l =>
    l.complianceStatus === "documents_uploaded" || l.complianceStatus === "verified"
  );

  const getWinner = (listingId: string) =>
    bids.find(b => b.listingId === listingId && b.status === "accepted");

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 relative">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 px-6 py-3 rounded-xl shadow-xl z-50 text-white font-bold text-sm ${toast.type === "success" ? "bg-emerald-600" : "bg-red-600"}`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <h2 className="text-3xl font-headline font-extrabold tracking-tight text-[color:var(--color-on-surface)]">Compliance Verification</h2>
        <p className="text-[color:var(--color-on-surface-variant)] mt-1">Review vendor compliance documents and certify completed e-waste disposal.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Docs Submitted", value: complianceListings.filter(l => l.complianceStatus === "documents_uploaded").length, color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20", icon: "upload_file" },
          { label: "Verified", value: complianceListings.filter(l => l.complianceStatus === "verified").length, color: "text-primary bg-primary/10 dark:bg-primary/20", icon: "verified" },
          { label: "Total Processed", value: complianceListings.length, color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20", icon: "shield" },
        ].map(s => (
          <div key={s.label} className="card p-5 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                <span className="material-symbols-outlined text-lg">{s.icon}</span>
              </div>
              <div>
                <p className="text-2xl font-black text-[color:var(--color-on-surface)]">{s.value}</p>
                <p className="text-xs text-[color:var(--color-on-surface-variant)] font-medium">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {complianceListings.length === 0 ? (
        <div className="card p-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
          <span className="material-symbols-outlined text-5xl text-slate-300 block mb-3">shield</span>
          <p className="font-bold text-slate-600 dark:text-slate-400">No compliance submissions yet</p>
          <p className="text-sm text-slate-400 mt-1">Documents appear here once vendors upload post-pickup compliance files.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {complianceListings.map(listing => {
            const winner = getWinner(listing.id);
            const isVerified = listing.complianceStatus === "verified";
            const client = users.find(u => u.id === listing.userId);
            const allDocsPresent = DOCS.every(d => listing.pickupDocs?.some((pd: any) => pd.type === d.type));

            return (
              <div key={listing.id} className={`card p-0 overflow-hidden border-2 ${isVerified ? "border-emerald-500 bg-emerald-50/5 dark:bg-emerald-950/5" : "border-slate-200 dark:border-slate-800"}`}>
                <div className={`p-5 border-b ${isVerified ? "bg-emerald-500/10 border-emerald-500/20" : "bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800"}`}>
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-black text-slate-400 uppercase font-mono">ID: {listing.id.substring(0, 8)}</span>
                        <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider ${isVerified ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"}`}>
                          {isVerified ? "Verified" : "Pending Verification"}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white">{listing.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Location: <span className="font-semibold">{listing.location}</span> · Vendor: <span className="font-semibold">{winner?.vendorName || listing.winnerVendorName || "—"}</span> · Client: <span className="font-semibold">{client?.name || listing.userName}</span>
                      </p>
                    </div>
                    {!isVerified && allDocsPresent && (
                      <button
                        onClick={() => setConfirmId(listing.id)}
                        className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-white text-xs font-black uppercase tracking-wider shadow-md shrink-0 transition-colors"
                      >
                        Verify Compliance
                      </button>
                    )}
                    {isVerified && (
                      <div className="flex items-center gap-1.5 text-emerald-600">
                        <span className="material-symbols-outlined text-2xl">verified</span>
                        <span className="text-xs font-black uppercase tracking-widest">Done</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {DOCS.map(doc => {
                      const match = listing.pickupDocs?.find((pd: any) => pd.type === doc.type);
                      return (
                        <div key={doc.type} className={`p-4 rounded-xl border text-center transition-all ${match ? "border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20" : "border-dashed border-slate-200 bg-slate-50/50 dark:bg-slate-900/30 dark:border-slate-800"}`}>
                          <span className={`material-symbols-outlined text-2xl block mb-1 ${match ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"}`}>{doc.icon}</span>
                          <p className={`text-[10px] font-black uppercase leading-tight ${match ? "text-emerald-800 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"}`}>{doc.label}</p>
                          {match ? (
                            <button
                              onClick={() => openDoc(match)}
                              className="text-[10px] text-primary dark:text-emerald-400 font-black hover:underline block mt-2 mx-auto flex items-center justify-center gap-0.5"
                            >
                              <span className="material-symbols-outlined text-xs">visibility</span>
                              View Document
                            </button>
                          ) : (
                            <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-2 italic font-semibold">Not Uploaded</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {listing.pickupScheduledDate && (
                    <p className="text-xs text-slate-500 mt-4 font-medium">
                      <span className="font-bold">Pickup Settled Date:</span> {new Date(listing.pickupScheduledDate).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirm verification modal */}
      {confirmId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto text-emerald-600">
              <span className="material-symbols-outlined text-2xl">verified</span>
            </div>
            <h3 className="text-xl font-headline font-extrabold text-center text-slate-900 dark:text-white">Verify Compliance?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center leading-relaxed">
              Are you sure all uploaded compliance files are verified? This will mark the lot transaction as fully completed on the platform.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setConfirmId(null)} className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800">Cancel</button>
              <button
                disabled={verifying}
                onClick={() => handleVerify(confirmId)}
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-bold flex items-center gap-1.5"
              >
                {verifying ? "Verifying..." : "Confirm & Complete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
