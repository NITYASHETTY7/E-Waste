"use client";

import { useState, useRef } from "react";
import { useApp } from "@/context/AppContext";
import Link from "next/link";
import api from "@/lib/api";

type ReviewStep = "decision" | "approve";

export default function AdminListings() {
  const { listings, bids, users, uploadProcessedSheet, refreshData } = useApp();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "review" | "active" | "rejected">("all");

  // Review modal (approve / reject flow)
  const [reviewModal, setReviewModal] = useState<{ open: boolean; listingId: string | null; step: ReviewStep }>({
    open: false, listingId: null, step: "decision",
  });
  const [rejectReason, setRejectReason] = useState("");
  const [sheetFile, setSheetFile] = useState<File | null>(null);
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const closeModal = () => {
    setReviewModal({ open: false, listingId: null, step: "decision" });
    setRejectReason("");
    setSheetFile(null);
    setSelectedVendors([]);
  };

  const openReview = (listingId: string) =>
    setReviewModal({ open: true, listingId, step: "decision" });

  const activeVendors = users.filter(u => u.role === "vendor" && u.status === "active");

  const getDisplayStatus = (l: any) => {
    if (l.requirementStatus === "client_review") return "review";
    if (l.requirementStatus === "rejected") return "rejected";
    if (l.status === "active") return "active";
    return "pending";
  };

  const filtered = listings
    .filter(l => filter === "all" || getDisplayStatus(l) === filter)
    .filter(l =>
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.location?.toLowerCase().includes(search.toLowerCase())
    );

  const counts = {
    pending: listings.filter(l => getDisplayStatus(l) === "pending").length,
    review: listings.filter(l => getDisplayStatus(l) === "review").length,
    active: listings.filter(l => getDisplayStatus(l) === "active").length,
    rejected: listings.filter(l => getDisplayStatus(l) === "rejected").length,
  };

  const handleReject = async () => {
    if (!reviewModal.listingId || !rejectReason.trim()) return;
    setSaving(true);
    try {
      await api.patch(`/requirements/${reviewModal.listingId}/reject`, { reason: rejectReason });
      await refreshData();
      showToast("Listing rejected.");
      closeModal();
    } catch {
      showToast("Failed to reject listing.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleApproveUpload = async () => {
    if (!reviewModal.listingId || !sheetFile) {
      showToast("Please upload the processed sheet.", "error");
      return;
    }
    if (selectedVendors.length === 0) {
      showToast("Please select at least one vendor.", "error");
      return;
    }
    setSaving(true);
    try {
      await uploadProcessedSheet(reviewModal.listingId, sheetFile, selectedVendors);
      showToast("Sheet uploaded. Client will be notified to approve.");
      closeModal();
    } catch {
      showToast("Upload failed. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  const toggleVendor = (id: string) =>
    setSelectedVendors(prev =>
      prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
    );

  const reviewListing = listings.find(l => l.id === reviewModal.listingId);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[200] px-5 py-3 rounded-xl shadow-lg text-sm font-bold text-white ${toast.type === "error" ? "bg-red-600" : "bg-emerald-600"}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-headline font-extrabold tracking-tight text-[color:var(--color-on-surface)]">Listing Requests</h2>
          <p className="text-[color:var(--color-on-surface-variant)] mt-1">Review client submissions, upload cleaned sheets, and select vendors for sealed bidding.</p>
        </div>
        <div className="relative w-64">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input placeholder="Search listings..." className="input-base pl-10 h-11 text-sm"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Pending Review", value: counts.pending, color: "bg-amber-50", textColor: "text-amber-700", icon: "pending", key: "pending" },
          { label: "Awaiting Client", value: counts.review, color: "bg-blue-50", textColor: "text-blue-700", icon: "hourglass_top", key: "review" },
          { label: "Approved & Active", value: counts.active, color: "bg-emerald-50", textColor: "text-emerald-700", icon: "check_circle", key: "active" },
          { label: "Rejected", value: counts.rejected, color: "bg-red-50", textColor: "text-red-700", icon: "cancel", key: "rejected" },
        ].map(s => (
          <button key={s.key} onClick={() => setFilter(s.key as any)}
            className={`card p-5 flex items-center gap-4 text-left border-2 transition-all ${filter === s.key ? "border-[color:var(--color-primary)]" : "border-transparent"}`}>
            <div className={`w-12 h-12 rounded-xl ${s.color} flex items-center justify-center shrink-0`}>
              <span className={`material-symbols-outlined text-xl ${s.textColor}`}>{s.icon}</span>
            </div>
            <div>
              <p className="text-2xl font-headline font-extrabold text-[color:var(--color-on-surface)]">{s.value}</p>
              <p className="text-xs font-bold text-[color:var(--color-on-surface-variant)] uppercase tracking-widest">{s.label}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 p-1 bg-[color:var(--color-surface-container-low)] rounded-xl w-fit">
        {(["all", "pending", "review", "active", "rejected"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ${
              filter === f ? "bg-white shadow-sm text-[color:var(--color-on-surface)]" : "text-[color:var(--color-on-surface-variant)]"
            }`}>
            {f === "pending" && counts.pending > 0 && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
            {f} {f !== "all" && `(${counts[f] ?? listings.length})`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr className="bg-[color:var(--color-inverse-surface)]">
              {["Listing", "Client", "Category", "Weight", "Submitted", "Status", "Action"].map(h => (
                <th key={h} className="text-white/70 text-[10px] font-bold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-slate-400 italic">No listings found.</td></tr>
            ) : filtered.map(listing => {
              const displayStatus = getDisplayStatus(listing);
              const statusConfig: Record<string, { label: string; className: string }> = {
                pending: { label: "Pending Review", className: "bg-amber-100 text-amber-700" },
                review: { label: "Awaiting Client", className: "bg-blue-100 text-blue-700" },
                active: { label: "Approved", className: "bg-emerald-100 text-emerald-700" },
                rejected: { label: "Rejected", className: "bg-red-100 text-red-700" },
              };
              const sc = statusConfig[displayStatus] ?? { label: displayStatus, className: "bg-slate-100 text-slate-600" };
              const listingBids = bids.filter(b => b.listingId === listing.id);
              const topBid = listingBids.sort((a, b) => b.amount - a.amount)[0];

              return (
                <tr key={listing.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td>
                    <p className="font-bold text-sm text-[color:var(--color-on-surface)] max-w-[220px] truncate">{listing.title}</p>
                    <p className="text-xs text-[color:var(--color-on-surface-variant)]">{listing.location}</p>
                  </td>
                  <td className="text-sm text-[color:var(--color-on-surface-variant)]">{listing.userName || "—"}</td>
                  <td>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 bg-[color:var(--color-secondary-container)] text-[color:var(--color-primary)] rounded-full">
                      {listing.category}
                    </span>
                  </td>
                  <td className="font-mono text-sm">{listing.weight} KG</td>
                  <td className="text-xs text-[color:var(--color-on-surface-variant)]">
                    {listing.createdAt ? new Date(listing.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                  </td>
                  <td>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${sc.className}`}>
                      {sc.label}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2 flex-wrap">
                      {displayStatus === "pending" && (
                        <button
                          onClick={() => openReview(listing.id)}
                          className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 bg-[color:var(--color-primary)] text-white rounded-lg hover:opacity-90 transition-all"
                        >
                          <span className="material-symbols-outlined text-sm">fact_check</span>
                          Review
                        </button>
                      )}
                      {displayStatus === "active" && listing.auctionPhase === "live" && (
                        <Link href={`/admin/auctions/${listing.id}/live`}
                          className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-600 hover:text-white transition-colors border border-purple-200">
                          <span className="material-symbols-outlined text-sm">visibility</span>
                          Watch Live
                        </Link>
                      )}
                      {displayStatus === "active" && listing.auctionPhase !== "live" && listing.auctionPhase !== "completed" && (
                        <Link href={`/admin/listings/${listing.requirementId || listing.id}/audit-docs`}
                          className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-600 hover:text-white transition-colors border border-blue-200">
                          <span className="material-symbols-outlined text-sm">fact_check</span>
                          Audit Docs
                        </Link>
                      )}
                      {displayStatus === "review" && (
                        <span className="text-xs text-[color:var(--color-on-surface-variant)] italic">Waiting for client...</span>
                      )}
                      {topBid && (
                        <span className="text-xs font-bold text-[color:var(--color-primary)]">Top: ₹{topBid.amount.toLocaleString()}</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Review Modal */}
      {reviewModal.open && reviewListing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {reviewModal.step === "decision" ? "Review Listing" : "Upload Sheet & Select Vendors"}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[320px]">{reviewListing.title}</p>
              </div>
              <button onClick={closeModal}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center hover:bg-slate-200 transition-colors">
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Listing summary */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Category", value: reviewListing.category },
                  { label: "Weight", value: `${reviewListing.weight} KG` },
                  { label: "Location", value: reviewListing.location || "—" },
                ].map(d => (
                  <div key={d.label} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{d.label}</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{d.value}</p>
                  </div>
                ))}
              </div>

              {/* ── Step 1: Approve or Reject ── */}
              {reviewModal.step === "decision" && (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      Rejection Reason <span className="text-slate-300">(only if rejecting)</span>
                    </label>
                    <textarea
                      rows={3}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none outline-none focus:border-[color:var(--color-primary)] dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                      placeholder="e.g. Incomplete documentation, wrong category..."
                      value={rejectReason}
                      onChange={e => setRejectReason(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 pt-1">
                    <button
                      onClick={handleReject}
                      disabled={!rejectReason.trim() || saving}
                      className="flex-1 py-3 rounded-xl bg-red-600 text-white text-sm font-black hover:bg-red-700 disabled:opacity-40 flex items-center justify-center gap-2"
                    >
                      {saving
                        ? <><span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>Rejecting...</>
                        : <><span className="material-symbols-outlined text-sm">cancel</span>Reject Listing</>
                      }
                    </button>
                    <button
                      onClick={() => setReviewModal(m => ({ ...m, step: "approve" }))}
                      className="flex-1 py-3 rounded-xl bg-emerald-600 text-white text-sm font-black hover:bg-emerald-700 flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      Approve & Continue →
                    </button>
                  </div>
                </>
              )}

              {/* ── Step 2: Upload cleaned sheet + select vendors ── */}
              {reviewModal.step === "approve" && (
                <>
                  {/* File upload */}
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                      Upload Cleaned Material Sheet <span className="text-red-400">*</span>
                    </p>
                    <div
                      onClick={() => fileRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${
                        sheetFile
                          ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20"
                          : "border-slate-200 hover:border-[color:var(--color-primary)] hover:bg-slate-50 dark:border-slate-700"
                      }`}
                    >
                      <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv,.pdf" className="hidden"
                        onChange={e => setSheetFile(e.target.files?.[0] || null)} />
                      {sheetFile ? (
                        <>
                          <span className="material-symbols-outlined text-3xl text-emerald-600 block mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                          <p className="font-bold text-sm text-emerald-700">{sheetFile.name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{(sheetFile.size / 1024).toFixed(0)} KB · click to change</p>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-4xl text-slate-300 block mb-1">upload_file</span>
                          <p className="text-sm font-bold text-slate-500">Click to upload Excel / CSV / PDF</p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Vendor selection */}
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                      Select Vendors to Invite <span className="text-red-400">*</span>
                      {selectedVendors.length > 0 && (
                        <span className="ml-2 text-[color:var(--color-primary)] normal-case font-bold">{selectedVendors.length} selected</span>
                      )}
                    </p>
                    {activeVendors.length === 0 ? (
                      <p className="text-sm text-slate-400 text-center py-4 border border-dashed border-slate-200 rounded-xl">No active vendors on the platform yet.</p>
                    ) : (
                      <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                        {activeVendors.map(vendor => (
                          <label key={vendor.id}
                            className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                              selectedVendors.includes(vendor.id)
                                ? "border-[color:var(--color-primary)] bg-[color:var(--color-secondary-container)]"
                                : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-500"
                            }`}>
                            <input
                              type="checkbox"
                              className="w-4 h-4 accent-[color:var(--color-primary)] shrink-0"
                              checked={selectedVendors.includes(vendor.id)}
                              onChange={() => toggleVendor(vendor.id)}
                            />
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{vendor.name}</p>
                              <p className="text-[10px] text-slate-400 uppercase tracking-wider truncate">
                                {vendor.onboardingProfile?.companyName || "Registered Vendor"}
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={() => setReviewModal(m => ({ ...m, step: "decision" }))}
                      className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={handleApproveUpload}
                      disabled={!sheetFile || saving}
                      className="flex-1 py-3 rounded-xl bg-[color:var(--color-primary)] text-white text-sm font-black hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2"
                    >
                      {saving
                        ? <><span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>Uploading...</>
                        : <><span className="material-symbols-outlined text-sm">cloud_upload</span>Upload & Notify Client</>
                      }
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
