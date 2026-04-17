"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Listing, Bid, AppState, UserRole, Notification, OnboardingProfile, BankDetails, UploadedDoc } from '@/types';

interface AppContextType extends AppState {
  login: (role: UserRole, name: string) => void;
  logout: () => void;
  register: (role: UserRole, name: string, email: string) => void;
  startOnboarding: (role: 'client' | 'vendor', email: string, password: string) => void;
  saveOnboardingProfile: (profile: OnboardingProfile) => void;
  saveOnboardingDocuments: (docs: UploadedDoc[]) => void;
  saveOnboardingBankDetails: (bank: BankDetails) => void;
  completeOnboarding: () => void;
  addListing: (listing: Omit<Listing, 'id' | 'createdAt' | 'status'>) => void;
  addBid: (bid: Omit<Bid, 'id' | 'createdAt' | 'status'>) => void;
  updateListingStatus: (id: string, status: Listing['status'], reason?: string) => void;
  updateAuctionPhase: (id: string, phase: Listing['auctionPhase']) => void;
  updateBidStatus: (id: string, status: Bid['status'], reason?: string) => void;
  updateUserStatus: (id: string, status: User['status'], reason?: string) => void;
  assignVendor: (listingId: string, vendorId: string) => void;
  acceptBid: (bidId: string) => void;
  addNotification: (n: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  editListing: (id: string, updates: Partial<Listing>) => void;
  editBid: (id: string, updates: Partial<Bid>) => void;
  addClosingDocument: (listingId: string, doc: { name: string; url: string; type: string; timestamp: string }) => void;
  updateUserProfile: (updates: Partial<User>) => void;
  changePassword: (newPassword: string) => void;
  deleteAccount: () => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'weconnect_state_v10';

const MOCK_LISTINGS: Listing[] = [
  {
    id: 'ECO18951', title: 'Batch of CRT Monitors and Mixed eWaste (15 Units)', category: 'Display Units', subCategory: 'ITAssets',
    weight: 1500, location: 'Bengaluru Global Village', locationType: 'STPI', status: 'active', userId: 'C1',
    userName: 'Tech Corp Ltd', description: 'End of life IT hardware including legacy CRT monitors, thick-client workstations, and broken peripherals.',
    createdAt: '2026-04-10T10:00:00.000Z', urgency: 'medium', bidCount: 4, viewCount: 124,
    auctionStartDate: '2026-04-16T08:00:00.000Z',
    auctionEndDate: '2026-04-17T18:00:00.000Z',
    auctionPhase: 'live', basePrice: 21000, bidIncrement: 500, highestEmdAmount: 5000,
    images: ['https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&w=800&q=80']
  },
  {
    id: 'ECO18950', title: 'Decommissioned Server Rack Components', category: 'IT Equipment', subCategory: 'DataCenter Assets',
    weight: 4200, location: 'Bengaluru Whitefield (STPI)', locationType: 'SEZ / STPI', status: 'active', userId: 'C2',
    userName: 'Global Infra Pvt Ltd', description: 'Includes storage drives (drilled), network switches, and redundant power supplies. Vendor must possess Category 1 handling certification.',
    createdAt: '2026-04-14T14:30:00.000Z', urgency: 'high', bidCount: 2, viewCount: 89,
    auctionPhase: 'sealed_bid', basePrice: 135000, highestEmdAmount: 25000,
    images: ['https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80']
  },
  {
    id: 'ECO18937', title: 'Lithium Battery Storage Cell Block', category: 'Batteries', subCategory: 'UPS Systems',
    weight: 850, location: 'Harman International-Bangalore', locationType: 'Corporate Park', status: 'completed', userId: 'C1',
    userName: 'Tech Corp Ltd', description: 'Used backup laptop battery matrices and UPS cell columns. 240 units total. Partially functional.',
    createdAt: '2026-04-01T09:15:00.000Z', urgency: 'low', bidCount: 8, viewCount: 210,
    auctionPhase: 'completed', basePrice: 42000, bidIncrement: 2000, highestEmdAmount: 10000,
    images: ['https://images.unsplash.com/photo-1563298723-dcfebaa392e3?auto=format&fit=crop&w=800&q=80']
  },
  {
    id: 'ECO18910', title: 'Legacy Workstations (Pentium Era)', category: 'Laptops & PCs',
    weight: 2200, location: 'Whitefield, Bangalore', status: 'completed', userId: 'C1',
    userName: 'Tech Corp Ltd', description: 'Bulk removal of 85 legacy tower PCs. Very old hardware, intended for scrap value only.',
    createdAt: '2026-03-15T11:00:00.000Z', urgency: 'low', bidCount: 5, viewCount: 145,
    auctionPhase: 'completed', basePrice: 15000, bidIncrement: 1000,
    images: ['https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80']
  },
  {
    id: 'ECO18905', title: 'Redundant Power Distribution Units', category: 'Power Equipment',
    weight: 950, location: 'Hydrabad, HITEC City', status: 'completed', userId: 'C2',
    userName: 'Global Infra Pvt Ltd', description: 'Heavy duty rack-mount PDUs. Industrial grade copper content.',
    createdAt: '2026-03-01T16:45:00.000Z', urgency: 'medium', bidCount: 7, viewCount: 92,
    auctionPhase: 'completed', basePrice: 65000, bidIncrement: 2500,
    images: ['https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=800&q=80']
  },
  {
    id: 'ECO18960', title: 'Mixed Office IT Scrap (Laptops & Peripherals)', category: 'Laptops & PCs',
    weight: 450, location: 'Electronic City, Bangalore', status: 'active', userId: 'C1',
    userName: 'Tech Corp Ltd', description: 'Assorted lot of 25 Dell laptops (Latitude series), 15 HP keyboards, and 10 Logitech mice. Non-functional.',
    createdAt: '2026-04-15T12:00:00.000Z', urgency: 'medium', bidCount: 0, viewCount: 15,
    auctionPhase: 'sealed_bid', basePrice: 85000, highestEmdAmount: 15000,
    images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80']
  },
  {
    id: 'ECO18972', title: 'Industrial Copper Wiring and Connectors', category: 'Cables & Wiring',
    weight: 3200, location: 'Peenya Industrial Area', status: 'active', userId: 'C3',
    userName: 'Manufacturing Hub', description: 'Stripped copper wiring from decommissioned production line. High-grade industrial quality.',
    createdAt: '2026-04-12T08:00:00.000Z', urgency: 'low', bidCount: 5, viewCount: 78,
    auctionPhase: 'live',
    auctionStartDate: '2026-04-16T10:00:00.000Z',
    auctionEndDate: '2026-04-18T10:00:00.000Z',
    basePrice: 450000, bidIncrement: 5000, highestEmdAmount: 50000,
    images: ['https://images.unsplash.com/photo-1558494949-ef010cbdcc48?auto=format&fit=crop&w=800&q=80']
  },
  {
    id: 'ECO18980', title: 'Legacy Telecom Equipment (Base Stations)', category: 'Other',
    weight: 8500, location: 'Manesar, Haryana', status: 'active', userId: 'C2',
    userName: 'Global Infra Pvt Ltd', description: 'Decommissioned 2G/3G base station hardware. Heavy metal enclosures. Mixed PCB content.',
    createdAt: '2026-04-06T14:00:00.000Z', urgency: 'low', bidCount: 12, viewCount: 156,
    auctionPhase: 'completed', basePrice: 1200000, bidIncrement: 10000,
    images: ['https://images.unsplash.com/photo-1516397281156-ca07cf9746fc?auto=format&fit=crop&w=800&q=80']
  },
  {
    id: 'ECO18985', title: 'Batch of 100+ Smartphones (Mixed Brands)', category: 'Mobile Devices',
    weight: 25, location: 'Gurgaon, Sector 44', status: 'active', userId: 'C1',
    userName: 'Tech Corp Ltd', description: 'Mixed lot of corporate smartphones (iPhone, Samsung, Pixel). Screen damage or battery issues in 80% units.',
    createdAt: '2026-04-16T12:00:00.000Z', urgency: 'high', bidCount: 3, viewCount: 45,
    auctionPhase: 'sealed_bid', basePrice: 250000, highestEmdAmount: 30000,
    images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80']
  },
  {
    id: 'ECO18990', title: 'Used Laser Printers and Photocopiers', category: 'Printers',
    weight: 1200, location: 'Mumbai, BKC', status: 'active', userId: 'C1',
    userName: 'Tech Corp Ltd', description: 'Bulk lot of 12 enterprise photcopiers and 45 laser printers. Mostly functional but old.',
    createdAt: '2026-04-13T10:00:00.000Z', urgency: 'medium', bidCount: 0, viewCount: 34,
    auctionPhase: 'sealed_bid', basePrice: 300000, highestEmdAmount: 40000,
    images: ['https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=800&q=80']
  }
];

const MOCK_BIDS: Bid[] = [
  { id: 'B1-0', listingId: 'ECO18951', vendorId: 'V1', vendorName: 'Green Recyclers Pvt Ltd', amount: 21200, status: 'pending', type: 'open', createdAt: '2026-04-16T14:45:00.000Z' },
  { id: 'B2-0', listingId: 'ECO18951', vendorId: 'V2', vendorName: 'EcoMetal Solutions', amount: 21400, status: 'pending', type: 'open', createdAt: '2026-04-16T14:50:00.000Z' },
  { id: 'B1-1', listingId: 'ECO18951', vendorId: 'V1', vendorName: 'Green Recyclers Pvt Ltd', amount: 21800, status: 'pending', type: 'open', createdAt: '2026-04-16T15:10:00.000Z' },
  { id: 'B2-1', listingId: 'ECO18951', vendorId: 'V2', vendorName: 'EcoMetal Solutions', amount: 22100, status: 'pending', type: 'open', createdAt: '2026-04-16T15:20:00.000Z' },
  { id: 'B1', listingId: 'ECO18951', vendorId: 'V1', vendorName: 'Green Recyclers Pvt Ltd', amount: 22500, status: 'pending', type: 'open', createdAt: '2026-04-16T15:30:00.000Z' },
  { id: 'B2', listingId: 'ECO18951', vendorId: 'V2', vendorName: 'EcoMetal Solutions', amount: 22600, status: 'pending', type: 'open', createdAt: '2026-04-16T15:35:00.000Z' },
  { id: 'B3-0', listingId: 'ECO18951', vendorId: 'V3', vendorName: 'RecycleFirst India', amount: 22800, status: 'pending', type: 'open', createdAt: '2026-04-16T15:45:00.000Z' },
  { id: 'B11', listingId: 'ECO18951', vendorId: 'V3', vendorName: 'RecycleFirst India', amount: 23000, status: 'pending', type: 'open', createdAt: '2026-04-16T15:50:00.000Z' },
  { id: 'B3', listingId: 'ECO18950', vendorId: 'V1', vendorName: 'Green Recyclers Pvt Ltd', amount: 145000, status: 'pending', type: 'sealed', createdAt: '2026-04-16T14:00:00.000Z' },
  { id: 'B4', listingId: 'ECO18950', vendorId: 'V3', vendorName: 'RecycleFirst India', amount: 152000, status: 'pending', type: 'sealed', createdAt: '2026-04-16T12:00:00.000Z' },
  { id: 'B5', listingId: 'ECO18937', vendorId: 'V1', vendorName: 'Green Recyclers Pvt Ltd', amount: 48000, status: 'accepted', type: 'open', createdAt: '2026-04-12T11:00:00.000Z' },
  { id: 'B6', listingId: 'ECO18972', vendorId: 'V2', vendorName: 'EcoMetal Solutions', amount: 465000, status: 'pending', type: 'open', createdAt: '2026-04-16T15:00:00.000Z' },
  { id: 'B7', listingId: 'ECO18972', vendorId: 'V1', vendorName: 'Green Recyclers Pvt Ltd', amount: 470000, status: 'pending', type: 'open', createdAt: '2026-04-16T15:40:00.000Z' },
  { id: 'B8', listingId: 'ECO18980', vendorId: 'V3', vendorName: 'RecycleFirst India', amount: 1350000, status: 'accepted', type: 'open', createdAt: '2026-04-14T10:00:00.000Z' },
  { id: 'B12', listingId: 'ECO18910', vendorId: 'V2', vendorName: 'EcoMetal Solutions', amount: 18500, status: 'accepted', type: 'open', createdAt: '2026-03-20T11:00:00.000Z' },
  { id: 'B13', listingId: 'ECO18905', vendorId: 'V1', vendorName: 'Green Recyclers Pvt Ltd', amount: 72000, status: 'accepted', type: 'open', createdAt: '2026-03-05T14:00:00.000Z' },
  { id: 'B9', listingId: 'ECO18985', vendorId: 'V1', vendorName: 'Green Recyclers Pvt Ltd', amount: 260000, status: 'pending', type: 'sealed', createdAt: '2026-04-16T15:00:00.000Z' },
  { id: 'B10', listingId: 'ECO18985', vendorId: 'V2', vendorName: 'EcoMetal Solutions', amount: 255000, status: 'pending', type: 'sealed', createdAt: '2026-04-16T14:00:00.000Z' },
];

const MOCK_USERS: User[] = [
  { id: 'A1', name: 'Super Admin', role: 'admin', email: 'admin@weconnect.com', status: 'active', registeredAt: '2026-02-15T10:00:00.000Z', onboardingStep: 5 },
  { id: 'C1', name: 'Tech Corp Ltd', role: 'client', email: 'client@weconnect.com', status: 'active', phone: '+91 98765 43210', registeredAt: '2026-03-01T10:00:00.000Z', onboardingStep: 5 },
  { id: 'C2', name: 'Global Infra Pvt Ltd', role: 'client', email: 'info@globalinfra.com', status: 'active', phone: '+91 87654 32109', registeredAt: '2026-03-15T10:00:00.000Z', onboardingStep: 5 },
  { id: 'C3', name: 'Manufacturing Hub', role: 'client', email: 'ops@manhub.com', status: 'active', phone: '+91 76543 21098', registeredAt: '2026-03-25T10:00:00.000Z', onboardingStep: 5 },
  { id: 'V1', name: 'Green Recyclers Pvt Ltd', role: 'vendor', email: 'vendor@weconnect.com', status: 'active', phone: '+91 76543 21098', registeredAt: '2026-03-05T10:00:00.000Z', onboardingStep: 5 },
  { id: 'V2', name: 'EcoMetal Solutions', role: 'vendor', email: 'info@ecometal.com', status: 'active', phone: '+91 65432 10987', registeredAt: '2026-03-20T10:00:00.000Z', onboardingStep: 5 },
  { id: 'V3', name: 'RecycleFirst India', role: 'vendor', email: 'ops@recyclefirst.in', status: 'active', phone: '+91 54321 09876', registeredAt: '2026-04-01T10:00:00.000Z', onboardingStep: 5 },
  { id: 'V4', name: 'PureRecovery Solutions', role: 'vendor', email: 'contact@purerecovery.com', status: 'pending', phone: '+91 43210 98765', registeredAt: '2026-04-14T10:00:00.000Z', onboardingStep: 4 },
  { id: 'V5', name: 'Urban Miners', role: 'vendor', email: 'hello@urbanminers.com', status: 'pending', phone: '+91 32109 87654', registeredAt: '2026-04-15T10:00:00.000Z', onboardingStep: 2 },
  { id: 'G1', name: 'Individual User', role: 'guest', email: 'guest@weconnect.com', status: 'active', registeredAt: '2026-04-16T13:00:00.000Z', onboardingStep: 5 },
];

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'N1', userId: 'C1', type: 'bid_received', title: 'New Bid Received', message: 'Green Recyclers placed a bid of ₹22,500 on your CRT Monitor listing.', read: false, createdAt: '2026-04-16T15:45:00.000Z' },
  { id: 'N2', userId: 'C1', type: 'bid_received', title: 'New Bid Received', message: 'EcoMetal Solutions placed a bid of ₹21,500 on your CRT Monitor listing.', read: false, createdAt: '2026-04-16T15:15:00.000Z' },
  { id: 'N3', userId: 'V1', type: 'bid_accepted', title: 'Bid Accepted!', message: 'Your bid of ₹48,000 on Battery Storage Block has been accepted.', read: true, createdAt: '2026-04-13T10:00:00.000Z' },
  { id: 'N4', userId: 'C3', type: 'bid_received', title: 'Live Bid Received', message: 'Green Recyclers just bid ₹470,000 on Industrial Copper Wiring.', read: false, createdAt: '2026-04-16T15:40:00.000Z' },
  { id: 'N5', userId: 'V4', type: 'account_approved', title: 'Account Under Review', message: 'Admin is currently reviewing your documents.', read: false, createdAt: '2026-04-15T10:00:00.000Z' },
  { id: 'N6', userId: 'C1', type: 'bid_received', title: 'Highest Bid Alert', message: 'RecycleFirst India just placed a new high bid on CRT Monitors.', read: false, createdAt: '2026-04-16T15:50:00.000Z' },
];

