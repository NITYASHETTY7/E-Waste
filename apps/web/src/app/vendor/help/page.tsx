"use client";

import { useState } from "react";

export default function VendorHelp() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setSubject("");
      setMessage("");
    }, 3000);
  };

  const faqs = [
    { q: "Why is my account locked?", a: "Accounts are usually locked by administrators due to outstanding compliance documentation, pending penalty amounts, or audit mismatches. Please contact support to resolve this." },
    { q: "How do I clear my pending penalties?", a: "Go to the Payments tab. If you have any outstanding penalties, a card will be displayed at the top letting you pay immediately by sharing your transaction UTR reference." },
    { q: "How do I submit site audit pictures?", a: "Once you accept a site visit audit request, you can upload site photographs directly from the site audit details page before completing the verification." }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 px-4 sm:px-6 lg:px-8 py-6">
      <div>
        <h2 className="text-3xl font-headline font-extrabold text-slate-900 dark:text-white">Help & Support</h2>
        <p className="text-sm text-slate-500 mt-1">Get answers to FAQs or contact WeConnect support directly.</p>
      </div>

      {/* Support channels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: "mail", label: "Email Support", desc: "support@weconnect.com", sub: "Replies within 24 hours" },
          { icon: "call", label: "Support Hotline", desc: "+1 (800) 555-0199", sub: "Mon - Fri, 9 AM - 6 PM" },
          { icon: "chat", label: "Live Chat", desc: "Chat with Assistant", sub: "Available in dashboard" }
        ].map(ch => (
          <div key={ch.label} className="card p-5 border border-slate-100 dark:border-slate-800 text-center">
            <span className="material-symbols-outlined text-3xl text-primary mb-2">{ch.icon}</span>
            <p className="font-bold text-slate-900 dark:text-white">{ch.label}</p>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1">{ch.desc}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{ch.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* FAQs */}
        <div className="space-y-4">
          <h3 className="text-lg font-black text-slate-900 dark:text-white">Frequently Asked Questions</h3>
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 p-4 rounded-xl">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{faq.q}</p>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div className="card p-6 border border-slate-100 dark:border-slate-800 space-y-4">
          <h3 className="text-lg font-black text-slate-900 dark:text-white">Send a Message</h3>
          {submitted ? (
            <div className="p-8 text-center text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900">
              <span className="material-symbols-outlined text-4xl block mb-2">check_circle</span>
              Support ticket created! We will contact you soon.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Account Lock inquiry"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Message</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your issue or request in detail..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-md"
              >
                Submit Ticket
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
