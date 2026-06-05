"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminPurchaseOrders() {
  const [poListings, setPoListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAuctions = useCallback(async () => {
    try {
      // Fetch COMPLETED auctions which will have the post-auction data
      const res = await api.get('/auctions?status=COMPLETED');
      setPoListings(res.data);
    } catch (e) {
      showToast("Failed to fetch purchase orders", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  const downloadDoc = async (s3Key: string, bucket: string, fileName: string) => {
    try {
      const res = await api.get(\`/companies/signed-url?s3Key=\${encodeURIComponent(s3Key)}&s3Bucket=\${encodeURIComponent(bucket)}\`);
      const url = res.data?.url || res.data?.signedUrl || res.data;
      if (typeof url === "string") {
        window.open(url, "_blank");
      } else {
        showToast("Could not get download link", "error");
      }
    } catch {
      showToast("Download failed — try again", "error");
    }
  };

  const stats = {
    total: poListings.length,
    pending: poListings.filter(l => !l.auctionDocs?.some((d: any) => d.type === "PURCHASE_ORDER")).length,
    issued: poListings.filter(l => l.auctionDocs?.some((d: any) => d.type === "PURCHASE_ORDER")).length,
  };

  const stats = {
    total: poListings.length,
    pending: poListings.filter(l => !l.poStatus || l.poStatus === "pending").length,
    issued: poListings.filter(l => l.poStatus === "issued").length,
    acknowledged: poListings.filter(l => l.poStatus === "acknowledged").length,
    emdPending: poListings.filter(l => l.emdStatus === "submitted").length,
  };

  const printDocument = (listing: typeof poListings[0], type: "PO" | "WO" | "AGREEMENT") => {
    const winBid = getWinBid(listing.id, listing.winnerVendorId!);
    const vendor = getVendor(listing.winnerVendorId!);
    const client = getClient(listing.userId);
    const commission = Math.round((winBid?.amount || 0) * 0.05);
    const clientAmount = (winBid?.amount || 0) - commission;

    let docTitle = "PURCHASE ORDER";
    let docRef = `PO Number: ${listing.poNumber || 'WC-DRAFT'}`;
    let termsLabel = "Payment Terms";
    
    if (type === "WO") {
      docTitle = "WORK ORDER";
      docRef = `WO Number: WO-${listing.poNumber?.replace('WC-', '') || 'DRAFT'}`;
    } else if (type === "AGREEMENT") {
      docTitle = "VENDOR AGREEMENT";
      docRef = `Agreement Ref: AG-${listing.poNumber?.replace('WC-', '') || 'DRAFT'}`;
      termsLabel = "Commercial Terms";
    }

    const html = `
<!DOCTYPE html><html><head><title>${docTitle} - ${listing.poNumber}</title>
<style>body{font-family:Arial,sans-serif;max-width:800px;margin:40px auto;color:#111;line-height:1.5}
h1{color:#1e8e3e;border-bottom:3px solid #1e8e3e;padding-bottom:8px}
table{width:100%;border-collapse:collapse;margin:16px 0}
th{background:#f1f5f9;padding:10px;text-align:left;border:1px solid #e2e8f0}
td{padding:10px;border:1px solid #e2e8f0}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin:16px 0}
.section{background:#f8fafc;padding:16px;border-radius:8px;border-left:4px solid #1e8e3e}
.label{font-size:11px;color:#64748b;text-transform:uppercase;font-weight:bold}
.val{font-size:14px;margin-top:2px;font-weight:bold}
.sig{margin-top:60px;display:grid;grid-template-columns:1fr 1fr;gap:40px}
.sig-box{border-top:2px solid #111;padding-top:8px;font-size:12px}
@media print{body{margin:0}}</style>
</head><body>
<div style="display:flex;justify-content:space-between;align-items:center">
  <div><h1 style="margin:0">${docTitle}</h1><p style="color:#64748b;margin:4px 0">WeConnect E-Waste Aggregator Platform</p></div>
  <div style="text-align:right"><div class="label">Reference</div><div style="font-size:18px;font-weight:900;color:#1e8e3e">${docRef}</div>
  <div class="label">Date</div><div>${listing.poIssuedAt ? new Date(listing.poIssuedAt).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN')}</div></div>
</div>

${type === "AGREEMENT" ? `
<p style="margin-top:20px; text-align:justify;">This Agreement is made and entered into as of the date specified above by and between the Buyer (Client) and the Seller (Vendor) via the WeConnect platform, regarding the collection, processing, and recycling of e-waste materials as specified below.</p>
` : ''}

<div class="grid">
  <div class="section"><div class="label">Buyer (Client)</div><div class="val">${client?.name || listing.userName}</div>
  <div style="font-size:12px;color:#64748b;margin-top:4px">${client?.onboardingProfile?.address || ''}, ${client?.onboardingProfile?.city || ''}</div>
  ${client?.onboardingProfile?.gstin ? `<div style="font-size:12px;margin-top:4px">GSTIN: <b>${client.onboardingProfile.gstin}</b></div>` : ''}</div>
  <div class="section"><div class="label">Seller (Vendor)</div><div class="val">${vendor?.name || listing.winnerVendorName}</div>
  <div style="font-size:12px;color:#64748b;margin-top:4px">${vendor?.onboardingProfile?.address || ''}, ${vendor?.onboardingProfile?.city || ''}</div></div>
</div>

${type === "WO" ? `
<h3 style="margin-top:24px;color:#334155;border-bottom:1px solid #e2e8f0;padding-bottom:4px;">Scope of Work</h3>
<p style="text-align:justify;font-size:14px;">The Vendor agrees to safely collect, transport, and environmentally process the e-waste items listed below from the Client's premises in accordance with the E-Waste (Management) Rules, 2022, and issue applicable destruction/recycling certificates within 30 days of pickup.</p>
` : ''}

<table><thead><tr><th>Description</th><th>Category</th><th>Est. Qty</th><th>Unit</th><th>Rate (₹)</th><th>Amount (₹)</th></tr></thead>
<tbody><tr><td>${listing.title}</td><td>${listing.category}</td><td>${listing.weight}</td><td>KG</td>
<td>${winBid ? Math.round((winBid.amount || 0) / listing.weight).toLocaleString() : '—'}</td>
<td><b>${(winBid?.amount || 0).toLocaleString()}</b></td></tr>
<tr><td colspan="5" style="text-align:right"><b>WeConnect Commission (5%)</b></td><td style="color:#ef4444">−₹${commission.toLocaleString()}</td></tr>
<tr><td colspan="5" style="text-align:right"><b>Net Payable to Client</b></td><td><b style="color:#1e8e3e">₹${clientAmount.toLocaleString()}</b></td></tr></tbody></table>

<div class="grid">
  <div><div class="label">${termsLabel}</div><div class="val">${listing.poPaymentTerms || '—'}</div></div>
  <div><div class="label">Delivery & Pickup Terms</div><div class="val">${listing.poDeliveryTerms || '—'}</div></div>
  <div><div class="label">Penalty Clause</div><div class="val">${listing.poPenaltyClause || '—'}</div></div>
  ${listing.poSpecialConditions ? `<div><div class="label">Special Conditions</div><div class="val">${listing.poSpecialConditions}</div></div>` : ''}
</div>

${type === "AGREEMENT" ? `
<h3 style="margin-top:24px;color:#334155;border-bottom:1px solid #e2e8f0;padding-bottom:4px;">Terms & Conditions</h3>
<ol style="font-size:13px;color:#334155;padding-left:16px;">
  <li>The Vendor confirms possessing valid CPCB/SPCB authorization for handling the stipulated e-waste category.</li>
  <li>Data destruction (if applicable) must be executed before final processing, with a certificate provided to the Client.</li>
  <li>Discrepancies in weight exceeding 5% at the time of pickup must be mutually verified and documented.</li>
  <li>Both parties adhere to the indemnification policies as defined in the WeConnect Platform Master Service Agreement.</li>
</ol>
` : ''}

<p style="font-size:12px;color:#64748b;margin-top:16px">This ${docTitle} is generated by WeConnect E-Waste Aggregator platform and is subject to platform terms and conditions. EMD amount of ₹${(listing.emdAmount || 0).toLocaleString()} is ${listing.emdStatus === 'not_required' ? 'not applicable' : listing.emdStatus === 'verified' ? 'verified and on record' : 'pending'}.</p>
<div class="sig">
  <div class="sig-box">Authorised Signatory — Client<br><br><br><br>${client?.name || 'Client'}<br>Date: _______________</div>
  <div class="sig-box">Authorised Signatory — Vendor<br><br><br><br>${vendor?.name || 'Vendor'}<br>Date: _______________</div>
</div>
</body></html>`;
    const w = window.open('', '_blank');
    if (w) { w.document.write(html); w.document.close(); w.print(); }
  };


  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 relative">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 px-6 py-3 rounded-xl shadow-xl z-50 text-white font-bold text-sm ${toast.type === "success" ? "bg-emerald-600" : "bg-red-600"}`}>
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <h2 className="text-3xl font-headline font-extrabold tracking-tight text-[color:var(--color-on-surface)]">Purchase Orders</h2>
        <p className="text-[color:var(--color-on-surface-variant)] mt-1">Issue and manage Purchase Orders for completed auctions. Verify EMD submissions.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: "Total Deals", value: stats.total, icon: "description", color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20" },
          { label: "PO Pending", value: stats.pending, icon: "pending_actions", color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20" },
          { label: "PO Issued", value: stats.issued, icon: "send", color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20" },
        ].map(s => (
          <div key={s.label} className="card p-4 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.color}`}>
                <span className="material-symbols-outlined text-base">{s.icon}</span>
              </div>
              <div>
                <p className="text-xl font-black text-[color:var(--color-on-surface)]">{loading ? "-" : s.value}</p>
                <p className="text-[10px] text-[color:var(--color-on-surface-variant)] font-medium leading-tight">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="p-20 text-center text-slate-400 flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-4xl animate-spin">progress_activity</span>
          <p className="text-sm font-bold">Loading purchase orders…</p>
        </div>
      ) : poListings.length === 0 ? (
        <div className="card p-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
          <span className="material-symbols-outlined text-5xl text-slate-300 block mb-3">description</span>
          <p className="font-bold text-slate-600 dark:text-slate-400">No completed auctions with approved quotes yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {poListings.map(listing => {
            const hasDocs = listing.auctionDocs && listing.auctionDocs.length > 0;
            const poDoc = listing.auctionDocs?.find((d: any) => d.type === "PURCHASE_ORDER");
            const woDoc = listing.auctionDocs?.find((d: any) => d.type === "WORK_ORDER");
            const agDoc = listing.auctionDocs?.find((d: any) => d.type === "AGREEMENT");
            const winBid = listing.bids?.[0];

            return (
              <div key={listing.id} className="card p-0 overflow-hidden border border-slate-100 dark:border-slate-800">
                <div className="p-5 bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase ${hasDocs ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                        {hasDocs ? "Documents Generated" : "Pending Generation"}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{listing.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Client: <span className="font-semibold">{listing.client?.name}</span> · Winner: <span className="font-semibold">{listing.winner?.name}</span> · Bid: <span className="font-semibold text-primary">₹{(winBid?.amount || 0).toLocaleString()}</span>
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap shrink-0">
                    {hasDocs ? (
                      <div className="flex gap-2 flex-wrap bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                        {poDoc && (
                          <button onClick={() => downloadDoc(poDoc.s3Key, poDoc.s3Bucket, poDoc.fileName)}
                            className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold shadow-sm hover:text-primary transition-colors flex items-center gap-1 border border-slate-200 dark:border-slate-700">
                            <span className="material-symbols-outlined text-sm">receipt_long</span> PO
                          </button>
                        )}
                        {woDoc && (
                          <button onClick={() => downloadDoc(woDoc.s3Key, woDoc.s3Bucket, woDoc.fileName)}
                            className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold shadow-sm hover:text-primary transition-colors flex items-center gap-1 border border-slate-200 dark:border-slate-700">
                            <span className="material-symbols-outlined text-sm">assignment</span> Work Order
                          </button>
                        )}
                        {agDoc && (
                          <button onClick={() => downloadDoc(agDoc.s3Key, agDoc.s3Bucket, agDoc.fileName)}
                            className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold shadow-sm hover:text-primary transition-colors flex items-center gap-1 border border-slate-200 dark:border-slate-700">
                            <span className="material-symbols-outlined text-sm">handshake</span> Agreement
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="px-4 py-2 rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 text-xs font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">info</span>
                        Generate docs in Post-Auction Flow
                      </div>
                    )}
                  </div>
                </div>

                {hasDocs && (
                  <div className="px-5 py-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    {[
                      { label: "Payment Terms", value: listing.poPaymentTerms },
                      { label: "Delivery Terms", value: listing.poDeliveryTerms },
                      { label: "Penalty Clause", value: listing.poPenaltyClause },
                    ].map(item => (
                      <div key={item.label}>
                        <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">{item.label}</p>
                        <p className="text-slate-700 dark:text-slate-300 font-medium mt-0.5">{item.value || "—"}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
