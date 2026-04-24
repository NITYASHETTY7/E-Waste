"use client";

import { useApp } from "@/context/AppContext";

export default function AdminPayments() {
  const { listings, bids, users, confirmPayment } = useApp();

  // Listings with final quote approved (payment due or proof uploaded)
  const paymentListings = listings.filter(l =>
    l.finalQuoteStatus === "approved" || l.paymentStatus
  );

  const getWinBid = (listingId: string) =>
    bids.find(b => b.listingId === listingId && b.status === "accepted");

  const statusMeta = (status?: string) => {
    if (status === "confirmed") return { color: "bg-emerald-100 text-emerald-700", label: "Confirmed" };
    if (status === "proof_uploaded") return { color: "bg-blue-100 text-blue-700", label: "Proof Uploaded" };
    return { color: "bg-amber-100 text-amber-700", label: "Awaiting Payment" };
  };

  const stats = {
    total: paymentListings.length,
    pending: paymentListings.filter(l => !l.paymentStatus || l.paymentStatus === "pending").length,
    proofUploaded: paymentListings.filter(l => l.paymentStatus === "proof_uploaded").length,
    confirmed: paymentListings.filter(l => l.paymentStatus === "confirmed").length,
    totalValue: bids.filter(b => {
      const listing = paymentListings.find(l => l.id === b.listingId);
      return listing && b.status === "accepted" && listing.paymentStatus === "confirmed";
    }).reduce((s, b) => s + b.amount, 0),
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-3xl font-headline font-extrabold tracking-tight text-[color:var(--color-on-surface)]">Payment Management</h2>
        <p className="text-[color:var(--color-on-surface-variant)] mt-1">Monitor vendor payment submissions and confirm settlements.</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Deals", value: stats.total, icon: "payments", color: "text-blue-600 bg-blue-50" },
          { label: "Awaiting Payment", value: stats.pending, icon: "hourglass_empty", color: "text-amber-600 bg-amber-50" },
          { label: "Proof Submitted", value: stats.proofUploaded, icon: "upload_file", color: "text-purple-600 bg-purple-50" },
          { label: "Confirmed", value: stats.confirmed, icon: "verified", color: "text-primary bg-primary/10" },
        ].map(s => (
          <div key={s.label} className="card p-5 border border-slate-100">
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

      {paymentListings.length === 0 ? (
        <div className="card p-16 text-center border-2 border-dashed border-slate-200">
          <span className="material-symbols-outlined text-5xl text-slate-300 block mb-3">payments</span>
          <p className="font-bold text-slate-600">No payments to review yet</p>
        </div>
      ) : (
        <div className="card overflow-hidden border border-slate-100">
          <div className="divide-y divide-slate-100">
            {paymentListings.map(listing => {
              const win = getWinBid(listing.id);
              const meta = statusMeta(listing.paymentStatus);
              const client = users.find(u => u.id === listing.userId);
              const commission = Math.round((win?.amount || 0) * 0.05);

              return (
                <div key={listing.id} className="p-5 flex items-start justify-between gap-4 hover:bg-slate-50/50">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-black text-slate-400">{listing.id}</span>
                      <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase ${meta.color}`}>{meta.label}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 truncate">{listing.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Client: {client?.name || listing.userName} · Vendor: {win?.vendorName || "—"}</p>

                    <div className="flex gap-4 mt-2">
                      <span className="text-xs text-slate-500">Bid: <span className="font-bold text-primary">₹{win?.amount.toLocaleString()}</span></span>
                      <span className="text-xs text-slate-500">Commission: <span className="font-bold">₹{commission.toLocaleString()}</span></span>
                    </div>

                    {listing.paymentStatus === "proof_uploaded" && (
                      <div className="mt-2 flex items-center gap-3">
                        <p className="text-xs text-slate-500">UTR: <span className="font-bold">{listing.paymentUTR || "—"}</span></p>
                        {listing.paymentProofUrl && (
                          <a href={listing.paymentProofUrl} download className="text-xs text-primary hover:underline flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">download</span>View Proof
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="shrink-0">
                    {listing.paymentStatus === "proof_uploaded" && (
                      <button
                        onClick={() => confirmPayment(listing.id)}
                        className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-black uppercase hover:bg-primary/90"
                      >
                        Confirm Payment
                      </button>
                    )}
                    {listing.paymentStatus === "confirmed" && (
                      <span className="material-symbols-outlined text-2xl text-emerald-600">verified</span>
                    )}
                    {(!listing.paymentStatus || listing.paymentStatus === "pending") && (
                      <span className="text-xs text-slate-400 font-bold">Awaiting vendor</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
