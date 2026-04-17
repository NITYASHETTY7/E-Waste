"use client";

import React, { useState } from "react";
import { useAuction } from "@/hooks/useAuction";
import { useApp } from "@/context/AppContext";
import { Listing } from "@/types";
import { formatTime } from "@/utils/format";

export default function LiveAuctionEmbed({ listing: initialListing, userRole = "client" }: { listing?: Listing, userRole?: "client" | "vendor" }) {
  const { 
    listing, 
    auctionBids, 
    currentHighAmount, 
    currentHighBid, 
    formatTime: auctionTimer, 
    placeBid,
    isActive 
  } = useAuction(initialListing?.id || "");

  const { editListing } = useApp();
  const [vendorBid, setVendorBid] = useState("");

  if (!listing) return <div className="p-10 text-center">Listing not found</div>;

  const title = listing.title;
  const basePrice = listing.basePrice || 0;
  const tickSize = listing.bidIncrement || 500;
  const currentHigh = currentHighAmount;
  const lotId = listing.id.split("-")[0];
  const weight = listing.weight;
  const category = listing.category;
  const location = listing.location;
  const emd = listing.highestEmdAmount || 0;

  // Group bids by vendor for the chart
  const vendorBidsMap = new Map();
  const sortedBids = [...auctionBids].reverse();
  sortedBids.forEach((bid, globalIndex) => {
    if (!vendorBidsMap.has(bid.vendorId)) {
      vendorBidsMap.set(bid.vendorId, {
        name: userRole === "vendor" && bid.vendorId !== initialListing?.userId ? "Anonymous" : bid.vendorName,
        id: bid.vendorId,
        bids: []
      });
    }
    vendorBidsMap.get(bid.vendorId).bids.push({ ...bid, globalIndex: globalIndex + 1 });
  });

  const competitors = Array.from(vendorBidsMap.values()).map((v, i) => ({
    ...v,
    color: ["#1E8E3E", "#FFC107", "#6F42C1", "#0B5ED7", "#DC3545"][i % 5],
    displayBids: v.bids.map((b: any) => ({ r: b.globalIndex, a: b.amount }))
  }));

  const maxRound = auctionBids.length;

  const handleSubmitBid = () => {
    const amount = parseInt(vendorBid);
    if (isNaN(amount)) return;
    const result = placeBid(amount);
    if (result.success) {
      setVendorBid("");
    } else {
      alert(result.message);
    }
  };

  const handleQuickBid = (increment: number) => {
    const amount = currentHigh + increment;
    placeBid(amount);
  };

  const handleEndAuction = () => {
    if (confirm("Are you sure you want to end this auction now?")) {
      editListing(listing.id, { auctionPhase: 'completed', status: 'completed' });
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      {/* Mini Navbar */}
      <div className="flex flex-wrap items-center justify-start gap-3 p-4 border-b-2 border-[#1E8E3E] bg-white sticky top-0 z-30 shadow-sm">
        <div className="bg-slate-100 text-[#1A1A2E] px-3 py-1.5 rounded-md flex items-center gap-2 text-xs font-bold border border-slate-200">
          <span className={`w-2.5 h-2.5 rounded-full ${isActive ? "bg-red-500 animate-pulse" : "bg-slate-400"}`} />
          {isActive ? "LIVE" : "AUCTION ENDED"}: {title}
        </div>
        <div className="bg-slate-100 text-[#1A1A2E] px-3 py-1.5 rounded-md text-xs font-bold border border-slate-200">
          <span className="text-slate-500 text-[10px] uppercase tracking-widest mr-2">BASE PRICE</span>
          ₹{basePrice.toLocaleString()}
        </div>
        <div className="bg-emerald-50 text-[#1A1A2E] px-3 py-1.5 rounded-md text-xs font-bold border border-emerald-200">
          <span className="text-emerald-600 text-[10px] uppercase tracking-widest mr-2">CURRENT HIGH</span>
          ₹{currentHigh.toLocaleString()}
        </div>
        <div className="bg-slate-100 text-[#1A1A2E] px-3 py-1.5 rounded-md text-xs font-bold border border-slate-200">
          <span className="text-slate-500 text-[10px] uppercase tracking-widest mr-2">TICK SIZE</span>
          ₹{tickSize.toLocaleString()}
        </div>
        <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1 border border-blue-200 ml-auto">
          <span className="material-symbols-outlined text-[16px]">timer</span>
          {isActive ? auctionTimer : "00:00:00"}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-6 p-6 bg-[#F8FAFC]">
        
        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-6">
          
          {/* Bid Progression Graph Card */}
          <div className="bg-white border border-slate-200 rounded-xl border-t-4 border-t-[#1E8E3E] shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <p className="text-[#64748B] text-[10px] font-black uppercase tracking-widest">Real-Time Bid Progression</p>
                <p className="text-[#1A1A2E] text-xs font-bold mt-0.5">{auctionBids.length} bids placed</p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                {competitors.slice(0,5).map(c => (
                  <div key={c.id} className="flex items-center gap-1.5 px-2 py-1 border border-slate-200 rounded-md bg-white shadow-sm">
                    <span className="w-2.5 h-2.5 rounded-full" style={{background: c.color}}></span>
                    <span className="text-[9px] text-[#1A1A2E] font-bold">{c.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-5 h-[240px] w-full">
              {auctionBids.length > 0 ? (
                <svg viewBox="0 0 500 200" className="w-full h-full bg-white">
                  {/* Y Axis Grid Lines */}
                  {[0, 1, 2, 3, 4].map(i => {
                    const y = 20 + i * 40;
                    const maxVal = Math.max(currentHigh * 1.2, basePrice * 1.5);
                    const val = Math.round(maxVal - (i * (maxVal / 4)));
                    return (
                      <g key={`y-${i}`}>
                        <line x1="50" y1={y} x2="480" y2={y} stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />
                        <text x="40" y={y + 3} fontSize="9" fill="#64748B" textAnchor="end">₹{Math.round(val/1000)}k</text>
                      </g>
                    )
                  })}
                  <line x1="50" y1="20" x2="50" y2="180" stroke="#CBD5E1" strokeWidth="1" />
                  <line x1="50" y1="180" x2="480" y2="180" stroke="#CBD5E1" strokeWidth="1" />

                  {/* Lines for each competitor */}
                  {competitors.map(comp => {
                    const maxVal = Math.max(currentHigh * 1.2, basePrice * 1.5);
                    const getX = (r: number) => 50 + ((r - 1) / Math.max(maxRound - 1, 1)) * 430;
                    const getY = (a: number) => 180 - (a / maxVal) * 160;

                    const pts = comp.displayBids.map((b: any) => {
                      return `${getX(b.r)},${getY(b.a)}`;
                    }).join(" ");

                    return (
                      <g key={comp.id}>
                        {comp.displayBids.length > 1 && (
                          <polyline points={pts} fill="none" stroke={comp.color} strokeWidth="2.5" strokeLinejoin="round" />
                        )}
                        {comp.displayBids.map((b: any, i: number) => {
                          return (
                            <g key={i}>
                              <circle cx={getX(b.r)} cy={getY(b.a)} r="4" fill={comp.color} stroke="#FFF" strokeWidth="1.5" />
                            </g>
                          )
                        })}
                      </g>
                    );
                  })}
                </svg>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">
                  Waiting for first bid...
                </div>
              )}
            </div>
          </div>

          {/* Bid Ledger Card */}
          <div className="bg-white border border-slate-200 rounded-xl border-t-4 border-t-[#0B5ED7] shadow-sm overflow-hidden flex-1">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <p className="text-[#64748B] text-[10px] font-black uppercase tracking-widest">Live Bid Ledger</p>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-sm ${isActive ? "text-[#0B5ED7] bg-[#EFF6FF] border-blue-200" : "text-slate-500 bg-slate-100 border-slate-200"}`}>
                {isActive ? "Live Updates" : "Final Standings"}
              </span>
            </div>
            <div className="p-3 space-y-2 max-h-[350px] overflow-y-auto">
              {auctionBids.map((bid, idx) => (
                <div key={bid.id} className={`flex items-center justify-between p-3 rounded-lg text-xs transition-colors ${idx === 0 ? "bg-[#E8F5E9] border-l-4 border-[#1E8E3E]" : "bg-white border border-slate-100 hover:bg-slate-50"}`}>
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{background: competitors.find(c => c.id === bid.vendorId)?.color || "#CBD5E1"}}></span>
                    <span className={`font-bold ${idx === 0 ? "text-[#1E8E3E]" : "text-[#1A1A2E]"}`}>
                      {idx === 0 ? "Leader" : `Rank ${idx + 1}`} • {userRole === "vendor" && bid.vendorId !== initialListing?.userId ? "Anonymous Vendor" : bid.vendorName}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {formatTime(bid.createdAt)}
                    </span>
                  </div>
                  <span className={`font-mono font-bold text-sm ${idx === 0 ? "text-[#1E8E3E]" : "text-slate-600"}`}>
                    ₹{bid.amount.toLocaleString()}
                  </span>
                </div>
              ))}
              {auctionBids.length === 0 && (
                <div className="text-center py-10 text-slate-400">No bids yet</div>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-6">
          
          {/* Lot Details Card */}
          <div className="bg-white border border-slate-200 rounded-xl border-t-4 border-t-[#0B5ED7] shadow-sm p-5">
            <div className="grid grid-cols-2 gap-y-5 gap-x-4">
              <div>
                <p className="text-[#94A3B8] text-[9px] font-black uppercase tracking-widest mb-1">CATEGORY</p>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#0B5ED7] text-[16px]">devices</span>
                  <p className="text-[#1A1A2E] text-xs font-bold truncate">{category}</p>
                </div>
              </div>
              <div>
                <p className="text-[#94A3B8] text-[9px] font-black uppercase tracking-widest mb-1">WEIGHT</p>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#1E8E3E] text-[16px]">scale</span>
                  <p className="text-[#1A1A2E] text-xs font-bold truncate">{weight} KG</p>
                </div>
              </div>
              <div>
                <p className="text-[#94A3B8] text-[9px] font-black uppercase tracking-widest mb-1">EMD AMOUNT</p>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#DC3545] text-[16px]">payments</span>
                  <p className="text-[#DC3545] text-xs font-bold truncate">₹{emd.toLocaleString()}</p>
                </div>
              </div>
              <div>
                <p className="text-[#94A3B8] text-[9px] font-black uppercase tracking-widest mb-1">LOCATION</p>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#FFC107] text-[16px]">location_on</span>
                  <p className="text-[#1A1A2E] text-xs font-bold truncate" title={location}>{location}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Role-Specific Control Panel */}
          {userRole === "client" ? (
            <div className="bg-white border border-slate-200 rounded-xl border-t-4 border-t-[#DC3545] shadow-sm p-5 flex-1">
              <div className="flex items-center justify-between mb-5">
                <p className="text-[#1A1A2E] font-bold text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#DC3545]">settings</span>
                  Auction Controls
                </p>
                <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-1 rounded border border-red-100 uppercase tracking-widest">Client</span>
              </div>
              
              <div className="space-y-3">
                <button 
                  onClick={handleEndAuction}
                  disabled={!isActive}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-xs bg-[#DC3545] text-white hover:bg-red-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[18px]">stop_circle</span>
                  End Auction Now
                </button>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-xs bg-[#EFF6FF] text-[#0B5ED7] border border-[#0B5ED7]/30 hover:bg-blue-50 transition-all shadow-sm">
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  Download Bid History
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl border-t-4 border-t-[#1E8E3E] shadow-sm p-5 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-5">
                <p className="text-[#1A1A2E] font-bold text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#1E8E3E]">gavel</span>
                  Place Your Bid
                </p>
                <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-widest ${isActive ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-200"}`}>
                  {isActive ? "Active" : "Closed"}
                </span>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-5">
                <p className="text-emerald-800 text-xs font-medium text-center">Minimum Next Bid</p>
                <p className="text-emerald-700 font-mono text-2xl font-black text-center mt-1">
                  ₹{(currentHigh + tickSize).toLocaleString()}
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Custom Bid Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                    <input 
                      type="number" 
                      value={vendorBid}
                      disabled={!isActive}
                      onChange={(e) => setVendorBid(e.target.value)}
                      placeholder={(currentHigh + tickSize).toString()}
                      className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-auto space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => handleQuickBid(tickSize)}
                    disabled={!isActive}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg font-bold text-xs bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
                  >
                    +₹{tickSize.toLocaleString()}
                  </button>
                  <button 
                    onClick={() => handleQuickBid(tickSize * 2)}
                    disabled={!isActive}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg font-bold text-xs bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
                  >
                    +₹{(tickSize * 2).toLocaleString()}
                  </button>
                </div>
                <button 
                  onClick={handleSubmitBid}
                  disabled={!isActive}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-black text-[13px] uppercase tracking-widest bg-[#1E8E3E] text-white hover:bg-emerald-700 transition-all shadow-lg hover:shadow-emerald-900/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Bid
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
