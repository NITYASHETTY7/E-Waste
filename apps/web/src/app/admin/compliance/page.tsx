"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";

export default function AdminCompliance() {
  const { listings, bids, users, verifyCompliance } = useApp();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  // Listings with compliance documents uploaded
  const complianceListings = listings.filter(l =>
    l.complianceStatus === "documents_uploaded" || l.complianceStatus === "verified"
  );

  const getWinner = (listingId: string) =>
    bids.find(b => b.listingId === listingId && b.status === "accepted");

  const DOCS = [
    { key: "form6Url", label: "Form 6", icon: "description" },
    { key: "weightSlipEmptyUrl", label: "Weight Slip (Empty)", icon: "scale" },
    { key: "weightSlipLoadedUrl", label: "Weight Slip (Loaded)", icon: "scale" },
    { key: "recyclingCertUrl", label: "Recycling Certificate", icon: "recycling" },
    { key: "disposalCertUrl", label: "Disposal Certificate", icon: "delete_forever" },
  ] as const;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div>
        <h2 className="text-3xl font-headline font-extrabold tracking-tight text-[color:var(--color-on-surface)]">Compliance Verification</h2>
        <p className="text-[color:var(--color-on-surface-variant)] mt-1">Review vendor compliance documents and certify completed e-waste disposal.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Docs Submitted", value: complianceListings.filter(l => l.complianceStatus === "documents_uploaded").length, color: "text-blue-600 bg-blue-50", icon: "upload_file" },
          { label: "Verified", value: complianceListings.filter(l => l.complianceStatus === "verified").length, color: "text-primary bg-primary/10", icon: "verified" },
          { label: "Total Processed", value: complianceListings.length, color: "text-purple-600 bg-purple-50", icon: "shield" },
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
            const allDocsPresent = DOCS.every(d => !!listing[d.key]);

            return (
              <div key={listing.id} className={`card p-0 overflow-hidden border-2 ${isVerified ? "border-emerald-200 dark:border-emerald-900/50" : "border-slate-100 dark:border-slate-800"}`}>
                <div className={`p-5 border-b ${isVerified ? "bg-emerald-50/10 border-emerald-100 dark:border-emerald-900/20" : "bg-transparent border-slate-100 dark:border-slate-800"}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-black text-slate-400 dark:text-slate-500">{listing.id}</span>
                        <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase ${isVerified ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"}`}>
                          {isVerified ? "Verified" : "Pending Verification"}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white">{listing.title}</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 font-medium">
                        {listing.location} · <span className="text-slate-400 dark:text-slate-500">Vendor:</span> <span className="text-slate-800 dark:text-slate-100">{winner?.vendorName || "—"}</span> · <span className="text-slate-400 dark:text-slate-500">Client:</span> <span className="text-slate-800 dark:text-slate-100">{client?.name || listing.userName}</span>
                      </p>
                    </div>
                    {!isVerified && allDocsPresent && (
                      <button
                        onClick={() => setConfirmId(listing.id)}
                        className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-black uppercase hover:bg-primary/90 shrink-0"
                      >
                        Verify & Complete
                      </button>
                    )}
                    {isVerified && (
                      <span className="material-symbols-outlined text-2xl text-emerald-600 shrink-0">verified</span>
                    )}
                  </div>
                </div>

                <div className="p-5">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {DOCS.map(doc => {
                      const url = listing[doc.key];
                      return (
                        <div key={doc.key} className={`p-3 rounded-xl border text-center transition-all ${url ? "border-emerald-500/30 bg-emerald-500/10" : "border-dashed border-slate-700 bg-slate-900/50"}`}>
                          <span className={`material-symbols-outlined text-xl block mb-1 ${url ? "text-emerald-400" : "text-slate-500"}`}>{doc.icon}</span>
                          <p className={`text-[10px] font-black uppercase leading-tight !text-white`}>{doc.label}</p>
                          {url ? (
                            <a href={url} download className="text-[10px] text-emerald-400 font-bold hover:underline block mt-1">Download</a>
                          ) : (
                            <p className="text-[10px] text-slate-500 mt-1">Not uploaded</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {listing.pickupScheduledDate && (
                    <p className="text-xs text-slate-500 mt-3">
                      <span className="font-bold">Pickup date:</span> {new Date(listing.pickupScheduledDate).toLocaleDateString("en-IN")}
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
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-2xl text-emerald-600">verified</span>
            </div>
            <h3 className="text-xl font-headline font-extrabold text-center text-slate-900 dark:text-white">Verify Compliance?</h3>
            <p className="text-sm text-slate-500 text-center">This will mark the listing as fully completed and allow the client to download all compliance documents.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmId(null)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:border-slate-700">Cancel</button>
              <button onClick={() => { verifyCompliance(confirmId); setConfirmId(null); }}
                className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90">
                Confirm & Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
