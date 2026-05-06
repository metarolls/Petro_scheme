import * as React from "react"
import { Plus, Search, QrCode, Download, MapPin, Phone, User, Fuel } from "lucide-react"
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
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog"
import { petrolPumps as initialPumps } from "@/data/mockData"
import type { PetrolPump } from "@/data/mockData"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"

export function PumpManagement() {
  const [pumps, setPumps] = React.useState<PetrolPump[]>(initialPumps)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)
  const [isQrModalOpen, setIsQrModalOpen] = React.useState(false)
  const [selectedPump, setSelectedPump] = React.useState<PetrolPump | null>(null)

  // New Pump Form State
  const [newPump, setNewPump] = React.useState({
    name: "",
    location: "",
    ownerName: "",
    ownerPhone: ""
  })

  const filteredPumps = pumps.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddPump = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPump.name || !newPump.location || !newPump.ownerName || !newPump.ownerPhone) {
      toast.error("सर्व फील्ड्स भरणे आवश्यक आहे (All fields are required)")
      return
    }

    const pump: PetrolPump = {
      id: `PMP-00${pumps.length + 1}`,
      name: newPump.name,
      location: newPump.location,
      ownerName: newPump.ownerName,
      ownerPhone: newPump.ownerPhone,
      pendingAmount: 0,
      qrCode: `QR_PMP_00${pumps.length + 1}`,
      status: 'Active'
    }

    setPumps([...pumps, pump])
    setIsAddModalOpen(false)
    setNewPump({ name: "", location: "", ownerName: "", ownerPhone: "" })
    toast.success("Petrol Pump added successfully (पेट्रोल पंप जोडला गेला)")
  }

  const handleDownloadQr = (pump: PetrolPump) => {
    toast.success(`QR Code for ${pump.name} downloaded!`)
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Merchant / Petrol Pump Management</h2>
          <p className="text-muted-foreground">Manage payment collection points and QR codes.</p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-lg shadow-primary/20">
              <Plus className="h-4 w-4 mr-2" />
              Add Pump (पंप जोडा)
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleAddPump}>
              <DialogHeader>
                <DialogTitle>Add New Petrol Pump (नवीन पंप जोडा)</DialogTitle>
                <DialogDescription>Enter details of the new petrol pump partner.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center">
                    <Fuel className="h-3 w-3 mr-2" /> Pump Name
                  </label>
                  <Input 
                    placeholder="e.g. BPCL Kothrud" 
                    value={newPump.name}
                    onChange={(e) => setNewPump({...newPump, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center">
                    <MapPin className="h-3 w-3 mr-2" /> Location
                  </label>
                  <Input 
                    placeholder="e.g. Pune" 
                    value={newPump.location}
                    onChange={(e) => setNewPump({...newPump, location: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold flex items-center">
                      <User className="h-3 w-3 mr-2" /> Owner Name
                    </label>
                    <Input 
                      placeholder="Name" 
                      value={newPump.ownerName}
                      onChange={(e) => setNewPump({...newPump, ownerName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold flex items-center">
                      <Phone className="h-3 w-3 mr-2" /> Phone
                    </label>
                    <Input 
                      placeholder="10 digit" 
                      value={newPump.ownerPhone}
                      onChange={(e) => setNewPump({...newPump, ownerPhone: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                <Button type="submit">Save Pump (जतन करा)</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Petrol Pumps List (पंपांची यादी)</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or location..."
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
                <TableHead>Pump ID</TableHead>
                <TableHead>Pump Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Owner Phone</TableHead>
                <TableHead>Pending Amount</TableHead>
                <TableHead>QR Code</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPumps.map((pump) => (
                <TableRow key={pump.id}>
                  <TableCell className="font-mono text-xs font-semibold">{pump.id}</TableCell>
                  <TableCell className="font-semibold">{pump.name}</TableCell>
                  <TableCell>{pump.location}</TableCell>
                  <TableCell>{pump.ownerPhone}</TableCell>
                  <TableCell className="font-bold text-amber-600">{formatCurrency(pump.pendingAmount)}</TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-primary hover:bg-primary/5"
                      onClick={() => {
                        setSelectedPump(pump)
                        setIsQrModalOpen(true)
                      }}
                    >
                      <QrCode className="h-4 w-4 mr-1" />
                      View QR
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8"
                      onClick={() => handleDownloadQr(pump)}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      QR
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* QR Code Modal */}
      <Dialog open={isQrModalOpen} onOpenChange={setIsQrModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">{selectedPump?.name}</DialogTitle>
            <DialogDescription className="text-center">Payment Collection QR Code</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6 space-y-4">
            <div className="w-64 h-64 bg-white p-4 border-4 border-slate-100 rounded-2xl flex items-center justify-center relative overflow-hidden group">
              <div className="grid grid-cols-4 gap-2 opacity-10 absolute inset-0 p-4">
                {Array.from({length: 16}).map((_, i) => (
                  <div key={i} className="bg-slate-900 rounded-sm" />
                ))}
              </div>
              <QrCode className="w-48 h-48 text-slate-900 relative z-10" />
              <div className="absolute inset-0 bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 backdrop-blur-[1px]">
                 <span className="bg-white px-3 py-1 rounded-full text-xs font-bold text-primary shadow-sm">ID: {selectedPump?.id}</span>
              </div>
            </div>
            <p className="text-sm font-semibold text-slate-500">Scan to pay for Fuel Payout</p>
            <Button className="w-full" onClick={() => selectedPump && handleDownloadQr(selectedPump)}>
              <Download className="h-4 w-4 mr-2" />
              Download QR Code (डाउनलोड करा)
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
