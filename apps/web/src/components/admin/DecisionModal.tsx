"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  itemDetails: {
    label: string;
    value: string;
  }[];
  onConfirm: (status: any, reason: string) => void;
  actions: {
    label: string;
    status: string;
    color: string;
    requireReason?: boolean;
  }[];
}

export default function DecisionModal({ isOpen, onClose, title, itemDetails, onConfirm, actions }: DecisionModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleAction = (action: typeof actions[0]) => {
    if (action.requireReason && !reason.trim()) {
      setError("Please provide a reason for this decision.");
      return;
    }
    onConfirm(action.status, reason);
    setReason("");
    setError("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">{title}</h3>
              <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-8 space-y-6">
              {/* Reference Details */}
              <div className="grid grid-cols-2 gap-4">
                {itemDetails.map((detail, idx) => (
                  <div key={idx} className="bg-slate-50 p-4 rounded-2xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{detail.label}</p>
                    <p className="text-sm font-bold text-slate-900 truncate">{detail.value}</p>
                  </div>
                ))}
              </div>

              {/* Reason Input */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Decision Reason / Feedback</label>
                <textarea
                  value={reason}
                  onChange={(e) => { setReason(e.target.value); setError(""); }}
                  placeholder="Explain why you are making this decision..."
                  className={`w-full h-32 p-4 bg-slate-50 border ${error ? 'border-red-300 ring-4 ring-red-50' : 'border-slate-100 focus:border-[#0B5ED7]'} rounded-2xl outline-none transition-all text-sm resize-none font-medium`}
                />
                {error && <p className="text-[10px] font-bold text-red-500 ml-1">{error}</p>}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                {actions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAction(action)}
                    style={{ backgroundColor: action.color }}
                    className="flex-1 py-4 px-6 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-lg transition-all active:scale-[0.98] hover:brightness-90"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
