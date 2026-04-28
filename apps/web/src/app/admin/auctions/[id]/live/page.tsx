"use client";

import { useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuction } from "@/hooks/useAuction";
import { formatTime as fmtTime } from "@/utils/format";

/* ─── SVG Bid Chart ──────────────────────────────────────────── */
function BidChart({
  vendorLines, maxRound, basePrice, currentHighest,
}: {
  vendorLines: { id: string; name: string; color: string; points: { round: number; amount: number }[] }[];
  maxRound: number; basePrice: number; currentHighest: number;
}) {
  const W = 600, H = 260, PL = 64, PR = 16, PT = 16, PB = 36;
  const cW = W - PL - PR, cH = H - PT - PB;
  const minP = basePrice * 0.95;
  const maxP = Math.max(currentHighest * 1.1, basePrice * 1.2);
  const toX = (r: number) => maxRound <= 1 ? PL + cW / 2 : PL + ((r - 1) / Math.max(maxRound - 1, 1)) * cW;
  const toY = (a: number) => PT + cH - ((a - minP) / (maxP - minP)) * cH;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(t => minP + t * (maxP - minP));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
      {ticks.map((v, i) => (
        <g key={i}>
          <line x1={PL} y1={toY(v)} x2={W - PR} y2={toY(v)} stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 3" />
          <text x={PL - 5} y={toY(v) + 4} fontSize="9" fill="#94A3B8" textAnchor="end">
            {v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : `₹${(v / 1000).toFixed(0)}K`}
          </text>
        </g>
      ))}
      <line x1={PL} y1={PT} x2={PL} y2={H - PB} stroke="#E2E8F0" strokeWidth="1" />
      <line x1={PL} y1={H - PB} x2={W - PR} y2={H - PB} stroke="#E2E8F0" strokeWidth="1" />
      {vendorLines.map(line => {
        if (line.points.length === 0) return null;
        const pts = line.points.map(p => `${toX(p.round)},${toY(p.amount)}`).join(" ");
        return (
          <g key={line.id}>
            {line.points.length > 1 && (
              <polyline points={pts} fill="none" stroke={line.color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
            )}
            {line.points.map((p, i) => (
              <circle key={i} cx={toX(p.round)} cy={toY(p.amount)} r="4" fill={line.color} stroke="#fff" strokeWidth="2" />
            ))}
          </g>
        );
      })}
    </svg>
  );
}

const COLORS = ["#1E8E3E", "#0B5ED7", "#FFC107", "#DC3545", "#6F42C1", "#0EA5E9", "#F97316"];

