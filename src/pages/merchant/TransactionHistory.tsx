import * as React from "react"
import { Search, Calendar } from "lucide-react"
import { TransactionCard } from "@/components/merchant/TransactionCard"
import { getLiveTransactions } from "@/utils/merchant/mockRealtimeFeed"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export function TransactionHistory() {
  const allTransactions = getLiveTransactions()
  const [filter, setFilter] = React.useState<"Today" | "7Days" | "All">("Today")
  const [search, setSearch] = React.useState("")

  const filteredTransactions = React.useMemo(() => {
    return allTransactions.filter(t => {
      const matchesSearch = t.contractorName.toLowerCase().includes(search.toLowerCase()) || 
                           t.transactionId.toLowerCase().includes(search.toLowerCase())
      
      if (!matchesSearch) return false
      
      if (filter === "Today") {
        const today = new Date().toLocaleDateString()
        const txnDate = new Date(t.createdAt).toLocaleDateString()
        return txnDate === today
      }
      
      if (filter === "7Days") {
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return new Date(t.createdAt) >= weekAgo
      }

      return true
    })
  }, [allTransactions, filter, search])

  return (
    <div className="p-6 space-y-6 animate-in slide-in-from-right-4 duration-300">
      <h1 className="text-xl font-black text-slate-900">Transaction History</h1>

      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search contractor or ID..." 
            className="h-12 pl-12 bg-white border-slate-100 rounded-2xl text-xs font-bold shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2 bg-slate-100 p-1 rounded-2xl">
          <FilterTab active={filter === "Today"} onClick={() => setFilter("Today")}>Today</FilterTab>
          <FilterTab active={filter === "7Days"} onClick={() => setFilter("7Days")}>Last 7 Days</FilterTab>
          <FilterTab active={filter === "All"} onClick={() => setFilter("All")}>All</FilterTab>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Showing {filteredTransactions.length} results</h3>
          <Calendar className="h-4 w-4 text-slate-300" />
        </div>
        
        {filteredTransactions.map((txn) => (
          <TransactionCard key={txn.transactionId} transaction={txn} />
        ))}
        
        {filteredTransactions.length === 0 && (
          <div className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">No payments found</div>
        )}
      </div>
    </div>
  )
}

function FilterTab({ children, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex-1 py-3 text-[10px] font-black uppercase tracking-tighter rounded-xl transition-all",
        active ? "bg-white text-blue-600 shadow-sm" : "text-slate-400"
      )}
    >
      {children}
    </button>
  )
}
