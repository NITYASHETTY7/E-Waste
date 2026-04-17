"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";

export default function AdminListings() {
  const { listings, bids, updateListingStatus } = useApp();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed" | "pending">("all");

  const filtered = listings
    .filter(l => filter === "all" || l.status === filter)
    .filter(l => l.title.toLowerCase().includes(search.toLowerCase()) || l.location.toLowerCase().includes(search.toLowerCase()));

  const stats = {
    total: listings.length,
    active: listings.filter(l => l.status === "active").length,
    completed: listings.filter(l => l.status === "completed").length,
    pending: listings.filter(l => l.status === "pending").length,
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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total, color: "bg-[color:var(--color-secondary-container)]", textColor: "text-[color:var(--color-primary)]", icon: "inventory_2" },
          { label: "Active", value: stats.active, color: "bg-emerald-50", textColor: "text-emerald-700", icon: "check_circle" },
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
        {(["all", "active", "completed", "pending"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
              filter === f ? "bg-white shadow-sm text-[color:var(--color-on-surface)]" : "text-[color:var(--color-on-surface-variant)]"
            }`}>
            {f}
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
                      {listing.status === "pending" && (
                        <>
                          <button onClick={() => updateListingStatus(listing.id, "active")}
                            className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all" title="Approve Listing">
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                          </button>
                          <button onClick={() => updateListingStatus(listing.id, "rejected")}
                            className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all" title="Reject Listing">
                            <span className="material-symbols-outlined text-sm">block</span>
                          </button>
                        </>
                      )}
                      {listing.status === "active" && (
                        <button onClick={() => updateListingStatus(listing.id, "completed")}
                          className="text-xs font-bold px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                          Mark Complete
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
    </div>
  );
}