const initialState: AppState = {
  currentUser: null,
  listings: [],
  bids: [],
  users: [],
  notifications: [],
  pendingOnboardingRole: undefined,
  pendingOnboardingEmail: undefined,
  pendingOnboardingPassword: undefined,
  isSidebarOpen: false,
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setState(prev => ({
          ...initialState,
          ...parsed,
          listings: parsed.listings?.length ? parsed.listings : initialState.listings,
          users: parsed.users?.length ? parsed.users : initialState.users,
          bids: parsed.bids?.length ? parsed.bids : initialState.bids,
          notifications: parsed.notifications?.length ? parsed.notifications : initialState.notifications,
          currentUser: parsed.currentUser || null,
        }));
      }
    } catch (e) {
      console.error('Failed to load saved state', e);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, isInitialized]);

  const login = (role: UserRole, identifier: string) => {
    const isDemoEmail = ['admin@weconnect.com', 'client@weconnect.com', 'vendor@weconnect.com', 'guest@weconnect.com'].includes(identifier.toLowerCase());
    if (isDemoEmail) {
      const demoUser = MOCK_USERS.find(u => u.email === identifier.toLowerCase());
      if (demoUser) {
        setState(prev => ({
          ...prev,
          currentUser: demoUser,
          listings: MOCK_LISTINGS,
          bids: MOCK_BIDS,
          users: MOCK_USERS,
          notifications: MOCK_NOTIFICATIONS
        }));
        return;
      }
    }

    const existing = state.users.find(u => 
      (u.name.toLowerCase() === identifier.toLowerCase() || u.email.toLowerCase() === identifier.toLowerCase()) 
      && u.role === role
    );
    if (existing) {
      setState(prev => ({ ...prev, currentUser: existing }));
    } else {
      const newUser: User = {
        id: `${role[0].toUpperCase()}${Date.now()}`, name: identifier, role,
        email: identifier.includes('@') ? identifier : `${identifier.toLowerCase().replace(/\s/g, '.')}@example.com`,
        status: role === 'vendor' ? 'pending' : 'active',
        onboardingStep: 1,
        registeredAt: new Date().toISOString(),
      };
      setState(prev => ({ ...prev, currentUser: newUser, users: [...prev.users, newUser] }));
    }
  };

  const register = (role: UserRole, name: string, email: string) => {
    const newUser: User = {
      id: `${role[0].toUpperCase()}${Date.now()}`, name, role, email,
      status: role === 'vendor' ? 'pending' : 'active',
      onboardingStep: 1,
      registeredAt: new Date().toISOString(),
    };
    setState(prev => ({ 
      ...initialState,
      currentUser: newUser, 
      users: [newUser],
      listings: [],
      bids: [],
      notifications: []
    }));
  };

  const startOnboarding = (role: 'client' | 'vendor', email: string, password: string) => {
    setState(prev => ({
      ...prev,
      pendingOnboardingRole: role,
      pendingOnboardingEmail: email,
      pendingOnboardingPassword: password,
    }));
  };

  const saveOnboardingProfile = (profile: OnboardingProfile) => {
    setState(prev => {
      if (!prev.currentUser) {
        const role = prev.pendingOnboardingRole || 'client';
        const newUser: User = {
          id: `${role[0].toUpperCase()}${Date.now()}`,
          name: profile.companyName,
          role,
          email: prev.pendingOnboardingEmail || profile.email,
          phone: profile.phone,
          status: 'pending',
          onboardingStep: 2,
          onboardingProfile: profile,
          registeredAt: new Date().toISOString(),
        };
        return { ...prev, currentUser: newUser, users: [...prev.users, newUser] };
      }
      const updated = { ...prev.currentUser, onboardingProfile: profile, onboardingStep: 2 };
      return {
        ...prev, currentUser: updated,
        users: prev.users.map(u => u.id === updated.id ? updated : u),
      };
    });
  };

  const saveOnboardingDocuments = (docs: UploadedDoc[]) => {
    setState(prev => {
      if (!prev.currentUser) return prev;
      const updated = { ...prev.currentUser, documents: docs, onboardingStep: 3 };
      return { ...prev, currentUser: updated, users: prev.users.map(u => u.id === updated.id ? updated : u) };
    });
  };

  const saveOnboardingBankDetails = (bank: BankDetails) => {
    setState(prev => {
      if (!prev.currentUser) return prev;
      const updated = { ...prev.currentUser, bankDetails: bank, onboardingStep: 4 };
      return { ...prev, currentUser: updated, users: prev.users.map(u => u.id === updated.id ? updated : u) };
    });
  };

  const completeOnboarding = () => {
    setState(prev => {
      if (!prev.currentUser) return prev;
      const role = prev.currentUser.role;
      const updated = {
        ...prev.currentUser,
        onboardingStep: 5,
        status: role === 'vendor' ? 'pending' as const : 'active' as const,
      };
      return {
        ...prev, currentUser: updated,
        users: prev.users.map(u => u.id === updated.id ? updated : u),
        pendingOnboardingRole: undefined,
        pendingOnboardingEmail: undefined,
        pendingOnboardingPassword: undefined,
      };
    });
  };

  const logout = () => {
    setState(prev => ({ ...prev, currentUser: null }));
  };

  const addListing = (listing: Omit<Listing, 'id' | 'createdAt' | 'status'>) => {
    const newListing: Listing = {
      ...listing, id: `L${Date.now()}`,
      createdAt: new Date().toISOString(), status: 'pending', bidCount: 0, viewCount: 0,
      auctionPhase: 'sealed_bid',
    };
    setState(prev => ({ 
      ...prev, 
      listings: [newListing, ...prev.listings],
      notifications: [...prev.notifications, ...prev.users.filter(u => u.role === 'admin').map(admin => ({
        id: `N${Date.now()}${admin.id}`, userId: admin.id, type: 'general' as const, title: 'New Listing Review', message: `A new e-waste listing "${listing.title}" is pending your review.`, read: false, createdAt: new Date().toISOString()
      }))]
    }));
  };

  const addBid = (bid: Omit<Bid, 'id' | 'createdAt' | 'status'>) => {
    const listing = state.listings.find(l => l.id === bid.listingId);
    const bidType = (listing?.auctionPhase === 'sealed_bid') ? 'sealed' : 'open';
    const newBid: Bid = { ...bid, id: `B${Date.now()}`, createdAt: new Date().toISOString(), status: 'pending', type: bidType };
    setState(prev => ({
      ...prev,
      bids: [newBid, ...prev.bids],
      listings: prev.listings.map(l => l.id === bid.listingId ? { ...l, bidCount: (l.bidCount || 0) + 1 } : l),
    }));
  };

  const acceptBid = (bidId: string) => {
    setState(prev => {
      const bid = prev.bids.find(b => b.id === bidId);
      if (!bid) return prev;
      return {
        ...prev,
        bids: prev.bids.map(b => b.id === bidId ? { ...b, status: 'accepted' } : b.listingId === bid.listingId ? { ...b, status: 'rejected' } : b),
        listings: prev.listings.map(l => l.id === bid.listingId ? { ...l, status: 'completed', auctionPhase: 'completed' } : l),
      };
    });
  };

  const updateListingStatus = (id: string, status: Listing['status'], reason?: string) => {
    setState(prev => ({ 
      ...prev, 
      listings: prev.listings.map(l => l.id === id ? { ...l, status, statusReason: reason } : l),
      notifications: status !== 'pending' ? [...prev.notifications, {
        id: `N${Date.now()}`, userId: prev.listings.find(l => l.id === id)?.userId || '', type: 'general' as const, title: `Listing ${status.charAt(0).toUpperCase() + status.slice(1)}`, message: `Your listing status has been updated to ${status}. ${reason || ''}`, read: false, createdAt: new Date().toISOString()
      }] : prev.notifications
    }));
  };

  const updateAuctionPhase = (id: string, phase: Listing['auctionPhase']) => {
    setState(prev => ({ ...prev, listings: prev.listings.map(l => l.id === id ? { ...l, auctionPhase: phase } : l) }));
  };

  const editListing = (id: string, updates: Partial<Listing>) => {
    setState(prev => ({ ...prev, listings: prev.listings.map(l => l.id === id ? { ...l, ...updates } : l) }));
  };

  const editBid = (id: string, updates: Partial<Bid>) => {
    setState(prev => ({ ...prev, bids: prev.bids.map(b => b.id === id ? { ...b, ...updates } : b) }));
  };

  const updateBidStatus = (id: string, status: Bid['status'], reason?: string) => {
    setState(prev => ({ 
      ...prev, 
      bids: prev.bids.map(b => b.id === id ? { ...b, status, statusReason: reason } : b),
      notifications: [...prev.notifications, {
        id: `N${Date.now()}`, userId: prev.bids.find(b => b.id === id)?.vendorId || '', type: 'general' as const, title: `Bid ${status.charAt(0).toUpperCase() + status.slice(1)}`, message: `Your bid status has been updated to ${status}. ${reason || ''}`, read: false, createdAt: new Date().toISOString()
      }]
    }));
  };

  const updateUserStatus = (id: string, status: User['status'], reason?: string) => {
    setState(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === id ? { ...u, status, statusReason: reason } : u),
      currentUser: prev.currentUser?.id === id ? { ...prev.currentUser, status } : prev.currentUser,
      notifications: [...prev.notifications, {
        id: `N${Date.now()}`, userId: id, type: 'general' as const, title: `Account ${status.charAt(0).toUpperCase() + status.slice(1)}`, message: `Your account status has been updated to ${status}. ${reason || ''}`, read: false, createdAt: new Date().toISOString()
      }]
    }));
  };

  const assignVendor = (listingId: string, vendorId: string) => {
    setState(prev => ({
      ...prev,
      listings: prev.listings.map(l => l.id === listingId ? { ...l, assignedVendorId: vendorId, status: 'verified' } : l),
      notifications: [...prev.notifications, {
        id: `N${Date.now()}`, userId: vendorId, type: 'general' as const, title: 'New Assignment', message: `You have been assigned to listing ${listingId}.`, read: false, createdAt: new Date().toISOString()
      }]
    }));
  };

  const updateUserProfile = (updates: Partial<User>) => {
    setState(prev => {
      if (!prev.currentUser) return prev;
      const updatedUser = { ...prev.currentUser, ...updates };
      return {
        ...prev,
        currentUser: updatedUser,
        users: prev.users.map(u => u.id === updatedUser.id ? updatedUser : u),
      };
    });
  };

  const changePassword = (newPassword: string) => {
    setState(prev => {
      if (!prev.currentUser) return prev;
      const updatedUser = { ...prev.currentUser, password: newPassword };
      return {
        ...prev,
        currentUser: updatedUser,
        users: prev.users.map(u => u.id === updatedUser.id ? updatedUser : u),
      };
    });
  };

  const deleteAccount = () => {
    setState(prev => {
      if (!prev.currentUser) return prev;
      const userId = prev.currentUser.id;
      return {
        ...prev,
        currentUser: null,
        users: prev.users.filter(u => u.id !== userId),
        listings: prev.listings.filter(l => l.userId !== userId),
      };
    });
  };

  const addNotification = (n: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const newN: Notification = { ...n, id: `N${Date.now()}`, createdAt: new Date().toISOString(), read: false };
    setState(prev => ({ ...prev, notifications: [newN, ...prev.notifications] }));
  };

  const markNotificationRead = (id: string) => {
    setState(prev => ({ ...prev, notifications: prev.notifications.map(n => n.id === id ? { ...n, read: true } : n) }));
  };

  const addClosingDocument = (listingId: string, doc: { name: string; url: string; type: string; timestamp: string }) => {
    setState(prev => ({
      ...prev,
      listings: prev.listings.map(l => l.id === listingId ? { 
        ...l, 
        closingDocuments: [...(l.closingDocuments || []), { ...doc, timestamp: new Date().toISOString() }] 
      } : l)
    }));
  };

  return (
    <AppContext.Provider value={{
      ...state,
      login, logout, register, startOnboarding,
      saveOnboardingProfile, saveOnboardingDocuments, saveOnboardingBankDetails, completeOnboarding,
      addListing, addBid, updateListingStatus, updateAuctionPhase, updateBidStatus, updateUserStatus, assignVendor,
      acceptBid, addNotification, markNotificationRead, editListing,
      editBid, addClosingDocument, updateUserProfile, changePassword, deleteAccount,
      isSidebarOpen: state.isSidebarOpen ?? false,
      setIsSidebarOpen: (open: boolean) => setState(prev => ({ ...prev, isSidebarOpen: open })),
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
