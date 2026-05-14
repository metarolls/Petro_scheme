import * as React from "react"
import { useNavigate } from "react-router-dom"
import { UserPlus, UserCircle, Phone, MapPin, Send, ArrowLeft, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { db, auth } from "@/lib/firebase"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"

export function AddContractor() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = React.useState(false)
  const [formData, setFormData] = React.useState({
    fullName: "",
    mobileNumber: "",
    location: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!auth.currentUser) {
      toast.error("Session expired, please login again")
      navigate("/login")
      return
    }

    if (!formData.fullName || !formData.location) {
      toast.error("Please fill all fields")
      return
    }

    if (formData.mobileNumber.length !== 10) {
      toast.error("Mobile number must be 10 digits")
      return
    }

    setIsLoading(true)

    try {
      await setDoc(doc(db, "contractors", formData.mobileNumber), {
        ...formData,
        role: "contractor",
        status: "Active",
        walletBalance: 0,
        adminId: auth.currentUser.uid,
        createdAt: serverTimestamp()
      })

      toast.success("Contractor Registered Successfully!")
      
      setFormData({
        fullName: "",
        mobileNumber: "",
        location: ""
      })

      setTimeout(() => navigate("/contractors"), 1500)
    } catch (error: any) {
      console.error("Registration Error:", error)
      toast.error(`Error: ${error.message || "Failed to save data"}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
          onClick={() => navigate("/contractors")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Contractors
        </Button>

        <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white">
          <CardHeader className="bg-slate-900 text-white p-8 sm:p-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#4F46E5_0%,transparent_40%)] opacity-40" />
            <div className="relative z-10 flex items-center gap-6">
              <div className="h-16 w-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner">
                <UserCircle className="h-8 w-8 text-indigo-400" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-3xl font-black tracking-tight">Register Contractor</CardTitle>
                <CardDescription className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">
                  Add a new contractor to the network
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8 sm:p-10">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <UserPlus className="h-3 w-3 text-indigo-600" />
                  Full Name
                </label>
                <Input 
                  name="fullName"
                  placeholder="Enter contractor's name" 
                  className="h-14 bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 rounded-2xl text-base font-bold"
                  value={formData.fullName}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Phone className="h-3 w-3 text-indigo-600" />
                  Mobile Number
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">+91</span>
                  <Input 
                    name="mobileNumber"
                    type="tel"
                    placeholder="00000 00000" 
                    className="h-14 pl-14 bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 rounded-2xl text-base font-bold tracking-wider"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-indigo-600" />
                  Location / Area
                </label>
                <Input 
                  name="location"
                  placeholder="e.g. Pune Highway, Jalna" 
                  className="h-14 bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 rounded-2xl text-base font-bold"
                  value={formData.location}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              <div className="md:col-span-2 pt-4">
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full h-16 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-indigo-100 group"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-3">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Registering...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Send className="h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      <span>Complete Registration</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>

          <CardFooter className="bg-slate-50/50 p-6 flex justify-center border-t border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">
              Authorized Network Partner
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
