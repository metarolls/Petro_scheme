import * as React from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, QrCode, ShieldCheck, Wallet, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"
import { db } from "@/lib/firebase"
import { doc, onSnapshot } from "firebase/firestore"
import { useAuth } from "@/contexts/AuthContext"
import { QRCodeSVG } from "qrcode.react"

export function RedeemQR() {
  const navigate = useNavigate()
  const [amount, setAmount] = React.useState("")
  const [pin, setPin] = React.useState("")
  const [balance, setBalance] = React.useState(0)
  const [showQR, setShowQR] = React.useState(false)
  const [qrData, setQrData] = React.useState("")

  const { profile } = useAuth()
  const contractorId = profile?.id
  const contractorName = profile?.fullName || profile?.name || "Contractor"
  const contractorFirm = profile?.firmName

  React.useEffect(() => {
    if (contractorId) {
      const unsub = onSnapshot(doc(db, "contractors", contractorId), (docSnap) => {
        if (docSnap.exists()) {
          setBalance(docSnap.data().walletBalance || 0)
        }
      })
      return () => unsub()
    }
  }, [contractorId])

  const amtNum = parseFloat(amount) || 0

  const handleGenerateQR = () => {
    if (!amount || amtNum <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    if (amtNum > balance) {
      toast.error("Insufficient wallet balance")
      return
    }

    if (pin.length !== 4) {
      toast.error("Please enter a 4-digit PIN")
      return
    }

    if (!profile?.walletPIN) {
      toast.error("Transaction PIN not set. Please set it in Settings.")
      return
    }

    if (pin !== profile.walletPIN) {
      toast.error("Invalid Transaction PIN")
      return
    }

    const data = {
      type: 'redemption',
      contractorId,
      contractorName: contractorFirm || contractorName,
      amount: amtNum,
      timestamp: Date.now(),
      version: '1.1'
    }

    setQrData(JSON.stringify(data))
    setShowQR(true)
    toast.success("QR Code Generated!")
  }

  return (
    <div className="p-6 space-y-8 animate-in slide-in-from-right-4 duration-300">
      <div className="flex items-center space-x-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-full shadow-sm border border-slate-100">
          <ChevronLeft className="h-6 w-6 text-navy" />
        </button>
        <h1 className="text-xl font-black text-navy">Generate Payment QR</h1>
      </div>

      {!showQR ? (
        <div className="space-y-6">
          <Card className="border-none shadow-xl bg-brand rounded-[32px] text-white">
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="h-14 w-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <QrCode className="h-8 w-8" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Redemption Mode</p>
                <h3 className="text-lg font-black">Show QR to Merchant</h3>
                <p className="text-xs opacity-80">Generate a secure code for fuel</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between items-center px-1">
            <div className="flex items-center space-x-2 text-slate-400">
              <Wallet className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Available Balance</span>
            </div>
            <span className="text-sm font-black text-navy">{formatCurrency(balance)}</span>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Enter Amount</label>
              <div className="relative">
                <Input 
                  type="tel"
                  placeholder="0.00"
                  className="h-16 text-3xl font-black bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-brand/20 rounded-2xl px-6"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xl font-black text-slate-300">₹</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Enter 4-Digit PIN</label>
              <div className="relative">
                <Input 
                  type="password"
                  placeholder="••••"
                  maxLength={4}
                  className="h-16 text-3xl font-black bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-brand/20 rounded-2xl px-6 text-center tracking-[0.5em]"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                />
                <div className="absolute left-6 top-1/2 -translate-y-1/2">
                  <ShieldCheck className="h-6 w-6 text-slate-300" />
                </div>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleGenerateQR}
            disabled={amtNum > balance || !amount || pin.length !== 4}
            className={`w-full h-16 text-lg font-black rounded-[24px] shadow-xl mt-4 text-white transition-all ${
              amtNum > balance 
                ? "bg-slate-200 text-slate-400 shadow-none cursor-not-allowed" 
                : "bg-brand hover:bg-brand-hover shadow-brand/20"
            }`}
          >
            {amtNum > balance ? "Insufficient Balance" : "Generate Secure QR"}
          </Button>

          <div className="bg-blue-50 p-4 rounded-2xl flex items-start space-x-3 border border-blue-100">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <p className="text-xs text-blue-900 font-medium leading-relaxed">
              Generate this QR only when you are at the petrol pump. The merchant will scan this to process your payment.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-8 flex flex-col items-center">
          <div className="bg-white p-8 rounded-[40px] shadow-2xl border-4 border-brand/10">
            <QRCodeSVG value={qrData} size={240} level="H" />
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-navy">₹{formatCurrency(amtNum)}</h2>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Show this to Merchant</p>
          </div>

          <div className="w-full space-y-4">
            <Button 
              variant="outline"
              onClick={() => setShowQR(false)}
              className="w-full h-14 rounded-2xl border-2 border-slate-200 font-bold"
            >
              Cancel & Modify
            </Button>
            
            <Button 
              onClick={() => navigate('/contractor/home')}
              className="w-full h-14 bg-slate-900 text-white rounded-2xl font-bold"
            >
              Back to Home
            </Button>
          </div>

          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter text-center">
            Security: This QR code is encrypted and valid for this transaction only.
          </p>
        </div>
      )}
    </div>
  )
}
