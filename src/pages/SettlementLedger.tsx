import * as React from "react"
import { db } from "@/lib/firebase"
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore"
import { Landmark, ArrowUpRight, Search, Filter, Loader2, FileText, Gift } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, cn } from "@/lib/utils"

interface Transaction {
  id: string;
  type: 'settlement' | 'transfer' | 'reward';
  sourceId: string;
  sourceName: string;
  destinationId?: string;
  destinationName?: string;
  amount: number;
  status: string;
  timestamp: any;
  note?: string;
  liters?: number;
  weight?: number;
}

interface PetrolPump {
  id: string;
  name: string;
  pumpName?: string;
  location: string;
  city: string;
  ownerName: string;
  mobileNumber?: string;
  ownerPhone?: string;
  pendingSettlement: number;
  lastSettlementAt?: any;
}

export default function SettlementLedger() {
  const [transactions, setTransactions] = React.useState<Transaction[]>([])
  const [pumps, setPumps] = React.useState<PetrolPump[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState("")

  React.useEffect(() => {
    // Fetch Pumps for normalization/search
    const pumpsUnsubscribe = onSnapshot(collection(db, "merchant"), (snapshot) => {
      const pumpData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Normalize naming conventions
          name: data.name || data.pumpName || 'Unknown Pump',
          ownerPhone: data.ownerPhone || data.mobileNumber || ''
        } as PetrolPump;
      });
      setPumps(pumpData);
    });

    const q = query(
      collection(db, "wallet_history"), 
      orderBy("timestamp", "desc"),
      limit(100)
    )
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txnData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[]
      
      setTransactions(txnData)
      setLoading(false)
    }, (error) => {
      console.error("Error fetching ledger:", error)
      setLoading(false)
    })

    return () => {
      pumpsUnsubscribe();
      unsubscribe();
    }
  }, [])

  const filteredTxns = transactions.filter(t => {
    const search = searchTerm.toLowerCase();
    const pump = pumps.find(p => p.id === t.destinationId || p.id === t.sourceId);
    
    return (
      t.sourceName?.toLowerCase().includes(search) || 
      t.destinationName?.toLowerCase().includes(search) ||
      t.type?.toLowerCase().includes(search) ||
      t.note?.toLowerCase().includes(search) ||
      t.amount.toString().includes(search) ||
      pump?.name?.toLowerCase().includes(search) ||
      pump?.pumpName?.toLowerCase().includes(search) ||
      pump?.ownerPhone?.includes(search) ||
      pump?.mobileNumber?.includes(search)
    );
  })

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-navy">
            Settlement Ledger <span className="text-brand/40 font-medium">व्यवहार नोंद</span>
          </h1>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Audit trail of all financial settlements and transfers.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group flex-1 md:flex-none">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-brand transition-colors" />
            <Input
              type="text"
              placeholder="Search ledger..."
              className="w-full md:w-[300px] h-12 pl-12 bg-white border-none shadow-lg shadow-slate-200/50 rounded-2xl font-bold focus-visible:ring-2 focus-visible:ring-brand/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="h-12 border-none shadow-lg bg-white rounded-2xl px-6 font-bold text-slate-600 hover:bg-slate-50">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Rewards" value={formatCurrency(transactions.filter(t => t.type === 'reward').reduce((acc, t) => acc + t.amount, 0))} icon={Gift} color="success" />
        <StatCard title="Total Payouts" value={formatCurrency(transactions.filter(t => t.type === 'settlement').reduce((acc, t) => acc + t.amount, 0))} icon={Landmark} color="brand" />
        <StatCard title="Recent Transfers" value={transactions.filter(t => t.type === 'transfer').length} icon={ArrowUpRight} color="indigo" />
        <StatCard title="Total Audit" value={transactions.length} icon={FileText} color="navy" />
      </div>

      <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction Details</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <AnimatePresence>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-brand mx-auto" />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-4">Loading Ledger...</p>
                      </td>
                    </tr>
                  ) : filteredTxns.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center">
                        <FileText className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-sm font-black text-navy">No transactions found</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Try adjusting your search</p>
                      </td>
                    </tr>
                  ) : (
                    filteredTxns.map((txn) => (
                      <motion.tr 
                        key={txn.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="group hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${
                              txn.type === 'settlement' ? 'bg-navy/10 text-navy' : 
                              txn.type === 'reward' ? 'bg-success/10 text-success' :
                              'bg-brand/10 text-brand'
                            }`}>
                              {txn.type === 'settlement' ? <Landmark className="h-6 w-6" /> : 
                               txn.type === 'reward' ? <Gift className="h-6 w-6" /> :
                               <ArrowUpRight className="h-6 w-6" />}
                            </div>
                            <div>
                              <div className="flex flex-col">
                                {txn.type === 'reward' ? (
                                  <>
                                    <p className="text-sm font-black text-navy">{txn.sourceName}</p>
                                    <p className="text-[10px] font-bold text-success uppercase tracking-widest flex items-center gap-1">
                                      System Reward
                                    </p>
                                  </>
                                ) : txn.type === 'settlement' ? (
                                  <>
                                    <p className="text-sm font-black text-navy">{txn.destinationName}</p>
                                    <p className="text-[10px] font-bold text-navy/40 uppercase tracking-widest flex items-center gap-1">
                                      Cash Payout
                                    </p>
                                  </>
                                ) : (
                                  <>
                                    <p className="text-sm font-black text-navy">{txn.sourceName}</p>
                                    <p className="text-[10px] font-bold text-brand uppercase tracking-widest flex items-center gap-1">
                                      → {txn.destinationName}
                                    </p>
                                  </>
                                )}
                              </div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                                {txn.timestamp?.toDate ? txn.timestamp.toDate().toLocaleString() : 'Recent'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <Badge variant="outline" className={cn(
                            "bg-white font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-full",
                            txn.type === 'reward' ? "border-success/20 text-success" :
                            txn.type === 'settlement' ? "border-navy/20 text-navy" :
                            "border-brand/20 text-brand"
                          )}>
                            {txn.type}
                          </Badge>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col">
                            <p className={cn(
                              "text-sm font-black",
                              txn.type === 'reward' ? "text-success" : 
                              txn.type === 'settlement' ? "text-navy" : "text-brand"
                            )}>
                              {txn.type === 'reward' ? '+' : txn.type === 'settlement' ? '-' : ''} {formatCurrency(txn.amount)}
                            </p>
                            {txn.note && (
                              <p className="text-[10px] font-bold text-slate-400 truncate max-w-[200px]">
                                {txn.note}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <Badge className={cn(
                            "border-none font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-full",
                            txn.status === 'pending' ? "bg-amber-100 text-amber-600" :
                            txn.status === 'rejected' ? "bg-red-100 text-red-600" :
                            "bg-success/10 text-success"
                          )}>
                            {txn.status || 'Completed'}
                          </Badge>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <Button variant="ghost" className="h-10 w-10 rounded-xl p-0 hover:bg-brand/5 hover:text-brand transition-colors">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, color }: { title: string, value: string | number, icon: any, color: 'success' | 'brand' | 'indigo' | 'navy' }) {
  const colorMap = {
    success: 'bg-success/10 text-success',
    brand: 'bg-brand/10 text-brand',
    indigo: 'bg-indigo-600/10 text-indigo-600',
    navy: 'bg-navy/10 text-navy'
  }

  return (
    <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2rem] overflow-hidden bg-white group hover:-translate-y-1 transition-all">
      <CardContent className="p-8">
        <div className="flex justify-between items-start">
          <div className={`h-14 w-14 ${colorMap[color]} rounded-[1.25rem] flex items-center justify-center`}>
            <Icon className="h-7 w-7" />
          </div>
        </div>
        <div className="mt-6">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
          <p className="text-3xl font-black text-navy tracking-tighter mt-1">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}
