"use client";

import React from "react";
import { motion } from "framer-motion";

const ACTIVITIES = [
  { id: '1', icon: 'add_circle', color: 'blue', title: 'New request created', desc: 'Corporate Office, Mumbai', time: '2 min ago' },
  { id: '2', icon: 'check_circle', color: 'emerald', title: 'Audit completed', desc: 'ABC Electronics Pvt. Ltd.', time: '5 min ago' },
  { id: '3', icon: 'gavel', color: 'orange', title: 'New sealed bid submitted', desc: 'GreenWay Recycling', time: '8 min ago' },
  { id: '4', icon: 'sensors', color: 'emerald', title: 'Auction started', desc: 'Dell IT Assets Auction', time: '12 min ago' },
  { id: '5', icon: 'payments', color: 'blue', title: 'Payment received', desc: '₹2,45,000 from RecycleX', time: '15 min ago' },
];

const ALERTS = [
  { id: 'a1', icon: 'warning', color: 'amber', title: '3 audits pending', desc: 'Require your approval', time: 'Just now', urgent: false },
  { id: 'a2', icon: 'payments', color: 'rose', title: '2 payments pending', desc: 'Total amount: ₹3,45,000', time: '10 min ago', urgent: true },
  { id: 'a3', icon: 'description', color: 'blue', title: '5 compliance documents', desc: 'Need to be verified', time: '1 hour ago', urgent: false },
  { id: 'a4', icon: 'gavel', color: 'amber', title: 'Auction ending soon', desc: '2 auctions end in next 2 hours', time: '2 hours ago', urgent: false },
];

const ICON_COLOR: Record<string, string> = {
  blue: 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
  emerald: 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  orange: 'bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400',
  amber: 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
  rose: 'bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400',
};

export function RealTimeActivityFeed() {
  return (
    <div className="flex flex-col h-full gap-5">
      {/* Activity Feed */}
      <motion.div
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="p-5 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex-1"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-headline font-bold text-slate-900 dark:text-white text-base">Real-time Activities</h3>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-500/10">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-black text-red-500 uppercase tracking-wider">Live</span>
          </div>
        </div>

        <div className="relative space-y-4 before:absolute before:left-[17px] before:top-2 before:bottom-10 before:w-px before:bg-slate-100 dark:before:bg-slate-800">
          {ACTIVITIES.map((act, idx) => (
            <motion.div
              key={act.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.07 }}
              className="flex gap-3 relative z-10"
            >
              <div className={`w-9 h-9 rounded-xl ${ICON_COLOR[act.color]} flex items-center justify-center shrink-0 border-2 border-white dark:border-slate-900`}>
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>{act.icon}</span>
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate">{act.title}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">{act.desc}</p>
              </div>
              <span className="text-[9px] font-bold text-slate-400 whitespace-nowrap pt-0.5">{act.time}</span>
            </motion.div>
          ))}
        </div>

        <button className="mt-5 w-full h-9 rounded-xl border border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
          View All Activities
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </motion.div>

      {/* Alerts & Notifications */}
      <motion.div
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="p-5 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-headline font-bold text-slate-900 dark:text-white text-base">Alerts & Notifications</h3>
          <button className="text-[10px] font-black text-primary uppercase tracking-wider hover:underline">View All</button>
        </div>

        <div className="space-y-3">
          {ALERTS.map((alert, idx) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.07 }}
              className="flex items-start gap-3 cursor-default"
            >
              <div className={`w-9 h-9 rounded-xl ${ICON_COLOR[alert.color]} flex items-center justify-center shrink-0`}>
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>{alert.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-bold leading-tight ${alert.urgent ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>{alert.title}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{alert.desc}</p>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <span className="text-[9px] font-bold text-slate-400">{alert.time}</span>
                {alert.urgent && <div className="w-2 h-2 rounded-full bg-rose-500" />}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
