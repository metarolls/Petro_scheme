import * as React from "react"
import { useNavigate } from "react-router-dom"
import { PlusSquare, History, TrendingUp, BarChart3, Wallet } from "lucide-react"
import { StockCard } from "@/components/dealer/StockCard"
import { Card, CardContent } from "@/components/ui/card"
import { mockDealer } from "@/data/dealer/mockDealer"
import { mockCoupons } from "@/data/dealer/mockCoupons"
import { formatCurrency } from "@/lib/utils"

export function DealerHome() {
  const navigate = useNavigate()
  const [stock, setStock] = React.useState(mockDealer.availableStockMT)
  const [coupons, setCoupons] = React.useState(mockCoupons)

  React.useEffect(() => {
    const savedStock = localStorage.getItem('dealerStock')
    const savedCoupons = localStorage.getItem('dealerCoupons')
    if (savedStock) setStock(parseFloat(savedStock))
    if (savedCoupons) setCoupons(JSON.parse(savedCoupons))
  }, [])

  const todayCoupons = coupons.filter(c => {
    const date = new Date(c.generatedAt).toDateString()
    return date === new Date().toDateString()
  }).length

  const todaySoldKg = coupons.reduce((acc, c) => acc + c.weightKg, 0)
  const totalReward = coupons.reduce((acc, c) => acc + c.rewardValue, 0)

  return (
    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-2">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Dealer Dashboard</p>
          <h1 className="text-xl font-black text-slate-900">{mockDealer.name}</h1>
        </div>
        <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100">
          <BarChart3 className="h-5 w-5 text-blue-600" />
        </div>
      </div>

      <StockCard stockMT={stock} />

      {/* Main Action Button */}
      <button 
        onClick={() => navigate("/dealer/generate")}
        className="w-full bg-blue-600 active:bg-blue-800 text-white rounded-3xl p-8 flex flex-col items-center justify-center space-y-3 shadow-xl shadow-blue-200 transition-all active:scale-[0.98]"
      >
        <div className="bg-white/20 p-3 rounded-2xl">
          <PlusSquare className="h-10 w-10" />
        </div>
        <div className="text-center">
          <span className="block text-xl font-black uppercase tracking-tight">Generate New Coupon</span>
          <span className="text-blue-100 text-xs font-medium">नवीन कूपन तयार करा</span>
        </div>
      </button>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <StatItem 
          label="Today Coupons" 
          value={todayCoupons.toString()} 
          icon={TrendingUp} 
          color="bg-emerald-50 text-emerald-600" 
        />
        <StatItem 
          label="Today Sold Kg" 
          value={`${todaySoldKg} Kg`} 
          icon={BarChart3} 
          color="bg-purple-50 text-purple-600" 
        />
        <StatItem 
          label="Total Reward" 
          value={formatCurrency(totalReward)} 
          icon={Wallet} 
          color="bg-amber-50 text-amber-600" 
          className="col-span-2"
        />
      </div>

      <button 
        onClick={() => navigate("/dealer/history")}
        className="w-full py-4 text-slate-500 text-sm font-bold flex items-center justify-center space-x-2 bg-slate-100 rounded-2xl active:bg-slate-200 transition-colors"
      >
        <History className="h-4 w-4" />
        <span>View Stock History</span>
      </button>
    </div>
  )
}

function StatItem({ label, value, icon: Icon, color, className }: any) {
  return (
    <Card className={cn("border-none shadow-sm", className)}>
      <CardContent className="p-4 flex flex-col items-center text-center">
        <div className={cn("p-2 rounded-xl mb-2", color)}>
          <Icon className="h-5 w-5" />
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-lg font-black text-slate-900">{value}</p>
      </CardContent>
    </Card>
  )
}

import { cn } from "@/lib/utils"
