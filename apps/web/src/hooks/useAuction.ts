"use client";

import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { Listing, Bid } from '@/types';

export function useAuction(listingId: string) {
  const { listings, bids, addBid, editListing, currentUser, addNotification } = useApp();
  const listing = listings.find(l => l.id === listingId);
  const auctionBids = bids.filter(b => b.listingId === listingId).sort((a, b) => b.amount - a.amount);
  const currentHighBid = auctionBids[0];
  const currentHighAmount = currentHighBid?.amount || listing?.basePrice || 0;

  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isActive, setIsActive] = useState(false);

  // Initialize and update timer
  useEffect(() => {
    if (!listing || listing.auctionPhase !== 'live') {
      setIsActive(false);
      return;
    }

    const calculateTimeLeft = () => {
      const end = new Date(listing.auctionEndDate || '').getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, Math.floor((end - now) / 1000));
      setTimeLeft(diff);
      
      if (diff <= 0 && listing.auctionPhase === 'live') {
        // Auction ended
        // In a real app, this would be handled by the server
        setIsActive(false);
      } else {
        setIsActive(true);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [listing]);

  const placeBid = useCallback((amount: number) => {
    if (!listing || !currentUser) return { success: false, message: 'Not logged in' };
    
    // Validate bid amount
    const minNextBid = currentHighAmount + (listing.bidIncrement || 0);
    if (amount < minNextBid) {
      return { success: false, message: `Minimum bid is ₹${minNextBid.toLocaleString()}` };
    }

    // Check for auto-extension
    const now = new Date();
    const end = new Date(listing.auctionEndDate || '');
    const diffMs = end.getTime() - now.getTime();
    const extensionThresholdMs = (listing.extensionTime || 3) * 60 * 1000;

    let newEndDate = listing.auctionEndDate;
    let newExtensions = listing.currentExtensions || 0;

    const maxTotalExtensionMs = 24 * 60 * 1000; // 24 minutes total cap
    const totalExtendedMs = newExtensions * extensionThresholdMs;

    if (diffMs < extensionThresholdMs && totalExtendedMs < maxTotalExtensionMs) {
      newEndDate = new Date(end.getTime() + extensionThresholdMs).toISOString();
      newExtensions += 1;
      
      editListing(listing.id, {
        auctionEndDate: newEndDate,
        currentExtensions: newExtensions
      });
      
      addNotification({
        userId: listing.userId,
        type: 'general',
        title: 'Auction Extended',
        message: `Auction for ${listing.title} has been extended by ${listing.extensionTime} minutes.`,
      });
    }

    addBid({
      listingId: listing.id,
      vendorId: currentUser.id,
      vendorName: currentUser.name,
      amount,
    });

    return { success: true };
  }, [listing, currentUser, currentHighAmount, addBid, editListing, addNotification]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return {
    listing,
    auctionBids,
    currentHighAmount,
    currentHighBid,
    timeLeft,
    formatTime: formatTime(timeLeft),
    isActive,
    placeBid
  };
}
