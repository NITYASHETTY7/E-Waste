"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";

function printPO(listing: any, vendorUser: any, clientUser: any) {
  const w = window.open('', '_blank');
  if (!w) return;
  const html = `<!DOCTYPE html><html><head><title>Purchase Order ${listing.poNumber}</title>
<style>
  body { font-family: Arial, sans-serif; padding: 40px; color: #111; }
  h1 { font-size: 22px; margin-bottom: 4px; }
  .header { display: flex; justify-content: space-between; border-bottom: 2px solid #16a34a; padding-bottom: 16px; margin-bottom: 24px; }
  .section { margin-bottom: 20px; }
  .section h3 { font-size: 13px; text-transform: uppercase; color: #16a34a; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; margin-bottom: 10px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
  th { background: #f0fdf4; text-align: left; padding: 8px 12px; font-size: 12px; border: 1px solid #d1fae5; }
  td { padding: 8px 12px; font-size: 13px; border: 1px solid #e5e7eb; }
  .row { display: flex; gap: 40px; }
  .col { flex: 1; }
  .total { font-size: 16px; font-weight: bold; color: #16a34a; }
  .sig { margin-top: 60px; display: flex; justify-content: space-between; }
  .sig-box { border-top: 1px solid #111; width: 200px; text-align: center; padding-top: 8px; font-size: 12px; }
  .badge { display: inline-block; padding: 2px 10px; border-radius: 20px; font-size: 11px; font-weight: bold; background: #dcfce7; color: #15803d; }
</style></head><body>
<div class="header">
  <div>
    <h1>PURCHASE ORDER</h1>
    <p style="margin:0;color:#6b7280;font-size:13px;">WeConnect E-Waste Aggregator Platform</p>
  </div>
  <div style="text-align:right;">
    <p style="margin:0;font-weight:bold;font-size:16px;">${listing.poNumber}</p>
    <p style="margin:0;color:#6b7280;font-size:12px;">Issued: ${new Date(listing.poIssuedAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}</p>
    <span class="badge">OFFICIAL DOCUMENT</span>
  </div>
</div>

<div class="row">
  <div class="col section">
    <h3>Buyer (Client)</h3>
    <p style="margin:4px 0;font-weight:bold;">${clientUser?.name || listing.userName || 'Client'}</p>
    <p style="margin:4px 0;font-size:13px;color:#374151;">Bank: ${clientUser?.bankDetails?.bankName || 'N/A'}</p>
    <p style="margin:4px 0;font-size:13px;color:#374151;">A/C: ${clientUser?.bankDetails?.accountNumber || 'N/A'}</p>
    <p style="margin:4px 0;font-size:13px;color:#374151;">IFSC: ${clientUser?.bankDetails?.ifscCode || 'N/A'}</p>
  </div>
  <div class="col section">
    <h3>Seller (Vendor)</h3>
    <p style="margin:4px 0;font-weight:bold;">${vendorUser?.name || listing.winnerVendorName || 'Vendor'}</p>
    <p style="margin:4px 0;font-size:13px;color:#374151;">Bank: ${vendorUser?.bankDetails?.bankName || 'N/A'}</p>
    <p style="margin:4px 0;font-size:13px;color:#374151;">A/C: ${vendorUser?.bankDetails?.accountNumber || 'N/A'}</p>
    <p style="margin:4px 0;font-size:13px;color:#374151;">IFSC: ${vendorUser?.bankDetails?.ifscCode || 'N/A'}</p>
  </div>
</div>

<div class="section">
  <h3>Material Details</h3>
  <table>
    <tr><th>Description</th><th>Category</th><th>Quantity (kg)</th><th>Location</th><th>Unit Price</th><th>Total</th></tr>
    <tr>
      <td>${listing.title}</td>
      <td>${listing.category}</td>
      <td>${listing.weight} kg</td>
      <td>${listing.location}</td>
      <td>₹${((listing.price || 0) / (listing.weight || 1)).toFixed(2)}/kg</td>
      <td>₹${(listing.price || 0).toLocaleString('en-IN')}</td>
    </tr>
  </table>
</div>

<div class="section">
  <h3>Commercial Summary</h3>
  <table>
    <tr><th>Component</th><th>Amount</th></tr>
    <tr><td>Material Value (paid to Client)</td><td>₹${(listing.price || 0).toLocaleString('en-IN')}</td></tr>
    <tr><td>WeConnect Commission (5%)</td><td>₹${Math.round((listing.price || 0) * 0.05).toLocaleString('en-IN')}</td></tr>
    <tr><td style="font-weight:bold;" class="total">Total Payable by Vendor</td><td style="font-weight:bold;" class="total">₹${Math.round((listing.price || 0) * 1.05).toLocaleString('en-IN')}</td></tr>
    ${listing.emdAmount ? `<tr><td>EMD (Earnest Money Deposit)</td><td>₹${listing.emdAmount.toLocaleString('en-IN')}</td></tr>` : ''}
  </table>
</div>

<div class="row">
  <div class="col section">
    <h3>Payment Terms</h3>
    <p style="font-size:13px;">${listing.poPaymentTerms || 'As per agreement'}</p>
  </div>
  <div class="col section">
    <h3>Delivery Terms</h3>
    <p style="font-size:13px;">${listing.poDeliveryTerms || 'As per agreement'}</p>
  </div>
</div>

${listing.poPenaltyClause ? `<div class="section"><h3>Penalty Clause</h3><p style="font-size:13px;">${listing.poPenaltyClause}</p></div>` : ''}
${listing.poSpecialConditions ? `<div class="section"><h3>Special Conditions</h3><p style="font-size:13px;">${listing.poSpecialConditions}</p></div>` : ''}

<div class="sig">
  <div class="sig-box">Client Signature</div>
  <div class="sig-box">Vendor Signature</div>
  <div class="sig-box">WeConnect Authority</div>
</div>
<p style="text-align:center;color:#9ca3af;font-size:11px;margin-top:40px;">Generated by WeConnect E-Waste Aggregator Platform</p>
</body></html>`;
  w.document.write(html);
  w.document.close();
  w.print();
}

