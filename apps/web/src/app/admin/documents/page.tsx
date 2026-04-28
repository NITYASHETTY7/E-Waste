"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";

type DocType = "all" | "auction" | "compliance" | "onboarding";

export default function AdminDocuments() {
  const { listings, users } = useApp();
  const [search, setSearch] = useState("");
  const [docType, setDocType] = useState<DocType>("all");

  // Build a flat list of all documents across the platform
  const allDocs = listings.flatMap(listing => {
    const docs: { listingId: string; listingTitle: string; userName: string; name: string; url: string; type: DocType; uploadedAt: string }[] = [];

    // Listing upload documents
    if (listing.documents?.length) {
      listing.documents.forEach(d => docs.push({
        listingId: listing.id, listingTitle: listing.title, userName: listing.userName || "—",
        name: d.name, url: d.url, type: "auction", uploadedAt: listing.createdAt,
      }));
    }
    // Closing / compliance documents
    if (listing.closingDocuments?.length) {
      listing.closingDocuments.forEach(d => docs.push({
        listingId: listing.id, listingTitle: listing.title, userName: listing.userName || "—",
        name: d.name, url: d.url, type: "compliance", uploadedAt: d.timestamp,
      }));
    }
    // Final quote
    if (listing.finalQuoteProductUrl) docs.push({
      listingId: listing.id, listingTitle: listing.title, userName: listing.userName || "—",
      name: "Final Product Quote", url: listing.finalQuoteProductUrl, type: "auction",
      uploadedAt: listing.finalQuoteSubmittedAt || listing.createdAt,
    });
    if (listing.finalQuoteLetterheadUrl) docs.push({
      listingId: listing.id, listingTitle: listing.title, userName: listing.userName || "—",
      name: "Letterhead Quotation", url: listing.finalQuoteLetterheadUrl, type: "auction",
      uploadedAt: listing.finalQuoteSubmittedAt || listing.createdAt,
    });
    // Compliance docs
    const compDocs = [
      { key: "form6Url", name: "Form 6" },
      { key: "weightSlipEmptyUrl", name: "Weight Slip (Empty)" },
      { key: "weightSlipLoadedUrl", name: "Weight Slip (Loaded)" },
      { key: "recyclingCertUrl", name: "Recycling Certificate" },
      { key: "disposalCertUrl", name: "Disposal Certificate" },
    ] as const;
    compDocs.forEach(d => {
      const url = listing[d.key];
      if (url) docs.push({
        listingId: listing.id, listingTitle: listing.title, userName: listing.userName || "—",
        name: d.name, url, type: "compliance", uploadedAt: listing.createdAt,
      });
    });
    return docs;
  });

  // User onboarding documents
  const userDocs = users.filter(u => u.documents?.length).flatMap(u =>
    (u.documents || []).map(d => ({
      listingId: "", listingTitle: u.name, userName: u.role,
      name: d.name, url: d.url || "#", type: "onboarding" as DocType, uploadedAt: d.uploadedAt,
    }))
  );

  const combined = [...allDocs, ...userDocs].filter(d =>
    (docType === "all" || d.type === docType) &&
    (d.name.toLowerCase().includes(search.toLowerCase()) || d.listingTitle.toLowerCase().includes(search.toLowerCase()))
  );

  const typeIcon: Record<DocType, string> = {
    all: "folder_open",
    auction: "gavel",
    compliance: "verified",
    onboarding: "person",
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-headline font-extrabold tracking-tight text-[color:var(--color-on-surface)]">Document Library</h2>
          <p className="text-[color:var(--color-on-surface-variant)] mt-1">Central repository of all platform documents — auction, compliance, and onboarding files.</p>
        </div>
        <div className="relative w-64">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input className="input-base pl-10 h-11 text-sm" placeholder="Search documents..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Type filter */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "auction", "compliance", "onboarding"] as DocType[]).map(t => (
          <button key={t} onClick={() => setDocType(t)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wide transition-all ${docType === t ? "bg-primary text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-primary hover:text-primary"}`}>
            <span className="material-symbols-outlined text-sm">{typeIcon[t]}</span>
            {t}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden border border-slate-100 dark:border-slate-800">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 dark:border-slate-800">
          <p className="text-sm font-bold text-slate-600 dark:text-slate-400">{combined.length} document{combined.length !== 1 ? "s" : ""}</p>
        </div>
        {combined.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <span className="material-symbols-outlined text-5xl block mb-2">folder_open</span>
            No documents found
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {combined.map((doc, i) => (
              <div key={i} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    doc.type === "compliance" ? "bg-emerald-100" : doc.type === "onboarding" ? "bg-purple-100" : "bg-blue-100"
                  }`}>
                    <span className={`material-symbols-outlined text-sm ${
                      doc.type === "compliance" ? "text-emerald-600" : doc.type === "onboarding" ? "text-purple-600" : "text-blue-600"
                    }`}>{typeIcon[doc.type]}</span>
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-900 dark:text-white">{doc.name}</p>
                    <p className="text-xs text-slate-500">{doc.listingTitle} · {doc.userName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase ${
                    doc.type === "compliance" ? "bg-emerald-100 text-emerald-700" : doc.type === "onboarding" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                  }`}>{doc.type}</span>
                  <p className="text-xs text-slate-400">{new Date(doc.uploadedAt).toLocaleDateString("en-IN")}</p>
                  <a href={doc.url} download
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-primary hover:text-white text-slate-500 flex items-center justify-center transition-colors dark:bg-slate-800">
                    <span className="material-symbols-outlined text-sm">download</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
