"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import Link from "next/link";

const PHASE_ORDER = ["invitation_window", "sealed_bid", "open_configuration", "live", "completed"] as const;
type Phase = typeof PHASE_ORDER[number];

const PHASE_META: Record<Phase, { label: string; color: string; next?: Phase }> = {
  invitation_window: { label: "Invitation Window", color: "bg-blue-100 text-blue-700", next: "sealed_bid" },
  sealed_bid: { label: "Sealed Bid", color: "bg-amber-100 text-amber-700", next: "open_configuration" },
  open_configuration: { label: "Configuring Open Bid", color: "bg-orange-100 text-orange-700", next: "live" },
  live: { label: "Live Auction", color: "bg-red-100 text-red-700", next: "completed" },
  completed: { label: "Completed", color: "bg-emerald-100 text-emerald-700" },
};

export default function AdminAuctions() {
  const { listings, bids, updateAuctionPhase, editListing } = useApp();
  const [filter, setFilter] = useState<Phase | "all">("all");
  const [search, setSearch] = useState("");

  const auctionListings = listings.filter(l => l.auctionPhase && l.auctionPhase !== "draft");

  const filtered = auctionListings
    .filter(l => filter === "all" || l.auctionPhase === filter)
    .filter(l => l.title.toLowerCase().includes(search.toLowerCase()));

  const countByPhase = (phase: Phase) => auctionListings.filter(l => l.auctionPhase === phase).length;

  const getTopBid = (listingId: string) => {
    const listingBids = bids.filter(b => b.listingId === listingId && b.status !== "rejected");
    return listingBids.length > 0 ? Math.max(...listingBids.map(b => b.amount)) : null;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-headline font-extrabold tracking-tight text-[color:var(--color-on-surface)]">Auction Control</h2>
          <p className="text-[color:var(--color-on-surface-variant)] mt-1">Manage all auction phases and advance deals through the pipeline.</p>
        </div>
        <div className="relative w-64">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input className="input-base pl-10 h-11 text-sm" placeholder="Search auctions..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Phase summary */}
      <div className="grid grid-cols-5 gap-3">
        {PHASE_ORDER.map(phase => {
          const m = PHASE_META[phase];
          return (
            <button
              key={phase}
              onClick={() => setFilter(filter === phase ? "all" : phase)}
              className={`card p-4 text-left border-2 transition-all ${filter === phase ? "border-primary" : "border-transparent"}`}
            >
              <p className="text-2xl font-black text-[color:var(--color-on-surface)]">{countByPhase(phase)}</p>
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase mt-1 inline-block ${m.color}`}>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Listings table */}
      <div className="card overflow-hidden border border-slate-100">
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <span className="text-sm font-bold text-slate-600">{filtered.length} auction{filtered.length !== 1 ? "s" : ""}</span>
        </div>
        {filtered.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <span className="material-symbols-outlined text-5xl block mb-2">gavel</span>
            No auctions found
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map(listing => {
              const phase = listing.auctionPhase as Phase;
              const meta = PHASE_META[phase] || { label: phase, color: "bg-slate-100 text-slate-600" };
              const topBid = getTopBid(listing.id);
              const listingBids = bids.filter(b => b.listingId === listing.id);

              return (
                <div key={listing.id} className="p-5 flex items-start justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-black text-slate-400">{listing.id}</span>
                      <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase ${meta.color}`}>{meta.label}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 truncate">{listing.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{listing.location} · {listing.weight} KG · {listing.category}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-slate-500">{listingBids.length} bid{listingBids.length !== 1 ? "s" : ""}</span>
                      {topBid && <span className="text-xs font-bold text-primary">Top: ₹{topBid.toLocaleString()}</span>}
                      {listing.basePrice && <span className="text-xs text-slate-400">Base: ₹{listing.basePrice.toLocaleString()}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {phase === "live" && (
                      <Link href={`/admin/auctions/${listing.id}/live`}
                        className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-black uppercase hover:bg-red-700 transition-colors">
                        View Live
                      </Link>
                    )}
                    {meta.next && (
                      <button
                        onClick={() => updateAuctionPhase(listing.id, meta.next!)}
                        className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-black uppercase hover:bg-primary/90 transition-colors"
                      >
                        Advance →
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
