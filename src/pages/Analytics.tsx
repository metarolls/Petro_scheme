import * as React from "react"
import { 
  TrendingUp, 
  Wallet, 
  Truck, 
  Award,
  Download,
  MapPin,
  ChevronDown,
  UserCheck,
  ArrowUpRight,
  ArrowDownRight,
  Clock
} from "lucide-react"
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  ComposedChart,
  Line
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { FileSpreadsheet } from "lucide-react"
import { REGIONS, MARKETING_OFFICERS, REWARD_PER_MT } from "@/lib/constants"
import { formatCurrency, formatNumber, cn } from "@/lib/utils"
import { db } from "@/lib/firebase"
import { collection, onSnapshot, query, orderBy } from "firebase/firestore"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import * as XLSX from "xlsx"

// Types for Firestore data
interface Dealer {
  id: string;
  firmName: string;
  location: string;
  region: string;
  marketingOfficer: string;
  status: string;
}

interface Transaction {
  id: string;
  timestamp: any;
  type: string;
  dealerName?: string;
  dealerId?: string;
  destinationId?: string;
  sourceId?: string;
  weight?: number;
  weightMT?: number;
  weightKG?: number;
  amount: number;
  status: string;
  region?: string;
}


export function Analytics() {
  const { role, profile } = useAuth()
  const [selectedRegion, setSelectedRegion] = React.useState("All")
  const [selectedMO, setSelectedMO] = React.useState("All")
  const [isLoading, setIsLoading] = React.useState(true)
  const [dealers, setDealers] = React.useState<Dealer[]>([])
  const [transactions, setTransactions] = React.useState<Transaction[]>([])

  // RBAC: If MO or RM, lock filters
  React.useEffect(() => {
    if (role === 'mo' && profile?.fullName) {
      setSelectedMO(profile.fullName)
    }
  }, [role, profile])

  React.useEffect(() => {
    const dealersQuery = query(collection(db, "dealers"))
    const walletHistoryQuery = query(collection(db, "wallet_history"), orderBy("timestamp", "desc"))

    const unsubDealers = onSnapshot(dealersQuery, (snapshot) => {
      setDealers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Dealer[])
    })

    const unsubHistory = onSnapshot(walletHistoryQuery, (snapshot) => {
      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Transaction[])
      setIsLoading(false)
    })

    return () => {
      unsubDealers()
      unsubHistory()
    }
  }, [])

  // Helper to extract weight in MT from transaction
  const getWeightInMT = (txn: Transaction): number => {
    if (txn.weightMT !== undefined) return Number(txn.weightMT);
    if (txn.weight !== undefined) return Number(txn.weight);
    if (txn.weightKG !== undefined) return Number(txn.weightKG) / 1000;
    return 0;
  }

  // 1. Process and Join Data
  const processedData = React.useMemo(() => {
    // Enrich all transactions with dealer data and standardized metrics
    const enrichedTxns = transactions.map(txn => {
      // Find dealer by id, mobileNumber (destinationId), or firmName
      const dealer = dealers.find(d => 
        d.id === txn.dealerId || 
        d.id === txn.destinationId || 
        (d as any).mobileNumber === txn.destinationId ||
        d.firmName === txn.dealerName
      );
      
      let rawRegion = txn.region || dealer?.region || "Unmapped";
      
      // Normalize region to handle cases where the label was saved instead of the value
      const matchedRegion = REGIONS.find(r => 
        r.value === rawRegion || 
        r.label === rawRegion || 
        r.marathi === rawRegion ||
        (rawRegion === 'Chhatrapati Sambhajinagar' && r.value === 'Sambhajinagar')
      );
      
      const region = matchedRegion ? matchedRegion.value : "Unmapped";

      const mo = dealer?.marketingOfficer || (dealer as any)?.assignedMO || "Unassigned";
      const weightInMT = getWeightInMT(txn);
      const date = txn.timestamp?.toDate ? txn.timestamp.toDate() : new Date();
      const dateStr = date.toISOString().split('T')[0];

      return { ...txn, region, mo, weightInMT, dateStr };
    });

    // Apply global filters (Region/MO)
    const filteredTxns = enrichedTxns.filter(txn => 
      (selectedRegion === "All" || txn.region === selectedRegion) &&
      (selectedMO === "All" || txn.mo === selectedMO)
    );

    // Calculate core financial metrics
    const totalTmtDistributed = filteredTxns
      .filter(t => t.type === 'allocation')
      .reduce((sum, t) => sum + (t.weightInMT || 0), 0);
    
    const totalRewards = totalTmtDistributed * REWARD_PER_MT;
    
    const totalCredits = filteredTxns
      .filter(t => t.type === 'allocation' || t.type === 'reward')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    const pendingSettlements = filteredTxns
      .filter(t => t.status === 'pending' || t.status === 'Pending')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    // Aggregate stats by region
    const regionalStats: Record<string, { volume: number, rewards: number }> = {};
    [...REGIONS, { value: 'Unmapped', label: 'Unmapped', marathi: 'अवर्गीकृत' }].forEach(r => {
      regionalStats[r.value] = { volume: 0, rewards: 0 };
    });

    enrichedTxns.forEach(txn => {
      if (txn.type === 'allocation' && (selectedMO === "All" || txn.mo === selectedMO)) {
        if (!regionalStats[txn.region]) {
          regionalStats[txn.region] = { volume: 0, rewards: 0 };
        }
        regionalStats[txn.region].volume += txn.weightInMT;
      }
    });

    // Strictly volume-based rewards: ₹200 per MT
    Object.keys(regionalStats).forEach(r => {
      regionalStats[r].rewards = regionalStats[r].volume * REWARD_PER_MT;
    });

    return { 
      totalCredits, 
      totalRewards, 
      pendingSettlements, 
      totalTmtDistributed,
      regionalStats,
      enrichedTxns,
      filteredTxns
    };
  }, [transactions, dealers, selectedRegion, selectedMO])

  const { totalCredits, totalRewards, pendingSettlements, totalTmtDistributed } = processedData;

  // 2. Cash-Flow Chart Data
  const cashFlowData = React.useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const dataMap: Record<string, { tonnage: number, payouts: number, count: number }> = {}
    
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      return {
        dateStr: d.toISOString().split('T')[0],
        dayName: days[d.getDay()]
      }
    })

    last7Days.forEach(day => {
      dataMap[day.dateStr] = { tonnage: 0, payouts: 0, count: 0 }
    })

    processedData.filteredTxns.forEach(txn => {
      if (dataMap[txn.dateStr]) {
        if (txn.type === 'allocation') {
          dataMap[txn.dateStr].tonnage += txn.weightInMT || 0
        } else if (txn.type === 'settlement' || txn.type === 'transfer') {
          dataMap[txn.dateStr].payouts += txn.amount || 0
        }
        dataMap[txn.dateStr].count++
      }
    })

    return last7Days.map(day => ({
      name: day.dayName,
      tonnage: dataMap[day.dateStr].tonnage,
      payouts: dataMap[day.dateStr].payouts
    }))
  }, [processedData.filteredTxns])

  // 3. MO Leaderboard Data
  const moLeaderboard = React.useMemo(() => {
    return MARKETING_OFFICERS
      .filter(mo => selectedMO === "All" || mo.value === selectedMO)
      .map(mo => {
        const moDealers = dealers.filter(d => 
          (d.marketingOfficer === mo.value || (d as any).assignedMO === mo.value) && 
          (selectedRegion === "All" || d.region === selectedRegion)
        )
        const activeDealers = moDealers.length
        
        const totalVolume = processedData.enrichedTxns
          .filter(txn => 
            txn.mo === mo.value && 
            (selectedRegion === "All" || txn.region === selectedRegion) &&
            txn.type === 'allocation'
          )
          .reduce((sum, txn) => sum + txn.weightInMT, 0)
        
        return {
          name: mo.label,
          marathiName: mo.marathi,
          activeDealers,
          totalVolume,
          region: moDealers[0]?.region || 'Multiple'
        }
      })
      .filter(mo => mo.totalVolume > 0 || mo.activeDealers > 0)
      .sort((a, b) => b.totalVolume - a.totalVolume)
  }, [processedData.enrichedTxns, dealers, selectedRegion, selectedMO])

  // 4. Data Export Handlers
  const handleExportExcel = () => {
    try {
      const exportData = processedData.filteredTxns.map(txn => {
        const dealer = dealers.find(d => d.id === txn.dealerId || d.id === txn.destinationId);
        return {
          'Transaction ID': txn.id,
          'Date': txn.dateStr,
          'Timestamp': txn.timestamp?.toDate ? txn.timestamp.toDate().toISOString() : '',
          'Month': txn.timestamp?.toDate ? txn.timestamp.toDate().getMonth() + 1 : null,
          'Month Name': txn.timestamp?.toDate ? ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][txn.timestamp.toDate().getMonth()] : 'N/A',
          'Quarter': txn.timestamp?.toDate ? `Q${Math.floor(txn.timestamp.toDate().getMonth() / 3) + 1}` : 'N/A',
          'Type': txn.type.toUpperCase(),
          'Region': txn.region,
          'Marketing Officer': txn.mo,
          'Firm Name': dealer?.firmName || txn.dealerName || '-',
          'Entity ID': txn.dealerId || txn.destinationId || '-',
          'Volume (MT)': txn.weightInMT,
          'Amount (INR)': txn.amount,
          'Reward Earned (INR)': (txn.type === 'allocation' ? txn.weightInMT * REWARD_PER_MT : 0),
          'Status': txn.status,
          'Location': dealer?.location || '-',
          'Is Verified': txn.status === 'completed' || txn.status === 'Verified' ? 'Yes' : 'No',
          'System Version': '4.0.0'
        };
      });

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Analytics Data");
      
      // Flattened format for Power BI
      const fileName = `metaroll-analytics-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      toast.success("Analytics data exported to Excel!");
    } catch (error) {
      toast.error("Export failed");
      console.error(error);
    }
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.setTextColor(225, 29, 72); // Metaroll Red
      doc.text("Metaroll Rewards Analytics", 14, 22);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
      doc.text(`Region: ${selectedRegion} | MO: ${selectedMO}`, 14, 35);

      const tableColumn = ["Date", "Type", "Region", "MO", "Entity", "Metric", "Amount"];
      const tableRows = processedData.filteredTxns.slice(0, 50).map(txn => {
        const dealer = dealers.find(d => d.id === txn.dealerId || d.id === txn.destinationId);
        return [
          txn.dateStr,
          txn.type.toUpperCase(),
          txn.region,
          txn.mo,
          dealer?.firmName || txn.dealerName || '-',
          txn.weightInMT ? `${txn.weightInMT} MT` : '-',
          formatCurrency(txn.amount)
        ];
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 45,
        theme: 'grid',
        headStyles: { fillColor: [225, 29, 72] },
        styles: { fontSize: 8 }
      });

      if (processedData.filteredTxns.length > 50) {
        doc.setFontSize(8);
        doc.text(`* Showing top 50 of ${processedData.filteredTxns.length} transactions. Use Excel for full dump.`, 14, (doc as any).lastAutoTable.finalY + 10);
      }

      doc.save(`metaroll-analytics-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success("Analytics report downloaded as PDF!");
    } catch (error) {
      toast.error("PDF generation failed");
      console.error(error);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col space-y-1">
          <h2 className="text-3xl font-extrabold tracking-tight text-navy">Operational Intelligence <span className="text-slate-400 font-medium">कार्यरत बुद्धिमत्ता</span></h2>
          <p className="text-sm text-slate-500 font-medium tracking-tight">Real-time financial analytics and MO performance tracking. <span className="text-slate-300 ml-1 font-bold">रिअल-टाइम डेटा ट्रॅकिंग.</span></p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Region Filter */}
          <div className="relative group min-w-[160px]">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand/60 pointer-events-none group-focus-within:text-brand transition-colors" />
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              aria-label="Select Region"
              className="w-full h-11 pl-9 pr-8 bg-white border-2 border-slate-100 text-slate-600 font-bold rounded-2xl appearance-none outline-none focus:ring-4 focus:ring-brand/5 focus:border-brand/20 cursor-pointer text-xs shadow-sm hover:border-slate-200 transition-all"
            >
              <option value="All">All Regions (सर्व क्षेत्र)</option>
              {REGIONS.map(region => (
                <option key={region.value} value={region.value}>{region.marathi || (region as any).label}</option>
              ))}
              <option value="Unmapped">Unmapped (अवर्गीकृत)</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* MO Filter */}
          <div className="relative group min-w-[160px]">
            <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand/60 pointer-events-none group-focus-within:text-brand transition-colors" />
            <select
              value={selectedMO}
              disabled={role === 'mo'}
              onChange={(e) => setSelectedMO(e.target.value)}
              aria-label="Select Marketing Officer"
              className="w-full h-11 pl-9 pr-8 bg-white border-2 border-slate-100 text-slate-600 font-bold rounded-2xl appearance-none outline-none focus:ring-4 focus:ring-brand/5 focus:border-brand/20 cursor-pointer text-xs shadow-sm hover:border-slate-200 transition-all disabled:opacity-50"
            >
              <option value="All">All MOs (सर्व एमओ)</option>
              {MARKETING_OFFICERS.map(mo => (
                <option key={mo.value} value={mo.value}>
                  {mo.label} ({mo.marathi})
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>

          <Button 
            variant="outline" 
            className="h-11 px-5 border-2 border-slate-100 rounded-2xl text-slate-600 font-bold text-xs hover:bg-slate-50 shadow-sm transition-all active:scale-95"
            onClick={handleExportExcel}
          >
            <FileSpreadsheet className="h-4 w-4 mr-2 text-success" />
            Excel <span className="hidden sm:inline">Export</span>
          </Button>

          <Button 
            variant="outline" 
            className="h-11 px-5 border-2 border-slate-100 rounded-2xl text-slate-600 font-bold text-xs hover:bg-slate-50 shadow-sm transition-all active:scale-95"
            onClick={handleExportPDF}
          >
            <Download className="h-4 w-4 mr-2 text-brand" />
            PDF <span className="hidden sm:inline">Report</span>
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <AnalyticsCard 
          title="Total Credits" 
          subtitle="एकूण जमा"
          value={formatCurrency(totalCredits)} 
          icon={Wallet} 
          trend="+12.5%" 
          trendType="up"
          color="navy"
          marathiTrend="वाढ"
          loading={isLoading}
        />
        <AnalyticsCard 
          title="Rewards Distributed" 
          subtitle="वितरित बक्षीस"
          value={formatCurrency(totalRewards)} 
          icon={Award} 
          trend="+18.2%" 
          trendType="up"
          color="brand"
          marathiTrend="वाढ"
          loading={isLoading}
        />
        <AnalyticsCard 
          title="Pending Settlements" 
          subtitle="प्रलंबित सेटलमेंट"
          value={formatCurrency(pendingSettlements)} 
          icon={Clock} 
          trend="-4.1%" 
          trendType="down"
          color="warning"
          marathiTrend="कमी"
          loading={isLoading}
        />
        <AnalyticsCard 
          title="TMT Distributed" 
          subtitle="वितरित टीएमटी"
          value={`${formatNumber(totalTmtDistributed)} MT`} 
          icon={Truck} 
          trend="+22.4%" 
          trendType="up"
          color="success"
          marathiTrend="वाढ"
          loading={isLoading}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Cash-Flow Trend Chart */}
        <Card className="col-span-4 border-none glass-3d rounded-[2.5rem] overflow-hidden">
          <CardHeader className="pb-2 pt-8 px-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-brand animate-pulse" />
                  <CardTitle className="text-xl font-black text-navy tracking-tight">Cash-Flow Dynamics <span className="text-slate-400 font-medium text-sm ml-1">कॅश-फ्लो</span></CardTitle>
                </div>
                <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">TMT Distribution vs. Fuel Payouts (टीएमटी विरुद्ध इंधन)</CardDescription>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-brand" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">TONNAGE (टन)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-navy" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">PAYOUTS (पेआउट्स)</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-8 pb-8 pt-4">
            {isLoading ? (
              <div className="w-full mt-6 h-[400px] flex items-end gap-2">
                {[...Array(7)].map((_, i) => (
                  <Skeleton key={i} className="flex-1" style={{ height: `${20 + Math.random() * 60}%` }} />
                ))}
              </div>
            ) : (
              <div key={isLoading ? 'loading' : 'ready'} className="w-full mt-6" style={{ minHeight: 0 }}>
                <ResponsiveContainer width="100%" height={400} debounce={50}>
                  <ComposedChart data={cashFlowData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="tonnageGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                      dy={10}
                    />
                    <YAxis 
                      yAxisId="left"
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                      tickFormatter={(value) => `${value} MT`}
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                      tickFormatter={(value) => `₹${value/1000}k`}
                    />
                    <Tooltip 
                      cursor={{ stroke: '#f1f5f9', strokeWidth: 2 }}
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white/95 backdrop-blur-md border border-slate-100 p-4 rounded-2xl shadow-2xl shadow-slate-200/50 min-w-[180px]">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">{label} (आजचा दिवस)</p>
                              <div className="space-y-3">
                                <div className="flex items-center justify-between gap-4">
                                  <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-brand" />
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Tonnage (वजन - टन)</span>
                                  </div>
                                  <span className="text-sm font-black text-navy">{payload[0].value} MT</span>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                  <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-navy" />
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Payouts (पेआउट्स)</span>
                                  </div>
                                  <span className="text-sm font-black text-navy">{formatCurrency(payload[1].value as number)}</span>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="tonnage" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={4}
                      fillOpacity={1} 
                      fill="url(#tonnageGradient)" 
                      animationDuration={1500}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="payouts" 
                      stroke="#0F172A" 
                      strokeWidth={4}
                      dot={{ fill: '#0F172A', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 8, strokeWidth: 0 }}
                      animationDuration={2000}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* MO Performance Leaderboard */}
        <Card className="col-span-3 border-none glass-3d rounded-[2.5rem] overflow-hidden">
          <CardHeader className="pb-3 pt-8 px-8 border-b border-slate-50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black text-navy tracking-tight">MO Leaderboard <span className="text-slate-400 font-medium text-sm ml-1">एमओ रँकिंग</span></CardTitle>
                <CardDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Marketing Officer Rankings (अधिकारी कामगिरी)</CardDescription>
              </div>
              <Badge className="bg-brand-soft text-brand font-black rounded-lg px-2 text-[9px] uppercase tracking-tighter animate-pulse">Live</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-xl" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                    <Skeleton className="h-8 w-16" />
                  </div>
                ))
              ) : moLeaderboard.map((mo, index) => (
                <div key={mo.name} className="flex items-center justify-between group p-3 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center font-black text-sm shadow-sm transition-transform group-hover:scale-110",
                      index === 0 ? "bg-amber-100 text-amber-600 shadow-amber-100" : 
                      index === 1 ? "bg-slate-100 text-slate-500 shadow-slate-100" :
                      index === 2 ? "bg-orange-100 text-orange-600 shadow-orange-100" :
                      "bg-slate-50 text-slate-400"
                    )}>
                      #{index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-black text-navy">{mo.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 -mt-1">{mo.marathiName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[8px] h-3.5 px-1 font-black uppercase text-brand border-brand/20 bg-brand/5">{mo.region}</Badge>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{mo.activeDealers} Dealers</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-navy">{formatNumber(mo.totalVolume)} MT</p>
                    <p className="text-[10px] text-brand font-bold uppercase tracking-tighter mt-0.5">Sales Performance (विक्री कामगिरी)</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Regional Performance Grid */}
      <Card className="shadow-2xl shadow-slate-200/50 border-none bg-white rounded-[2.5rem] overflow-hidden border border-white/50 backdrop-blur-sm">
        <CardHeader className="px-8 py-6 border-b border-slate-50 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-black text-navy tracking-tight">Regional Distribution <span className="text-slate-400 font-medium ml-2">प्रादेशिक वितरण</span></CardTitle>
            <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Financial performance across 6 regions (प्रादेशिक कामगिरी)</CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand transition-colors" onClick={() => toast.info("Regional Heatmap coming soon! (नकाशा लवकरच येईल)")}>Heatmap (नकाशा)</Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 divide-x divide-y divide-slate-50">
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="p-8 space-y-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-2xl" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                  <div className="flex justify-between">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-8 rounded-xl" />
                  </div>
                </div>
              ))
            ) : [...REGIONS, { value: 'Unmapped', label: 'Unmapped', marathi: 'अवर्गीकृत' }]
                .filter(region => selectedRegion === "All" || region.value === selectedRegion)
                .map(region => {
                const { volume, rewards } = processedData.regionalStats[region.value] || { volume: 0, rewards: 0 };
                
                // Only show unmapped if there's volume or specifically selected
                if (region.value === 'Unmapped' && volume === 0 && selectedRegion !== 'Unmapped') return null;

                return (
                  <div key={region.value} className="p-8 hover:bg-slate-50/50 transition-all group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-10 w-10 rounded-2xl flex items-center justify-center transition-all duration-300",
                          region.value === 'Unmapped' ? "bg-slate-100 group-hover:bg-slate-200" : "bg-brand/5 group-hover:bg-brand group-hover:rotate-6"
                        )}>
                          <MapPin className={cn(
                            "h-5 w-5 transition-colors",
                            region.value === 'Unmapped' ? "text-slate-400" : "text-brand group-hover:text-white"
                          )} />
                        </div>
                        <div>
                          <p className="font-black text-navy">{region.label}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{region.marathi}</p>
                        </div>
                      </div>
                      <Badge className={cn(
                        "border-none font-black text-[9px] uppercase tracking-tighter px-2",
                        region.value === 'Unmapped' ? "bg-slate-100 text-slate-500" : "bg-success-soft text-success"
                      )}>{region.value === 'Unmapped' ? 'Pending Mapping' : 'Operational (सुरू)'}</Badge>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-end mb-1.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">TMT Vol (टीएमटी)</span>
                          <span className="text-sm font-black text-navy">{formatNumber(volume)} MT</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                          <div className={cn(
                            "h-full rounded-full transition-all duration-1000 ease-out",
                            region.value === 'Unmapped' ? "bg-slate-300" : "bg-brand"
                          )} style={{ width: `${Math.min((volume/500)*100, 100)}%` }} />
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rewards (बक्षीस)</span>
                          <span className="text-sm font-black text-navy">{formatCurrency(rewards)}</span>
                        </div>
                        <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl text-slate-300 hover:text-brand hover:bg-brand-soft transition-all active:scale-90" aria-label={`View details for ${region.label}`}>
                          <ArrowUpRight className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function AnalyticsCard({ title, subtitle, value, icon: Icon, trend, trendType, color, marathiTrend, loading }: any) {
  const colorMap: any = {
    brand: "bg-brand shadow-brand/20",
    success: "bg-success shadow-success/20",
    warning: "bg-warning shadow-warning/20",
    navy: "bg-navy shadow-navy/20",
  }

  return (
    <Card className="relative overflow-hidden shadow-2xl shadow-slate-200/50 border-none group transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/80 rounded-[2rem] bg-white border border-white/50">
      <div className={cn(
        "absolute top-0 right-0 h-32 w-32 -mr-12 -mt-12 rounded-full opacity-[0.03] transition-transform group-hover:scale-150 duration-700",
        color === 'brand' ? "bg-brand" : color === 'success' ? "bg-success" : color === 'warning' ? "bg-warning" : "bg-navy"
      )} />
      
      <CardHeader className="pb-2 pt-8 px-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</p>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tighter leading-none">{subtitle}</p>
          </div>
          <div className={cn(
            "h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-6",
            colorMap[color] || colorMap.navy
          )}>
            <Icon className="h-7 w-7 text-white" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-8 pt-4 px-8">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        ) : (
          <div className="flex flex-col">
            <h3 className="text-3xl font-black text-navy tracking-tighter leading-none">{value}</h3>
            <div className="flex items-center gap-2 pt-4">
              <div className={cn(
                "flex items-center px-2 py-1 rounded-xl text-[10px] font-black transition-colors",
                trendType === 'up' ? "bg-success-soft text-success" : "bg-brand-soft text-brand"
              )}>
                {trendType === 'up' ? <TrendingUp className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                {trend} {marathiTrend && <span className="ml-1 opacity-70">({marathiTrend})</span>}
              </div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest opacity-60">Monthly Projection (मासिक अंदाज)</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
