"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { motion } from "framer-motion";
import Link from "next/link";
import api from "@/lib/api";

const STATUS_COLOR: Record<string, string> = {
  PENDING_ADMIN_REVIEW: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  ADMIN_APPROVED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  QUOTE_RECEIVED: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  QUOTE_ACCEPTED: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  PICKUP_REQUESTED: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  PICKUP_IN_PROGRESS: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
  COMPLETED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  REJECTED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

const STATUS_LABEL: Record<string, string> = {
  PENDING_ADMIN_REVIEW: "Pending Review",
  ADMIN_APPROVED: "Open for Quotes",
  QUOTE_RECEIVED: "Quotes Received",
  QUOTE_ACCEPTED: "Quote Accepted",
  PICKUP_REQUESTED: "Pickup Requested",
  PICKUP_IN_PROGRESS: "Pickup In Progress",
  COMPLETED: "Completed",
  REJECTED: "Rejected",
};

const STATUS_DOT: Record<string, string> = {
  PENDING_ADMIN_REVIEW: "bg-amber-400",
  ADMIN_APPROVED: "bg-blue-400",
  QUOTE_RECEIVED: "bg-purple-400",
  QUOTE_ACCEPTED: "bg-indigo-400",
  PICKUP_REQUESTED: "bg-orange-400",
  PICKUP_IN_PROGRESS: "bg-sky-400",
  COMPLETED: "bg-emerald-400",
  REJECTED: "bg-red-400",
};

interface Product { id: string; name: string; status: string; askingPrice: number; weightKg: number; createdAt: string; quotes: any[]; }

const ITEM_ICONS = ["devices", "computer", "smartphone", "memory", "router", "keyboard"];

export default function UserDashboard() {
  const { currentUser } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/user-products/mine').then(r => setProducts(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const total = products.length;
  const withQuotes = products.filter(p => p.quotes?.length > 0).length;
  const completed = products.filter(p => p.status === 'COMPLETED').length;
  const pending = products.filter(p => ['PICKUP_REQUESTED', 'PICKUP_IN_PROGRESS'].includes(p.status)).length;

  const kpiCards = [
    {
      label: "Products Submitted",
      value: total,
      icon: "inventory_2",
      gradient: "from-violet-500 to-purple-600",
      glow: "shadow-violet-500/30",
      bg: "bg-violet-50 dark:bg-violet-950/40",
      border: "border-violet-200/60 dark:border-violet-800/40",
      iconBg: "bg-violet-500",
      trend: "+2 this month",
    },
    {
      label: "Quotes Received",
      value: withQuotes,
      icon: "request_quote",
      gradient: "from-blue-500 to-cyan-500",
      glow: "shadow-blue-500/30",
      bg: "bg-blue-50 dark:bg-blue-950/40",
      border: "border-blue-200/60 dark:border-blue-800/40",
      iconBg: "bg-blue-500",
      trend: "From verified vendors",
    },
    {
      label: "Pickups In Progress",
      value: pending,
      icon: "local_shipping",
      gradient: "from-orange-500 to-amber-500",
      glow: "shadow-orange-500/30",
      bg: "bg-orange-50 dark:bg-orange-950/40",
      border: "border-orange-200/60 dark:border-orange-800/40",
      iconBg: "bg-orange-500",
      trend: "Active pickups",
    },
    {
      label: "Completed",
      value: completed,
      icon: "task_alt",
      gradient: "from-emerald-500 to-teal-500",
      glow: "shadow-emerald-500/30",
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      border: "border-emerald-200/60 dark:border-emerald-800/40",
      iconBg: "bg-emerald-500",
      trend: "Successfully recycled",
    },
  ];

  const quickActions = [
    {
      href: "/user/upload",
      icon: "upload_file",
      label: "Submit Product",
      desc: "List a new e-waste item",
      gradient: "from-violet-600 to-purple-700",
      shadow: "shadow-violet-500/40",
      hoverGlow: "hover:shadow-violet-500/60",
      badge: "New",
      badgeColor: "bg-white/20 text-white",
    },
    {
      href: "/user/my-products",
      icon: "inventory_2",
      label: "My Products",
      desc: "View all submissions",
      gradient: "from-blue-500 to-indigo-600",
      shadow: "shadow-blue-500/30",
      hoverGlow: "hover:shadow-blue-500/50",
      badge: null,
      badgeColor: "",
    },
    {
      href: "/user/quotes",
      icon: "request_quote",
      label: "Vendor Quotes",
      desc: "Review & accept offers",
      gradient: "from-emerald-500 to-teal-600",
      shadow: "shadow-emerald-500/30",
      hoverGlow: "hover:shadow-emerald-500/50",
      badge: withQuotes > 0 ? `${withQuotes}` : null,
      badgeColor: "bg-white/20 text-white",
    },
    {
      href: "/user/track",
      icon: "local_shipping",
      label: "Track Pickup",
      desc: "Monitor pickup status",
      gradient: "from-orange-500 to-amber-600",
      shadow: "shadow-orange-500/30",
      hoverGlow: "hover:shadow-orange-500/50",
      badge: null,
      badgeColor: "",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-7 shadow-2xl shadow-violet-500/30"
      >
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-white/5 blur-xl" />
        <div className="pointer-events-none absolute top-4 right-1/3 w-24 h-24 rounded-full bg-pink-500/20 blur-2xl" />

        <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-[11px] font-bold uppercase tracking-widest backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                User Portal
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Welcome back,{" "}
              <span className="text-yellow-300">{currentUser?.name?.split(" ")[0]}</span> 👋
            </h1>
            <p className="text-violet-200 mt-1.5 text-sm font-medium">
              Manage your e-waste submissions and track payments
            </p>
          </div>
          <Link
            href="/user/upload"
            className="flex-shrink-0 flex items-center gap-2.5 px-6 py-3.5 bg-white text-violet-700 rounded-2xl font-black hover:bg-yellow-300 hover:text-violet-800 transition-all duration-300 shadow-xl shadow-black/20 text-sm group"
          >
            <span className="material-symbols-outlined text-lg group-hover:rotate-12 transition-transform">upload_file</span>
            Submit New Product
          </Link>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className={`relative overflow-hidden rounded-2xl border p-5 shadow-lg ${k.bg} ${k.border} ${k.glow}`}
          >
            {/* Gradient accent bar */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${k.gradient}`} />

            <div className="flex items-start justify-between mb-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 leading-tight max-w-[80%]">
                {k.label}
              </p>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${k.iconBg} shadow-md flex-shrink-0`}>
                <span className="material-symbols-outlined text-white text-lg">{k.icon}</span>
              </div>
            </div>
            <p className="text-4xl font-black text-slate-900 dark:text-white mb-1.5">
              {loading ? (
                <span className="inline-block w-10 h-9 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse" />
              ) : k.value}
            </p>
            <p className={`text-[10px] font-semibold bg-gradient-to-r ${k.gradient} bg-clip-text text-transparent`}>
              {k.trend}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Quick Actions
          </h2>
          <div className="w-8 h-0.5 rounded-full bg-gradient-to-r from-violet-500 to-purple-500" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((a, i) => (
            <motion.div
              key={a.href}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.06 }}
            >
              <Link
                href={a.href}
                className={`relative flex flex-col items-center gap-3 p-5 rounded-2xl bg-gradient-to-br ${a.gradient} text-white shadow-xl ${a.shadow} ${a.hoverGlow} hover:shadow-2xl hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 overflow-hidden group`}
              >
                {/* Shine overlay */}
                <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-tr from-white/10 to-transparent" />

                {/* Badge */}
                {a.badge && (
                  <span className={`absolute top-3 right-3 text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${a.badgeColor} border border-white/30`}>
                    {a.badge}
                  </span>
                )}

                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-white text-2xl">{a.icon}</span>
                </div>
                <div className="text-center">
                  <p className="font-black text-sm text-white">{a.label}</p>
                  <p className="text-[10px] text-white/75 mt-0.5">{a.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Submissions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Recent Submissions
            </h2>
            {!loading && products.length > 0 && (
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                Showing {Math.min(products.length, 5)} of {products.length} items
              </p>
            )}
          </div>
          <Link
            href="/user/my-products"
            className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-violet-600 hover:text-violet-700 bg-violet-50 dark:bg-violet-950/40 hover:bg-violet-100 dark:hover:bg-violet-900/40 px-3 py-1.5 rounded-xl transition-all"
          >
            View All
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl">
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-2/5 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse" />
                  <div className="h-2.5 w-3/5 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse" />
                </div>
                <div className="h-6 w-20 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-14">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-950/50 dark:to-purple-950/50 flex items-center justify-center mb-4 shadow-inner">
              <span className="material-symbols-outlined text-4xl text-violet-400">inventory_2</span>
            </div>
            <p className="text-slate-700 dark:text-slate-300 font-black text-base mb-1">No products yet</p>
            <p className="text-slate-400 dark:text-slate-500 text-sm mb-5">Start by submitting your first e-waste item</p>
            <Link
              href="/user/upload"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 !text-white rounded-xl font-black text-sm hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg shadow-violet-500/30"
            >
              <span className="material-symbols-outlined text-base !text-white">add</span>
              Submit First Product
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {products.slice(0, 5).map((p, i) => {
              const iconColors = [
                "bg-violet-100 dark:bg-violet-900/30 text-violet-600",
                "bg-blue-100 dark:bg-blue-900/30 text-blue-600",
                "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600",
                "bg-orange-100 dark:bg-orange-900/30 text-orange-600",
                "bg-pink-100 dark:bg-pink-900/30 text-pink-600",
              ];
              const colorCls = iconColors[i % iconColors.length];
              const icon = ITEM_ICONS[i % ITEM_ICONS.length];

              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                  className="flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-default"
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${colorCls}`}>
                      <span className="material-symbols-outlined text-lg">{icon}</span>
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-900 dark:text-white">{p.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-slate-400 dark:text-slate-500">{p.weightKg}kg</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                        <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">₹{p.askingPrice.toLocaleString()}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                        <span className="text-[11px] text-slate-400 dark:text-slate-500">
                          {new Date(p.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${STATUS_COLOR[p.status] ?? "bg-slate-100 text-slate-600"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[p.status] ?? "bg-slate-400"}`} />
                      {STATUS_LABEL[p.status] ?? p.status}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
