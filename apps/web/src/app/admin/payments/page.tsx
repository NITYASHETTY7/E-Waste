"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status Toast
  const [toast, setToast] = useState<{msg: string, type: "success" | "error"} | null>(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/payments');
      setPayments(res.data);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load payments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleVerify = async (paymentId: string) => {
    try {
      await api.patch(`/admin/payments/${paymentId}/verify`);
      showToast("Payment verified successfully.");
      fetchPayments();
    } catch (err: any) {
      showToast(err.response?.data?.message || "Verification failed.", "error");
    }
  };

  const statusMeta = (status?: string) => {
    if (status === "CONFIRMED") return { color: "bg-emerald-100 text-emerald-700", label: "Confirmed" };
    if (status === "SUBMITTED") return { color: "bg-blue-100 text-blue-700", label: "Proof Uploaded" };
    return { color: "bg-amber-100 text-amber-700", label: "Awaiting Payment" };
  };

  const stats = {
    total: payments.length,
    pending: payments.filter(p => p.status === "PENDING").length,
    proofUploaded: payments.filter(p => p.status === "SUBMITTED").length,
    confirmed: payments.filter(p => p.status === "CONFIRMED").length,
    totalValue: payments.filter(p => p.status === "CONFIRMED").reduce((s, p) => s + p.totalAmount, 0),
  };

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

      <div>
        <h2 className="text-3xl font-headline font-extrabold tracking-tight text-[color:var(--color-on-surface)]">Payment Management</h2>
        <p className="text-[color:var(--color-on-surface-variant)] mt-1">Monitor vendor payment submissions and confirm settlements.</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Deals", value: stats.total, icon: "payments", color: "text-blue-600 bg-blue-50" },
          { label: "Awaiting Payment", value: stats.pending, icon: "hourglass_empty", color: "text-amber-600 bg-amber-50" },
          { label: "Proof Submitted", value: stats.proofUploaded, icon: "upload_file", color: "text-purple-600 bg-purple-50" },
          { label: "Confirmed", value: stats.confirmed, icon: "verified", color: "text-[#1E8E3E] bg-emerald-50 dark:bg-emerald-900/10 dark:text-emerald-500" },
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

      {loading ? (
        <div className="flex justify-center p-20">
          <div className="w-8 h-8 border-4 border-[#1E8E3E] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : payments.length === 0 ? (
        <div className="card p-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
          <span className="material-symbols-outlined text-5xl text-slate-300 block mb-3">payments</span>
          <p className="font-bold text-slate-600 dark:text-slate-400">No payments to review yet</p>
        </div>
      ) : (
        <div className="card overflow-hidden border border-slate-100 dark:border-slate-800">      
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {payments.map(payment => {
              const meta = statusMeta(payment.status);
              const auction = payment.auction;

              return (
                <div key={payment.id} className="p-5 flex items-start justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest">REQ: {auction?.id.substring(0,8)}</span>     
                      <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase ${meta.color}`}>{meta.label}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 truncate dark:text-white">{auction?.title || "Unknown Auction"}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Client: {auction?.client?.name || "—"} · Vendor: {auction?.winner?.name || "—"}</p>

                    <div className="flex gap-4 mt-2">
                      <span className="text-xs text-slate-500">Bid: <span className="font-bold text-primary dark:text-emerald-500">₹{payment.totalAmount.toLocaleString()}</span></span>
                      <span className="text-xs text-slate-500">Commission: <span className="font-bold">₹{payment.commissionAmount.toLocaleString()}</span></span>
                    </div>

                    {payment.status === "SUBMITTED" && (
                      <div className="mt-2 flex items-center gap-3">
                        <p className="text-xs text-slate-500">UTR: <span className="font-bold font-mono">{payment.utrNumber || "—"}</span></p>
                        {payment.paymentProofUrl && (
                          <a href={payment.paymentProofUrl} download className="text-xs text-primary dark:text-emerald-500 hover:underline flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">download</span>View Proof
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="shrink-0">
                    {payment.status === "SUBMITTED" && (
                      <button
                        onClick={() => handleVerify(payment.id)}
                        className="px-5 py-2.5 rounded-xl bg-[#1E8E3E] text-white text-xs font-black uppercase hover:bg-emerald-700"
                      >
                        Verify Payment
                      </button>
                    )}
                    {payment.status === "CONFIRMED" && (
                      <span className="material-symbols-outlined text-2xl text-[#1E8E3E]">verified</span>
                    )}
                    {payment.status === "PENDING" && (
                      <span className="text-xs text-slate-400 font-bold">Awaiting vendor</span>   
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}