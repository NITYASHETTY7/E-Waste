"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function ConfigureLiveAuction() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { listings, bids, users, editListing, updateAuctionPhase, addNotification } = useApp();

  const listing = listings.find(l => l.id === id);
  const isFromInvitationWindow = listing?.auctionPhase === 'invitation_window';
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

  const handleStart = () => {
    const errs: Record<string, string> = {};
    if (!form.basePrice) errs.basePrice = "Required";
    if (!form.highestEmdAmount) errs.highestEmdAmount = "Required";
    if (!form.bidIncrement) errs.bidIncrement = "Required";
    if (!form.auctionStartDate) errs.auctionStartDate = "Required";
    if (!form.auctionEndDate) errs.auctionEndDate = "Required";

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    editListing(id, {
      basePrice: Number(form.basePrice),
      highestEmdAmount: Number(form.highestEmdAmount),
      bidIncrement: Number(form.bidIncrement),
      maximumTickSize: Number(form.maximumTickSize) || Number(form.bidIncrement) * 10,
      auctionStartDate: new Date(form.auctionStartDate).toISOString(),
      auctionEndDate: new Date(form.auctionEndDate).toISOString(),
      extensionTime: Number(form.extensionTime),
      maxExtensions: Number(form.maxExtensions),
      auctionPhase: "live"
    });

    addNotification({
      userId: "all_vendors", // Special keyword for global notification or handle in context
      title: "New Live Auction!",
      message: `A live auction for "${listing.title}" has been scheduled.`,
      type: "general"
    });

    router.push("/client/listings");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link href="/client/listings" className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-all">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
        </Link>
        <div>
          <h2 className="text-3xl font-headline font-extrabold tracking-tight text-[color:var(--color-on-surface)]">Schedule Open Bidding</h2>
          <p className="text-[color:var(--color-on-surface-variant)] mt-1">
            {isFromInvitationWindow
              ? "Set base price, tick size, and schedule the live open auction for accepted vendors."
              : "Configure pricing and timing for the open auction phase."}
          </p>
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
              <div>
                <label className="label">Base Price (₹) *</label>
                <input type="number" className={`input-base ${errors.basePrice ? "ring-2 ring-red-400" : ""}`} 
                  value={form.basePrice} onChange={e => setForm({...form, basePrice: e.target.value})} placeholder="Starting bid threshold" />
              </div>
              <div>
                <label className="label">EMD Amount (₹) *</label>
                <input type="number" className={`input-base ${errors.highestEmdAmount ? "ring-2 ring-red-400" : ""}`} 
                  value={form.highestEmdAmount} onChange={e => setForm({...form, highestEmdAmount: e.target.value})} placeholder="Refundable deposit" />
              </div>
              <div>
                <label className="label">Tick Size / Increment (₹) *</label>
                <input type="number" className={`input-base ${errors.bidIncrement ? "ring-2 ring-red-400" : ""}`} 
                  value={form.bidIncrement} onChange={e => setForm({...form, bidIncrement: e.target.value})} placeholder="Min bid jump" />
              </div>
              <div>
                <label className="label">Max Tick Size (₹)</label>
                <input type="number" className="input-base" 
                  value={form.maximumTickSize} onChange={e => setForm({...form, maximumTickSize: e.target.value})} placeholder="Max bid jump (optional)" />
              </div>
            </div>
          </div>

          <div className="card p-6 space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-[color:var(--color-on-surface-variant)] flex items-center gap-2">
              <span className="material-symbols-outlined text-base">timer</span>
              Timing & Extensions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Start Date & Time *</label>
                <input type="datetime-local" className={`input-base ${errors.auctionStartDate ? "ring-2 ring-red-400" : ""}`} 
                  value={form.auctionStartDate} onChange={e => setForm({...form, auctionStartDate: e.target.value})} />
              </div>
              <div>
                <label className="label">End Date & Time *</label>
                <input type="datetime-local" className={`input-base ${errors.auctionEndDate ? "ring-2 ring-red-400" : ""}`} 
                  value={form.auctionEndDate} onChange={e => setForm({...form, auctionEndDate: e.target.value})} />
              </div>
              <div>
                <label className="label">Auto-Extension (Mins)</label>
                <select className="input-base" value={form.extensionTime} onChange={e => setForm({...form, extensionTime: e.target.value})}>
                  <option value="1">1 Minute</option>
                  <option value="3">3 Minutes (Recommended)</option>
                  <option value="5">5 Minutes</option>
                  <option value="10">10 Minutes</option>
                </select>
              </div>
              <div>
                <label className="label">Max Extensions</label>
                <input type="number" className="input-base" value={form.maxExtensions} onChange={e => setForm({...form, maxExtensions: e.target.value})} />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
             <Link href="/client/listings" className="btn-outline flex-1 py-4 rounded-xl text-center">Cancel</Link>
             <button onClick={handleStart} className="btn-tertiary flex-[2] py-4 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg">
                <span className="material-symbols-outlined">{isFromInvitationWindow ? "event_available" : "rocket_launch"}</span>
                {isFromInvitationWindow ? "Schedule Open Bidding" : "Launch Live Auction"}
             </button>
          </div>
        </div>

        <div className="space-y-6">
          {listing.invitedVendorIds && listing.invitedVendorIds.length > 0 && (
            <div className="card p-6 bg-white border border-amber-100">
              <h4 className="text-xs font-black uppercase tracking-widest text-amber-600 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">mail</span>
                Vendor Invitation Responses
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
                <div className="bg-slate-50 p-2 rounded-xl text-center border border-slate-100">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Pending</p>
                  <p className="text-xl font-headline font-bold text-slate-600">{pendingVendors.length}</p>
                </div>
              </div>
              <div className="space-y-2">
                {listing.invitedVendorIds.map(vid => {
                  const vendor = users.find(u => u.id === vid);
                  const response = listing.vendorResponses?.find(r => r.vendorId === vid);
                  return (
                    <div key={vid} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${response?.status === 'interested' ? 'bg-emerald-500' : response?.status === 'declined' ? 'bg-red-500' : 'bg-slate-300'}`} />
                        <p className="text-xs font-bold text-slate-700">{vendor?.name || vid}</p>
                      </div>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${
                        response?.status === 'interested' ? 'bg-emerald-100 text-emerald-700' :
                        response?.status === 'declined' ? 'bg-red-100 text-red-700' :
                        'bg-slate-200 text-slate-500'
                      }`}>
                        {response?.status === 'interested' ? 'Accepted' : response?.status === 'declined' ? 'Declined' : 'No Reply'}
                      </span>
                    </div>
                  );
                })}
              </div>
              {listing.sealedBidStartDate && (
                <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-[9px] font-black uppercase tracking-widest text-blue-600 mb-1">Sealed Bid Window</p>
                  <p className="text-xs font-bold text-blue-800">
                    {new Date(listing.sealedBidStartDate).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    {' → '}
                    {listing.sealedBidEndDate ? new Date(listing.sealedBidEndDate).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                  </p>
                </div>
              )}
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
                    {[...sealedBids].sort((a,b) => b.amount - a.amount).slice(0, 3).map((bid, i) => (
                      <div key={bid.id} className="flex justify-between items-center bg-white/40 p-2 rounded-lg border border-white/20">
                         <span className="text-xs font-bold truncate max-w-[100px]">{bid.vendorName}</span>
                         <span className="text-sm font-headline font-bold">₹{bid.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="pt-2">
                   <p className="text-[10px] italic leading-tight opacity-70">
                     Use these sealed bid values to determine your optimal starting base price and tick size.
                     Generally, a base price close to the median sealed bid encourages more competitive participation.
                   </p>
                </div>
             </div>
          </div>

          <div className="card p-6 border-dashed border-2 border-slate-200 bg-slate-50">
             <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Auction Preview</h4>
             <div className="space-y-3">
                <p className="text-sm font-bold text-slate-800">{listing.title}</p>
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
