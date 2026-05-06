import * as React from "react"
import { Search, Truck, Eye } from "lucide-react"
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
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog"
import { dealers as initialDealers } from "@/data/mockData"
import type { Dealer } from "@/data/mockData"
import { toast } from "sonner"

export function DealerManagement() {
  const [dealers, setDealers] = React.useState<Dealer[]>(initialDealers)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [selectedDealer, setSelectedDealer] = React.useState<Dealer | null>(null)
  const [allocationWeight, setAllocationWeight] = React.useState("")
  const [isModalOpen, setIsModalOpen] = React.useState(false)

  const filteredDealers = dealers.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAllocateStock = () => {
    if (!selectedDealer || !allocationWeight) {
      toast.error("कृपया सर्व माहिती भरा (Please fill all details)")
      return
    }

    const weight = parseFloat(allocationWeight)
    if (isNaN(weight) || weight <= 0) {
      toast.error("कृपया वैध वजन टाका (Please enter valid weight)")
      return
    }

    setDealers(prev => prev.map(d => 
      d.id === selectedDealer.id 
        ? { ...d, stockMT: d.stockMT + weight } 
        : d
    ))

    toast.success("Stock updated successfully (स्टॉक यशस्वीरित्या अपडेट झाला)")
    setIsModalOpen(false)
    setAllocationWeight("")
    setSelectedDealer(null)
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Dealer Management</h2>
          <p className="text-muted-foreground">Manage dealers and allocate TMT stock.</p>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Dealers List (डीलर यादी)</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search dealers..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dealer ID</TableHead>
                <TableHead>Dealer Name</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Available Stock (MT)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDealers.map((dealer) => (
                <TableRow key={dealer.id}>
                  <TableCell className="font-mono text-xs font-semibold">{dealer.id}</TableCell>
                  <TableCell className="font-semibold">{dealer.name}</TableCell>
                  <TableCell>{dealer.phone}</TableCell>
                  <TableCell>{dealer.location}</TableCell>
                  <TableCell>
                    <span className="font-bold text-primary">{dealer.stockMT} MT</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={dealer.status === 'Active' ? 'success' : 'secondary'}>
                      {dealer.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Dialog open={isModalOpen && selectedDealer?.id === dealer.id} onOpenChange={(open) => {
                      if (!open) {
                        setIsModalOpen(false)
                        setSelectedDealer(null)
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 px-2 text-xs"
                          onClick={() => {
                            setSelectedDealer(dealer)
                            setIsModalOpen(true)
                          }}
                        >
                          <Truck className="h-3 w-3 mr-1" />
                          Allocate
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Allocate Stock (स्टॉक वाटप करा)</DialogTitle>
                          <DialogDescription>
                            Assign new TMT stock to {dealer.name}.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="space-y-2">
                            <label className="text-sm font-semibold">Dealer Name</label>
                            <Input value={dealer.name} disabled />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-semibold">Weight in MT (वजन मेट्रिक टन मध्ये)</label>
                            <Input 
                              type="number" 
                              placeholder="e.g. 50" 
                              value={allocationWeight}
                              onChange={(e) => setAllocationWeight(e.target.value)}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                          <Button onClick={handleAllocateStock}>Update Stock (स्टॉक अपडेट करा)</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Eye className="h-4 w-4 text-slate-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredDealers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                    No dealers found.
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
