import * as React from "react"
import { Plus, Download, Loader2, Search, Filter, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
import { DealerList, type Dealer } from "@/components/dealer/DealerList"
import { motion } from "framer-motion"
import { db } from "@/lib/firebase"
import { doc, runTransaction, serverTimestamp, collection, getDocs, query, orderBy, where } from "firebase/firestore"
import { REWARD_RATE, MT_TO_KG, REGIONS } from "@/lib/constants"

export function DealerManagement() {
  const navigate = useNavigate()
  const [selectedDealer, setSelectedDealer] = React.useState<Dealer | null>(null)
  const [allocationWeight, setAllocationWeight] = React.useState("")
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [isAllocating, setIsAllocating] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [selectedRegion, setSelectedRegion] = React.useState("All")

  const handleAllocateStock = async () => {
    if (!selectedDealer || !allocationWeight) {
      toast.error("कृपया सर्व माहिती भरा (Please fill all details)")
      return
    }

    const weight = parseFloat(allocationWeight)
    if (isNaN(weight) || weight <= 0) {
      toast.error("कृपया वैध वजन टाका (Please enter valid weight)")
      return
    }

    // Phase 4 Logic: Reward Amount = Weight in MT * 1000 * 0.20
    const weightInKg = weight * MT_TO_KG
    const rewardAmount = weightInKg * REWARD_RATE

    setIsAllocating(true)
    try {
      await runTransaction(db, async (transaction) => {
        // Reference to the dealer document (ID is mobile number)
        const dealerRef = doc(db, "dealers", selectedDealer.id)
        const dealerDoc = await transaction.get(dealerRef)

        if (!dealerDoc.exists()) {
          throw new Error("Dealer does not exist in our distribution network!")
        }

        const currentStock = dealerDoc.data().stockMT || 0
        const currentBalance = dealerDoc.data().walletBalance || 0
        
        // 1. Update Dealer balances atomically
        transaction.update(dealerRef, {
          stockMT: currentStock + weight,
          walletBalance: currentBalance + rewardAmount,
          lastAllocationAt: serverTimestamp()
        })

        // 2. Create detailed audit trail in wallet_history
        const historyRef = doc(collection(db, "wallet_history"))
        transaction.set(historyRef, {
          type: 'allocation',
          status: 'completed',
          sourceId: 'admin',
          sourceName: 'Metaroll Admin',
          destinationId: selectedDealer.id, // Mobile Number
          destinationName: selectedDealer.firmName,
          amount: rewardAmount,
          weightMT: weight,
          weightKG: weightInKg,
          rate: REWARD_RATE,
          timestamp: serverTimestamp(),
          description: `Stock Allocation: ${weight} MT`,
          metadata: {
            previousBalance: currentBalance,
            newBalance: currentBalance + rewardAmount,
            previousStock: currentStock,
            newStock: currentStock + weight
          }
        })
      })

      toast.success(`Allocated ${weight} MT and credited ₹${rewardAmount.toLocaleString()} to ${selectedDealer.firmName}`)
      setIsModalOpen(false)
      setAllocationWeight("")
      setSelectedDealer(null)
    } catch (error: any) {
      console.error("Allocation Transaction Failed:", error)
      toast.error("Failed to update stock: " + (error.message || "Unknown error"))
    } finally {
      setIsAllocating(false)
    }
  }

  const handleExport = async () => {
    try {
      let q = query(collection(db, "dealers"), orderBy("firmName", "asc"))
      
      if (selectedRegion !== "All") {
        q = query(
          collection(db, "dealers"), 
          where("region", "==", selectedRegion), 
          orderBy("firmName", "asc")
        )
      }
      
      const snapshot = await getDocs(q)
      const dealers = snapshot.docs.map(doc => doc.data())

      if (dealers.length === 0) {
        toast.error("No dealers found to export!")
        return
      }

      // Create CSV content
      const headers = ["Firm Name", "Full Name", "Mobile", "Location", "Region", "Assigned MO", "Stock (MT)", "Wallet Balance"]
      const rows = dealers.map(d => [
        `"${d.firmName || ""}"`,
        `"${d.fullName || ""}"`,
        `"${d.mobileNumber || ""}"`,
        `"${d.location || ""}"`,
        `"${d.region || ""}"`,
        `"${d.assignedMO || ""}"`,
        d.stockMT || 0,
        d.walletBalance || 0
      ])

      const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n")
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      
      link.setAttribute("href", url)
      link.setAttribute("download", `Metaroll_Dealers_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success("Dealer directory exported successfully!")
    } catch (error) {
      console.error("Export failed:", error)
      toast.error("Failed to export data")
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col space-y-1">
          <h2 className="text-4xl font-black tracking-tight text-navy">
            Dealer Directory <span className="text-brand/40 font-medium">डीलर डिरेक्टरी</span>
          </h2>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Manage your premium distribution network in real-time.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="bg-white hover:bg-slate-50 border-slate-200 text-slate-600 font-bold rounded-2xl h-12 px-6" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" className="bg-brand hover:bg-brand-hover text-white font-black rounded-2xl h-12 px-6 shadow-xl shadow-brand/20 uppercase tracking-widest text-xs" onClick={() => navigate("/dealers/add")}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Dealer
          </Button>
        </div>
      </div>
      
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative group flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-brand transition-colors" />
          <Input
            type="text"
            placeholder="Search by name, mobile, or location..."
            className="w-full h-14 pl-12 bg-white border-none shadow-xl shadow-slate-200/40 rounded-2xl font-bold focus-visible:ring-2 focus-visible:ring-brand/20 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full h-14 pl-11 pr-10 bg-white border-none shadow-xl shadow-slate-200/40 rounded-2xl font-bold appearance-none outline-none focus:ring-2 focus:ring-brand/20 cursor-pointer text-sm text-navy"
            >
              <option value="All">All Regions (सर्व भाग)</option>
              {REGIONS.map(region => (
                <option key={region.value} value={region.value}>
                  {region.label} ({region.marathi})
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <MapPin className="h-4 w-4 text-slate-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Dealer List Component */}
      <DealerList 
        searchTerm={searchTerm}
        selectedRegion={selectedRegion}
        onAllocate={(dealer) => {
          setSelectedDealer(dealer)
          setIsModalOpen(true)
        }} 
      />

      {/* Allocation Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="rounded-[2.5rem] border-none shadow-2xl p-8 max-w-md bg-white/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-navy">Allocate TMT Stock</DialogTitle>
            <DialogDescription className="text-sm font-bold text-slate-500">
              Assigning inventory to <span className="text-brand">{selectedDealer?.firmName}</span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-6">
            <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Selected Dealer</label>
              <div className="flex justify-between items-center">
                <span className="text-sm font-black text-navy">{selectedDealer?.firmName}</span>
                <Badge className="bg-brand/10 text-brand border-none text-[9px] font-black uppercase">{selectedDealer?.location}</Badge>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Weight in MT (मेट्रिक टन)</label>
              <Input 
                type="number" 
                placeholder="e.g. 50.5" 
                className="h-16 bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-brand/20 rounded-2xl text-xl font-black px-6"
                value={allocationWeight}
                onChange={(e) => setAllocationWeight(e.target.value)}
              />
            </div>

            {allocationWeight && !isNaN(parseFloat(allocationWeight)) && parseFloat(allocationWeight) > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 bg-brand/[0.03] rounded-3xl border border-brand/10 space-y-4"
              >
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Reward Calculation</p>
                    <p className="text-3xl font-black text-brand tracking-tight">₹{(parseFloat(allocationWeight) * MT_TO_KG * REWARD_RATE).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total KG</p>
                    <p className="text-lg font-black text-navy">{(parseFloat(allocationWeight) * MT_TO_KG).toLocaleString()} <span className="text-xs text-slate-400">KG</span></p>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-brand/5 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Rate</p>
                    <p className="text-xs font-black text-navy">₹{REWARD_RATE}/KG</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Conversion</p>
                    <p className="text-xs font-black text-navy">1 MT = 1000 KG</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-3">
            <Button variant="ghost" className="h-14 rounded-2xl font-bold text-slate-400 flex-1" onClick={() => setIsModalOpen(false)} disabled={isAllocating}>Discard</Button>
            <Button 
              className="h-14 bg-brand hover:bg-brand-hover text-white font-black rounded-2xl shadow-xl shadow-brand/20 flex-1 uppercase tracking-widest text-xs gap-2" 
              onClick={handleAllocateStock}
              disabled={isAllocating}
            >
              {isAllocating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Allocating...
                </>
              ) : (
                "Confirm Allocation"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
