"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  requested:     { label: "Requested",   cls: "bg-amber-100 text-amber-700" },
  in_progress:   { label: "In Progress", cls: "bg-blue-100 text-blue-700" },
  completed:     { label: "Completed",   cls: "bg-emerald-100 text-emerald-700" },
  cancelled:     { label: "Cancelled",   cls: "bg-red-100 text-red-700" },
};

export default function UserProfilePage() {
  const { currentUser, changePassword } = useApp();

  const [tab, setTab] = useState<"profile" | "transactions" | "settings">("profile");
  const [txHistory, setTxHistory] = useState<any[]>([]);
  const [txLoading, setTxLoading] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const showFeedback = (type: "success" | "error", msg: string) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 3500);
  };

  useEffect(() => {
    if (tab === "transactions" && currentUser?.id) {
      setTxLoading(true);
      api.get(`/payments/by-user/${currentUser.id}`)
        .then(r => setTxHistory(r.data ?? []))
        .catch(() => {})
        .finally(() => setTxLoading(false));
    }
  }, [tab, currentUser?.id]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      showFeedback("error", "Passwords do not match.");
      return;
    }
    if (passwords.new.length < 8) {
      showFeedback("error", "New password must be at least 8 characters.");
      return;
    }
    try {
      await changePassword(passwords.new, passwords.current);
      setPasswords({ current: "", new: "", confirm: "" });
      showFeedback("success", "Password changed successfully.");
    } catch (err: any) {
      showFeedback("error", err.response?.data?.message || "Failed to change password.");
    }
  };

  const fields = [
    { label: "Full Name",  value: currentUser?.name,  icon: "person" },
    { label: "Email",      value: currentUser?.email, icon: "mail" },
    { label: "Phone",      value: (currentUser as any)?.phone ?? "—", icon: "phone" },
    { label: "Role",       value: "Individual User",  icon: "badge" },
  ];

  const navItems = [
    { id: "profile",      label: "My Profile",           icon: "person" },
    { id: "transactions", label: "Transaction History",  icon: "receipt_long" },
    { id: "settings",     label: "Security",             icon: "lock" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">My <span className="text-violet-600">Profile</span></h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Manage your account information and transaction history.</p>
      </motion.div>

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`mb-6 p-4 rounded-2xl flex items-center gap-3 border shadow-sm ${
              feedback.type === "success" ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-red-50 border-red-100 text-red-700"
            }`}
          >
            <span className="material-symbols-outlined">{feedback.type === "success" ? "check_circle" : "error"}</span>
            <p className="text-sm font-bold">{feedback.msg}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        {/* Sidebar */}
        <div className="space-y-2">
          {navItems.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
                tab === t.id
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-200 dark:shadow-violet-900/30"
                  : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-100 dark:bg-slate-900 dark:border-slate-800"
              }`}
            >
              <span className="material-symbols-outlined text-xl">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">

          {/* Profile Tab */}
          {tab === "profile" && (
            <div className="p-8 animate-fade-in">
              <div className="flex items-center gap-5 mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="w-18 h-18 w-[72px] h-[72px] rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
                  <span className="text-3xl font-black text-violet-600">{currentUser?.name?.[0]?.toUpperCase() ?? "U"}</span>
                </div>
                <div>
                  <p className="font-black text-2xl text-slate-900 dark:text-white">{currentUser?.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{currentUser?.email}</p>
                  <span className="mt-1.5 inline-block px-3 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-[10px] font-black uppercase tracking-widest rounded-full">
                    Individual User
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {fields.map(f => (
                  <div key={f.label} className="flex items-center justify-between py-3.5 px-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-slate-400 text-base">{f.icon}</span>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{f.label}</p>
                    </div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{f.value ?? "—"}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transaction History Tab */}
          {tab === "transactions" && (
            <div className="p-8 space-y-6 animate-fade-in">
              <div>
                <h4 className="text-xl font-black text-slate-900 dark:text-white">Transaction History</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Your product pickup & recycling transactions with certified vendors.
                </p>
              </div>

              {txLoading ? (
                <div className="py-16 text-center">
                  <span className="material-symbols-outlined text-4xl text-slate-200 animate-spin block mb-2">progress_activity</span>
                  <p className="text-slate-400 text-sm">Loading your transactions...</p>
                </div>
              ) : txHistory.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <span className="material-symbols-outlined text-5xl text-slate-200 block">receipt_long</span>
                  <p className="text-slate-400 font-bold text-sm italic">No transactions yet.</p>
                  <p className="text-slate-400 text-xs">Pickup records appear here after a vendor collects your e-waste.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {txHistory.map((tx: any) => {
                    const acceptedQuote = tx.product?.quotes?.[0];
                    const statusInfo = STATUS_MAP[tx.status] ?? { label: tx.status, cls: "bg-slate-100 text-slate-600" };
                    return (
                      <div key={tx.id} className="p-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl hover:border-violet-200 dark:hover:border-violet-800 transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                              <span className="material-symbols-outlined text-violet-600 text-lg">recycling</span>
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white text-sm">{tx.product?.name ?? "Product"}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                {tx.product?.weightKg} kg · {tx.vendorCompany?.name ?? acceptedQuote?.vendorCompany?.name ?? "Vendor"}
                              </p>
                            </div>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${statusInfo.cls}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Offered Price</p>
                            <p className="text-sm font-black text-violet-600">
                              ₹{(acceptedQuote?.offeredPrice ?? tx.product?.askingPrice ?? 0).toLocaleString("en-IN")}
                            </p>
                          </div>
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Pickup Date</p>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                              {tx.scheduledDate ? new Date(tx.scheduledDate).toLocaleDateString("en-IN") : "—"}
                            </p>
                          </div>
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Initiated</p>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                              {new Date(tx.createdAt).toLocaleDateString("en-IN")}
                            </p>
                          </div>
                        </div>
                        {tx.notes && (
                          <p className="mt-3 text-xs text-slate-500 italic border-t border-slate-100 dark:border-slate-800 pt-2">{tx.notes}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Security Tab */}
          {tab === "settings" && (
            <div className="p-8 space-y-8 animate-fade-in">
              <div>
                <h4 className="text-xl font-black text-slate-900 dark:text-white">Security Credentials</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Update your account password.</p>
              </div>
              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                {(["current", "new", "confirm"] as const).map(key => (
                  <div key={key} className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-300 ml-1 block">
                      {key === "current" ? "Current Password" : key === "new" ? "New Password" : "Confirm New Password"}
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords[key] ? "text" : "password"}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:bg-slate-950 dark:border-slate-700 pr-12"
                        value={passwords[key]}
                        onChange={e => setPasswords(p => ({ ...p, [key]: e.target.value }))}
                        placeholder={key === "new" ? "Min 8 characters" : ""}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(p => ({ ...p, [key]: !p[key] }))}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <span className="material-symbols-outlined text-xl">
                          {showPasswords[key] ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="submit"
                  className="px-6 py-3 bg-slate-900 dark:bg-violet-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-violet-700 transition-all"
                >
                  Update Password
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
