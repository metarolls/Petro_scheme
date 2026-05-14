import * as React from "react"
import { useNavigate } from "react-router-dom"
import { History, TrendingUp, IndianRupee, ArrowRight, ShieldAlert } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/firebase"
import { 
  onSnapshot, 
  collection, 
  query, 
  where, 
  orderBy
} from "firebase/firestore"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"

export function DealerHome() {
  const navigate = useNavigate()
  const { user, profile, loading: authLoading } = useAuth()
  const [stats, setStats] = React.useState({
    totalSales: 0,
    todayTransactions: 0
  })
  const [loading, setLoading] = React.useState(true)

  const dealerId = user?.uid

  React.useEffect(() => {
    if (authLoading) return
    if (!user) {
      navigate('/dealer/login')
      return
    }

    if (!dealerId) return

    // Listen to Wallet History for Stats
    const q = query(
      collection(db, "wallet_history"),
      where("sourceId", "==", dealerId),
      orderBy("timestamp", "desc")
    )

    const unsubHistory = onSnapshot(q, (snap) => {
      const docs = snap.docs.map(d => d.data())
      
      const sales = docs
        .filter(d => d.type === 'transfer')
        .reduce((acc, d) => acc + (d.weightKg || 0), 0)
      

      const today = new Date().toDateString()
      const todayCount = docs.filter(d => {
        const dDate = d.timestamp?.toDate()?.toDateString()
        return dDate === today
      }).length

      setStats({
        totalSales: sales,
        todayTransactions: todayCount
      })
      setLoading(false)
    }, (error) => {
      console.error("History Error:", error)
      setLoading(false)
    })

    return () => {
      unsubHistory()
    }
  }, [user, authLoading, dealerId, navigate])

  if (authLoading || loading) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="animate-spin h-8 w-8 border-4 border-brand border-t-transparent rounded-full" />
      </div>
    )
  }

  const walletBalance = profile?.walletBalance || 0

  return (
    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Missing PIN Alert */}
      {!profile?.walletPIN && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-[2rem] flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-500 shadow-sm mb-2">
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

      {/* Wallet Balance Card */}
      <Card className="bg-navy border-none glass-3d overflow-hidden relative rounded-[2.5rem]">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand/10 rounded-full -mr-16 -mt-16 blur-2xl" />
        <CardContent className="p-8 text-center relative z-10">
          <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-2">Available Wallet Balance</p>
          <h2 className="text-5xl font-black text-white tracking-tight flex items-center justify-center gap-2">
            <span className="text-brand text-3xl">₹</span>
            {walletBalance.toLocaleString()}
          </h2>
          <p className="text-brand font-medium text-[10px] uppercase mt-2 tracking-tighter">वॉलेट शिल्लक (इंधन खरेदीसाठी)</p>
        </CardContent>
      </Card>

      {/* Main Action Button - Pay for Fuel */}
      <button 
        onClick={() => navigate("/dealer/transfer")}
        className="group w-full bg-brand active:bg-brand-hover text-white rounded-[2.5rem] p-10 flex flex-col items-center justify-center space-y-4 shadow-xl shadow-brand/20 transition-all active:scale-[0.98] pwa-tap-highlight border border-white/20 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
        <div className="bg-white/20 p-5 rounded-[1.5rem] group-hover:scale-110 transition-transform shadow-inner relative z-10">
          <IndianRupee className="h-10 w-10" />
        </div>
        <div className="text-center relative z-10">
          <span className="block text-2xl font-black uppercase tracking-tight">Pay for Fuel</span>
          <span className="text-white/70 text-xs font-black uppercase tracking-widest mt-1 block">इंधन पेमेंट करा</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black text-white/50 uppercase tracking-widest relative z-10">
          <span>Instant Settlement</span>
          <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
        </div>
      </button>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <StatItem 
          label="Total Sales Volume" 
          value={`${stats.totalSales.toLocaleString()} Kg`} 
          icon={TrendingUp} 
          color="bg-emerald-500/10 text-emerald-500" 
          className="col-span-2"
        />
        <StatItem 
          label="Today's Activity" 
          value={`${stats.todayTransactions} Txns`} 
          icon={History} 
          color="bg-info/10 text-info" 
          className="col-span-2"
          onClick={() => navigate("/dealer/history")}
        />
      </div>

      <button 
        onClick={() => navigate("/dealer/history")}
        className="w-full py-5 text-slate-500 text-xs font-black uppercase tracking-widest flex items-center justify-center space-x-2 bg-slate-100 rounded-2xl active:bg-slate-200 transition-colors pwa-tap-highlight"
      >
        <History className="h-4 w-4" />
        <span>View Full Transaction History</span>
      </button>
    </div>
  )
}

function StatItem({ label, value, icon: Icon, color, className, onClick }: any) {
  return (
    <Card 
      className={cn("border-none glass-3d shadow-sm cursor-pointer active:scale-[0.98] transition-all pwa-tap-highlight", className)}
      onClick={onClick}
    >
      <CardContent className="p-5 flex flex-col items-center text-center">
        <div className={cn("p-3 rounded-2xl mb-3 shadow-inner", color)}>
          <Icon className="h-6 w-6" />
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-lg font-black text-navy tracking-tight">{value}</p>
      </CardContent>
    </Card>
  )
}

