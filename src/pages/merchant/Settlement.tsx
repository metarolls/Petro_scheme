import { History, Info, Landmark } from "lucide-react"
import { SettlementCard } from "@/components/merchant/SettlementCard"
import { StatusBadge } from "@/components/merchant/StatusBadge"
import { mockMerchantPump } from "@/data/merchant/mockPump"
import { mockMerchantSettlements } from "@/data/merchant/mockSettlements"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

export function Settlement() {
  return (
    <div className="p-6 space-y-8 animate-in slide-in-from-right-4 duration-300">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-black text-slate-900">Settlement</h1>
        <div className="p-2 bg-amber-50 rounded-full">
          <Landmark className="h-6 w-6 text-amber-600" />
        </div>
      </div>

      <SettlementCard 
        balance={mockMerchantPump.outstandingBalance} 
        pumpName={mockMerchantPump.pumpName} 
      />

      <div className="space-y-4">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Settlement Details</h3>
        <Card className="border-none bg-white shadow-sm rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            <DetailItem label="Pump Name" value={mockMerchantPump.pumpName} />
            <DetailItem label="Pending Since" value="May 05, 2026" />
            <DetailItem label="Last Settlement" value="₹12,000 (Paid)" />
            <DetailItem label="Expected Date" value="May 07, 2026" last />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Settlement History</h3>
          <History className="h-4 w-4 text-slate-300" />
        </div>

        <div className="space-y-3">
          {mockMerchantSettlements.map((item) => (
            <Card key={item.settlementId} className="border-slate-100 shadow-sm">
              <CardContent className="p-4 flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.date}</p>
                  <p className="text-sm font-black text-slate-900">ID: {item.settlementId}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-lg font-black text-slate-900">{formatCurrency(item.amount)}</p>
                  <StatusBadge status={item.status} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="bg-slate-100 p-4 rounded-2xl flex items-start space-x-3">
        <Info className="h-5 w-5 text-slate-400 mt-0.5" />
        <p className="text-[10px] text-slate-500 font-bold uppercase leading-relaxed tracking-tight">
          Settlements are processed by the company administrator. If there is any discrepancy, please contact support.
        </p>
      </div>
    </div>
  )
}

function DetailItem({ label, value, last }: any) {
  return (
    <div className={`flex justify-between items-center p-4 ${!last ? 'border-b border-slate-50' : ''}`}>
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
      <span className="text-xs font-black text-slate-900 uppercase">{value}</span>
    </div>
  )
}
