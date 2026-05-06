import * as React from "react"
import { 
  FileSpreadsheet, 
  Search, 
  Filter
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { 
  transactions as initialTransactions, 
  dealers
} from "@/data/mockData"
import { formatCurrency, formatDate } from "@/lib/utils"
import { toast } from "sonner"
import * as XLSX from 'xlsx'

export function Reports() {
  const [data, setData] = React.useState(initialTransactions)
  const [filters, setFilters] = React.useState({
    fromDate: "",
    toDate: "",
    type: "All",
    dealer: "All",
    pump: "All"
  })

  const handleExportExcel = () => {
    try {
      const exportData = data.map(txn => ({
        'Transaction ID': txn.id,
        'Date': txn.date,
        'Type': txn.type,
        'Dealer': txn.dealer || '-',
        'Contractor': txn.contractor || '-',
        'Petrol Pump': txn.petrolPump || '-',
        'TMT MT': txn.tmtMT || 0,
        'Amount': txn.amount,
        'Status': txn.status
      }))

      const ws = XLSX.utils.json_to_sheet(exportData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Transactions")
      XLSX.writeFile(wb, "transactions-report.xlsx")
      toast.success("Report exported to Excel successfully!")
    } catch (error) {
      toast.error("Failed to export report")
      console.error(error)
    }
  }

  const applyFilters = () => {
    let filtered = [...initialTransactions]
    
    if (filters.type !== "All") {
      filtered = filtered.filter(t => t.type === filters.type)
    }
    if (filters.dealer !== "All") {
      filtered = filtered.filter(t => t.dealer === filters.dealer)
    }
    if (filters.pump !== "All") {
      filtered = filtered.filter(t => t.petrolPump === filters.pump)
    }
    if (filters.fromDate) {
      filtered = filtered.filter(t => t.date >= filters.fromDate)
    }
    if (filters.toDate) {
      filtered = filtered.filter(t => t.date <= filters.toDate)
    }

    setData(filtered)
    toast.success(`Found ${filtered.length} transactions`)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Reports (अहवाल)</h2>
          <p className="text-muted-foreground">Generate and export transaction reports.</p>
        </div>
        <Button 
          onClick={handleExportExcel}
          variant="outline" 
          className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 shadow-sm"
        >
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export Excel
        </Button>
      </div>

      {/* Filters */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Filter className="h-4 w-4 mr-2 text-primary" />
            Filters (गाळणी)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">From Date</label>
              <div className="relative">
                <Input 
                  type="date" 
                  className="h-9" 
                  value={filters.fromDate}
                  onChange={(e) => setFilters({...filters, fromDate: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">To Date</label>
              <Input 
                type="date" 
                className="h-9"
                value={filters.toDate}
                onChange={(e) => setFilters({...filters, toDate: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Transaction Type</label>
              <select 
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                value={filters.type}
                onChange={(e) => setFilters({...filters, type: e.target.value})}
              >
                <option value="All">All Types</option>
                <option value="Stock Allocation">Stock Allocation</option>
                <option value="Fuel Payout">Fuel Payout</option>
                <option value="Settlement">Settlement</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dealer</label>
              <select 
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                value={filters.dealer}
                onChange={(e) => setFilters({...filters, dealer: e.target.value})}
              >
                <option value="All">All Dealers</option>
                {dealers.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <Button className="w-full h-9 shadow-md shadow-primary/20" onClick={applyFilters}>
                Apply Filter (फिल्टर लावा)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card className="shadow-sm border-slate-200">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Dealer / Pump</TableHead>
                <TableHead>Contractor</TableHead>
                <TableHead>TMT MT</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((txn) => (
                <TableRow key={txn.id}>
                  <TableCell className="font-mono text-[10px] font-bold">{txn.id}</TableCell>
                  <TableCell className="whitespace-nowrap">{formatDate(txn.date)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal text-[10px]">{txn.type}</Badge>
                  </TableCell>
                  <TableCell className="font-semibold">{txn.dealer || txn.petrolPump}</TableCell>
                  <TableCell>{txn.contractor || '-'}</TableCell>
                  <TableCell className="font-bold">{txn.tmtMT ? `${txn.tmtMT} MT` : '-'}</TableCell>
                  <TableCell className="font-bold">{txn.amount > 0 ? formatCurrency(txn.amount) : '-'}</TableCell>
                  <TableCell>
                    <Badge variant={txn.status === 'Completed' || txn.status === 'Paid' ? 'success' : 'warning'}>
                      {txn.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-20">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Search className="h-10 w-10 mb-2 opacity-20" />
                      <p>No transactions match your filters.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
