import * as React from "react"
import { useNavigate } from "react-router-dom"
import { QrCode, Fuel, TrendingUp, TrendingDown, ArrowRight, ShieldAlert } from "lucide-react"
import { WalletCard } from "@/components/contractor/WalletCard"
import { TransactionCard } from "@/components/contractor/TransactionCard"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/firebase"
import { doc, onSnapshot, query, collection, where, orderBy, limit } from "firebase/firestore"
import { formatCurrency, cn, comingSoon } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"

export function ContractorHome() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [balance, setBalance] = React.useState(0)
  const [transactions, setTransactions] = React.useState<any[]>([])
  
  const contractorId = profile?.id
  const contractorName = profile?.name || "Contractor"

  React.useEffect(() => {
    if (!contractorId) return

    // Listen to contractor wallet balance
    const unsubBalance = onSnapshot(doc(db, "contractors", contractorId), (docSnap) => {
      if (docSnap.exists()) {
        setBalance(docSnap.data().walletBalance || 0)
      }
    })

    // Listen to recent transactions where contractor is involved
    const q = query(
      collection(db, "wallet_history"),
      where("sourceId", "==", contractorId),
      orderBy("timestamp", "desc"),
      limit(10)
    )

    const unsubTxns = onSnapshot(q, (snap) => {
      const txns = snap.docs.map(d => {
        const data = d.data()
        // Determine if credit or debit
        const isCredit = data.type === 'reward'
        
        return {
          transactionId: d.id,
          type: data.type === 'reward' ? 'Reward Earned' : 'Fuel Payment',
          amount: data.amount,
          direction: isCredit ? 'credit' : 'debit',
          source: isCredit ? 'Metaroll Rewards' : data.destinationName,
          status: data.status === 'completed' ? 'Success' : 'Pending',
          createdAt: data.timestamp ? new Date(data.timestamp.toMillis()).toLocaleDateString() : 'Just now'
        }
      })
      setTransactions(txns)
    })

    return () => {
      unsubBalance()
      unsubTxns()
    }
  }, [contractorId])

  const totalEarned = transactions
    .filter(t => t.direction === "credit")
    .reduce((acc, t) => acc + t.amount, 0)
    
  const totalSpent = transactions
    .filter(t => t.direction === "debit")
    .reduce((acc, t) => acc + t.amount, 0)

  return (
    <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
      {/* Missing PIN Alert */}
      {!profile?.walletPIN && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-[2rem] flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-500 shadow-sm">
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
        </div>
      )}

      <WalletCard balance={balance} contractorName={contractorName} />

      {/* Main Actions */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <ActionButton 
            label="Scan Coupon" 
            subtitle="कूपन स्कॅन करा"
            icon={QrCode} 
            onClick={() => navigate("/contractor/scan-coupon")}
            color="bg-success shadow-success/10"
          />
          <ActionButton 
            label="Pay for Fuel" 
            subtitle="इंधन पेमेंट"
            icon={Fuel} 
            onClick={() => navigate("/contractor/scan-pump")}
            color="bg-brand shadow-brand/20"
          />
        </div>
        
        <button 
          onClick={() => navigate("/contractor/redeem-qr")}
          className="w-full bg-white border border-white/40 p-6 rounded-[2.5rem] flex items-center justify-between group active:scale-[0.98] transition-all shadow-[0_20px_50px_rgba(0,0,0,0.04)] glass-3d pwa-tap-highlight"
        >
          <div className="flex items-center space-x-5">
            <div className="h-14 w-14 bg-brand/5 rounded-[1.25rem] flex items-center justify-center text-brand shadow-inner group-hover:scale-105 transition-transform">
              <QrCode className="h-7 w-7" />
            </div>
            <div className="text-left">
              <p className="text-lg font-black text-navy uppercase tracking-tight">Show QR to Pay</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">क्युआर दाखवून पेमेंट करा</p>
            </div>
          </div>
          <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-all shadow-sm">
            <ArrowRight className="h-6 w-6" />
          </div>
        </button>
      </div>

      {/* Quick Summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-none bg-success/5 shadow-none cursor-pointer hover:bg-success/10 transition-colors" onClick={() => comingSoon("Earnings Analytics")}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-success mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Recent Earned</span>
            </div>
            <p className="text-lg font-black text-navy">{formatCurrency(totalEarned)}</p>
          </CardContent>
        </Card>
        <Card className="border-none bg-slate-100/50 shadow-none cursor-pointer hover:bg-slate-200/50 transition-colors" onClick={() => comingSoon("Expense Analytics")}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-slate-400 mb-1">
              <TrendingDown className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Recent Spent</span>
            </div>
            <p className="text-lg font-black text-navy">{formatCurrency(totalSpent)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-black text-navy uppercase tracking-widest">Recent Transactions</h3>
          <button 
            onClick={() => navigate("/contractor/transactions")}
            className="text-[10px] font-bold text-brand uppercase flex items-center"
          >
            See All <ArrowRight className="h-3 w-3 ml-1" />
          </button>
        </div>
        
        <div className="space-y-3">
          {transactions.length === 0 ? (
            <p className="text-center text-xs font-bold text-slate-400 py-4">No recent transactions</p>
          ) : (
            transactions.slice(0, 3).map((txn) => (
              <TransactionCard key={txn.transactionId} transaction={txn} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function ActionButton({ label, subtitle, icon: Icon, onClick, color }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center p-8 rounded-[40px] text-white space-y-4 transition-all active:scale-[0.96] shadow-xl pwa-tap-highlight relative overflow-hidden border border-white/20",
        color
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50" />
      <div className="bg-white/20 p-4 rounded-[1.25rem] shadow-inner relative z-10">
        <Icon className="h-9 w-9" />
      </div>
      <div className="text-center relative z-10">
        <p className="text-base font-black uppercase tracking-tight leading-none">{label}</p>
        <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mt-1">{subtitle}</p>
      </div>
    </button>
  )
}
