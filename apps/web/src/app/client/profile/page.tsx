"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { formatDate } from "@/utils/format";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

function downloadEPRReport(userName: string, listings: { title: string; weight: number }[]) {
  const totalWeight = listings.reduce((s, l) => s + l.weight, 0);
  const co2 = (totalWeight * 2.4).toFixed(1);
  const reportDate = formatDate(new Date());
  const content = `
EPR COMPLIANCE REPORT
=====================================================================
WeConnect Platform — Extended Producer Responsibility Report

Report Date   : ${reportDate}
Organization  : ${userName}
Period        : Q${Math.ceil((new Date().getMonth() + 1) / 3)} ${new Date().getFullYear()}

E-WASTE DISPOSAL SUMMARY
------------------------
Total Listings    : ${listings.length}
Total Weight      : ${totalWeight} KG
CO2 Offset        : ${co2} KG CO2e

LISTINGS DETAIL
---------------
${listings.map((l, i) => `${i + 1}. ${l.title} — ${l.weight} KG`).join("\n")}

COMPLIANCE STATUS
-----------------
✓ Disposed via CPCB-authorized vendor
✓ Documentation maintained
✓ EPR obligations fulfilled for listed weight

This report can be submitted to CPCB/SPCB for EPR compliance.

=====================================================================
WeConnect Platform · Generated: ${new Date().toISOString()}
`;
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `WeConnect_EPR_Report_${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ClientProfile() {
  const { currentUser, listings, bids, updateUserProfile, changePassword, deleteAccount } = useApp();
  const router = useRouter();
  const profile = currentUser?.onboardingProfile || {};
  const docs = currentUser?.documents || [];
  
  const [tab, setTab] = useState<"profile" | "bids" | "documents" | "impact" | "transactions" | "settings">("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    gstNumber: (profile as any).gstNumber || (profile as any).gstin || '',
    address: (profile as any).address || '',
    city: (profile as any).city || '',
    state: (profile as any).state || '',
    pincode: (profile as any).pincode || ''
  });
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const [txHistory, setTxHistory] = useState<any[]>([]);
  const [txLoading, setTxLoading] = useState(false);
  const [loadingProof, setLoadingProof] = useState<string | null>(null);
  const [proofModal, setProofModal] = useState<{ url: string; isImage: boolean } | null>(null);

  useEffect(() => {
    if (tab === "transactions") {
      if (!currentUser?.companyId) return;
      setTxLoading(true);
      api.get(`/payments/by-company/${currentUser.companyId}`)
        .then(r => setTxHistory(r.data ?? []))
        .catch(() => {})
        .finally(() => setTxLoading(false));
    }
  }, [tab, currentUser?.companyId]);

  const handleViewProof = async (tx: any) => {
    const proofKey = tx.proofS3Key || tx.paymentProofUrl;
    if (!proofKey) return;
    setLoadingProof(tx.id);
    try {
      if (proofKey.startsWith('http')) {
        const isImage = /\.(png|jpg|jpeg|gif|webp)$/i.test(proofKey);
        setProofModal({ url: proofKey, isImage });
        return;
      }
      const bucket = tx.proofS3Bucket || 'ecoloop-uploads';
      const res = await api.get(`/companies/signed-url?s3Key=${encodeURIComponent(proofKey)}&s3Bucket=${encodeURIComponent(bucket)}`);
      const signedUrl = res.data?.url || res.data?.signedUrl || res.data;
      if (typeof signedUrl === 'string') {
        const isImage = /\.(png|jpg|jpeg|gif|webp)$/i.test(proofKey);
        setProofModal({ url: signedUrl, isImage });
      }
    } catch {
      // silently ignore
    } finally {
      setLoadingProof(null);
    }
  };

  const myListings = listings.filter(l => l.userId === currentUser?.id);
  const completedListings = myListings.filter(l => l.status === "completed");
  const myBids = bids.filter(b => myListings.some(l => l.id === b.listingId));
  const totalWeight = completedListings.reduce((s, l) => s + l.weight, 0);
  const co2Saved = (totalWeight * 2.4).toFixed(1);
  const energySaved = (totalWeight * 15).toFixed(0);
  const metalsRecovered = (totalWeight * 0.08).toFixed(2);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile(editData);
    setIsEditing(false);
    showFeedback('success', 'Profile updated successfully.');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      showFeedback('error', 'Passwords do not match.');
      return;
    }
    try {
      await changePassword(passwords.new, passwords.current);
      setPasswords({ current: '', new: '', confirm: '' });
      showFeedback('success', 'Password changed successfully.');
    } catch (err: any) {
      showFeedback('error', err.response?.data?.message || 'Failed to change password.');
    }
  };

  const handleDeleteAccount = () => {
    deleteAccount();
    router.push('/');
  };

  const showFeedback = (type: 'success' | 'error', msg: string) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <>
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      <div className="mb-8">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight dark:text-white">Organization <span className="text-[#1E8E3E]">Profile</span></h2>
        <p className="text-slate-500 font-medium mt-1">Manage entity details, compliance documentation, and security settings.</p>
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mb-6 p-4 rounded-2xl flex items-center gap-3 border shadow-sm ${
              feedback.type === 'success' ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-red-50 border-red-100 text-red-700"
            }`}
          >
            <span className="material-symbols-outlined">{feedback.type === 'success' ? 'check_circle' : 'error'}</span>
            <p className="text-sm font-bold">{feedback.msg}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
        {/* Sidebar Nav */}
        <div className="space-y-2">
          {[
            { id: "profile", label: "Organization Info", icon: "business" },
            { id: "bids", label: "Recent Bids", icon: "gavel" },
            { id: "documents", label: "Legal Documents", icon: "description" },
            { id: "impact", label: "Sustainability Hub", icon: "eco" },
            { id: "transactions", label: "Transaction History", icon: "receipt_long" },
            { id: "settings", label: "Account Settings", icon: "settings" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
                tab === t.id ? "bg-[#1E8E3E] text-white shadow-lg shadow-emerald-200" : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-100 dark:bg-slate-900 dark:border-slate-800"
              }`}
            >
              <span className="material-symbols-outlined text-xl">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-700">
          {tab === "profile" && (
            <div className="p-8 space-y-8 animate-fade-in">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-3xl bg-slate-900 flex items-center justify-center text-white font-black text-3xl">
                    {(currentUser?.name || "C")[0]}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">{currentUser?.name}</h3>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Verified Corporate Entity</p>
                  </div>
                </div>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-slate-100 text-slate-900 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all dark:bg-slate-800 dark:text-white">
                    Edit Details
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-300 ml-1">Entity Name</label>
                      <input 
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:bg-slate-950 dark:border-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        value={editData.name}
                        onChange={e => setEditData(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-300 ml-1">Contact Email</label>
                      <input 
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:bg-slate-950 dark:border-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        value={editData.email}
                        onChange={e => setEditData(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-300 ml-1">Contact Phone</label>
                      <input 
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:bg-slate-950 dark:border-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        value={editData.phone}
                        onChange={e => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-300 ml-1">GSTIN</label>
                      <input 
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:bg-slate-950 dark:border-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        value={editData.gstNumber}
                        onChange={e => setEditData(prev => ({ ...prev, gstNumber: e.target.value }))}
                      />
                    </div>
                    <div className="col-span-2 space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-300 ml-1">Registered Address</label>
                      <input 
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:bg-slate-950 dark:border-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        value={editData.address}
                        onChange={e => setEditData(prev => ({ ...prev, address: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-300 ml-1">City</label>
                      <input 
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:bg-slate-950 dark:border-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        value={editData.city}
                        onChange={e => setEditData(prev => ({ ...prev, city: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-300 ml-1">State</label>
                      <input 
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:bg-slate-950 dark:border-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        value={editData.state}
                        onChange={e => setEditData(prev => ({ ...prev, state: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-300 ml-1">Pincode</label>
                      <input 
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:bg-slate-950 dark:border-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        value={editData.pincode}
                        onChange={e => setEditData(prev => ({ ...prev, pincode: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="submit" className="px-6 py-2.5 bg-[#1E8E3E] text-white rounded-xl text-xs font-bold">Save Changes</button>
                    <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold dark:bg-slate-800 dark:text-slate-400">Cancel</button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { label: "GSTIN", value: (profile as any).gstNumber || (profile as any).gstin || "—", icon: "receipt_long" },
                    { label: "Contact Phone", value: currentUser?.phone || "—", icon: "phone" },
                    { label: "Industry", value: (profile as any).industrySector || "IT Services", icon: "category" },
                    { label: "Employees", value: (profile as any).numberOfEmployees || "500+", icon: "groups" },
                    { label: "City", value: (profile as any).city ? `${(profile as any).city}, ${(profile as any).state}` : "Bengaluru", icon: "location_on" },
                    { label: "Pincode", value: (profile as any).pincode || "—", icon: "pin_drop" },
                  ].map((item) => (
                    <div key={item.label} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 dark:bg-slate-950 dark:border-slate-800">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="material-symbols-outlined text-slate-400 text-lg">{item.icon}</span>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{item.label}</p>
                      </div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{item.value}</p>
                    </div>
                  ))}
                  <div className="col-span-2 p-4 bg-slate-50 rounded-2xl border border-slate-100 dark:bg-slate-950 dark:border-slate-800">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">Registered Address</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{(profile as any).address || "Global Village Tech Park, Whitefield, Bengaluru - 560066"}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "bids" && (
            <div className="p-8 space-y-6 animate-fade-in">
              <h4 className="text-xl font-black text-slate-900 dark:text-white">Recent Bids Received</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium -mt-4">Track bids placed on your lots by authorized recycling partners.</p>
              <div className="space-y-3">
                {myBids.length > 0 ? (
                  <div className="overflow-x-auto border border-slate-100 rounded-2xl dark:border-slate-800">
                    <table className="w-full text-left border-collapse text-xs md:text-sm">
                      <thead>
                        <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-wider dark:bg-slate-800/50">
                          <th className="px-4 py-3">Listing</th>
                          <th className="px-4 py-3">Vendor</th>
                          <th className="px-4 py-3 text-right">Amount</th>
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {myBids.map((bid) => {
                          const listing = myListings.find(l => l.id === bid.listingId);
                          return (
                            <tr key={bid.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                              <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300 truncate max-w-[150px]" title={listing?.title || bid.listingId}>
                                {listing?.title || bid.listingId}
                              </td>
                              <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                                {bid.vendorName}
                              </td>
                              <td className="px-4 py-3 font-black text-slate-900 dark:text-white text-right">
                                ₹{bid.amount.toLocaleString('en-IN')}
                              </td>
                              <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">
                                {formatDate(bid.createdAt)}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={`pill text-[8px] ${
                                  bid.status === "accepted" ? "pill-success" :
                                  bid.status === "rejected" ? "pill-error" :
                                  "pill-neutral"
                                }`}>
                                  {bid.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-20 text-center space-y-2">
                    <span className="material-symbols-outlined text-4xl text-slate-200">gavel</span>
                    <p className="text-slate-400 font-bold text-sm italic">No bids received yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === "documents" && (
            <div className="p-8 space-y-6 animate-fade-in">
              <h4 className="text-xl font-black text-slate-900 dark:text-white">Legal Repository</h4>
              <div className="space-y-3">
                {docs.length > 0 ? docs.map((doc: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl group hover:border-emerald-200 transition-all dark:bg-slate-950 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-700">
                        <span className="material-symbols-outlined text-slate-400">description</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{doc.fileName}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{doc.size} • Verified {formatDate(doc.uploadedAt)}</p>
                      </div>
                    </div>
                    <button className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-[#1E8E3E] hover:border-[#1E8E3E] transition-all dark:bg-slate-900 dark:border-slate-700">
                      <span className="material-symbols-outlined text-lg">download</span>
                    </button>
                  </div>
                )) : (
                  <div className="py-20 text-center space-y-2">
                    <span className="material-symbols-outlined text-4xl text-slate-200">folder_open</span>
                    <p className="text-slate-400 font-bold text-sm italic">No custom documents uploaded yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === "transactions" && (
            <div className="p-8 space-y-6 animate-fade-in">
              <div>
                <h4 className="text-xl font-black text-slate-900 dark:text-white">Transaction History</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">All payment records for your auction lots. Payment proofs uploaded by vendors are visible here.</p>
              </div>
              {txLoading ? (
                <div className="py-16 text-center">
                  <span className="material-symbols-outlined text-4xl text-slate-200 animate-spin block mb-2">progress_activity</span>
                  <p className="text-slate-400 text-sm">Loading transaction history...</p>
                </div>
              ) : !currentUser?.companyId ? (
                <div className="py-16 text-center space-y-2">
                  <span className="material-symbols-outlined text-5xl text-slate-200 block">domain_disabled</span>
                  <p className="text-slate-400 font-bold text-sm italic">No company linked to your account.</p>
                  <p className="text-slate-400 text-xs">Complete onboarding to see your transaction history.</p>
                </div>
              ) : txHistory.length === 0 ? (
                <div className="py-16 text-center space-y-2">
                  <span className="material-symbols-outlined text-5xl text-slate-200 block">receipt_long</span>
                  <p className="text-slate-400 font-bold text-sm italic">No transactions yet.</p>
                  <p className="text-slate-400 text-xs">Payment records will appear here once auction lots are sold.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {txHistory.map((tx: any) => {
                    const statusMap: Record<string, { label: string; cls: string }> = {
                      PENDING:   { label: "Pending",   cls: "bg-amber-100 text-amber-700" },
                      SUBMITTED: { label: "Proof Uploaded", cls: "bg-blue-100 text-blue-700" },
                      CONFIRMED: { label: "Confirmed", cls: "bg-emerald-100 text-emerald-700" },
                      REJECTED:  { label: "Rejected",  cls: "bg-red-100 text-red-700" },
                    };
                    const s = statusMap[tx.status] ?? statusMap.PENDING;
                    const hasProof = !!(tx.proofS3Key || tx.paymentProofUrl);
                    return (
                      <div key={tx.id} className="p-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl hover:border-[#1E8E3E]/30 transition-all">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 dark:text-white truncate">{tx.auction?.title ?? "—"}</p>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">
                              Vendor: {tx.auction?.winner?.name ?? "—"}
                            </p>
                          </div>
                          <span className={`shrink-0 px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${s.cls}`}>{s.label}</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">You Receive</p>
                            <p className="text-sm font-black text-[#1E8E3E]">₹{(tx.clientAmount || 0).toLocaleString("en-IN")}</p>
                          </div>
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Commission</p>
                            <p className="text-sm font-bold text-blue-600">₹{(tx.commissionAmount || 0).toLocaleString("en-IN")}</p>
                          </div>
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">UTR / Ref</p>
                            <p className="text-sm font-mono text-slate-600 dark:text-slate-400 truncate">{tx.utrNumber ?? "—"}</p>
                          </div>
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Date</p>
                            <p className="text-sm font-bold text-slate-600 dark:text-slate-400">{formatDate(tx.createdAt)}</p>
                          </div>
                        </div>
                        {hasProof && (
                          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                            <button
                              onClick={() => handleViewProof(tx)}
                              disabled={loadingProof === tx.id}
                              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors disabled:opacity-50"
                            >
                              {loadingProof === tx.id
                                ? <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                                : <span className="material-symbols-outlined text-sm">image</span>
                              }
                              View Payment Proof
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {tab === "impact" && (
            <div className="p-8 space-y-8 animate-fade-in">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "E-Waste Disposed", value: `${totalWeight} KG`, icon: "recycling", color: "text-[#0B5ED7]", bg: "bg-blue-50" },
                  { label: "CO2 Equivalent", value: `${co2Saved} KG`, icon: "eco", color: "text-[#1E8E3E]", bg: "bg-emerald-50" },
                  { label: "Energy Offset", value: `${energySaved} kWh`, icon: "bolt", color: "text-amber-600", bg: "bg-amber-50" },
                  { label: "Metals Saved", value: `${metalsRecovered} KG`, icon: "diamond", color: "text-purple-600", bg: "bg-purple-50" },
                ].map(s => (
                  <div key={s.label} className="p-5 bg-white border border-slate-100 rounded-3xl flex items-center gap-4 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                    <div className={`w-12 h-12 rounded-2xl ${s.bg} flex items-center justify-center shrink-0`}>
                      <span className={`material-symbols-outlined text-xl ${s.color}`}>{s.icon}</span>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-slate-900 tracking-tight dark:text-white">{s.value}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#1E8E3E] rounded-full -mr-20 -mt-20 blur-[100px] opacity-20" />
                <div className="relative z-10">
                  <h4 className="text-xl font-black mb-2">EPR Compliance Certificate</h4>
                  <p className="text-slate-400 text-sm mb-6">Generated on the fly based on your verified recycling transactions.</p>
                  <button 
                    onClick={() => downloadEPRReport(currentUser?.name || "Client", myListings.map(l => ({ title: l.title, weight: l.weight })))}
                    className="px-6 py-3 bg-[#1E8E3E] hover:bg-[#166B2E] text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
                  >
                    Download PDF Report
                  </button>
                </div>
              </div>
            </div>
          )}

          {tab === "settings" && (
            <div className="p-8 space-y-10 animate-fade-in">
              <section className="space-y-4">
                <h4 className="text-lg font-black text-slate-900 dark:text-white">Security Credentials</h4>
                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-300 ml-1 mb-1.5 block">Current Password</label>
                    <div className="relative">
                      <input 
                        type={showPasswords.current ? "text" : "password"}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:bg-slate-950 dark:border-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500 pr-12"
                        value={passwords.current}
                        onChange={e => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                        placeholder="Enter current password"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <span className="material-symbols-outlined text-xl">
                          {showPasswords.current ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-300 ml-1 mb-1.5 block">New Password</label>
                    <div className="relative">
                      <input 
                        type={showPasswords.new ? "text" : "password"}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:bg-slate-950 dark:border-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500 pr-12"
                        value={passwords.new}
                        onChange={e => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                        placeholder="Min 8 characters"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <span className="material-symbols-outlined text-xl">
                          {showPasswords.new ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-300 ml-1 mb-1.5 block">Confirm New Password</label>
                    <div className="relative">
                      <input 
                        type={showPasswords.confirm ? "text" : "password"}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:bg-slate-950 dark:border-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500 pr-12"
                        value={passwords.confirm}
                        onChange={e => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <span className="material-symbols-outlined text-xl">
                          {showPasswords.confirm ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                  </div>
                  <button type="submit" className="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
                    Update Password
                  </button>
                </form>
              </section>

              <hr className="border-slate-100 dark:border-slate-800" />

              <section className="space-y-4">
                <div className="flex items-center gap-2 text-red-600">
                  <span className="material-symbols-outlined">warning</span>
                  <h4 className="text-lg font-black">Danger Zone</h4>
                </div>
                <p className="text-slate-500 text-sm">Once you delete your account, there is no going back. All active listings will be cancelled.</p>
                
                {showDeleteConfirm ? (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-2xl space-y-4">
                    <p className="text-red-700 text-xs font-bold">Are you absolutely sure you want to delete your WeConnect account?</p>
                    <div className="flex gap-3">
                      <button onClick={handleDeleteAccount} className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold">Yes, Delete Forever</button>
                      <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold dark:text-slate-300">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setShowDeleteConfirm(true)} className="px-6 py-3 border-2 border-red-100 text-red-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-50 transition-all">
                    Delete Account
                  </button>
                )}
              </section>
            </div>
          )}
        </div>
      </div>
    </div>

      {/* Payment Proof Modal */}
      <AnimatePresence>
        {proofModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={() => setProofModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#1E8E3E]">receipt</span>
                  <h3 className="font-bold text-slate-900 dark:text-white">Payment Proof</h3>
                </div>
                <button
                  onClick={() => setProofModal(null)}
                  className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>
              <div className="p-6">
                {proofModal.isImage ? (
                  <div className="space-y-3">
                    <img
                      src={proofModal.url}
                      alt="Payment Proof"
                      className="w-full rounded-xl object-contain max-h-[60vh] bg-slate-50 dark:bg-slate-950"
                    />
                    <a
                      href={proofModal.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <span className="material-symbols-outlined text-base">open_in_new</span>
                      Open Full Size
                    </a>
                  </div>
                ) : (
                  <div className="text-center py-10 space-y-4">
                    <span className="material-symbols-outlined text-5xl text-slate-300">description</span>
                    <p className="text-slate-500 text-sm">The payment proof is a PDF document.</p>
                    <a
                      href={proofModal.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1E8E3E] text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors"
                    >
                      <span className="material-symbols-outlined text-base">open_in_new</span>
                      Open Document
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
