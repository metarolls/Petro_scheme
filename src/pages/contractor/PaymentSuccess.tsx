import * as React from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { History, Home, CreditCard } from "lucide-react"
import { SuccessAnimation } from "@/components/contractor/SuccessAnimation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getWalletBalance } from "@/lib/contractor/walletStorage"
import { formatCurrency } from "@/lib/utils"

export function PaymentSuccess() {
  const navigate = useNavigate()
  const location = useLocation()
  const txn = location.state?.txn
  const pump = location.state?.pump
  const [balance] = React.useState(getWalletBalance())

  if (!txn || !pump) {
    return <div className="p-10 text-center">Transaction data not found</div>
  }

  return (
    <div className="min-h-screen bg-white flex flex-col p-6 animate-in fade-in duration-700">
      <div className="flex-1 flex flex-col items-center justify-center pt-10">
        <SuccessAnimation 
          amount={formatCurrency(txn.amount)}
          message="Payment Successful"
          submessage={`Paid to ${pump.pumpName}`}
        />

        <Card className="w-full mt-12 bg-slate-50 border-none rounded-[32px] overflow-hidden">
          <CardContent className="p-8 space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">New Balance</span>
              <span className="text-xl font-black text-slate-900">{formatCurrency(balance)}</span>
            </div>
            
            <div className="pt-6 border-t border-slate-200 space-y-4">
              <div className="flex justify-between">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Transaction ID</p>
                <p className="text-xs font-black text-slate-900">{txn.transactionId}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Merchant</p>
                <p className="text-xs font-black text-slate-900">{pump.pumpName}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date & Time</p>
                <p className="text-xs font-black text-slate-900">{txn.createdAt}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3 pb-6">
        <Button 
          className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-lg font-black rounded-3xl shadow-xl shadow-blue-100"
          onClick={() => navigate("/contractor/scan-pump")}
        >
          <CreditCard className="h-6 w-6 mr-2" />
          Pay Again
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
            History
          </Button>
        </div>
      </div>
    </div>
  )
}
