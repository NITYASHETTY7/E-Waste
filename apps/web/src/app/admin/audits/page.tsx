"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminAudits() {
  const [audits, setAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [filter, setFilter] = useState<"ALL" | "INVITED" | "ACCEPTED" | "COMPLETED">("ALL");

  // Status Toast
  const [toast, setToast] = useState<{msg: string, type: "success" | "error"} | null>(null);

  const fetchAudits = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/audits/invitations`);
      setAudits(res.data);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load audits.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudits();
  }, []);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "COMPLETED": return "bg-emerald-100 text-emerald-700";
      case "ACCEPTED": return "bg-blue-100 text-blue-700";
      case "REJECTED": return "bg-red-100 text-red-700";
      case "SCHEDULED": return "bg-purple-100 text-purple-700";
      default: return "bg-amber-100 text-amber-700";
    }
  };

  const filteredAudits = audits.filter(a => filter === "ALL" || a.status === filter);

  // Group by requirement for better admin view
  const groupedAudits = filteredAudits.reduce((acc: any, audit: any) => {
    const reqId = audit.requirementId;
    if (!acc[reqId]) {
      acc[reqId] = {
        requirement: audit.requirement,
        audits: []
      };
    }
    acc[reqId].audits.push(audit);
    return acc;
  }, {});

  return (
    <div className="space-y-6 max-w-7xl mx-auto relative pb-20">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 px-6 py-3 rounded-xl shadow-xl z-50 text-white font-bold text-sm ${toast.type === "success" ? "bg-emerald-600" : "bg-red-600"}`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-headline font-extrabold tracking-tight text-[color:var(--color-on-surface)]">Audit Review</h2>
          <p className="text-[color:var(--color-on-surface-variant)] mt-1">Review vendor audit reports, check product matches, and photos.</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-px">
        {["ALL", "INVITED", "ACCEPTED", "COMPLETED"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-4 py-2 text-sm font-bold uppercase tracking-wider transition-all border-b-2 ${filter === f ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-700"}`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : audits.length === 0 ? (
        <div className="card p-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
          <span className="material-symbols-outlined text-6xl text-slate-300 mb-4 block">fact_check</span>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">No Audits Found</h3>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.values(groupedAudits).map((group: any) => (
            <div key={group.requirement.id} className="card p-0 overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">REQ: {group.requirement.id.substring(0,8)}</span>
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{group.requirement.title}</h3>
                <p className="text-sm text-slate-500 mt-1">Client: <span className="font-bold">{group.requirement.client?.name}</span></p>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {group.audits.map((audit: any) => {
                  const isMismatch = audit.report && audit.report.productMatch === false;
                  return (
                    <div key={audit.id} className={`p-5 flex flex-col md:flex-row items-start justify-between gap-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50 ${isMismatch ? "bg-red-50/50 dark:bg-red-900/10" : ""}`}>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-400">precision_manufacturing</span>
                            {audit.vendor?.name}
                          </p>
                          <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wide ${statusColor(audit.status)}`}>
                            {audit.status}
                          </span>
                        </div>

                        {audit.status === "COMPLETED" && audit.report && (
                          <div className={`mt-3 p-4 rounded-xl border ${isMismatch ? "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800" : "bg-emerald-50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-800"}`}>
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`material-symbols-outlined ${isMismatch ? "text-red-500" : "text-emerald-500"}`}>
                                {isMismatch ? "warning" : "check_circle"}
                              </span>
                              <p className={`text-sm font-bold ${isMismatch ? "text-red-700 dark:text-red-400" : "text-emerald-700 dark:text-emerald-400"}`}>
                                Product Match: {isMismatch ? "NO (MISMATCH)" : "YES"}
                              </p>
                            </div>

                            {audit.report.remarks && (
                              <div className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                                <span className="font-bold text-slate-900 dark:text-slate-100">Remarks:</span> 
                                <p className="mt-1 italic p-2 bg-white/50 rounded dark:bg-black/20 border border-slate-200 dark:border-slate-700">
                                  "{audit.report.remarks}"
                                </p>
                              </div>
                            )}

                            {audit.report.photos && audit.report.photos.length > 0 && (
                              <div className="mt-4">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Photos Provided</p>
                                <div className="flex flex-wrap gap-4">
                                  {audit.report.photos.map((photo: any) => (
                                    <div key={photo.id} className="space-y-1">
                                      <div className="w-24 h-24 rounded-lg bg-slate-200 dark:bg-slate-800 overflow-hidden border border-slate-300 dark:border-slate-700 flex items-center justify-center relative group cursor-pointer" title={photo.fileName}>
                                        <span className="material-symbols-outlined text-slate-400 text-3xl">image</span>
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                          <span className="material-symbols-outlined text-white text-sm">visibility</span>
                                        </div>
                                      </div>
                                      {photo.latitude && (
                                        <div className="flex flex-col">
                                          <p className="text-[9px] font-black text-emerald-600 uppercase flex items-center gap-0.5">
                                            <span className="material-symbols-outlined text-[10px]">location_on</span> Geo-Tagged
                                          </p>
                                          <p className="text-[8px] text-slate-500 font-mono leading-none">
                                            {photo.latitude.toFixed(4)}, {photo.longitude.toFixed(4)}
                                          </p>
                                          {photo.capturedAt && (
                                            <p className="text-[8px] text-slate-400 leading-none mt-0.5">
                                              {new Date(photo.capturedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <p className="text-xs text-slate-400 mt-3">Completed: {new Date(audit.report.completedAt).toLocaleString()}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
