"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";

export default function AdminContracts() {
  const { listings, bids, users, approveFinalQuote, rejectFinalQuote } = useApp();
  const [rejectModal, setRejectModal] = useState<{ open: boolean; listingId: string | null }>({ open: false, listingId: null });
  const [rejectRemarks, setRejectRemarks] = useState("");

  // Listings past auction (completed phase) that need final quote handling
  const contractListings = listings.filter(l =>
    l.auctionPhase === "completed" && l.status !== "cancelled"
  );

  const getWinningBid = (listingId: string) => {
    const accepted = bids.find(b => b.listingId === listingId && b.status === "accepted");
    if (accepted) return accepted;
    // If no accepted bid, show highest pending
    const pending = bids.filter(b => b.listingId === listingId);
    return pending.length ? pending.reduce((a, b) => a.amount > b.amount ? a : b) : null;
  };

  const quoteStatusMeta = (status?: string) => {
    if (status === "approved") return { color: "bg-emerald-100 text-emerald-700", label: "Approved" };
    if (status === "rejected") return { color: "bg-red-100 text-red-700", label: "Rejected" };
    if (status === "submitted") return { color: "bg-blue-100 text-blue-700", label: "Quote Submitted" };
    if (status === "client_reviewing") return { color: "bg-purple-100 text-purple-700", label: "Client Reviewing" };
    return { color: "bg-amber-100 text-amber-700", label: "Awaiting Quote" };
  };

  const handleApprove = (listingId: string) => {
    approveFinalQuote(listingId);
  };

  const handleReject = () => {
    if (rejectModal.listingId) {
      rejectFinalQuote(rejectModal.listingId, rejectRemarks);
      setRejectModal({ open: false, listingId: null });
      setRejectRemarks("");
    }
  };

  const stats = {
    total: contractListings.length,
    awaitingQuote: contractListings.filter(l => !l.finalQuoteStatus || l.finalQuoteStatus === "pending").length,
    submitted: contractListings.filter(l => l.finalQuoteStatus === "submitted").length,
    approved: contractListings.filter(l => l.finalQuoteStatus === "approved").length,
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-3xl font-headline font-extrabold tracking-tight text-[color:var(--color-on-surface)]">Contracts & Deal Closing</h2>
        <p className="text-[color:var(--color-on-surface-variant)] mt-1">Review vendor final quotes and close deals with client approval.</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Deals", value: stats.total, icon: "description", color: "text-blue-600 bg-blue-50" },
          { label: "Awaiting Quote", value: stats.awaitingQuote, icon: "hourglass_empty", color: "text-amber-600 bg-amber-50" },
          { label: "Quote Submitted", value: stats.submitted, icon: "upload_file", color: "text-purple-600 bg-purple-50" },
          { label: "Deal Closed", value: stats.approved, icon: "handshake", color: "text-primary bg-primary/10" },
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

      {contractListings.length === 0 ? (
        <div className="card p-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
          <span className="material-symbols-outlined text-5xl text-slate-300 block mb-3">description</span>
          <p className="font-bold text-slate-600 dark:text-slate-400">No completed auctions yet</p>
          <p className="text-sm text-slate-400 mt-1">Deals will appear here once auctions are completed.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {contractListings.map(listing => {
            const winBid = getWinningBid(listing.id);
            const meta = quoteStatusMeta(listing.finalQuoteStatus);
            const clientInfo = users.find(u => u.id === listing.userId);

            return (
              <div key={listing.id} className="card p-0 overflow-hidden border border-slate-100 dark:border-slate-800">
                <div className="p-5 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-black text-slate-400">{listing.id}</span>
                      <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase ${meta.color}`}>{meta.label}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{listing.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{listing.location} · Client: {clientInfo?.name || listing.userName}</p>

                    <div className="mt-3 grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Winning Vendor</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{winBid?.vendorName || "—"}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Winning Bid</p>
                        <p className="text-sm font-bold text-primary">{winBid ? `₹${winBid.amount.toLocaleString()}` : "—"}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Commission (5%)</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{winBid ? `₹${Math.round(winBid.amount * 0.05).toLocaleString()}` : "—"}</p>
                      </div>
                    </div>

                    {listing.finalQuoteStatus === "submitted" && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                        <p className="text-xs font-bold text-blue-700 mb-1">Final Quote Documents</p>
                        <div className="flex gap-3">
                          {listing.finalQuoteProductUrl && (
                            <a href={listing.finalQuoteProductUrl} download
                              className="text-xs text-blue-600 flex items-center gap-1 hover:underline">
                              <span className="material-symbols-outlined text-sm">download</span>Product Quote
                            </a>
                          )}
                          {listing.finalQuoteLetterheadUrl && (
                            <a href={listing.finalQuoteLetterheadUrl} download
                              className="text-xs text-blue-600 flex items-center gap-1 hover:underline">
                              <span className="material-symbols-outlined text-sm">download</span>Letterhead
                            </a>
                          )}
                        </div>
                        {listing.finalQuoteSubmittedAt && (
                          <p className="text-xs text-slate-500 mt-1">Submitted: {new Date(listing.finalQuoteSubmittedAt).toLocaleDateString("en-IN")}</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    {listing.finalQuoteStatus === "submitted" && (
                      <>
                        <button
                          onClick={() => handleApprove(listing.id)}
                          className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-black uppercase hover:bg-primary/90"
                        >
                          Approve Quote
                        </button>
                        <button
                          onClick={() => setRejectModal({ open: true, listingId: listing.id })}
                          className="px-4 py-2 rounded-xl border border-red-200 text-red-600 text-xs font-black uppercase hover:bg-red-50"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {listing.finalQuoteStatus === "approved" && (
                      <span className="px-4 py-2 rounded-xl bg-emerald-100 text-emerald-700 text-xs font-black uppercase text-center">Deal Closed</span>
                    )}
                    {(!listing.finalQuoteStatus || listing.finalQuoteStatus === "pending") && (
                      <span className="px-4 py-2 rounded-xl bg-slate-100 text-slate-500 text-xs font-black uppercase text-center dark:bg-slate-800">Awaiting Vendor</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-xl font-headline font-extrabold text-slate-900 dark:text-white">Reject Final Quote</h3>
            <div>
              <label className="label">Rejection Remarks</label>
              <textarea className="input-base min-h-[80px] resize-none" placeholder="Provide reason for rejection..."
                value={rejectRemarks} onChange={e => setRejectRemarks(e.target.value)} />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setRejectModal({ open: false, listingId: null })} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:border-slate-700">Cancel</button>
              <button onClick={handleReject} className="px-5 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700">Reject Quote</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
