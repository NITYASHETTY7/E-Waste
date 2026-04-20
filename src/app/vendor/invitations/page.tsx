"use client";

import { useApp } from "@/context/AppContext";
import Link from "next/link";
import { formatDate, formatTime } from "@/utils/format";

export default function VendorInvitations() {
  const { listings, currentUser } = useApp();

  // Filter listings where vendor is invited but hasn't responded yet
  const invitationListings = listings.filter(l => 
    l.auctionPhase === 'invitation_window' && 
    l.invitedVendorIds?.includes(currentUser?.id || "") &&
    !l.vendorResponses?.some(r => r.vendorId === currentUser?.id)
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div>
        <h2 className="text-3xl font-headline font-extrabold tracking-tight text-[color:var(--color-on-surface)]">Direct Invitations</h2>
        <p className="text-[color:var(--color-on-surface-variant)] mt-1">Exclusive auction opportunities hand-picked for you.</p>
      </div>

      {invitationListings.length === 0 ? (
        <div className="card p-20 text-center bg-white/50 border-dashed border-2 border-slate-200">
           <span className="material-symbols-outlined text-6xl text-slate-300 mb-4 block">mail</span>
           <h3 className="text-xl font-bold text-slate-900">No Pending Invitations</h3>
           <p className="text-slate-500 mt-2">You don't have any new invitations at the moment. Keep an eye on your inbox!</p>
           <Link href="/vendor/marketplace" className="btn-primary inline-flex items-center gap-2 mt-6 px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest bg-slate-900 text-white">
              <span className="material-symbols-outlined text-sm text-amber-400">explore</span>
              Explore Market
           </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {invitationListings.map(listing => (
            <div key={listing.id} className="card p-0 flex flex-col group overflow-hidden border-2 border-blue-500/20 bg-blue-50/10">
               <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-4 mb-4">
                     <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                           <span className="px-2 py-0.5 bg-blue-600 text-white rounded text-[8px] font-black uppercase tracking-widest">New Invitation</span>
                           <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">{listing.category}</span>
                        </div>
                        <h3 className="text-xl font-headline font-extrabold text-slate-900 line-clamp-1">{listing.title}</h3>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">location_on</span>
                          {listing.location}
                        </p>
                     </div>
                     <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-200">
                        <span className="material-symbols-outlined">mail</span>
                     </div>
                  </div>

                  <div className="bg-white/60 rounded-xl p-4 mb-6 border border-blue-100">
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Available Qty</p>
                           <p className="text-sm font-bold text-slate-900">{listing.weight} KG</p>
                        </div>
                        <div>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Est. Value</p>
                           <p className="text-sm font-bold text-[color:var(--color-primary)]">₹{listing.basePrice?.toLocaleString()}</p>
                        </div>
                     </div>
                  </div>

                  {listing.invitationDeadline && (
                     <div className="flex items-center gap-2 text-[10px] font-bold text-red-600 uppercase tracking-widest mb-6 px-1">
                        <span className="material-symbols-outlined text-xs animate-pulse">timer</span>
                        Deadline: {formatDate(new Date(listing.invitationDeadline))} {formatTime(new Date(listing.invitationDeadline))}
                     </div>
                  )}

                  <div className="mt-auto pt-6 border-t border-blue-100">
                     <Link href={`/vendor/marketplace/${listing.id}`} className="btn-primary w-full py-4 rounded-xl text-xs font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 group-hover:shadow-xl group-hover:shadow-blue-200 transition-all">
                        View Invitation
                        <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                     </Link>
                  </div>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
