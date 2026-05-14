import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

import { auth } from "@/lib/firebase"
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from "firebase/auth"
import { useAuth } from "@/contexts/AuthContext"

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier | undefined;
  }
}

export function DealerLogin() {
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
      if (role === 'dealer') {
        navigate("/dealer/home", { replace: true })
      } else if (role !== null && String(role) !== 'dealer') {
        // If logged in as something else (merchant/contractor/admin), redirect to their home
        navigate(`/${role === 'admin' ? 'dashboard' : role + '/home'}`, { replace: true })
      } else if (role === null) {
        // Only sign out if definitively not registered in any role
        toast.error(`तुमचा नंबर डीलर म्हणून नोंदणीकृत नाही (Not registered as Dealer)\nUID: ${user.uid}`)
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
      toast.success("Verification Successful!")
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
        <Card className="border-none shadow-xl">
          <CardHeader className="space-y-1 text-center pb-8">
            <div className="w-16 h-16 bg-brand rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand/20">
              <span className="text-white text-3xl font-black">D</span>
            </div>
            <CardTitle className="text-2xl font-black text-navy">Dealer Coupon App</CardTitle>
            <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold">डीलर लॉगिन</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Phone Number</label>
              <Input
                type="tel"
                placeholder="Enter 10-digit number"
                className="h-12 bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-brand/20"
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
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Enter OTP</label>
                  <Input
                    type="password"
                    placeholder="Enter 6-digit OTP"
                    className="h-12 bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-brand/20"
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
                className="w-full h-12 text-base font-bold bg-brand hover:bg-brand-hover text-white shadow-lg shadow-brand/10"
                disabled={isVerifying}
              >
                {isVerifying ? "Sending..." : "Send OTP"}
              </Button>
            ) : (
              <Button 
                onClick={handleLogin} 
                className="w-full h-12 text-base font-bold bg-brand hover:bg-brand-hover text-white shadow-lg shadow-brand/10"
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


