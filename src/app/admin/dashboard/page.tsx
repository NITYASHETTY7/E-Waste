"use client";

import { useApp } from "@/context/AppContext";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { InteractiveLineChart, InteractiveDonutChart, InteractiveBarChart } from "@/components/dashboard/Charts";
import { ActivityTable } from "@/components/dashboard/ActivityTable";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { formatDate } from "@/utils/format";

export default function AdminDashboard() {
  const { users, listings, bids, updateUserStatus, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'approvals' | 'monitoring'>('overview');
  const [mounted, setMounted] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteData, setInviteData] = useState({ name: '', email: '', role: 'client' });

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div></div>;

  const isDemo = currentUser?.email === 'admin@weconnect.com';

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Invitation sent to ${inviteData.email} as ${inviteData.role}!`);
    setIsInviteModalOpen(false);
    setInviteData({ name: '', email: '', role: 'client' });
  };

  const vendors = users.filter(u => u.role === "vendor");
  const clients = users.filter(u => u.role === "client");
  const pendingUsers = users.filter(u => u.status === "pending");
  
  const totalAuctions = listings.length;
  const activeListings = listings.filter(l => l.status === "active" || l.auctionPhase === "live");
  const completedAuctions = listings.filter(l => l.status === "completed");
  
  const acceptedBids = bids.filter(b => b.status === "accepted");
  const totalVolume = acceptedBids.reduce((sum, b) => sum + b.amount, 0);
  const totalCommission = totalVolume * 0.05; // 5% platform fee

  // Dynamic Chart Data
  const getMonthlyVolume = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((m, i) => {
      const volume = acceptedBids
        .filter(b => new Date(b.createdAt).getMonth() === i)
        .reduce((sum, b) => sum + b.amount, 0);
      
      const fallback = isDemo && i < 4 ? 25000 + i * 8000 : 0;
      return { name: m, value: volume || fallback }; 
    });
  };

  const getWeeklyVolume = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((d, i) => {
      const volume = acceptedBids
        .filter(b => {
          const bDate = new Date(b.createdAt);
          return bDate.getDay() === (i + 1) % 7;
        })
        .reduce((sum, b) => sum + b.amount, 0);
      
      const fallback = isDemo ? (12000 + i * 3000) : 0;
      return { name: d, value: volume || fallback };
    });
  };

  const recentUsers = [...users].sort((a, b) => new Date(b.registeredAt || 0).getTime() - new Date(a.registeredAt || 0).getTime()).slice(0, 5);

  const tableItems = recentUsers.map(u => ({
    id: u.id,
    user: {
      name: u.name,
      phone: u.email,
    },
    auctions: listings.filter(l => l.userId === u.id).length,
    amount: u.status?.toUpperCase() || 'ACTIVE'
  }));

  const regionData = [
    { name: 'North', corporate: 30, sme: 50 },
    { name: 'South', corporate: 50, sme: 70 },
    { name: 'East', corporate: 45, sme: 65 },
    { name: 'West', corporate: 60, sme: 80 },
    { name: 'Central', corporate: 35, sme: 55 },
  ];

  return (
    <div className="dashboard-container space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
      >
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Platform <span className="text-emerald-600">Control</span>
          </h1>
          <p className="text-slate-500 font-medium">Monitoring {users.length} users and {listings.length} auctions.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/reports" className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold hover:bg-slate-50 transition-all shadow-sm">
            <span className="material-symbols-outlined text-lg">analytics</span>
            Reports
          </Link>
          <button 
            onClick={() => setIsInviteModalOpen(true)}
            className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-md"
          >
            <span className="material-symbols-outlined text-lg">person_add</span>
            Invite User
          </button>
        </div>
      </motion.div>

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
          >
            <button onClick={() => setIsInviteModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Invite New User</h3>
            <p className="text-slate-500 text-sm mb-6">Send an onboarding link to a corporate client or recycling vendor.</p>
            
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">User Role</label>
                <div className="grid grid-cols-2 gap-2">
                  {['client', 'vendor'].map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setInviteData(prev => ({ ...prev, role: r }))}
                      className={`py-2 rounded-xl text-xs font-bold capitalize border-2 transition-all ${
                        inviteData.role === r ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-slate-100 text-slate-400 hover:border-slate-200"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">Full Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="John Doe"
                  value={inviteData.name}
                  onChange={e => setInviteData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  required
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="name@company.com"
                  value={inviteData.email}
                  onChange={e => setInviteData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
                >
                  Send Invite
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit mb-8">
        {(['overview', 'approvals', 'monitoring'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-xl text-sm font-bold capitalize transition-all ${
              activeTab === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <KpiCard title="Total Auctions" value={totalAuctions} icon="inventory_2" trend={{ value: 12, isPositive: true }} delay={0.1} />
              <KpiCard title="Platform Revenue" value={`₹${(totalCommission / 1000).toFixed(1)}k`} icon="payments" trend={{ value: 8, isPositive: true }} delay={0.2} />
              <KpiCard title="Vendor Network" value={vendors.length} icon="local_shipping" trend={{ value: 4, isPositive: true }} delay={0.3} />
              <KpiCard title="Success Rate" value={`${listings.length > 0 ? Math.round((completedAuctions.length / listings.length) * 100) : 0}%`} icon="verified" trend={{ value: 2, isPositive: true }} delay={0.4} />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8">
                <InteractiveLineChart 
                  title="Gross Transaction Volume" 
                  subtitle="Monthly GMV growth" 
                  data={getMonthlyVolume()}
                  weeklyData={getWeeklyVolume()}
                />
              </div>
              <div className="lg:col-span-4">
                <InteractiveDonutChart title="User Composition" percentage={users.length > 0 ? Math.round((vendors.length / users.length) * 100) : 0} label1="Vendors" label2="Clients" />
              </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5">
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden h-full">
                  <ActivityTable title="Recent Registrations" items={tableItems} />
                </div>
              </div>
              <div className="lg:col-span-7">
                <InteractiveBarChart title="Regional Scrap Volume (Tons)" data={regionData} />
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'approvals' && (
          <motion.div
            key="approvals"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-900">Pending Approvals</h3>
                <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-black">{pendingUsers.length} PENDING</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">User / Company</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Role</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Date Joined</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendingUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900">{user.name}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${user.role === 'vendor' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {user.registeredAt ? formatDate(user.registeredAt) : "—"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => updateUserStatus(user.id, 'active')}
                              className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 shadow-sm"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => updateUserStatus(user.id, 'rejected')}
                              className="px-3 py-1.5 bg-white border border-slate-200 text-red-600 rounded-lg text-xs font-bold hover:bg-red-50"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {pendingUsers.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-20 text-center text-slate-400 italic">No pending approvals at this time.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'monitoring' && (
          <motion.div
            key="monitoring"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {activeListings.map((listing) => (
              <div key={listing.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col hover:border-emerald-500 transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${listing.auctionPhase === 'live' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                    {listing.auctionPhase?.replace('_', ' ')}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400">LOT #{listing.id.split('-')[0]}</div>
                </div>
                <h4 className="font-bold text-slate-900 mb-1 line-clamp-1 group-hover:text-emerald-600 transition-colors">{listing.title}</h4>
                <p className="text-xs text-slate-500 mb-4">{listing.location}</p>
                
                <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase">Current Bid</p>
                    <p className="font-mono font-bold text-emerald-600">₹{(bids.filter(b => b.listingId === listing.id).sort((a,b) => b.amount - a.amount)[0]?.amount || listing.basePrice || 0).toLocaleString()}</p>
                  </div>
                  <Link href={`/admin/listings/${listing.id}`} className="px-4 py-2 bg-slate-100 text-slate-900 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all">
                    Monitor
                  </Link>
                </div>
              </div>
            ))}
            {activeListings.length === 0 && (
              <div className="col-span-full py-20 text-center text-slate-400 italic bg-white rounded-3xl border border-slate-200">No active auctions to monitor.</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
