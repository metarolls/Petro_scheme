import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Fuel, Phone, ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { auth } from "@/lib/firebase"
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from "firebase/auth"
import { useAuth } from "@/contexts/AuthContext"

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier | undefined;
  }
}

export function MerchantLogin() {
  const { user, role, loading, evaluating } = useAuth()
  const [phoneNumber, setPhoneNumber] = React.useState("")
  const [otp, setOtp] = React.useState("")
  const [showOtp, setShowOtp] = React.useState(false)
  const [isVerifying, setIsVerifying] = React.useState(false)
  const [confirmResult, setConfirmResult] = React.useState<ConfirmationResult | null>(null)
  const navigate = useNavigate()

  // Redirect if already logged in as merchant
  React.useEffect(() => {
    if (!loading && !evaluating && user) {
      if (role === 'merchant') {
        navigate("/merchant/home", { replace: true })
      } else if (role !== null) {
        // Logged in but with wrong role (e.g. dealer trying to login as merchant)
        // Redirect to their respective home
        navigate(`/${role === 'admin' ? 'dashboard' : role + '/home'}`, { replace: true })
      } else if (role === null) {
        // Logged in but not registered or profile not loaded yet
        // If we are not loading and still have no role, it means registration check failed
        toast.error(`तुमचा नंबर मर्चंट म्हणून नोंदणीकृत नाही (Not registered as Merchant)\nUID: ${user.uid}`)
        console.log("Logged in UID:", user.uid)
        auth.signOut()
      }
    }
  }, [user, role, loading, evaluating, navigate])

  React.useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear()
        window.recaptchaVerifier = undefined
      }
    }
  }, [])

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (phoneNumber.length !== 10) {
      toast.error("कृपया वैध १० अंकी मर्चंट नंबर टाका (Please enter valid 10-digit number)")
      return
    }
    
    setIsVerifying(true)
    try {
      // Initialize Recaptcha
      if (!window.recaptchaVerifier) {
        const container = document.getElementById('recaptcha-container');
        if (container) container.innerHTML = '';
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          'size': 'invisible',
          'callback': () => {}
        });
      }

      const formatPhone = `+91${phoneNumber}`
      const result = await signInWithPhoneNumber(auth, formatPhone, window.recaptchaVerifier)
      setConfirmResult(result)
      setShowOtp(true)
      toast.success("OTP Sent! (तुमच्या मोबाइलवर OTP पाठवला आहे)")
    } catch (error: any) {
      console.error("SMS Error:", error)
      toast.error(error.message || "Failed to send OTP. Please try again.")
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear()
        window.recaptchaVerifier = undefined
      }
    } finally {
      setIsVerifying(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length < 4) {
      toast.error("Please enter valid OTP")
      return
    }
    
    setIsVerifying(true)
    try {
      if (!confirmResult) throw new Error("Session expired. Please request OTP again.")
      await confirmResult.confirm(otp)
      toast.success("मर्चंट लॉगिन यशस्वी झाले! (Merchant Login Successful!)")
      // AuthContext will handle the redirect via the Navigate at top
    } catch (error: any) {
      console.error("Verification Error:", error)
      toast.error("Invalid OTP. Please try again. (चुकीचा ओटीपी)")
    } finally {
      setIsVerifying(false)
    }
  }

  if (loading) return null

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-brand selection:text-white">
      <div id="recaptcha-container"></div>
      {/* Visual Header */}
      <div className="h-48 bg-navy relative overflow-hidden flex items-center justify-center p-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#FF2B45_0%,transparent_40%),radial-gradient(circle_at_70%_60%,#0F172A_0%,transparent_40%)] opacity-30" />
        <div className="relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-14 w-14 bg-brand rounded-2xl flex items-center justify-center shadow-2xl shadow-brand/20 mb-4 mx-auto"
          >
            <Fuel className="h-7 w-7 text-white" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-black text-white tracking-tight"
          >
            Merchant <span className="text-brand">Portal</span>
          </motion.h1>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 px-6 -mt-10 relative z-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md mx-auto"
        >
          <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="space-y-1 pb-2 pt-8 text-center">
              <CardTitle className="text-2xl font-black text-navy leading-none">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-1">
                {showOtp ? "Identity Verification" : "Secure Merchant Access"}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-6">
              <form onSubmit={showOtp ? handleVerify : handleSendOtp} className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center ml-1">
                    <Phone className="h-3 w-3 mr-2 text-brand" />
                    Registered Mobile
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm border-r border-slate-100 pr-3">+91</div>
                    <Input 
                      type="tel" 
                      placeholder="00000 00000" 
                      className="pl-16 h-14 bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-brand/20 rounded-2xl text-lg font-black tracking-widest transition-all"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      disabled={showOtp || isVerifying}
                    />
                  </div>
                </div>

                <AnimatePresence>
                  {showOtp && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-3"
                    >
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center ml-1">
                        <ShieldCheck className="h-3 w-3 mr-2 text-brand" />
                        Verification Code
                      </label>
                      <Input 
                        type="text" 
                        placeholder="• • • • • •" 
                        className="h-14 text-center tracking-[0.8em] font-black text-2xl bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-brand/20 rounded-2xl transition-all"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        autoFocus
                        disabled={isVerifying}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button 
                  type="submit" 
                  className={cn(
                    "w-full h-14 font-black text-sm uppercase tracking-widest rounded-2xl transition-all duration-300 shadow-xl",
                    showOtp ? "bg-success hover:bg-success/90 shadow-success/10" : "bg-brand hover:bg-brand-hover shadow-brand/20"
                  )}
                  disabled={isVerifying}
                >
                  {isVerifying ? (
                    <span className="flex items-center gap-3">
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Wait...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      {showOtp ? "Verify & Enter" : "Get OTP"}
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-2 pb-10">
              <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                <CheckCircle2 className="h-3 w-3 text-success" />
                Trusted Secure Session
              </div>
              {showOtp && (
                <button 
                  className="text-brand text-[10px] font-black uppercase tracking-widest hover:underline"
                  onClick={() => {
                    setShowOtp(false)
                    setConfirmResult(null)
                    setOtp("")
                  }}
                >
                  Change Number
                </button>
              )}
            </CardFooter>
          </Card>
          
          <div className="mt-12 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-2">Powered by</p>
            <p className="text-sm font-black text-navy tracking-tight">TMT FUEL NETWORKS</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}


