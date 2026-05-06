import * as React from "react"
import { CheckCircle2, Clock, Wallet, Info } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { settlements as initialSettlements } from "@/data/mockData"
import type { Settlement } from "@/data/mockData"
import { formatCurrency, formatDate, cn } from "@/lib/utils"
import { toast } from "sonner"

export function Settlements() {
  const [settlements, setSettlements] = React.useState<Settlement[]>(initialSettlements)
  const [selectedSettlement, setSelectedSettlement] = React.useState<Settlement | null>(null)
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false)

  const totalPending = settlements.reduce((acc, s) => acc + (s.status === 'Pending' ? s.pendingAmount : 0), 0)
  const totalPumps = settlements.length
  const pendingPumps = settlements.filter(s => s.status === 'Pending').length

  const handleMarkAsPaid = () => {
    if (!selectedSettlement) return

    setSettlements(prev => prev.map(s => 
      s.id === selectedSettlement.id 
        ? { ...s, status: 'Paid', pendingAmount: 0, lastPaymentDate: new Date().toISOString().split('T')[0] } 
        : s
    ))

    toast.success("Settlement marked as paid (सेटलमेंट यशस्वीरित्या पूर्ण झाले)")
    setIsConfirmOpen(false)
    setSelectedSettlement(null)
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Settlement Screen</h2>
        <p className="text-muted-foreground">Monitor and settle pending fuel payouts with petrol pumps.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard 
          title="Total Pending Amount" 
          value={formatCurrency(totalPending)} 
          icon={Wallet} 
          color="amber"
          description="एकूण प्रलंबित रक्कम"
        />
        <SummaryCard 
          title="Paid This Month" 
          value={formatCurrency(125000)} 
          icon={CheckCircle2} 
          color="emerald"
          description="या महिन्यात दिलेले"
        />
        <SummaryCard 
          title="Total Pumps" 
          value={totalPumps} 
          icon={Info} 
          color="blue"
          description="एकूण पंप"
        />
        <SummaryCard 
          title="Pending Pumps" 
          value={pendingPumps} 
          icon={Clock} 
          color="rose"
          description="प्रलंबित पंप"
        />
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Settlement Details (सेटलमेंट तपशील)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pump Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Owner Phone</TableHead>
                <TableHead>Pending Amount</TableHead>
                <TableHead>Last Payment Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {settlements.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-semibold">{s.pumpName}</TableCell>
                  <TableCell>{s.location}</TableCell>
                  <TableCell>{s.ownerPhone}</TableCell>
                  <TableCell className={cn("font-bold", s.pendingAmount > 0 ? "text-amber-600" : "text-emerald-600")}>
                    {formatCurrency(s.pendingAmount)}
                  </TableCell>
                  <TableCell>{formatDate(s.lastPaymentDate)}</TableCell>
                  <TableCell>
                    <Badge variant={s.status === 'Paid' ? 'success' : 'warning'}>
                      {s.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {s.status === 'Pending' && (
                      <Button 
                        size="sm" 
                        className="h-8 bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-200"
                        onClick={() => {
                          setSelectedSettlement(s)
                          setIsConfirmOpen(true)
                        }}
                      >
                        Mark as Paid
                      </Button>
                    )}
                    {s.status === 'Paid' && (
                      <span className="text-xs text-emerald-600 font-bold flex items-center justify-end">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Paid
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Settlement (सेटलमेंटची पुष्टी करा)</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark this settlement as paid? This will reset the pending amount to ₹0.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2 mt-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Pump:</span>
              <span className="font-bold">{selectedSettlement?.pumpName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Amount:</span>
              <span className="font-bold text-amber-600">{selectedSettlement && formatCurrency(selectedSettlement.pendingAmount)}</span>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>Cancel</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleMarkAsPaid}>
              Confirm & Pay (पुष्टी करा आणि भरा)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function SummaryCard({ title, value, icon: Icon, color, description }: any) {
  const colorMap: Record<string, string> = {
    amber: "bg-amber-500",
    emerald: "bg-emerald-500",
    blue: "bg-blue-500",
    rose: "bg-rose-500"
  }

  const lightColorMap: Record<string, string> = {
    amber: "bg-amber-50",
    emerald: "bg-emerald-50",
    blue: "bg-blue-50",
    rose: "bg-rose-50"
  }

  const textColorMap: Record<string, string> = {
    amber: "text-amber-600",
    emerald: "text-emerald-600",
    blue: "text-blue-600",
    rose: "text-rose-600"
  }

  return (
    <Card className="shadow-sm border-slate-200 overflow-hidden relative">
      <div className={cn("absolute top-0 left-0 w-1 h-full", colorMap[color])} />
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", lightColorMap[color])}>
            <Icon className={cn("h-4 w-4", textColorMap[color])} />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        <p className="text-[10px] text-muted-foreground mt-1 font-medium">{description}</p>
      </CardContent>
    </Card>
  )
}
