"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";

export default function AdminAudits() {
  const { listings, users, auditInvitations, sendAuditInvitations } = useApp();
  const [selectedListing, setSelectedListing] = useState<string | null>(null);
  const [inviteModal, setInviteModal] = useState(false);
  const [spocName, setSpocName] = useState("");
  const [spocPhone, setSpocPhone] = useState("");
  const [siteAddress, setSiteAddress] = useState("");
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);

  // Listings eligible for audit (have interested vendor responses)
  const auditEligible = listings.filter(l =>
    l.vendorResponses?.some(r => r.status === "interested")
  );

  const vendors = users.filter(u => u.role === "vendor" && u.status === "active");

  const getAuditsForListing = (listingId: string) =>
    auditInvitations.filter(a => a.listingId === listingId);

  const statusColor = (status: string) => {
    if (status === "completed") return "bg-emerald-100 text-emerald-700";
    if (status === "accepted") return "bg-blue-100 text-blue-700";
    if (status === "declined") return "bg-red-100 text-red-700";
    return "bg-amber-100 text-amber-700";
  };

  const handleSendInvites = () => {
    if (!selectedListing || !selectedVendors.length || !spocName || !spocPhone || !siteAddress) return;
    sendAuditInvitations(selectedListing, selectedVendors, spocName, spocPhone, siteAddress);
    setInviteModal(false);
    setSelectedVendors([]);
    setSpocName(""); setSpocPhone(""); setSiteAddress("");
  };

  const stats = {
    total: auditInvitations.length,
    invited: auditInvitations.filter(a => a.status === "invited").length,
    accepted: auditInvitations.filter(a => a.status === "accepted").length,
    completed: auditInvitations.filter(a => a.status === "completed").length,
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-headline font-extrabold tracking-tight text-[color:var(--color-on-surface)]">Audit Management</h2>
          <p className="text-[color:var(--color-on-surface-variant)] mt-1">Send site audit invitations and track vendor audit responses.</p>
        </div>
        <button
          onClick={() => setInviteModal(true)}
          className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary/90 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Send Audit Invitation
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Invitations", value: stats.total, icon: "mail", color: "text-blue-600 bg-blue-50" },
          { label: "Awaiting Response", value: stats.invited, icon: "schedule", color: "text-amber-600 bg-amber-50" },
          { label: "Accepted", value: stats.accepted, icon: "check_circle", color: "text-primary bg-primary/10" },
          { label: "Completed", value: stats.completed, icon: "verified", color: "text-purple-600 bg-purple-50" },
        ].map(s => (
          <div key={s.label} className="card p-5 border border-slate-100">
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

      {/* Listings with audit activity */}
      <div className="space-y-4">
        {auditEligible.length === 0 ? (
          <div className="card p-16 text-center border-2 border-dashed border-slate-200">
            <span className="material-symbols-outlined text-5xl text-slate-300 block mb-3">fact_check</span>
            <p className="font-bold text-slate-600">No listings ready for audit</p>
            <p className="text-sm text-slate-400 mt-1">Listings with interested vendors will appear here.</p>
          </div>
        ) : (
          auditEligible.map(listing => {
            const audits = getAuditsForListing(listing.id);
            const interested = listing.vendorResponses?.filter(r => r.status === "interested") || [];
            return (
              <div key={listing.id} className="card p-0 overflow-hidden border border-slate-100">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{listing.id}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-black uppercase">{listing.auctionPhase}</span>
                    </div>
                    <h3 className="font-bold text-slate-900">{listing.title}</h3>
                    <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                      <span className="material-symbols-outlined text-sm">location_on</span>{listing.location}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-slate-400">{interested.length} interested vendor{interested.length !== 1 ? "s" : ""}</p>
                    <p className="text-xs text-slate-400">{audits.length} audit{audits.length !== 1 ? "s" : ""} sent</p>
                  </div>
                </div>

                {audits.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {audits.map(audit => (
                      <div key={audit.id} className="p-4 flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-sm text-slate-500">recycling</span>
                          </div>
                          <div>
                            <p className="font-bold text-sm text-slate-900">{audit.vendorName}</p>
                            {audit.scheduledDate && (
                              <p className="text-xs text-slate-500">Scheduled: {new Date(audit.scheduledDate).toLocaleDateString("en-IN")}</p>
                            )}
                            {audit.status === "completed" && (
                              <div className="mt-1">
                                <p className="text-xs font-bold text-slate-700">
                                  Product match: <span className={audit.productMatch ? "text-emerald-600" : "text-red-600"}>{audit.productMatch ? "Yes" : "No"}</span>
                                </p>
                                {audit.auditRemarks && <p className="text-xs text-slate-500 mt-0.5 italic">"{audit.auditRemarks}"</p>}
                              </div>
                            )}
                          </div>
                        </div>
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wide ${statusColor(audit.status)}`}>
                          {audit.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-slate-400">
                    No audit invitations sent yet.
                    <button
                      onClick={() => { setSelectedListing(listing.id); setInviteModal(true); setSiteAddress(listing.location); }}
                      className="ml-2 text-primary font-bold hover:underline"
                    >Send now</button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Send Invitation Modal */}
      {inviteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-xl font-headline font-extrabold text-slate-900 dark:text-white">Send Audit Invitation</h3>
              <button onClick={() => setInviteModal(false)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-slate-500">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="label">Select Listing</label>
                <select className="input-base" value={selectedListing || ""} onChange={e => setSelectedListing(e.target.value)}>
                  <option value="">-- Choose listing --</option>
                  {auditEligible.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
                </select>
              </div>
              <div>
                <label className="label">SPOC Name</label>
                <input className="input-base" placeholder="Site contact person name" value={spocName} onChange={e => setSpocName(e.target.value)} />
              </div>
              <div>
                <label className="label">SPOC Phone</label>
                <input className="input-base" placeholder="+91 XXXXX XXXXX" value={spocPhone} onChange={e => setSpocPhone(e.target.value)} />
              </div>
              <div>
                <label className="label">Site Address</label>
                <input className="input-base" placeholder="Full site address for audit" value={siteAddress} onChange={e => setSiteAddress(e.target.value)} />
              </div>
              <div>
                <label className="label">Select Vendors to Invite</label>
                <div className="space-y-2 max-h-40 overflow-y-auto border border-slate-200 rounded-xl p-3">
                  {vendors.map(v => (
                    <label key={v.id} className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg">
                      <input type="checkbox" className="w-4 h-4 accent-primary"
                        checked={selectedVendors.includes(v.id)}
                        onChange={e => setSelectedVendors(prev => e.target.checked ? [...prev, v.id] : prev.filter(id => id !== v.id))}
                      />
                      <span className="text-sm font-medium text-slate-900">{v.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setInviteModal(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
              <button
                onClick={handleSendInvites}
                disabled={!selectedListing || !selectedVendors.length || !spocName || !spocPhone || !siteAddress}
                className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send Invitations
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
