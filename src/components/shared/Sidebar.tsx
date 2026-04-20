"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";

const VENDOR_LINKS = [
  { href: "/vendor/dashboard", icon: "dashboard", label: "Dashboard" },
  { href: "/vendor/marketplace", icon: "storefront", label: "Auctions" },
  { href: "/vendor/invitations", icon: "mail", label: "Invitations" },
  { href: "/vendor/live-auction", icon: "sensors", label: "Live Auction" },
  { href: "/vendor/bids", icon: "gavel", label: "My Bids" },
  { href: "/vendor/pickups", icon: "local_shipping", label: "Logistics" },
  { href: "/vendor/reports", icon: "bar_chart", label: "Reports" },
  { href: "/vendor/profile", icon: "badge", label: "Profile & Docs" },
];

const CLIENT_LINKS = [
  { href: "/client/dashboard", icon: "dashboard", label: "Dashboard" },
  { href: "/client/post", icon: "add_circle", label: "Post E-Waste" },
  { href: "/client/listings", icon: "inventory_2", label: "My Listings" },
  { href: "/client/bids", icon: "gavel", label: "Bids Received" },
  { href: "/client/live-auction", icon: "sensors", label: "Live Auction" },
  { href: "/client/reports", icon: "bar_chart", label: "Reports" },
  { href: "/client/notifications", icon: "notifications", label: "Notifications" },
  { href: "/client/profile", icon: "person", label: "Profile" },
];

const CONSUMER_LINKS = [
  { href: "/consumer/dashboard", icon: "dashboard", label: "Dashboard" },
  { href: "/consumer/pickup", icon: "add_circle", label: "New Pickup" },
  { href: "/consumer/history", icon: "history", label: "Order History" },
  { href: "/consumer/impact", icon: "eco", label: "My Impact" },
  { href: "/consumer/profile", icon: "person", label: "Profile" },
];

const ADMIN_LINKS = [
  { href: "/admin/dashboard", icon: "monitoring", label: "Dashboard" },
  { href: "/admin/vendors", icon: "recycling", label: "Vendors" },
  { href: "/admin/users", icon: "domain", label: "Clients" },
  { href: "/admin/listings", icon: "inventory_2", label: "Listings" },
  { href: "/admin/listings?live=1", icon: "sensors", label: "Live Auctions" },
  { href: "/admin/transactions", icon: "payments", label: "Transactions" },
  { href: "/admin/reports", icon: "bar_chart", label: "Reports" },
  { href: "/admin/profile", icon: "person", label: "Profile" },
  { href: "/admin/settings", icon: "settings", label: "Settings" },
];

export default function Sidebar() {
  const { currentUser, logout, notifications, isSidebarOpen, setIsSidebarOpen } = useApp();
  const pathname = usePathname();
  const router = useRouter();

  if (!currentUser) return null;
  const role = currentUser.role;
  const isConsumer = role === "consumer" || role === "guest";
  const links = role === "vendor" ? VENDOR_LINKS : role === "admin" ? ADMIN_LINKS : isConsumer ? CONSUMER_LINKS : CLIENT_LINKS;
  const unreadNotifs = (notifications || []).filter(n => n.userId === currentUser.id && !n.read).length;

  const handleLogout = () => {
    logout();
    setIsSidebarOpen(false);
    router.push("/");
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Drawer */}
      <aside className={`sidebar w-[280px] shrink-0 fixed top-0 bottom-0 left-0 z-[101] transition-transform duration-300 ease-out shadow-2xl flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-white/10 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 flex items-center justify-center p-1 bg-white/5">
              <img src="/logo%203.png" alt="WeConnect Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="font-headline font-extrabold text-white text-base tracking-tight leading-none uppercase">WE<span className="text-[#0B5ED7]">CONNECT</span></p>
              <p className="text-[9px] uppercase tracking-[0.2em] text-[#1E8E3E] font-bold">
                {role === "admin" ? "Admin Console" : role === "vendor" ? "Vendor Portal" : isConsumer ? "Individual Portal" : "Client Portal"}
              </p>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="p-1 text-white/50 hover:text-white transition-colors lg:hidden absolute top-4 right-4">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* User info */}
        <div className="mx-4 mb-4 px-3 py-3 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[color:var(--color-primary-container)] flex items-center justify-center font-black text-sm text-white shrink-0">
              {(currentUser.name || "U")[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
              <p className="text-[9px] text-[color:var(--color-primary)] opacity-70 truncate">{currentUser.email}</p>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {links.map(link => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            const showBadge = link.href === "/client/notifications" && unreadNotifs > 0;
            return (
              <Link key={link.href} href={link.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`nav-link group ${isActive ? "nav-link-active" : ""}`}>
                <span className={`material-symbols-outlined text-xl transition-all`}
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                  {link.icon}
                </span>
                <span className="text-sm flex-1">{link.label}</span>
                {showBadge && (
                  <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center">
                    {unreadNotifs > 9 ? "9+" : unreadNotifs}
                  </span>
                )}
                {isActive && (
                  <div className={`w-1.5 h-4 rounded-full ml-auto ${isConsumer ? 'bg-[#FFC107]' : 'bg-[#1E8E3E]'}`} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 pb-6 pt-4 mt-auto border-t border-white/10">
          <button onClick={handleLogout}
            className="nav-link w-full text-red-400/70 hover:text-red-300 hover:bg-red-500/10 group">
            <span className="material-symbols-outlined text-xl">logout</span>
            <span className="text-sm">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
