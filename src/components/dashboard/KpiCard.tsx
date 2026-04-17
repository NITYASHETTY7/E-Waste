"use client";

import React from "react";
import { motion } from "framer-motion";

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  delay?: number;
}

export const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon, trend, delay = 0 }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }}
      className="dashboard-card flex justify-between items-start cursor-default"
    >
      <div>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.2 }}
          className="dashboard-kpi-value font-headline"
        >
          {value}
        </motion.p>
        <p className="dashboard-kpi-label">{title}</p>
        {trend && (
          <div className={`mt-2 flex items-center gap-1 text-xs font-bold ${trend.isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
            <span className="material-symbols-outlined text-sm">
              {trend.isPositive ? 'trending_up' : 'trending_down'}
            </span>
            {trend.value}% vs last month
          </div>
        )}
      </div>
      <div className="dashboard-kpi-icon">
        <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 0" }}>
          {icon}
        </span>
      </div>
    </motion.div>
  );
};
