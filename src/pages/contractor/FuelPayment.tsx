import * as React from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, Fuel, ShieldCheck, Wallet, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { getWalletBalance, setWalletBalance, addTransaction } from "@/lib/contractor/walletStorage"
import { generateTransaction } from "@/lib/contractor/transactionGenerator"
import { mockContractor } from "@/data/contractor/mockContractor"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"

export function FuelPayment() {
  const navigate = useNavigate()
  const [amount, setAmount] = React.useState("")
  const [pin, setPin] = React.useState("")
  const [balance] = React.useState(getWalletBalance())
  const [pump, setPump] = React.useState<any>(null)

  React.useEffect(() => {
    const savedPump = sessionStorage.getItem('selected_pump')
    if (savedPump) {
      setPump(JSON.parse(savedPump))
    } else {
      navigate("/contractor/scan-pump")
    }
  }, [])

  const handlePayment = () => {
    const amtNum = parseFloat(amount)
    
    if (!amount || amtNum <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    if (amtNum > balance) {
      toast.error("Insufficient wallet balance")
      return
    }

    if (pin.length !== 4) {
      toast.error("Please enter a 4-digit PIN")
      return
    }

    if (pin !== mockContractor.pin) {
      toast.error("Invalid PIN")
      return
    }

    // Process Payment
    const newBalance = balance - amtNum
    setWalletBalance(newBalance)
    
    const txn = generateTransaction(
      "Fuel Payment",
      pump.pumpName,
      amtNum,
      "debit",
      { pumpId: pump.pumpId }
    )
    addTransaction(txn)

    navigate(`/contractor/payment-success/${txn.transactionId}`, { state: { txn, pump } })
  }

  if (!pump) return null

  return (
    <div className="p-6 space-y-8 animate-in slide-in-from-right-4 duration-300">
      <div className="flex items-center space-x-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-full shadow-sm border border-slate-100">
          <ChevronLeft className="h-6 w-6 text-slate-900" />
        </button>
        <h1 className="text-xl font-black text-slate-900">Fuel Payment</h1>
      </div>

      <Card className="border-none shadow-xl bg-blue-600 rounded-[32px] text-white">
        <CardContent className="p-6 flex items-center space-x-4">
          <div className="h-14 w-14 bg-white/20 rounded-2xl flex items-center justify-center">
            <Fuel className="h-8 w-8" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Paying to Merchant</p>
            <h3 className="text-lg font-black">{pump.pumpName}</h3>
            <p className="text-xs opacity-80">{pump.location}</p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center space-x-2 text-slate-400">
            <Wallet className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Available Balance</span>
          </div>
          <span className="text-sm font-black text-slate-900">{formatCurrency(balance)}</span>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Enter Amount</label>
            <div className="relative">
              <Input 
                type="tel"
                placeholder="0.00"
                className="h-16 text-3xl font-black bg-slate-50 border-slate-100 rounded-2xl px-6"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xl font-black text-slate-300">₹</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Enter 4-Digit PIN</label>
            <div className="relative">
              <Input 
                type="password"
                placeholder="••••"
                maxLength={4}
                className="h-16 text-3xl font-black bg-slate-50 border-slate-100 rounded-2xl px-6 text-center tracking-[0.5em]"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              />
              <div className="absolute left-6 top-1/2 -translate-y-1/2">
                <ShieldCheck className="h-6 w-6 text-slate-300" />
              </div>
            </div>
          </div>
        </div>

        <Button 
          onClick={handlePayment}
          className="w-full h-16 bg-indigo-600 hover:bg-indigo-700 text-lg font-black rounded-[24px] shadow-xl shadow-indigo-100 mt-4"
        >
          Pay Now
        </Button>

        <div className="flex items-start space-x-3 p-4 bg-slate-100 rounded-2xl">
          <Info className="h-5 w-5 text-slate-400 mt-0.5" />
          <p className="text-[10px] text-slate-500 font-medium leading-relaxed uppercase tracking-tight">
            Transactions are secure and monitored. Do not share your PIN with anyone.
          </p>
        </div>
      </div>
    </div>
  )
}
