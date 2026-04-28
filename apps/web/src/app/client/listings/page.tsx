"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Listing } from "@/types";
import Link from "next/link";

const fmtDate = (iso?: string) => iso ? new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : null;

export default function ClientListings() {
  const { listings, bids, users, currentUser, updateListingStatus, editListing } = useApp();
  const [filter, setFilter] = useState<"all" | "invites" | "sealed" | "live" | "ended">("all");
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<{title: string; weight: number | string; basePrice: number | string; bidIncrement: number | string; description: string}>({title: "", weight: 0, basePrice: 0, bidIncrement: 0, description: ""});

  const myListings = listings.filter(l => l.userId === currentUser?.id);

  const getDisplayStatus = (listing: Listing) => {
    if (listing.auctionPhase === 'invitation_window') return "invites";
    if (listing.auctionPhase === 'sealed_bid') return "sealed";
    if (listing.auctionPhase === 'live') return "live";
    if (listing.auctionPhase === 'completed') return "ended";
    return "sealed";
  };

  const filtered = filter === "all"
    ? myListings
    : myListings.filter(l => getDisplayStatus(l) === filter);

  const urgencyColors = {
    high: "bg-red-100 text-red-700",
    medium: "bg-amber-100 text-amber-700",
    low: "bg-emerald-100 text-emerald-700",
  };

  const openDetails = (listing: Listing) => {
    setSelectedListingId(listing.id);
    setIsEditing(false);
    setEditForm({
      title: listing.title,
      weight: listing.weight,
      basePrice: listing.basePrice || "",
      bidIncrement: listing.bidIncrement || "",
      description: listing.description
    });
  };

  const handleEditSave = () => {
    if (selectedListingId) {
      editListing(selectedListingId, {
        title: editForm.title,
        weight: Number(editForm.weight),
        basePrice: Number(editForm.basePrice),
        bidIncrement: Number(editForm.bidIncrement),
        description: editForm.description,
        status: 'pending',
        adminStatus: 'pending'
      });
    }
    setIsEditing(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-headline font-extrabold tracking-tight text-[color:var(--color-on-surface)]">My Inventory & Auctions</h2>
          <p className="text-[color:var(--color-on-surface-variant)] mt-1">Monitor invitations, sealed bids, live events, and concluded sales.</p>
        </div>
        <Link href="/client/post" className="btn-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">add</span>
          New Listing
        </Link>
      </div>

      <div className="flex gap-1 p-1 bg-[color:var(--color-surface-container-low)] rounded-xl w-fit">
        {(["all", "invites", "sealed", "live", "ended"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
              filter === f ? "bg-white text-[color:var(--color-on-surface)] shadow-sm" : "text-[color:var(--color-on-surface-variant)]"
            }`}>
            {f === "all" ? `All (${myListings.length})` : `${f} (${myListings.filter(l => getDisplayStatus(l) === f).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <span className="material-symbols-outlined text-6xl text-slate-200 block mb-4">gavel</span>
          <h3 className="text-xl font-headline font-bold text-[color:var(--color-on-surface)] mb-2">No Items Found</h3>
          <p className="text-[color:var(--color-on-surface-variant)] mb-6">List your e-waste to begin the transparent bidding process.</p>
          <Link href="/client/post" className="btn-primary inline-flex">Post E-Waste Now</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {filtered.map(listing => {
            const listingBids = bids.filter(b => b.listingId === listing.id);
            const sealedBids = listingBids.filter(b => b.type === "sealed");
            const openBids = listingBids.filter(b => b.type === "open");
            const topBid = [...listingBids].sort((a, b) => b.amount - a.amount)[0];
            const displayStatus = getDisplayStatus(listing);
            const currentPrice = topBid?.amount || listing.basePrice || 0;

            const interestedCount = listing.vendorResponses?.filter(r => r.status === 'interested').length || 0;
            const declinedCount = listing.vendorResponses?.filter(r => r.status === 'declined').length || 0;
            const totalInvited = listing.invitedVendorIds?.length || 0;

            return (
              <div key={listing.id} className="card p-0 overflow-hidden hover:shadow-lg transition-all flex flex-col md:flex-row">
                {listing.images && listing.images.length > 0 && (
                  <div className="w-full md:w-72 h-52 md:h-auto bg-slate-100 relative shrink-0 dark:bg-slate-800">
                    <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className={`pill shadow-lg backdrop-blur-md ${
                        displayStatus === "live" ? "bg-red-600 text-white animate-pulse" :
                        displayStatus === "invites" ? "bg-amber-600 text-white" :
                        displayStatus === "sealed" ? "bg-blue-600 text-white" : "bg-slate-800 text-white"
                      }`}>
                        {displayStatus === "live" ? "🔥 LIVE AUCTION" :
                         displayStatus === "invites" ? "✉️ INVITATION PHASE" :
                         displayStatus === "sealed" ? "🛡️ SEALED PHASE" : "COMPLETED"}
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-headline font-bold text-xl text-[color:var(--color-on-surface)]">{listing.title}</h3>
                        {listing.urgency && (
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${urgencyColors[listing.urgency]}`}>
                            {listing.urgency}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-[color:var(--color-on-surface-variant)]">
                        <span className="flex items-center gap-1 font-bold"><span className="material-symbols-outlined text-sm">category</span>{listing.category}</span>
                        <span className="flex items-center gap-1 font-bold"><span className="material-symbols-outlined text-sm">scale</span>{listing.weight} KG</span>
                      </div>
                    </div>

                    <div className="text-right bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl min-w-[150px] dark:bg-slate-950 dark:border-slate-800">
                      <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-0.5">
                        {displayStatus === "invites" ? "Base Price" : displayStatus === "sealed" ? "Est. Base Price" : "Current Price"}
                      </p>
                      <p className="font-headline font-bold text-slate-900 text-xl dark:text-white">₹{currentPrice.toLocaleString()}</p>
                      {displayStatus === "live" && (
                        <p className="text-[9px] text-[color:var(--color-primary)] font-black uppercase tracking-tighter mt-1">+{listing.bidIncrement?.toLocaleString()} Tick Size</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {displayStatus === "invites" ? (
                      <>
                        <div className="bg-amber-50/50 rounded-lg p-3 border border-amber-100/50">
                          <p className="text-[10px] uppercase font-black text-amber-600 tracking-widest mb-1">Accepted</p>
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-amber-500">how_to_reg</span>
                            <span className="text-lg font-headline font-bold text-amber-900">{interestedCount} / {totalInvited}</span>
                          </div>
                        </div>
                        <div className="bg-red-50/50 rounded-lg p-3 border border-red-100/50">
                          <p className="text-[10px] uppercase font-black text-red-600 tracking-widest mb-1">Declined</p>
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-red-500">cancel</span>
                            <span className="text-lg font-headline font-bold text-red-900">{declinedCount}</span>
                          </div>
                        </div>
                        {listing.sealedBidStartDate && (
                          <div className="col-span-2 bg-blue-50/50 rounded-lg p-3 border border-blue-100/50">
                            <p className="text-[10px] uppercase font-black text-blue-600 tracking-widest mb-1">Sealed Bid Window</p>
                            <p className="text-xs font-bold text-blue-900">{fmtDate(listing.sealedBidStartDate)} → {fmtDate(listing.sealedBidEndDate)}</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="bg-blue-50/50 rounded-lg p-3 border border-blue-100/50">
                          <p className="text-[10px] uppercase font-black text-blue-600 tracking-widest mb-1">Sealed Bids</p>
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-blue-500">lock</span>
                            <span className="text-lg font-headline font-bold text-blue-900">{sealedBids.length}</span>
                          </div>
                        </div>
                        <div className="bg-red-50/50 rounded-lg p-3 border border-red-100/50">
                          <p className="text-[10px] uppercase font-black text-red-600 tracking-widest mb-1">Live Bids</p>
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-red-500">sensors</span>
                            <span className="text-lg font-headline font-bold text-red-900">{openBids.length}</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-[color:var(--color-outline-variant)]/20">
                    <button onClick={() => openDetails(listing)} className="btn-outline text-[11px] py-2 px-4 uppercase tracking-widest font-black">Details</button>
                    <div className="flex gap-2">
                      {displayStatus === "invites" && (
                        <Link
                          href={`/client/listings/${listing.id}/configure-live`}
                          className="btn-primary text-[11px] py-2.5 px-5 uppercase tracking-widest font-black shadow-md flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 border-none">
                          <span className="material-symbols-outlined text-sm">event_available</span>
                          Schedule Open Bidding
                        </Link>
                      )}
                      {displayStatus === "sealed" && (
                        <Link href={`/client/listings/${listing.id}/configure-live`}
                          className="btn-tertiary text-[11px] py-2.5 px-6 uppercase tracking-widest font-black shadow-md flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm">settings_input_component</span>
                          Configure Live
                        </Link>
                      )}
                      {displayStatus === "live" && (
                        <Link href="/client/live-auction" className="btn-primary text-[11px] py-2.5 px-6 uppercase tracking-widest font-black shadow-md flex items-center gap-2 bg-red-600 hover:bg-red-700">
                          <span className="material-symbols-outlined text-sm">monitoring</span>
                          Monitor Live
                        </Link>
                      )}
                      <Link href="/client/bids" className="btn-outline text-[11px] py-2.5 px-6 uppercase tracking-widest font-black">Ledger</Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedListingId && (() => {
        const listing = listings.find(l => l.id === selectedListingId);
        if (!listing) return null;
        const displayStatus = getDisplayStatus(listing);

        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedListingId(null)}>
            <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl dark:bg-slate-900" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[color:var(--color-outline-variant)]/20">
                <h3 className="text-2xl font-headline font-extrabold text-[color:var(--color-on-surface)] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[color:var(--color-primary)]">inventory_2</span>
                  {isEditing ? "Edit Listing" : "Inventory Details"}
                </h3>
                <button onClick={() => setSelectedListingId(null)} className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors dark:bg-slate-800">
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              <div className="space-y-6">
                <div className="card bg-slate-50 border-none p-6 dark:bg-slate-950">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">Material Characteristics</h4>
                  <div className="space-y-4">
                    {isEditing ? (
                      <>
                        <div>
                          <label className="label">Listing Title</label>
                          <input className="input-base" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="label">Weight (KG)</label>
                            <input type="number" className="input-base" value={editForm.weight} onChange={e => setEditForm({...editForm, weight: e.target.value})} />
                          </div>
                        </div>
                        <div>
                          <label className="label">Description</label>
                          <textarea rows={3} className="input-base" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} />
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Declared Title</p>
                          <p className="font-bold text-slate-900 text-lg dark:text-white">{listing.title}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Net Weight</p>
                            <p className="font-bold text-slate-900 dark:text-white">{listing.weight} KG</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Category Segment</p>
                            <p className="font-bold text-slate-900 dark:text-white">{listing.category}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Lot Description</p>
                          <p className="text-sm text-slate-600 leading-relaxed dark:text-slate-400">{listing.description}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {displayStatus === "invites" && listing.invitedVendorIds && listing.invitedVendorIds.length > 0 && (
                  <div className="card bg-amber-50/30 border-amber-100 p-6">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 mb-4">Vendor Invitation Responses</h4>
                    <div className="space-y-2">
                      {listing.invitedVendorIds.map(vid => {
                        const vendor = users.find(u => u.id === vid);
                        const response = listing.vendorResponses?.find(r => r.vendorId === vid);
                        return (
                          <div key={vid} className="flex items-center justify-between p-3 bg-white rounded-xl border border-amber-100 dark:bg-slate-900">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center font-black text-amber-800 text-sm">{(vendor?.name || "?")[0]}</div>
                              <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{vendor?.name || vid}</p>
                            </div>
                            <span className={`pill text-[10px] ${
                              response?.status === 'interested' ? 'pill-success' :
                              response?.status === 'declined' ? 'pill-error' : 'pill-warning'
                            }`}>
                              {response?.status || 'Pending'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="card bg-slate-50 border-none p-6 dark:bg-slate-950">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">Financial State</h4>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Base Price</p>
                      <p className="text-2xl font-headline font-bold text-slate-900 dark:text-white">₹{listing.basePrice?.toLocaleString() || "TBD"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Active Tick Size</p>
                      <p className="text-2xl font-headline font-bold text-[color:var(--color-primary)]">{listing.bidIncrement ? `+ ₹${listing.bidIncrement.toLocaleString()}` : "TBD"}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Compliance Documents</h4>
                  {listing.documents && listing.documents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {listing.documents.map((doc, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl dark:bg-slate-900 dark:border-slate-700">
                          <span className="material-symbols-outlined text-red-500">description</span>
                          <span className="text-xs font-bold text-slate-700 truncate flex-1 dark:text-slate-300">{doc.name}</span>
                          <a href={doc.url} download className="material-symbols-outlined text-slate-400 hover:text-[color:var(--color-primary)] transition-colors">download</a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No legal documents attached to this lot.</p>
                  )}
                </div>

                <div className="flex gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                  {isEditing ? (
                    <>
                      <button onClick={() => setIsEditing(false)} className="btn-outline flex-1 py-3 uppercase text-[11px] font-black">Cancel</button>
                      <button onClick={handleEditSave} className="btn-primary flex-1 py-3 uppercase text-[11px] font-black">Save Changes</button>
                    </>
                  ) : (
                    displayStatus !== "ended" && <button onClick={() => setIsEditing(true)} className="btn-outline w-full py-3 uppercase text-[11px] font-black">Edit Listing Details</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
