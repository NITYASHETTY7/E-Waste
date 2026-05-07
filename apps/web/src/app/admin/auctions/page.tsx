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
  const [configModal, setConfigModal] = useState<{isOpen: boolean, listingId: string | null}>({isOpen: false, listingId: null});
  const [configForm, setConfigForm] = useState({ tickSize: "", maxTick: "", extensionTime: "3" });

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
      <div className="card overflow-hidden border border-slate-100 dark:border-slate-800">
        <div className="p-4 border-b border-slate-100 flex items-center gap-3 dark:border-slate-800">
          <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{filtered.length} auction{filtered.length !== 1 ? "s" : ""}</span>
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
                    <h3 className="font-bold text-slate-900 truncate dark:text-white">{listing.title}</h3>
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
                    {meta.next && phase === "open_configuration" && (
                      <button
                        onClick={() => {
                          setConfigModal({ isOpen: true, listingId: listing.id });
                          setConfigForm({ tickSize: "", maxTick: "", extensionTime: "3" });
                        }}
                        className="px-4 py-2 rounded-xl bg-orange-600 text-white text-xs font-black uppercase hover:bg-orange-700 transition-colors"
                      >
                        Configure & Launch →
                      </button>
                    )}
                    {meta.next && phase !== "open_configuration" && (
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

      {configModal.isOpen && configModal.listingId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 animate-fade-in">
            <div>
              <h3 className="text-xl font-headline font-extrabold text-slate-900 dark:text-white">Admin Auction Setup</h3>
              <p className="text-sm text-slate-500 mt-1">Set the final parameters to launch the live auction.</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="label">Tick Size / Increment (₹) *</label>
                <input type="number" className="input-base" value={configForm.tickSize} onChange={e => setConfigForm({...configForm, tickSize: e.target.value})} placeholder="e.g. 500" />
              </div>
              <div>
                <label className="label">Max Tick Size (₹)</label>
                <input type="number" className="input-base" value={configForm.maxTick} onChange={e => setConfigForm({...configForm, maxTick: e.target.value})} placeholder="Optional max jump" />
              </div>
              <div>
                <label className="label">Auto-Extension (Mins) *</label>
                <select className="input-base" value={configForm.extensionTime} onChange={e => setConfigForm({...configForm, extensionTime: e.target.value})}>
                  <option value="1">1 Minute</option>
                  <option value="3">3 Minutes</option>
                  <option value="5">5 Minutes</option>
                  <option value="10">10 Minutes</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setConfigModal({isOpen: false, listingId: null})} className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:border-slate-700">Cancel</button>
              <button 
                onClick={() => {
                  editListing(configModal.listingId!, {
                    bidIncrement: Number(configForm.tickSize),
                    maximumTickSize: Number(configForm.maxTick) || Number(configForm.tickSize) * 10,
                    extensionTime: Number(configForm.extensionTime)
                  });
                  updateAuctionPhase(configModal.listingId!, "live");
                  setConfigModal({isOpen: false, listingId: null});
                }}
                disabled={!configForm.tickSize}
                className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 disabled:opacity-50"
              >
                Launch Auction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
