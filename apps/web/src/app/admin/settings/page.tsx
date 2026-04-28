"use client";

import { useState } from "react";

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("Role Management");

  const roles = [
    { name: "Super Admin", desc: "Full system control", perms: [true, true, true, true, true] },
    { name: "Sustainability Manager", desc: "Operations & reporting", perms: [true, true, false, true, false] },
    { name: "Support", desc: "Read-only assistance", perms: [true, false, false, false, false] },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header — matches Stitch Admin Settings reference */}
      <div>
        <h2 className="text-3xl font-headline font-extrabold tracking-tight text-[color:var(--color-on-surface)]">Admin Settings</h2>
        <p className="text-[color:var(--color-on-surface-variant)] mt-1">Configure system-wide parameters, user access levels, and notification protocols.</p>
      </div>

      {/* Tabbed Navigation */}
      <div className="flex items-center gap-8 border-b border-slate-100 mb-8 overflow-x-auto dark:border-slate-800">
        {["General", "Bidding Parameters", "Notifications", "Role Management"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === tab
                ? "text-[color:var(--color-primary)] border-b-2 border-[color:var(--color-primary)]"
                : "text-slate-400 hover:text-[color:var(--color-primary)]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Permissions Matrix */}
        <div className="col-span-12 card overflow-hidden">
          <div className="bg-[color:var(--color-inverse-surface)] px-6 py-4 flex justify-between items-center">
            <h3 className="text-white font-bold flex items-center gap-2 text-sm uppercase tracking-widest">
              <span className="material-symbols-outlined text-[color:var(--color-primary-fixed)] text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
              Permission Matrix
            </h3>
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest bg-white/10 px-2 py-1 rounded">System Level: Enterprise</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 dark:bg-slate-950 dark:border-slate-800">
                  <th className="px-8 py-5 text-[10px] uppercase font-black text-slate-400 tracking-widest">Role Name</th>
                  {["View Listings", "Edit Listings", "Approve Vendors", "View Reports", "Manage Users"].map((p) => (
                    <th key={p} className="px-4 py-5 text-[10px] uppercase font-black text-slate-400 tracking-widest text-center">{p}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {roles.map((role) => (
                  <tr key={role.name} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${role.name === "Super Admin" ? "bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)]" : "bg-slate-100 text-slate-500"}`}>
                          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                            {role.name === "Super Admin" ? "stars" : role.name === "Support" ? "support_agent" : "eco"}
                          </span>
                        </div>
                        <div>
                          <p className="font-headline font-bold text-sm text-[color:var(--color-on-surface)]">{role.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{role.desc}</p>
                        </div>
                      </div>
                    </td>
                    {role.perms.map((p, i) => (
                      <td key={i} className="px-4 py-5 text-center text-sm">
                        <input
                          type="checkbox"
                          checked={p}
                          readOnly
                          className="w-5 h-5 rounded border-slate-200 text-[color:var(--color-primary)] focus:ring-[color:var(--color-primary)] opacity-60 cursor-not-allowed dark:border-slate-700"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-6 bg-slate-50 flex items-start gap-4 border-t border-slate-100 dark:bg-slate-950 dark:border-slate-800">
            <span className="material-symbols-outlined text-[color:var(--color-primary)] text-lg">info</span>
            <div>
              <p className="text-xs font-bold text-[color:var(--color-on-surface)]">About Custom Roles</p>
              <p className="text-[10px] text-slate-500 mt-1 leading-relaxed max-w-2xl font-medium">
                Role permissions are granularly tracked in the audit log. Changes to Super Admin roles require secondary verification via OTP. Existing users assigned to modified roles will have their access updated upon their next session initialization.
              </p>
            </div>
          </div>
        </div>

        {/* Security Overview */}
        <div className="col-span-12 lg:col-span-4 card p-6">
          <h4 className="font-headline font-bold text-[color:var(--color-on-surface)] mb-4">Security Overview</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-950">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">2FA Required</span>
              <span className="px-3 py-1 rounded-full bg-[color:var(--color-primary-container)] text-white text-[10px] font-black uppercase tracking-tighter">Active</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-950">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Session Timeout</span>
              <span className="text-sm font-bold text-[color:var(--color-on-surface)]">15 Minutes</span>
            </div>
          </div>
        </div>

        {/* Quick Role Creator */}
        <div className="col-span-12 lg:col-span-8 card p-6">
          <h4 className="font-headline font-bold text-[color:var(--color-on-surface)] mb-4">Quick Role Creator</h4>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">New Role Name</label>
              <input type="text" placeholder="e.g. Regional Inspector" className="w-full input-base" />
            </div>
            <div className="flex-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Inherit From</label>
              <select className="w-full input-base appearance-none">
                <option>Support</option>
                <option>Sustainability Manager</option>
              </select>
            </div>
            <div className="flex items-end">
              <button className="h-[46px] px-8 bg-[color:var(--color-secondary-container)] text-[color:var(--color-on-secondary-container)] font-bold rounded-xl text-xs uppercase tracking-widest hover:opacity-90 transition-all">
                Create
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex justify-end gap-4">
        <button className="text-[color:var(--color-primary)] font-bold text-xs uppercase tracking-widest px-6 py-3 hover:bg-emerald-50 rounded-xl transition-all">
          Discard Changes
        </button>
        <button className="bg-[color:var(--color-primary)] text-white font-bold text-xs uppercase tracking-widest px-10 py-3 rounded-xl shadow-lg shadow-emerald-900/10 hover:scale-105 transition-all">
          Save Changes
        </button>
      </div>
    </div>
  );
}
