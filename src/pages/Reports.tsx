import * as React from "react"
import { db } from "@/lib/firebase"
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy
} from "firebase/firestore"
import {
  FileSpreadsheet,
  Search,
  Download,
  Calendar,
  ChevronDown,
  ArrowRight,
  Database,
  Users,
  Fuel,
  Zap,
  MapPin
} from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate, comingSoon } from "@/lib/utils"
import { toast } from "sonner"
import * as XLSX from 'xlsx'
import { REGIONS, MARKETING_OFFICERS } from "@/lib/constants"
import { useAuth } from "@/contexts/AuthContext"
import { getDocs } from "firebase/firestore"

interface Transaction {
  id: string;
  type: 'allocation' | 'transfer' | 'payment' | 'settlement';
  timestamp: any;
  status: string;
  amount?: number;
  
  // Entity Names (Denormalized for reporting)
  firmName?: string;
  dealerName?: string;
  pumpName?: string;
  fromName?: string;
  toName?: string;
  
  // Specific Metrics
  tmtMT?: number;
  liters?: number;
  rewardAmount?: number;
  
  // Metadata
  description?: string;
  billNumber?: string;
  mobile?: string;
  region?: string;
  mo?: string;
}

interface Dealer {
  id: string;
  firmName?: string;
  marketingOfficer?: string;
  region?: string;
  mobileNumber?: string;
  [key: string]: any;
}

