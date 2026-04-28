"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";

export default function VendorPayments() {
  const { listings, bids, users, currentUser, submitPaymentProof } = useApp();
  const [proofModal, setProofModal] = useState<{ open: boolean; listingId: string | null }>({ open: false, listingId: null });
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [utr, setUtr] = useState("");
  const [uploading, setUploading] = useState(false);

  // Listings where this vendor has an accepted bid and final quote is approved
  const paymentListings = listings.filter(l => {
    const win = bids.find(b => b.listingId === l.id && b.vendorId === currentUser?.id && b.status === "accepted");
    return !!win && l.finalQuoteStatus === "approved";
  });

  const getWinBid = (listingId: string) =>
    bids.find(b => b.listingId === listingId && b.vendorId === currentUser?.id && b.status === "accepted");

  const getClientBankDetails = (listing: (typeof listings)[number]) => {
    const client = users.find(u => u.id === listing.userId);
    return client?.bankDetails;
  };

  const handleFileRead = (file: File): Promise<string> =>
    new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });

  const handleUpload = async () => {
    if (!proofModal.listingId || !proofFile || !utr) return;
    setUploading(true);
    const url = await handleFileRead(proofFile);
    submitPaymentProof(proofModal.listingId, url, utr);
    setProofModal({ open: false, listingId: null });
    setProofFile(null);
    setUtr("");
    setUploading(false);
  };

  const statusMeta = (status?: string) => {
    if (status === "confirmed") return { color: "bg-emerald-100 text-emerald-700", label: "Payment Confirmed" };
    if (status === "proof_uploaded") return { color: "bg-blue-100 text-blue-700", label: "Proof Uploaded" };
    return { color: "bg-amber-100 text-amber-700", label: "Payment Due" };
  };

  // WeConnect bank details (mock)
  const WECONNECT_BANK = {
    name: "WeConnect E-Waste Pvt Ltd",
    bank: "ICICI Bank",
    account: "001401000876",
    ifsc: "ICIC0000014",
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div>
        <h2 className="text-3xl font-headline font-extrabold tracking-tight text-[color:var(--color-on-surface)]">Payments</h2>
        <p className="text-[color:var(--color-on-surface-variant)] mt-1">View payment details and upload proof for completed deals.</p>
      </div>

      {paymentListings.length === 0 ? (
        <div className="card p-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
          <span className="material-symbols-outlined text-6xl text-slate-300 mb-4 block">payments</span>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">No Pending Payments</h3>
          <p className="text-slate-500 mt-2">Payment details appear here once a client approves your final quote.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {paymentListings.map(listing => {
            const winBid = getWinBid(listing.id);
            const meta = statusMeta(listing.paymentStatus);
            const clientBank = getClientBankDetails(listing);
            const commission = Math.round((winBid?.amount || 0) * 0.05);
            const clientAmount = (winBid?.amount || 0) - commission;

            return (
              <div key={listing.id} className={`card p-0 overflow-hidden border-2 ${listing.paymentStatus === "confirmed" ? "border-emerald-200" : "border-slate-100"}`}>
                <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-start justify-between gap-4 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-black text-slate-400">{listing.id}</span>
                      <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase ${meta.color}`}>{meta.label}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{listing.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{listing.location} · {listing.weight} KG</p>
                  </div>
                  {!listing.paymentStatus || listing.paymentStatus === "pending" ? (
                    <button
                      onClick={() => setProofModal({ open: true, listingId: listing.id })}
                      className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-black uppercase hover:bg-primary/90 shrink-0"
                    >
                      Upload Proof
                    </button>
                  ) : listing.paymentStatus === "proof_uploaded" ? (
                    <span className="px-4 py-2 rounded-xl bg-blue-100 text-blue-700 text-xs font-black uppercase">Under Review</span>
                  ) : (
                    <span className="material-symbols-outlined text-2xl text-emerald-600 shrink-0">verified</span>
                  )}
                </div>

                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Payment breakdown */}
                  <div className="space-y-3">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Payment Breakdown</p>
                    <div className="space-y-2">
                      {[
                        { label: "Total Bid Amount", value: winBid?.amount || 0, color: "text-primary" },
                        { label: "WeConnect Commission (5%)", value: commission, color: "text-red-600", prefix: "−" },
                        { label: "Amount to Client", value: clientAmount, color: "text-slate-900", bold: true },
                      ].map(row => (
                        <div key={row.label} className="flex justify-between items-center py-1.5 border-b border-slate-100 last:border-0 dark:border-slate-800">
                          <span className="text-sm text-slate-600 dark:text-slate-400">{row.label}</span>
                          <span className={`font-black ${row.color}`}>{row.prefix || ""}₹{row.value.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bank account details */}
                  <div className="space-y-3">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Transfer To</p>
                    <div className="space-y-2">
                      {/* Client account */}
                      <div className="p-3 bg-primary/5 rounded-xl border border-primary/10">
                        <p className="text-[9px] font-black text-primary uppercase mb-2">Client Account (Main Amount)</p>
                        {clientBank ? (
                          <div className="space-y-1 text-xs">
                            <p><span className="font-bold text-slate-600 dark:text-slate-400">Name:</span> {clientBank.accountHolderName}</p>
                            <p><span className="font-bold text-slate-600 dark:text-slate-400">Bank:</span> {clientBank.bankName}</p>
                            <p><span className="font-bold text-slate-600 dark:text-slate-400">A/C:</span> {clientBank.accountNumber}</p>
                            <p><span className="font-bold text-slate-600 dark:text-slate-400">IFSC:</span> {clientBank.ifscCode}</p>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400">Bank details not on file — contact admin</p>
                        )}
                        <div className="mt-2 pt-2 border-t border-primary/10">
                          <p className="text-xs font-black text-primary">Amount: ₹{clientAmount.toLocaleString()}</p>
                        </div>
                      </div>

                      {/* WeConnect commission */}
                      <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                        <p className="text-[9px] font-black text-blue-700 uppercase mb-2">WeConnect (Commission)</p>
                        <div className="space-y-1 text-xs">
                          <p><span className="font-bold text-slate-600 dark:text-slate-400">Name:</span> {WECONNECT_BANK.name}</p>
                          <p><span className="font-bold text-slate-600 dark:text-slate-400">Bank:</span> {WECONNECT_BANK.bank}</p>
                          <p><span className="font-bold text-slate-600 dark:text-slate-400">A/C:</span> {WECONNECT_BANK.account}</p>
                          <p><span className="font-bold text-slate-600 dark:text-slate-400">IFSC:</span> {WECONNECT_BANK.ifsc}</p>
                        </div>
                        <div className="mt-2 pt-2 border-t border-blue-100">
                          <p className="text-xs font-black text-blue-700">Amount: ₹{commission.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {listing.paymentStatus === "proof_uploaded" && (
                  <div className="px-5 pb-4">
                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-3">
                      <span className="material-symbols-outlined text-blue-600">upload_file</span>
                      <div>
                        <p className="text-xs font-bold text-blue-700">Proof Submitted</p>
                        <p className="text-xs text-slate-500">UTR: {listing.paymentUTR} · Submitted: {listing.paymentSubmittedAt ? new Date(listing.paymentSubmittedAt).toLocaleDateString("en-IN") : "—"}</p>
                      </div>
                      {listing.paymentProofUrl && (
                        <a href={listing.paymentProofUrl} download className="ml-auto text-xs text-primary hover:underline flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">download</span>View
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Upload proof modal */}
      {proofModal.open && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
            <h3 className="text-xl font-headline font-extrabold text-slate-900 dark:text-white">Upload Payment Proof</h3>

            <div>
              <label className="label">UTR / Transaction Reference Number</label>
              <input className="input-base" placeholder="Enter UTR number" value={utr} onChange={e => setUtr(e.target.value)} />
            </div>

            <div>
              <label className="label">Payment Screenshot / Receipt</label>
              <div className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:border-primary transition-colors ${proofFile ? "border-emerald-400 bg-emerald-50" : "border-slate-200"}`}
                onClick={() => document.getElementById("proof-file-input")?.click()}>
                <input id="proof-file-input" type="file" accept="image/*,.pdf" className="hidden"
                  onChange={e => setProofFile(e.target.files?.[0] || null)} />
                {proofFile ? (
                  <p className="text-sm font-bold text-emerald-700">{proofFile.name}</p>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-3xl text-slate-300 block mb-2">receipt</span>
                    <p className="text-sm text-slate-500">Click to upload screenshot or PDF</p>
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setProofModal({ open: false, listingId: null })}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:border-slate-700">Cancel</button>
              <button onClick={handleUpload} disabled={!proofFile || !utr || uploading}
                className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 disabled:opacity-50">
                {uploading ? "Uploading..." : "Submit Proof"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
