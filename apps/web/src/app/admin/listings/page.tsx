"use client";

import { useState, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { useSearchParams } from "next/navigation";
import DecisionModal from "@/components/admin/DecisionModal";
import Link from "next/link";

export default function AdminListings() {
  const { listings, bids, updateListingStatus, uploadProcessedSheet } = useApp();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed" | "pending" | "verified" | "live">("all");

  const [decisionModal, setDecisionModal] = useState<{ isOpen: boolean; listingId: string | null }>({ isOpen: false, listingId: null });
  const [sheetModal, setSheetModal] = useState<{ isOpen: boolean; listingId: string | null }>({ isOpen: false, listingId: null });
  const [sheetFile, setSheetFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchParams?.get("live") === "1") setFilter("live");
  }, [searchParams]);

  const liveListing = listings.filter(l => l.auctionPhase === "live");

  const filtered = listings
    .filter(l => {
      if (filter === "live") return l.auctionPhase === "live";
      return filter === "all" || l.status === filter;
    })
    .filter(l => l.title.toLowerCase().includes(search.toLowerCase()) || l.location.toLowerCase().includes(search.toLowerCase()));

  const stats = {
    total: listings.length,
    active: listings.filter(l => l.status === "active").length,
    completed: listings.filter(l => l.status === "completed").length,
    pending: listings.filter(l => l.status === "pending").length,
    live: liveListing.length,
  };

  const handleSheetUpload = async () => {
    if (!sheetModal.listingId || !sheetFile) return;
    setUploading(true);
    try {
      await uploadProcessedSheet(sheetModal.listingId, sheetFile);
    } finally {
      setSheetModal({ isOpen: false, listingId: null });
      setSheetFile(null);
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-headline font-extrabold tracking-tight text-[color:var(--color-on-surface)]">Listing Control</h2>
          <p className="text-[color:var(--color-on-surface-variant)] mt-1">Monitor and manage all active e-waste listings across the platform.</p>
        </div>
        <div className="relative w-64">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input placeholder="Search listings..." className="input-base pl-10 h-11 text-sm"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total", value: stats.total, color: "bg-[color:var(--color-secondary-container)]", textColor: "text-[color:var(--color-primary)]", icon: "inventory_2" },
          { label: "Active", value: stats.active, color: "bg-emerald-50", textColor: "text-emerald-700", icon: "check_circle" },
          { label: "Live Now", value: stats.live, color: "bg-red-50", textColor: "text-red-700", icon: "sensors" },
          { label: "Completed", value: stats.completed, color: "bg-blue-50", textColor: "text-blue-700", icon: "task_alt" },
          { label: "Pending", value: stats.pending, color: "bg-amber-50", textColor: "text-amber-700", icon: "pending" },
        ].map(s => (
          <div key={s.label} className="card p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${s.color} flex items-center justify-center shrink-0`}>
              <span className={`material-symbols-outlined text-xl ${s.textColor}`}>{s.icon}</span>
            </div>
            <div>
              <p className="text-2xl font-headline font-extrabold text-[color:var(--color-on-surface)]">{s.value}</p>
              <p className="text-xs font-bold text-[color:var(--color-on-surface-variant)] uppercase tracking-widest">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-1 p-1 bg-[color:var(--color-surface-container-low)] rounded-xl w-fit">
        {(["all", "live", "active", "completed", "pending"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ${
              filter === f ? "bg-white shadow-sm text-[color:var(--color-on-surface)]" : "text-[color:var(--color-on-surface-variant)]"
            }`}>
            {f === "live" && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
            {f} {f === "live" && `(${stats.live})`}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr className="bg-[color:var(--color-inverse-surface)]">
              {["Listing", "Posted By", "Category", "Weight", "Bids", "Status", "Actions"].map(h => (
                <th key={h} className="text-white/70 text-[10px] font-bold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(listing => {
              const listingBids = bids.filter(b => b.listingId === listing.id);
              const topBid = listingBids.sort((a, b) => b.amount - a.amount)[0];
              const needsSheet = listing.status === "pending" && listing.requirementStatus !== "client_review" && listing.requirementStatus !== "finalized";
              const awaitingClientApproval = listing.requirementStatus === "client_review";

              return (
                <tr key={listing.id} className="hover:bg-slate-50 transition-colors">
                  <td>
                    <p className="font-bold text-sm text-[color:var(--color-on-surface)] max-w-[200px] truncate">{listing.title}</p>
                    <p className="text-xs text-[color:var(--color-on-surface-variant)]">{listing.location}</p>
                  </td>
                  <td className="text-sm text-[color:var(--color-on-surface-variant)]">{listing.userName || "—"}</td>
                  <td>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 bg-[color:var(--color-secondary-container)] text-[color:var(--color-primary)] rounded-full">{listing.category}</span>
                  </td>
                  <td className="font-mono text-sm">{listing.weight} KG</td>
                  <td>
                    <div>
                      <p className="text-sm font-bold text-[color:var(--color-on-surface)]">{listingBids.length}</p>
                      {topBid && <p className="text-[10px] text-[color:var(--color-primary)] font-bold">Top: ₹{topBid.amount.toLocaleString()}</p>}
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-col gap-1">
                      <span className={`pill ${listing.status === "active" ? "pill-success" : listing.status === "completed" ? "bg-blue-100 text-blue-700" : "pill-warning"}`}>
                        {listing.status}
                      </span>
                      {awaitingClientApproval && (
                        <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">Awaiting Client</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="flex gap-2 flex-wrap">
                      {listing.auctionPhase === "live" && (
                        <Link href={`/admin/auctions/${listing.id}/live`}
                          className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-600 hover:text-white transition-colors border border-purple-200" title="Observe Live Auction">
                          <span className="material-symbols-outlined text-sm">visibility</span>
                          Watch
                        </Link>
                      )}

                      {/* Step 1 — Admin uploads processed/cleaned material sheet */}
                      {needsSheet && (
                        <button
                          onClick={() => { setSheetModal({ isOpen: true, listingId: listing.id }); setSheetFile(null); }}
                          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-600 hover:text-white transition-all border border-blue-200"
                          title="Upload processed/cleaned material list sheet"
                        >
                          <span className="material-symbols-outlined text-sm">upload_file</span>
                          Upload Sheet
                        </button>
                      )}

                      {/* Step 3 — Admin final approval (after client approves sheet) */}
                      {listing.status === "pending" && listing.requirementStatus === "finalized" && (
                        <button
                          onClick={() => setDecisionModal({ isOpen: true, listingId: listing.id })}
                          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-600 hover:text-white transition-all border border-emerald-200"
                          title="Review & Approve — triggers vendor invitation emails"
                        >
                          <span className="material-symbols-outlined text-sm">fact_check</span>
                          Review
                        </button>
                      )}

                      {/* Fallback Review for listings without sheet flow */}
                      {listing.status === "pending" && !listing.requirementStatus && (
                        <button
                          onClick={() => setDecisionModal({ isOpen: true, listingId: listing.id })}
                          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-600 hover:text-white transition-all border border-emerald-200"
                          title="Review & Approve — triggers vendor invitation emails"
                        >
                          <span className="material-symbols-outlined text-sm">fact_check</span>
                          Review
                        </button>
                      )}

                      {(listing.status !== "cancelled" && listing.status !== "rejected") && (
                        <button onClick={() => updateListingStatus(listing.id, "cancelled")}
                          className="w-8 h-8 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all dark:bg-slate-950" title="Cancel Listing">
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="text-center py-12 text-slate-400 italic">No listings found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Upload Processed Sheet Modal */}
      {sheetModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
            <div>
              <h3 className="text-xl font-headline font-extrabold text-slate-900 dark:text-white">Upload Processed Sheet</h3>
              <p className="text-sm text-slate-500 mt-1">Upload the cleaned & standardised material list. Client will review and set target price.</p>
            </div>

            <div
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                sheetFile ? "border-emerald-400 bg-emerald-50" : "border-slate-200 hover:border-primary hover:bg-slate-50"
              }`}
            >
              <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv,.pdf" className="hidden"
                onChange={e => setSheetFile(e.target.files?.[0] || null)} />
              {sheetFile ? (
                <>
                  <span className="material-symbols-outlined text-3xl text-emerald-600 block mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  <p className="font-bold text-emerald-700">{sheetFile.name}</p>
                  <p className="text-xs text-slate-400 mt-1">{(sheetFile.size / 1024).toFixed(0)} KB</p>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-4xl text-slate-300 block mb-2">upload_file</span>
                  <p className="text-sm font-bold text-slate-500">Click to upload Excel / CSV / PDF</p>
                  <p className="text-xs text-slate-400 mt-1">Processed material list sheet</p>
                </>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setSheetModal({ isOpen: false, listingId: null })}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:border-slate-700">
                Cancel
              </button>
              <button
                onClick={handleSheetUpload}
                disabled={!sheetFile || uploading}
                className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {uploading
                  ? <><span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>Uploading...</>
                  : <><span className="material-symbols-outlined text-sm">cloud_upload</span>Upload & Notify Client</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decision Modal — Approving sends sealed bid invitation emails to client-selected vendors */}
      {decisionModal.listingId && (
        <DecisionModal
          isOpen={decisionModal.isOpen}
          onClose={() => setDecisionModal({ isOpen: false, listingId: null })}
          title="Review Listing"
          itemDetails={[
            { label: "Listing", value: listings.find(l => l.id === decisionModal.listingId)?.title || "" },
            { label: "Weight", value: `${listings.find(l => l.id === decisionModal.listingId)?.weight || 0} KG` },
            {
              label: "Selected Vendors",
              value: `${listings.find(l => l.id === decisionModal.listingId)?.invitedVendorIds?.length ?? 0} vendor(s) — invitation emails sent automatically on approval`
            },
          ]}
          onConfirm={(status, reason) => {
            if (decisionModal.listingId) {
              updateListingStatus(decisionModal.listingId, status, reason);
              setDecisionModal({ isOpen: false, listingId: null });
            }
          }}
          actions={[
            { label: "Approve — Send Sealed Bid Invitations", status: "active", color: "#1E8E3E" },
            { label: "Put on Hold", status: "on-hold", color: "#FFC107", requireReason: true },
            { label: "Reject Listing", status: "rejected", color: "#ef4444", requireReason: true }
          ]}
        />
      )}
    </div>
  );
}
