import * as React from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import { auth } from "@/lib/firebase"
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from "firebase/auth"
import { useAuth } from "@/contexts/AuthContext"

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier | undefined;
  }
}

export function ContractorLogin() {
  const { user, role, loading, evaluating } = useAuth()
  const [phoneNumber, setPhoneNumber] = React.useState("")
  const [otp, setOtp] = React.useState("")
  const [showOtp, setShowOtp] = React.useState(false)
  const [isVerifying, setIsVerifying] = React.useState(false)
  const [confirmResult, setConfirmResult] = React.useState<ConfirmationResult | null>(null)
  const navigate = useNavigate()

  // Redirect if already logged in
  React.useEffect(() => {
    if (!loading && !evaluating && user) {
      if (String(role) === 'contractor') {
        navigate("/contractor/home", { replace: true })
      } else if (role !== null && String(role) !== 'contractor') {
        // If logged in as something else (merchant/dealer/admin), redirect to their home
        navigate(`/${role === 'admin' ? 'dashboard' : role + '/home'}`, { replace: true })
      } else if (role === null) {
        // Only sign out if definitively not registered in any role
        toast.error(`तुमचा नंबर कंत्राटदार म्हणून नोंदणीकृत नाही (Not registered as Contractor)\nUID: ${user.uid}`)
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

  const handleSendOtp = async () => {
    if (phoneNumber.length !== 10) {
      toast.error("Please enter a valid 10-digit number")
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

  const handleLogin = async () => {
    if (otp.length < 4) {
      toast.error("Please enter valid OTP")
      return
    }

    setIsVerifying(true)
    try {
      if (!confirmResult) throw new Error("Session expired. Please request OTP again.")
      await confirmResult.confirm(otp)
      toast.success("Login Successful!")
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div id="recaptcha-container"></div>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <Card className="border-none shadow-xl rounded-[32px] overflow-hidden bg-white">
          <CardHeader className="space-y-1 text-center pb-8 pt-10">
            <div className="w-20 h-20 bg-brand rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-brand/20 rotate-3">
              <span className="text-white text-4xl font-black -rotate-3">C</span>
            </div>
            <CardTitle className="text-2xl font-black text-navy">Contractor Wallet</CardTitle>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">कंत्राटदार लॉगिन</p>
          </CardHeader>
          <CardContent className="space-y-5 px-8 pb-10">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mobile Number</label>
              <Input
                type="tel"
                placeholder="Enter 10-digit number"
                className="h-14 bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-brand/20 rounded-2xl text-lg font-bold px-5"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                disabled={showOtp || isVerifying}
              />
            </div>

            <AnimatePresence>
              {showOtp && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="space-y-2"
                >
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">OTP Verification</label>
                  <Input
                    type="password"
                    placeholder="Enter 6-digit OTP"
                    className="h-14 bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-brand/20 rounded-2xl text-lg font-bold tracking-[0.5em] px-5 text-center"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    autoFocus
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {!showOtp ? (
              <Button 
                onClick={handleSendOtp} 
                className="w-full h-14 text-base font-black bg-brand hover:bg-brand-hover shadow-lg shadow-brand/20 rounded-2xl mt-4 text-white"
                disabled={isVerifying}
              >
                {isVerifying ? "Sending..." : "Send OTP"}
              </Button>
            ) : (
              <Button 
                onClick={handleLogin} 
                className="w-full h-14 text-base font-black bg-brand hover:bg-brand-hover shadow-lg shadow-brand/20 rounded-2xl mt-4 text-white"
                disabled={isVerifying}
              >
                {isVerifying ? "Verifying..." : "Verify & Login"}
              </Button>
            )}

            {showOtp && (
              <button 
                onClick={() => {
                  setShowOtp(false)
                  setConfirmResult(null)
                  setOtp("")
                }}
                className="w-full text-xs text-slate-400 font-bold uppercase tracking-widest hover:text-brand transition-colors mt-2"
              >
                Change Number
              </button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

