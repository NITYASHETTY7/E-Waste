"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

type DocCategory = "all" | "kyc" | "compliance" | "payment";

interface DocRow {
  id: string;
  fileName: string;
  type: string;
  category: DocCategory;
  ownerName: string;
  ownerType: string;
  uploadedAt: string;
  signedUrl?: string;
  s3Key?: string;
  s3Bucket?: string;
  userName?: string;
  auctionTitle?: string;
}

export default function AdminDocuments() {
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<DocCategory>("all");
  const [search, setSearch] = useState("");
  const [urlLoading, setUrlLoading] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "date">("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    loadDocs();
  }, []);

  const loadDocs = async () => {
    setLoading(true);
    const rows: DocRow[] = [];

    try {
      // KYC documents from all companies
      const companiesRes = await api.get("/companies");
      for (const company of companiesRes.data || []) {
        for (const doc of company.kycDocuments || []) {
          rows.push({
            id: doc.id,
            fileName: doc.fileName,
            type: doc.type,
            category: "kyc",
            ownerName: company.name,
            ownerType: company.type,
            uploadedAt: doc.uploadedAt,
            signedUrl: doc.signedUrl,
            s3Key: doc.s3Key,
            s3Bucket: doc.s3Bucket,
            userName: company.name,
          });
        }
      }
    } catch (e) { /* non-fatal */ }

    try {
      // Pickup/compliance documents
      const pickupsRes = await api.get("/pickups");
      for (const pickup of pickupsRes.data || []) {
        const clientName = pickup.auction?.client?.name || "—";
        const auctionTitle = pickup.auction?.title || "—";
        for (const doc of pickup.pickupDocs || []) {
          rows.push({
            id: doc.id,
            fileName: doc.fileName,
            type: doc.type,
            category: "compliance",
            ownerName: clientName,
            ownerType: "PICKUP",
            uploadedAt: doc.uploadedAt,
            signedUrl: doc.signedUrl,
            s3Key: doc.s3Key,
            s3Bucket: doc.s3Bucket,
            auctionTitle: auctionTitle,
            userName: clientName,
          });
        }
      }
    } catch (e) { /* non-fatal */ }

    try {
      // Payment proofs
      const paymentsRes = await api.get("/payments");
      for (const pmt of paymentsRes.data || []) {
        if (pmt.proofS3Key) {
          const vendorName = pmt.auction?.winner?.name || "—";
          const auctionTitle = pmt.auction?.title || "—";
          rows.push({
            id: pmt.id,
            fileName: `Payment_Proof_${pmt.id.slice(0, 8)}.pdf`,
            type: "PAYMENT_PROOF",
            category: "payment",
            ownerName: vendorName,
            ownerType: "PAYMENT",
            uploadedAt: pmt.updatedAt || pmt.createdAt,
            s3Key: pmt.proofS3Key,
            s3Bucket: pmt.proofS3Bucket,
            auctionTitle: auctionTitle,
            userName: vendorName,
          });
        }
      }
    } catch (e) { /* non-fatal */ }

    setDocs(rows);
    setLoading(false);
  };

  const getSignedUrl = async (doc: DocRow) => {
    if (doc.signedUrl) {
      window.open(doc.signedUrl, "_blank");
      return;
    }
    if (!doc.s3Key) return;
    setUrlLoading(doc.id);
    try {
      const res = await api.get(`/companies/signed-url`, {
        params: { 
          s3Key: doc.s3Key, 
          s3Bucket: doc.s3Bucket,
          fileName: doc.fileName 
        },
      });
      window.open(res.data.url, "_blank");
    } catch (e) {
      alert("Could not generate download link. Please try again.");
    } finally {
      setUrlLoading(null);
    }
  };

  const filtered = docs.filter(d =>
    (category === "all" || d.category === category) &&
    ((d.fileName?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (d.ownerName?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (d.type?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (d.auctionTitle?.toLowerCase() || "").includes(search.toLowerCase()))
  );

  const counts = {
    all: docs.length,
    kyc: docs.filter(d => d.category === "kyc").length,
    compliance: docs.filter(d => d.category === "compliance").length,
    payment: docs.filter(d => d.category === "payment").length,
  };

  const catIcon: Record<DocCategory, string> = {
    all: "folder_open",
    kyc: "badge",
    compliance: "verified",
    payment: "receipt_long",
  };

  const catColor: Record<DocCategory, string> = {
    all: "bg-slate-100 text-slate-600",
    kyc: "bg-purple-100 text-purple-700",
    compliance: "bg-emerald-100 text-emerald-700",
    payment: "bg-blue-100 text-blue-700",
  };

  const fmtType = (t: string) =>
    t.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

  const renderDocRow = (doc: DocRow) => (
    <div key={doc.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${catColor[doc.category]}`}>
          <span className="material-symbols-outlined text-sm">{catIcon[doc.category]}</span>
        </div>
        <div className="min-w-0">
          <p className="font-bold text-sm text-slate-900 dark:text-white truncate max-w-xs">{doc.fileName}</p>
          <p className="text-xs text-slate-500">
            {doc.ownerName} {doc.auctionTitle && `· ${doc.auctionTitle}`} · {fmtType(doc.type)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase ${catColor[doc.category]}`}>{doc.category}</span>
        <p className="text-xs text-slate-400">{new Date(doc.uploadedAt).toLocaleDateString("en-IN")}</p>
        <button
          onClick={() => getSignedUrl(doc)}
          disabled={urlLoading === doc.id}
          title="View / Download"
          className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-primary hover:text-white text-slate-500 flex items-center justify-center transition-colors dark:bg-slate-800 disabled:opacity-50"
        >
          {urlLoading === doc.id
            ? <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
            : <span className="material-symbols-outlined text-sm">open_in_new</span>
          }
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    if (filtered.length === 0) {
      return (
        <div className="p-16 text-center text-slate-400 card border border-slate-100 dark:border-slate-800">
          <span className="material-symbols-outlined text-5xl block mb-2">folder_open</span>
          No documents found
        </div>
      );
    }

    if (category === "kyc" && sortBy === "name") {
      const kycGroups: Record<string, DocRow[]> = {};
      filtered.forEach(d => {
        const name = d.ownerName || "Unknown Company";
        if (!kycGroups[name]) kycGroups[name] = [];
        kycGroups[name].push(d);
      });

      const sortedCompanies = Object.keys(kycGroups).sort((a, b) => {
        const comp = a.localeCompare(b);
        return sortDirection === "asc" ? comp : -comp;
      });

      return (
        <div className="space-y-6">
          {sortedCompanies.map(companyName => (
            <div key={companyName} className="card border border-slate-100 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 shadow-sm rounded-2xl">
              <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <span className="material-symbols-outlined text-purple-600 text-sm">domain</span>
                  {companyName}
                </h3>
                <span className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 px-2.5 py-0.5 rounded-full font-bold">
                  {kycGroups[companyName].length} KYC Doc{kycGroups[companyName].length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {kycGroups[companyName].map(doc => renderDocRow(doc))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (category === "compliance" && sortBy === "name") {
      const complianceGroups: Record<string, DocRow[]> = {};
      filtered.forEach(d => {
        const title = d.auctionTitle || "Other Compliance Docs";
        if (!complianceGroups[title]) complianceGroups[title] = [];
        complianceGroups[title].push(d);
      });

      const sortedAuctions = Object.keys(complianceGroups).sort((a, b) => {
        const comp = a.localeCompare(b);
        return sortDirection === "asc" ? comp : -comp;
      });

      return (
        <div className="space-y-6">
          {sortedAuctions.map(auctionTitle => (
            <div key={auctionTitle} className="card border border-slate-100 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 shadow-sm rounded-2xl">
              <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600 text-sm">gavel</span>
                  {auctionTitle}
                </h3>
                <span className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 px-2.5 py-0.5 rounded-full font-bold">
                  {complianceGroups[auctionTitle].length} Doc{complianceGroups[auctionTitle].length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {complianceGroups[auctionTitle].map(doc => renderDocRow(doc))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    let displayDocs = [...filtered];
    if (sortBy === "date") {
      displayDocs.sort((a, b) => {
        const timeA = new Date(a.uploadedAt).getTime();
        const timeB = new Date(b.uploadedAt).getTime();
        return sortDirection === "asc" ? timeA - timeB : timeB - timeA;
      });
    } else {
      if (category === "payment") {
        displayDocs.sort((a, b) => {
          const userA = a.userName || "";
          const userB = b.userName || "";
          const compUser = userA.localeCompare(userB);
          if (compUser !== 0) return sortDirection === "asc" ? compUser : -compUser;

          const auctionA = a.auctionTitle || "";
          const auctionB = b.auctionTitle || "";
          return auctionA.localeCompare(auctionB);
        });
      } else {
        displayDocs.sort((a, b) => {
          const nameA = a.fileName || "";
          const nameB = b.fileName || "";
          const comp = nameA.localeCompare(nameB);
          return sortDirection === "asc" ? comp : -comp;
        });
      }
    }

    return (
      <div className="card overflow-hidden border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-2xl">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50">
          <p className="text-sm font-black text-slate-700 dark:text-slate-200">{displayDocs.length} document{displayDocs.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {displayDocs.map(doc => renderDocRow(doc))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-headline font-extrabold tracking-tight text-[color:var(--color-on-surface)]">Document Library</h2>
          <p className="text-[color:var(--color-on-surface-variant)] mt-1">All KYC, compliance, and payment documents stored in S3.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadDocs} className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-750 transition-colors" title="Refresh">
            <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">refresh</span>
          </button>
          <div className="relative w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input className="input-base !pl-11 h-11 text-sm" placeholder="Search documents..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center gap-4 flex-wrap bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex gap-2 flex-wrap">
          {(["all", "kyc", "compliance", "payment"] as DocCategory[]).map(t => (
            <button key={t} onClick={() => setCategory(t)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wide transition-all ${
                category === t ? "bg-primary text-white shadow-sm" : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}>
              <span className="material-symbols-outlined text-sm">{catIcon[t]}</span>
              {t} ({counts[t]})
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Sort:</span>
          <button
            onClick={() => setSortBy(prev => prev === "name" ? "date" : "name")}
            className="px-3 py-1.5 text-xs font-black uppercase rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
          >
            {sortBy === "name" ? "Alphabetical" : "Date Uploaded"}
          </button>
          <button
            onClick={() => setSortDirection(prev => prev === "asc" ? "desc" : "asc")}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            title={sortDirection === "asc" ? "Sort Ascending" : "Sort Descending"}
          >
            <span className="material-symbols-outlined text-sm">
              {sortDirection === "asc" ? "arrow_upward" : "arrow_downward"}
            </span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card p-16 text-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
          <span className="material-symbols-outlined text-4xl text-slate-300 animate-spin block mb-3">progress_activity</span>
          <p className="text-slate-400">Loading documents from S3...</p>
        </div>
      ) : (
        renderContent()
      )}
    </div>
  );
}
