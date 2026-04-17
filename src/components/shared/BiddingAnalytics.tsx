"use client";

import React from "react";

export default function BiddingAnalytics() {
  // Mock data adapted for E-waste Forward Auction (Prices go UP)
  const vendors = [
    { id: 1, name: "Green Recyclers Pvt Ltd", color: "#f87171", currentBid: 740000, rank: "1st", rankColor: "bg-red-100 text-red-600" },
    { id: 2, name: "EcoMetal Solutions", color: "#60a5fa", currentBid: 725000, rank: "2nd", rankColor: "bg-blue-100 text-blue-600" },
    { id: 3, name: "ReVolt Recyclers", color: "#facc15", currentBid: 722000, rank: "3rd", rankColor: "bg-yellow-100 text-yellow-600" },
    { id: 4, name: "IronLoop Pvt Ltd", color: "#a78bfa", currentBid: 719000, rank: "4th", rankColor: "bg-purple-100 text-purple-600" },
    { id: 5, name: "TechRecycle India", color: "#34d399", currentBid: 715000, rank: "5th", rankColor: "bg-emerald-100 text-emerald-600" },
    { id: 6, name: "Circular IT Waste", color: "#f472b6", currentBid: 710000, rank: "6th", rankColor: "bg-pink-100 text-pink-600" },
    { id: 7, name: "Urban Miners Corp", color: "#3b82f6", currentBid: 705000, rank: "7th", rankColor: "bg-blue-100 text-blue-600" },
    { id: 8, name: "E-Scrap Processors", color: "#fb923c", currentBid: 695000, rank: "8th", rankColor: "bg-orange-100 text-orange-600" },
    { id: 9, name: "Global Asset Recovery", color: "#f97316", currentBid: 680000, rank: "9th", rankColor: "bg-orange-100 text-orange-600" },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-8 font-sans">
      {/* Top Bar KPIs */}
      <div className="grid grid-cols-4 border-b border-slate-200 divide-x divide-slate-200">
        <div className="p-4 flex items-center justify-center gap-4 bg-slate-50">
          <div className="text-center">
            <span className="text-3xl font-light text-red-500">00</span>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">MINS</p>
          </div>
          <span className="text-2xl font-light text-slate-300">:</span>
          <div className="text-center">
            <span className="text-3xl font-light text-red-500">57</span>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">SEC</p>
          </div>
        </div>
        
        <div className="p-4 flex flex-col items-center justify-center bg-white">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">BASE AUCTION PRICE</p>
          <p className="text-xl font-bold text-slate-800">₹662,000.00</p>
        </div>

        <div className="p-4 flex flex-col items-center justify-center bg-white">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">CURRENT HIGHEST BID</p>
          <p className="text-xl font-bold text-slate-800">₹740,000.00</p>
        </div>

        <div className="p-4 flex flex-col items-center justify-center bg-white">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">VALUE GENERATED</p>
          <p className="text-xl font-bold text-emerald-500">+ ₹78,000.00</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row">
        {/* Chart Area */}
        <div className="flex-1 p-6 relative">
          <svg viewBox="0 0 600 400" className="w-full h-full min-h-[300px]">
            {/* Y Axis Grid Lines */}
            {[0, 1, 2, 3, 4, 5].map(i => {
               const y = 20 + i * 65;
               const val = 750 - i * 25;
               return (
                 <g key={`y-${i}`}>
                   <line x1="60" y1={y} x2="580" y2={y} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
                   <text x="50" y={y + 4} fontSize="10" fill="#94a3b8" textAnchor="end">{val},000</text>
                 </g>
               )
            })}
            {/* Y Axis Label */}
            <text x="-200" y="15" transform="rotate(-90)" fontSize="10" fontWeight="bold" fill="#94a3b8" letterSpacing="1">PRICE (INR)</text>

            {/* X Axis Grid Lines */}
            {[0, 1, 2, 3, 4].map(i => {
               const x = 60 + i * 130;
               return (
                 <g key={`x-${i}`}>
                   <line x1={x} y1="20" x2={x} y2="360" stroke="#e2e8f0" strokeWidth="1" />
                   <text x={x} y="380" fontSize="10" fill="#94a3b8" textAnchor="middle">{i * 5}</text>
                 </g>
               )
            })}
            <line x1="60" y1="360" x2="580" y2="360" stroke="#cbd5e1" strokeWidth="1" />
            <text x="320" y="400" fontSize="10" fontWeight="bold" fill="#94a3b8" letterSpacing="1" textAnchor="middle">DURATION (MINS)</text>

            {/* Bidding Lines (Mocking upward trends) */}
            <polyline points="60,340 120,300 200,280 250,220 320,150 400,100 450,46" fill="none" stroke="#f87171" strokeWidth="2" strokeLinejoin="round" />
            <circle cx="60" cy="340" r="3" fill="#f87171" />
            <circle cx="120" cy="300" r="3" fill="#f87171" />
            <circle cx="200" cy="280" r="3" fill="#f87171" />
            <circle cx="250" cy="220" r="3" fill="#f87171" />
            <circle cx="320" cy="150" r="3" fill="#f87171" />
            <circle cx="400" cy="100" r="3" fill="#f87171" />
            <circle cx="450" cy="46" r="3" fill="#f87171" />

            <polyline points="60,330 150,290 280,240 380,180 430,85" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinejoin="round" />
            <circle cx="60" cy="330" r="3" fill="#60a5fa" />
            <circle cx="150" cy="290" r="3" fill="#60a5fa" />
            <circle cx="280" cy="240" r="3" fill="#60a5fa" />
            <circle cx="380" cy="180" r="3" fill="#60a5fa" />
            <circle cx="430" cy="85" r="3" fill="#60a5fa" />

            <polyline points="60,320 220,260 350,190 410,93" fill="none" stroke="#facc15" strokeWidth="2" strokeLinejoin="round" />
            <circle cx="60" cy="320" r="3" fill="#facc15" />
            <circle cx="220" cy="260" r="3" fill="#facc15" />
            <circle cx="350" cy="190" r="3" fill="#facc15" />
            <circle cx="410" cy="93" r="3" fill="#facc15" />

            <polyline points="60,310 180,280 300,210 390,101" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinejoin="round" />
            <circle cx="60" cy="310" r="3" fill="#a78bfa" />
            <circle cx="180" cy="280" r="3" fill="#a78bfa" />
            <circle cx="300" cy="210" r="3" fill="#a78bfa" />
            <circle cx="390" cy="101" r="3" fill="#a78bfa" />

            <polyline points="60,300 240,230 330,160 380,111" fill="none" stroke="#34d399" strokeWidth="2" strokeLinejoin="round" />
            <circle cx="60" cy="300" r="3" fill="#34d399" />
            <circle cx="240" cy="230" r="3" fill="#34d399" />
            <circle cx="330" cy="160" r="3" fill="#34d399" />
            <circle cx="380" cy="111" r="3" fill="#34d399" />
          </svg>
        </div>

        {/* Leaderboard Panel */}
        <div className="w-full lg:w-[320px] bg-slate-50 border-l border-slate-200 p-4">
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-sm font-bold text-slate-800">Leaderboard</h3>
             <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded font-bold uppercase">Live Updates</span>
          </div>
          
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
            {vendors.map((vendor) => (
              <div key={vendor.id} className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${vendor.rankColor}`}>
                      {vendor.rank}
                    </span>
                    <span className="text-xs font-bold text-slate-700 truncate max-w-[120px]">
                      {vendor.name}
                    </span>
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: vendor.color }} />
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-slate-800">₹{vendor.currentBid.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
