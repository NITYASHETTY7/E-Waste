"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Listing } from "@/types";
import Link from "next/link";

export default function ClientListings() {
  const { listings, bids, currentUser, updateListingStatus, editListing } = useApp();
  const [filter, setFilter] = useState<"all" | "sealed" | "live" | "ended">("all");
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<{title: string; weight: number | string; basePrice: number | string; bidIncrement: number | string; description: string}>({title: "", weight: 0, basePrice: 0, bidIncrement: 0, description: ""});

  const myListings = listings.filter(l => l.userId === currentUser?.id);
  
  const getDisplayStatus = (listing: Listing) => {
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
           description: editForm.description
        });
     }
     setIsEditing(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-headline font-extrabold tracking-tight text-[color:var(--color-on-surface)]">My Inventory & Auctions</h2>
          <p className="text-[color:var(--color-on-surface-variant)] mt-1">Monitor sealed bids, configure live events, and audit concluded sales.</p>
        </div>
        <Link href="/client/post" className="btn-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">add</span>
          New Listing
        </Link>
      </div>

      <div className="flex gap-1 p-1 bg-[color:var(--color-surface-container-low)] rounded-xl w-fit">
        {(["all", "sealed", "live", "ended"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
              filter === f ? "bg-white text-[color:var(--color-on-surface)] shadow-sm" : "text-[color:var(--color-on-surface-variant)]"
            }`}>
            {f} {f === "all" ? `(${myListings.length})` : `(${myListings.filter(l => getDisplayStatus(l) === f).length})`}
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
            const topBid = listingBids.sort((a, b) => b.amount - a.amount)[0];
            const displayStatus = getDisplayStatus(listing);
            const currentPrice = topBid?.amount || listing.basePrice || 0;

            return (
              <div key={listing.id} className="card p-0 overflow-hidden hover:shadow-lg transition-all flex flex-col md:flex-row">
                {listing.images && listing.images.length > 0 && (
                  <div className="w-full md:w-72 h-52 md:h-auto bg-slate-100 relative shrink-0">
                    <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                    <div className="absolute top-3 left-3 flex gap-2">
                       <span className={`pill shadow-lg backdrop-blur-md ${
                        displayStatus === "live" ? "bg-red-600 text-white animate-pulse" :
                        displayStatus === "sealed" ? "bg-blue-600 text-white" : "bg-slate-800 text-white"
                      }`}>
                        {displayStatus === "live" ? "🔥 LIVE AUCTION" : displayStatus === "sealed" ? "🛡️ SEALED PHASE" : "COMPLETED"}
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
                    
                    <div className="text-right bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl min-w-[150px]">
                       <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-0.5">
                         {displayStatus === "sealed" ? "Est. Base Price" : "Current Price"}
                       </p>
                       <p className="font-headline font-bold text-slate-900 text-xl">₹{currentPrice.toLocaleString()}</p>
                       {displayStatus === "live" && (
                         <p className="text-[9px] text-[color:var(--color-primary)] font-black uppercase tracking-tighter mt-1">+{listing.bidIncrement?.toLocaleString()} Tick Size</p>
                       )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-6">
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
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-[color:var(--color-outline-variant)]/20">
                    <div className="flex items-center gap-2">
                       <button onClick={() => openDetails(listing)} className="btn-outline text-[11px] py-2 px-4 uppercase tracking-widest font-black">Details</button>
                    </div>
                    <div className="flex gap-2">
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

      {/* View/Edit Details Modal (unchanged but integrated) */}
      {selectedListingId && (() => {
         const listing = listings.find(l => l.id === selectedListingId);
         if (!listing) return null;
         const displayStatus = getDisplayStatus(listing);

         return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedListingId(null)}>
               <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-[color:var(--color-outline-variant)]/20">
                     <h3 className="text-2xl font-headline font-extrabold text-[color:var(--color-on-surface)] flex items-center gap-2">
                        <span className="material-symbols-outlined text-[color:var(--color-primary)]">inventory_2</span> 
                        {isEditing ? "Edit Listing" : "Inventory Details"}
                     </h3>
                     <button onClick={() => setSelectedListingId(null)} className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
                        <span className="material-symbols-outlined text-xl">close</span>
                     </button>
                  </div>

                  <div className="space-y-6">
                     <div className="card bg-slate-50 border-none p-6">
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
                                    <p className="font-bold text-slate-900 text-lg">{listing.title}</p>
                                 </div>
                                 <div className="grid grid-cols-2 gap-4">
                                    <div>
                                       <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Net Weight</p>
                                       <p className="font-bold text-slate-900">{listing.weight} KG</p>
                                    </div>
                                    <div>
                                       <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Category Segment</p>
                                       <p className="font-bold text-slate-900">{listing.category}</p>
                                    </div>
                                 </div>
                                 <div>
                                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Lot Description</p>
                                    <p className="text-sm text-slate-600 leading-relaxed">{listing.description}</p>
                                 </div>
                              </>
                           )}
                        </div>
                     </div>

                     <div className="card bg-slate-50 border-none p-6">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">Financial State</h4>
                        <div className="grid grid-cols-2 gap-6">
                           <div>
                              <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Base Price</p>
                              <p className="text-2xl font-headline font-bold text-slate-900">₹{listing.basePrice?.toLocaleString() || "TBD"}</p>
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
                              <div key={idx} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl">
                                 <span className="material-symbols-outlined text-red-500">description</span>
                                 <span className="text-xs font-bold text-slate-700 truncate flex-1">{doc.name}</span>
                                 <a href={doc.url} download className="material-symbols-outlined text-slate-400 hover:text-[color:var(--color-primary)] transition-colors">download</a>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 italic">No legal documents attached to this lot.</p>
                        )}
                     </div>

                     <div className="flex gap-3 pt-6 border-t border-slate-100">
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
