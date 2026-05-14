import * as React from "react"
import { Plus, Search, QrCode, Download, MapPin, Phone, User, Fuel, Filter, MoreHorizontal } from "lucide-react"
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
import { formatCurrency, cn, comingSoon } from "@/lib/utils"
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col space-y-1">
          <h2 className="text-3xl font-extrabold tracking-tight text-navy">Pump Management <span className="text-slate-400 font-medium">पंप व्यवस्थापन</span></h2>
          <p className="text-sm text-slate-500 font-medium">Manage payment collection points and partner petrol pumps.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="bg-white hover:bg-slate-50 border-slate-200 text-slate-600 font-bold rounded-xl h-10 px-4" onClick={() => comingSoon("Export")}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-brand hover:bg-brand-hover text-white font-bold rounded-xl h-10 px-4 shadow-lg shadow-brand/20">
                <Plus className="h-4 w-4 mr-2" />
                Add Pump
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl border-none shadow-2xl">
              <form onSubmit={handleAddPump}>
                <DialogHeader>
                  <DialogTitle className="text-xl font-extrabold text-navy">Register New Pump</DialogTitle>
                  <DialogDescription className="text-sm font-medium">Enter details of the new petrol pump partner.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-5 py-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                      <Fuel className="h-3 w-3 mr-2 text-brand" /> Pump Name
                    </label>
                    <Input 
                      placeholder="e.g. BPCL Kothrud" 
                      className="h-11 bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-brand/20 rounded-xl font-bold"
                      value={newPump.name}
                      onChange={(e) => setNewPump({...newPump, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                      <MapPin className="h-3 w-3 mr-2 text-brand" /> Location
                    </label>
                    <Input 
                      placeholder="e.g. Pune" 
                      className="h-11 bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-brand/20 rounded-xl font-bold"
                      value={newPump.location}
                      onChange={(e) => setNewPump({...newPump, location: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                        <User className="h-3 w-3 mr-2 text-brand" /> Owner Name
                      </label>
                      <Input 
                        placeholder="Name" 
                        className="h-11 bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-brand/20 rounded-xl font-bold text-sm"
                        value={newPump.ownerName}
                        onChange={(e) => setNewPump({...newPump, ownerName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                        <Phone className="h-3 w-3 mr-2 text-brand" /> Phone
                      </label>
                      <Input 
                        placeholder="10 digit" 
                        className="h-11 bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-brand/20 rounded-xl font-bold text-sm"
                        value={newPump.ownerPhone}
                        onChange={(e) => setNewPump({...newPump, ownerPhone: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button type="button" variant="ghost" className="rounded-xl font-bold text-slate-500" onClick={() => setIsAddModalOpen(false)}>Discard</Button>
                  <Button type="submit" className="rounded-xl font-bold bg-brand hover:bg-brand-hover shadow-lg shadow-brand/20">Save Pump</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="shadow-xl shadow-slate-200/40 border-none rounded-3xl overflow-hidden bg-white/50 backdrop-blur-sm">
        <CardHeader className="border-b border-slate-50 px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-xl font-extrabold text-navy">Partner Pumps</CardTitle>
              <CardDescription className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Active payment collection points</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-brand transition-colors" />
                <Input
                  placeholder="Search by name or location..."
                  className="pl-10 w-full md:w-[300px] h-10 bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-brand/20 rounded-xl transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-slate-200 text-slate-500" onClick={() => comingSoon("Filters")}>
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b border-slate-100">
                  <TableHead className="font-bold text-slate-400 uppercase text-[10px] tracking-widest px-8 h-12">Pump Identity</TableHead>
                  <TableHead className="font-bold text-slate-400 uppercase text-[10px] tracking-widest h-12">Location</TableHead>
                  <TableHead className="font-bold text-slate-400 uppercase text-[10px] tracking-widest h-12">Owner Contact</TableHead>
                  <TableHead className="font-bold text-slate-400 uppercase text-[10px] tracking-widest h-12">Pending Amt</TableHead>
                  <TableHead className="font-bold text-slate-400 uppercase text-[10px] tracking-widest h-12 text-center">QR Code</TableHead>
                  <TableHead className="font-bold text-slate-400 uppercase text-[10px] tracking-widest h-12 text-right px-8">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPumps.map((pump, index) => (
                  <TableRow key={pump.id} className={cn(
                    "group transition-colors border-b border-slate-50 last:border-none",
                    index % 2 === 0 ? "bg-white/30" : "bg-transparent"
                  )}>
                    <TableCell className="px-8 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-extrabold text-navy leading-tight">{pump.name}</span>
                        <span className="text-[10px] font-mono font-bold text-slate-400 mt-0.5 tracking-tighter">{pump.id}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-xs font-bold text-slate-600 bg-slate-100/50 w-fit px-2 py-0.5 rounded-lg">
                        <MapPin className="h-3 w-3 mr-1 text-slate-400" />
                        {pump.location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-700">{pump.ownerPhone}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{pump.ownerName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-extrabold text-warning">{formatCurrency(pump.pendingAmount)}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 rounded-lg text-brand font-bold text-[10px] uppercase tracking-widest hover:bg-brand/5 transition-all"
                        onClick={() => {
                          setSelectedPump(pump)
                          setIsQrModalOpen(true)
                        }}
                      >
                        <QrCode className="h-4 w-4 mr-1.5" />
                        View
                      </Button>
                    </TableCell>
                    <TableCell className="text-right px-8 space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 rounded-lg border-slate-200 text-slate-500 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 shadow-sm"
                        onClick={() => handleDownloadQr(pump)}
                      >
                        <Download className="h-3 w-3 mr-1.5" />
                        PDF
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-navy" onClick={() => comingSoon("Pump Actions")}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <div className="px-8 py-4 border-t border-slate-50 bg-slate-50/30">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-center">TMT Fuel Network • Management Dashboard</p>
        </div>
      </Card>

      {/* QR Code Modal */}
      <Dialog open={isQrModalOpen} onOpenChange={setIsQrModalOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl border-none shadow-2xl overflow-hidden p-0">
          <div className="bg-gradient-to-br from-brand to-brand-hover p-8 text-center text-white">
             <div className="h-16 w-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                <Fuel className="h-8 w-8 text-white" />
             </div>
             <DialogTitle className="text-2xl font-extrabold tracking-tight text-white">{selectedPump?.name}</DialogTitle>
             <DialogDescription className="text-white/80 font-medium text-xs uppercase tracking-widest mt-1">Payment Collection QR Code</DialogDescription>
          </div>
          <div className="flex flex-col items-center justify-center p-8 space-y-6 bg-white">
            <div className="w-64 h-64 bg-slate-50 p-6 border border-slate-100 rounded-[2.5rem] flex items-center justify-center relative overflow-hidden group shadow-inner">
              <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
              <QrCode className="w-44 h-44 text-navy relative z-10 drop-shadow-sm" />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
                 <span className="bg-white/90 backdrop-blur-sm border border-slate-200 px-3 py-1 rounded-full text-[10px] font-extrabold text-brand shadow-sm uppercase tracking-tighter">ID: {selectedPump?.id}</span>
              </div>
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-bold text-navy">Scan to settle outstanding balance</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Valid for all fuel partners</p>
            </div>
            <div className="flex w-full gap-3">
              <Button variant="outline" className="flex-1 rounded-xl font-bold h-11 border-slate-200" onClick={() => setIsQrModalOpen(false)}>Close</Button>
              <Button className="flex-1 rounded-xl font-bold h-11 bg-brand hover:bg-brand-hover shadow-lg shadow-brand/20" onClick={() => selectedPump && handleDownloadQr(selectedPump)}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