export function Reports() {
  const { role, profile } = useAuth()
  const [transactions, setTransactions] = React.useState<Transaction[]>([])
  const [filteredData, setFilteredData] = React.useState<Transaction[]>([])
  const [loading, setLoading] = React.useState(true)
  const [dealers, setDealers] = React.useState<string[]>([])
  const [pumps, setPumps] = React.useState<string[]>([])
  
  const [filters, setFilters] = React.useState({
    fromDate: "",
    toDate: "",
    type: "All",
    dealer: "All",
    pump: "All",
    region: "All",
    mo: "All"
  })

  // RBAC: If MO, lock filter to their name
  React.useEffect(() => {
    if (role === 'mo' && profile?.fullName) {
      setFilters(prev => ({ ...prev, mo: profile.fullName }))
    }
  }, [role, profile])

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      
      // Fetch dealers first to map MOs
      const dealersSnap = await getDocs(collection(db, "dealers"))
      const dealersList = dealersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Dealer[]

      const q = query(collection(db, "wallet_history"), orderBy("timestamp", "desc"))
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => {
          const txnData = doc.data();
          // Find associated dealer to get MO and Region
          const dealerId = txnData.dealerId || txnData.destinationId || txnData.sourceId;
          const dealer = dealersList.find(d => 
            d.id === dealerId || 
            d.firmName === (txnData.firmName || txnData.dealerName) ||
            (d as any).mobileNumber === (txnData.destinationId || txnData.sourceId)
          );

          return {
            id: doc.id,
            ...txnData,
            region: txnData.region || dealer?.region || "Unmapped",
            mo: dealer?.marketingOfficer || (dealer as any)?.assignedMO || "Unassigned"
          } as Transaction
        })
        
        setTransactions(data)
        
        // Initial filtering for MOs
        let initialData = data;
        if (role === 'mo' && profile?.fullName) {
          initialData = data.filter(t => (t as any).mo === profile.fullName);
        }
        setFilteredData(initialData)
        
        // Extract filter options
        const uniqueDealers = Array.from(new Set(initialData.map(t => 
          t.firmName || t.dealerName || t.fromName || t.toName
        ).filter(Boolean))) as string[]
        const uniquePumps = Array.from(new Set(initialData.map(t => t.pumpName).filter(Boolean))) as string[]
        
        setDealers(uniqueDealers)
        setPumps(uniquePumps)
        setLoading(false)
      }, (error) => {
        console.error("Firestore Error in Reports:", error)
        toast.error("Access denied or index missing for wallet history data.")
        setLoading(false)
      })

      return unsubscribe;
    }

    const unsubPromise = fetchData();
    return () => {
      unsubPromise.then(unsub => unsub && unsub());
    }
  }, [role, profile])

  const handleExportExcel = () => {
    try {
      const exportData = filteredData.map(txn => {
        const dateObj = txn.timestamp ? txn.timestamp.toDate() : null;
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const quarter = dateObj ? Math.floor(dateObj.getMonth() / 3) + 1 : null;
        
        return {
          'Transaction ID': txn.id,
          'ISO Timestamp': dateObj ? dateObj.toISOString() : '',
          'Date': dateObj ? dateObj.toLocaleDateString() : 'N/A',
          'Year': dateObj ? dateObj.getFullYear() : null,
          'Month': dateObj ? dateObj.getMonth() + 1 : null,
          'Month Name': dateObj ? monthNames[dateObj.getMonth()] : 'N/A',
          'Quarter': quarter ? `Q${quarter}` : 'N/A',
          'Type': txn.type.toUpperCase(),
          'Region': txn.region || 'Unmapped',
          'Marketing Officer': (txn as any).mo || 'Unassigned',
          'Entity Name': txn.firmName || txn.dealerName || txn.fromName || txn.toName || '-',
          'Entity Mobile': txn.mobile || '-',
          'Petrol Pump': txn.pumpName || '-',
          'Liters': txn.liters || 0,
          'Weight (MT)': txn.tmtMT || 0,
          'Reward (INR)': txn.rewardAmount || 0,
          'Amount (INR)': txn.amount || 0,
          'Status': txn.status,
          'Description': txn.description || '-',
          'Bill Number': txn.billNumber || '-',
          'System Version': '4.0.0'
        }
      })

      const ws = XLSX.utils.json_to_sheet(exportData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Metaroll_Intelligence")
      XLSX.writeFile(wb, `metaroll-intelligence-${new Date().toISOString().split('T')[0]}.xlsx`)
      toast.success("Intelligence report exported for Power BI!")
    } catch (error) {
      toast.error("Failed to export report")
      console.error(error)
    }
  }

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF()
      
      // Add Header
      doc.setFontSize(22)
      doc.setTextColor(2, 6, 23) // Navy
      doc.text("METAROLL REWARDS", 14, 22)
      
      doc.setFontSize(10)
      doc.setTextColor(100, 116, 139) // Slate
      doc.text("Data Intelligence Report", 14, 30)
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 35)
      
      // Add Filters Summary
      doc.setFontSize(9)
      doc.setTextColor(51, 65, 85)
      let filterText = `Filters: Type: ${filters.type} | Region: ${filters.region} | Dealer: ${filters.dealer} | Pump: ${filters.pump}`
      if (filters.fromDate) filterText += ` | From: ${filters.fromDate}`
      if (filters.toDate) filterText += ` | To: ${filters.toDate}`
      doc.text(filterText, 14, 45)

      // Table Data
      const tableColumn = ["ID", "Date", "Type", "Entity / Partner", "Metric", "Status"]
      const tableRows = filteredData.map(txn => [
        `TXN-${txn.id.slice(0, 8)}`,
        txn.timestamp ? txn.timestamp.toDate().toLocaleDateString() : 'N/A',
        txn.type.toUpperCase(),
        `${txn.firmName || txn.dealerName || txn.fromName || txn.toName || 'N/A'}${txn.pumpName ? `\n${txn.pumpName}` : ''}`,
        txn.liters ? `${txn.liters.toFixed(1)} L (+₹${(txn.rewardAmount || 0).toFixed(1)})` : 
        (txn.tmtMT ? `${txn.tmtMT} MT (${formatCurrency(txn.amount || 0)})` : formatCurrency(txn.amount || 0)),
        txn.status.toUpperCase()
      ])

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 55,
        theme: 'striped',
        headStyles: { fillColor: [225, 29, 72], textColor: 255, fontStyle: 'bold' }, // Metaroll Red
        alternateRowStyles: { fillColor: [248, 250, 252] },
        styles: { fontSize: 8, cellPadding: 4 },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 25 },
          3: { halign: 'right' },
          4: { halign: 'center' }
        }
      })

      // Add Footer
      const pageCount = (doc as any).internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(148, 163, 184)
        doc.text(
          "Metaroll Rewards Data Intelligence Engine • Confidential",
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        )
      }

      doc.save(`metaroll-intelligence-${new Date().toISOString().split('T')[0]}.pdf`)
      toast.success("Intelligence report downloaded as PDF!")
    } catch (error) {
      toast.error("Failed to generate PDF")
      console.error(error)
    }
  }

  const applyFilters = () => {
    let filtered = [...transactions]

    if (filters.type !== "All") {
      // In this system, current transactions are mostly settlements
      const targetType = filters.type.toLowerCase();
      filtered = filtered.filter(t => t.type === targetType);
    }
    
    if (filters.dealer !== "All") {
      filtered = filtered.filter(t => 
        (t.firmName || t.dealerName || t.fromName || t.toName) === filters.dealer
      )
    }
    
    if (filters.pump !== "All") {
      filtered = filtered.filter(t => t.pumpName === filters.pump)
    }

    if (filters.region !== "All") {
      filtered = filtered.filter(t => t.region === filters.region)
    }

    if (filters.mo !== "All") {
      filtered = filtered.filter(t => (t as any).mo === filters.mo)
    }
    
    if (filters.fromDate) {
      filtered = filtered.filter(t => t.timestamp?.toDate().toISOString().split('T')[0] >= filters.fromDate)
    }
    
    if (filters.toDate) {
      filtered = filtered.filter(t => t.timestamp?.toDate().toISOString().split('T')[0] <= filters.toDate)
    }

    setFilteredData(filtered)
    toast.success(`Found ${filtered.length} records matching your query`)
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col space-y-1">
          <h2 className="text-3xl font-black tracking-tight text-navy flex items-center gap-3">
            <Database className="h-8 w-8 text-brand" />
            Intelligence Reports <span className="text-slate-400 font-medium">अहवाल</span>
          </h2>
          <p className="text-sm text-slate-500 font-medium">Generate and analyze deep-dive transaction intelligence across the network.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleExportExcel}
            variant="outline"
            className="bg-white hover:bg-success/5 border-success/20 text-success font-black rounded-2xl h-12 px-6 shadow-sm uppercase tracking-widest text-[10px]"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Excel Export
          </Button>
          <Button 
            className="bg-brand hover:bg-brand-hover text-white font-black rounded-2xl h-12 px-6 shadow-xl shadow-brand/20 uppercase tracking-widest text-[10px]" 
            onClick={handleExportPDF}
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="shadow-2xl shadow-slate-200/50 border-none rounded-[2.5rem] overflow-hidden bg-white/70 backdrop-blur-md">
        <CardHeader className="border-b border-slate-50 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl font-black text-navy">Query Engine</CardTitle>
              <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">Apply multidimensional filters to your data</CardDescription>
            </div>
            <Badge className="bg-brand/10 text-brand font-black border-none px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest">
              {filteredData.length} records found
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="px-8 py-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center ml-1">
                <Zap className="h-3 w-3 mr-2 text-brand" /> Type
              </label>
              <div className="relative">
                <select
                  className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 text-sm font-bold appearance-none outline-none focus:ring-2 focus:ring-brand/20 transition-all shadow-inner"
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                >
                  <option value="All">All Types</option>
                  <option value="allocation">Allocation</option>
                  <option value="transfer">Transfer</option>
                  <option value="payment">Payment</option>
                  <option value="settlement">Settlement</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center ml-1">
                <Calendar className="h-3 w-3 mr-2 text-brand" /> From Date
              </label>
              <Input
                type="date"
                className="h-12 bg-slate-50 border-none focus-visible:ring-brand/20 rounded-xl font-bold shadow-inner"
                value={filters.fromDate}
                onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center ml-1">
                <Calendar className="h-3 w-3 mr-2 text-brand" /> To Date
              </label>
              <Input
                type="date"
                className="h-12 bg-slate-50 border-none focus-visible:ring-brand/20 rounded-xl font-bold shadow-inner"
                value={filters.toDate}
                onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <MapPin className="h-3 w-3 text-brand" /> Region
              </label>
              <select 
                value={filters.region}
                onChange={(e) => setFilters({...filters, region: e.target.value})}
                className="w-full h-12 bg-slate-50 border-none rounded-xl font-bold px-4 outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-brand/10"
              >
                <option value="All">All Regions</option>
                {REGIONS.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Users className="h-3 w-3 text-brand" /> MO
              </label>
              <select 
                value={filters.mo}
                disabled={role === 'mo'}
                onChange={(e) => setFilters({...filters, mo: e.target.value})}
                className="w-full h-12 bg-slate-50 border-none rounded-xl font-bold px-4 outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-brand/10 disabled:opacity-50"
              >
                <option value="All">All MOs</option>
                {MARKETING_OFFICERS.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Users className="h-3 w-3 text-brand" /> Dealer
              </label>
              <div className="relative">
                <select
                  className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 text-sm font-bold appearance-none outline-none focus:ring-2 focus:ring-brand/20 transition-all shadow-inner"
                  value={filters.dealer}
                  onChange={(e) => setFilters({ ...filters, dealer: e.target.value })}
                >
                  <option value="All">All Dealers</option>
                  {dealers.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center ml-1">
                <Fuel className="h-3 w-3 mr-2 text-brand" /> Petrol Pump
              </label>
              <div className="relative">
                <select
                  className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 text-sm font-bold appearance-none outline-none focus:ring-2 focus:ring-brand/20 transition-all shadow-inner"
                  value={filters.pump}
                  onChange={(e) => setFilters({ ...filters, pump: e.target.value })}
                >
                  <option value="All">All Pumps</option>
                  {pumps.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div className="flex items-end">
              <Button 
                className="w-full h-12 bg-navy hover:bg-navy/90 text-white font-black rounded-xl transition-all shadow-xl shadow-navy/20 uppercase tracking-widest text-[10px]" 
                onClick={applyFilters}
              >
                Execute Query
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card className="shadow-2xl shadow-slate-200/50 border-none rounded-[2.5rem] overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-none">
                  <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest px-8 h-14">Transaction ID</TableHead>
                  <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest h-14">Date</TableHead>
                  <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest h-14">Entity / Partner</TableHead>
                  <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest h-14 text-right">Metric</TableHead>
                  <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest h-14 text-center">Status</TableHead>
                  <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest h-14 text-right px-8">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((txn) => (
                  <TableRow key={txn.id} className="group transition-colors border-b border-slate-50 last:border-none">
                    <TableCell className="px-8 py-5">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TXN-{txn.id.slice(0, 8)}</span>
                      {txn.billNumber && <p className="text-[10px] font-bold text-navy mt-1">BILL: {txn.billNumber}</p>}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-bold text-slate-500">
                        {txn.timestamp ? formatDate(txn.timestamp.toDate().toISOString()) : 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[8px] font-black uppercase px-1.5 py-0 border-slate-200 text-slate-400">
                            {txn.type}
                          </Badge>
                        </div>
                        <span className="text-sm font-black text-navy leading-tight flex items-center gap-1.5 mt-1">
                          <Users className="h-3 w-3 text-indigo-500" />
                          {txn.firmName || txn.dealerName || txn.fromName || txn.toName || 'Unknown Entity'}
                        </span>
                        {txn.pumpName && (
                          <span className="text-[10px] font-bold text-slate-400 uppercase mt-1 flex items-center gap-1">
                            <Fuel className="h-3 w-3 text-brand" />
                            {txn.pumpName}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end">
                        {txn.type === 'payment' ? (
                          <>
                            <span className="text-sm font-black text-blue-600">{txn.liters?.toFixed(1)} L</span>
                            <span className="text-[10px] font-black text-brand uppercase tracking-widest flex items-center gap-1 mt-1">
                              <Zap className="h-2.5 w-2.5 fill-brand" /> +₹{(txn.rewardAmount || 0).toFixed(1)} Credits
                            </span>
                          </>
                        ) : txn.type === 'allocation' ? (
                          <>
                            <span className="text-sm font-black text-brand">{txn.tmtMT} MT</span>
                            <span className="text-[10px] font-bold text-slate-400 mt-1">{formatCurrency(txn.amount || 0)}</span>
                          </>
                        ) : (
                          <>
                            <span className="text-sm font-black text-navy">{formatCurrency(txn.amount || 0)}</span>
                            <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">
                              {txn.type}
                            </span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="text-[9px] px-2.5 py-1 font-black uppercase border-none tracking-tighter bg-success-soft text-success">
                        {txn.status || 'Verified'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right px-8">
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-300 hover:text-brand hover:bg-brand/5" onClick={() => comingSoon("Deep Analytics")}>
                        <ArrowRight className="h-5 w-5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!loading && filteredData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-24">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="h-20 w-20 rounded-[2.5rem] bg-slate-50 flex items-center justify-center">
                          <Search className="h-10 w-10 text-slate-200" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-black text-navy uppercase tracking-widest">No intelligence found</p>
                          <p className="text-xs font-bold text-slate-400">Try adjusting your query parameters.</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <div className="px-8 py-4 border-t border-slate-50 bg-slate-50/30">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] text-center">Metaroll Rewards Data Intelligence Engine • Active</p>
        </div>
      </Card>
    </div>
  )
}

