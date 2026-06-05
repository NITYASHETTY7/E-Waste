"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { useApp } from "@/context/AppContext";
import { motion, AnimatePresence } from "framer-motion";

export default function TransactionHistory() {
  const { currentUser } = useApp();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{msg: string, type: "success" | "error"} | null>(null);
  const [proofModal, setProofModal] = useState<{ url: string; isImage: boolean } | null>(null);
  const [loadingProof, setLoadingProof] = useState<string | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchPayments = useCallback(async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const url = currentUser.role === 'vendor' 
        ? `/payments/by-company/${currentUser.companyId}`
        : `/payments/by-user/${currentUser.id}`;
      const res = await api.get(url);
      setPayments(res.data);
    } catch {
      showToast("Failed to fetch transaction history", "error");
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleViewProof = async (payment: any) => {
    const proofKey = payment.proofS3Key || payment.paymentProofUrl;
    if (!proofKey) return;
    setLoadingProof(payment.id);
    try {
      if (proofKey.startsWith('http')) {
        const isImage = /\.(png|jpg|jpeg|gif|webp)$/i.test(proofKey);
        setProofModal({ url: proofKey, isImage });
        return;
      }
      const bucket = payment.proofS3Bucket || 'ecoloop-uploads';
      const res = await api.get(`/companies/signed-url?s3Key=${encodeURIComponent(proofKey)}&s3Bucket=${encodeURIComponent(bucket)}`);
      const signedUrl = res.data?.url || res.data?.signedUrl || res.data;
      if (typeof signedUrl === 'string') {
        const isImage = /\.(png|jpg|jpeg|gif|webp)$/i.test(proofKey);
        setProofModal({ url: signedUrl, isImage });
      } else {
        showToast("Could not retrieve proof URL.", "error");
      }
    } catch {
      showToast("Failed to load proof.", "error");
    } finally {
      setLoadingProof(null);
    }
  };

  const statusMeta = (status?: string) => {
    if (status === "CONFIRMED") return { color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", label: "Confirmed" };
    if (status === "SUBMITTED") return { color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", label: "Processing" };
    return { color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", label: "Pending" };
  };

  return (
    <>
      <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative pb-20">
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
          <h2 className="text-3xl font-headline font-extrabold tracking-tight text-[color:var(--color-on-surface)]">Transaction History</h2>
          <p className="text-[color:var(--color-on-surface-variant)] mt-1">Track your payments and settlements.</p>
        </div>

        {loading ? (
          <div className="flex justify-center p-20">
            <div className="w-8 h-8 border-4 border-[#1E8E3E] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : payments.length === 0 ? (
          <div className="card p-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
            <span className="material-symbols-outlined text-5xl text-slate-300 block mb-3">receipt_long</span>
            <p className="font-bold text-slate-600 dark:text-slate-400">No transactions found</p>
          </div>
        ) : (
          <div className="card overflow-hidden border border-slate-100 dark:border-slate-800">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {payments.map(payment => {
                const meta = statusMeta(payment.status);
                const auction = payment.auction;
                const hasProof = !!(payment.proofS3Key || payment.paymentProofUrl);
                const isIndividual = !!payment.product;
                const isPenalty = payment.isPenalty;
                
                const itemName = isIndividual ? payment.product?.name : (isPenalty ? 'Penalty Payment' : auction?.title || "Unknown Auction");
                const itemRef = isIndividual ? payment.product?.id?.substring(0, 8) : (isPenalty ? 'PENALTY' : auction?.id?.substring(0, 8) || '—');
                
                const totalAmount = isIndividual 
                  ? (payment.product?.quotes?.[0]?.offeredPrice || payment.product?.askingPrice || 0)
                  : (payment.totalAmount || 0);

                return (
                  <div key={payment.id} className="p-5 flex items-start justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                          {itemRef}
                        </span>
                        <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase ${meta.color}`}>{meta.label}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 truncate dark:text-white">
                        {itemName}
                      </h3>
                      <div className="flex gap-4 mt-2 flex-wrap">
                        <span className="text-xs text-slate-500">
                          Total Amount: <span className={`font-bold ${isPenalty ? 'text-red-600 dark:text-red-500' : 'text-[#1E8E3E] dark:text-emerald-500'}`}>₹{totalAmount.toLocaleString()}</span>
                        </span>
                        {!isIndividual && !isPenalty && currentUser?.role !== 'vendor' && (
                          <span className="text-xs text-slate-500">
                            Net Received: <span className="font-bold text-slate-700 dark:text-slate-300">₹{(payment.clientAmount || 0).toLocaleString()}</span>
                          </span>
                        )}
                        {!isIndividual && !isPenalty && currentUser?.role === 'vendor' && (
                          <span className="text-xs text-slate-500">
                            Commission Paid: <span className="font-bold text-slate-700 dark:text-slate-300">₹{(payment.commissionAmount || 0).toLocaleString()}</span>
                          </span>
                        )}
                      </div>

                      {(payment.status === "SUBMITTED" || payment.status === "CONFIRMED") && (
                        <div className="mt-2 flex items-center gap-3 flex-wrap">
                          {payment.utrNumber && (
                            <p className="text-xs text-slate-500">
                              UTR: <span className="font-bold font-mono">{payment.utrNumber}</span>
                            </p>
                          )}
                          {payment.paymentSubmittedAt && (
                            <p className="text-xs text-slate-500">
                              Submitted: <span className="font-bold">{new Date(payment.paymentSubmittedAt).toLocaleDateString("en-IN")}</span>
                            </p>
                          )}
                          {hasProof && (
                            <button
                              onClick={() => handleViewProof(payment)}
                              disabled={loadingProof === payment.id}
                              className="text-xs text-[#1E8E3E] dark:text-emerald-400 hover:underline flex items-center gap-1 disabled:opacity-50"
                            >
                              {loadingProof === payment.id
                                ? <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                                : <span className="material-symbols-outlined text-sm">image</span>
                              }
                              View Proof
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

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
                  <h3 className="font-headline font-extrabold text-slate-900 dark:text-white">Payment Proof</h3>
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
                    <p className="text-slate-500 text-sm">This proof is a PDF or non-image document.</p>
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
