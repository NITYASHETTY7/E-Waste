"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { formatDate } from "@/utils/format";
import DecisionModal from "@/components/admin/DecisionModal";

export default function AdminUsers() {
  const { users, updateUserStatus } = useApp();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "pending" | "rejected" | "on-hold">("all");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [fetchedDetails, setFetchedDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<number>(1);
  const [decisionModal, setDecisionModal] = useState<{ isOpen: boolean; userId: string | null }>({ isOpen: false, userId: null });

  const handleUserClick = async (client: any) => {
    setSelectedUser(client.id);
    setActiveTab(1);
    setFetchedDetails(null);
    setLoadingDetails(true);
    try {
      const { api } = await import("@/lib/api"); // Import to ensure it is defined
      const userRes = await api.get(`/users/${client.id}`);
      let companyData = userRes.data?.company;
      if (companyData?.id) {
        const companyRes = await api.get(`/companies/${companyData.id}`);
        companyData = companyRes.data;
      }
      setFetchedDetails({ ...userRes.data, company: companyData });
    } catch (err) {
      console.error("Failed to fetch user details", err);
    } finally {
      setLoadingDetails(false);
    }
  };

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
          <h2 className="text-3xl font-headline font-extrabold tracking-tight text-slate-900 dark:text-white">Client Management</h2>
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
              <p className="text-2xl font-headline font-extrabold text-slate-900 dark:text-white">{s.value}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit dark:bg-slate-800">
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
              <tr key={client.id}
                onClick={() => handleUserClick(client)}
                className="hover:bg-blue-50/40 transition-colors cursor-pointer">                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[color:var(--color-secondary-container)] flex items-center justify-center font-black text-sm text-[color:var(--color-primary)]">
                      {client.name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{client.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold">{client.companyId ? `REG-${new Date(client.registeredAt).getFullYear()}-${client.companyId.substring(client.companyId.length - 4)}` : `#${client.id}`}</p>
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
                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    <button onClick={() => handleUserClick(client)}
                      className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-all dark:bg-slate-800 dark:text-slate-400" title="View Details">                      <span className="material-symbols-outlined text-lg">visibility</span>
                    </button>
                    {client.status === "pending" && (
                      <button onClick={() => setDecisionModal({ isOpen: true, userId: client.id })}
                        className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center hover:bg-amber-600 hover:text-white transition-all" title="Take Decision">
                        <span className="material-symbols-outlined text-sm">fact_check</span>
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

      {/* Client Detail Panel */}
      {modalUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedUser(null)}>
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl dark:bg-slate-900" onClick={e => e.stopPropagation()}>

            {/* Sticky Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[color:var(--color-secondary-container)] flex items-center justify-center font-headline font-black text-xl text-[color:var(--color-primary)]">
                  {modalUser.name[0]}
                </div>
                <div>
                  <h3 className="text-lg font-headline font-extrabold text-slate-900 leading-tight dark:text-white">{modalUser.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`pill text-[9px] ${modalUser.status === "active" ? "pill-success" : modalUser.status === "pending" ? "pill-warning" : "pill-error"}`}>
                      {modalUser.status}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">#{modalUser.id}</span>
                    <span className="text-[10px] text-slate-400">Registered {modalUser.registeredAt ? formatDate(modalUser.registeredAt) : "—"}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedUser(null)} className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors dark:bg-slate-800">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="overflow-y-auto flex-1 p-6 space-y-6">

              {/* Onboarding Progress Tabs */}
              <div className="flex items-center gap-0">
                {[
                  { step: 1, label: "Profile" },
                  { step: 2, label: "Documents" },
                  { step: 3, label: "Bank Details" },
                  { step: 4, label: "Under Review" },
                ].map((s, i, arr) => {
                  const done = modalUser.onboardingStep > s.step;
                  const active = activeTab === s.step;
                  return (
                    <div key={s.step} className="flex items-center flex-1 cursor-pointer" onClick={() => setActiveTab(s.step)}>
                      <div className="flex flex-col items-center group">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${active ? 'bg-[color:var(--color-primary)] text-white ring-4 ring-[color:var(--color-primary)]/20' : done ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500 group-hover:bg-slate-300'}`}>
                          {done && !active ? <span className="material-symbols-outlined text-sm">check</span> : s.step}
                        </div>
                        <span className={`text-[9px] font-bold mt-1 uppercase tracking-wider ${active ? 'text-[color:var(--color-primary)]' : done ? 'text-emerald-600' : 'text-slate-400'}`}>{s.label}</span>
                      </div>
                      {i < arr.length - 1 && <div className={`flex-1 h-0.5 mx-1 mb-4 ${done ? 'bg-emerald-400' : 'bg-slate-200'}`} />}
                    </div>
                  );
                })}
              </div>

              {/* Tab Content */}
              {activeTab === 1 && (
                <div className="space-y-6 animate-fade-in">
                  {/* Identity */}
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm text-slate-400">badge</span> Identity & Contact
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        ["Email", fetchedDetails?.email || modalUser.email],
                        ["Phone", fetchedDetails?.phone || modalUser.phone],
                        ["Contact Person", fetchedDetails?.name || modalUser.name],
                      ].map(([label, val]) => (
                        <div key={label} className="bg-slate-50 p-3 rounded-xl border border-slate-100 dark:bg-slate-950 dark:border-slate-800">
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{val || <span className="text-slate-300 font-normal italic">Not provided</span>}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Organization Profile */}
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm text-slate-400">corporate_fare</span> Organization Profile
                    </p>
                    {fetchedDetails?.company ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {[
                          ["Company Name", fetchedDetails.company.name],
                          ["GSTIN", fetchedDetails.company.gstNumber],
                          ["PAN", fetchedDetails.company.panNumber],
                          ["City", fetchedDetails.company.city],
                          ["State", fetchedDetails.company.state],
                          ["Pincode", fetchedDetails.company.pincode],
                          ["Full Address", fetchedDetails.company.address],
                        ].map(([label, val]) => (
                          <div key={label} className="bg-slate-50 p-3 rounded-xl border border-slate-100 dark:bg-slate-950 dark:border-slate-800">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{val || <span className="text-slate-300 font-normal italic">—</span>}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center dark:bg-slate-950 dark:border-slate-700">
                        <span className="material-symbols-outlined text-slate-300 text-2xl">corporate_fare</span>
                        <p className="text-xs text-slate-400 font-bold mt-1">Organization profile not submitted</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 2 && (
                <div className="space-y-6 animate-fade-in">
                  {/* Documents */}
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm text-slate-400">folder_open</span>
                      Documents
                      {fetchedDetails?.company?.kycDocuments?.length > 0 && (
                        <span className="ml-auto px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[9px] font-black">{fetchedDetails.company.kycDocuments.length} submitted</span>
                      )}
                    </p>
                    {loadingDetails ? (
                      <div className="flex justify-center py-8"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>
                    ) : fetchedDetails?.company?.kycDocuments?.length > 0 ? (
                      <div className="space-y-2">
                        {fetchedDetails.company.kycDocuments.map((doc: any, i: number) => (
                          <div key={i} className="flex items-center gap-4 p-3.5 bg-slate-50 border border-slate-100 rounded-xl hover:border-slate-200 transition-colors dark:bg-slate-950 dark:border-slate-800">
                            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                              <span className="material-symbols-outlined text-lg">description</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-slate-800 truncate dark:text-slate-200">{doc.type}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{doc.fileName} · {formatDate(doc.uploadedAt)}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase bg-emerald-100 text-emerald-700`}>
                                VERIFIED
                              </span>
                              {doc.signedUrl && (
                                <a href={doc.signedUrl} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all">
                                  <span className="material-symbols-outlined text-sm">download</span>
                                </a>
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
                </div>
              )}

              {activeTab === 3 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm text-slate-400">account_balance</span> Bank Details
                    </p>
                    {loadingDetails ? (
                      <div className="flex justify-center py-8"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>
                    ) : fetchedDetails?.company?.bankAccountNumber ? (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 dark:bg-slate-950 dark:border-slate-800">
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Account Name</p>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{fetchedDetails.company.bankAccountHolder || "—"}</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 dark:bg-slate-950 dark:border-slate-800">
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Account Number</p>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{fetchedDetails.company.bankAccountNumber || "—"}</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 dark:bg-slate-950 dark:border-slate-800">
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">IFSC Code</p>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{fetchedDetails.company.bankIfscCode || "—"}</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 dark:bg-slate-950 dark:border-slate-800">
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Bank Name</p>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{fetchedDetails.company.bankName || "—"}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center dark:bg-slate-950 dark:border-slate-700">
                        <span className="material-symbols-outlined text-slate-300 text-2xl">account_balance</span>
                        <p className="text-xs text-slate-400 font-bold mt-1">Bank details not provided</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 4 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 text-center dark:bg-slate-950 dark:border-slate-800">
                    <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">fact_check</span>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Final Review</h4>
                    <p className="text-sm text-slate-500 mb-4">Please review all submitted information before taking a final decision.</p>
                    <div className="flex gap-2 justify-center">
                      <button onClick={() => setActiveTab(1)} className="btn-outline px-4 py-2 text-xs rounded-xl">View Profile</button>
                      <button onClick={() => setActiveTab(2)} className="btn-outline px-4 py-2 text-xs rounded-xl">View Documents</button>
                    </div>
                  </div>
                  
                  {/* Rejection / Hold reason */}
                  {modalUser.statusReason && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3">
                      <span className="material-symbols-outlined text-red-500 shrink-0">info</span>
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-red-700 mb-1">Reason for {modalUser.status}</p>
                        <p className="text-sm text-red-700">{modalUser.statusReason}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sticky Decision Footer */}
            <div className="border-t border-slate-100 px-6 py-4 bg-white rounded-b-2xl shrink-0 dark:bg-slate-900 dark:border-slate-800">
              {modalUser.status === "pending" ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-500 text-base">pending_actions</span>
                    <p className="text-xs font-black text-amber-700 uppercase tracking-widest">Pending Review — Take a Decision</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <button onClick={() => { updateUserStatus(modalUser.id, "active"); setSelectedUser(null); }}
                      className="py-3 rounded-xl bg-emerald-600 text-white font-black text-sm hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-100">
                      <span className="material-symbols-outlined text-base">check_circle</span> Approve
                    </button>
                    <button onClick={() => { updateUserStatus(modalUser.id, "on-hold"); setSelectedUser(null); }}
                      className="py-3 rounded-xl bg-amber-50 text-amber-700 font-black text-sm hover:bg-amber-100 transition-all border border-amber-200 flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-base">pause_circle</span> Hold
                    </button>
                    <button onClick={() => { updateUserStatus(modalUser.id, "rejected"); setSelectedUser(null); }}
                      className="py-3 rounded-xl bg-red-50 text-red-600 font-black text-sm hover:bg-red-600 hover:text-white transition-all border border-red-200 flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-base">block</span> Reject
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">Manage Status</p>
                  <div className="flex gap-2">
                    {modalUser.status !== "active" && (
                      <button onClick={() => { updateUserStatus(modalUser.id, "active"); setSelectedUser(null); }}
                        className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs hover:bg-emerald-600 hover:text-white transition-all border border-emerald-200 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm">check_circle</span> Approve
                      </button>
                    )}
                    {modalUser.status !== "on-hold" && (
                      <button onClick={() => { updateUserStatus(modalUser.id, "on-hold"); setSelectedUser(null); }}
                        className="px-4 py-2 rounded-xl bg-amber-50 text-amber-700 font-bold text-xs hover:bg-amber-100 transition-all border border-amber-200 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm">pause_circle</span> Hold
                      </button>
                    )}
                    {modalUser.status !== "rejected" && (
                      <button onClick={() => { updateUserStatus(modalUser.id, "rejected"); setSelectedUser(null); }}
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
      {decisionModal.userId && (
        <DecisionModal
          isOpen={decisionModal.isOpen}
          onClose={() => setDecisionModal({ isOpen: false, userId: null })}
          title="Client Account Decision"
          itemDetails={[
            { label: "Client Name", value: users.find(u => u.id === decisionModal.userId)?.name || "" },
            { label: "Email", value: users.find(u => u.id === decisionModal.userId)?.email || "" }
          ]}
          onConfirm={(status, reason) => {
            if (decisionModal.userId) {
              updateUserStatus(decisionModal.userId, status, reason);
              setDecisionModal({ isOpen: false, userId: null });
            }
          }}
          actions={[
            { label: "Approve Client", status: "active", color: "#1E8E3E" },
            { label: "Put on Hold", status: "on-hold", color: "#FFC107", requireReason: true },
            { label: "Reject Account", status: "rejected", color: "#ef4444", requireReason: true }
          ]}
        />
      )}
    </div>
  );
}
