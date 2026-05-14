import * as React from "react"
import { Phone, MapPin, Store, ExternalLink, User, Truck, Wallet, Plus } from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, onSnapshot, query, orderBy, where } from "firebase/firestore"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"

import { Button } from "@/components/ui/button"

export interface Dealer {
  id: string;
  fullName: string;
  firmName: string;
  mobileNumber: string;
  location: string;
  region: 'Nashik' | 'Jalgaon' | 'Jalna' | 'Ahmednagar' | 'Sambhajinagar' | 'Akluj' | 'Solapur' | string;
  marketingOfficer: string;
  status: 'Active' | 'Inactive';
  stockMT: number;
  walletBalance: number;
  role: string;
  adminId?: string;
  createdAt?: any;
  lastAllocationAt?: any;
}

export function DealerList({ 
  onAllocate, 
  searchTerm = "", 
  selectedRegion = "All" 
}: { 
  onAllocate?: (dealer: Dealer) => void;
  searchTerm?: string;
  selectedRegion?: string;
}) {
  const [dealers, setDealers] = React.useState<Dealer[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let q = query(collection(db, "dealers"), orderBy("createdAt", "desc"))
    
    if (selectedRegion !== "All") {
      q = query(
        collection(db, "dealers"), 
        where("region", "==", selectedRegion), 
        orderBy("createdAt", "desc")
      )
    }
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dealerData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Dealer[]
      
      setDealers(dealerData)
      setLoading(false)
    }, (error) => {
      console.error("Error fetching dealers:", error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [selectedRegion])

  const filteredDealers = dealers.filter(dealer => {
    const matchesSearch = 
      dealer.firmName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dealer.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dealer.mobileNumber?.includes(searchTerm) ||
      dealer.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRegion = selectedRegion === "All" || dealer.region === selectedRegion;
    
    return matchesSearch && matchesRegion;
  })

  if (loading) {
    return <LoadingState />
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white/50 shadow-2xl shadow-slate-200/40 overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Dealer Details</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest hidden sm:table-cell">Region / Location</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest hidden lg:table-cell">Assigned MO</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Wallet & Stock</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            <AnimatePresence mode="popLayout">
              {filteredDealers.length > 0 ? (
                filteredDealers.map((dealer) => (
                  <motion.tr 
                    key={dealer.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="group hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-brand/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Store className="h-6 w-6 text-brand" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-navy group-hover:text-brand transition-colors">{dealer.firmName}</p>
                          <div className="sm:hidden mt-1 space-y-1">
                            <p className="text-[9px] font-bold text-indigo-500 uppercase">{dealer.region || 'No Region'}</p>
                            <p className="text-[10px] font-medium text-slate-400">{dealer.location}</p>
                          </div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 hidden sm:flex items-center gap-1.5">
                            <User className="h-3 w-3" /> {dealer.fullName}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 mt-0.5 flex items-center gap-1.5">
                            <Phone className="h-3 w-3 text-brand" /> +91 {dealer.mobileNumber}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 hidden sm:table-cell">
                      <div className="flex flex-col gap-1">
                        <Badge className="w-fit bg-indigo-50 text-indigo-600 border-none font-black text-[9px] uppercase px-2 py-0.5 rounded-md">
                          {dealer.region || 'Unassigned'}
                        </Badge>
                        <p className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-slate-400" /> {dealer.location}
                        </p>
                      </div>
                    </td>
                    <td className="px-8 py-6 hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-slate-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-slate-400" />
                        </div>
                        <p className="text-sm font-black text-navy">{dealer.marketingOfficer || 'Not Assigned'}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Wallet className="h-3.5 w-3.5 text-success" />
                          <span className="text-sm font-black text-navy">₹{(dealer.walletBalance || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Truck className="h-3.5 w-3.5 text-brand" />
                          <span className="text-xs font-bold text-slate-500">{dealer.stockMT || 0} MT Stock</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-10 px-4 bg-brand/5 text-brand hover:bg-brand hover:text-white rounded-xl font-black text-[10px] uppercase tracking-widest gap-2 transition-all"
                          onClick={() => onAllocate?.(dealer)}
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Allocate
                        </Button>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-100">
                          <ExternalLink className="h-4 w-4 text-slate-400" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <EmptyState />
                  </td>
                </tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="w-full max-w-2xl mx-auto h-14 bg-slate-100 animate-pulse rounded-2xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-[320px] bg-white/50 backdrop-blur-xl rounded-[2.5rem] border border-white/50 animate-pulse p-7 space-y-6">
            <div className="flex justify-between">
              <div className="h-14 w-14 bg-slate-100 rounded-2xl" />
              <div className="h-6 w-20 bg-slate-100 rounded-full" />
            </div>
            <div className="space-y-2">
              <div className="h-6 w-3/4 bg-slate-100 rounded-lg" />
              <div className="h-4 w-1/2 bg-slate-100 rounded-lg" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-10 bg-slate-100 rounded-lg" />
              <div className="h-10 bg-slate-100 rounded-lg" />
            </div>
            <div className="flex gap-3">
              <div className="h-12 flex-1 bg-slate-100 rounded-2xl" />
              <div className="h-12 w-12 bg-slate-100 rounded-2xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-4 text-center"
    >
      <div className="h-24 w-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-6 shadow-inner">
        <Store className="h-10 w-10 text-slate-200" />
      </div>
      <h3 className="text-2xl font-black text-navy mb-2">No Dealers Found</h3>
      <p className="text-slate-400 font-bold max-w-xs mx-auto">
        We couldn't find any dealers matching your search. Try adjusting your filters or add a new dealer.
      </p>
    </motion.div>
  )
}
