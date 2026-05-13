"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface SealedBid {
  id: string;
  vendorId: string;
  vendor?: { id: string; name: string; email: string };
  vendorName?: string;
  vendorEmail?: string;
  amount: number;
  remarks?: string;
  status: string;
  createdAt: string;
  auditDoc?: {
    status: string;
    auditReportUrl?: string;
    excelUrl?: string;
    imageUrls?: string[];
  };
}

export default function AdminSealedBidsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { listings } = useApp();

  const [bids, setBids] = useState<SealedBid[]>([]);
  const [loading, setLoading] = useState(true);

  const contextListing = listings.find(l => l.id === id || l.requirementId === id);

  const fetchBids = useCallback(async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/requirements/${id}/sealed-bids`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setBids(await res.json());
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBids();
  }, [fetchBids]);

  const sorted = [...bids].sort((a, b) => b.amount - a.amount);
  const highest = sorted[0]?.amount;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined text-4xl text-slate-300 animate-spin">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      {/* Header */}
      <div>
        <button onClick={() => router.back()} className="flex items-center gap-1 text-slate-400 hover:text-slate-700 dark:hover:text-white text-sm font-bold mb-4 transition-colors">
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Back
        </button>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Sealed Bids</h1>
        <p className="text-slate-500 text-sm mt-1">{contextListing?.title || id}</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Bids", value: bids.length, icon: "gavel", color: "text-primary" },
          { label: "Highest Bid", value: highest ? `₹${Number(highest).toLocaleString("en-IN")}` : "—", icon: "trending_up", color: "text-green-600" },
          { label: "Average Bid", value: bids.length ? `₹${Math.round(bids.reduce((s, b) => s + b.amount, 0) / bids.length).toLocaleString("en-IN")}` : "—", icon: "analytics", color: "text-amber-600" },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4">
            <span className={`material-symbols-outlined text-3xl ${s.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
            <div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{s.value}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bid list */}
      {bids.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="material-symbols-outlined text-5xl text-slate-300 block mb-3">gavel</span>
          <p className="text-slate-500 font-bold">No sealed bids submitted yet.</p>
          <p className="text-slate-400 text-sm mt-1">Bids will appear here after the sealed bid event deadline.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((bid, idx) => (
            <div key={bid.id} className={`bg-white dark:bg-slate-900 rounded-2xl border overflow-hidden ${
              bid.amount === highest ? "border-green-300 dark:border-green-700" : "border-slate-200 dark:border-slate-800"
            }`}>
              <div className="px-6 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${
                    idx === 0 ? "bg-yellow-100 text-yellow-700" : idx === 1 ? "bg-slate-100 text-slate-500" : idx === 2 ? "bg-amber-50 text-amber-600" : "bg-slate-50 text-slate-400"
                  }`}>
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{bid.vendor?.name || bid.vendorName || "Vendor"}</p>
                    <p className="text-xs text-slate-500">{bid.vendor?.email || bid.vendorEmail}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-black ${bid.amount === highest ? "text-green-600 dark:text-green-400" : "text-slate-900 dark:text-white"}`}>
                    ₹{Number(bid.amount).toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-slate-400">
                    Submitted {new Date(bid.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>

              {/* Remarks */}
              {bid.remarks && (
                <div className="px-6 pb-3">
                  <p className="text-xs text-slate-500 italic">"{bid.remarks}"</p>
                </div>
              )}

              {/* Audit doc quick links */}
              {bid.auditDoc && (
                <div className="px-6 pb-4 flex items-center gap-3 flex-wrap">
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                    bid.auditDoc.status === "approved" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                  }`}>
                    Audit: {bid.auditDoc.status}
                  </span>
                  {bid.auditDoc.auditReportUrl && (
                    <a href={bid.auditDoc.auditReportUrl} target="_blank" rel="noopener noreferrer"
                      className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">description</span>
                      Audit Report
                    </a>
                  )}
                  {bid.auditDoc.excelUrl && (
                    <a href={bid.auditDoc.excelUrl} target="_blank" rel="noopener noreferrer"
                      className="text-xs font-bold text-green-600 hover:underline flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">table_chart</span>
                      Filled Excel
                    </a>
                  )}
                  {bid.auditDoc.imageUrls && bid.auditDoc.imageUrls.length > 0 && (
                    <span className="text-xs text-slate-400">{bid.auditDoc.imageUrls.length} site photo{bid.auditDoc.imageUrls.length !== 1 ? "s" : ""}</span>
                  )}
                </div>
              )}

              {idx === 0 && (
                <div className="bg-green-50 dark:bg-green-900/10 px-6 py-2 border-t border-green-100 dark:border-green-800">
                  <p className="text-xs font-black text-green-600 dark:text-green-400 uppercase tracking-widest flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
                    Highest Bid
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {bids.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-2xl p-5 text-sm text-blue-700 dark:text-blue-400">
          <p className="font-bold mb-1">Next Step</p>
          <p>Go to <strong>Auction Control</strong> and use <strong>"Set Params"</strong> to configure the live auction parameters, then use <strong>"Notify Client"</strong> to send for client approval.</p>
        </div>
      )}
    </div>
  );
}
