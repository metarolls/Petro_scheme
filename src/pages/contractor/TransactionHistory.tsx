import * as React from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, ArrowUpRight, ArrowDownLeft } from "lucide-react"
import { TransactionCard } from "@/components/contractor/TransactionCard"
import { Card, CardContent } from "@/components/ui/card"
import { getTransactions } from "@/lib/contractor/walletStorage"
import { formatCurrency, cn } from "@/lib/utils"

export function TransactionHistory() {
  const navigate = useNavigate()
  const [filter, setFilter] = React.useState<"All" | "Earned" | "Spent">("All")
  const [transactions] = React.useState(getTransactions())

  const filteredTransactions = React.useMemo(() => {
    return transactions.filter(t => {
      if (filter === "Earned") return t.direction === "credit"
      if (filter === "Spent") return t.direction === "debit"
      return true
    })
  }, [transactions, filter])

  const totalEarned = transactions
    .filter(t => t.direction === "credit")
    .reduce((acc, t) => acc + t.amount, 0)
    
  const totalSpent = transactions
    .filter(t => t.direction === "debit")
    .reduce((acc, t) => acc + t.amount, 0)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <button onClick={() => navigate("/contractor/home")} className="p-2 bg-white rounded-full shadow-sm border border-slate-100">
          <ChevronLeft className="h-6 w-6 text-slate-900" />
        </button>
        <h1 className="text-xl font-black text-slate-900">Transaction History</h1>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-2 gap-4">
        <SummaryItem 
          label="Total Earned" 
          value={formatCurrency(totalEarned)} 
          icon={ArrowUpRight} 
          color="text-emerald-600 bg-emerald-50" 
        />
        <SummaryItem 
          label="Total Spent" 
          value={formatCurrency(totalSpent)} 
          icon={ArrowDownLeft} 
          color="text-rose-600 bg-rose-50" 
        />
      </div>

      {/* Filters */}
      <div className="flex space-x-2 bg-slate-100 p-1 rounded-2xl">
        <FilterTab active={filter === "All"} onClick={() => setFilter("All")}>All</FilterTab>
        <FilterTab active={filter === "Earned"} onClick={() => setFilter("Earned")}>Earned</FilterTab>
        <FilterTab active={filter === "Spent"} onClick={() => setFilter("Spent")}>Spent</FilterTab>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filteredTransactions.map((txn) => (
          <TransactionCard key={txn.transactionId} transaction={txn} />
        ))}
        {filteredTransactions.length === 0 && (
          <div className="py-20 text-center text-slate-400 font-bold">No transactions found</div>
        )}
      </div>
    </div>
  )
}

function SummaryItem({ label, value, icon: Icon, color }: any) {
  return (
    <Card className="border-none shadow-sm bg-white overflow-hidden">
      <CardContent className="p-4 flex flex-col items-center text-center">
        <div className={cn("p-2 rounded-xl mb-2", color)}>
          <Icon className="h-4 w-4" />
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-lg font-black text-slate-900">{value}</p>
      </CardContent>
    </Card>
  )
}

function FilterTab({ children, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex-1 py-3 text-xs font-black uppercase tracking-tighter rounded-xl transition-all",
        active ? "bg-white text-blue-600 shadow-sm" : "text-slate-400"
      )}
    >
      {children}
    </button>
  )
}
