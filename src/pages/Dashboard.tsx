import { 
  Users, 
  Construction, 
  Truck, 
  IndianRupee,
  ArrowUpRight,
  ArrowDownRight,
  Fuel,
  Wallet,
  MoreHorizontal,
  Download,
  Filter,
  Calendar,
  MapPin,
  ChevronDown,
  ShieldAlert
} from "lucide-react"
import * as React from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { REGIONS } from "@/lib/constants"
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts"
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
import { Button } from "@/components/ui/button"
import { dashboardStats, salesChartData, transactions } from "@/data/mockData"
import { formatCurrency, formatNumber, formatDate, cn, comingSoon } from "@/lib/utils"
import { toast } from "sonner"

export function Dashboard() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [selectedRegion, setSelectedRegion] = React.useState("All")

  const filteredTransactions = transactions.filter(txn => 
    selectedRegion === "All" || txn.region === selectedRegion
  )

  // Simulate regional stats
  const stats = selectedRegion === "All" ? dashboardStats : {
    activeDealers: Math.floor(dashboardStats.activeDealers / 7) + (selectedRegion.length % 5),
    totalContractors: Math.floor(dashboardStats.totalContractors / 7) + (selectedRegion.length % 10),
    totalTmtDistributed: Math.floor(dashboardStats.totalTmtDistributed / 7) + (selectedRegion.length * 100),
    totalFuelPayouts: Math.floor(dashboardStats.totalFuelPayouts / 7) + (selectedRegion.length * 5000),
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      {/* Missing PIN Alert */}
      {!profile?.walletPIN && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500 shadow-sm">
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
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl h-11 px-8 shadow-lg shadow-amber-200 shrink-0 transition-all active:scale-95"
          >
            Set PIN Now
          </Button>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col space-y-1">
          <h2 className="text-3xl font-extrabold tracking-tight text-navy">Dashboard <span className="text-slate-400 font-medium">डॅशबोर्ड</span></h2>
          <p className="text-sm text-slate-500 font-medium">Welcome back, Admin! Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Region Filter */}
          <div className="relative group">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="h-10 pl-9 pr-8 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl appearance-none outline-none focus:ring-2 focus:ring-brand/20 cursor-pointer text-xs shadow-sm hover:bg-slate-50 transition-colors"
            >
              <option value="All">All Regions</option>
              {REGIONS.map(region => (
                <option key={region.value} value={region.value}>{region.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            className="bg-white hover:bg-slate-50 border-slate-200 text-slate-600 font-bold rounded-xl h-10 px-4 shadow-sm"
            onClick={() => {
              try {
                const headers = ["Metric", "Value", "Trend"]
                const rows = [
                  ["Active Dealers", stats.activeDealers, "+12%"],
                  ["Total Contractors", stats.totalContractors, "+5%"],
                  ["TMT Distributed (MT)", stats.totalTmtDistributed, "+18%"],
                  ["Fuel Payouts (INR)", stats.totalFuelPayouts, "-4%"],
                ]
                
                rows.push(["", "", ""])
                rows.push(["Recent Activity", "", ""])
                rows.push(["Entity", "Type", "Amount/Weight", "Date", "Status", "Region"])
                
                filteredTransactions.forEach(txn => {
                  rows.push([
                    txn.dealer || txn.petrolPump || txn.contractor || "",
                    txn.type || "",
                    txn.tmtMT ? `${txn.tmtMT} MT` : `INR ${txn.amount}`,
                    formatDate(txn.date),
                    txn.status || "",
                    txn.region || "All"
                  ])
                })

                const csvContent = [headers, ...rows]
                  .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
                  .join("\n")
                const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
                const link = document.createElement("a")
                const url = URL.createObjectURL(blob)
                
                link.setAttribute("href", url)
                link.setAttribute("download", `Metaroll_Dashboard_${selectedRegion}_${new Date().toISOString().split('T')[0]}.csv`)
                link.style.visibility = 'hidden'
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                
                toast.success(`Dashboard data for ${selectedRegion} exported!`)
              } catch (error) {
                toast.error("Export failed")
                console.error(error)
              }
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button 
            size="sm" 
            className="bg-brand hover:bg-brand-hover text-white font-bold rounded-xl h-10 px-4 shadow-lg shadow-brand/20"
            onClick={() => comingSoon("Calendar Filter")}
          >
            <Calendar className="h-4 w-4 mr-2" />
            May 2026
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Active Dealers" 
          subtitle="सक्रिय डीलर"
          value={stats.activeDealers} 
          icon={Users} 
          trend="+12%" 
          trendType="up"
          color="brand"
        />
        <StatCard 
          title="Total Contractors" 
          subtitle="कंत्राटदार"
          value={stats.totalContractors} 
          icon={Construction} 
          trend="+5%" 
          trendType="up"
          color="navy"
        />
        <StatCard 
          title="TMT Distributed" 
          subtitle="वितरित टीएमटी"
          value={`${formatNumber(stats.totalTmtDistributed)} MT`} 
          icon={Truck} 
          trend="+18%" 
          trendType="up"
          color="success"
        />
        <StatCard 
          title="Fuel Payouts" 
          subtitle="इंधन पेआउट"
          value={formatCurrency(stats.totalFuelPayouts)} 
          icon={IndianRupee} 
          trend="-2.4%" 
          trendType="down"
          color="warning"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Sales Chart */}
        <Card className="col-span-4 min-w-0 shadow-sm border-slate-200/60 bg-white/50 backdrop-blur-sm overflow-hidden rounded-3xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg font-bold text-navy">मागील ७ दिवसांतील विक्री</CardTitle>
                <CardDescription className="text-xs font-medium">Sales performance for the last 7 days (TMT MT)</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => comingSoon("More Actions")}>
                  <MoreHorizontal className="h-4 w-4 text-slate-400" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pl-2 pr-4 pb-4">
            {/* min-h-0 + explicit pixel height avoids Recharts -1/-1 ResizeObserver race */}
            <div className="w-full mt-4" style={{ minHeight: 0 }}>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={salesChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTmt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                    tickFormatter={(value) => `${value} MT`}
                    dx={-10}
                  />
                  <Tooltip 
                    cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 2, strokeDasharray: '4 4' }}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white/90 backdrop-blur-md border border-slate-100 p-3 rounded-2xl shadow-xl shadow-slate-200/50">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-brand" />
                              <p className="text-sm font-extrabold text-navy">{payload[0].value} MT</p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="tmt" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorTmt)" 
                    animationDuration={1500}
                    activeDot={{ r: 6, strokeWidth: 0, fill: 'hsl(var(--primary))' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="col-span-3 shadow-sm border-slate-200/60 bg-white/50 backdrop-blur-sm rounded-3xl overflow-hidden">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-navy">Quick Activities</CardTitle>
                <CardDescription className="text-xs font-medium text-slate-500">Latest financial movements</CardDescription>
              </div>
              <Button variant="ghost" className="text-xs font-bold text-brand hover:bg-brand-soft rounded-lg px-2" onClick={() => comingSoon("View All Transactions")}>View All</Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4 p-0">
            <div className="divide-y divide-slate-50 px-4">
              {filteredTransactions.slice(0, 5).map((txn) => (
                <div key={txn.id} className="flex items-center justify-between py-4 group cursor-pointer transition-colors hover:bg-slate-50/50 px-2 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "h-10 w-10 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110",
                      txn.type === 'Stock Allocation' ? "bg-brand-soft text-brand shadow-sm shadow-brand-soft" : 
                      txn.type === 'Fuel Payout' ? "bg-warning-soft text-warning shadow-sm shadow-warning-soft" : 
                      "bg-success-soft text-success shadow-sm shadow-success-soft"
                    )}>
                      {txn.type === 'Stock Allocation' ? <Truck className="h-5 w-5" /> : txn.type === 'Fuel Payout' ? <Fuel className="h-5 w-5" /> : <Wallet className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-navy tracking-tight">{txn.dealer || txn.contractor || txn.petrolPump}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">{txn.type} • {formatDate(txn.date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-extrabold text-navy">
                      {txn.tmtMT ? `${txn.tmtMT} MT` : formatCurrency(txn.amount)}
                    </p>
                    <Badge className={cn(
                      "text-[9px] h-4 px-1.5 font-bold uppercase border-none tracking-tighter mt-1",
                      txn.status === 'Completed' || txn.status === 'Paid' 
                        ? "bg-success-soft text-success hover:bg-success-soft" 
                        : "bg-warning-soft text-warning hover:bg-warning-soft"
                    )}>
                      {txn.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Transactions Table */}
      <Card className="shadow-sm border-slate-200/60 bg-white/50 backdrop-blur-sm rounded-3xl overflow-hidden border-none shadow-xl shadow-slate-200/40">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 px-6 py-5">
          <div className="space-y-1">
            <CardTitle className="text-xl font-extrabold text-navy">Detailed Activity <span className="text-slate-400 font-medium ml-2">तपशीलवार क्रियाकलाप</span></CardTitle>
            <CardDescription className="text-xs font-semibold text-slate-500">Comprehensive log of all system transactions</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="h-9 pl-9 pr-8 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl appearance-none outline-none focus:ring-2 focus:ring-brand/20 cursor-pointer text-xs shadow-sm hover:bg-slate-50 transition-colors"
              >
                <option value="All">All Regions</option>
                {REGIONS.map(region => (
                  <option key={region.value} value={region.value}>{region.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
            </div>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-slate-100" onClick={() => comingSoon("More Actions")}>
              <MoreHorizontal className="h-5 w-5 text-slate-500" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b border-slate-100">
                  <TableHead className="font-bold text-slate-400 uppercase text-[10px] tracking-widest px-6 h-12 text-center">Date</TableHead>
                  <TableHead className="font-bold text-slate-400 uppercase text-[10px] tracking-widest h-12">Entity Name</TableHead>
                  <TableHead className="font-bold text-slate-400 uppercase text-[10px] tracking-widest h-12">Type</TableHead>
                  <TableHead className="font-bold text-slate-400 uppercase text-[10px] tracking-widest h-12 text-right">TMT MT</TableHead>
                  <TableHead className="font-bold text-slate-400 uppercase text-[10px] tracking-widest h-12 text-right">Amount</TableHead>
                  <TableHead className="font-bold text-slate-400 uppercase text-[10px] tracking-widest h-12 text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((txn, index) => (
                  <TableRow key={txn.id} className={cn(
                    "group transition-colors border-b border-slate-50 last:border-none",
                    index % 2 === 0 ? "bg-white/30" : "bg-transparent"
                  )}>
                    <TableCell className="px-6 py-4">
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-bold text-navy">{formatDate(txn.date).split(',')[0]}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{formatDate(txn.date).split(',')[1]}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-extrabold text-navy">{txn.dealer || txn.petrolPump}</span>
                          <Badge variant="outline" className="text-[8px] h-3.5 px-1 border-slate-100 text-slate-400 font-black uppercase">{txn.region || 'All'}</Badge>
                        </div>
                        {txn.contractor && (
                          <div className="flex items-center mt-0.5">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mr-1">FOR:</span>
                            <span className="text-[11px] text-brand font-bold">{txn.contractor}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(
                        "font-bold text-[9px] uppercase tracking-tighter px-2 border-slate-200",
                        txn.type === 'Stock Allocation' ? "text-brand bg-brand-soft" : 
                        txn.type === 'Fuel Payout' ? "text-warning bg-warning-soft" : 
                        "text-success bg-success-soft"
                      )}>
                        {txn.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-sm font-bold text-navy">{txn.tmtMT ? `${txn.tmtMT} MT` : '-'}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-sm font-extrabold text-navy">{txn.amount > 0 ? formatCurrency(txn.amount) : '-'}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={cn(
                        "text-[9px] px-2 py-0.5 font-bold uppercase border-none tracking-tighter",
                        txn.status === 'Completed' || txn.status === 'Paid' 
                          ? "bg-success-soft text-success hover:bg-success-soft" 
                          : "bg-warning-soft text-warning hover:bg-warning-soft"
                      )}>
                        {txn.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <div className="px-6 py-4 border-t border-slate-50 flex items-center justify-between bg-slate-50/30">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Showing {filteredTransactions.length} activities {selectedRegion !== "All" && `in ${selectedRegion}`}</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 rounded-lg border-slate-200 text-[10px] font-bold uppercase tracking-widest px-3 disabled:opacity-50" onClick={() => comingSoon("Previous Page")} disabled>Previous</Button>
            <Button variant="outline" size="sm" className="h-8 rounded-lg border-slate-200 text-[10px] font-bold uppercase tracking-widest px-3" onClick={() => comingSoon("Next Page")}>Next</Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

function StatCard({ title, subtitle, value, icon: Icon, trend, trendType, color }: any) {
  const colorMap: any = {
    brand: "from-[#FF2B45] to-[#E11D38] shadow-brand/20",
    success: "from-[#16A34A] to-[#15803D] shadow-success/20",
    warning: "from-[#F59E0B] to-[#D97706] shadow-warning/20",
    navy: "from-[#0F172A] to-[#1E293B] shadow-navy/20",
  }

  return (
    <Card className="relative overflow-hidden shadow-xl shadow-slate-200/40 border-none group transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/60 rounded-3xl">
      <div className={cn(
        "absolute top-0 right-0 h-24 w-24 -mr-8 -mt-8 rounded-full opacity-[0.03] transition-transform group-hover:scale-150 duration-500",
        color === 'brand' ? "bg-brand" : color === 'success' ? "bg-success" : color === 'warning' ? "bg-warning" : "bg-navy"
      )} />
      
      <CardHeader className="pb-2 pt-6 px-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">{title}</p>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tighter leading-none">{subtitle}</p>
          </div>
          <div className={cn(
            "h-12 w-12 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6",
            colorMap[color] || colorMap.blue
          )}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-6 pt-2 px-6">
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <h3 className="text-3xl font-extrabold text-navy tracking-tight leading-none">{value}</h3>
            <div className="flex items-center gap-1.5 pt-2">
              <div className={cn(
                "flex items-center px-1.5 py-0.5 rounded-lg text-[10px] font-bold transition-colors",
                trendType === 'up' ? "bg-success-soft text-success" : "bg-brand-soft text-brand"
              )}>
                {trendType === 'up' ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                {trend}
              </div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">vs last month</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
