"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface AuctionBid {
  id: string;
  auctionId: string;
  vendorId: string;
  amount: number;
  phase: string;
  rank?: number;
  createdAt: string;
  vendor?: { id: string; name: string };
}

interface LeaderboardEntry extends AuctionBid {}

interface UseAuctionSocketOptions {
  auctionId: string;
  enabled?: boolean;
}

export function useAuctionSocket({ auctionId, enabled = true }: UseAuctionSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [auctionState, setAuctionState] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [latestBid, setLatestBid] = useState<AuctionBid | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [extensionCount, setExtensionCount] = useState(0);
  const [bidError, setBidError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  // Connect to the WebSocket
  useEffect(() => {
    if (!enabled || !auctionId) return;

    const socket = io(`${API_URL}/auction`, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      // Join the auction room
      socket.emit('joinAuction', { auctionId });
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    // Receive full auction state on join
    socket.on('auctionState', (auction: any) => {
      setAuctionState(auction);
      if (auction.openPhaseEnd) {
        setEndTime(new Date(auction.openPhaseEnd));
      }
      setExtensionCount(auction.extensionCount || 0);
      // Build initial leaderboard from existing bids
      if (auction.bids) {
        const seen = new Set<string>();
        const lb = auction.bids
          .sort((a: AuctionBid, b: AuctionBid) => b.amount - a.amount)
          .filter((b: AuctionBid) => {
            if (seen.has(b.vendorId)) return false;
            seen.add(b.vendorId);
            return true;
          });
        setLeaderboard(lb);
      }
    });

    // Receive new bid + updated leaderboard
    socket.on('newBid', (data: { bid: AuctionBid; leaderboard: LeaderboardEntry[] }) => {
      setLatestBid(data.bid);
      setLeaderboard(data.leaderboard);
      setBidError(null);
    });

    // Timer extended
    socket.on('timerExtended', (data: { newEndTime: string; extensionCount: number }) => {
      setEndTime(new Date(data.newEndTime));
      setExtensionCount(data.extensionCount);
    });

    // Bid error
    socket.on('bidError', (data: { message: string }) => {
      setBidError(data.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [auctionId, enabled]);

  // Countdown timer
  useEffect(() => {
    if (!endTime) return;

    const tick = () => {
      const now = new Date().getTime();
      const diff = Math.max(0, Math.floor((endTime.getTime() - now) / 1000));
      setTimeLeft(diff);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  // Place a live bid via WebSocket
  const placeLiveBid = useCallback(
    (vendorId: string, amount: number) => {
      if (!socketRef.current || !connected) {
        setBidError('Not connected to auction server');
        return;
      }
      setBidError(null);
      socketRef.current.emit('placeBid', { auctionId, vendorId, amount });
    },
    [auctionId, connected],
  );

  const formatTime = useCallback((seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }, []);

  return {
    connected,
    auctionState,
    leaderboard,
    latestBid,
    endTime,
    extensionCount,
    bidError,
    timeLeft,
    formattedTime: formatTime(timeLeft),
    isActive: timeLeft > 0,
    placeLiveBid,
  };
}
