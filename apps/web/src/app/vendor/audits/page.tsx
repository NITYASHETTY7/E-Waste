"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";

export default function VendorAudits() {
  const { auditInvitations, listings, currentUser, respondToAuditInvitation, completeAudit } = useApp();
  const [completionModal, setCompletionModal] = useState<{ open: boolean; auditId: string | null }>({ open: false, auditId: null });
  const [productMatch, setProductMatch] = useState<boolean | null>(null);
  const [remarks, setRemarks] = useState("");

  const myAudits = auditInvitations.filter(a => a.vendorId === currentUser?.id);

  const getListing = (listingId: string) => listings.find(l => l.id === listingId);

  const statusMeta = (status: string) => {
    if (status === "completed") return { color: "bg-emerald-100 text-emerald-700", label: "Completed" };
    if (status === "accepted") return { color: "bg-blue-100 text-blue-700", label: "Accepted" };
    if (status === "declined") return { color: "bg-red-100 text-red-700", label: "Declined" };
    return { color: "bg-amber-100 text-amber-700", label: "Invited" };
  };

  const handleComplete = () => {
    if (!completionModal.auditId || productMatch === null) return;
    completeAudit(completionModal.auditId, productMatch, remarks);
    setCompletionModal({ open: false, auditId: null });
    setProductMatch(null);
    setRemarks("");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div>
        <h2 className="text-3xl font-headline font-extrabold tracking-tight text-[color:var(--color-on-surface)]">Site Audits</h2>
        <p className="text-[color:var(--color-on-surface-variant)] mt-1">Accept audit invitations, visit sites, and submit audit reports.</p>
      </div>

      {myAudits.length === 0 ? (
        <div className="card p-20 text-center border-2 border-dashed border-slate-200">
          <span className="material-symbols-outlined text-6xl text-slate-300 mb-4 block">fact_check</span>
          <h3 className="text-xl font-bold text-slate-900">No Audit Invitations</h3>
          <p className="text-slate-500 mt-2">You'll receive audit invitations when admin selects you for a site visit.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {myAudits.map(audit => {
            const listing = getListing(audit.listingId);
            const meta = statusMeta(audit.status);

            return (
              <div key={audit.id} className={`card p-0 overflow-hidden border-2 ${audit.status === "completed" ? "border-emerald-200" : audit.status === "invited" ? "border-amber-200" : "border-slate-100"}`}>
                <div className="p-5 flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase ${meta.color}`}>{meta.label}</span>
                      <span className="text-xs font-black text-slate-400">{audit.listingId}</span>
                    </div>
                    <h3 className="font-bold text-slate-900">{listing?.title || audit.listingId}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{listing?.location} · {listing?.weight} KG · {listing?.category}</p>

                    {audit.status !== "invited" && (
                      <div className="mt-3 grid grid-cols-3 gap-3">
                        {[
                          { label: "SPOC Name", value: audit.spocName },
                          { label: "SPOC Phone", value: audit.spocPhone },
                          { label: "Site Address", value: audit.siteAddress },
                        ].map(info => info.value && (
                          <div key={info.label} className="bg-slate-50 rounded-xl p-2.5">
                            <p className="text-[9px] font-black text-slate-400 uppercase">{info.label}</p>
                            <p className="text-sm font-bold text-slate-900">{info.value}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {audit.scheduledDate && (
                      <p className="text-xs text-slate-500 mt-2">
                        <span className="font-bold">Scheduled:</span> {new Date(audit.scheduledDate).toLocaleDateString("en-IN", { dateStyle: "long" })}
                      </p>
                    )}

                    {audit.status === "completed" && (
                      <div className="mt-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                        <p className="text-xs font-bold text-emerald-700 mb-1">Audit Report</p>
                        <p className="text-xs text-slate-700">
                          Product match: <span className={`font-bold ${audit.productMatch ? "text-emerald-600" : "text-red-600"}`}>{audit.productMatch ? "Yes ✓" : "No ✗"}</span>
                        </p>
                        {audit.auditRemarks && <p className="text-xs text-slate-600 mt-1 italic">"{audit.auditRemarks}"</p>}
                        <p className="text-xs text-slate-400 mt-1">Completed: {new Date(audit.completedAt!).toLocaleDateString("en-IN")}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    {audit.status === "invited" && (
                      <>
                        <button
                          onClick={() => respondToAuditInvitation(audit.id, "accepted")}
                          className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-black uppercase hover:bg-primary/90"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => respondToAuditInvitation(audit.id, "declined")}
                          className="px-4 py-2 rounded-xl border border-red-200 text-red-600 text-xs font-black uppercase hover:bg-red-50"
                        >
                          Decline
                        </button>
                      </>
                    )}
                    {audit.status === "accepted" && (
                      <button
                        onClick={() => setCompletionModal({ open: true, auditId: audit.id })}
                        className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-black uppercase hover:bg-blue-700"
                      >
                        Submit Report
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Audit completion modal */}
      {completionModal.open && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
            <h3 className="text-xl font-headline font-extrabold text-slate-900">Submit Audit Report</h3>

            <div>
              <label className="label mb-3">Does the product match the listing description?</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setProductMatch(true)}
                  className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm flex items-center justify-center gap-2 transition-all ${productMatch === true ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-600 hover:border-emerald-300"}`}
                >
                  <span className="material-symbols-outlined text-sm">check_circle</span>Yes, matches
                </button>
                <button
                  onClick={() => setProductMatch(false)}
                  className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm flex items-center justify-center gap-2 transition-all ${productMatch === false ? "border-red-500 bg-red-50 text-red-700" : "border-slate-200 text-slate-600 hover:border-red-300"}`}
                >
                  <span className="material-symbols-outlined text-sm">cancel</span>Mismatch found
                </button>
              </div>
            </div>

            <div>
              <label className="label">{productMatch === false ? "Describe Mismatch (Required)" : "Remarks (Optional)"}</label>
              <textarea
                className="input-base min-h-[80px] resize-none"
                placeholder={productMatch === false ? "Describe what differs from the listing..." : "Any additional observations..."}
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setCompletionModal({ open: false, auditId: null })}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
              <button
                onClick={handleComplete}
                disabled={productMatch === null || (productMatch === false && !remarks)}
                className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 disabled:opacity-50"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
