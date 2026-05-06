import { 
  Users, 
  Construction, 
  Truck, 
  IndianRupee,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Fuel,
  Wallet
} from "lucide-react"
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
import { dashboardStats, salesChartData, transactions } from "@/data/mockData"
import { formatCurrency, formatNumber, formatDate, cn } from "@/lib/utils"

export function Dashboard() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard डॅशबोर्ड</h2>
        <p className="text-muted-foreground">Welcome to TMT Fuel management overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Active Dealers" 
          subtitle="एकूण सक्रिय डीलर"
          value={dashboardStats.activeDealers} 
          icon={Users} 
          trend="+12%" 
          trendType="up"
        />
        <StatCard 
          title="Total Contractors" 
          subtitle="एकूण कंत्राटदार"
          value={dashboardStats.totalContractors} 
          icon={Construction} 
          trend="+5%" 
          trendType="up"
        />
        <StatCard 
          title="Total TMT Distributed" 
          subtitle="एकूण वितरित टीएमटी"
          value={`${formatNumber(dashboardStats.totalTmtDistributed)} MT`} 
          icon={Truck} 
          trend="+18%" 
          trendType="up"
        />
        <StatCard 
          title="Total Fuel Payouts" 
          subtitle="एकूण इंधन पेआउट"
          value={formatCurrency(dashboardStats.totalFuelPayouts)} 
          icon={IndianRupee} 
          trend="-2%" 
          trendType="down"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Sales Chart */}
        <Card className="col-span-4 shadow-sm border-slate-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">मागील ७ दिवसांतील विक्री</CardTitle>
                <CardDescription>Sales graph for the last 7 days (TMT MT)</CardDescription>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesChartData}>
                  <defs>
                    <linearGradient id="colorTmt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickFormatter={(value) => `${value} MT`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '8px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="tmt" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorTmt)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="col-span-3 shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Recent Transactions</CardTitle>
            <CardDescription>Latest activities in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.slice(0, 5).map((txn) => (
                <div key={txn.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "h-9 w-9 rounded-full flex items-center justify-center text-white",
                      txn.type === 'Stock Allocation' ? "bg-blue-500" : txn.type === 'Fuel Payout' ? "bg-amber-500" : "bg-emerald-500"
                    )}>
                      {txn.type === 'Stock Allocation' ? <Truck className="h-4 w-4" /> : txn.type === 'Fuel Payout' ? <Fuel className="h-4 w-4" /> : <Wallet className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{txn.dealer || txn.contractor || txn.petrolPump}</p>
                      <p className="text-[10px] text-slate-500">{txn.type} • {formatDate(txn.date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">
                      {txn.tmtMT ? `${txn.tmtMT} MT` : formatCurrency(txn.amount)}
                    </p>
                    <Badge variant={txn.status === 'Completed' || txn.status === 'Paid' ? 'success' : 'warning'} className="text-[10px] h-4 px-1">
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
      <Card className="shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle>Recent Activity Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead>Date</TableHead>
                <TableHead>Dealer / Pump</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>TMT MT</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((txn) => (
                <TableRow key={txn.id} className="group">
                  <TableCell className="font-medium">{formatDate(txn.date)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold">{txn.dealer || txn.petrolPump}</span>
                      <span className="text-[10px] text-muted-foreground">{txn.contractor && `For: ${txn.contractor}`}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal">{txn.type}</Badge>
                  </TableCell>
                  <TableCell>{txn.tmtMT ? `${txn.tmtMT} MT` : '-'}</TableCell>
                  <TableCell>{txn.amount > 0 ? formatCurrency(txn.amount) : '-'}</TableCell>
                  <TableCell>
                    <Badge variant={txn.status === 'Completed' || txn.status === 'Paid' ? 'success' : 'warning'}>
                      {txn.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({ title, subtitle, value, icon: Icon, trend, trendType }: any) {
  return (
    <Card className="shadow-sm border-slate-200 hover:shadow-md transition-shadow group">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <p className="text-[10px] text-muted-foreground/70 uppercase tracking-wider">{subtitle}</p>
        </div>
        <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center mt-1">
          <span className={cn(
            "text-xs font-semibold flex items-center mr-1",
            trendType === 'up' ? "text-emerald-600" : "text-rose-600"
          )}>
            {trendType === 'up' ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
            {trend}
          </span>
          <span className="text-[10px] text-muted-foreground">vs last month</span>
        </div>
      </CardContent>
    </Card>
  )
}
