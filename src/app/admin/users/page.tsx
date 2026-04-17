"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { formatDate } from "@/utils/format";

export default function AdminUsers() {
  const { users, updateUserStatus } = useApp();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "pending" | "rejected">("all");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const clients = users.filter(u => u.role === "client");
  const stats = {
    total: clients.length,
    active: clients.filter(c => c.status === "active").length,
    pending: clients.filter(c => c.status === "pending").length,
    rejected: clients.filter(c => c.status === "rejected").length,
  };

  const filtered = clients
    .filter(c => statusFilter === "all" || c.status === statusFilter)
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()));

  const modalUser = selectedUser ? users.find(u => u.id === selectedUser) : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-headline font-extrabold tracking-tight text-slate-900">Client Management</h2>
          <p className="text-slate-500 mt-1 font-medium">Manage corporate clients, view their listings, and verify documents.</p>
        </div>
        <div className="relative w-64">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input placeholder="Search clients..." className="input-base pl-10 h-11 text-sm"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Clients", value: stats.total, icon: "domain", color: "text-[color:var(--color-primary)]", bg: "bg-[color:var(--color-secondary-container)]" },
          { label: "Active", value: stats.active, icon: "check_circle", color: "text-emerald-700", bg: "bg-emerald-50" },
          { label: "Pending", value: stats.pending, icon: "pending", color: "text-amber-700", bg: "bg-amber-50" },
          { label: "Rejected", value: stats.rejected, icon: "block", color: "text-red-700", bg: "bg-red-50" },
        ].map(s => (
          <div key={s.label} className="card p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
              <span className={`material-symbols-outlined text-xl ${s.color}`}>{s.icon}</span>
            </div>
            <div>
              <p className="text-2xl font-headline font-extrabold text-slate-900">{s.value}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
        {(["all", "pending", "active", "rejected"] as const).map(f => (
          <button key={f} onClick={() => setStatusFilter(f)}
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
              statusFilter === f ? "bg-white shadow-sm text-slate-900" : "text-slate-500"
            }`}>
            {f} {f !== "all" && `(${stats[f as keyof typeof stats]})`}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr className="bg-[color:var(--color-inverse-surface)]">
              {["Client", "Contact", "GSTIN", "Registered", "Status", "Actions"].map(h => (
                <th key={h} className="text-white/70 font-bold text-[10px]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(client => (
              <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[color:var(--color-secondary-container)] flex items-center justify-center font-black text-sm text-[color:var(--color-primary)]">
                      {client.name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{client.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold">#{client.id}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <p className="text-sm">{client.email}</p>
                  <p className="text-xs text-slate-400">{client.phone || "—"}</p>
                </td>
                <td className="font-mono text-xs">
                  {client.onboardingProfile?.gstin || "—"}
                </td>
                <td className="text-xs text-slate-400">
                  {client.registeredAt ? formatDate(client.registeredAt) : "—"}
                </td>
                <td>
                  <span className={`pill ${client.status === "active" ? "pill-success" : client.status === "pending" ? "pill-warning" : "pill-error"}`}>
                    {client.status || "pending"}
                  </span>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setSelectedUser(client.id)}
                      className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-all">
                      <span className="material-symbols-outlined text-lg">visibility</span>
                    </button>
                    {client.status !== "active" && (
                      <button onClick={() => updateUserStatus(client.id, "active")}
                        className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all" title="Approve">
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                      </button>
                    )}
                    {client.status !== "rejected" && (
                      <button onClick={() => updateUserStatus(client.id, "rejected")}
                        className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all" title="Reject">
                        <span className="material-symbols-outlined text-sm">block</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="text-center py-12 text-slate-400 italic">No clients found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedUser(null)}>
          <div className="bg-white rounded-3xl w-full max-w-xl max-h-[85vh] overflow-y-auto shadow-2xl animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-headline font-extrabold">Client Details</h3>
              <button onClick={() => setSelectedUser(null)} className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[color:var(--color-primary-container)] flex items-center justify-center text-white font-headline font-black text-2xl">
                  {modalUser.name[0]}
                </div>
                <div>
                  <h4 className="text-xl font-headline font-bold">{modalUser.name}</h4>
                  <p className="text-sm text-slate-500">{modalUser.email}</p>
                  <span className={`pill mt-1 inline-flex ${modalUser.status === "active" ? "pill-success" : modalUser.status === "pending" ? "pill-warning" : "pill-error"}`}>
                    {modalUser.status}
                  </span>
                </div>
              </div>

              {modalUser.onboardingProfile && (
                <div>
                  <h5 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Organization Profile</h5>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ["Contact", modalUser.onboardingProfile.contactPerson],
                      ["GSTIN", modalUser.onboardingProfile.gstin],
                      ["Sector", modalUser.onboardingProfile.industrySector],
                      ["Employees", modalUser.onboardingProfile.numberOfEmployees],
                      ["City", `${modalUser.onboardingProfile.city}, ${modalUser.onboardingProfile.state}`],
                    ].map(([l, v]) => v && (
                      <div key={l} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{l}</p>
                        <p className="text-sm font-bold mt-0.5">{v}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {modalUser.documents && modalUser.documents.length > 0 && (
                <div>
                  <h5 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Compliance Documents</h5>
                  {modalUser.documents.map((doc, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl mb-2">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-emerald-600">description</span>
                        <div>
                          <p className="text-sm font-bold">{doc.fileName}</p>
                          <p className="text-[10px] text-slate-400 uppercase font-black">{doc.size}</p>
                        </div>
                      </div>
                      <span className="pill pill-success">Verified</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                {modalUser.status !== "active" && (
                  <button onClick={() => { updateUserStatus(modalUser.id, "active"); setSelectedUser(null); }}
                    className="btn-primary flex-1 justify-center">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    Approve Client
                  </button>
                )}
                {modalUser.status !== "rejected" && (
                  <button onClick={() => { updateUserStatus(modalUser.id, "rejected"); setSelectedUser(null); }}
                    className="flex-1 py-3 rounded-xl bg-red-50 text-red-600 font-bold text-sm hover:bg-red-600 hover:text-white transition-all border border-red-200 flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-sm">block</span>
                    Reject
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
