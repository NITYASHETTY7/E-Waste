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
              <tr key={vendor.id} className="hover:bg-slate-50 transition-colors">
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
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">None</span>
                    )}
                  </div>
                </td>
                <td>
                  <span className={`pill ${vendor.status === "active" ? "pill-success" : vendor.status === "pending" ? "pill-warning" : "pill-error"}`}>
                    {vendor.status || "pending"}
                  </span>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setSelectedVendor(vendor.id)}
                      className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-all" title="View Details">
                      <span className="material-symbols-outlined text-lg">visibility</span>
                    </button>
                    {vendor.status !== "active" && (
                      <button onClick={() => setDecisionModal({ isOpen: true, vendorId: vendor.id })}
                        className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all" title="Review Vendor">
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

      {/* Vendor Detail Modal */}
      {modalVendor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedVendor(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-[color:var(--color-outline-variant)]/30 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-headline font-extrabold">Vendor Details</h3>
              <button onClick={() => setSelectedVendor(null)} className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-5">
              {/* Basic */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[color:var(--color-primary-container)] flex items-center justify-center text-white font-headline font-black text-2xl">
                  {modalVendor.name[0]}
                </div>
                <div>
                  <h4 className="text-xl font-headline font-bold">{modalVendor.name}</h4>
                  <p className="text-sm text-[color:var(--color-on-surface-variant)]">{modalVendor.email}</p>
                  <span className={`pill mt-1 inline-flex ${modalVendor.status === "active" ? "pill-success" : modalVendor.status === "pending" ? "pill-warning" : "pill-error"}`}>
                    {modalVendor.status}
                  </span>
                </div>
              </div>

              {/* Profile */}
              {modalVendor.onboardingProfile && (
                <div>
                  <h5 className="text-xs font-black uppercase tracking-widest text-[color:var(--color-on-surface-variant)] mb-3">Company Profile</h5>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ["Contact Person", modalVendor.onboardingProfile.contactPerson],
                      ["Phone", modalVendor.phone || modalVendor.onboardingProfile.phone],
                      ["City", `${modalVendor.onboardingProfile.city}, ${modalVendor.onboardingProfile.state}`],
                      ["CPCB No.", modalVendor.onboardingProfile.cpcbNo || "—"],
                      ["Capacity", modalVendor.onboardingProfile.processingCapacity || "—"],
                      ["Company Reg.", modalVendor.onboardingProfile.companyRegistrationNo || "—"],
                    ].map(([label, value]) => (
                      <div key={label} className="bg-[color:var(--color-surface-container-low)] p-3 rounded-xl">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--color-on-surface-variant)]">{label}</p>
                        <p className="text-sm font-bold text-[color:var(--color-on-surface)] mt-0.5">{value || "—"}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents */}
              {modalVendor.documents && modalVendor.documents.length > 0 && (
                <div>
                  <h5 className="text-xs font-black uppercase tracking-widest text-[color:var(--color-on-surface-variant)] mb-3">Submitted Documents</h5>
                  <div className="space-y-2">
                    {modalVendor.documents.map((doc, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-[color:var(--color-surface-container-low)] rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-[color:var(--color-primary)]">description</span>
                          <div>
                            <p className="text-sm font-bold">{doc.fileName}</p>
                            <p className="text-[10px] text-[color:var(--color-on-surface-variant)]">{doc.size}</p>
                          </div>
                        </div>
                        <span className="pill pill-warning">Pending</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                {modalVendor.status !== "active" && (
                  <button onClick={() => { updateUserStatus(modalVendor.id, "active"); setSelectedVendor(null); }}
                    className="btn-primary flex-1 justify-center">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    Approve Vendor
                  </button>
                )}
                {modalVendor.status !== "rejected" && (
                  <button onClick={() => { updateUserStatus(modalVendor.id, "rejected"); setSelectedVendor(null); }}
                    className="flex-1 py-3 rounded-full bg-red-50 text-red-600 font-bold text-sm hover:bg-red-600 hover:text-white transition-all border border-red-200 flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-sm">block</span>
                    Reject
                  </button>
                )}
              </div>
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
