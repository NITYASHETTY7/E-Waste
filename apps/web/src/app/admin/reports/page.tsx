"use client";

import { useState, useEffect, useMemo } from "react";
import { useApp } from "@/context/AppContext";

export default function AdminReports() {
  const { listings, users, bids } = useApp();
  const [activeTab, setActiveTab] = useState<"platform" | "clients" | "vendors">("platform");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Calculations
  const completedListings = listings.filter(l => l.status === "completed" || l.auctionPhase === "completed");
  const totalWeight = completedListings.reduce((sum, l) => sum + (l.weight || 0), 0);
  const totalRevenue = bids.filter(b => b.status === "accepted").reduce((sum, b) => sum + b.amount, 0);
  const totalCommissions = totalRevenue * 0.05;

  const vendors = users.filter(u => u.role === "vendor");
  const clients = users.filter(u => u.role === "client");

  const metrics = useMemo(() => [
    { label: "Total E-Waste Processed", value: `${totalWeight.toLocaleString()} KG`, delta: "0%", icon: "recycling" },
    { label: "Total Platform Revenue", value: `₹${(totalRevenue / 1000).toFixed(1)}K`, delta: "0%", icon: "payments" },
    { label: "Platform Commissions", value: `₹${(totalCommissions / 1000).toFixed(1)}K`, delta: "0%", icon: "account_balance" },
    { label: "Active Recycling Partners", value: vendors.length.toString(), delta: "0", icon: "handshake" },
  ], [totalWeight, totalRevenue, totalCommissions, vendors.length]);

  const monthlyData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const result = [];
    
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = months[d.getMonth()];
      const year = d.getFullYear();
      
      const weight = listings
        .filter(l => {
          const ld = new Date(l.createdAt);
          return (l.status === "completed" || l.auctionPhase === "completed") && 
                 ld.getMonth() === d.getMonth() && 
                 ld.getFullYear() === year;
        })
        .reduce((sum, l) => sum + (l.weight || 0), 0);
      
      const co2 = Number((weight * 1.5 / 1000).toFixed(2)); // in MT
      result.push({ month: monthLabel, co2, waste: weight });
    }
    return result;
  }, [listings]);

  const categoryData = useMemo(() => {
    const categories: Record<string, number> = {};
    let total = 0;
    listings.forEach(l => {
      const cat = l.category || "Other";
      categories[cat] = (categories[cat] || 0) + 1;
      total++;
    });

    const colors = ["bg-violet-500", "bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500"];

    return Object.entries(categories).map(([label, count], i) => ({
      label,
      pct: total > 0 ? Math.round((count / total) * 100) : 0,
      color: colors[i % colors.length]
    })).sort((a,b) => b.pct - a.pct).slice(0, 5);
  }, [listings]);

  const eprData = useMemo(() => {
    return clients.map(client => {
      const clientListings = listings.filter(l => l.userId === client.id && (l.status === "completed" || l.auctionPhase === "completed"));
      const achieved = clientListings.reduce((s, l) => s + (l.weight || 0), 0) / 1000; // MT
      const target = 5.0; // Default target 5MT since it's not in DB yet
      return {
        name: client.name,
        category: "IT / Consumer",
        target,
        achieved: Number(achieved.toFixed(2)),
        progress: Math.min(Math.round((achieved / target) * 100), 100)
      };
    }).sort((a,b) => b.achieved - a.achieved);
  }, [clients, listings]);

  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleDownload = (name: string) => {
    showToast(`Generating ${name}...`);
    
    // Simulate a CSV download
    setTimeout(() => {
      const csvContent = "data:text/csv;charset=utf-8,Date,Entity,Category,Weight,Amount\n2026-06-03,Test Client,E-Waste,1000kg,₹50000";
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${name.replace(/\s+/g, "_")}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showToast(`${name} downloaded successfully.`);
    }, 1500);
  };

  if (!mounted) return <div className="min-h-screen bg-slate-50 flex items-center justify-center dark:bg-slate-950"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div></div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20 px-4 md:px-8 pt-8 relative">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[200] px-6 py-3 rounded-2xl shadow-2xl text-sm font-black text-white transition-all transform animate-in fade-in slide-in-from-top-4 ${toast.type === "error" ? "bg-red-600" : "bg-emerald-600"}`}>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base">{toast.type === "error" ? "error" : "check_circle"}</span>
            {toast.msg}
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-headline font-extrabold tracking-tight text-slate-900 dark:text-white">Analytical Intelligence</h2>
          <p className="text-slate-500 mt-1 font-medium">Cross-platform metrics, compliance tracking, and revenue audits.</p>
        </div>
        <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit dark:bg-slate-800">
          {(["platform", "clients", "vendors"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
              }`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "platform" && (
        <div className="space-y-8">
          {/* KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((m) => (
              <div key={m.label} className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between h-44 shadow-sm hover:shadow-md transition-shadow dark:bg-slate-900 dark:border-slate-700">
                <div className="flex justify-between items-start">
                  <span className="material-symbols-outlined text-emerald-600 opacity-50">{m.icon}</span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{m.delta}</span>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">{m.label}</p>
                  <h3 className="text-3xl font-headline font-bold text-slate-900 dark:text-white">{m.value}</h3>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* CO2 Savings Chart */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-8 dark:bg-slate-900 dark:border-slate-700">
              <h4 className="font-headline font-bold text-slate-900 mb-8 flex items-center justify-between dark:text-white">
                Environmental Impact (CO2 Saved)
                <button onClick={() => handleDownload("Impact Report")} className="text-xs font-bold text-emerald-600 hover:underline">Download Report</button>
              </h4>
              <div className="h-64 flex items-end justify-between gap-4 px-4 relative">
                <div className="absolute inset-0 flex flex-col justify-between py-2 text-[10px] text-slate-100 pointer-events-none">
                  {[300, 225, 150, 75, 0].map(v => <div key={v} className="border-b border-slate-100 w-full h-px dark:border-slate-800" />)}
                </div>
                {monthlyData.map((d) => (
                  <div key={d.month} className="flex-1 flex flex-col items-center gap-2 group relative">
                    <div className="w-full bg-emerald-600/10 rounded-t-lg transition-all hover:bg-emerald-600/20 cursor-pointer" style={{ height: `${Math.min(100, (d.co2 / 300) * 100)}%` }}>
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 font-bold">
                        {d.co2} MT CO2
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{d.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Material Category Reports */}
            <div className="bg-white rounded-3xl border border-slate-200 p-8 dark:bg-slate-900 dark:border-slate-700">
              <h4 className="font-headline font-bold text-slate-900 mb-8 dark:text-white">Material Categories</h4>
              <div className="space-y-6">
                {categoryData.length > 0 ? categoryData.map((item) => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-500">{item.label}</span>
                      <span className="text-slate-900 dark:text-white">{item.pct}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden dark:bg-slate-950">
                      <div className={`h-full ${item.color} rounded-full transition-all duration-1000`} style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                )) : (
                  <p className="text-center py-20 text-slate-400 italic text-sm">No data available</p>
                )}
              </div>
            </div>
          </div>

          {/* EPR Tracking */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8 dark:bg-slate-900 dark:border-slate-700">
            <h4 className="font-headline font-bold text-slate-900 mb-6 flex items-center justify-between dark:text-white">
                EPR Tracking (Extended Producer Responsibility)
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full dark:bg-emerald-900/20">FY 2024-25 Q2</span>
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-black tracking-widest dark:bg-slate-950">
                  <tr>
                    <th className="px-6 py-4">Producer Name</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4 text-right">Target (MT)</th>
                    <th className="px-6 py-4 text-right">Achieved (MT)</th>
                    <th className="px-6 py-4 w-1/4 text-center">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                   {eprData.length > 0 ? eprData.map((row, i) => (
                     <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                       <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{row.name}</td>
                       <td className="px-6 py-4 text-xs text-slate-500">{row.category}</td>
                       <td className="px-6 py-4 text-right font-mono text-slate-500">{row.target.toFixed(2)}</td>
                       <td className="px-6 py-4 text-right font-mono font-bold text-emerald-600">{row.achieved.toFixed(2)}</td>
                       <td className="px-6 py-4">
                         <div className="flex items-center gap-3">
                           <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden dark:bg-slate-800">
                             <div className="h-full bg-emerald-500" style={{ width: `${row.progress}%` }} />
                           </div>
                           <span className="text-[10px] font-bold text-slate-500 w-8">{row.progress}%</span>
                         </div>
                       </td>
                     </tr>
                   )) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">No producer data available for EPR tracking</td>
                    </tr>
                   )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "clients" && (
        <div className="space-y-8">
           <div className="bg-white rounded-3xl border border-slate-200 p-8 dark:bg-slate-900 dark:border-slate-700">
              <h4 className="font-headline font-bold text-slate-900 mb-6 dark:text-white">Client Revenue & Volume</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-black tracking-widest dark:bg-slate-950">
                    <tr>
                      <th className="p-4">Client Name</th>
                      <th className="p-4">Industry</th>
                      <th className="p-4 text-center">Total Lots</th>
                      <th className="p-4 text-right">Total Weight</th>
                      <th className="p-4 text-right">Total Revenue Generated</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {clients.map(client => {
                       const clientListings = listings.filter(l => l.userId === client.id);
                       const clientWeight = clientListings.reduce((s, l) => s + (l.weight || 0), 0);
                       const clientRevenue = bids.filter(b => b.status === "accepted" && clientListings.some(l => l.id === b.listingId)).reduce((s, b) => s + b.amount, 0);
                       return (
                         <tr key={client.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="p-4 font-bold text-slate-900 dark:text-white">{client.name}</td>
                            <td className="p-4 text-xs text-slate-500">{client.onboardingProfile?.industrySector || "IT Services"}</td>
                            <td className="p-4 text-center font-bold text-slate-700 dark:text-slate-300">{clientListings.length}</td>
                            <td className="p-4 text-right text-slate-600 font-mono dark:text-slate-400">{clientWeight.toLocaleString()} KG</td>
                            <td className="p-4 text-right font-bold text-emerald-700 font-mono">₹{clientRevenue.toLocaleString()}</td>
                            <td className="p-4 text-right">
                               <button onClick={() => handleDownload(`${client.name} Revenue Report`)} className="px-4 py-2 border border-slate-200 rounded-xl text-[10px] font-black uppercase text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:border-slate-700">Audit</button>
                            </td>
                         </tr>
                       )
                    })}
                    {clients.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-12 text-center text-slate-400 italic">No client records found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
           </div>
        </div>
      )}

      {activeTab === "vendors" && (
        <div className="space-y-8">
           <div className="bg-white rounded-3xl border border-slate-200 p-8 dark:bg-slate-900 dark:border-slate-700">
              <h4 className="font-headline font-bold text-slate-900 mb-6 dark:text-white">Vendor Performance Audit</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-black tracking-widest dark:bg-slate-950">
                    <tr>
                      <th className="p-4">Vendor Entity</th>
                      <th className="p-4">Verification</th>
                      <th className="p-4 text-center">Participation</th>
                      <th className="p-4 text-center">Won</th>
                      <th className="p-4 text-center">Win Rate</th>
                      <th className="p-4 text-right">Total Purchase Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {vendors.map(vendor => {
                       const vendorBids = bids.filter(b => b.vendorId === vendor.id);
                       const vendorWon = vendorBids.filter(b => b.status === "accepted");
                       const winRate = vendorBids.length > 0 ? Math.round((vendorWon.length / vendorBids.length) * 100) : 0;
                       const totalPurchase = vendorWon.reduce((s, b) => s + b.amount, 0);
                       return (
                         <tr key={vendor.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="p-4 font-bold text-slate-900 dark:text-white">{vendor.name}</td>
                            <td className="p-4">
                               <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${vendor.status === "active" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                                  {vendor.status?.toUpperCase() || "PENDING"}
                               </span>
                            </td>
                            <td className="p-4 text-center font-bold text-slate-700 dark:text-slate-300">{vendorBids.length} bids</td>
                            <td className="p-4 text-center font-bold text-emerald-600">{vendorWon.length}</td>
                            <td className="p-4 text-center">
                               <div className="flex items-center justify-center gap-2">
                                  <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden dark:bg-slate-800">
                                     <div className="h-full bg-emerald-500" style={{ width: `${winRate}%` }} />
                                  </div>
                                  <span className="text-[10px] font-bold text-slate-500">{winRate}%</span>
                               </div>
                            </td>
                            <td className="p-4 text-right font-bold text-slate-900 font-mono dark:text-white">₹{totalPurchase.toLocaleString()}</td>
                         </tr>
                       )
                    })}
                    {vendors.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-12 text-center text-slate-400 italic">No vendor records found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
