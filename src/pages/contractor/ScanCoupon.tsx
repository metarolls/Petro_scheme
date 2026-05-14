import * as React from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, Info, HelpCircle, Loader2 } from "lucide-react"
import { ScannerBox } from "@/components/contractor/ScannerBox"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { parseCouponQR } from "@/lib/contractor/qrParser"
import { toast } from "sonner"
import { mockCoupon } from "@/data/contractor/mockCoupon"
import { db } from "@/lib/firebase"
import { doc, runTransaction, collection, serverTimestamp } from "firebase/firestore"

export function ScanCoupon() {
  const navigate = useNavigate()
  const [manualData, setManualData] = React.useState("")
  const [isProcessing, setIsProcessing] = React.useState(false)

  const contractorId = localStorage.getItem("contractorId")
  const contractorName = localStorage.getItem("contractorName") || "Contractor"
  const contractorFirm = localStorage.getItem("contractorFirm")

  const handleScan = async (data: string) => {
    const couponData = parseCouponQR(data)
    
    if (!couponData) {
      toast.error("Invalid QR Code data")
      return
    }

    if (!contractorId) {
      toast.error("Session expired. Please login again.")
      navigate("/contractor/login")
      return
    }

    setIsProcessing(true)
    try {
      await runTransaction(db, async (transaction) => {
        const couponRef = doc(db, "coupons", couponData.couponId)
        const contractorRef = doc(db, "dealers", contractorId) // We store contractors in 'dealers' collection for simplicity or 'contractors' if you prefer. 
        // Wait, looking at ContractorLogin.tsx, it checks 'dealers' collection for contractors? Let me check.
        
        const cSnap = await transaction.get(couponRef)
        const dSnap = await transaction.get(contractorRef)

        if (!cSnap.exists()) throw new Error("Invalid Coupon Code")
        if (!dSnap.exists()) throw new Error("Contractor record not found")

        const coupon = cSnap.data()
        if (coupon.status !== "Active") throw new Error("This coupon is already claimed")

        // 1. Mark Coupon as Claimed
        transaction.update(couponRef, {
          status: "Claimed",
          claimedBy: contractorId,
          claimedAt: serverTimestamp()
        })

        // 2. Add Reward to Wallet
        const currentBalance = dSnap.data().walletBalance || 0
        transaction.update(contractorRef, {
          walletBalance: currentBalance + coupon.rewardValue
        })

        // 3. Log History
        const historyRef = doc(collection(db, "wallet_history"))
        transaction.set(historyRef, {
          type: 'reward',
          status: 'completed',
          sourceId: coupon.dealerId,
          sourceName: "Dealer Reward",
          destinationId: contractorId,
          destinationName: contractorFirm || contractorName,
          amount: coupon.rewardValue,
          timestamp: serverTimestamp(),
          note: `Reward for ${coupon.weightKg} Kg purchase`,
          couponId: coupon.couponId
        })
      })

      toast.success(`Reward of ₹${couponData.rewardValue} added to wallet!`)
      navigate(`/contractor/reward-success/${couponData.couponId}`, { state: { coupon: couponData } })
    } catch (error: any) {
      console.error("Claim Error:", error)
      toast.error(error.message || "Failed to claim reward")
    } finally {
      setIsProcessing(false)
    }
  }

  const useMockCoupon = () => {
    handleScan(JSON.stringify(mockCoupon))
  }

  return (
    <div className="p-6 space-y-8 animate-in slide-in-from-right-4 duration-300">
      <div className="flex items-center space-x-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-full shadow-sm border border-slate-100">
          <ChevronLeft className="h-6 w-6 text-slate-900" />
        </button>
        <h1 className="text-xl font-black text-slate-900">Scan Coupon</h1>
      </div>

      <div className="relative">
        {isProcessing && (
          <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-[32px]">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-brand mx-auto" />
              <p className="text-sm font-black text-navy">Processing Reward...</p>
            </div>
          </div>
        )}
        
        <ScannerBox 
          title="डीलरचा कूपन QR स्कॅन करा"
          hint="Scan dealer coupon QR code to earn reward"
          onScan={handleScan}
        />
      </div>

      <div className="space-y-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-50 px-4 text-slate-400 font-bold tracking-widest">Or test with</span>
          </div>
        </div>

        <div className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full h-14 rounded-2xl border-2 border-slate-200 font-bold bg-white"
            onClick={useMockCoupon}
            disabled={isProcessing}
          >
            <HelpCircle className="h-5 w-5 mr-2 text-blue-600" />
            Use Mock Coupon
          </Button>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Paste QR Data Manually</label>
            <div className="flex space-x-2">
              <Input 
                placeholder='{"couponId": "...", ...}'
                value={manualData}
                onChange={(e) => setManualData(e.target.value)}
                className="h-12 bg-white border-slate-100 rounded-xl text-xs font-mono"
                disabled={isProcessing}
              />
              <Button 
                className="h-12 bg-slate-900 text-white rounded-xl font-bold px-4"
                onClick={() => handleScan(manualData)}
                disabled={isProcessing}
              >
                Scan
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 p-4 rounded-2xl flex items-start space-x-3 border border-amber-100">
        <Info className="h-5 w-5 text-amber-600 mt-0.5" />
        <p className="text-xs text-amber-900 font-medium leading-relaxed">
          Each coupon can only be scanned once. The reward amount will be instantly added to your wallet.
        </p>
      </div>
    </div>
  )
}
