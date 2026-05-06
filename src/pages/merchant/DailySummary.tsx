import { Calendar } from "lucide-react"
import { SummaryCard } from "@/components/merchant/SummaryCard"
import { TransactionCard } from "@/components/merchant/TransactionCard"
import { getLiveTransactions } from "@/utils/merchant/mockRealtimeFeed"

export function DailySummary() {
  const transactions = getLiveTransactions()
  
  // Basic mock calculation for "Today"
  const totalAmount = transactions.reduce((acc, t) => acc + t.amount, 0)
  const totalTransactions = transactions.length
  const averageTransaction = totalTransactions > 0 ? totalAmount / totalTransactions : 0
  const highestTransaction = totalTransactions > 0 ? Math.max(...transactions.map(t => t.amount)) : 0

  return (
    <div className="p-6 space-y-8 animate-in slide-in-from-right-4 duration-300">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-black text-slate-900">Daily Summary</h1>
        <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-100">
          <Calendar className="h-4 w-4 text-blue-600" />
          <span className="text-xs font-black uppercase tracking-tight">Today</span>
        </div>
      </div>

      <SummaryCard 
        totalAmount={totalAmount}
        totalTransactions={totalTransactions}
        averageTransaction={averageTransaction}
        highestTransaction={highestTransaction}
      />

      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Today's Payments</h3>
          <span className="text-[10px] font-bold text-slate-400">Total: {totalTransactions}</span>
        </div>

        <div className="space-y-3">
          {transactions.slice(0, 10).map((txn) => (
            <TransactionCard key={txn.transactionId} transaction={txn} />
          ))}
          {transactions.length === 0 && (
            <p className="text-center py-10 text-slate-400 font-bold">No transactions today</p>
          )}
        </div>
      </div>
    </div>
  )
}
