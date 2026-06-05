"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/context/AppContext";

export default function AdminAiAssistantPage() {
  const { currentUser } = useApp();
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<any[]>([
    { role: 'system', content: `Hello ${currentUser?.name?.split(' ')[0] || 'Admin'}, I am your WeConnect AI assistant. How can I help you manage the e-waste platform today?` }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    const userMsg = { role: 'user', content: prompt };
    setMessages(prev => [...prev, userMsg]);
    setPrompt("");
    setLoading(true);

    try {
      const res = await api.post('/ai/ask', { prompt: userMsg.content });
      setMessages(prev => [...prev, { 
        role: 'system', 
        content: res.data.response 
      }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { 
        role: 'system', 
        content: "I'm having trouble connecting to my brain right now. Please check if the API server is running and the GOOGLE_API_KEY is valid." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-120px)] flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-white animate-pulse">auto_awesome</span>
            </div>
            AI Assistant
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Smart insights & platform automation</p>
        </div>
        
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl dark:bg-amber-900/10 dark:border-amber-900/50">
           <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest flex items-center gap-1">
             <span className="material-symbols-outlined text-xs">info</span> API Key Recommended
           </p>
           <p className="text-[10px] text-amber-600 font-medium">Use 'Gemini API' for free developer access.</p>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-xl overflow-hidden flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] p-4 rounded-3xl text-sm font-medium shadow-sm ${
                  m.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 rounded-tl-none'
                }`}>
                  {m.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-3xl rounded-tl-none flex gap-1">
                {[0, 1, 2].map(i => (
                  <motion.div key={i} animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }} className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <form onSubmit={handleSend} className="relative">
            <input 
              type="text" 
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Ask me anything about platform metrics..."
              className="w-full pl-6 pr-14 py-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white"
            />
            <button 
              type="submit"
              disabled={loading || !prompt.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-lg shadow-indigo-500/20"
            >
              <span className="material-symbols-outlined">send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
