"use client";

import React from "react";
import { motion } from "framer-motion";

interface ActivityItem {
  id: string;
  user: {
    name: string;
    avatar?: string;
    phone: string;
  };
  auctions: number;
  amount: string | number;
}

interface ActivityTableProps {
  title: string;
  items: ActivityItem[];
}

export const ActivityTable: React.FC<ActivityTableProps> = ({ title, items }) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="dashboard-card h-fit"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-slate-900 dark:text-white">{title}</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 dark:border-slate-800/50">
              <th className="pb-4">User Details</th>
              <th className="pb-4 text-center">Auctions</th>
              <th className="pb-4 text-right">Amount</th>
            </tr>
          </thead>
          <motion.tbody 
            variants={container}
            initial="hidden"
            animate="show"
            className="divide-y divide-slate-50 dark:divide-slate-800/50"
          >
            {items.map((activity) => (
              <motion.tr 
                key={activity.id} 
                variants={item}
                className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
              >
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800/80 overflow-hidden flex items-center justify-center font-bold text-slate-400 dark:text-slate-500">
                      {activity.user.avatar ? (
                        <img src={activity.user.avatar} alt={activity.user.name} className="w-full h-full object-cover" />
                      ) : (
                        activity.user.name[0]
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white leading-none mb-1 group-hover:text-[color:var(--color-dashboard-accent)] transition-colors">
                        {activity.user.name}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{activity.user.phone}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 text-center">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{activity.auctions.toString().padStart(2, '0')}</span>
                </td>
                <td className="py-4 text-right">
                  <p className="text-sm font-black text-slate-900 dark:text-white">
                    {typeof activity.amount === 'number' ? `₹${activity.amount.toLocaleString()}` : activity.amount}
                  </p>
                </td>
              </motion.tr>
            ))}
          </motion.tbody>
        </table>
      </div>
    </motion.div>
  );
};
