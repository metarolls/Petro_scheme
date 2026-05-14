import * as React from "react"
import { Plus, Search, UserCircle, MapPin, Phone, Wallet, Activity, Filter, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { REGIONS } from "@/lib/constants"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { db } from "@/lib/firebase"
import { collection, onSnapshot, query, orderBy } from "firebase/firestore"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"

interface Contractor {
  id: string;
  fullName: string;
  mobileNumber: string;
  location: string;
  walletBalance: number;
  status: string;
}

export function ContractorManagement() {
  const navigate = useNavigate()
  const [contractors, setContractors] = React.useState<Contractor[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [selectedRegion, setSelectedRegion] = React.useState("All")

  React.useEffect(() => {
    const q = query(collection(db, "contractors"), orderBy("fullName"))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Contractor[]
      setContractors(data)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const filteredContractors = contractors.filter(c => {
    const matchesSearch = c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.mobileNumber.includes(searchTerm);
    
    const matchesRegion = selectedRegion === "All" || c.location === selectedRegion;
    
    return matchesSearch && matchesRegion;
  })

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col space-y-1">
          <h2 className="text-4xl font-black tracking-tight text-navy">
            Contractors <span className="text-brand/40 font-medium">कॉन्ट्रॅक्टर</span>
          </h2>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Manage your site contractors and their reward balances.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group flex-1 md:flex-none">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-brand transition-colors" />
            <Input
              type="text"
              placeholder="Search contractors..."
              className="w-full md:w-[300px] h-12 pl-12 bg-white border-none shadow-lg shadow-slate-200/50 rounded-2xl font-bold focus-visible:ring-2 focus-visible:ring-brand/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="h-12 pl-12 pr-10 bg-white border-none shadow-lg shadow-slate-200/50 rounded-2xl font-bold appearance-none outline-none focus:ring-2 focus:ring-brand/20 cursor-pointer text-sm text-navy min-w-[160px] transition-all hover:shadow-xl"
            >
              <option value="All">All Regions</option>
              {REGIONS.map(region => (
                <option key={region.value} value={region.value}>{region.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
          <Button size="sm" className="bg-brand hover:bg-brand-hover text-white font-black rounded-2xl h-12 px-6 shadow-xl shadow-brand/20 uppercase tracking-widest text-xs" onClick={() => navigate("/contractors/add")}>
            <Plus className="h-4 w-4 mr-2" />
            Add Contractor
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-white rounded-[2.5rem] border border-slate-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredContractors.map((contractor) => (
              <motion.div
                key={contractor.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] bg-white overflow-hidden group hover:shadow-2xl hover:shadow-brand/5 transition-all">
                  <CardContent className="p-8 space-y-6">
                    <div className="flex justify-between items-start">
                      <div className="h-14 w-14 bg-brand-soft rounded-2xl flex items-center justify-center">
                        <UserCircle className="h-8 w-8 text-brand" />
                      </div>
                      <Badge className="bg-success/10 text-success border-none font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-full">
                        {contractor.status || "Active"}
                      </Badge>
                    </div>

                    <div>
                      <h3 className="text-xl font-black text-navy">{contractor.fullName}</h3>
                      <div className="flex items-center gap-2 text-slate-400 mt-1">
                        <MapPin className="h-3 w-3" />
                        <span className="text-xs font-bold">{contractor.location}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 py-4 border-y border-slate-50">
                      <div className="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center">
                        <Phone className="h-4 w-4 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-navy">+91 {contractor.mobileNumber}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Contact Number</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                          <Wallet className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter leading-none">Balance</p>
                          <p className="text-lg font-black text-navy mt-0.5">₹{(contractor.walletBalance || 0).toLocaleString()}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="h-10 w-10 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-400">
                        <Activity className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
