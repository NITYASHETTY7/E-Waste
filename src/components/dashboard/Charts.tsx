"use client";

import React, { useState, useEffect } from "react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { motion } from 'framer-motion';

interface DashboardChartProps {
  title: string;
  subtitle?: string;
  data?: any[];
  weeklyData?: any[];
}

const DEFAULT_MONTHLY = [
  { name: 'Jan', value: 45000 }, { name: 'Feb', value: 52000 }, { name: 'Mar', value: 48000 },
  { name: 'Apr', value: 61000 }, { name: 'May', value: 55000 }, { name: 'Jun', value: 83256 },
  { name: 'Jul', value: 70000 }, { name: 'Aug', value: 75000 }, { name: 'Sep', value: 68000 },
  { name: 'Oct', value: 82000 }, { name: 'Nov', value: 78000 }, { name: 'Dec', value: 95000 },
];

const DEFAULT_WEEKLY = [
  { name: 'Mon', value: 12000 }, { name: 'Tue', value: 15000 }, { name: 'Wed', value: 18000 },
  { name: 'Thu', value: 14000 }, { name: 'Fri', value: 22000 }, { name: 'Sat', value: 19000 },
  { name: 'Sun', value: 16000 },
];

export const InteractiveLineChart: React.FC<DashboardChartProps> = ({ title, subtitle, data, weeklyData }) => {
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<'Monthly' | 'Weekly'>('Monthly');
  
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return (
    <div className="dashboard-card h-[350px] flex items-center justify-center">
      <div className="animate-pulse text-slate-300 font-bold">Loading Chart...</div>
    </div>
  );

  const activeData = view === 'Monthly' ? (data || DEFAULT_MONTHLY) : (weeklyData || DEFAULT_WEEKLY);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="dashboard-card flex flex-col h-[350px]"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-bold text-slate-900">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
        </div>
        <select 
          value={view}
          onChange={(e) => setView(e.target.value as any)}
          className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none cursor-pointer hover:bg-slate-100 transition-colors"
        >
          <option value="Monthly">Monthly</option>
          <option value="Weekly">Weekly</option>
        </select>
      </div>
      
      <div className="flex-1 w-full overflow-hidden">
        <ResponsiveContainer width="99%" height="100%">
          <AreaChart data={activeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="100%">
                <stop offset="5%" stopColor="#1E8E3E" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#1E8E3E" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fontWeight: 600, fill: '#94A3B8' }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fontWeight: 600, fill: '#94A3B8' }}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#1E8E3E" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorValue)" 
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export const InteractiveDonutChart: React.FC<DashboardChartProps & { percentage: number, color?: string, label1?: string, label2?: string }> = ({ 
  title, percentage, color = "#1E8E3E", label1 = "Success", label2 = "Pending" 
}) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const data = [
    { name: label1, value: percentage },
    { name: label2, value: 100 - percentage },
  ];

  if (!mounted) return (
    <div className="dashboard-card h-[350px] flex items-center justify-center">
      <div className="animate-pulse text-slate-300 font-bold">Loading...</div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="dashboard-card flex flex-col items-center h-[350px]"
    >
      <h3 className="font-bold text-slate-900 w-full text-left mb-6">{title}</h3>
      
      <div className="relative w-full flex-1 flex items-center justify-center overflow-hidden">
        <ResponsiveContainer width="99%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="70%"
              outerRadius="90%"
              paddingAngle={5}
              dataKey="value"
              startAngle={90}
              endAngle={450}
              animationBegin={500}
              animationDuration={1200}
            >
              <Cell fill={color} stroke="none" />
              <Cell fill="#F1F5F9" stroke="none" />
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-black text-slate-900">{percentage}%</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label1}</span>
        </div>
      </div>
      
      <div className="mt-6 flex justify-center gap-4 w-full">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-[10px] font-bold text-slate-500 uppercase">{label1}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-slate-200" />
          <span className="text-[10px] font-bold text-slate-500 uppercase">{label2}</span>
        </div>
      </div>
    </motion.div>
  );
};

export const InteractiveBarChart: React.FC<DashboardChartProps & { data: any[] }> = ({ title, data }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return (
    <div className="dashboard-card h-[350px] flex items-center justify-center">
       <div className="animate-pulse text-slate-300 font-bold">Loading...</div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="dashboard-card flex flex-col h-[350px]"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-slate-900">{title}</h3>
        <select className="text-xs font-bold bg-slate-50 border-none rounded-lg px-2 py-1 outline-none cursor-pointer">
          <option>By Region</option>
        </select>
      </div>

      <div className="flex-1 w-full overflow-hidden">
        <ResponsiveContainer width="99%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fontWeight: 600, fill: '#94A3B8' }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fontWeight: 600, fill: '#94A3B8' }}
            />
            <Tooltip 
              cursor={{ fill: '#F8FAFC' }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '20px' }} />
            <Bar dataKey="corporate" fill="#0B5ED7" radius={[4, 4, 0, 0]} barSize={12} animationDuration={1500} />
            <Bar dataKey="sme" fill="#1E8E3E" radius={[4, 4, 0, 0]} barSize={12} animationDuration={1500} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};
