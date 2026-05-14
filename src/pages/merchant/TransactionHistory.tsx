import * as React from "react"
import { Search, Calendar, Filter, ArrowUpDown } from "lucide-react"
import { TransactionCard } from "@/components/merchant/TransactionCard"
import { getLiveTransactions } from "@/utils/merchant/mockRealtimeFeed"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

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
    <div className="min-h-screen bg-[#f8fafc] pb-24">
      <div className="bg-white px-6 pt-12 pb-6 border-b border-slate-100 backdrop-blur-md bg-white/80 sticky top-0 z-30">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-[10px] font-black text-brand uppercase tracking-[0.2em] mb-1">Audit Log</p>
            <h1 className="text-2xl font-black text-navy tracking-tight">History</h1>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl">
            <ArrowUpDown className="h-5 w-5 text-slate-400" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-brand transition-colors" />
            <Input 
              placeholder="Search contractor or ID..." 
              className="h-12 pl-12 bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-brand/20 rounded-2xl text-[11px] font-bold shadow-sm transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex p-1 bg-slate-100 rounded-2xl">
            <FilterTab active={filter === "Today"} onClick={() => setFilter("Today")}>Today</FilterTab>
            <FilterTab active={filter === "7Days"} onClick={() => setFilter("7Days")}>7 Days</FilterTab>
            <FilterTab active={filter === "All"} onClick={() => setFilter("All")}>All</FilterTab>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Filter className="h-3 w-3" />
            Found {filteredTransactions.length} payments
          </h3>
          <Calendar className="h-4 w-4 text-slate-300" />
        </div>
        
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredTransactions.map((txn, idx) => (
              <motion.div
                key={txn.transactionId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <TransactionCard transaction={txn} />
              </motion.div>
            ))}
          </AnimatePresence>
          
          {filteredTransactions.length === 0 && (
            <div className="py-24 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <Search className="h-6 w-6 text-slate-200" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">No payments match filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function FilterTab({ children, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex-1 py-2.5 text-[10px] font-black uppercase tracking-tighter rounded-xl transition-all relative",
        active ? "text-brand" : "text-slate-400"
      )}
    >
      {active && (
        <motion.div 
          layoutId="history-pill"
          className="absolute inset-0 bg-white rounded-xl shadow-sm -z-10"
        />
      )}
      {children}
    </button>
  )
}
