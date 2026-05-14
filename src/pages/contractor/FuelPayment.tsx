import * as React from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, Fuel, ShieldCheck, Wallet, Info, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"
import { db } from "@/lib/firebase"
import { doc, runTransaction, collection, serverTimestamp, onSnapshot } from "firebase/firestore"
import { useAuth } from "@/contexts/AuthContext"

export function FuelPayment() {
  const navigate = useNavigate()
  const [amount, setAmount] = React.useState("")
  const [pin, setPin] = React.useState("")
  const [balance, setBalance] = React.useState(0)
  const [pump, setPump] = React.useState<any>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const { profile } = useAuth()
  const contractorId = profile?.id
  const contractorName = profile?.name || "Contractor"
  const contractorFirm = profile?.firmName

  React.useEffect(() => {
    const savedPump = sessionStorage.getItem('selected_pump')
    if (savedPump) {
      setPump(JSON.parse(savedPump))
    } else {
      navigate("/contractor/scan-pump")
    }

    if (contractorId) {
      const unsub = onSnapshot(doc(db, "contractors", contractorId), (docSnap) => {
        if (docSnap.exists()) {
          setBalance(docSnap.data().walletBalance || 0)
        }
      })
      return () => unsub()
    }
  }, [contractorId, navigate])

  const amtNum = parseFloat(amount) || 0

  const handlePayment = async () => {
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

    if (!profile?.walletPIN) {
      toast.error("Transaction PIN not set. Please set it in Settings.")
      return
    }

    if (pin !== profile.walletPIN) {
      toast.error("Invalid Transaction PIN")
      return
    }

    if (!contractorId) return

    setIsSubmitting(true)
    try {
      await runTransaction(db, async (transaction) => {
        const contractorRef = doc(db, "contractors", contractorId)
        const pumpRef = doc(db, "merchant", pump.pumpId)
        
        const cDoc = await transaction.get(contractorRef)
        const pDoc = await transaction.get(pumpRef)

        if (!cDoc.exists()) throw new Error("Contractor profile not found")
        if (!pDoc.exists()) throw new Error("Petrol Pump profile not found")

        const currentCBalance = cDoc.data().walletBalance || 0
        const currentPBalance = pDoc.data().walletBalance || 0

        if (currentCBalance < amtNum) throw new Error("Insufficient Balance (Transaction aborted)")

        const newCBalance = currentCBalance - amtNum
        const newPBalance = currentPBalance + amtNum

        // 1. Deduct from Contractor
        transaction.update(contractorRef, { 
          walletBalance: newCBalance,
          lastPaymentAt: serverTimestamp()
        })
        
        // 2. Add to Pump
        transaction.update(pumpRef, { 
          walletBalance: newPBalance,
          lastReceiptAt: serverTimestamp()
        })

        // 3. Log Detailed History
        const historyRef = doc(collection(db, "wallet_history"))
        transaction.set(historyRef, {
          type: 'payment',
          status: 'completed',
          sourceId: contractorId,
          sourceName: contractorFirm || contractorName,
          destinationId: pump.pumpId,
          destinationName: pump.pumpName,
          amount: amtNum,
          timestamp: serverTimestamp(),
          note: `Fuel payment at ${pump.pumpName}`,
          metadata: {
            prevBalanceSource: currentCBalance,
            newBalanceSource: newCBalance,
            prevBalanceDest: currentPBalance,
            newBalanceDest: newPBalance,
            sourceType: 'contractor',
            destType: 'petrol_pump'
          }
        })
      })

      // We still use local routing for the success screen
      const txn = {
        transactionId: Date.now().toString(),
        type: "Fuel Payment",
        amount: amtNum,
        direction: "debit",
        source: pump.pumpName,
        status: "Success",
        createdAt: new Date().toLocaleDateString()
      }
      navigate(`/contractor/payment-success/${txn.transactionId}`, { state: { txn, pump } })
    } catch (error: any) {
      toast.error("Payment failed: " + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!pump) return null

  return (
    <div className="p-6 space-y-8 animate-in slide-in-from-right-4 duration-300">
      <div className="flex items-center space-x-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-full shadow-sm border border-slate-100">
          <ChevronLeft className="h-6 w-6 text-navy" />
        </button>
        <h1 className="text-xl font-black text-navy">Fuel Payment</h1>
      </div>

      <Card className="border-none shadow-xl bg-brand rounded-[32px] text-white">
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
          <span className="text-sm font-black text-navy">{formatCurrency(balance)}</span>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Enter Amount</label>
            <div className="relative">
              <Input 
                type="tel"
                placeholder="0.00"
                className="h-16 text-3xl font-black bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-brand/20 rounded-2xl px-6"
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
                className="h-16 text-3xl font-black bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-brand/20 rounded-2xl px-6 text-center tracking-[0.5em]"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              />
              <div className="absolute left-6 top-1/2 -translate-y-1/2">
                <ShieldCheck className="h-6 w-6 text-slate-300" />
              </div>
            </div>
          </div>
        </div>

        {amtNum > 0 && (
          <p className="text-center text-slate-400 text-[10px] font-bold uppercase tracking-tight">
            Balance After Payment: <span className={amtNum > balance ? "text-red-500" : "text-navy"}>{formatCurrency(balance - amtNum)}</span>
          </p>
        )}

        <Button 
          onClick={handlePayment}
          disabled={isSubmitting || amtNum > balance || !amount}
          className={`w-full h-16 text-lg font-black rounded-[24px] shadow-xl mt-4 text-white transition-all ${
            amtNum > balance 
              ? "bg-slate-200 text-slate-400 shadow-none cursor-not-allowed" 
              : "bg-brand hover:bg-brand-hover shadow-brand/20"
          }`}
        >
          {isSubmitting ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : amtNum > balance ? (
            "Insufficient Balance"
          ) : (
            "Pay Now"
          )}
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
