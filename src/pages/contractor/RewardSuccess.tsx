import * as React from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { History, Home, QrCode } from "lucide-react"
import { SuccessAnimation } from "@/components/contractor/SuccessAnimation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getWalletBalance } from "@/lib/contractor/walletStorage"
import { formatCurrency } from "@/lib/utils"

export function RewardSuccess() {
  const navigate = useNavigate()
  const location = useLocation()
  const coupon = location.state?.coupon
  const [balance] = React.useState(getWalletBalance())

  if (!coupon) {
    return <div className="p-10 text-center">Data not found</div>
  }

  return (
    <div className="min-h-screen bg-white flex flex-col p-6 animate-in fade-in duration-700">
      <div className="flex-1 flex flex-col items-center justify-center pt-10">
        <SuccessAnimation 
          amount={formatCurrency(coupon.rewardValue)}
          message="Added to Wallet!"
          submessage={`Reward for ${coupon.weightKg} Kg TMT Purchase`}
        />

        <Card className="w-full mt-12 bg-slate-50 border-none rounded-[32px] overflow-hidden">
          <CardContent className="p-8 space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">New Balance</span>
              <span className="text-xl font-black text-slate-900">{formatCurrency(balance)}</span>
            </div>
            
            <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Coupon ID</p>
                <p className="text-sm font-bold text-slate-900">{coupon.couponId}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Weight</p>
                <p className="text-sm font-bold text-slate-900">{coupon.weightKg} Kg</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3 pb-6">
        <Button 
          className="w-full h-16 bg-indigo-600 hover:bg-indigo-700 text-lg font-black rounded-3xl shadow-xl shadow-indigo-100"
          onClick={() => navigate("/contractor/scan-coupon")}
        >
          <QrCode className="h-6 w-6 mr-2" />
          Scan Another Coupon
        </Button>
        
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline"
            className="h-14 font-bold border-2 border-slate-100 rounded-2xl bg-white"
            onClick={() => navigate("/contractor/home")}
          >
            <Home className="h-5 w-5 mr-2 text-slate-600" />
            Go Home
          </Button>
          <Button 
            variant="outline"
            className="h-14 font-bold border-2 border-slate-100 rounded-2xl bg-white"
            onClick={() => navigate("/contractor/transactions")}
          >
            <History className="h-5 w-5 mr-2 text-slate-600" />
            Transactions
          </Button>
        </div>
      </div>
    </div>
  )
}
