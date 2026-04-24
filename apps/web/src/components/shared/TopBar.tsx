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
  const { currentUser, notifications, setIsSidebarOpen, isSidebarCollapsed, setIsSidebarCollapsed, theme, toggleTheme } = useApp();
  const pathname = usePathname();

  const title = PAGE_TITLES[pathname] || "We Connect";
  const unread = (notifications || []).filter(n => n.userId === currentUser?.id && !n.read).length;
  const role = currentUser?.role || "client";

  return (
    <header className="h-20 flex items-center justify-between px-4 md:px-8 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 transition-colors duration-300">
      <div className="flex items-center gap-6 flex-1">
        {/* Mobile: open sidebar */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
          aria-label="Toggle Menu"
          title="Open Menu"
        >
          <span className="material-symbols-outlined text-slate-500 group-hover:text-primary">menu</span>
        </button>
        {/* Desktop: collapse sidebar */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="hidden lg:flex w-10 h-10 rounded-xl items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
          aria-label="Toggle Sidebar"
          title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <span className={`material-symbols-outlined text-slate-500 group-hover:text-primary transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-180' : ''}`}>
            menu_open
          </span>
        </button>

        {/* Dynamic Title / Welcome */}
        <div className="hidden sm:block">
          <h1 className="text-xl font-headline font-bold text-slate-900 dark:text-white leading-tight">
            {pathname === '/admin/dashboard' ? "Welcome back, Admin! 👋" : title}
          </h1>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide">
            {role === 'admin' ? "Here's what's happening with your e-waste marketplace today." : "Manage your e-waste cycle effectively."}
          </p>
        </div>

        {/* Global Search */}
        <div className="flex-1 max-w-md hidden md:block ml-4">
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl group-focus-within:text-primary transition-colors">search</span>
            <input 
              type="text" 
              placeholder="Search anything..." 
              className="w-full h-11 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl pl-11 pr-12 text-sm font-medium focus:ring-2 focus:ring-primary/20 dark:text-white transition-all"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md text-[10px] font-black text-slate-400 dark:text-slate-300">
              ⌘ K
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-all group"
          aria-label="Toggle Theme"
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          <span className="material-symbols-outlined text-slate-600 dark:text-slate-300 text-xl group-hover:scale-110 transition-transform">
            {theme === 'light' ? 'dark_mode' : 'light_mode'}
          </span>
        </button>

        {/* Quick Add */}
        <button className="hidden sm:flex w-10 h-10 rounded-2xl bg-primary text-white items-center justify-center hover:shadow-lg hover:shadow-primary/30 active:scale-95 transition-all" title="Quick Action">
          <span className="material-symbols-outlined">add</span>
        </button>

        {/* Notifications */}
        <button className="relative w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-all group" title={unread > 0 ? `Notifications (${unread} unread)` : 'Notifications'}>
          <span className="material-symbols-outlined text-slate-600 dark:text-slate-300 text-xl group-hover:rotate-12 transition-transform">notifications</span>
          {unread > 0 && (
            <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 border-2 border-white dark:border-slate-800 text-white text-[8px] font-black rounded-full flex items-center justify-center">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-2 md:pl-4 border-l border-slate-200 dark:border-slate-800 h-10 ml-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-emerald-400 flex items-center justify-center font-black text-sm text-white shadow-md">
            {(currentUser?.name || "U")[0]}
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-sm font-bold text-slate-900 dark:text-white leading-none mb-0.5">
              {currentUser?.name || "Admin"}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              {role === 'admin' ? 'Super Admin' : role}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
