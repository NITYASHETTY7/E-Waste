"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";

export default function ConfigureLiveAuction() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { listings, bids, users, editListing, refreshData } = useApp();

  const listing = listings.find(l => l.id === id);
  const sealedBids = bids.filter(b => b.listingId === id && b.type === "sealed");
  const interestedVendors = listing?.vendorResponses?.filter(r => r.status === 'interested') || [];
  const declinedVendors = listing?.vendorResponses?.filter(r => r.status === 'declined') || [];
  const pendingVendors = (listing?.invitedVendorIds || []).filter(
    vid => !listing?.vendorResponses?.find(r => r.vendorId === vid)
  );
  const sealedBidAvg = sealedBids.length > 0 ? Math.round(sealedBids.reduce((s, b) => s + b.amount, 0) / sealedBids.length) : 0;
  const sealedBidMax = sealedBids.length > 0 ? Math.max(...sealedBids.map(b => b.amount)) : 0;
  const sealedBidMin = sealedBids.length > 0 ? Math.min(...sealedBids.map(b => b.amount)) : 0;

  const [form, setForm] = useState({
    basePrice: "",
    highestEmdAmount: "",
    bidIncrement: "",
    maximumTickSize: "",
    auctionStartDate: "",
    auctionEndDate: "",
    extensionTime: "3",
    maxExtensions: "24"
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (listing) {
      setForm({
        basePrice: listing.basePrice?.toString() || "",
        highestEmdAmount: listing.highestEmdAmount?.toString() || "",
        bidIncrement: listing.bidIncrement?.toString() || "",
        maximumTickSize: listing.maximumTickSize?.toString() || "",
        auctionStartDate: listing.auctionStartDate ? listing.auctionStartDate.slice(0, 16) : "",
        auctionEndDate: listing.auctionEndDate ? listing.auctionEndDate.slice(0, 16) : "",
        extensionTime: listing.extensionTime?.toString() || "3",
        maxExtensions: listing.maxExtensions?.toString() || "24"
      });
    }
  }, [listing]);

  if (!listing) return <div className="p-20 text-center">Listing not found</div>;

  const handleApprove = async () => {
    setSaving(true);
    setSaveError(null);

    try {
      const requirementId = listing.requirementId || id;
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/requirements/${requirementId}/client-approve-live`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Approval failed.");
      }

      editListing(id, { liveConfigured: true, auctionPhase: 'live' });
      await refreshData().catch(() => {});
      router.push("/client/listings");
    } catch (err: any) {
      setSaveError(err?.message || err?.response?.data?.message || "Failed to approve. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link href="/client/listings" className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-all dark:bg-slate-900 dark:border-slate-700">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
        </Link>
        <div>
          <h2 className="text-3xl font-headline font-extrabold tracking-tight text-[color:var(--color-on-surface)]">Review Live Bidding Parameters</h2>
          <p className="text-[color:var(--color-on-surface-variant)] mt-1">Review the parameters set by the admin and approve to start the live open auction.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6 space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-[color:var(--color-on-surface-variant)] flex items-center gap-2">
              <span className="material-symbols-outlined text-base">settings</span>
              Auction Governance
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl dark:bg-slate-900">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Base Price</label>
                <p className="text-lg font-bold text-slate-900 dark:text-white">₹{form.basePrice || "Not Set"}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl dark:bg-slate-900">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">EMD Amount</label>
                <p className="text-lg font-bold text-slate-900 dark:text-white">₹{form.highestEmdAmount || "Not Set"}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl dark:bg-slate-900">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tick Size / Increment</label>
                <p className="text-lg font-bold text-slate-900 dark:text-white">₹{form.bidIncrement || "Not Set"}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl dark:bg-slate-900">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Max Tick Size</label>
                <p className="text-lg font-bold text-slate-900 dark:text-white">₹{form.maximumTickSize || "No Limit"}</p>
              </div>
            </div>
          </div>

          <div className="card p-6 space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-[color:var(--color-on-surface-variant)] flex items-center gap-2">
              <span className="material-symbols-outlined text-base">timer</span>
              Live Auction Timing
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl dark:bg-slate-900">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Start Date & Time</label>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  {form.auctionStartDate ? new Date(form.auctionStartDate).toLocaleString() : "Not Set"}
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl dark:bg-slate-900">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">End Date & Time</label>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  {form.auctionEndDate ? new Date(form.auctionEndDate).toLocaleString() : "Not Set"}
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl dark:bg-slate-900">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Auto-Extension</label>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{form.extensionTime} Minutes</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl dark:bg-slate-900">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Max Extensions</label>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{form.maxExtensions}</p>
              </div>
            </div>
          </div>

          {saveError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm shrink-0">error</span>
              {saveError}
            </div>
          )}

          <div className="flex gap-4">
            <Link href="/client/listings" className="btn-outline flex-1 py-4 rounded-xl text-center">Cancel</Link>
            <button onClick={handleApprove} disabled={saving}
              className="btn-tertiary flex-[2] py-4 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg disabled:opacity-60">
              {saving
                ? <><span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>Approving...</>
                : <><span className="material-symbols-outlined">check_circle</span>Approve Live Auction Parameters</>
              }
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {listing.invitedVendorIds && listing.invitedVendorIds.length > 0 && (
            <div className="card p-6 bg-white border border-amber-100 dark:bg-slate-900">
              <h4 className="text-xs font-black uppercase tracking-widest text-amber-600 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">mail</span>
                Invited Vendors
              </h4>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-emerald-50 p-2 rounded-xl text-center border border-emerald-100">
                  <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Accepted</p>
                  <p className="text-xl font-headline font-bold text-emerald-700">{interestedVendors.length}</p>
                </div>
                <div className="bg-red-50 p-2 rounded-xl text-center border border-red-100">
                  <p className="text-[9px] font-black uppercase tracking-widest text-red-600">Declined</p>
                  <p className="text-xl font-headline font-bold text-red-700">{declinedVendors.length}</p>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl text-center border border-slate-100 dark:bg-slate-950 dark:border-slate-800">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Invited</p>
                  <p className="text-xl font-headline font-bold text-slate-600 dark:text-slate-400">{listing.invitedVendorIds.length}</p>
                </div>
              </div>
              <div className="space-y-2">
                {listing.invitedVendorIds.map(vid => {
                  const vendor = users.find(u => u.id === vid);
                  const response = listing.vendorResponses?.find(r => r.vendorId === vid);
                  return (
                    <div key={vid} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100 dark:bg-slate-950 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${response?.status === 'interested' ? 'bg-emerald-500' : response?.status === 'declined' ? 'bg-red-500' : 'bg-slate-300'}`} />
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{vendor?.name || vid}</p>
                      </div>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${
                        response?.status === 'interested' ? 'bg-emerald-100 text-emerald-700' :
                        response?.status === 'declined' ? 'bg-red-100 text-red-700' :
                        'bg-slate-200 text-slate-500'
                      }`}>
                        {response?.status === 'interested' ? 'Accepted' : response?.status === 'declined' ? 'Declined' : 'Invited'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="card p-6 bg-[color:var(--color-primary-container)] text-[color:var(--color-on-primary-container)]">
            <h4 className="text-xs font-black uppercase tracking-widest opacity-70 mb-4">Sealed Bid Intelligence</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-end border-b border-[color:var(--color-on-primary-container)]/10 pb-4">
                <p className="text-xs font-bold">Total Bids Received</p>
                <p className="text-2xl font-headline font-bold">{sealedBids.length}</p>
              </div>
              {sealedBids.length > 0 && (
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Bid Range & Average</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white/40 p-2 rounded-lg text-center">
                      <p className="text-[9px] opacity-60 uppercase font-black">Min</p>
                      <p className="text-xs font-headline font-bold">₹{(sealedBidMin/1000).toFixed(0)}k</p>
                    </div>
                    <div className="bg-white/60 p-2 rounded-lg text-center border border-white/40">
                      <p className="text-[9px] opacity-60 uppercase font-black">Avg</p>
                      <p className="text-xs font-headline font-bold">₹{(sealedBidAvg/1000).toFixed(0)}k</p>
                    </div>
                    <div className="bg-white/40 p-2 rounded-lg text-center">
                      <p className="text-[9px] opacity-60 uppercase font-black">Max</p>
                      <p className="text-xs font-headline font-bold">₹{(sealedBidMax/1000).toFixed(0)}k</p>
                    </div>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-2">Top Bids</p>
                  {[...sealedBids].sort((a,b) => b.amount - a.amount).slice(0, 3).map((bid) => (
                    <div key={bid.id} className="flex justify-between items-center bg-white/40 p-2 rounded-lg border border-white/20">
                      <span className="text-xs font-bold truncate max-w-[100px]">{bid.vendorName}</span>
                      <span className="text-sm font-headline font-bold">₹{bid.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="pt-2">
                <p className="text-[10px] italic leading-tight opacity-70">
                  Use sealed bid values to set your optimal base price and tick size.
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6 border-dashed border-2 border-slate-200 bg-slate-50 dark:bg-slate-950 dark:border-slate-700">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Auction Preview</h4>
            <div className="space-y-3">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{listing.title}</p>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="material-symbols-outlined text-sm">scale</span> {listing.weight} KG
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="material-symbols-outlined text-sm">location_on</span> {listing.location}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
