import * as React from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, Info, HelpCircle } from "lucide-react"
import { ScannerBox } from "@/components/contractor/ScannerBox"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { parseCouponQR } from "@/lib/contractor/qrParser"
import { getWalletBalance, setWalletBalance, addTransaction, isCouponScanned, markCouponAsScanned } from "@/lib/contractor/walletStorage"
import { generateTransaction } from "@/lib/contractor/transactionGenerator"
import { toast } from "sonner"
import { mockCoupon } from "@/data/contractor/mockCoupon"

export function ScanCoupon() {
  const navigate = useNavigate()
  const [manualData, setManualData] = React.useState("")

  const handleScan = (data: string) => {
    const coupon = parseCouponQR(data)
    
    if (!coupon) {
      toast.error("Invalid QR Code data")
      return
    }

    if (isCouponScanned(coupon.couponId)) {
      toast.error("This coupon is already used")
      return
    }

    // Process Reward
    const currentBalance = getWalletBalance()
    const newBalance = currentBalance + coupon.rewardValue
    
    setWalletBalance(newBalance)
    markCouponAsScanned(coupon.couponId)
    
    const txn = generateTransaction(
      "Reward Earned",
      "Dealer Coupon",
      coupon.rewardValue,
      "credit",
      { couponId: coupon.couponId }
    )
    addTransaction(txn)

    navigate(`/contractor/reward-success/${coupon.couponId}`, { state: { coupon } })
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

      <ScannerBox 
        title="डीलरचा कूपन QR स्कॅन करा"
        hint="Scan dealer coupon QR code to earn reward"
        onScan={handleScan}
      />

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
              />
              <Button 
                className="h-12 bg-slate-900 text-white rounded-xl font-bold px-4"
                onClick={() => handleScan(manualData)}
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
