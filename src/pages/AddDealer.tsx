import * as React from "react"
import { useNavigate } from "react-router-dom"
import { UserPlus, Store, Phone, MapPin, Send, ArrowLeft, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { db, auth } from "@/lib/firebase"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { REGIONS, MARKETING_OFFICERS } from "@/lib/constants"

export function AddDealer() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = React.useState(false)
  const [formData, setFormData] = React.useState({
    fullName: "",
    firmName: "",
    mobileNumber: "",
    location: "",
    marketingOfficer: "",
    region: "Nashik"
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check authentication
    if (!auth.currentUser) {
      toast.error("तुमचे सत्र संपले आहे, कृपया पुन्हा लॉगिन करा (Session expired, please login again)")
      navigate("/login")
      return
    }

    // Validation
    if (!formData.fullName || !formData.firmName || !formData.location || !formData.marketingOfficer) {
      toast.error("कृपया सर्व माहिती भरा (Please fill all fields)")
      return
    }

    if (formData.mobileNumber.length !== 10) {
      toast.error("कृपया वैध १० अंकी मोबाइल नंबर टाका (Mobile number must be 10 digits)")
      return
    }

    setIsLoading(true)

    try {
      console.log("Saving dealer to Firestore...", formData)
      
      // Create a promise that rejects after 10 seconds
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Connection Timeout: Firestore is taking too long to respond.")), 10000)
      )

      // Race the setDoc against the timeout
      await Promise.race([
        setDoc(doc(db, "dealers", formData.mobileNumber), {
          ...formData,
          role: "dealer",
          status: "Active",
          stockMT: 0,
          walletBalance: 0,
          adminId: auth.currentUser.uid,
          createdAt: serverTimestamp()
        }),
        timeoutPromise
      ])

      toast.success("Dealer Registered Successfully! (डीलर यशस्वीरित्या नोंदणीकृत झाला)")
      
      // Clear form
      setFormData({
        fullName: "",
        firmName: "",
        mobileNumber: "",
        location: "",
        marketingOfficer: "",
        region: "Nashik"
      })

      // Redirect
      setTimeout(() => navigate("/dealers"), 1500)
    } catch (error: any) {
      console.error("Registration Error:", error)
      
      if (error.message.includes("permission-denied")) {
        toast.error("Firebase Permission Denied: Please check your Firestore rules.")
      } else if (error.message.includes("Timeout")) {
        toast.error("Network Error: Firestore connection timed out. Please check your internet.")
      } else {
        toast.error(`Error: ${error.message || "Failed to save data"}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name === "mobileNumber") {
      setFormData(prev => ({ ...prev, [name]: value.replace(/\D/g, "").slice(0, 10) }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-8 bg-slate-50/50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Button 
          variant="ghost" 
          className="mb-6 text-slate-500 hover:text-navy font-bold gap-2 pl-0"
          onClick={() => navigate("/dealers")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dealers
        </Button>

        <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white">
          <CardHeader className="bg-slate-900 text-white p-8 sm:p-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#4F46E5_0%,transparent_40%)] opacity-40" />
            <div className="relative z-10 flex items-center gap-6">
              <div className="h-16 w-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner">
                <UserPlus className="h-8 w-8 text-brand-soft" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-3xl font-black tracking-tight">Register New Dealer <span className="text-slate-400 font-medium text-lg ml-2">नवीन डीलर नोंदणी</span></CardTitle>
                <CardDescription className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">
                  Create authorized fuel distribution partner (अधिकृत वितरण भागीदार)
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8 sm:p-10">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <UserPlus className="h-3 w-3 text-brand" />
                  Full Name (पूर्ण नाव)
                </label>
                <Input 
                  name="fullName"
                  placeholder="Enter dealer's name" 
                  className="h-14 bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-brand/20 rounded-2xl text-base font-bold transition-all"
                  value={formData.fullName}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              {/* Firm Name */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Store className="h-3 w-3 text-brand" />
                  Firm Name (पेढीचे नाव)
                </label>
                <Input 
                  name="firmName"
                  placeholder="e.g. Metaroll Steel Mart" 
                  className="h-14 bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-brand/20 rounded-2xl text-base font-bold transition-all"
                  value={formData.firmName}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              {/* Mobile Number */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Phone className="h-3 w-3 text-brand" />
                  Mobile Number (मोबाईल नंबर)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">+91</span>
                  <Input 
                    name="mobileNumber"
                    type="tel"
                    placeholder="00000 00000" 
                    className="h-14 pl-14 bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-brand/20 rounded-2xl text-base font-bold tracking-wider transition-all"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-brand" />
                  Location / City (शहर)
                </label>
                <Input 
                  name="location"
                  placeholder="e.g. Jalna, Nashik" 
                  className="h-14 bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-brand/20 rounded-2xl text-base font-bold transition-all"
                  value={formData.location}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              {/* Marketing Officer */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <UserPlus className="h-3 w-3 text-brand" />
                  Assigned MO (नियुक्त एमओ)
                </label>
                <select
                  name="marketingOfficer"
                  className="w-full h-14 px-6 bg-slate-50 border-none focus:ring-2 focus:ring-brand/20 rounded-2xl text-base font-bold appearance-none outline-none cursor-pointer"
                  value={formData.marketingOfficer}
                  onChange={handleChange}
                  disabled={isLoading}
                >
                  <option value="">Select Marketing Officer</option>
                  {MARKETING_OFFICERS.map(mo => (
                    <option key={mo.value} value={mo.value}>
                      {mo.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Region */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-brand" />
                  Region (क्षेत्र)
                </label>
                <select
                  name="region"
                  className="w-full h-14 px-6 bg-slate-50 border-none focus:ring-2 focus:ring-brand/20 rounded-2xl text-base font-bold appearance-none outline-none cursor-pointer"
                  value={formData.region}
                  onChange={handleChange}
                  disabled={isLoading}
                >
                  {REGIONS.map(region => (
                    <option key={region.value} value={region.value}>
                      {region.label} ({region.marathi})
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2 pt-4">
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full h-16 bg-brand hover:bg-brand-hover text-white font-black text-sm uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-brand/20 transition-all active:scale-[0.98] disabled:opacity-70 group"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-3">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Processing... (प्रक्रिया सुरू आहे)</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Send className="h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      <span>Complete Registration (नोंदणी पूर्ण करा)</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>

          <CardFooter className="bg-slate-50/50 p-6 flex justify-center border-t border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">
              Security Verified • Admin Portal Access
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
