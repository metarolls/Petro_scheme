import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Fuel, Phone, ShieldCheck } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

export function Login() {
  const [phoneNumber, setPhoneNumber] = React.useState("")
  const [otp, setOtp] = React.useState("")
  const [showOtp, setShowOtp] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const navigate = useNavigate()

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault()
    if (phoneNumber.length !== 10) {
      toast.error("कृपया वैध १० अंकी मोबाइल नंबर टाका (Please enter valid 10-digit phone number)")
      return
    }
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setShowOtp(true)
      toast.success("तुमच्या मोबाइलवर OTP पाठवला आहे (OTP sent to your mobile)")
    }, 1000)
  }

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length !== 4) {
      toast.error("कृपया वैध ४ अंकी OTP टाका (Please enter valid 4-digit OTP)")
      return
    }
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      toast.success("लॉगिन यशस्वी झाले! (Login Successful!)")
      navigate("/dashboard")
    }, 1000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md px-4"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 mb-4">
            <Fuel className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">TMT Fuel Admin</h1>
          <p className="text-slate-500 font-medium mt-1">Management System</p>
        </div>

        <Card className="border-none shadow-2xl shadow-slate-200/60 backdrop-blur-sm bg-white/90">
          <CardHeader>
            <CardTitle className="text-xl text-center font-bold">
              {showOtp ? "OTP Verification" : "Welcome Back"}
            </CardTitle>
            <CardDescription className="text-center">
              {showOtp 
                ? "Enter the 4-digit code sent to your phone" 
                : "Enter your phone number to continue"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={showOtp ? handleVerify : handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center">
                  <Phone className="h-3 w-3 mr-2 text-primary" />
                  Phone Number (मोबाइल नंबर)
                </label>
                <div className="relative">
                  <Input 
                    type="tel" 
                    placeholder="9876543210" 
                    className="pl-10 h-11"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={showOtp || isLoading}
                    maxLength={10}
                  />
                  <span className="absolute left-3 top-3 text-slate-400 font-medium">+91</span>
                </div>
              </div>

              <AnimatePresence>
                {showOtp && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-2 pt-2"
                  >
                    <label className="text-sm font-semibold text-slate-700 flex items-center">
                      <ShieldCheck className="h-3 w-3 mr-2 text-primary" />
                      Enter OTP (ओटीपी टाका)
                    </label>
                    <Input 
                      type="text" 
                      placeholder="XXXX" 
                      className="h-11 text-center tracking-[1em] font-bold text-lg"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={4}
                      autoFocus
                      disabled={isLoading}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <Button 
                type="submit" 
                className="w-full h-11 font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : showOtp ? "Verify & Login (सत्यापित करा)" : "Send OTP (ओटीपी पाठवा)"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center flex-col space-y-2 pb-8">
            <p className="text-xs text-slate-400">By continuing, you agree to our Terms of Service</p>
            {showOtp && (
              <button 
                className="text-primary text-xs font-bold hover:underline"
                onClick={() => setShowOtp(false)}
              >
                Change Phone Number
              </button>
            )}
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
