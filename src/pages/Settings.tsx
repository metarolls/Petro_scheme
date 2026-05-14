import * as React from "react"
import { User, Shield, Globe, Bell } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { comingSoon } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export function Settings() {
  const { profile, updateWalletPIN } = useAuth()
  const [language, setLanguage] = React.useState<'en' | 'mr'>('en')
  const [notifications, setNotifications] = React.useState({
    rewards: true,
    payments: true
  })

  // PIN state
  const [pinData, setPinData] = React.useState({
    current: '',
    new: '',
    confirm: ''
  })
  const [isUpdatingPin, setIsUpdatingPin] = React.useState(false)

  const handleUpdatePin = async () => {
    if (pinData.new.length !== 4) {
      toast.error("New PIN must be 4 digits")
      return
    }
    if (pinData.new !== pinData.confirm) {
      toast.error("New PIN and Confirm PIN do not match")
      return
    }
    if (profile?.walletPIN && !pinData.current) {
      toast.error("Please enter your current PIN")
      return
    }

    try {
      setIsUpdatingPin(true)
      await updateWalletPIN(pinData.new, pinData.current)
      toast.success(profile?.walletPIN ? "PIN updated successfully" : "PIN set successfully")
      setPinData({ current: '', new: '', confirm: '' })
    } catch (error: any) {
      toast.error(error.message || "Failed to update PIN")
    } finally {
      setIsUpdatingPin(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  }

  return (
    <motion.div 
      className="space-y-8 pb-20 max-w-4xl mx-auto"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-sm text-slate-500 font-medium">Manage your Metaroll Rewards account and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Section */}
        <motion.div variants={itemVariants}>
          <Card className="h-full border-none shadow-xl shadow-indigo-100/50 rounded-3xl overflow-hidden bg-white border border-slate-100">
            <CardHeader className="bg-indigo-50/50 border-b border-indigo-100/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-600 rounded-xl">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900">Profile Details</CardTitle>
                  <CardDescription className="text-[10px] font-medium text-slate-500">Update your personal information</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                <Input value={profile?.fullName || profile?.name || "User"} readOnly className="bg-slate-50 border-slate-100 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl h-11 text-sm font-semibold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Mobile Number</label>
                <Input value={profile?.mobile || profile?.id || "N/A"} readOnly className="bg-slate-50 border-slate-100 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl h-11 text-sm font-semibold" />
              </div>
              <Button 
                onClick={() => comingSoon("Profile Update")}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-11 font-bold transition-all shadow-lg shadow-indigo-200 mt-2"
              >
                Update Profile
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security PIN Section */}
        <motion.div variants={itemVariants}>
          <Card className="h-full border-none shadow-xl shadow-indigo-100/50 rounded-3xl overflow-hidden bg-white border border-slate-100">
            <CardHeader className="bg-slate-50 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-900 rounded-xl">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900">Security PIN</CardTitle>
                  <CardDescription className="text-[10px] font-medium text-slate-500">Secure your transactions</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {profile?.walletPIN && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Current PIN</label>
                  <Input 
                    type="password" 
                    placeholder="••••" 
                    value={pinData.current}
                    onChange={(e) => setPinData(prev => ({ ...prev, current: e.target.value.replace(/\D/g, '') }))}
                    className="bg-slate-50 border-slate-100 focus:ring-slate-500 rounded-xl h-11 text-center text-xl tracking-[0.5em] font-bold" 
                    maxLength={4} 
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">New PIN</label>
                  <Input 
                    type="password" 
                    placeholder="••••" 
                    value={pinData.new}
                    onChange={(e) => setPinData(prev => ({ ...prev, new: e.target.value.replace(/\D/g, '') }))}
                    className="bg-slate-50 border-slate-100 focus:ring-slate-500 rounded-xl h-11 text-center text-xl tracking-[0.5em] font-bold" 
                    maxLength={4} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Confirm</label>
                  <Input 
                    type="password" 
                    placeholder="••••" 
                    value={pinData.confirm}
                    onChange={(e) => setPinData(prev => ({ ...prev, confirm: e.target.value.replace(/\D/g, '') }))}
                    className="bg-slate-50 border-slate-100 focus:ring-slate-500 rounded-xl h-11 text-center text-xl tracking-[0.5em] font-bold" 
                    maxLength={4} 
                  />
                </div>
              </div>
              <Button 
                onClick={handleUpdatePin}
                disabled={isUpdatingPin}
                variant={profile?.walletPIN ? "outline" : "default"}
                className={cn(
                  "w-full rounded-xl h-11 font-bold transition-all mt-2",
                  !profile?.walletPIN && "bg-slate-900 hover:bg-slate-800 text-white"
                )}
              >
                {isUpdatingPin ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  profile?.walletPIN ? "Change Transaction PIN" : "Setup Transaction PIN"
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Language & Preferences */}
        <motion.div variants={itemVariants}>
          <Card className="h-full border-none shadow-xl shadow-indigo-100/50 rounded-3xl overflow-hidden bg-white border border-slate-100">
            <CardHeader className="bg-indigo-50/50 border-b border-indigo-100/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-xl">
                  <Globe className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900">Language</CardTitle>
                  <CardDescription className="text-[10px] font-medium text-slate-500">Choose your interface language</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex p-1 bg-slate-100 rounded-2xl relative h-14">
                <motion.div 
                  className="absolute inset-y-1 bg-white rounded-xl shadow-md z-10"
                  initial={false}
                  animate={{ 
                    width: "calc(50% - 4px)",
                    left: language === 'en' ? 4 : "calc(50% + 0px)"
                  }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
                <button 
                  onClick={() => setLanguage('en')}
                  className={`flex-1 flex items-center justify-center text-sm font-bold relative z-20 transition-colors ${language === 'en' ? 'text-indigo-600' : 'text-slate-400'}`}
                >
                  English
                </button>
                <button 
                  onClick={() => setLanguage('mr')}
                  className={`flex-1 flex items-center justify-center text-sm font-bold relative z-20 transition-colors ${language === 'mr' ? 'text-indigo-600' : 'text-slate-400'}`}
                >
                  मराठी
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notifications Section */}
        <motion.div variants={itemVariants}>
          <Card className="h-full border-none shadow-xl shadow-indigo-100/50 rounded-3xl overflow-hidden bg-white border border-slate-100">
            <CardHeader className="bg-amber-50/50 border-b border-amber-100/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-xl">
                  <Bell className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900">Notifications</CardTitle>
                  <CardDescription className="text-[10px] font-medium text-slate-500">Stay updated with alerts</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-2xl transition-colors border border-transparent hover:border-slate-100">
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-slate-900">New Rewards</p>
                  <p className="text-[10px] text-slate-500 font-medium">Alert when new coupons are credited</p>
                </div>
                <button 
                  onClick={() => setNotifications(prev => ({ ...prev, rewards: !prev.rewards }))}
                  className={`h-6 w-11 rounded-full transition-colors relative ${notifications.rewards ? 'bg-indigo-600' : 'bg-slate-200'}`}
                >
                  <motion.div 
                    animate={{ left: notifications.rewards ? 22 : 4 }}
                    className="absolute top-1 h-4 w-4 bg-white rounded-full shadow-sm" 
                  />
                </button>
              </div>
              <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-2xl transition-colors border border-transparent hover:border-slate-100">
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-slate-900">Payment Success</p>
                  <p className="text-[10px] text-slate-500 font-medium">Alert after every successful fuel payment</p>
                </div>
                <button 
                  onClick={() => setNotifications(prev => ({ ...prev, payments: !prev.payments }))}
                  className={`h-6 w-11 rounded-full transition-colors relative ${notifications.payments ? 'bg-indigo-600' : 'bg-slate-200'}`}
                >
                  <motion.div 
                    animate={{ left: notifications.payments ? 22 : 4 }}
                    className="absolute top-1 h-4 w-4 bg-white rounded-full shadow-sm" 
                  />
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
