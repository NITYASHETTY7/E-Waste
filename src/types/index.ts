export type UserRole = 'client' | 'vendor' | 'admin' | 'guest' | 'consumer';

export interface UploadedDoc {
  name: string;
  fileName: string;
  size: string;
  uploadedAt: string;
  status: 'pending' | 'verified' | 'rejected';
  url?: string;
}

export interface BankDetails {
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountType: 'current' | 'savings';
  cancelledCheque?: UploadedDoc;
}

export interface OnboardingProfile {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  // Vendor specific
  companyRegistrationNo?: string;
  processingCapacity?: string;
  materialSpecializations?: string[];
  cpcbNo?: string;
  // Client specific
  gstin?: string;
  industrySector?: string;
  numberOfEmployees?: string;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  password?: string;
  phone?: string;
  avatar?: string;
  status: 'active' | 'pending' | 'rejected' | 'disabled' | 'on-hold';
  statusReason?: string;
  onboardingStep: number; // 1-4, or 5 = complete
  onboardingProfile?: OnboardingProfile;
  documents?: UploadedDoc[];
  bankDetails?: BankDetails;
  registeredAt?: string;
}

export interface Listing {
  id: string;
  title: string;
  category: string;
  subCategory?: string;
  weight: number;
  location: string;
  locationType?: string;
  status: 'pending' | 'verified' | 'active' | 'completed' | 'cancelled' | 'rejected' | 'on-hold';
  statusReason?: string;
  adminStatus?: 'pending' | 'accepted' | 'rejected';
  assignedVendorId?: string;
  assignedVendorName?: string;
  auctionPhase?: 'draft' | 'invitation_window' | 'sealed_bid' | 'open_configuration' | 'live' | 'completed';
  invitedVendorIds?: string[];
  vendorResponses?: { vendorId: string; status: 'interested' | 'declined'; respondedAt?: string }[];
  price?: number;
  userId: string;
  userName?: string;
  createdAt: string;
  description: string;
  imageUrl?: string;
  images?: string[];
  documents?: { name: string; url: string; type: string }[];
  closingDocuments?: { name: string; url: string; type: string; timestamp: string }[];
  sealedBidStartDate?: string;
  sealedBidEndDate?: string;
  auctionStartDate?: string;
  auctionEndDate?: string;
  invitationDeadline?: string;
  basePrice?: number;
  highestEmdAmount?: number;
  bidIncrement?: number; // Maps to Tick Size
  maximumTickSize?: number;
  extensionTime?: number; // In minutes
  maxExtensions?: number;
  currentExtensions?: number;
  urgency?: 'low' | 'medium' | 'high';
  pickupAddress?: string;
  viewCount?: number;
  bidCount?: number;
}

export interface Bid {
  id: string;
  listingId: string;
  vendorId: string;
  vendorName: string;
  amount: number;
  type: 'sealed' | 'open';
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  statusReason?: string;
  emdPaid?: boolean;
  createdAt: string;
  note?: string;
  expiresAt?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'bid_received' | 'bid_accepted' | 'bid_rejected' | 'listing_approved' | 'account_approved' | 'general';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface AppState {
  currentUser: User | null;
  listings: Listing[];
  bids: Bid[];
  users: User[];
  notifications: Notification[];
  pendingOnboardingRole?: 'client' | 'vendor' | 'consumer';
  pendingOnboardingEmail?: string;
  pendingOnboardingPassword?: string;
  isSidebarOpen: boolean;
}
