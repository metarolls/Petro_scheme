import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

export function DealerLogin() {
  const [phoneNumber, setPhoneNumber] = React.useState("")
  const [otp, setOtp] = React.useState("")
  const [showOtp, setShowOtp] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const navigate = useNavigate()

  const handleSendOtp = () => {
    if (phoneNumber.length !== 10) {
      toast.error("Please enter a valid 10-digit number")
      return
    }
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setShowOtp(true)
      toast.success("OTP sent to your number")
    }, 1000)
  }

  const handleLogin = () => {
    if (otp !== "1234") {
      toast.error("Invalid OTP. Use 1234 for demo.")
      return
    }
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      toast.success("Login Successful!")
      navigate("/dealer/home")
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <Card className="border-none shadow-xl">
          <CardHeader className="space-y-1 text-center pb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
              <span className="text-white text-3xl font-black">D</span>
            </div>
            <CardTitle className="text-2xl font-black text-slate-900">Dealer Coupon App</CardTitle>
            <p className="text-sm text-muted-foreground">डीलर लॉगिन</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Phone Number</label>
              <Input
                type="tel"
                placeholder="Enter 10-digit number"
                className="h-12 bg-slate-50 border-slate-100"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
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
                    placeholder="Enter 4-digit OTP"
                    className="h-12 bg-slate-50 border-slate-100"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {!showOtp ? (
              <Button 
                onClick={handleSendOtp} 
                className="w-full h-12 text-base font-bold bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send OTP"}
              </Button>
            ) : (
              <Button 
                onClick={handleLogin} 
                className="w-full h-12 text-base font-bold bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? "Verifying..." : "Verify & Login"}
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
