"use client";

import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

const EWASTE_DATA = [
  { name: 'IT Equipment', value: 35.6, color: '#3b82f6' },
  { name: 'Electricals', value: 24.1, color: '#10b981' },
  { name: 'Batteries', value: 15.8, color: '#f59e0b' },
  { name: 'Metal Scrap', value: 12.7, color: '#ef4444' },
  { name: 'Others', value: 11.8, color: '#8b5cf6' },
];

export function EWasteCategoryChart() {
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line
  useEffect(() => { setMounted(true); }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-headline font-bold text-slate-900 dark:text-white text-base">E-Waste by Category</h3>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          This Month
          <span className="material-symbols-outlined text-sm">expand_more</span>
        </button>
      </div>

      <div className="flex gap-4 flex-1 items-center">
        {/* Donut Chart */}
        <div className="relative shrink-0" style={{ width: 160, height: 160 }}>
          {mounted ? (
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie
                  data={EWASTE_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={72}
                  paddingAngle={2}
                  dataKey="value"
                  startAngle={90}
                  endAngle={450}
                  animationDuration={1200}
                >
                  {EWASTE_DATA.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => [`${v}%`]} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div style={{ width: 160, height: 160 }} />}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-black text-slate-900 dark:text-white leading-none">12,248</span>
            <span className="text-[10px] font-bold text-slate-400 mt-0.5">Total (Kg)</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2.5 flex-1 min-w-0">
          {EWASTE_DATA.map(item => (
            <div key={item.name} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 flex-1 truncate">{item.name}</span>
              <span className="text-[11px] font-black text-slate-900 dark:text-white">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>

      <button className="mt-4 w-full h-9 rounded-xl border border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
        View Full Report
        <span className="material-symbols-outlined text-sm">arrow_forward</span>
      </button>
    </motion.div>
  );
}
