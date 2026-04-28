"use client";

import { useApp } from "@/context/AppContext";
import Link from "next/link";

export default function ClientSealedBids() {
  const { listings, bids, currentUser } = useApp();

  // Client's listings that are in sealed_bid or open_configuration phase
  const sealedBidListings = listings.filter(l =>
    l.userId === currentUser?.id &&
    (l.auctionPhase === "sealed_bid" || l.auctionPhase === "open_configuration")
  );

  const getSealedBids = (listingId: string) =>
    bids.filter(b => b.listingId === listingId && b.type === "sealed")
      .sort((a, b) => b.amount - a.amount);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div>
        <h2 className="text-3xl font-headline font-extrabold tracking-tight text-[color:var(--color-on-surface)]">Sealed Bid Review</h2>
        <p className="text-[color:var(--color-on-surface-variant)] mt-1">View vendor sealed bids for your listings. Bids are revealed after the window closes.</p>
      </div>

      {sealedBidListings.length === 0 ? (
        <div className="card p-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
          <span className="material-symbols-outlined text-6xl text-slate-300 mb-4 block">lock</span>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">No Sealed Bid Listings</h3>
          <p className="text-slate-500 mt-2">Sealed bid submissions appear here once vendors respond to your listing.</p>
          <Link href="/client/post" className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90">
            <span className="material-symbols-outlined text-sm">add</span>Post New Listing
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {sealedBidListings.map(listing => {
            const listingBids = getSealedBids(listing.id);
            const topBid = listingBids[0];
            const avgBid = listingBids.length > 0
              ? Math.round(listingBids.reduce((s, b) => s + b.amount, 0) / listingBids.length)
              : 0;

            return (
              <div key={listing.id} className="card p-0 overflow-hidden border border-slate-100 dark:border-slate-800">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-start justify-between gap-4 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-black text-slate-400">{listing.id}</span>
                      <span className="text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase bg-amber-100 text-amber-700">
                        {listing.auctionPhase === "sealed_bid" ? "Bids Open" : "Configuring Auction"}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{listing.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{listing.location} · {listing.weight} KG · Base: ₹{listing.basePrice?.toLocaleString()}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 shrink-0 text-right">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase">Total Bids</p>
                      <p className="text-xl font-black text-slate-900 dark:text-white">{listingBids.length}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase">Highest Bid</p>
                      <p className="text-xl font-black text-primary">{topBid ? `₹${topBid.amount.toLocaleString()}` : "—"}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase">Avg Bid</p>
                      <p className="text-xl font-black text-slate-900 dark:text-white">{avgBid ? `₹${avgBid.toLocaleString()}` : "—"}</p>
                    </div>
                  </div>
                </div>

                {listingBids.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    <span className="material-symbols-outlined text-3xl block mb-2">hourglass_empty</span>
                    <p className="text-sm">Waiting for vendor submissions</p>
                  </div>
                ) : (
                  <div>
                    {/* Bid comparison table */}
                    <div className="divide-y divide-slate-100">
                      <div className="px-5 py-3 grid grid-cols-4 gap-4 bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-widest dark:bg-slate-950">
                        <span>Rank</span>
                        <span>Vendor</span>
                        <span className="text-right">Bid Amount</span>
                        <span className="text-right">vs Base</span>
                      </div>
                      {listingBids.map((bid, idx) => {
                        const diff = listing.basePrice ? bid.amount - listing.basePrice : 0;
                        const pct = listing.basePrice ? ((diff / listing.basePrice) * 100).toFixed(1) : "—";
                        return (
                          <div key={bid.id} className={`px-5 py-4 grid grid-cols-4 gap-4 items-center ${idx === 0 ? "bg-primary/5" : "hover:bg-slate-50/50"}`}>
                            <div className="flex items-center gap-2">
                              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${idx === 0 ? "bg-primary text-white" : "bg-slate-100 text-slate-500"}`}>
                                {idx + 1}
                              </span>
                              {idx === 0 && <span className="text-[9px] font-black text-primary uppercase">Top</span>}
                            </div>
                            <div>
                              <p className="font-bold text-sm text-slate-900 dark:text-white">{bid.vendorName}</p>
                              <p className="text-xs text-slate-400">{new Date(bid.createdAt).toLocaleDateString("en-IN")}</p>
                            </div>
                            <p className={`text-right font-black ${idx === 0 ? "text-primary text-lg" : "text-slate-900"}`}>₹{bid.amount.toLocaleString()}</p>
                            <p className={`text-right text-sm font-bold ${diff >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                              {diff >= 0 ? "+" : ""}{pct}%
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {listing.auctionPhase === "sealed_bid" && listingBids.length > 0 && (
                      <div className="p-4 bg-emerald-50 border-t border-emerald-100 flex items-center gap-3">
                        <span className="material-symbols-outlined text-emerald-600">visibility</span>
                        <p className="text-xs text-emerald-700">
                          <span className="font-bold">{listingBids.length} sealed bids</span> received. Review bids above, then configure the open bidding session.
                        </p>
                        <Link href={`/client/listings/${listing.id}/configure-live`}
                          className="ml-auto px-4 py-2 rounded-xl bg-primary text-white text-xs font-black uppercase hover:bg-primary/90 shrink-0">
                          Configure Open Bidding
                        </Link>
                      </div>
                    )}

                    {listing.auctionPhase === "open_configuration" && (
                      <div className="p-4 bg-blue-50 border-t border-blue-100 flex items-center gap-3">
                        <span className="material-symbols-outlined text-blue-600">info</span>
                        <p className="text-xs text-blue-700">
                          Sealed bid phase complete. Configure the live auction to proceed.
                        </p>
                        <Link href={`/client/listings/${listing.id}/configure-live`}
                          className="ml-auto px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-black uppercase hover:bg-blue-700 shrink-0">
                          Configure Live Auction
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
