import * as React from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, Calendar, Trophy } from "lucide-react"
import { CouponCard } from "@/components/dealer/CouponCard"
import type { Coupon } from "@/data/dealer/mockCoupons"
import { mockCoupons } from "@/data/dealer/mockCoupons"
import { formatCurrency } from "@/lib/utils"

export function StockHistory() {
  const navigate = useNavigate()
  const [filter, setFilter] = React.useState<"Today" | "7Days" | "All">("All")
  const [coupons, setCoupons] = React.useState<Coupon[]>(mockCoupons)

  React.useEffect(() => {
    const savedCoupons = localStorage.getItem('dealerCoupons')
    if (savedCoupons) {
      setCoupons(JSON.parse(savedCoupons))
    }
  }, [])

  const filteredCoupons = React.useMemo(() => {
    const now = new Date()
    return coupons.filter(c => {
      const cDate = new Date(c.generatedAt)
      if (filter === "Today") return cDate.toDateString() === now.toDateString()
      if (filter === "7Days") {
        const diff = (now.getTime() - cDate.getTime()) / (1000 * 3600 * 24)
        return diff <= 7
      }
      return true
    })
  }, [coupons, filter])

  const totalWeight = filteredCoupons.reduce((acc, c) => acc + c.weightKg, 0)
  const totalReward = filteredCoupons.reduce((acc, c) => acc + c.rewardValue, 0)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <button onClick={() => navigate("/dealer/home")} className="p-2 bg-white rounded-full shadow-sm border border-slate-100">
          <ChevronLeft className="h-6 w-6 text-slate-900" />
        </button>
        <h1 className="text-xl font-black text-slate-900">Stock History</h1>
      </div>

      {/* Summary Section */}
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 bg-blue-600 rounded-3xl p-6 text-white shadow-xl shadow-blue-100">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-white/20 p-2 rounded-xl">
              <Trophy className="h-6 w-6" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Filtered Summary</p>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs font-medium opacity-80">Total Reward</p>
                <p className="text-3xl font-black">{formatCurrency(totalReward)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium opacity-80">Total Weight</p>
                <p className="text-xl font-bold">{totalWeight} Kg</p>
              </div>
            </div>
            <div className="pt-4 border-t border-white/10 flex justify-between text-[10px] font-bold uppercase tracking-widest opacity-70">
              <span>{filteredCoupons.length} Coupons Generated</span>
              <span>{filter}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-2 bg-slate-100 p-1 rounded-2xl">
        <FilterButton active={filter === "Today"} onClick={() => setFilter("Today")}>Today</FilterButton>
        <FilterButton active={filter === "7Days"} onClick={() => setFilter("7Days")}>Last 7 Days</FilterButton>
        <FilterButton active={filter === "All"} onClick={() => setFilter("All")}>All</FilterButton>
      </div>

      {/* Coupons List */}
      <div className="space-y-4">
        {filteredCoupons.length > 0 ? (
          filteredCoupons.map((coupon) => (
            <CouponCard 
              key={coupon.couponId} 
              coupon={coupon} 
              onClick={() => navigate(`/dealer/qr/${coupon.couponId}`)}
            />
          ))
        ) : (
          <div className="py-20 text-center space-y-3">
            <div className="bg-slate-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto">
              <Calendar className="h-8 w-8 text-slate-300" />
            </div>
            <p className="text-slate-400 font-bold">No coupons found for this period</p>
          </div>
        )}
      </div>
    </div>
  )
}

function FilterButton({ children, active, onClick }: any) {
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

import { cn } from "@/lib/utils"
