import * as React from "react"
import { db } from "@/lib/firebase"
import { 
  collection, 
  onSnapshot, 
  query, 
  where,
  orderBy, 
  serverTimestamp, 
  runTransaction, 
  doc 
} from "firebase/firestore"
import { 
  History, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Search,
  Wallet,
  Building2,
  Phone,
  Clock,
  ArrowUpRight,
  CheckCircle,
  X
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
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
import { cn, formatDate, formatCurrency } from "@/lib/utils"

interface SettlementRequest {
  id: string;
  sourceId: string;
  sourceName?: string;
  amount: number;
  status: 'pending' | 'completed' | 'rejected';
  timestamp: any;
  processedAt?: any;
  note?: string;
  // Join data
  pumpName?: string;
  mobileNumber?: string;
}

interface Merchant {
  id: string;
  pumpName?: string;
  name?: string;
  mobileNumber?: string;
  ownerPhone?: string;
  walletBalance: number;
}

export function Settlements() {
  const [requests, setRequests] = React.useState<SettlementRequest[]>([])
  const [merchants, setMerchants] = React.useState<Record<string, Merchant>>({})
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [filterStatus, setFilterStatus] = React.useState<string>("all")
  const [isProcessing, setIsProcessing] = React.useState<string | null>(null)

  // Fetch Data
  React.useEffect(() => {
    // 1. Fetch Merchants for joining info
    const merchantsUnsubscribe = onSnapshot(collection(db, "merchant"), (snapshot) => {
      const merchantMap: Record<string, Merchant> = {}
      snapshot.docs.forEach(doc => {
        merchantMap[doc.id] = { id: doc.id, ...doc.data() } as Merchant
      })
      setMerchants(merchantMap)
    })

    // 2. Fetch Settlement Requests
    const q = query(
      collection(db, "wallet_history"),
      where("type", "==", "settlement"),
      orderBy("timestamp", "desc")
    )

    const requestsUnsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SettlementRequest[]
      setRequests(data)
      setLoading(false)
    }, (error) => {
      console.error("Firestore Error:", error)
      toast.error("Failed to fetch settlement requests. Check permissions/indexes.")
      setLoading(false)
    })

    return () => {
      merchantsUnsubscribe()
      requestsUnsubscribe()
    }
  }, [])

  const handleApprove = async (request: SettlementRequest) => {
    setIsProcessing(request.id)
    try {
      await runTransaction(db, async (transaction) => {
        const historyRef = doc(db, "wallet_history", request.id)
        const merchantRef = doc(db, "merchant", request.sourceId)
        
        const hDoc = await transaction.get(historyRef)
        const mDoc = await transaction.get(merchantRef)
        
        if (!hDoc.exists()) throw new Error("Request not found")
        if (!mDoc.exists()) throw new Error("Merchant not found")
        
        // 1. Update Request Status
        transaction.update(historyRef, { 
          status: 'completed',
          processedAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
        
        // 2. Update Merchant's lastSettlementAt and pendingSettlement
        const currentPending = mDoc.data().pendingSettlement || 0
        transaction.update(merchantRef, {
          lastSettlementAt: serverTimestamp(),
          pendingSettlement: Math.max(0, currentPending - request.amount)
        })
      })
      toast.success("Settlement approved successfully!")
    } catch (error: any) {
      console.error("Approval Error:", error)
      toast.error("Failed to approve: " + error.message)
    } finally {
      setIsProcessing(null)
    }
  }

  const handleReject = async (request: SettlementRequest) => {
    setIsProcessing(request.id)
    try {
      await runTransaction(db, async (transaction) => {
        const historyRef = doc(db, "wallet_history", request.id)
        const merchantRef = doc(db, "merchant", request.sourceId)
        
        const hDoc = await transaction.get(historyRef)
        const mDoc = await transaction.get(merchantRef)
        
        if (!hDoc.exists()) throw new Error("Request not found")
        if (!mDoc.exists()) throw new Error("Merchant not found")
        
        const currentBalance = mDoc.data().walletBalance || 0
        const currentPending = mDoc.data().pendingSettlement || 0
        
        // 1. Update Request Status
        transaction.update(historyRef, { 
          status: 'rejected',
          processedAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
        
        // 2. Restore balance to Merchant's wallet and clear pending
        transaction.update(merchantRef, {
          walletBalance: currentBalance + request.amount,
          pendingSettlement: Math.max(0, currentPending - request.amount)
        })
      })
      toast.success("Settlement rejected. Funds restored to merchant.")
    } catch (error: any) {
      console.error("Rejection Error:", error)
      toast.error("Failed to reject: " + error.message)
    } finally {
      setIsProcessing(null)
    }
  }

  const filteredRequests = requests.filter(req => {
    const merchant = merchants[req.sourceId]
    const pumpName = req.sourceName || merchant?.pumpName || merchant?.name || ""
    const mobile = merchant?.mobileNumber || merchant?.ownerPhone || ""
    
    const matchesSearch = 
      pumpName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mobile.includes(searchTerm) ||
      req.id.includes(searchTerm)
      
    const matchesStatus = filterStatus === "all" || req.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  const stats = {
    pending: requests.filter(r => r.status === 'pending').length,
    completed: requests.filter(r => r.status === 'completed').length,
    totalAmount: requests.filter(r => r.status === 'completed').reduce((sum, r) => sum + r.amount, 0)
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col space-y-1">
          <h2 className="text-3xl font-black tracking-tight text-navy flex items-center gap-3">
            <Wallet className="h-8 w-8 text-brand" />
            Payout Settlements <span className="text-slate-400 font-medium">सेटलमेंट</span>
          </h2>
          <p className="text-sm text-slate-500 font-medium">Manage and approve payout requests from petrol pumps across the network.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white/50 backdrop-blur-sm p-1 rounded-2xl border border-slate-200/60 shadow-sm">
          {['all', 'pending', 'completed', 'rejected'].map((status) => (
            <Button
              key={status}
              variant="ghost"
              size="sm"
              onClick={() => setFilterStatus(status)}
              className={cn(
                "rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all",
                filterStatus === status 
                  ? "bg-brand text-white shadow-lg shadow-brand/20 hover:bg-brand hover:text-white" 
                  : "text-slate-400 hover:bg-brand/5 hover:text-brand"
              )}
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-xl shadow-slate-200/40 border-none rounded-[2rem] bg-white/70 backdrop-blur-md overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-700" />
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Pending Requests</CardDescription>
            <CardTitle className="text-3xl font-black text-navy">{stats.pending}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-[10px] font-bold text-amber-500 uppercase tracking-widest bg-amber-50 w-fit px-3 py-1 rounded-full border border-amber-100">
              <Clock className="h-3 w-3 mr-1.5" /> Action Required
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xl shadow-slate-200/40 border-none rounded-[2rem] bg-white/70 backdrop-blur-md overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-success/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-700" />
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Total Settled</CardDescription>
            <CardTitle className="text-3xl font-black text-navy">{formatCurrency(stats.totalAmount)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-[10px] font-bold text-success uppercase tracking-widest bg-success/5 w-fit px-3 py-1 rounded-full border border-success/10">
              <CheckCircle2 className="h-3 w-3 mr-1.5" /> Lifetime Volume
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xl shadow-slate-200/40 border-none rounded-[2rem] bg-navy overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-700" />
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Success Rate</CardDescription>
            <CardTitle className="text-3xl font-black text-white">
              {requests.length > 0 ? Math.round((stats.completed / requests.length) * 100) : 0}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-[10px] font-bold text-slate-300 uppercase tracking-widest bg-white/10 w-fit px-3 py-1 rounded-full">
              <ArrowUpRight className="h-3 w-3 mr-1.5" /> System Integrity
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="shadow-2xl shadow-slate-200/50 border-none rounded-[2.5rem] overflow-hidden bg-white relative">
        <CardHeader className="border-b border-slate-50 px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <CardTitle className="text-xl font-black text-navy">Settlement Ledger</CardTitle>
              <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">Real-time payout monitoring</CardDescription>
            </div>
            
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search pump name, mobile or ID..."
                className="pl-11 h-12 bg-slate-50 border-none focus-visible:ring-brand/20 rounded-2xl font-bold placeholder:text-slate-400 shadow-inner"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-none">
                  <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest px-8 h-14">Pump Details</TableHead>
                  <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest h-14">Amount</TableHead>
                  <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest h-14">Request Date</TableHead>
                  <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest h-14">Status</TableHead>
                  <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest h-14 text-right px-8">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence mode="popLayout">
                  {filteredRequests.map((req) => {
                    const merchant = merchants[req.sourceId]
                    const pumpName = req.sourceName || merchant?.pumpName || merchant?.name || "Unknown Pump"
                    const mobile = merchant?.mobileNumber || merchant?.ownerPhone || "N/A"
                    
                    return (
                      <motion.tr
                        key={req.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="group transition-colors border-b border-slate-50 last:border-none hover:bg-slate-50/30"
                      >
                        <TableCell className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-brand/10 group-hover:text-brand transition-colors">
                              <Building2 className="h-6 w-6" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-black text-navy leading-tight">{pumpName}</span>
                              <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mt-1">
                                <Phone className="h-3 w-3" /> {mobile}
                              </span>
                              <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest mt-1">ID: {req.id.slice(0, 8)}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-base font-black text-navy">{formatCurrency(req.amount)}</span>
                            {req.note && <span className="text-[9px] font-bold text-slate-400 italic mt-0.5">"{req.note}"</span>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-500">
                              {req.timestamp ? formatDate(req.timestamp.toDate().toISOString()) : 'N/A'}
                            </span>
                            <span className="text-[9px] font-medium text-slate-400">
                              {req.timestamp ? req.timestamp.toDate().toLocaleTimeString() : ''}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn(
                            "text-[9px] px-3 py-1 font-black uppercase border-none tracking-tighter rounded-full",
                            req.status === 'pending' ? "bg-amber-100 text-amber-600" :
                            req.status === 'completed' ? "bg-success-soft text-success" :
                            "bg-red-50 text-red-500"
                          )}>
                            {req.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right px-8">
                          {req.status === 'pending' ? (
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-10 px-4 rounded-xl text-red-500 hover:bg-red-50 font-black text-[10px] uppercase tracking-widest"
                                onClick={() => handleReject(req)}
                                disabled={!!isProcessing}
                              >
                                {isProcessing === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
                                Reject
                              </Button>
                              <Button
                                size="sm"
                                className="h-10 px-6 rounded-xl bg-brand hover:bg-brand-hover text-white shadow-lg shadow-brand/20 font-black text-[10px] uppercase tracking-widest"
                                onClick={() => handleApprove(req)}
                                disabled={!!isProcessing}
                              >
                                {isProcessing === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                                Approve
                              </Button>
                            </div>
                          ) : (
                            <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center justify-end gap-2">
                              {req.status === 'completed' ? <CheckCircle className="h-3 w-3 text-success" /> : <X className="h-3 w-3 text-red-400" />}
                              Processed {req.processedAt ? formatDate(req.processedAt.toDate().toISOString()) : ''}
                            </div>
                          )}
                        </TableCell>
                      </motion.tr>
                    )
                  })}
                </AnimatePresence>
                
                {filteredRequests.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-24">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="h-20 w-20 rounded-[2.5rem] bg-slate-50 flex items-center justify-center">
                          <History className="h-10 w-10 text-slate-200" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-black text-navy uppercase tracking-widest">No settlement requests found</p>
                          <p className="text-xs font-bold text-slate-400">Requests will appear here when petrol pumps cash out.</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                
                {loading && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-24">
                      <Loader2 className="h-8 w-8 animate-spin text-brand mx-auto mb-4" />
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading Intelligence...</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <div className="px-8 py-4 border-t border-slate-50 bg-slate-50/30">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] text-center">Metaroll Rewards Financial Ledger • Active Session</p>
        </div>
      </Card>
    </div>
  )
}
