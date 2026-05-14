import * as React from "react"
import { MapPin, Fuel, Info, Loader2, ShieldAlert } from "lucide-react"
import { LivePaymentCard } from "@/components/merchant/LivePaymentCard"
import { db } from "@/lib/firebase"
import { collection, query, where, onSnapshot, limit, orderBy, doc } from "firebase/firestore"
import { AnimatePresence, motion } from "framer-motion"
import { useAuth } from "@/contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"

export default function HomeLiveFeed() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [transactions, setTransactions] = React.useState<any[]>([])
  const [newTxnId, setNewTxnId] = React.useState<string | null>(null)
  const [pump, setPump] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const pumpId = localStorage.getItem("pumpId") || ""

  React.useEffect(() => {
    if (!pumpId) {
      setLoading(false)
      return
    }

    const unsubPump = onSnapshot(doc(db, "merchant", pumpId), (docSnap) => {
      if (docSnap.exists()) {
        setPump({ id: docSnap.id, ...docSnap.data() })
      }
      setLoading(false)
    })

    const q = query(
      collection(db, "wallet_history"),
      where("destinationId", "==", pumpId),
      orderBy("timestamp", "desc"),
      limit(50)
    )

    const unsubTxns = onSnapshot(q, (snapshot) => {
      const txns = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
      setTransactions(txns)
      
      // Optionally find the newest one to highlight, if the top one is new
      if (snapshot.docChanges().length > 0) {
        const changes = snapshot.docChanges()
        const added = changes.filter(c => c.type === 'added')
        if (added.length === 1 && txns.length > 0 && added[0].doc.id === txns[0].id) {
          setNewTxnId(txns[0].id)
          setTimeout(() => setNewTxnId(null), 5000)
        }
      }
    })

    return () => {
      unsubPump()
      unsubTxns()
    }
  }, [pumpId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24">
      
      <div className="p-6 space-y-6">
        {/* Missing PIN Alert */}
        {!profile?.walletPIN && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-amber-50 border border-amber-200 rounded-[2rem] flex flex-col gap-4 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500 rounded-2xl shadow-lg shadow-amber-200/50">
                <ShieldAlert className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-black text-amber-900 leading-tight">Action Required: Please set your 4-digit Transaction PIN in Settings to enable wallet operations.</p>
                <p className="text-[10px] text-amber-700 font-bold uppercase tracking-[0.2em] mt-1">Security setup missing • सुरक्षा पिन आवश्यक आहे</p>
              </div>
            </div>
            <Button 
              onClick={() => navigate("/settings")}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl h-11 shadow-lg shadow-amber-200 transition-all active:scale-95"
            >
              Set PIN Now
            </Button>
          </motion.div>
        )}

        {/* Pump Status Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-navy rounded-[2rem] p-5 relative overflow-hidden shadow-xl"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#FF2B45_0%,transparent_40%)] opacity-20" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Fuel className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white leading-none">{pump?.pumpName || pump?.ownerName || "Loading..."}</h3>
                <div className="flex items-center gap-2 mt-1.5">
                  <MapPin className="h-3 w-3 text-brand" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{pump?.location || "Location Info"}</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400 font-bold uppercase mb-1">Balance</div>
              <div className="text-xl font-black text-white flex items-center justify-end gap-1">
                <span className="text-brand">₹</span>
                {(pump?.walletBalance || 0).toLocaleString()}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Transaction Stream Header */}
        <div className="flex justify-between items-center px-1">
          <h3 className="text-[11px] font-black text-navy uppercase tracking-[0.2em]">Transaction Stream</h3>
          <div className="flex items-center gap-2 text-[10px] font-bold text-brand uppercase">
            Realtime Monitoring
          </div>
        </div>

        {/* Transaction List */}
        <div className="space-y-4">
          <AnimatePresence initial={false} mode="popLayout">
            {transactions.map((txn) => (
              <LivePaymentCard 
                key={txn.transactionId} 
                transaction={txn} 
                isNew={txn.transactionId === newTxnId}
              />
            ))}
          </AnimatePresence>
          
          {transactions.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-24 text-center space-y-4"
            >
              <div className="w-20 h-20 bg-slate-100 rounded-[2.5rem] flex items-center justify-center mx-auto border-2 border-dashed border-slate-200">
                <Info className="h-8 w-8 text-slate-300" />
              </div>
              <div>
                <p className="text-sm font-black text-navy tracking-tight">Syncing Stream...</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Waiting for incoming fuel payments</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
