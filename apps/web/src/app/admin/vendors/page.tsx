"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { formatDate } from "@/utils/format";
import DecisionModal from "@/components/admin/DecisionModal";

export default function AdminVendors() {
  const { users, updateUserStatus } = useApp();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "pending" | "rejected" | "on-hold">("all");
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [decisionModal, setDecisionModal] = useState<{ isOpen: boolean; vendorId: string | null }>({ isOpen: false, vendorId: null });

  const vendors = users.filter(u => u.role === "vendor");
  const stats = {
    total: vendors.length,
    active: vendors.filter(v => v.status === "active").length,
    pending: vendors.filter(v => v.status === "pending").length,
    rejected: vendors.filter(v => v.status === "rejected").length,
  };

  const filtered = vendors
    .filter(v => statusFilter === "all" || v.status === statusFilter)
    .filter(v => v.name.toLowerCase().includes(search.toLowerCase()) || v.email.toLowerCase().includes(search.toLowerCase()));

  const modalVendor = selectedVendor ? users.find(u => u.id === selectedVendor) : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-headline font-extrabold tracking-tight text-[color:var(--color-on-surface)]">Vendor Management</h2>
          <p className="text-[color:var(--color-on-surface-variant)] mt-1">Review recycler applications, CPCB certifications, and approval status.</p>
        </div>
        <div className="relative w-64">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
          <input placeholder="Search vendors..." className="input-base pl-10 h-11 text-sm"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Vendors", value: stats.total, icon: "groups", color: "text-[color:var(--color-primary)]", bg: "bg-[color:var(--color-secondary-container)]" },
          { label: "Active", value: stats.active, icon: "verified", color: "text-emerald-700", bg: "bg-emerald-50" },
          { label: "Pending Review", value: stats.pending, icon: "pending", color: "text-amber-700", bg: "bg-amber-50" },
          { label: "Rejected", value: stats.rejected, icon: "block", color: "text-red-700", bg: "bg-red-50" },
        ].map(s => (
          <div key={s.label} className="card p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
              <span className={`material-symbols-outlined text-xl ${s.color}`}>{s.icon}</span>
            </div>
            <div>
              <p className="text-2xl font-headline font-extrabold text-[color:var(--color-on-surface)]">{s.value}</p>
              <p className="text-xs font-bold text-[color:var(--color-on-surface-variant)] uppercase tracking-widest">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1 p-1 bg-[color:var(--color-surface-container-low)] rounded-xl w-fit">
        {(["all", "pending", "active", "rejected"] as const).map(f => (
          <button key={f} onClick={() => setStatusFilter(f)}
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
              statusFilter === f ? "bg-white text-[color:var(--color-on-surface)] shadow-sm" : "text-[color:var(--color-on-surface-variant)]"
            }`}>
            {f} {f !== "all" && `(${stats[f as keyof typeof stats]})`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr className="bg-[color:var(--color-inverse-surface)]">
              {["Vendor", "Contact", "Registered", "Documents", "Status", "Actions"].map(h => (
                <th key={h} className="text-white/70 font-bold text-[10px]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(vendor => (
              <tr key={vendor.id}
                onClick={() => setSelectedVendor(vendor.id)}
                className="hover:bg-blue-50/40 transition-colors cursor-pointer">
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[color:var(--color-secondary-container)] flex items-center justify-center font-black font-headline text-sm text-[color:var(--color-primary)]">
                      {vendor.name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-[color:var(--color-on-surface)]">{vendor.name}</p>
                      <p className="text-[10px] text-[color:var(--color-on-surface-variant)]">#{vendor.id}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <p className="text-sm text-[color:var(--color-on-surface)]">{vendor.email}</p>
                  <p className="text-xs text-[color:var(--color-on-surface-variant)]">{vendor.phone || "—"}</p>
                </td>
                <td className="text-xs text-[color:var(--color-on-surface-variant)]">
                  {vendor.registeredAt ? formatDate(vendor.registeredAt) : "—"}
                </td>
                <td>
                  <div className="flex gap-1 flex-wrap">
                    {vendor.documents && vendor.documents.length > 0 ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">
                        {vendor.documents.length} docs
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full dark:bg-slate-800">None</span>
                    )}
                  </div>
                </td>
                <td>
                  <span className={`pill ${vendor.status === "active" ? "pill-success" : vendor.status === "pending" ? "pill-warning" : "pill-error"}`}>
                    {vendor.status || "pending"}
                  </span>
                </td>
                <td>
                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    <button onClick={() => setSelectedVendor(vendor.id)}
                      className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-all dark:bg-slate-800 dark:text-slate-400" title="View Details">
                      <span className="material-symbols-outlined text-lg">visibility</span>
                    </button>
                    {vendor.status === "pending" && (
                      <button onClick={() => setDecisionModal({ isOpen: true, vendorId: vendor.id })}
                        className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center hover:bg-amber-600 hover:text-white transition-all" title="Take Decision">
                        <span className="material-symbols-outlined text-lg">fact_check</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="text-center py-12 text-slate-400 italic">No vendors found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Vendor Detail Panel */}
      {modalVendor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedVendor(null)}>
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl dark:bg-slate-900" onClick={e => e.stopPropagation()}>

            {/* Sticky Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[color:var(--color-primary-container)] flex items-center justify-center font-headline font-black text-xl text-[color:var(--color-primary)]">
                  {modalVendor.name[0]}
                </div>
                <div>
                  <h3 className="text-lg font-headline font-extrabold text-slate-900 leading-tight dark:text-white">{modalVendor.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`pill text-[9px] ${modalVendor.status === "active" ? "pill-success" : modalVendor.status === "pending" ? "pill-warning" : "pill-error"}`}>
                      {modalVendor.status}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">#{modalVendor.id}</span>
                    <span className="text-[10px] text-slate-400">Registered {modalVendor.registeredAt ? formatDate(modalVendor.registeredAt) : "—"}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedVendor(null)} className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors dark:bg-slate-800">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="overflow-y-auto flex-1 p-6 space-y-6">

              {/* Onboarding Progress */}
              <div className="flex items-center gap-0">
                {[
                  { step: 1, label: "Profile" },
                  { step: 2, label: "Documents" },
                  { step: 3, label: "Bank Details" },
                  { step: 4, label: "Under Review" },
                ].map((s, i, arr) => {
                  const done = modalVendor.onboardingStep > s.step;
                  const active = modalVendor.onboardingStep === s.step;
                  return (
                    <div key={s.step} className="flex items-center flex-1">
                      <div className="flex flex-col items-center">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${done ? 'bg-emerald-500 text-white' : active ? 'bg-[color:var(--color-primary)] text-white' : 'bg-slate-200 text-slate-500'}`}>
                          {done ? <span className="material-symbols-outlined text-sm">check</span> : s.step}
                        </div>
                        <span className={`text-[9px] font-bold mt-1 uppercase tracking-wider ${active ? 'text-[color:var(--color-primary)]' : done ? 'text-emerald-600' : 'text-slate-400'}`}>{s.label}</span>
                      </div>
                      {i < arr.length - 1 && <div className={`flex-1 h-0.5 mx-1 mb-4 ${done ? 'bg-emerald-400' : 'bg-slate-200'}`} />}
                    </div>
                  );
                })}
              </div>

              {/* Identity */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-slate-400">badge</span> Identity & Contact
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    ["Email", modalVendor.email],
                    ["Phone", modalVendor.phone],
                    ["Contact Person", modalVendor.onboardingProfile?.contactPerson],
                  ].map(([label, val]) => (
                    <div key={label} className="bg-slate-50 p-3 rounded-xl border border-slate-100 dark:bg-slate-950 dark:border-slate-800">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{val || <span className="text-slate-300 font-normal italic">Not provided</span>}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Company Profile */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-slate-400">domain</span> Company Profile
                </p>
                {modalVendor.onboardingProfile ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        ["Company Name", modalVendor.onboardingProfile.companyName],
                        ["Reg. Number", modalVendor.onboardingProfile.companyRegistrationNo],
                        ["Processing Capacity", modalVendor.onboardingProfile.processingCapacity],
                        ["CPCB No.", modalVendor.onboardingProfile.cpcbNo],
                        ["City", modalVendor.onboardingProfile.city],
                        ["State", modalVendor.onboardingProfile.state],
                        ["Pincode", modalVendor.onboardingProfile.pincode],
                        ["Address", modalVendor.onboardingProfile.address],
                      ].map(([label, val]) => (
                        <div key={label} className="bg-slate-50 p-3 rounded-xl border border-slate-100 dark:bg-slate-950 dark:border-slate-800">
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{val || <span className="text-slate-300 font-normal italic">—</span>}</p>
                        </div>
                      ))}
                    </div>
                    {modalVendor.onboardingProfile.materialSpecializations && modalVendor.onboardingProfile.materialSpecializations.length > 0 && (
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 dark:bg-slate-950 dark:border-slate-800">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Material Specializations</p>
                        <div className="flex gap-2 flex-wrap">
                          {modalVendor.onboardingProfile.materialSpecializations.map(s => (
                            <span key={s} className="px-2.5 py-1 bg-[color:var(--color-secondary-container)] text-[color:var(--color-primary)] text-xs font-bold rounded-lg">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center dark:bg-slate-950 dark:border-slate-700">
                    <span className="material-symbols-outlined text-slate-300 text-2xl">domain_disabled</span>
                    <p className="text-xs text-slate-400 font-bold mt-1">Company profile not submitted</p>
                  </div>
                )}
              </div>

              {/* Bank Details */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-slate-400">account_balance</span> Bank Details
                </p>
                {modalVendor.bankDetails ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      ["Account Holder", modalVendor.bankDetails.accountHolderName],
                      ["Bank Name", modalVendor.bankDetails.bankName],
                      ["Account Number", modalVendor.bankDetails.accountNumber],
                      ["IFSC Code", modalVendor.bankDetails.ifscCode],
                      ["Account Type", modalVendor.bankDetails.accountType],
                    ].map(([label, val]) => (
                      <div key={label} className="bg-slate-50 p-3 rounded-xl border border-slate-100 dark:bg-slate-950 dark:border-slate-800">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
                        <p className="text-sm font-bold text-slate-800 font-mono dark:text-slate-200">{val || "—"}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50 rounded-xl border border-dashed border-amber-200 text-center">
                    <span className="material-symbols-outlined text-amber-400 text-2xl">account_balance_wallet</span>
                    <p className="text-xs text-amber-700 font-bold mt-1">Bank details not submitted yet</p>
                  </div>
                )}
              </div>

              {/* Documents */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-slate-400">folder_open</span>
                  Documents
                  {modalVendor.documents && modalVendor.documents.length > 0 && (
                    <span className="ml-auto px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[9px] font-black">{modalVendor.documents.length} submitted</span>
                  )}
                </p>
                {modalVendor.documents && modalVendor.documents.length > 0 ? (
                  <div className="space-y-2">
                    {modalVendor.documents.map((doc, i) => (
                      <div key={i} className="flex items-center gap-4 p-3.5 bg-slate-50 border border-slate-100 rounded-xl hover:border-slate-200 transition-colors dark:bg-slate-950 dark:border-slate-800">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${doc.name === 'EMD Proof' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                          <span className="material-symbols-outlined text-lg">{doc.name === 'EMD Proof' ? 'payments' : 'description'}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate dark:text-slate-200">{doc.fileName}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{doc.name} · {doc.size} · {formatDate(doc.uploadedAt)}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${doc.status === 'verified' ? 'bg-emerald-100 text-emerald-700' : doc.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                            {doc.status}
                          </span>
                          {doc.url ? (
                            <a href={doc.url} download className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all">
                              <span className="material-symbols-outlined text-sm">download</span>
                            </a>
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center dark:bg-slate-800" title="No file attached">
                              <span className="material-symbols-outlined text-sm text-slate-300">visibility_off</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-red-50 rounded-xl border border-dashed border-red-200 text-center">
                    <span className="material-symbols-outlined text-red-300 text-2xl">folder_off</span>
                    <p className="text-xs text-red-500 font-bold mt-1">No documents uploaded yet</p>
                  </div>
                )}
              </div>

              {/* Status reason if rejected/on-hold */}
              {modalVendor.statusReason && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3">
                  <span className="material-symbols-outlined text-red-500 shrink-0">info</span>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-red-700 mb-1">Reason for {modalVendor.status}</p>
                    <p className="text-sm text-red-700">{modalVendor.statusReason}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Decision Footer */}
            <div className="border-t border-slate-100 px-6 py-4 bg-white rounded-b-2xl shrink-0 dark:bg-slate-900 dark:border-slate-800">
              {modalVendor.status === "pending" ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-500 text-base">pending_actions</span>
                    <p className="text-xs font-black text-amber-700 uppercase tracking-widest">Pending Review — Take a Decision</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <button onClick={() => { updateUserStatus(modalVendor.id, "active"); setSelectedVendor(null); }}
                      className="py-3 rounded-xl bg-emerald-600 text-white font-black text-sm hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-100">
                      <span className="material-symbols-outlined text-base">verified</span> Approve
                    </button>
                    <button onClick={() => { updateUserStatus(modalVendor.id, "on-hold"); setSelectedVendor(null); }}
                      className="py-3 rounded-xl bg-amber-50 text-amber-700 font-black text-sm hover:bg-amber-100 transition-all border border-amber-200 flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-base">pause_circle</span> Hold
                    </button>
                    <button onClick={() => { updateUserStatus(modalVendor.id, "rejected"); setSelectedVendor(null); }}
                      className="py-3 rounded-xl bg-red-50 text-red-600 font-black text-sm hover:bg-red-600 hover:text-white transition-all border border-red-200 flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-base">block</span> Reject
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">Manage Status</p>
                  <div className="flex gap-2">
                    {modalVendor.status !== "active" && (
                      <button onClick={() => { updateUserStatus(modalVendor.id, "active"); setSelectedVendor(null); }}
                        className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs hover:bg-emerald-600 hover:text-white transition-all border border-emerald-200 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm">verified</span> Approve
                      </button>
                    )}
                    {modalVendor.status !== "on-hold" && (
                      <button onClick={() => { updateUserStatus(modalVendor.id, "on-hold"); setSelectedVendor(null); }}
                        className="px-4 py-2 rounded-xl bg-amber-50 text-amber-700 font-bold text-xs hover:bg-amber-100 transition-all border border-amber-200 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm">pause_circle</span> Hold
                      </button>
                    )}
                    {modalVendor.status !== "rejected" && (
                      <button onClick={() => { updateUserStatus(modalVendor.id, "rejected"); setSelectedVendor(null); }}
                        className="px-4 py-2 rounded-xl bg-red-50 text-red-600 font-bold text-xs hover:bg-red-600 hover:text-white transition-all border border-red-200 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm">block</span> Reject
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Decision Modal */}
      {decisionModal.vendorId && (
        <DecisionModal
          isOpen={decisionModal.isOpen}
          onClose={() => setDecisionModal({ isOpen: false, vendorId: null })}
          title="Vendor Application Decision"
          itemDetails={[
            { label: "Company", value: users.find(u => u.id === decisionModal.vendorId)?.name || "" },
            { label: "Email", value: users.find(u => u.id === decisionModal.vendorId)?.email || "" }
          ]}
          onConfirm={(status, reason) => {
            if (decisionModal.vendorId) {
              updateUserStatus(decisionModal.vendorId, status, reason);
              setDecisionModal({ isOpen: false, vendorId: null });
            }
          }}
          actions={[
            { label: "Approve Vendor", status: "active", color: "#1E8E3E" },
            { label: "Put on Hold", status: "on-hold", color: "#FFC107", requireReason: true },
            { label: "Reject Application", status: "rejected", color: "#ef4444", requireReason: true }
          ]}
        />
      )}
    </div>
  );
}
