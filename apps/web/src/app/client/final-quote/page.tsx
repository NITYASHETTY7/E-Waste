"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";

export default function ClientFinalQuote() {
  const { listings, bids, currentUser, approveFinalQuote, rejectFinalQuote } = useApp();
  const [rejectModal, setRejectModal] = useState<{ open: boolean; listingId: string | null }>({
    open: false, listingId: null,
  });
  const [rejectRemarks, setRejectRemarks] = useState("");

  // Client listings with final quotes (not pending/undefined)
  const quoteListings = listings.filter(l =>
    l.userId === currentUser?.id &&
    l.finalQuoteStatus &&
    l.finalQuoteStatus !== "pending"
  );

  const getWinBid = (listingId: string) =>
    bids.find(b => b.listingId === listingId && b.status === "accepted") ||
    bids.filter(b => b.listingId === listingId).sort((a, b) => b.amount - a.amount)[0];

  const statusMeta = (status?: string) => {
    if (status === "approved") return { color: "bg-emerald-100 text-emerald-700 border-emerald-200", label: "Deal Approved", icon: "handshake" };
    if (status === "rejected") return { color: "bg-red-100 text-red-700 border-red-200", label: "Rejected", icon: "cancel" };
    if (status === "submitted") return { color: "bg-blue-100 text-blue-700 border-blue-200", label: "Awaiting Your Approval", icon: "pending_actions" };
    if (status === "client_reviewing") return { color: "bg-purple-100 text-purple-700 border-purple-200", label: "Under Review", icon: "rate_review" };
    return { color: "bg-amber-100 text-amber-700 border-amber-200", label: "Awaiting Vendor", icon: "hourglass_empty" };
  };

  const handleReject = () => {
    if (!rejectModal.listingId || !rejectRemarks.trim()) return;
    rejectFinalQuote(rejectModal.listingId, rejectRemarks);
    setRejectModal({ open: false, listingId: null });
    setRejectRemarks("");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div>
        <h2 className="text-3xl font-headline font-extrabold tracking-tight text-[color:var(--color-on-surface)]">Final Quote Approval</h2>
        <p className="text-[color:var(--color-on-surface-variant)] mt-1">Review and approve the vendor&apos;s final product-wise quote to close the deal.</p>
      </div>

      {quoteListings.length === 0 ? (
        <div className="card p-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
          <span className="material-symbols-outlined text-6xl text-slate-300 mb-4 block">description</span>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">No Final Quotes Yet</h3>
          <p className="text-slate-500 mt-2">Final quotes appear here after an auction is completed and the vendor submits their itemised quotation.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {quoteListings.map(listing => {
            const winBid = getWinBid(listing.id);
            const meta = statusMeta(listing.finalQuoteStatus);
            const commission = Math.round((winBid?.amount || 0) * 0.05);
            const netAmount = (winBid?.amount || 0) - commission;

            return (
              <div key={listing.id} className={`card p-0 overflow-hidden border-2 ${
                listing.finalQuoteStatus === "approved" ? "border-emerald-200" :
                listing.finalQuoteStatus === "rejected" ? "border-red-200" : "border-blue-100"
              }`}>
                {/* Header */}
                <div className={`p-5 border-b flex items-start justify-between gap-4 ${
                  listing.finalQuoteStatus === "approved" ? "bg-emerald-50/50 border-emerald-100" :
                  listing.finalQuoteStatus === "rejected" ? "bg-red-50/50 border-red-100" : "bg-slate-50/50 border-slate-100"
                }`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-black text-slate-400">{listing.id}</span>
                      <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase inline-flex items-center gap-1 ${meta.color.split(" ").slice(0,2).join(" ")}`}>
                        <span className="material-symbols-outlined text-[10px]">{meta.icon}</span>
                        {meta.label}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{listing.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{listing.location} · {listing.weight} KG · {listing.category}</p>
                  </div>
                  {listing.finalQuoteSubmittedAt && (
                    <p className="text-xs text-slate-400 shrink-0">
                      Submitted {new Date(listing.finalQuoteSubmittedAt).toLocaleDateString("en-IN")}
                    </p>
                  )}
                </div>

                <div className="p-5">
                  {/* Financials */}
                  <div className="grid grid-cols-3 gap-4 mb-5">
                    <div className="bg-primary/5 rounded-xl p-3 text-center">
                      <p className="text-[9px] font-black text-slate-400 uppercase">Winning Bid</p>
                      <p className="text-xl font-black text-primary">₹{winBid?.amount.toLocaleString() || "—"}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{winBid?.vendorName}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 text-center dark:bg-slate-950">
                      <p className="text-[9px] font-black text-slate-400 uppercase">WeConnect Fee (5%)</p>
                      <p className="text-xl font-black text-slate-700 dark:text-slate-300">₹{commission.toLocaleString()}</p>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-3 text-center">
                      <p className="text-[9px] font-black text-slate-400 uppercase">You Receive</p>
                      <p className="text-xl font-black text-emerald-700">₹{netAmount.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Quote documents — only shown when submitted */}
                  {listing.finalQuoteStatus === "submitted" && (
                    <>
                      <div className="flex gap-3 mb-5">
                        {listing.finalQuoteProductUrl && (
                          <a href={listing.finalQuoteProductUrl} download
                            className="flex-1 flex items-center justify-center gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100 text-sm font-bold text-blue-700 hover:bg-blue-100 transition-colors">
                            <span className="material-symbols-outlined text-sm">download</span>
                            Product-wise Quote
                          </a>
                        )}
                        {listing.finalQuoteLetterheadUrl && (
                          <a href={listing.finalQuoteLetterheadUrl} download
                            className="flex-1 flex items-center justify-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors dark:bg-slate-950 dark:text-slate-300 dark:border-slate-800">
                            <span className="material-symbols-outlined text-sm">download</span>
                            Letterhead Quotation
                          </a>
                        )}
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => approveFinalQuote(listing.id)}
                          className="flex-1 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                        >
                          <span className="material-symbols-outlined text-sm">check_circle</span>
                          Approve &amp; Confirm Deal
                        </button>
                        <button
                          onClick={() => setRejectModal({ open: true, listingId: listing.id })}
                          className="px-6 py-3 rounded-xl border border-red-200 text-red-600 font-bold text-sm hover:bg-red-50 transition-colors flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-sm">cancel</span>
                          Reject
                        </button>
                      </div>
                    </>
                  )}

                  {listing.finalQuoteStatus === "approved" && (
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                      <span className="material-symbols-outlined text-emerald-600">check_circle</span>
                      <p className="text-sm font-bold text-emerald-700">Deal approved. Vendor will process payment to your registered bank account.</p>
                    </div>
                  )}

                  {listing.finalQuoteStatus === "rejected" && listing.finalQuoteRemarks && (
                    <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                      <p className="text-xs font-bold text-red-700 mb-1">Rejection Reason:</p>
                      <p className="text-xs text-red-600">{listing.finalQuoteRemarks}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
            <h3 className="text-xl font-headline font-extrabold text-slate-900 dark:text-white">Reject Final Quote</h3>
            <p className="text-sm text-slate-500">Please provide a reason. The vendor will be notified and may resubmit.</p>
            <div>
              <label className="label">Rejection Reason <span className="text-red-500">*</span></label>
              <textarea
                className="input-base min-h-[100px] resize-none"
                placeholder="Describe what needs to be corrected..."
                value={rejectRemarks}
                onChange={e => setRejectRemarks(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setRejectModal({ open: false, listingId: null }); setRejectRemarks(""); }}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:border-slate-700"
              >Cancel</button>
              <button
                onClick={handleReject}
                disabled={!rejectRemarks.trim()}
                className="px-5 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 disabled:opacity-50"
              >Confirm Rejection</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
