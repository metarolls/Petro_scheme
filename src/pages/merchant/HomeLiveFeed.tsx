import * as React from "react"
import { Phone, MapPin, Fuel, Info } from "lucide-react"
import { LivePaymentCard } from "@/components/merchant/LivePaymentCard"
import { mockMerchantPump } from "@/data/merchant/mockPump"
import { getLiveTransactions, saveTransactions, generateNewMockPayment } from "@/utils/merchant/mockRealtimeFeed"
import { Card, CardContent } from "@/components/ui/card"
import { AnimatePresence } from "framer-motion"

export function HomeLiveFeed() {
  const [transactions, setTransactions] = React.useState(getLiveTransactions())
  const [newTxnId, setNewTxnId] = React.useState<string | null>(null)

  React.useEffect(() => {
    // Simulate real-time feed
    const interval = setInterval(() => {
      const chance = Math.random()
      if (chance > 0.7) { // 30% chance every 5 seconds to get a new payment
        const newPayment = generateNewMockPayment()
        setTransactions(prev => {
          const updated = [newPayment, ...prev].slice(0, 50) // Keep last 50
          saveTransactions(updated)
          return updated
        })
        setNewTxnId(newPayment.transactionId)
        // Clear highlight after 3 seconds
        setTimeout(() => setNewTxnId(null), 3000)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 leading-none">Live Payments</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mr-2" />
            System Live
          </p>
        </div>
        <div className="p-2 bg-blue-50 rounded-full">
          <Fuel className="h-6 w-6 text-blue-600" />
        </div>
      </div>

      <Card className="border-none shadow-xl bg-white rounded-[32px] overflow-hidden">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-50 pb-4">
            <h3 className="text-lg font-black text-slate-900">{mockMerchantPump.pumpName}</h3>
            <div className="bg-slate-100 px-3 py-1 rounded-full">
              <p className="text-[9px] font-black uppercase text-slate-500">ID: {mockMerchantPump.pumpId}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-slate-400" />
              <p className="text-xs font-bold text-slate-600">{mockMerchantPump.location}</p>
            </div>
            <div className="flex items-center space-x-2 justify-end">
              <Phone className="h-4 w-4 text-slate-400" />
              <p className="text-xs font-bold text-slate-600">{mockMerchantPump.ownerPhone}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Incoming Feed</h3>
          <p className="text-[10px] font-bold text-blue-600 uppercase">Updating Live</p>
        </div>

        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {transactions.map((txn) => (
              <LivePaymentCard 
                key={txn.transactionId} 
                transaction={txn} 
                isNew={txn.transactionId === newTxnId}
              />
            ))}
          </AnimatePresence>
          
          {transactions.length === 0 && (
            <div className="py-20 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                <Info className="h-8 w-8 text-slate-300" />
              </div>
              <p className="text-sm font-bold text-slate-400">Waiting for payments...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
