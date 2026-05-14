"use client";

import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { Listing, Bid } from '@/types';
import { useAuctionSocket } from './useAuctionSocket';

export function useAuction(listingId: string) {
  const { listings, bids, addBid, editListing, currentUser, addNotification } = useApp();
  const listing = listings.find(l => l.id === listingId);
  const auctionBids = bids.filter(b =>
    b.listingId === listingId ||
    (listing?.auctionId && b.auctionId === listing.auctionId) ||
    b.auctionId === listingId
  ).sort((a, b) => b.amount - a.amount);
  const currentHighBid = auctionBids[0];
  const currentHighAmount = currentHighBid?.amount || listing?.basePrice || 0;

  // Use WebSocket for live auctions
  const isLive = listing?.auctionPhase === 'live';
  const socket = useAuctionSocket({
    auctionId: listingId,
    enabled: isLive,
  });

  const [localTimeLeft, setLocalTimeLeft] = useState<number>(0);
  const [isActive, setIsActive] = useState(false);

  // Use socket time when live, local countdown otherwise
  // eslint-disable-next-line
  useEffect(() => {
    if (isLive && socket.connected) {
      // WebSocket is handling the timer
      setIsActive(socket.isActive);
      return;
    }

    if (!listing || listing.auctionPhase !== 'live') {
      setIsActive(false);
      return;
    }

    const calculateTimeLeft = () => {
      const end = new Date(listing.auctionEndDate || '').getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, Math.floor((end - now) / 1000));
      setLocalTimeLeft(diff);

      if (diff <= 0 && listing.auctionPhase === 'live') {
        setIsActive(false);
      } else {
        setIsActive(true);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [listing, isLive, socket.connected, socket.isActive]);

  const timeLeft = isLive && socket.connected ? socket.timeLeft : localTimeLeft;

  const placeBid = useCallback((amount: number) => {
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

    addBid(listing.id, amount);
    return { success: true };
  }, [listing, currentUser, currentHighAmount, addBid, isLive, socket]);

  const formatTimeStr = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Merge socket leaderboard with local bids for the best view
  const effectiveLeaderboard = isLive && socket.connected && socket.leaderboard.length > 0
    ? socket.leaderboard
    : auctionBids;

  return {
    listing,
    auctionBids: effectiveLeaderboard,
    currentHighAmount: isLive && socket.connected && socket.leaderboard[0]
      ? socket.leaderboard[0].amount
      : currentHighAmount,
    currentHighBid,
    timeLeft,
    formatTime: isLive && socket.connected ? socket.formattedTime : formatTimeStr(localTimeLeft),
    isActive,
    placeBid,
    // Real-time extras
    isConnected: socket.connected,
    extensionCount: socket.extensionCount,
    bidError: socket.bidError,
    latestBid: socket.latestBid,
  };
}
