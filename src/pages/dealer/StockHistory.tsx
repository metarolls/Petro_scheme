import * as React from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, TrendingUp, ArrowUpRight, Clock } from "lucide-react"
import { db } from "@/lib/firebase"
import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  orderBy 
} from "firebase/firestore"
import { formatCurrency, cn, formatDate } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

export function StockHistory() { // Keeping name for routing compatibility for now
  const navigate = useNavigate()
  const [filter, setFilter] = React.useState<"All" | "transfer">("All")
  const [history, setHistory] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  const dealerId = localStorage.getItem('dealerId')

  React.useEffect(() => {
    if (!dealerId) {
      navigate('/dealer/login')
      return
    }

    const q = query(
      collection(db, "wallet_history"),
      where("sourceId", "==", dealerId),
      orderBy("timestamp", "desc")
    )

    const unsub = onSnapshot(q, (snap) => {
      setHistory(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      setLoading(false)
    })

    return () => unsub()
  }, [dealerId, navigate])

  const filteredHistory = history.filter(item => 
    filter === "All" ? true : item.type === filter
  )

  const totalWeight = history
    .filter(item => item.type === 'transfer')
    .reduce((acc, item) => acc + (item.weightKg || 0), 0)

  const totalPayments = history
    .filter(item => item.type === 'transfer')
    .reduce((acc, item) => acc + (item.amount || 0), 0)

  return (
    <div className="p-6 space-y-6 pb-24 animate-in fade-in duration-500">
      <div className="flex items-center space-x-4">
        <button onClick={() => navigate("/dealer/home")} className="p-2 bg-white rounded-full shadow-sm border border-slate-100 active:scale-90 transition-transform">
          <ChevronLeft className="h-6 w-6 text-navy" />
        </button>
        <div>
          <h1 className="text-xl font-black text-navy">Transaction History</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">लेनदेन इतिहास</p>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-navy rounded-[2.5rem] p-8 text-white shadow-2xl shadow-navy/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand/10 rounded-full -mr-16 -mt-16 blur-2xl" />
        <div className="space-y-6 relative z-10">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-1">Total Sales Volume</p>
              <p className="text-3xl font-black text-emerald-400">{totalWeight.toLocaleString()} KG</p>
            </div>
            <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-emerald-400" />
            </div>
          </div>
          <div className="pt-6 border-t border-white/10 flex justify-between items-center">
            <div>
              <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-1">Total Fuel Paid</p>
              <p className="text-xl font-black text-brand">{formatCurrency(totalPayments)}</p>
            </div>
            <div className="text-right">
              <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-1">Total Txns</p>
              <p className="text-xl font-black">{history.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-2 bg-slate-100 p-1.5 rounded-2xl">
        <FilterBtn active={filter === "All"} onClick={() => setFilter("All")}>All Transfers</FilterBtn>
      </div>

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-brand border-t-transparent rounded-full mx-auto" />
          </div>
        ) : filteredHistory.length > 0 ? (
          filteredHistory.map((item) => (
            <TransactionCard key={item.id} item={item} />
          ))
        ) : (
          <div className="py-20 text-center space-y-3">
            <div className="bg-slate-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto">
              <Clock className="h-8 w-8 text-slate-200" />
            </div>
            <p className="text-slate-400 font-bold">No transactions found</p>
          </div>
        )}
      </div>
    </div>
  )
}

function TransactionCard({ item }: { item: any }) {
  if (item.type === 'reward') return null;
  
  return (
    <Card className="border-none shadow-sm rounded-2xl overflow-hidden hover:bg-slate-50 transition-colors">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl flex items-center justify-center bg-brand/10 text-brand">
            <ArrowUpRight className="h-6 w-6" />
          </div>
          <div>
            <p className="font-black text-navy text-sm uppercase tracking-tight">
              Paid to {item.destinationName}
            </p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
              {formatDate(item.timestamp?.toDate() || new Date())}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-base font-black text-brand">
            -{formatCurrency(item.amount)}
          </p>
          {item.weightKg && (
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
              {item.weightKg} Kg Sale
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function FilterBtn({ children, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
        active ? "bg-white text-navy shadow-sm" : "text-slate-400"
      )}
    >
      {children}
    </button>
  )
}

