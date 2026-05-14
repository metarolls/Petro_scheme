import { IndianRupee, Fuel, ArrowUpRight, TrendingUp, Info } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency, cn, comingSoon } from "@/lib/utils"
import { motion } from "framer-motion"
import * as React from "react"
import { db } from "@/lib/firebase"
import { collection, query, where, onSnapshot } from "firebase/firestore"

export function DailySummary() {
  const [sales, setSales] = React.useState(0)
  const [volume, setVolume] = React.useState(0)
  const [txnCount, setTxnCount] = React.useState(0)
  
  const pumpId = localStorage.getItem("pumpId") || ""

  React.useEffect(() => {
    if (!pumpId) {
      return
    }

    // Get start and end of today
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const end = new Date()
    end.setHours(23, 59, 59, 999)

    const q = query(
      collection(db, "wallet_history"),
      where("destinationId", "==", pumpId),
      where("timestamp", ">=", start),
      where("timestamp", "<=", end)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let totalSales = 0
      let totalVolume = 0
      let count = 0

      snapshot.forEach(doc => {
        const data = doc.data()
        if (data.type === 'fuel_payment' || data.type === 'transfer') {
          totalSales += data.amount || 0
          totalVolume += data.fuelQuantity || 0
          count++
        }
      })

      setSales(totalSales)
      setVolume(totalVolume)
      setTxnCount(count)
    }, (err) => {
      console.error("Error loading daily stats:", err)
    })

    return () => unsubscribe()
  }, [pumpId])

  const stats = [
    { label: "Total Sales", sub: "एकूण विक्री", value: sales, icon: IndianRupee, color: "brand" },
    { label: "Fuel Volume", sub: "इंधन खंड", value: `${volume.toFixed(2)} L`, icon: Fuel, color: "success" },
    { label: "Transactions", sub: "व्यवहार", value: txnCount.toString(), icon: TrendingUp, color: "warning" },
  ]

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24">
      <div className="p-6 pb-2">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reports for {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => comingSoon(`${stat.label} Analytics`)}
            >
              <Card className="border-none shadow-xl shadow-slate-200/40 rounded-[2rem] overflow-hidden bg-white group hover:scale-[1.02] transition-transform duration-300 cursor-pointer">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm",
                      stat.color === "brand" ? "bg-brand-soft text-brand" : 
                      stat.color === "success" ? "bg-success-soft text-success" : "bg-warning-soft text-warning"
                    )}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{stat.label}</p>
                        <span className="text-[8px] font-bold opacity-60 uppercase">{stat.sub}</span>
                      </div>
                      <p className="text-xl font-black text-navy mt-1 tracking-tight">{typeof stat.value === 'number' ? formatCurrency(stat.value) : stat.value}</p>
                    </div>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-brand transition-colors">
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Info Card */}
        <Card className="border-none bg-navy rounded-[2rem] p-6 relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-brand/20 to-transparent" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Info className="h-4 w-4 text-brand" />
              <p className="text-[10px] font-black text-brand uppercase tracking-widest">Operational Insights</p>
            </div>
            <p className="text-sm font-bold text-slate-300 leading-relaxed">
              Your fuel sales are up <span className="text-success">12%</span> compared to yesterday. Most transactions were processed via digital wallets.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
