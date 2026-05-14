import * as React from "react"
import { useNavigate } from "react-router-dom"
import { ShieldCheck, Phone, ArrowRight, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { auth } from "@/lib/firebase"
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth"
import type { ConfirmationResult } from "firebase/auth"
import { useAuth } from "@/contexts/AuthContext"
import { cn, comingSoon } from "@/lib/utils"

// No window globals — we use a React ref instead (safer in Strict Mode)

export function Login() {
  const { user, role, loading, evaluating, logout, registerLogoutCleanup } = useAuth()
  const [phoneNumber, setPhoneNumber] = React.useState("")
  const [otp, setOtp] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [confirmResult, setConfirmResult] = React.useState<ConfirmationResult | null>(null)
  const navigate = useNavigate()

  // Use refs instead of window globals — safe in React Strict Mode double-mount
  const recaptchaContainerRef = React.useRef<HTMLDivElement>(null)
  const recaptchaVerifierRef = React.useRef<RecaptchaVerifier | null>(null)

  // Redirect if already logged in
  React.useEffect(() => {
    // Only proceed if we are NOT loading AND NOT evaluating the role
    if (!loading && !evaluating && user) {
      if (role === 'admin') {
        navigate("/dashboard")
      } else if (role === 'dealer' || role === 'contractor' || role === 'merchant') {
        // Redirect to their respective portal if they are recognized
        navigate(`/${role}/home`)
      } else if (role === null) {
        // Only sign out if we are 100% sure they don't have ANY registered role
        toast.error(`तुमचा नंबर प्रशासक म्हणून नोंदणीकृत नाही (Not registered as Admin)\nUID: ${user.uid}`)
        console.log("Logged in UID:", user.uid)
        logout()  // calls clearVerifier() then auth.signOut() via AuthContext
      }
    }
  }, [user, role, loading, evaluating, navigate])

  // Stable teardown helper — used on unmount, on error, and on expired callback
  const clearVerifier = React.useCallback(() => {
    if (recaptchaVerifierRef.current) {
      try {
        recaptchaVerifierRef.current.clear()
      } catch (_) {
        // .clear() can throw if the widget never fully rendered — ignore safely
      }
      recaptchaVerifierRef.current = null
    }
  }, [])

  // Cleanup on unmount (also fires between mounts in React Strict Mode)
  React.useEffect(() => {
    return () => clearVerifier()
  }, [clearVerifier])

  // Register our teardown with AuthContext so logout() anywhere calls clearVerifier first
  React.useEffect(() => {
    registerLogoutCleanup(clearVerifier)
  }, [registerLogoutCleanup, clearVerifier])

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (phoneNumber.length !== 10) {
      toast.error("कृपया वैध १० अंकी मोबाइल नंबर टाका (Please enter valid 10-digit phone number)")
      return
    }

    setIsLoading(true)

    try {
      // Ensure the container div is in the DOM before initializing
      const container = recaptchaContainerRef.current
      if (!container) {
        throw new Error("reCAPTCHA container is not mounted yet. Please try again.")
      }

      // Lazily create the verifier — skip if one already exists (e.g. retry)
      if (!recaptchaVerifierRef.current) {
        // Clear any stale innerHTML left by a previous failed attempt
        container.innerHTML = ''

        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, container, {
          size: 'invisible',
          callback: () => {},
          'expired-callback': () => {
            toast.error("reCAPTCHA expired. Please try again.")
            clearVerifier() // reset so next attempt creates a fresh one
          },
        })
      }

      const appVerifier = recaptchaVerifierRef.current
      const formatPhone = `+91${phoneNumber}`

      const result = await signInWithPhoneNumber(auth, formatPhone, appVerifier)
      setConfirmResult(result)
      toast.success("OTP Sent! (तुमच्या मोबाइलवर OTP पाठवला आहे)")
    } catch (error: any) {
      console.error("SMS Error:", error)
      toast.error(error.message || "Failed to send OTP. Please try again.")
      // Always reset on failure so the next attempt gets a fresh verifier
      clearVerifier()
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length !== 6) {
      toast.error("कृपया ६ अंकी OTP टाका (Please enter valid 6-digit OTP)")
      return
    }

    setIsLoading(true)
    try {
      if (!confirmResult) throw new Error("Session expired. Please request OTP again.")
      await confirmResult.confirm(otp)
      toast.success("Login Successful! (लॉगिन यशस्वी झाले)")
    } catch (error: any) {
      console.error("Verification Error:", error)
      toast.error("Invalid OTP. Please try again. (चुकीचा ओटीपी)")
    } finally {
      setIsLoading(false)
    }
  }

  const stepVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  }

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans selection:bg-brand selection:text-white overflow-hidden">
      {/* reCAPTCHA invisible widget — must be in DOM before verifier is created */}
      <div ref={recaptchaContainerRef} id="recaptcha-container" />
      
      {/* Left Side - Visuals (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#dc2626_0%,transparent_40%),radial-gradient(circle_at_70%_60%,#0F172A_0%,transparent_40%)] opacity-30" />
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" />
        
        <div className="relative z-10 max-w-lg">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-24 w-24 rounded-[2rem] overflow-hidden shadow-2xl shadow-brand/20 mb-12"
          >
            <img src="/logo.png" alt="Metaroll Rewards" className="h-full w-full object-cover" />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="space-y-8"
          >
            <h1 className="text-6xl font-black text-white leading-tight tracking-tighter">
              The Gold Standard of <span className="text-brand">Reward Systems.</span>
            </h1>
            <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-md">
              Secure, real-time, and enterprise-ready. Join the next generation of industrial loyalty programs.
            </p>
            
            <div className="grid grid-cols-1 gap-4 pt-8">
              <FeatureItem text="Firebase Shield Security" />
              <FeatureItem text="Instant SMS Authentication" />
              <FeatureItem text="Premium PWA Experience" />
            </div>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-brand/10 rounded-full blur-[100px]" />
        <div className="absolute top-12 -right-12 w-64 h-64 bg-slate-400/5 rounded-full blur-[80px]" />
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[420px]"
        >
          <div className="text-center mb-10">
            <div className="lg:hidden h-20 w-20 rounded-[2rem] overflow-hidden shadow-xl shadow-brand/20 mb-6 mx-auto">
              <img src="/logo.png" alt="Metaroll Rewards" className="h-full w-full object-cover" />
            </div>
            <h2 className="text-4xl font-black tracking-tight mb-2 text-premium">Metaroll Rewards</h2>
            <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.4em] opacity-60">Premium Reward Ecosystem</p>
          </div>

          <Card className="border-none glass-3d rounded-[2.5rem] overflow-hidden p-2">
            <CardHeader className="pt-8 pb-4 text-center">
              <AnimatePresence mode="wait">
                {!confirmResult ? (
                  <motion.div
                    key="step1-header"
                    variants={stepVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="space-y-1"
                  >
                    <CardTitle className="text-2xl font-black text-slate-900">Get Started</CardTitle>
                    <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Enter your mobile number to continue
                    </CardDescription>
                  </motion.div>
                ) : (
                  <motion.div
                    key="step2-header"
                    variants={stepVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="space-y-1"
                  >
                    <CardTitle className="text-2xl font-black text-slate-900">Verify OTP</CardTitle>
                    <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      A 6-digit code was sent to +91 {phoneNumber}
                    </CardDescription>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardHeader>

            <CardContent className="px-6 pt-2 pb-8">
              <form onSubmit={confirmResult ? handleVerify : handleSendOtp} className="space-y-6">
                <AnimatePresence mode="wait">
                  {!confirmResult ? (
                    <motion.div
                      key="phone-input"
                      variants={stepVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center">
                          <Phone className="h-3 w-3 mr-2 text-brand" />
                          Mobile Number
                        </label>
                        <div className="relative group">
                          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm border-r border-slate-100 pr-4">+91</div>
                          <Input 
                            type="tel" 
                            placeholder="00000 00000" 
                            className="pl-20 h-16 bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-brand/20 rounded-2xl text-xl font-black tracking-widest transition-all"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                            disabled={isLoading}
                            maxLength={10}
                            autoFocus
                          />
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="otp-input"
                      variants={stepVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center">
                          <ShieldCheck className="h-3 w-3 mr-2 text-brand" />
                          Verification Code
                        </label>
                        <Input 
                          type="text" 
                          placeholder="••••••" 
                          className="h-16 text-center tracking-[1em] font-black text-3xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-brand/20 rounded-2xl transition-all"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                          maxLength={6}
                          autoFocus
                          disabled={isLoading}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className={cn(
                    "w-full h-16 font-black text-sm uppercase tracking-[0.2em] rounded-2xl transition-all duration-500 shadow-xl shadow-indigo-100 relative overflow-hidden group active:scale-95",
                    confirmResult ? "bg-slate-900 hover:bg-slate-800" : "bg-brand hover:bg-brand-hover"
                  )}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-3">
                      <div className="h-5 w-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                      <span className="opacity-80">Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <span>{confirmResult ? "Confirm & Enter" : "Send OTP"}</span>
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="flex flex-col gap-6 pb-10">
              {confirmResult && (
                <button 
                  type="button"
                  onClick={() => {
                    setConfirmResult(null)
                    setOtp("")
                  }}
                  className="text-brand text-[10px] font-black uppercase tracking-widest hover:opacity-70 transition-opacity"
                >
                  Use different mobile number
                </button>
              )}
              
              <div className="flex items-center justify-center gap-4 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3 w-3 text-emerald-500" />
                  Secure
                </div>
                <div className="h-1 w-1 rounded-full bg-slate-200" />
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-brand" />
                  Firebase Verified
                </div>
              </div>
            </CardFooter>
          </Card>
          
          <div className="mt-12 text-center space-y-4">
            <div className="flex justify-center gap-8">
              <button className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-brand transition-colors" onClick={() => comingSoon("Support")}>Support</button>
              <button className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-brand transition-colors" onClick={() => comingSoon("Privacy")}>Privacy Policy</button>
            </div>
            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.4em]">
              Metaroll Rewards • Build v4.0.0
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function FeatureItem({ text }: { text: string }) {
  return (
    <motion.div 
      whileHover={{ x: 5 }}
      className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 backdrop-blur-sm"
    >
      <div className="h-6 w-6 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
        <CheckCircle2 className="h-3.5 w-3.5 text-brand" />
      </div>
      <span className="text-sm font-bold text-slate-200 tracking-wide">{text}</span>
    </motion.div>
  )
}
