"use client";

import { useApp } from "@/context/AppContext";
import { usePathname } from "next/navigation";
import Link from "next/link";

const PAGE_TITLES: Record<string, string> = {
  "/admin/dashboard": "Master Dashboard",
  "/admin/vendors": "Vendor Management",
  "/admin/users": "Client Management",
  "/admin/listings": "Listing Control",
  "/admin/transactions": "Transactions",
  "/admin/reports": "Reports",
  "/admin/settings": "Settings",
  "/vendor/dashboard": "Dashboard",
  "/vendor/marketplace": "E-Waste Listings",
  "/vendor/live-auction": "Live Auction",
  "/vendor/bids": "Bidding & Transactions",
  "/vendor/pickups": "Logistics Schedule",
  "/vendor/analytics": "Analytics",
  "/vendor/profile": "Profile & Documents",
  "/client/dashboard": "Dashboard",
  "/client/post": "Post E-Waste",
  "/client/listings": "My Listings",
  "/client/live-auction": "Live Auction",
  "/client/bids": "Bids Received",
  "/client/notifications": "Notifications",
  "/client/profile": "My Profile",
};

export default function TopBar() {
  const { currentUser, notifications, setIsSidebarOpen } = useApp();
  const pathname = usePathname();

  const title = PAGE_TITLES[pathname] || "We Connect";
  const unread = (notifications || []).filter(n => n.userId === currentUser?.id && !n.read).length;
  const role = currentUser?.role || "client";

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-8 bg-white/80 backdrop-blur-md border-b border-[color:var(--color-outline-variant)]/30 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-[color:var(--color-surface-container-low)] transition-colors group"
          aria-label="Toggle Menu"
        >
          <span className="material-symbols-outlined text-[color:var(--color-on-surface-variant)] group-hover:text-[color:var(--color-primary)]">menu</span>
        </button>

        <div>
          <h1 className="text-base md:text-lg font-headline font-bold text-[color:var(--color-on-surface)] leading-tight">{title}</h1>
          <p className="text-[9px] text-[color:var(--color-on-surface-variant)] uppercase tracking-widest font-bold">
            {role === "admin" ? "Admin Console" : role === "vendor" ? "Vendor Portal" : "Client Portal"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications bell (client) */}
        {role === "client" && (
          <Link href="/client/notifications" className="relative w-9 h-9 rounded-xl bg-[color:var(--color-surface-container-low)] flex items-center justify-center hover:bg-[color:var(--color-secondary-container)] transition-colors">
            <span className="material-symbols-outlined text-[color:var(--color-on-surface-variant)] text-xl">notifications</span>
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </Link>
        )}

        {/* Status chip */}
        {currentUser?.status && (
          <span className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
            currentUser.status === "active" ? "bg-emerald-50 text-emerald-700" :
            currentUser.status === "pending" ? "bg-amber-50 text-amber-700" :
            "bg-red-50 text-red-600"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${currentUser.status === "active" ? "bg-emerald-500" : currentUser.status === "pending" ? "bg-amber-500" : "bg-red-500"}`} />
            {currentUser.status}
          </span>
        )}

        {/* User Avatar */}
        <div className="flex items-center gap-2 bg-[color:var(--color-surface-container-low)] hover:bg-[color:var(--color-secondary-container)] px-3 py-1.5 rounded-xl transition-colors cursor-pointer">
          <div className="w-7 h-7 rounded-lg bg-[color:var(--color-primary-container)] flex items-center justify-center font-black text-xs text-white">
            {(currentUser?.name || "U")[0]}
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-bold text-[color:var(--color-on-surface)] leading-tight">
              {currentUser?.name?.slice(0, 18) || "User"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
