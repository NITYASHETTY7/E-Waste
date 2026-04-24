"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { useSearchParams } from "next/navigation";
import DecisionModal from "@/components/admin/DecisionModal";
import Link from "next/link";

export default function AdminListings() {
  const { listings, bids, updateListingStatus, users, assignVendor } = useApp();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed" | "pending" | "verified" | "live">("all");
  const [decisionModal, setDecisionModal] = useState<{ isOpen: boolean; listingId: string | null }>({ isOpen: false, listingId: null });
  const [assignModal, setAssignModal] = useState<{ isOpen: boolean; listingId: string | null }>({ isOpen: false, listingId: null });

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
                    <span className={`pill ${listing.status === "active" ? "pill-success" : listing.status === "completed" ? "bg-blue-100 text-blue-700" : "pill-warning"}`}>
                      {listing.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      {listing.auctionPhase === "live" && (
                        <Link href={`/admin/auctions/${listing.id}/live`}
                          className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-600 hover:text-white transition-colors border border-purple-200" title="Observe Live Auction">
                          <span className="material-symbols-outlined text-sm">visibility</span>
                          Watch
                        </Link>
                      )}
                      {listing.status === "pending" && (
                        <button onClick={() => setDecisionModal({ isOpen: true, listingId: listing.id })}
                          className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all" title="Review Listing">
                          <span className="material-symbols-outlined text-sm">fact_check</span>
                        </button>
                      )}
                      {listing.status === "verified" && (
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">Assigned</span>
                      )}
                      {(listing.status === "pending" || listing.status === "active") && (
                        <button onClick={() => setAssignModal({ isOpen: true, listingId: listing.id })}
                          className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all" title="Assign Vendor">
                          <span className="material-symbols-outlined text-sm">person_add</span>
                        </button>
                      )}
                      {listing.status === "active" && (
                        <button onClick={() => updateListingStatus(listing.id, "completed")}
                          className="text-xs font-bold px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
                          Complete
                        </button>
                      )}
                      {(listing.status !== "cancelled" && listing.status !== "rejected") && (
                        <button onClick={() => updateListingStatus(listing.id, "cancelled")}
                          className="w-8 h-8 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all" title="Cancel Listing">
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

      {/* Decision Modal */}
      {decisionModal.listingId && (
        <DecisionModal
          isOpen={decisionModal.isOpen}
          onClose={() => setDecisionModal({ isOpen: false, listingId: null })}
          title="Listing Review"
          itemDetails={[
            { label: "Listing", value: listings.find(l => l.id === decisionModal.listingId)?.title || "" },
            { label: "Proposed Weight", value: `${listings.find(l => l.id === decisionModal.listingId)?.weight || 0} KG` }
          ]}
          onConfirm={(status, reason) => {
            if (decisionModal.listingId) {
              updateListingStatus(decisionModal.listingId, status, reason);
              setDecisionModal({ isOpen: false, listingId: null });
            }
          }}
          actions={[
            { label: "Approve & Go Live", status: "active", color: "#1E8E3E" },
            { label: "Put on Hold", status: "on-hold", color: "#FFC107", requireReason: true },
            { label: "Reject Listing", status: "rejected", color: "#ef4444", requireReason: true }
          ]}
        />
      )}

      {/* Vendor Assignment Modal */}
      {assignModal.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setAssignModal({ isOpen: false, listingId: null })} />
          <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 space-y-6">
            <div>
              <h3 className="text-xl font-black text-slate-900">Assign Vendor</h3>
              <p className="text-sm text-slate-500 mt-1">Select a verified vendor to handle this request.</p>
            </div>
            
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {users.filter(u => u.role === 'vendor' && u.status === 'active').map(vendor => (
                <button
                  key={vendor.id}
                  onClick={() => {
                    if (assignModal.listingId) assignVendor(assignModal.listingId, vendor.id);
                    setAssignModal({ isOpen: false, listingId: null });
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center font-black text-blue-600">
                    {vendor.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{vendor.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">CPCB Verified</p>
                  </div>
                </button>
              ))}
              {users.filter(u => u.role === 'vendor' && u.status === 'active').length === 0 && (
                <p className="text-center py-8 text-slate-400 italic text-sm">No verified vendors available.</p>
              )}
            </div>
            
            <button
              onClick={() => setAssignModal({ isOpen: false, listingId: null })}
              className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