export default function VendorPurchaseOrderPage() {
  const { currentUser, listings, users, acknowledgePO, submitEMD, verifyEMD } = useApp();
  const [emdModal, setEmdModal] = useState<{ listingId: string; amount: string; utr: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');

  if (!currentUser) return null;

  const myListings = listings.filter(
    l => l.winnerVendorId === currentUser.companyId || l.winnerVendorId === currentUser.id || l.winnerVendorName === currentUser.name
  ).filter(l => l.poStatus);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleAcknowledge = (listingId: string) => {
    acknowledgePO(listingId);
    showToast('Purchase Order acknowledged successfully.');
  };

  const handleEmdSubmit = async () => {
    if (!emdModal) return;
    if (!emdModal.utr.trim()) { showToast('Please enter UTR number.'); return; }
    const amount = parseFloat(emdModal.amount);
    if (!amount || isNaN(amount)) { showToast('Please enter valid EMD amount.'); return; }
    setSubmitting(true);
    await submitEMD(emdModal.listingId, amount, emdModal.utr.trim());
    setSubmitting(false);
    setEmdModal(null);
    showToast('EMD submitted successfully. Awaiting admin verification.');
  };

  const getPoStatusBadge = (status?: string) => {
    const map: Record<string, string> = {
      issued: 'bg-blue-100 text-blue-700',
      acknowledged: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
    };
    return map[status || 'pending'] || 'bg-slate-100 text-slate-600';
  };

  const getEmdStatusBadge = (status?: string) => {
    const map: Record<string, string> = {
      not_required: 'bg-slate-100 text-slate-500',
      pending: 'bg-yellow-100 text-yellow-700',
      submitted: 'bg-blue-100 text-blue-700',
      verified: 'bg-green-100 text-green-700',
    };
    return map[status || 'not_required'] || 'bg-slate-100 text-slate-500';
  };

  const clientUser = (listingUserId: string) => users.find(u => u.id === listingUserId || u.companyId === listingUserId);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-bold">
          {toast}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Purchase Orders</h1>
        <p className="text-sm text-slate-500 mt-1">View and manage purchase orders for auctions you have won.</p>
      </div>

      {myListings.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <span className="material-symbols-outlined text-5xl mb-3 block">description</span>
          <p className="font-bold">No purchase orders yet.</p>
          <p className="text-sm">Purchase orders will appear here once you win an auction.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {myListings.map(listing => {
            const client = users.find(u => u.id === listing.userId);
            const totalPayable = Math.round((listing.price || 0) * 1.05);
            const commission = Math.round((listing.price || 0) * 0.05);

            return (
              <div key={listing.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <p className="font-black text-slate-900 dark:text-white">{listing.title}</p>
                    <p className="text-xs text-slate-500">{listing.id} · {listing.category} · {listing.weight} kg</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${getPoStatusBadge(listing.poStatus)}`}>
                      PO {listing.poStatus}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${getEmdStatusBadge(listing.emdStatus)}`}>
                      EMD: {(listing.emdStatus || 'not_required').replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* PO Details */}
                {listing.poNumber && (
                  <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/40">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-slate-500 uppercase font-bold">PO Number</p>
                        <p className="font-black text-slate-900 dark:text-white mt-0.5">{listing.poNumber}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase font-bold">Issued On</p>
                        <p className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                          {listing.poIssuedAt ? new Date(listing.poIssuedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase font-bold">Payment Terms</p>
                        <p className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5 text-xs">{listing.poPaymentTerms || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase font-bold">Delivery Terms</p>
                        <p className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5 text-xs">{listing.poDeliveryTerms || '—'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment breakdown */}
                <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Payment Breakdown</p>
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">Material Value (to Client)</span>
                        <span className="font-bold text-slate-900 dark:text-white">₹{(listing.price || 0).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">WeConnect Commission (5%)</span>
                        <span className="font-bold text-slate-900 dark:text-white">₹{commission.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between">
                        <span className="font-black text-slate-900 dark:text-white">Total Payable</span>
                        <span className="font-black text-green-600 text-lg">₹{totalPayable.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                    {listing.emdAmount && (
                      <div className="flex justify-between text-sm px-1">
                        <span className="text-slate-500">EMD Amount Required</span>
                        <span className="font-bold text-orange-600">₹{listing.emdAmount.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Bank Accounts</p>
                    <div className="space-y-2">
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3">
                        <p className="text-[10px] font-black text-blue-600 uppercase mb-1">Client Account (Material Payment)</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{client?.bankDetails?.accountHolderName || listing.userName}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{client?.bankDetails?.bankName} · {client?.bankDetails?.accountNumber}</p>
                        <p className="text-xs text-slate-500">IFSC: {client?.bankDetails?.ifscCode}</p>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3">
                        <p className="text-[10px] font-black text-green-600 uppercase mb-1">WeConnect Account (Commission)</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">WeConnect Aggregator Pvt Ltd</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">HDFC Bank · 50100987654321</p>
                        <p className="text-xs text-slate-500">IFSC: HDFC0009876</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* EMD status info */}
                {listing.emdStatus === 'submitted' && (
                  <div className="mx-6 mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-sm text-blue-700 dark:text-blue-300">
                    <span className="material-symbols-outlined text-base align-middle mr-1">info</span>
                    EMD submitted (UTR: {listing.emdUTR}). Awaiting admin verification.
                  </div>
                )}
                {listing.emdStatus === 'verified' && (
                  <div className="mx-6 mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl text-sm text-green-700 dark:text-green-300">
                    <span className="material-symbols-outlined text-base align-middle mr-1">verified</span>
                    EMD verified. You may proceed to pickup.
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-3 px-6 pb-5">
                  {listing.poStatus === 'issued' && (
                    <button onClick={() => handleAcknowledge(listing.id)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold transition-colors flex items-center gap-2">
                      <span className="material-symbols-outlined text-base">check_circle</span>
                      Acknowledge PO
                    </button>
                  )}
                  {listing.poStatus === 'acknowledged' && listing.emdStatus === 'pending' && (
                    <button onClick={() => setEmdModal({ listingId: listing.id, amount: String(listing.emdAmount || ''), utr: '' })}
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-bold transition-colors flex items-center gap-2">
                      <span className="material-symbols-outlined text-base">account_balance</span>
                      Submit EMD
                    </button>
                  )}
                  {listing.poNumber && (
                    <button onClick={() => printPO(listing, currentUser, client)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold transition-colors flex items-center gap-2">
                      <span className="material-symbols-outlined text-base">download</span>
                      Download PO
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* EMD Modal */}
      {emdModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="font-black text-slate-900 dark:text-white">Submit EMD Payment</h2>
              <button onClick={() => setEmdModal(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-500">Transfer the EMD amount to WeConnect's account and enter the UTR number below.</p>
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-3 text-sm">
                <p className="font-bold text-orange-700 dark:text-orange-400">WeConnect EMD Account</p>
                <p className="text-orange-600 dark:text-orange-300 text-xs">HDFC Bank · 50100987654321 · IFSC: HDFC0009876</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">EMD Amount (₹)</label>
                <input type="number" value={emdModal.amount}
                  onChange={e => setEmdModal(p => p ? { ...p, amount: e.target.value } : p)}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">UTR / Reference Number *</label>
                <input type="text" placeholder="e.g. HDFC1234567890" value={emdModal.utr}
                  onChange={e => setEmdModal(p => p ? { ...p, utr: e.target.value } : p)}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none" />
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setEmdModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800">
                Cancel
              </button>
              <button onClick={handleEmdSubmit} disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold disabled:opacity-50">
                {submitting ? 'Submitting…' : 'Submit EMD'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
