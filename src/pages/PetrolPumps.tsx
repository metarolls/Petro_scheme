import * as React from "react"
import { db } from "@/lib/firebase"
import { collection, onSnapshot, query, orderBy, setDoc, serverTimestamp, deleteDoc, doc, updateDoc, runTransaction } from "firebase/firestore"
import { Fuel, MapPin, User, Phone, Navigation, Droplets, Plus, Search, Loader2, ExternalLink, Activity, Pencil, Trash2, Filter, ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { REGIONS, type RegionValue } from "@/lib/constants"

interface PetrolPump {
  id: string;
  name: string;
  pumpName?: string; // Support legacy naming
  location: string;
  city: RegionValue | string;
  latitude: string;
  longitude: string;
  ownerName: string;
  ownerPhone: string;
  mobileNumber?: string; // Support legacy naming
  pendingAmount: number;
  walletBalance: number;
  totalFuelDispensed: number;
  status: 'Active' | 'Inactive';
  createdAt?: any;
}

export default function PetrolPumps() {
  const [pumps, setPumps] = React.useState<PetrolPump[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false)
  const [isSettleModalOpen, setIsSettleModalOpen] = React.useState(false)
  const [editingPump, setEditingPump] = React.useState<PetrolPump | null>(null)
  const [settlingPump, setSettlingPump] = React.useState<PetrolPump | null>(null)
  const [settlementAmount, setSettlementAmount] = React.useState("")
  const [selectedRegion, setSelectedRegion] = React.useState("All")
  const [isSaving, setIsSaving] = React.useState(false)
  const [newPump, setNewPump] = React.useState({
    name: "",
    location: "",
    city: "Nashik",
    latitude: "",
    longitude: "",
    ownerName: "",
    ownerPhone: ""
  })

  React.useEffect(() => {
    const q = query(collection(db, "merchant"), orderBy("createdAt", "desc"))
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pumpData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Normalize legacy fields
          name: data.name || data.pumpName || 'Unknown Pump',
          ownerPhone: data.ownerPhone || data.mobileNumber || ''
        } as PetrolPump;
      });
      
      setPumps(pumpData)
      setLoading(false)
    }, (error) => {
      console.error("Error fetching pumps:", error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleAddPump = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPump.name || !newPump.location || !newPump.ownerName || !newPump.ownerPhone || !newPump.city) {
      toast.error("कृपया सर्व माहिती भरा (Please fill all fields)")
      return
    }

    // Basic Lat/Long validation
    if (newPump.latitude && isNaN(Number(newPump.latitude))) {
      toast.error("Invalid Latitude value")
      return
    }
    if (newPump.longitude && isNaN(Number(newPump.longitude))) {
      toast.error("Invalid Longitude value")
      return
    }

    setIsSaving(true)
    try {
      await setDoc(doc(db, "merchant", newPump.ownerPhone), {
        ...newPump,
        status: "Active",
        pendingAmount: 0,
        walletBalance: 0,
        totalFuelDispensed: 0,
        createdAt: serverTimestamp()
      })
      toast.success("Petrol Pump registered successfully!")
      setIsAddModalOpen(false)
      setNewPump({ name: "", location: "", city: "Nashik", latitude: "", longitude: "", ownerName: "", ownerPhone: "" })
    } catch (error: any) {
      toast.error("Failed to add pump: " + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdatePump = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPump) return

    setIsSaving(true)
    try {
      const { id, ...data } = editingPump
      await updateDoc(doc(db, "merchant", id), data)
      toast.success("Partner details updated successfully!")
      setIsEditModalOpen(false)
      setEditingPump(null)
    } catch (error: any) {
      toast.error("Failed to update: " + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeletePump = async (id: string) => {
    if (!confirm("Are you sure you want to remove this partner?")) return
    
    try {
      await deleteDoc(doc(db, "merchant", id))
      toast.success("Partner removed successfully")
    } catch (error: any) {
      toast.error("Failed to delete: " + error.message)
    }
  }

  const handleSettlement = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!settlingPump || !settlementAmount) return

    const amount = parseFloat(settlementAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error("Invalid amount")
      return
    }

    if (amount > (settlingPump.walletBalance || 0)) {
      toast.error("Insufficient balance for settlement")
      return
    }

    setIsSaving(true)
    try {
      await runTransaction(db, async (transaction) => {
        const pumpRef = doc(db, "merchant", settlingPump.id)
        const historyRef = doc(collection(db, "wallet_history"))

        const pumpDoc = await transaction.get(pumpRef)
        if (!pumpDoc.exists()) throw new Error("Pump not found")

        const currentBalance = pumpDoc.data().walletBalance || 0
        if (currentBalance < amount) throw new Error("Insufficient balance")

        // 1. Deduct from Pump Balance
        transaction.update(pumpRef, {
          walletBalance: currentBalance - amount
        })

        // 2. Record in history
        transaction.set(historyRef, {
          type: 'settlement',
          status: 'completed',
          sourceId: 'COMPANY',
          sourceName: 'Metaroll Rewards',
          destinationId: settlingPump.id,
          destinationName: settlingPump.name,
          amount: amount,
          timestamp: serverTimestamp()
        })
      })

      toast.success(`Settlement of ₹${amount} recorded successfully`)
      setIsSettleModalOpen(false)
      setSettlingPump(null)
      setSettlementAmount("")
    } catch (error: any) {
      console.error("Settlement Error:", error)
      toast.error("Settlement failed: " + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const filteredPumps = pumps.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.pumpName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.location && p.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.city && p.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
      p.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.ownerPhone.includes(searchTerm) ||
      p.mobileNumber?.includes(searchTerm);
    
    const matchesRegion = selectedRegion === "All" || p.city === selectedRegion;
    
    return matchesSearch && matchesRegion;
  })

  const cityStats = {
    Nashik: pumps.filter(p => p.city === "Nashik").length,
    Jalna: pumps.filter(p => p.city === "Jalna").length,
    Jalgaon: pumps.filter(p => p.city === "Jalgaon").length,
    Ahmednagar: pumps.filter(p => p.city === "Ahmednagar").length,
    Sambhajinagar: pumps.filter(p => p.city === "Sambhajinagar").length,
    Akluj: pumps.filter(p => p.city === "Akluj").length,
    Solapur: pumps.filter(p => p.city === "Solapur").length,
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-navy">
            Fuel Partners <span className="text-brand/40 font-medium">पंप डिरेक्टरी</span>
          </h1>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Monitor and manage fuel distribution network across Maharashtra.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group flex-1 md:flex-none">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-red-500 transition-colors" />
            <Input
              type="text"
              placeholder="Search pumps..."
              className="w-full md:w-[300px] h-12 pl-12 bg-white/80 border-none shadow-lg shadow-slate-200/50 rounded-2xl font-bold focus-visible:ring-2 focus-visible:ring-red-500/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="h-12 pl-12 pr-10 bg-white/80 border-none shadow-lg shadow-slate-200/50 rounded-2xl font-bold appearance-none outline-none focus:ring-2 focus:ring-brand/20 cursor-pointer text-sm text-navy min-w-[160px] transition-all hover:shadow-xl"
            >
              <option value="All">All Regions</option>
              {REGIONS.map(region => (
                <option key={region.value} value={region.value}>{region.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>

          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="h-12 bg-red-500 hover:bg-red-600 text-white font-black rounded-2xl px-6 shadow-xl shadow-red-500/20 uppercase tracking-widest text-xs shrink-0"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Partner
          </Button>
        </div>
      </div>

      {/* Map Overview Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative group h-[400px] rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-200/50 border border-white/50"
      >
        {/* Placeholder Map - Styled SVG Background */}
        <div className="absolute inset-0 bg-[#f8fafc] flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 50L150 80L200 60L250 100L300 90L400 150L500 130L600 180L700 160L750 200V350L600 320L500 360L400 330L300 370L200 340L100 380V50Z" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="2" />
            <circle cx="200" cy="150" r="100" fill="url(#grad1)" opacity="0.1" />
            <defs>
              <radialGradient id="grad1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="1" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>
          
          {/* Map Markers */}
          <div className="relative z-10 w-full h-full p-20">
             {/* Nashik */}
             <MapMarker label="Nashik" x="30%" y="40%" count={cityStats.Nashik} color="bg-red-500" />
             {/* Jalna */}
             <MapMarker label="Jalna" x="55%" y="45%" count={cityStats.Jalna} color="bg-indigo-600" />
             {/* Jalgaon */}
             <MapMarker label="Jalgaon" x="70%" y="30%" count={cityStats.Jalgaon} color="bg-slate-700" />
             {/* Ahmednagar */}
             <MapMarker label="Ahmednagar" x="40%" y="60%" count={cityStats.Ahmednagar} color="bg-amber-500" />
             {/* Sambhajinagar */}
             <MapMarker label="Chhatrapati Sambhajinagar" x="50%" y="40%" count={cityStats.Sambhajinagar} color="bg-emerald-500" />
             {/* Akluj */}
             <MapMarker label="Akluj" x="45%" y="80%" count={cityStats.Akluj} color="bg-blue-500" />
             {/* Solapur */}
             <MapMarker label="Solapur" x="60%" y="85%" count={cityStats.Solapur} color="bg-purple-500" />
          </div>

          <div className="absolute bottom-10 left-10 p-6 bg-white/90 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-2xl max-w-xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-red-500/10 rounded-2xl flex items-center justify-center">
                <Navigation className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Network Coverage</span>
                <span className="text-2xl font-black text-slate-900 leading-none">{pumps.length} <span className="text-xs font-bold text-slate-400 ml-1 uppercase">Partners</span></span>
              </div>
            </div>
            <p className="text-[11px] font-bold text-slate-500 leading-relaxed">
              Monitoring active distribution points across <span className="text-slate-900">Maharashtra’s</span> key industrial corridors.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Grid Section */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => <LoadingCard key={i} />)}
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredPumps.map((pump) => (
              <PumpCard 
                key={pump.id} 
                pump={pump} 
                onEdit={() => {
                  setEditingPump(pump)
                  setIsEditModalOpen(true)
                }}
                onDelete={() => handleDeletePump(pump.id)}
                onSettle={() => {
                  setSettlingPump(pump)
                  setIsSettleModalOpen(true)
                }}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Add Pump Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden max-w-lg bg-white">
          <div className="bg-navy p-8 text-white space-y-2">
            <DialogTitle className="text-3xl font-black">Partner Registration</DialogTitle>
            <DialogDescription className="text-white/60 font-bold uppercase tracking-[0.1em] text-[10px]">Onboard a new fuel distribution point</DialogDescription>
          </div>
          
          <form onSubmit={handleAddPump} className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormInput label="Pump Name" value={newPump.name} onChange={v => setNewPump({...newPump, name: v})} icon={Fuel} placeholder="e.g. BPCL Kothrud" />
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-brand" /> City
                  </label>
                  <select 
                    value={newPump.city} 
                    onChange={(e) => setNewPump({...newPump, city: e.target.value})}
                    className="w-full h-14 bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-brand/20 rounded-2xl font-bold px-6 outline-none appearance-none"
                  >
                    {REGIONS.map(region => (
                      <option key={region.value} value={region.value}>
                        {region.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <FormInput label="Full Address" value={newPump.location} onChange={v => setNewPump({...newPump, location: v})} icon={MapPin} placeholder="e.g. Near Station, Nashik" />
              <div className="grid grid-cols-2 gap-4">
                <FormInput label="Latitude" value={newPump.latitude} onChange={v => setNewPump({...newPump, latitude: v})} icon={Navigation} placeholder="19.9975" />
                <FormInput label="Longitude" value={newPump.longitude} onChange={v => setNewPump({...newPump, longitude: v})} icon={Navigation} placeholder="73.7898" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormInput label="Owner Name" value={newPump.ownerName} onChange={v => setNewPump({...newPump, ownerName: v})} icon={User} placeholder="Full Name" />
                <FormInput label="Owner Phone" value={newPump.ownerPhone} onChange={v => setNewPump({...newPump, ownerPhone: v})} icon={Phone} placeholder="10 Digits" />
              </div>
            </div>

            <DialogFooter className="gap-3">
              <Button type="button" variant="ghost" className="h-14 rounded-2xl font-bold text-slate-400 flex-1" onClick={() => setIsAddModalOpen(false)}>Discard</Button>
              <Button 
                type="submit" 
                className="h-14 bg-brand hover:bg-brand-hover text-white font-black rounded-2xl shadow-xl shadow-brand/20 flex-1 uppercase tracking-widest text-xs"
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : "Register Partner"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Pump Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden max-w-lg bg-white">
          <div className="bg-indigo-600 p-8 text-white space-y-2">
            <DialogTitle className="text-3xl font-black">Edit Partner Details</DialogTitle>
            <DialogDescription className="text-white/60 font-bold uppercase tracking-[0.1em] text-[10px]">Update information for {editingPump?.name}</DialogDescription>
          </div>
          
          {editingPump && (
            <form onSubmit={handleUpdatePump} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormInput label="Pump Name" value={editingPump.name} onChange={v => setEditingPump({...editingPump, name: v})} icon={Fuel} placeholder="e.g. BPCL Kothrud" />
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-brand" /> City
                    </label>
                    <select 
                      value={editingPump.city} 
                      onChange={(e) => setEditingPump({...editingPump, city: e.target.value})}
                      className="w-full h-14 bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-brand/20 rounded-2xl font-bold px-6 outline-none appearance-none"
                    >
                      {REGIONS.map(region => (
                        <option key={region.value} value={region.value}>
                          {region.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <FormInput label="Full Address" value={editingPump.location} onChange={v => setEditingPump({...editingPump, location: v})} icon={MapPin} placeholder="e.g. Near Station, Nashik" />
                <div className="grid grid-cols-2 gap-4">
                  <FormInput label="Latitude" value={editingPump.latitude} onChange={v => setEditingPump({...editingPump, latitude: v})} icon={Navigation} placeholder="19.9975" />
                  <FormInput label="Longitude" value={editingPump.longitude} onChange={v => setEditingPump({...editingPump, longitude: v})} icon={Navigation} placeholder="73.7898" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormInput label="Owner Name" value={editingPump.ownerName} onChange={v => setEditingPump({...editingPump, ownerName: v})} icon={User} placeholder="Full Name" />
                  <FormInput label="Owner Phone" value={editingPump.ownerPhone} onChange={v => setEditingPump({...editingPump, ownerPhone: v})} icon={Phone} placeholder="10 Digits" />
                </div>
              </div>

              <DialogFooter className="gap-3">
                <Button type="button" variant="ghost" className="h-14 rounded-2xl font-bold text-slate-400 flex-1" onClick={() => {
                  setIsEditModalOpen(false)
                  setEditingPump(null)
                }}>Cancel</Button>
                <Button 
                  type="submit" 
                  className="h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 flex-1 uppercase tracking-widest text-xs"
                  disabled={isSaving}
                >
                  {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Settlement Modal */}
      <Dialog open={isSettleModalOpen} onOpenChange={setIsSettleModalOpen}>
        <DialogContent className="rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden max-w-lg bg-white">
          <div className="bg-brand p-8 text-white space-y-2">
            <DialogTitle className="text-3xl font-black">Record Settlement</DialogTitle>
            <DialogDescription className="text-white/60 font-bold uppercase tracking-[0.1em] text-[10px]">Settling balance for {settlingPump?.name}</DialogDescription>
          </div>
          
          <form onSubmit={handleSettlement} className="p-8 space-y-6">
            <div className="p-6 bg-brand/5 rounded-3xl space-y-2 border border-brand/10">
              <p className="text-[10px] font-black text-brand uppercase tracking-widest">Available Wallet Balance</p>
              <p className="text-3xl font-black text-navy tracking-tighter">₹{settlingPump?.walletBalance || 0}</p>
            </div>

            <FormInput 
              label="Settlement Amount (INR)" 
              value={settlementAmount} 
              onChange={setSettlementAmount} 
              icon={Activity} 
              placeholder="e.g. 5000" 
            />

            <DialogFooter className="gap-3 pt-4">
              <Button type="button" variant="ghost" className="h-14 rounded-2xl font-bold text-slate-400 flex-1" onClick={() => {
                setIsSettleModalOpen(false)
                setSettlingPump(null)
              }}>Cancel</Button>
              <Button 
                type="submit" 
                className="h-14 bg-brand hover:bg-brand-hover text-white font-black rounded-2xl shadow-xl shadow-brand/20 flex-1 uppercase tracking-widest text-xs"
                disabled={isSaving || !settlementAmount}
              >
                {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : "Confirm Settlement"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function PumpCard({ pump, onEdit, onDelete, onSettle }: { pump: PetrolPump, onEdit: () => void, onDelete: () => void, onSettle: () => void }) {
  const fuelMeterValue = Math.min((pump.totalFuelDispensed / 500000) * 100, 100) || 0; // Target 5L as 100%

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group relative"
    >
      <div className="absolute inset-0 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30 transition-all group-hover:shadow-2xl group-hover:shadow-indigo-500/5 group-hover:-translate-y-1" />
      
      <div className="relative z-10 p-8 space-y-6">
        <div className="flex justify-between items-start">
          <div className="h-14 w-14 bg-red-500/10 rounded-2xl flex items-center justify-center">
            <Fuel className="h-7 w-7 text-red-500" />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={onEdit}
              className="p-2 bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-all border border-transparent hover:border-indigo-100"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button 
              onClick={onDelete}
              className="p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl transition-all border border-transparent hover:border-red-100"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex justify-between items-end">
          <div>
            <h3 className="text-xl font-black text-navy group-hover:text-red-500 transition-colors">{pump.name}</h3>
            <p className="text-xs font-bold text-slate-400 flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3" /> {pump.city}
            </p>
          </div>
          <Badge className="bg-success/10 text-success border-none font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-full mb-1">
            {pump.status}
          </Badge>
        </div>

        {/* Contact Info */}
        <div className="flex items-center gap-4 py-4 border-y border-slate-50">
          <div className="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-slate-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-navy truncate">{pump.ownerName}</p>
            <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
              <Phone className="h-2.5 w-2.5" /> {pump.ownerPhone}
            </p>
          </div>
        </div>

        {/* Fuel Meter */}
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Droplets className="h-3 w-3 text-blue-500" /> Fuel Meter
            </label>
            <span className="text-xs font-black text-navy">{Math.floor(pump.totalFuelDispensed / 1000)}k / 500k</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${fuelMeterValue}%` }}
              className="h-full bg-gradient-to-r from-red-500 to-indigo-500"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button className="flex-1 h-12 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all">
            <Activity className="h-4 w-4" />
            Stats
          </button>
          {pump.latitude && pump.longitude && (
            <a 
              href={`https://www.google.com/maps?q=${pump.latitude},${pump.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="h-12 w-12 bg-slate-50 hover:bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center transition-all border border-transparent hover:border-indigo-100"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>

        {/* Wallet Balance & Settle Action */}
        <div className="pt-4 mt-4 border-t border-slate-50 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Wallet Balance</p>
            <p className="text-xl font-black text-navy tracking-tight">₹{pump.walletBalance || 0}</p>
          </div>
          <Button 
            onClick={onSettle}
            className="h-10 bg-brand text-white font-black rounded-xl px-6 shadow-lg shadow-brand/20 uppercase tracking-widest text-[10px]"
          >
            Settle
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

function MapMarker({ label, x, y, count, color }: { label: string, x: string, y: string, count: number, color: string }) {
  return (
    <div className="absolute" style={{ left: x, top: y }}>
      <div className="relative group">
        {/* Pulsing Red Dot */}
        <div className={cn("h-4 w-4 rounded-full animate-ping absolute inset-0 opacity-40", color)} />
        <div className={cn("h-4 w-4 rounded-full relative z-10 border-2 border-white shadow-lg", color)} />
        
        {/* Persistent/Interactive Label (Slate-900 Tooltip style) */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl transition-all min-w-[140px] border border-white/10 backdrop-blur-xl">
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">{label}</span>
            <span className="text-xs font-black tracking-wide text-white">{count} Partners</span>
          </div>
          {/* Tooltip Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
        </div>
      </div>
    </div>
  )
}

function FormInput({ label, value, onChange, icon: Icon, placeholder }: { label: string, value: string, onChange: (v: string) => void, icon: any, placeholder: string }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
        <Icon className="h-3 w-3 text-brand" /> {label}
      </label>
      <Input 
        placeholder={placeholder}
        className="h-14 bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-brand/20 rounded-2xl font-bold px-6"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

function LoadingCard() {
  return (
    <div className="h-[400px] bg-white rounded-[2.5rem] border border-slate-100 animate-pulse p-8 space-y-6">
      <div className="flex justify-between">
        <div className="h-14 w-14 bg-slate-100 rounded-2xl" />
        <div className="h-6 w-20 bg-slate-100 rounded-full" />
      </div>
      <div className="space-y-3">
        <div className="h-8 w-3/4 bg-slate-100 rounded-lg" />
        <div className="h-4 w-1/2 bg-slate-100 rounded-lg" />
      </div>
      <div className="h-20 bg-slate-50 rounded-2xl" />
      <div className="space-y-3">
        <div className="h-3 w-full bg-slate-100 rounded-full" />
        <div className="h-12 w-full bg-slate-100 rounded-2xl" />
      </div>
    </div>
  )
}