export default function AdminLiveObserver() {
  const params = useParams();
  const router = useRouter();
  const listingId = params?.id as string;
  const ledgerRef = useRef<HTMLDivElement>(null);

  const { listing, auctionBids, currentHighAmount, currentHighBid, formatTime: timer, isActive } = useAuction(listingId);

  useEffect(() => {
    if (ledgerRef.current) ledgerRef.current.scrollTop = ledgerRef.current.scrollHeight;
  }, [auctionBids]);

  if (!listing) return <div className="p-20 text-center text-slate-400">Listing not found</div>;

  const basePrice = listing.basePrice || 0;
  const tickSize = listing.bidIncrement || 0;
  const fmtINR = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  // Build per-vendor chart lines (all names visible to admin)
  const vendorMap = new Map<string, { id: string; name: string; color: string; points: { round: number; amount: number }[] }>();
  [...auctionBids].reverse().forEach((bid, i) => {
    if (!vendorMap.has(bid.vendorId)) {
      vendorMap.set(bid.vendorId, {
        id: bid.vendorId,
        name: bid.vendorName,
        color: COLORS[vendorMap.size % COLORS.length],
        points: [],
      });
    }
    vendorMap.get(bid.vendorId)!.points.push({ round: i + 1, amount: bid.amount });
  });
  const vendorLines = Array.from(vendorMap.values());

  // Unique participants
  const participants = vendorLines.length;
  const highVendor = currentHighBid ? (vendorMap.get(currentHighBid.vendorId)?.name ?? "—") : "—";

  return (
    <div className="min-h-screen bg-slate-50 font-sans dark:bg-slate-950">

      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-30 bg-white border-b-2 border-purple-500 shadow-sm dark:bg-slate-900">
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center gap-3 flex-wrap">
          {/* Admin badge */}
          <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-lg shrink-0">
            <span className="material-symbols-outlined text-purple-600 text-base">admin_panel_settings</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-purple-700">Admin Observer</span>
          </div>

          {/* Live/Ended indicator */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border shrink-0 ${isActive ? "bg-red-50 border-red-200 text-red-600" : "bg-slate-100 border-slate-200 text-slate-500"}`}>
            <span className={`w-2 h-2 rounded-full ${isActive ? "bg-red-500 animate-pulse" : "bg-slate-400"}`} />
            {isActive ? "Live Now" : "Ended"}
          </div>

          {/* Title */}
          <span className="text-slate-800 font-bold text-sm truncate max-w-[220px] shrink-0 dark:text-slate-200">{listing.title}</span>

          {/* Stat pills */}
          <div className="flex items-center gap-2 flex-wrap flex-1">
            {[
              { label: "Base", value: fmtINR(basePrice), color: "text-slate-700" },
              { label: "Current High", value: fmtINR(currentHighAmount), color: "text-emerald-700" },
              { label: "Tick", value: fmtINR(tickSize), color: "text-blue-700" },
              { label: "Bids", value: String(auctionBids.length), color: "text-slate-700" },
              { label: "Participants", value: String(participants), color: "text-purple-700" },
            ].map(p => (
              <div key={p.label} className="flex flex-col items-center px-3 py-1 rounded-lg bg-slate-50 border border-slate-200 min-w-[80px] dark:bg-slate-950 dark:border-slate-700">
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">{p.label}</span>
                <span className={`font-mono font-black text-sm ${p.color}`}>{p.value}</span>
              </div>
            ))}
          </div>

          {/* Timer */}
          <div className={`shrink-0 flex flex-col items-center px-4 py-1.5 rounded-xl border ${isActive ? "bg-red-50 border-red-300" : "bg-slate-100 border-slate-200"}`}>
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Time Left</span>
            <span className={`font-mono font-black text-2xl tabular-nums ${isActive ? "text-red-600" : "text-slate-400"}`}>{timer}</span>
          </div>

          <button onClick={() => router.push("/admin/listings")}
            className="shrink-0 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest border border-slate-200 transition-colors flex items-center gap-1 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
            <span className="material-symbols-outlined text-sm">arrow_back</span> Back
          </button>
        </div>

        {/* No-interaction notice */}
        <div className="bg-purple-600 py-1.5 text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/90 flex items-center justify-center gap-1.5">
            <span className="material-symbols-outlined text-sm">visibility</span>
            Read-only observation mode — bidding controls are disabled for admin
          </p>
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div className="max-w-[1400px] mx-auto p-5 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">

        {/* LEFT: Chart + Ledger */}
        <div className="flex flex-col gap-5">

          {/* Bid Progression Chart */}
          <div className="bg-white rounded-2xl border border-slate-200 border-t-4 border-t-emerald-500 shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-700">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/60 dark:border-slate-800">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Real-Time Bid Progression</p>
                <p className="text-slate-800 font-bold text-sm mt-0.5 dark:text-slate-200">{auctionBids.length} bids · {participants} participant{participants !== 1 ? "s" : ""}</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {vendorLines.slice(0, 6).map(v => (
                  <div key={v.id} className="flex items-center gap-1.5 bg-white border border-slate-200 px-2 py-1 rounded-md dark:bg-slate-900 dark:border-slate-700">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: v.color }} />
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{v.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4" style={{ height: 290 }}>
              {auctionBids.length > 0 ? (
                <BidChart vendorLines={vendorLines} maxRound={auctionBids.length} basePrice={basePrice} currentHighest={currentHighAmount} />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-2">
                  <span className="material-symbols-outlined text-5xl">bar_chart</span>
                  <p className="text-sm font-bold">Waiting for first bid…</p>
                </div>
              )}
            </div>
          </div>

          {/* Bid Ledger — full vendor names visible to admin */}
          <div className="bg-white rounded-2xl border border-slate-200 border-t-4 border-t-blue-500 shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-700">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/60 dark:border-slate-800">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Full Bid Ledger</p>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">{auctionBids.length} events</span>
            </div>
            <div ref={ledgerRef} className="overflow-y-auto p-4 space-y-1.5" style={{ maxHeight: 280 }}>
              {auctionBids.length === 0 ? (
                <div className="py-12 text-center text-slate-300">
                  <span className="material-symbols-outlined text-4xl block mb-2">history_toggle_off</span>
                  <p className="text-sm font-bold">No bids yet</p>
                </div>
              ) : auctionBids.map((bid, i) => {
                const isTop = i === 0;
                const color = vendorMap.get(bid.vendorId)?.color ?? "#CBD5E1";
                return (
                  <div key={bid.id} className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs transition-all ${isTop ? "bg-emerald-50 border-l-4 border-emerald-500 border border-emerald-100" : "bg-white border border-slate-100 hover:bg-slate-50"}`}>
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
                      <span className={`font-bold ${isTop ? "text-emerald-700" : "text-slate-800"}`}>{bid.vendorName}</span>
                      {isTop && <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-black uppercase tracking-wider">Leader</span>}
                      <span className="text-[10px] text-slate-400 font-mono">{fmtTime(bid.createdAt)}</span>
                    </div>
                    <span className={`font-mono font-bold text-sm ${isTop ? "text-emerald-700" : "text-slate-600"}`}>{fmtINR(bid.amount)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT: Lot Info + Admin Stats */}
        <div className="flex flex-col gap-5">

          {/* Lot Details */}
          <div className="bg-white rounded-2xl border border-slate-200 border-t-4 border-t-blue-500 shadow-sm p-5 dark:bg-slate-900 dark:border-slate-700">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Lot Details</p>
            <div className="space-y-3">
              {[
                { icon: "inventory_2", label: "Lot ID", value: listing.id },
                { icon: "category", label: "Category", value: listing.category },
                { icon: "scale", label: "Weight", value: `${listing.weight} KG` },
                { icon: "location_on", label: "Location", value: listing.location },
                { icon: "payments", label: "EMD Amount", value: fmtINR(listing.highestEmdAmount ?? 0) },
                { icon: "person", label: "Listed By", value: listing.userName ?? "—" },
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-slate-400 text-base w-5 shrink-0">{icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</p>
                    <p className="text-sm font-bold text-slate-800 truncate dark:text-slate-200">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Admin-only stats panel */}
          <div className="bg-white rounded-2xl border border-purple-200 border-t-4 border-t-purple-500 shadow-sm p-5 dark:bg-slate-900">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-purple-600 text-base">admin_panel_settings</span>
              <p className="text-[10px] font-black uppercase tracking-widest text-purple-700">Admin Overview</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Total Bids", value: String(auctionBids.length), color: "text-slate-800", bg: "bg-slate-50 border-slate-200" },
                { label: "Participants", value: String(participants), color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
                { label: "Current High", value: fmtINR(currentHighAmount), color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
                { label: "Base Price", value: fmtINR(basePrice), color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
                { label: "Tick Size", value: fmtINR(tickSize), color: "text-slate-700", bg: "bg-slate-50 border-slate-200" },
                { label: "Premium", value: basePrice > 0 ? `+${(((currentHighAmount - basePrice) / basePrice) * 100).toFixed(1)}%` : "—", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
              ].map(s => (
                <div key={s.label} className={`p-3 rounded-xl border ${s.bg}`}>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{s.label}</p>
                  <p className={`font-headline font-bold text-base mt-0.5 ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Current leader */}
            {currentHighBid && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600 mb-1">Current Leader</p>
                <p className="text-sm font-bold text-emerald-800">{highVendor}</p>
                <p className="text-xs font-mono text-emerald-600">{fmtINR(currentHighBid.amount)}</p>
              </div>
            )}
          </div>

          {/* Per-vendor breakdown */}
          {vendorLines.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 dark:bg-slate-900 dark:border-slate-700">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Participant Breakdown</p>
              <div className="space-y-2">
                {vendorLines.map(v => {
                  const topBid = v.points.length > 0 ? Math.max(...v.points.map(p => p.amount)) : 0;
                  const isLeader = currentHighBid?.vendorId === v.id;
                  return (
                    <div key={v.id} className={`flex items-center gap-3 p-2.5 rounded-xl border ${isLeader ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-100"}`}>
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ background: v.color }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate dark:text-slate-200">{v.name}</p>
                        <p className="text-[10px] text-slate-400">{v.points.length} bid{v.points.length !== 1 ? "s" : ""}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-xs font-mono font-bold ${isLeader ? "text-emerald-700" : "text-slate-600"}`}>{fmtINR(topBid)}</p>
                        {isLeader && <p className="text-[9px] text-emerald-600 font-black uppercase">Leader</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
