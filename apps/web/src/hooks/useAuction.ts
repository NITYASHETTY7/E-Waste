"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { Listing, Bid } from '@/types';
import { useAuctionSocket } from './useAuctionSocket';
import api from '@/lib/api';

export function useAuction(listingId: string, options: { forceConnect?: boolean } = {}) {
  const { listings, bids, addBid, editListing, currentUser, addNotification } = useApp();
  const listing = listings.find(l => l.id === listingId || l.auctionId === listingId);
  const auctionBids = bids.filter(b =>
    b.listingId === listingId ||
    (listing?.auctionId && b.auctionId === listing.auctionId) ||
    b.auctionId === listingId
  ).sort((a, b) => b.amount - a.amount);
  const currentHighBid = auctionBids[0];
  const currentHighAmount = currentHighBid?.amount || listing?.basePrice || 0;

  // REST polling state — used as fallback when socket is slow/disconnected
  const [restBids, setRestBids] = useState<any[]>([]);
  const [restLeaderboard, setRestLeaderboard] = useState<any[]>([]);
  const [isAuctionEndedRest, setIsAuctionEndedRest] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Use WebSocket for live auctions
  const isLive = options.forceConnect || listing?.auctionPhase === 'live';
  const auctionId = listing?.auctionId || listingId;
  const socket = useAuctionSocket({
    auctionId,
    enabled: isLive,
  });

  // Fetch auction state from REST API — called on mount and every 3s as fallback
  const fetchAuctionState = useCallback(async () => {
    if (!auctionId) return;
    try {
      const res = await api.get(`/auctions/${auctionId}`);
      const auction = res.data;
      if (!auction) return;
      const ended = auction.status === 'COMPLETED' || auction.status === 'PENDING_SELECTION';
      setIsAuctionEndedRest(ended);
      if (auction.bids && Array.isArray(auction.bids)) {
        const sorted = [...auction.bids].sort(
          (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        setRestBids(sorted);
        // Build per-vendor leaderboard
        const seen = new Set<string>();
        const lb = [...auction.bids]
          .sort((a: any, b: any) =>
            b.amount !== a.amount ? b.amount - a.amount : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          )
          .filter((b: any) => { if (seen.has(b.vendorId)) return false; seen.add(b.vendorId); return true; });
        setRestLeaderboard(lb);
      }
    } catch {
      // Silently ignore — socket data is primary
    }
  }, [auctionId]);

  // Start polling every 3s for live auctions (REST fallback for real-time bids)
  useEffect(() => {
    if (!isLive || !auctionId) return;
    // Fetch immediately on mount
    fetchAuctionState();
    // Poll every 3 seconds
    pollRef.current = setInterval(fetchAuctionState, 3000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [isLive, auctionId, fetchAuctionState]);

  const [localTimeLeft, setLocalTimeLeft] = useState<number>(0);
  const [isActive, setIsActive] = useState(false);

  // Effective end time: listing.auctionEndDate is authoritative; only accept socket.endTime
  // if it is LATER (i.e. a timer extension fired after the listing was last fetched)
  const listingEndMs = listing?.auctionEndDate ? new Date(listing.auctionEndDate).getTime() : 0;
  const socketEndMs = socket.endTime?.getTime() ?? 0;
  const effectiveEndMs = socketEndMs > listingEndMs ? socketEndMs : listingEndMs;

  const isAuctionCompleted = socket.auctionState?.status === 'COMPLETED' || socket.auctionState?.status === 'PENDING_SELECTION' || isAuctionEndedRest;

  useEffect(() => {
    if (!isLive || !effectiveEndMs || socket.isEnded || isAuctionCompleted) {
      setIsActive(false);
      setLocalTimeLeft(0);
      return;
    }

    const tick = () => {
      const diff = Math.max(0, Math.floor((effectiveEndMs - Date.now()) / 1000));
      setLocalTimeLeft(diff);
      setIsActive(diff > 0);
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [isLive, effectiveEndMs, socket.isEnded, isAuctionCompleted]);

  const timeLeft = localTimeLeft;

  const placeBid = useCallback(async (amount: number) => {
    if (!listing || !currentUser) return { success: false, message: 'Not logged in' };

    if (isLive && socket.connected) {
      // Use WebSocket for live bidding — real-time!
      socket.placeLiveBid(currentUser.id, amount);
      return { success: true };
    }

    // Fallback: sealed bid via REST API
    const minNextBid = currentHighAmount + (listing.bidIncrement || 0);
    if (amount < minNextBid) {
      return { success: false, message: `Minimum bid is ₹${minNextBid.toLocaleString()}` };
    }

    try {
      await addBid(listing.id, amount);
      return { success: true };
    } catch (e: any) {
      return { success: false, message: e?.response?.data?.message || e?.message || 'Failed to place bid' };
    }
  }, [listing, currentUser, currentHighAmount, addBid, isLive, socket]);

  const formatTimeStr = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Priority: socket (real-time) > REST poll (3s fallback) > context bids (30s fallback)
  const socketHasBids = isLive && socket.connected && socket.allBids.length > 0;
  const restHasBids = restBids.length > 0;

  const effectiveAllBids = socketHasBids
    ? socket.allBids
    : restHasBids
    ? restBids
    : [...auctionBids].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  // Top bid per vendor for leaderboard / current high
  const effectiveLeaderboard = socketHasBids
    ? socket.leaderboard
    : restHasBids
    ? restLeaderboard
    : auctionBids;

  const effectiveHighBid = effectiveLeaderboard[0] || currentHighBid;
  const effectiveHighAmount = effectiveHighBid?.amount || currentHighAmount;

  return {
    listing,
    auctionBids: effectiveAllBids,
    leaderboard: effectiveLeaderboard,
    currentHighAmount: effectiveHighAmount,
    currentHighBid: effectiveHighBid,
    timeLeft,
    formatTime: formatTimeStr(localTimeLeft),
    isActive,
    placeBid,
    // Real-time extras
    isConnected: socket.connected,
    extensionCount: socket.extensionCount,
    bidError: socket.bidError,
    latestBid: socket.latestBid,
    announcedWinnerId: socket.announcedWinnerId,
    approvedWinnerId: socket.approvedWinnerId,
  };
}
