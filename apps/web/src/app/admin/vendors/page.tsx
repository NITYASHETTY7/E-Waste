"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import DecisionModal from "@/components/admin/DecisionModal";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminVendors() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{msg: string, type: "success" | "error"} | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "APPROVED" | "PENDING" | "REJECTED">("all");
  const [selectedVendor, setSelectedVendor] = useState<any | null>(null);
  const [vendorDocs, setVendorDocs] = useState<any[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  const handleViewDocuments = async (vendor: any) => {
    setSelectedVendor(vendor);
    setLoadingDocs(true);
    try {
      const res = await api.get(`/companies/${vendor.id}`);
      setVendorDocs(res.data?.kycDocuments || []);
    } catch (err) {
      console.error(err);
      showToast("Failed to fetch documents.", "error");
    } finally {
      setLoadingDocs(false);
    }
  };
  
  // Modals
  const [lockModal, setLockModal] = useState<{ isOpen: boolean, vendorId: string | null }>({ isOpen: false, vendorId: null });
  const [penaltyModal, setPenaltyModal] = useState<{ isOpen: boolean, vendorId: string | null }>({ isOpen: false, vendorId: null });
  const [lockReason, setLockReason] = useState("");
  const [penaltyAmount, setPenaltyAmount] = useState("");
  const [penaltyReason, setPenaltyReason] = useState("");

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const res = await api.get('/companies?type=VENDOR');
      setVendors(res.data);
    } catch (err: any) {
      console.error(err);
      showToast("Failed to load vendors.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLock = async () => {
    if (!lockModal.vendorId || !lockReason.trim()) return;
    try {
      await api.patch(`/companies/admin/${lockModal.vendorId}/lock`, { reason: lockReason });
      showToast("Vendor locked successfully.");
      setLockModal({ isOpen: false, vendorId: null });
      setLockReason("");
      fetchVendors();
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to lock vendor.", "error");
    }
  };

  const handleApprove = async (userId: string) => {
    try {
      await api.patch(`/users/${userId}/approve`);
      showToast("Vendor approved successfully.");
      fetchVendors();
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to approve vendor.", "error");
    }
  };

  const handleReject = async (userId: string) => {
    if (!confirm("Are you sure you want to reject this vendor?")) return;
    try {
      await api.patch(`/users/${userId}/reject`);
      showToast("Vendor rejected successfully.");
      fetchVendors();
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to reject vendor.", "error");
    }
  };

  const handleUnlock = async (id: string) => {
    try {
      await api.patch(`/companies/admin/${id}/unlock`);
      showToast("Vendor unlocked successfully.");
      fetchVendors();
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to unlock vendor.", "error");
    }
  };

  const handlePenalty = async () => {
    if (!penaltyModal.vendorId || !penaltyAmount || !penaltyReason.trim()) return;
    try {
      await api.post(`/companies/admin/${penaltyModal.vendorId}/penalty`, { amount: Number(penaltyAmount), reason: penaltyReason });
      showToast("Penalty applied successfully.");
      setPenaltyModal({ isOpen: false, vendorId: null });
      setPenaltyAmount("");
      setPenaltyReason("");
      fetchVendors();
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to apply penalty.", "error");
    }
  };

  const stats = {
    total: vendors.length,
    active: vendors.filter(v => v.status === "APPROVED" && !v.isLocked).length,
    pending: vendors.filter(v => v.status === "PENDING").length,
    locked: vendors.filter(v => v.isLocked).length,
  };

  const filtered = vendors
    .filter(v => statusFilter === "all" || v.status === statusFilter)
    .filter(v => v.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 max-w-7xl mx-auto relative pb-20">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 px-6 py-3 rounded-xl shadow-xl z-50 text-white font-bold text-sm ${toast.type === "success" ? "bg-[#1E8E3E]" : "bg-red-600"}`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <h2 className="text-3xl font-headline font-extrabold tracking-tight text-[color:var(--color-on-surface)]">Vendor Management</h2>
        <p className="text-[color:var(--color-on-surface-variant)] mt-1">Review vendor applications, monitor performance, and manage risk controls.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Vendors", value: stats.total, icon: "corporate_fare", color: "text-blue-600 bg-blue-50" },
          { label: "Active", value: stats.active, icon: "verified", color: "text-[#1E8E3E] bg-emerald-50" },
          { label: "Pending Review", value: stats.pending, icon: "pending_actions", color: "text-amber-600 bg-amber-50" },
          { label: "Locked", value: stats.locked, icon: "lock", color: "text-red-600 bg-red-50" },
        ].map(s => (
          <div key={s.label} className="card p-5 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                <span className="material-symbols-outlined text-lg">{s.icon}</span>
              </div>
              <div>
                <p className="text-2xl font-black text-[color:var(--color-on-surface)]">{s.value}</p>
                <p className="text-xs text-[color:var(--color-on-surface-variant)] font-medium">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input
            type="text"
            placeholder="Search vendors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#1E8E3E]/20 focus:border-[#1E8E3E] transition-all"
          />
        </div>
        <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl w-full sm:w-fit">
          {(["all", "APPROVED", "PENDING", "REJECTED"] as const).map(f => (
            <button key={f} onClick={() => setStatusFilter(f)}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                statusFilter === f ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
         <div className="flex justify-center p-20">
           <div className="w-8 h-8 border-4 border-[#1E8E3E] border-t-transparent rounded-full animate-spin" />
         </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map(vendor => (
            <div key={vendor.id} className="card p-0 overflow-hidden border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row">
              <div className="p-6 md:w-1/3 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-headline font-black text-xl shrink-0">
                    {vendor.name.charAt(0)}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase ${
                      vendor.status === "APPROVED" ? "bg-emerald-100 text-emerald-700" :
                      vendor.status === "REJECTED" ? "bg-red-100 text-red-700" :
                      "bg-amber-100 text-amber-700"
                    }`}>
                      {vendor.status}
                    </span>
                    {vendor.isLocked && (
                      <span className="text-[10px] px-2.5 py-1 rounded-full font-black uppercase bg-red-600 text-white flex items-center gap-1 shadow-sm">
                        <span className="material-symbols-outlined text-[10px]">lock</span> LOCKED
                      </span>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight mb-1">{vendor.name}</h3>
                  <p className="text-xs text-slate-500 mb-3">ID: {vendor.id.substring(0,8)}</p>
                  
                  <div className="space-y-1.5 mt-4">
                    <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm text-slate-400">mail</span> {vendor.users?.[0]?.email || "No email"}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm text-slate-400">location_on</span> {vendor.city || "No city"}, {vendor.state || "No state"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Rating</p>
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span className="font-bold text-slate-900 dark:text-white">{vendor.rating?.toFixed(1) || "New"}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">GST No.</p>
                      <p className="font-bold text-sm text-slate-900 dark:text-white font-mono">{vendor.gstNumber || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">PAN No.</p>
                      <p className="font-bold text-sm text-slate-900 dark:text-white font-mono">{vendor.panNumber || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Penalties</p>
                      <p className="font-bold text-sm text-red-600">₹{(vendor.penaltyAmount || 0).toLocaleString()}</p>
                    </div>
                  </div>

                  {vendor.isLocked && vendor.lockReason && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl mb-4 dark:bg-red-900/10 dark:border-red-900/50">
                      <p className="text-xs font-bold text-red-800 flex items-center gap-1 mb-1 dark:text-red-400">
                        <span className="material-symbols-outlined text-sm">warning</span> Lock Reason
                      </p>
                      <p className="text-sm text-red-700 dark:text-red-300">{vendor.lockReason}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex-wrap">
                  {vendor.status === 'PENDING' ? (
                    <div className="flex gap-2 w-full justify-end">
                      <button onClick={() => handleApprove(vendor.users?.[0]?.id)} className="flex items-center gap-1 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-all">
                        <span className="material-symbols-outlined text-sm">check_circle</span> Approve
                      </button>
                      <button onClick={() => showToast("Vendor placed on hold", "success")} className="flex items-center gap-1 px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-xs font-bold hover:bg-amber-100 transition-all">
                        <span className="material-symbols-outlined text-sm">pause_circle</span> Hold
                      </button>
                      <button onClick={() => handleReject(vendor.users?.[0]?.id)} className="flex items-center gap-1 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-bold hover:bg-red-100 transition-all">
                        <span className="material-symbols-outlined text-sm">block</span> Reject
                      </button>
                    </div>
                  ) : vendor.status === 'APPROVED' ? (
                    <>
                      <button onClick={() => handleViewDocuments(vendor)} className="btn-outline px-4 py-2 text-xs rounded-xl">
                        View Documents
                      </button>

                      <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2 hidden sm:block"></div>

                      <button
                        onClick={() => setPenaltyModal({ isOpen: true, vendorId: vendor.id })}
                        className="flex items-center gap-1.5 px-4 py-2 bg-orange-50 text-orange-700 border border-orange-200 rounded-xl text-xs font-bold hover:bg-orange-100 transition-all dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-400"
                      >
                        <span className="material-symbols-outlined text-sm">gavel</span>
                        Apply Penalty
                      </button>

                      {vendor.isLocked ? (
                        <button
                          onClick={() => handleUnlock(vendor.id)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-all dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400"
                        >
                          <span className="material-symbols-outlined text-sm">lock_open</span>
                          Unlock Vendor
                        </button>
                      ) : (
                        <button
                          onClick={() => setLockModal({ isOpen: true, vendorId: vendor.id })}
                          className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-bold hover:bg-red-100 transition-all dark:bg-red-900/20 dark:border-red-800 dark:text-red-400"
                        >
                          <span className="material-symbols-outlined text-sm">lock</span>
                          Lock Vendor
                        </button>
                      )}
                    </>
                  ) : (
                    <span className="text-xs font-bold text-slate-400">Rejected Vendor</span>
                  )}
                </div>              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lock Modal */}
      {lockModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-xl font-headline font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-red-600">lock</span> Lock Vendor Account
            </h3>
            <p className="text-sm text-slate-500">Locking a vendor will immediately prevent them from participating in any active or future auctions.</p>
            <div>
              <label className="label">Reason for Locking *</label>
              <textarea 
                className="input-base min-h-[100px] resize-none" 
                placeholder="Detail the compliance violation or issue..."
                value={lockReason}
                onChange={e => setLockReason(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setLockModal({isOpen: false, vendorId: null})} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
              <button onClick={handleLock} disabled={!lockReason.trim()} className="px-5 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 disabled:opacity-50">Confirm Lock</button>
            </div>
          </div>
        </div>
      )}

      {/* Document Modal */}
      {selectedVendor && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl p-6 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-headline font-extrabold text-slate-900 dark:text-white">Vendor Documents</h3>
                <p className="text-sm text-slate-500 mt-1">{selectedVendor.name} • {selectedVendor.gstNumber || 'No GST'}</p>
              </div>
              <button onClick={() => { setSelectedVendor(null); setVendorDocs([]); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4">
              {loadingDocs ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4" />
                  <p className="text-slate-500 text-sm">Loading documents...</p>
                </div>
              ) : vendorDocs.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  <span className="material-symbols-outlined text-4xl text-slate-300 mb-2 block">description</span>
                  <p className="text-slate-500 text-sm">No documents uploaded by this vendor.</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {vendorDocs.map((doc, idx) => (
                    <div key={doc.id || idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                          <span className="material-symbols-outlined text-emerald-600">
                            {doc.type === 'CPCB_CERTIFICATE' ? 'verified' : doc.type === 'GST_CERTIFICATE' ? 'receipt_long' : 'description'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{doc.type.replace(/_/g, ' ')}</p>
                          <p className="text-xs text-slate-500 uppercase tracking-wider">{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <a href={doc.signedUrl || doc.fileUrl || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <span className="material-symbols-outlined text-sm">download</span>
                        View
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button onClick={() => { setSelectedVendor(null); setVendorDocs([]); }} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-800">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}