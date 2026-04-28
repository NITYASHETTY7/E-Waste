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
  companyId?: string;
  status: 'active' | 'pending' | 'rejected' | 'disabled' | 'on-hold';
  statusReason?: string;
  onboardingStep: number; // 1-4, or 5 = complete
  onboardingProfile?: OnboardingProfile;
  documents?: UploadedDoc[];
  bankDetails?: BankDetails;
  registeredAt?: string;
}

export interface AuditInvitation {
  id: string;
  listingId: string;
  vendorId: string;
  vendorName: string;
  status: 'invited' | 'accepted' | 'declined' | 'completed';
  scheduledDate?: string;
  spocName?: string;
  spocPhone?: string;
  siteAddress?: string;
  productMatch?: boolean;
  auditRemarks?: string;
  completedAt?: string;
  invitedAt: string;
}

export interface VendorRating {
  id: string;
  listingId: string;
  vendorId: string;
  vendorName: string;
  clientId: string;
  clientName: string;
  overallRating: number;     // 1-5
  auditRating?: number;      // 1-5
  timelinessRating?: number; // 1-5
  complianceRating?: number; // 1-5
  comment?: string;
  createdAt: string;
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
  targetPrice?: number;
  highestEmdAmount?: number;
  bidIncrement?: number;
  maximumTickSize?: number;
  extensionTime?: number;
  maxExtensions?: number;
  currentExtensions?: number;
  urgency?: 'low' | 'medium' | 'high';
  pickupAddress?: string;
  viewCount?: number;
  bidCount?: number;
  // Requirement upload flow
  requirementStatus?: 'pending' | 'processing' | 'finalized';
  // Winner info (post-auction)
  winnerVendorId?: string;
  winnerVendorName?: string;
  // Final quote flow
  finalQuoteStatus?: 'pending' | 'submitted' | 'client_reviewing' | 'approved' | 'rejected';
  finalQuoteProductUrl?: string;
  finalQuoteLetterheadUrl?: string;
  finalQuoteSubmittedAt?: string;
  finalQuoteRemarks?: string;
  // Payment flow
  paymentStatus?: 'pending' | 'proof_uploaded' | 'confirmed';
  paymentClientAmount?: number;
  paymentCommissionAmount?: number;
  paymentProofUrl?: string;
  paymentUTR?: string;
  paymentSubmittedAt?: string;
  // Compliance flow
  complianceStatus?: 'pending' | 'pickup_scheduled' | 'documents_uploaded' | 'verified';
  pickupScheduledDate?: string;
  form6Url?: string;
  weightSlipEmptyUrl?: string;
  weightSlipLoadedUrl?: string;
  recyclingCertUrl?: string;
  disposalCertUrl?: string;
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
  auditInvitations: AuditInvitation[];
  vendorRatings: VendorRating[];
  pendingOnboardingRole?: 'client' | 'vendor' | 'consumer';
  pendingOnboardingEmail?: string;
  pendingOnboardingPassword?: string;
  isSidebarOpen: boolean;
  isSidebarCollapsed: boolean;
  theme: 'light' | 'dark';
}
