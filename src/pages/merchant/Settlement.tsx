import * as React from "react"
import { Landmark, Clock, CheckCircle2, ArrowRight, ShieldCheck, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn, formatCurrency } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/firebase"
import { collection, query, where, onSnapshot, orderBy, limit, doc, runTransaction, serverTimestamp } from "firebase/firestore"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"

interface SettlementRecord {
  id: string;
  amount: number;
  status?: string;
  timestamp?: any;
  [key: string]: any;
}

export function Settlement() {
  const [balance, setBalance] = React.useState<number>(0)
  const [history, setHistory] = React.useState<SettlementRecord[]>([])
  const { profile } = useAuth()
  const pumpId = profile?.id || ""
  const [loading, setLoading] = React.useState(true)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [pin, setPin] = React.useState("")
  const [showPinInput, setShowPinInput] = React.useState(false)

  React.useEffect(() => {
    if (!pumpId) {
      return
    }

    // 1. Listen to Pump Balance
    const unsubPump = onSnapshot(doc(db, "merchant", pumpId), (snapshot) => {
      if (snapshot.exists()) {
        const pumpData = snapshot.data()
        setBalance(pumpData.walletBalance || 0)
        
        // 2. Listen to Settlement History once we have the pump ID
        const historyQuery = query(
          collection(db, "wallet_history"),
          where("sourceId", "==", pumpId),
          where("type", "==", "settlement"),
          orderBy("timestamp", "desc"),
          limit(20)
        )

        const unsubHistory = onSnapshot(historyQuery, (hSnapshot) => {
          const historyData = hSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as SettlementRecord))
          setHistory(historyData)
          setLoading(false)
        })

        return () => unsubHistory()
      } else {
        setLoading(false)
      }
    }, (error) => {
      console.error("Error fetching pump data:", error)
      toast.error("Failed to load wallet data")
      setLoading(false)
    })

    return () => unsubPump()
  }, [pumpId])

  const handleRequestSettlement = async () => {
    if (balance <= 0) {
      toast.error("शिल्लक रक्कम नाही (No balance to settle)")
      return
    }

    if (!showPinInput) {
      setShowPinInput(true)
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

    setIsSubmitting(true)
    try {
      await runTransaction(db, async (transaction) => {
        const pumpRef = doc(db, "merchant", pumpId)
        const pDoc = await transaction.get(pumpRef)
        
        if (!pDoc.exists()) throw new Error("Pump account not found")
        
        const currentBalance = pDoc.data().walletBalance || 0
        const pendingSettlement = pDoc.data().pendingSettlement || 0
        
        if (currentBalance <= 0) throw new Error("No balance to settle")
        if (pendingSettlement > 0) throw new Error("A settlement request is already pending")

        // 1. Create history record
        const historyRef = doc(collection(db, "wallet_history"))
        transaction.set(historyRef, {
          type: 'settlement',
          status: 'pending',
          sourceId: pumpId,
          sourceName: profile?.pumpName || "Merchant",
          sourceType: 'petrol_pump',
          destinationId: 'admin',
          destinationName: 'Metaroll Admin',
          destinationType: 'admin',
          amount: currentBalance,
          prevBalanceSource: currentBalance,
          newBalanceSource: 0,
          timestamp: serverTimestamp(),
          note: `Settlement request for ${formatCurrency(currentBalance)}`
        })

        // 2. Update pump: Deduct balance and set pending flag
        transaction.update(pumpRef, {
          walletBalance: 0,
          pendingSettlement: currentBalance,
          lastSettlementAt: serverTimestamp()
        })
      })

      toast.success("Settlement request sent successfully!")
      setShowPinInput(false)
      setPin("")
    } catch (error: any) {
      toast.error("Failed to send request: " + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24">
      <div className="p-6 pb-2">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-success rounded-[2rem] p-6 text-white shadow-xl shadow-success/20 relative overflow-hidden"
        >
          <div className="absolute right-[-20px] top-[-20px] opacity-10">
            <Landmark size={120} />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Unsettled Balance</p>
            <h2 className="text-3xl font-black tracking-tighter mb-4">{formatCurrency(balance)}</h2>
            <AnimatePresence>
              {showPinInput && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-3 mb-4 pt-2 border-t border-white/10"
                >
                  <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest ml-1">Enter 4-Digit Security PIN</p>
                  <div className="relative">
                    <input 
                      type="password"
                      placeholder="••••"
                      maxLength={4}
                      className="w-full h-12 bg-white/10 border border-white/20 focus:bg-white/20 text-2xl font-black text-white rounded-xl text-center tracking-[0.5em] outline-none placeholder:text-white/20"
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      autoFocus
                    />
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <Button 
              className={cn(
                "w-full font-black text-[10px] uppercase tracking-[0.2em] rounded-xl h-12 shadow-lg transition-all",
                showPinInput ? "bg-white text-success hover:bg-white/90" : "bg-white/20 text-white hover:bg-white/30 border border-white/20"
              )}
              onClick={handleRequestSettlement}
              disabled={isSubmitting || balance <= 0}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : showPinInput ? (
                <CheckCircle2 className="h-3 w-3 mr-2" />
              ) : (
                <ArrowRight className="h-3 w-3 mr-2" />
              )}
              {showPinInput ? "Confirm Settlement" : "Request Settlement"}
            </Button>
            
            {showPinInput && (
              <button 
                onClick={() => setShowPinInput(false)}
                className="w-full mt-3 text-[9px] font-bold text-white/50 uppercase tracking-widest hover:text-white transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </motion.div>
      </div>

      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Settlement History</h3>
          <p className="text-[10px] font-bold text-brand uppercase">Recent 20</p>
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {history.map((set, idx) => (
              <motion.div
                key={set.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="border-none shadow-xl shadow-slate-200/40 rounded-3xl overflow-hidden bg-white">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-navy tracking-tight">
                          {set.timestamp?.toDate ? set.timestamp.toDate().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Processing...'}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">ID: {set.id.slice(-6).toUpperCase()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-navy mb-1">{formatCurrency(set.amount)}</p>
                      <div className={cn(
                        "flex items-center gap-1 text-[8px] font-black uppercase px-2 py-0.5 rounded-full ml-auto w-fit",
                        set.status === 'pending' ? "bg-amber-100 text-amber-600" :
                        set.status === 'completed' ? "bg-success-soft text-success" :
                        set.status === 'rejected' ? "bg-red-100 text-red-600" :
                        "bg-success-soft text-success"
                      )}>
                        {set.status === 'pending' ? <Clock className="h-2 w-2" /> : <CheckCircle2 className="h-2 w-2" />}
                        {set.status === 'completed' ? 'Paid' : set.status || 'Paid'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {history.length === 0 && (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Clock className="h-8 w-8 mx-auto opacity-20" />
              <p className="text-xs font-bold uppercase tracking-widest">No settlement history found</p>
            </div>
          )}
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-6 mt-4">
          <div className="flex items-center gap-3 mb-3">
            <ShieldCheck className="h-5 w-5 text-brand" />
            <p className="text-xs font-black text-navy uppercase tracking-tight">Direct Bank Deposit</p>
          </div>
          <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
            All settlements are processed daily at 11:59 PM and deposited directly to your registered bank account.
          </p>
        </div>
      </div>
    </div>
  )
}
