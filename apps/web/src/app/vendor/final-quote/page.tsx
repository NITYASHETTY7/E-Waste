"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";

export default function VendorFinalQuote() {
  const { listings, bids, currentUser, submitFinalQuote } = useApp();
  const [uploadModal, setUploadModal] = useState<{ open: boolean; listingId: string | null }>({ open: false, listingId: null });
  const [productQuoteFile, setProductQuoteFile] = useState<File | null>(null);
  const [letterheadFile, setLetterheadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Listings where this vendor won (accepted bid)
  const wonListings = listings.filter(l => {
    const winBid = bids.find(b => b.listingId === l.id && b.vendorId === currentUser?.id && b.status === "accepted");
    return !!winBid;
  });

  const getWinBid = (listingId: string) =>
    bids.find(b => b.listingId === listingId && b.vendorId === currentUser?.id && b.status === "accepted");

  const quoteStatusMeta = (status?: string) => {
    if (status === "approved") return { color: "bg-emerald-100 text-emerald-700", label: "Approved by Client" };
    if (status === "rejected") return { color: "bg-red-100 text-red-700", label: "Rejected" };
    if (status === "submitted") return { color: "bg-blue-100 text-blue-700", label: "Submitted — Awaiting Approval" };
    if (status === "client_reviewing") return { color: "bg-purple-100 text-purple-700", label: "Client Reviewing" };
    return { color: "bg-amber-100 text-amber-700", label: "Action Required" };
  };

  const handleFileRead = (file: File): Promise<string> =>
    new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });

  const handleUpload = async () => {
    if (!uploadModal.listingId || !productQuoteFile || !letterheadFile) return;
    setUploading(true);
    const [productUrl, letterheadUrl] = await Promise.all([
      handleFileRead(productQuoteFile),
      handleFileRead(letterheadFile),
    ]);
    submitFinalQuote(uploadModal.listingId, productUrl, letterheadUrl);
    setUploadModal({ open: false, listingId: null });
    setProductQuoteFile(null);
    setLetterheadFile(null);
    setUploading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div>
        <h2 className="text-3xl font-headline font-extrabold tracking-tight text-[color:var(--color-on-surface)]">Final Quote Submission</h2>
        <p className="text-[color:var(--color-on-surface-variant)] mt-1">Upload your product-wise quote and letterhead for won auctions.</p>
      </div>

      {wonListings.length === 0 ? (
        <div className="card p-20 text-center border-2 border-dashed border-slate-200">
          <span className="material-symbols-outlined text-6xl text-slate-300 mb-4 block">upload_file</span>
          <h3 className="text-xl font-bold text-slate-900">No Completed Auctions</h3>
          <p className="text-slate-500 mt-2">Final quote submissions appear here once you win an auction.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {wonListings.map(listing => {
            const winBid = getWinBid(listing.id);
            const meta = quoteStatusMeta(listing.finalQuoteStatus);

            return (
              <div key={listing.id} className={`card p-0 overflow-hidden border-2 ${listing.finalQuoteStatus === "approved" ? "border-emerald-200" : listing.finalQuoteStatus === "rejected" ? "border-red-200" : "border-slate-100"}`}>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-xs font-black text-slate-400">{listing.id}</span>
                        <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase ${meta.color}`}>{meta.label}</span>
                      </div>
                      <h3 className="font-bold text-slate-900">{listing.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{listing.location} · {listing.weight} KG</p>

                      <div className="mt-3 grid grid-cols-3 gap-3">
                        <div className="bg-primary/5 rounded-xl p-3">
                          <p className="text-[9px] font-black text-slate-400 uppercase">Winning Bid</p>
                          <p className="text-lg font-black text-primary">₹{winBid?.amount.toLocaleString()}</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3">
                          <p className="text-[9px] font-black text-slate-400 uppercase">Commission (5%)</p>
                          <p className="text-lg font-black text-slate-700">₹{Math.round((winBid?.amount || 0) * 0.05).toLocaleString()}</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3">
                          <p className="text-[9px] font-black text-slate-400 uppercase">Net to Client</p>
                          <p className="text-lg font-black text-slate-700">₹{Math.round((winBid?.amount || 0) * 0.95).toLocaleString()}</p>
                        </div>
                      </div>

                      {listing.finalQuoteStatus === "rejected" && listing.finalQuoteRemarks && (
                        <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-100">
                          <p className="text-xs font-bold text-red-700">Rejection Reason:</p>
                          <p className="text-xs text-red-600 mt-0.5">{listing.finalQuoteRemarks}</p>
                        </div>
                      )}

                      {(listing.finalQuoteStatus === "submitted" || listing.finalQuoteStatus === "approved") && (
                        <div className="mt-3 p-3 bg-slate-50 rounded-xl">
                          <p className="text-xs font-bold text-slate-600 mb-2">Uploaded Documents</p>
                          <div className="flex gap-3">
                            {listing.finalQuoteProductUrl && (
                              <a href={listing.finalQuoteProductUrl} download className="flex items-center gap-1 text-xs text-primary hover:underline">
                                <span className="material-symbols-outlined text-sm">download</span>Product Quote
                              </a>
                            )}
                            {listing.finalQuoteLetterheadUrl && (
                              <a href={listing.finalQuoteLetterheadUrl} download className="flex items-center gap-1 text-xs text-primary hover:underline">
                                <span className="material-symbols-outlined text-sm">download</span>Letterhead
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="shrink-0">
                      {(!listing.finalQuoteStatus || listing.finalQuoteStatus === "pending" || listing.finalQuoteStatus === "rejected") && (
                        <button
                          onClick={() => setUploadModal({ open: true, listingId: listing.id })}
                          className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-black uppercase hover:bg-primary/90"
                        >
                          {listing.finalQuoteStatus === "rejected" ? "Resubmit" : "Upload Quote"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload modal */}
      {uploadModal.open && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-5">
            <h3 className="text-xl font-headline font-extrabold text-slate-900">Upload Final Quote</h3>

            <div className="space-y-4">
              <div>
                <label className="label">Product-wise Quote (PDF / Excel)</label>
                <div className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:border-primary transition-colors ${productQuoteFile ? "border-emerald-400 bg-emerald-50" : "border-slate-200"}`}
                  onClick={() => document.getElementById("product-quote-input")?.click()}>
                  <input id="product-quote-input" type="file" accept=".pdf,.xlsx,.xls" className="hidden"
                    onChange={e => setProductQuoteFile(e.target.files?.[0] || null)} />
                  {productQuoteFile ? (
                    <p className="text-sm font-bold text-emerald-700">{productQuoteFile.name}</p>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-3xl text-slate-300 block mb-2">upload_file</span>
                      <p className="text-sm text-slate-500">Click to upload product-wise quote</p>
                      <p className="text-xs text-slate-400 mt-1">PDF or Excel format</p>
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="label">Letterhead Quotation (PDF)</label>
                <div className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:border-primary transition-colors ${letterheadFile ? "border-emerald-400 bg-emerald-50" : "border-slate-200"}`}
                  onClick={() => document.getElementById("letterhead-input")?.click()}>
                  <input id="letterhead-input" type="file" accept=".pdf" className="hidden"
                    onChange={e => setLetterheadFile(e.target.files?.[0] || null)} />
                  {letterheadFile ? (
                    <p className="text-sm font-bold text-emerald-700">{letterheadFile.name}</p>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-3xl text-slate-300 block mb-2">description</span>
                      <p className="text-sm text-slate-500">Click to upload letterhead quotation</p>
                      <p className="text-xs text-slate-400 mt-1">PDF format</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setUploadModal({ open: false, listingId: null })}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
              <button
                onClick={handleUpload}
                disabled={!productQuoteFile || !letterheadFile || uploading}
                className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Submit Quote"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
