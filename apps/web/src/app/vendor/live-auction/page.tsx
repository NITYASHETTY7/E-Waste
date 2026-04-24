import LiveAuctionEmbed from "@/components/auction/LiveAuctionEmbed";

export const metadata = {
  title: "Live Auction | Vendor Portal | We Connect",
};

export default function VendorLiveAuctionPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-headline font-extrabold text-[color:var(--color-on-surface)]">Live Auction</h1>
          <p className="text-[color:var(--color-on-surface-variant)] text-sm mt-1">Participate in real-time bidding for verified e-waste lots.</p>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <LiveAuctionEmbed userRole="vendor" />
      </div>
    </div>
  );
}
