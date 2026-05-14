import * as React from "react"
import { db } from "@/lib/firebase"
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp, 
  runTransaction, 
  doc, 
  limit
} from "firebase/firestore"
import { REWARD_RATE } from "@/lib/constants"
import { 
  Scale, 
  IndianRupee, 
  ArrowRightLeft, 
  History, 
  Loader2, 
  Plus, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  TrendingUp
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { cn, formatDate } from "@/lib/utils"

interface Dealer {
  id: string;
  fullName: string;
  firmName: string;
  walletBalance: number;
}

interface PetrolPump {
  id: string;
  name: string;
  walletBalance: number;
}

interface WalletHistory {
  id: string;
  type: 'reward' | 'transfer' | 'settlement';
  status: 'completed' | 'pending' | 'failed';
  sourceId: string;
  sourceName: string;
  destinationId?: string;
  destinationName?: string;
  amount: number;
  weight?: number; // Only for rewards
  timestamp: any;
  note?: string;
}

export function SalesWallet() {
  const [dealers, setDealers] = React.useState<Dealer[]>([])
  const [pumps, setPumps] = React.useState<PetrolPump[]>([])
  const [history, setHistory] = React.useState<WalletHistory[]>([])
  const [loading, setLoading] = React.useState(true)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Form States
  const [salesForm, setSalesForm] = React.useState({
    dealerId: "",
    weight: ""
  })
  const [transferForm, setTransferForm] = React.useState({
    dealerId: "",
    pumpId: "",
    amount: ""
  })

  // Real-time Data Fetching
  React.useEffect(() => {
    const unsubDealers = onSnapshot(query(collection(db, "dealers"), orderBy("firmName")), (snap) => {
      setDealers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Dealer[])
    })

    const unsubPumps = onSnapshot(query(collection(db, "merchant"), orderBy("name")), (snap) => {
      setPumps(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PetrolPump[])
    })

    const unsubHistory = onSnapshot(query(collection(db, "wallet_history"), orderBy("timestamp", "desc"), limit(10)), (snap) => {
      setHistory(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as WalletHistory[])
      setLoading(false)
    })

    return () => {
      unsubDealers()
      unsubPumps()
      unsubHistory()
    }
  }, [])

  const handleSalesSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!salesForm.dealerId || !salesForm.weight) {
      toast.error("कृपया सर्व माहिती भरा (Please fill all fields)")
      return
    }

    const weight = parseFloat(salesForm.weight)
    const amount = weight * REWARD_RATE
    const dealer = dealers.find(d => d.id === salesForm.dealerId)

    if (!dealer) return

    setIsSubmitting(true)
    try {
      await runTransaction(db, async (transaction) => {
        const dealerRef = doc(db, "dealers", salesForm.dealerId)
        const dealerDoc = await transaction.get(dealerRef)
        
        if (!dealerDoc.exists()) throw new Error("Dealer not found")
        
        const currentBalance = dealerDoc.data().walletBalance || 0
        const newBalance = currentBalance + amount

        transaction.update(dealerRef, { walletBalance: newBalance })
        
        const historyRef = doc(collection(db, "wallet_history"))
        transaction.set(historyRef, {
          type: 'reward',
          status: 'completed',
          sourceId: salesForm.dealerId,
          sourceName: dealer.firmName,
          amount: amount,
          weight: weight,
          timestamp: serverTimestamp(),
          note: `Sales entry for ${weight}kg`
        })
      })

      toast.success(`Success! ₹${amount.toFixed(2)} credited to ${dealer.firmName}`)
      setSalesForm({ dealerId: "", weight: "" })
    } catch (error: any) {
      toast.error("Transaction failed: " + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!transferForm.dealerId || !transferForm.pumpId || !transferForm.amount) {
      toast.error("कृपया सर्व माहिती भरा (Please fill all fields)")
      return
    }

    const amount = parseFloat(transferForm.amount)
    const dealer = dealers.find(d => d.id === transferForm.dealerId)
    const pump = pumps.find(p => p.id === transferForm.pumpId)

    if (!dealer || !pump) return

    if ((dealer.walletBalance || 0) < amount) {
      toast.error("अपुरे बॅलन्स (Insufficient Balance)")
      return
    }

    setIsSubmitting(true)
    try {
      await runTransaction(db, async (transaction) => {
        const dealerRef = doc(db, "dealers", transferForm.dealerId)
        const pumpRef = doc(db, "merchant", transferForm.pumpId)
        
        const dealerDoc = await transaction.get(dealerRef)
        const pumpDoc = await transaction.get(pumpRef)

        if (!dealerDoc.exists() || !pumpDoc.exists()) throw new Error("Dealer or Pump not found")

        const dealerBalance = dealerDoc.data().walletBalance || 0
        const pumpBalance = pumpDoc.data().walletBalance || 0

        if (dealerBalance < amount) throw new Error("Insufficient Balance")

        transaction.update(dealerRef, { walletBalance: dealerBalance - amount })
        transaction.update(pumpRef, { walletBalance: pumpBalance + amount })
        
        const historyRef = doc(collection(db, "wallet_history"))
        transaction.set(historyRef, {
          type: 'transfer',
          status: 'completed',
          sourceId: transferForm.dealerId,
          sourceName: dealer.firmName,
          destinationId: transferForm.pumpId,
          destinationName: pump.name,
          amount: amount,
          timestamp: serverTimestamp(),
          note: `Payment to ${pump.name}`
        })
      })

      toast.success(`Transfer of ₹${amount} successful!`)
      setTransferForm({ dealerId: "", pumpId: "", amount: "" })
    } catch (error: any) {
      toast.error("Transfer failed: " + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-navy flex items-center gap-3">
            Sales Wallet <span className="text-brand text-2xl">(वॉलेट)</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase text-xs tracking-widest mt-1">
            Reward Management & Manual Transfers
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Card className="border-none shadow-lg bg-white/50 backdrop-blur-md rounded-2xl px-6 py-3 flex items-center gap-4">
            <div className="h-10 w-10 bg-brand-soft rounded-xl flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-brand" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter leading-none">Total Circulation</p>
              <p className="text-xl font-black text-navy leading-none mt-1">₹{dealers.reduce((acc, d) => acc + (d.walletBalance || 0), 0).toLocaleString()}</p>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales Entry Form */}
        <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] bg-white overflow-hidden">
          <CardHeader className="p-8 pb-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                <Plus className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-black text-navy">Sales Entry</CardTitle>
                <CardDescription className="text-xs font-bold text-slate-400">Credit rewards based on weight (₹0.20/kg)</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 pt-4">
            <form onSubmit={handleSalesSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Contractor / Dealer</label>
                <select 
                  className="w-full h-14 bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500/20 rounded-2xl px-4 text-base font-bold appearance-none cursor-pointer"
                  value={salesForm.dealerId}
                  onChange={(e) => setSalesForm(prev => ({ ...prev, dealerId: e.target.value }))}
                >
                  <option value="">Select a dealer...</option>
                  {dealers.map(d => (
                    <option key={d.id} value={d.id}>{d.firmName} ({d.fullName})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Weight in Kg</label>
                  <div className="relative">
                    <Input 
                      type="number"
                      placeholder="0"
                      className="h-14 bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-emerald-500/20 rounded-2xl text-base font-bold pr-12"
                      value={salesForm.weight}
                      onChange={(e) => setSalesForm(prev => ({ ...prev, weight: e.target.value }))}
                    />
                    <Scale className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Calculated Amount</label>
                  <div className="h-14 bg-slate-100/50 rounded-2xl flex items-center px-4 font-black text-emerald-600 text-xl">
                    ₹{(parseFloat(salesForm.weight || "0") * 0.20).toFixed(2)}
                  </div>
                </div>
              </div>

              <Button 
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-xl shadow-emerald-100 group transition-all"
              >
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    <span>CREDIT WALLET</span>
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Manual Transfer Form */}
        <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] bg-white overflow-hidden">
          <CardHeader className="p-8 pb-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-brand-soft rounded-2xl flex items-center justify-center">
                <ArrowRightLeft className="h-6 w-6 text-brand" />
              </div>
              <div>
                <CardTitle className="text-xl font-black text-navy">Manual Payment</CardTitle>
                <CardDescription className="text-xs font-bold text-slate-400">Transfer from Dealer to Petrol Pump</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 pt-4">
            <form onSubmit={handleTransferSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">From (Contractor)</label>
                  <select 
                    className="w-full h-14 bg-slate-50 border-none focus:ring-2 focus:ring-brand/20 rounded-2xl px-4 text-base font-bold appearance-none cursor-pointer"
                    value={transferForm.dealerId}
                    onChange={(e) => setTransferForm(prev => ({ ...prev, dealerId: e.target.value }))}
                  >
                    <option value="">Source Dealer...</option>
                    {dealers.map(d => (
                      <option key={d.id} value={d.id}>{d.firmName} (₹{d.walletBalance || 0})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">To (Petrol Pump)</label>
                  <select 
                    className="w-full h-14 bg-slate-50 border-none focus:ring-2 focus:ring-brand/20 rounded-2xl px-4 text-base font-bold appearance-none cursor-pointer"
                    value={transferForm.pumpId}
                    onChange={(e) => setTransferForm(prev => ({ ...prev, pumpId: e.target.value }))}
                  >
                    <option value="">Destination Pump...</option>
                    {pumps.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment Amount</label>
                <div className="relative">
                  <Input 
                    type="number"
                    placeholder="0.00"
                    className="h-14 bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-brand/20 rounded-2xl text-2xl font-black px-6"
                    value={transferForm.amount}
                    onChange={(e) => setTransferForm(prev => ({ ...prev, amount: e.target.value }))}
                  />
                  <IndianRupee className="absolute right-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-300" />
                </div>
              </div>

              <Button 
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 bg-navy hover:bg-slate-800 text-white font-black rounded-2xl shadow-xl shadow-navy/20 group transition-all"
              >
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5" />
                    <span>AUTHORIZE TRANSFER</span>
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* History Table */}
      <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] bg-white overflow-hidden">
        <CardHeader className="p-8 border-b border-slate-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-slate-100 rounded-2xl flex items-center justify-center">
                <History className="h-6 w-6 text-slate-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-black text-navy">Recent Wallet Actions</CardTitle>
                <CardDescription className="text-xs font-bold text-slate-400">Audit trail of all rewards and transfers</CardDescription>
              </div>
            </div>
            <Button variant="ghost" className="text-brand font-bold gap-2">
              View All History <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b border-slate-50">
                <TableHead className="py-5 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</TableHead>
                <TableHead className="py-5 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Source / Party</TableHead>
                <TableHead className="py-5 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Destination</TableHead>
                <TableHead className="py-5 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Details</TableHead>
                <TableHead className="py-5 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</TableHead>
                <TableHead className="py-5 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status</TableHead>
                <TableHead className="py-5 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-slate-200" />
                  </TableCell>
                </TableRow>
              ) : history.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-slate-400 font-bold">
                    No transactions recorded yet.
                  </TableCell>
                </TableRow>
              ) : (
                history.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50">
                    <TableCell className="py-5 px-8">
                      <Badge className={cn(
                        "font-black uppercase text-[9px] tracking-widest px-3 py-1 rounded-full",
                        item.type === 'reward' 
                          ? "bg-emerald-100 text-emerald-600 border-none shadow-none" 
                          : item.type === 'settlement'
                            ? "bg-navy text-white border-none shadow-none"
                            : "bg-indigo-100 text-indigo-600 border-none shadow-none"
                      )}>
                        {item.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-5 px-4 font-bold text-navy">{item.sourceName}</TableCell>
                    <TableCell className="py-5 px-4 font-bold text-navy">
                      {item.destinationName || <span className="text-slate-300">—</span>}
                    </TableCell>
                    <TableCell className="py-5 px-4">
                      <p className="text-xs font-bold text-slate-500">{item.note}</p>
                    </TableCell>
                    <TableCell className={cn(
                      "py-5 px-4 text-right font-black text-base",
                      item.type === 'reward' ? "text-emerald-600" : 
                      item.type === 'settlement' ? "text-navy" : "text-brand"
                    )}>
                      {item.type === 'reward' ? '+' : '-'} ₹{item.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="py-5 px-4 text-right">
                      <Badge className={cn(
                        "font-black uppercase text-[8px] tracking-tighter px-2 py-0.5 rounded-md",
                        item.status === 'completed' ? "bg-success-soft text-success border-none" : "bg-amber-100 text-amber-600 border-none"
                      )}>
                        {item.status || 'Completed'}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-5 px-8 text-right font-bold text-slate-400 text-xs">
                      {item.timestamp ? formatDate(item.timestamp.toDate()) : "Processing..."}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
