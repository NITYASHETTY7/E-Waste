"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

export default function VendorAudits() {
  const { currentUser } = useApp();
  const [audits, setAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Completion modal state
  const [completionModal, setCompletionModal] = useState<{ open: boolean; auditId: string | null }>({ open: false, auditId: null });
  const [productMatch, setProductMatch] = useState<boolean | null>(null);
  const [remarks, setRemarks] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [location, setLocation] = useState<{lat: number, lng: number, timestamp: string} | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Status Toast
  const [toast, setToast] = useState<{msg: string, type: "success" | "error"} | null>(null);

  const fetchAudits = async () => {
    if (!currentUser?.companyId) return;
    try {
      setLoading(true);
      const res = await api.get(`/audits/vendor/${currentUser.companyId}`);
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
  }, [currentUser?.companyId]);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const captureLocation = () => {
    if (!navigator.geolocation) {
      showToast("Geolocation is not supported by your browser.", "error");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: new Date(position.timestamp).toISOString()
        });
        showToast("Location captured successfully.");
      },
      (error) => {
        showToast("Location access is required to upload audit photos. Please enable it in your browser.", "error");
        console.error("Location error:", error);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleAction = async (auditId: string, action: "accept" | "reject") => {
    try {
      setSubmitting(true);
      await api.patch(`/audits/${auditId}/${action}`);
      showToast(`Audit ${action}ed successfully.`);
      fetchAudits();
    } catch (err: any) {
      showToast(err.response?.data?.message || "Action failed.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = async () => {
    if (!completionModal.auditId || productMatch === null) return;
    if (productMatch === false && !remarks.trim()) {
      showToast("Remarks are required if product does not match.", "error");
      return;
    }

    try {
      setSubmitting(true);
      const fd = new FormData();
      fd.append("productMatch", String(productMatch));
      if (remarks) fd.append("remarks", remarks);
      
      if (photo) {
        if (!location) {
          showToast("Please capture your location before submitting the photo.", "error");
          setSubmitting(false);
          return;
        }
        fd.append("photos", photo);
        fd.append("latitude", String(location.lat));
        fd.append("longitude", String(location.lng));
        fd.append("capturedAt", location.timestamp);
      }

      await api.patch(`/audits/${completionModal.auditId}/complete`, fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      showToast("Audit report submitted successfully.");
      setCompletionModal({ open: false, auditId: null });
      setProductMatch(null);
      setRemarks("");
      setPhoto(null);
      setLocation(null);
      fetchAudits();
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to submit report.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const statusMeta = (status: string) => {
    switch (status) {
      case "COMPLETED": return { color: "bg-emerald-100 text-emerald-700", label: "Completed" };
      case "ACCEPTED": return { color: "bg-blue-100 text-blue-700", label: "Accepted" };  
      case "REJECTED": return { color: "bg-red-100 text-red-700", label: "Rejected" };
      case "SCHEDULED": return { color: "bg-purple-100 text-purple-700", label: "Scheduled" };
      default: return { color: "bg-amber-100 text-amber-700", label: "Invited" };
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 relative">
      {/* Toast Notification */}
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

      <div>
        <h2 className="text-3xl font-headline font-extrabold tracking-tight text-[color:var(--color-on-surface)]">My Audits</h2>
        <p className="text-[color:var(--color-on-surface-variant)] mt-1">Accept audit invitations, visit sites, and submit audit reports.</p>
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <div className="w-8 h-8 border-4 border-[#1E8E3E] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : audits.length === 0 ? (
        <div className="card p-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
          <span className="material-symbols-outlined text-6xl text-slate-300 mb-4 block">fact_check</span>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">No Audit Invitations</h3>
          <p className="text-slate-500 mt-2">You'll receive audit invitations when an admin selects you for a site visit.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {audits.map(audit => {
            const req = audit.requirement;
            const client = req?.client;
            const meta = statusMeta(audit.status);

            return (
              <div key={audit.id} className={`card p-0 overflow-hidden border-2 ${audit.status === "COMPLETED" ? "border-emerald-200" : audit.status === "INVITED" ? "border-amber-200" : "border-slate-100"}`}>
                <div className="p-5 flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase ${meta.color}`}>{meta.label}</span>
                      <span className="text-xs font-black text-slate-400">ID: {audit.id.substring(0,8)}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{req?.title || "Unknown Requirement"}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Client: <span className="font-bold">{client?.name}</span> · {req?.totalWeight || 0} KG · {req?.category || "Unknown"}
                    </p>

                    {(audit.status === "ACCEPTED" || audit.status === "SCHEDULED" || audit.status === "COMPLETED") && (
                      <div className="mt-3 grid grid-cols-3 gap-3">
                        {[
                          { label: "SPOC Name", value: audit.spocName },
                          { label: "SPOC Phone", value: audit.spocPhone },
                          { label: "Site Address", value: audit.siteAddress },
                        ].map(info => info.value && (
                          <div key={info.label} className="bg-slate-50 rounded-xl p-2.5 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                            <p className="text-[9px] font-black text-slate-400 uppercase">{info.label}</p>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{info.value}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {audit.scheduledAt && (
                      <p className="text-xs text-slate-500 mt-2">
                        <span className="font-bold">Scheduled:</span> {new Date(audit.scheduledAt).toLocaleDateString("en-IN", { dateStyle: "long" })}
                      </p>
                    )}

                    {audit.status === "COMPLETED" && audit.report && (
                      <div className="mt-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-800">
                        <p className="text-xs font-bold text-emerald-700 dark:text-emerald-500 mb-1">Audit Report</p>   
                        <p className="text-xs text-slate-700 dark:text-slate-300">
                          Product match: <span className={`font-bold ${audit.report.productMatch ? "text-emerald-600" : "text-red-600"}`}>{audit.report.productMatch ? "Yes ✓" : "No ✗"}</span>
                        </p>
                        {audit.report.remarks && <p className="text-xs text-slate-600 mt-1 italic dark:text-slate-400">"{audit.report.remarks}"</p>}
                        <p className="text-xs text-slate-400 mt-1">Completed: {new Date(audit.report.completedAt!).toLocaleDateString("en-IN")}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    {audit.status === "INVITED" && (
                      <>
                        <button
                          disabled={submitting}
                          onClick={() => handleAction(audit.id, "accept")}
                          className="px-4 py-2 rounded-xl bg-[#1E8E3E] text-white text-xs font-black uppercase hover:bg-emerald-700 disabled:opacity-50"
                        >
                          Accept Audit
                        </button>
                        <button
                          disabled={submitting}
                          onClick={() => handleAction(audit.id, "reject")}
                          className="px-4 py-2 rounded-xl border border-red-200 text-red-600 text-xs font-black uppercase hover:bg-red-50 disabled:opacity-50"
                        >
                          Reject Audit
                        </button>
                      </>
                    )}
                    {(audit.status === "ACCEPTED" || audit.status === "SCHEDULED") && (
                      <button
                        onClick={() => setCompletionModal({ open: true, auditId: audit.id })}     
                        className="px-4 py-2 rounded-xl bg-[#0B5ED7] text-white text-xs font-black uppercase hover:bg-blue-700"
                      >
                        Mark as Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Audit completion modal */}
      {completionModal.open && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 animate-fade-in border border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-headline font-extrabold text-slate-900 dark:text-white">Submit Audit Report</h3>

            <div>
              <label className="label mb-3">Does the product match the listing description?</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setProductMatch(true)}
                  className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm flex items-center justify-center gap-2 transition-all ${productMatch === true ? "border-[#1E8E3E] bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20" : "border-slate-200 text-slate-600 hover:border-[#1E8E3E] dark:border-slate-700 dark:text-slate-400"}`}
                >
                  <span className="material-symbols-outlined text-sm">check_circle</span>Yes, matches
                </button>
                <button
                  onClick={() => setProductMatch(false)}
                  className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm flex items-center justify-center gap-2 transition-all ${productMatch === false ? "border-red-500 bg-red-50 text-red-700 dark:bg-red-900/20" : "border-slate-200 text-slate-600 hover:border-red-300 dark:border-slate-700 dark:text-slate-400"}`}
                >
                  <span className="material-symbols-outlined text-sm">cancel</span>Mismatch found 
                </button>
              </div>
            </div>

            <div>
              <label className="label">{productMatch === false ? "Describe Mismatch (Required) *" : "Remarks (Optional)"}</label>
              <textarea
                className="input-base min-h-[80px] resize-none"
                placeholder={productMatch === false ? "Describe what differs from the listing..." : "Any additional observations..."}
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
              />
            </div>
            
            <div>
              <label className="label">Upload Geo-tagged Photo (Optional)</label>
              <div className="space-y-3">
                {!location ? (
                  <button 
                    type="button"
                    onClick={captureLocation}
                    className="w-full py-3 rounded-xl border-2 border-dashed border-[#1E8E3E] text-[#1E8E3E] font-bold text-xs uppercase flex items-center justify-center gap-2 hover:bg-emerald-50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">my_location</span>
                    1. Capture GPS Location
                  </button>
                ) : (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-600">location_on</span>
                      <div>
                        <p className="text-[10px] font-black text-emerald-700 uppercase">Location Captured</p>
                        <p className="text-[10px] text-emerald-600 font-mono">{location.lat.toFixed(6)}, {location.lng.toFixed(6)}</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => setLocation(null)} className="text-emerald-700 hover:text-emerald-900">
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                )}
                
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => setPhoto(e.target.files?.[0] || null)} 
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 dark:file:bg-slate-800 dark:file:text-white" 
                  disabled={!location && !!photo} // Force location capture first if they want to upload
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setCompletionModal({ open: false, auditId: null })}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-800">Cancel</button>
              <button
                onClick={handleComplete}
                disabled={submitting || productMatch === null || (productMatch === false && !remarks.trim())}
                className="px-5 py-2.5 rounded-xl bg-[#1E8E3E] text-white text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center"
              >
                {submitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "Submit Report"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}