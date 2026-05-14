import * as React from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, Info, Cpu, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { calculateReward } from "@/lib/dealer/rewardCalculator"
import { generateCoupon } from "@/lib/dealer/couponGenerator"
import { toast } from "sonner"
import { mtToKg } from "@/lib/dealer/rewardCalculator"
import { db } from "@/lib/firebase"
import { doc, runTransaction, onSnapshot, serverTimestamp } from "firebase/firestore"

export function GenerateQR() {
  const navigate = useNavigate()
  const [weightKg, setWeightKg] = React.useState("")
  const [stock, setStock] = React.useState(0)
  const [isGenerating, setIsGenerating] = React.useState(false)
  
  const dealerId = localStorage.getItem("dealerId")

  React.useEffect(() => {
    if (!dealerId) {
      navigate("/dealer/login")
      return
    }

    const unsub = onSnapshot(doc(db, "dealers", dealerId), (docSnap) => {
      if (docSnap.exists()) {
        setStock(docSnap.data().availableStockMT || 0)
      }
    })

    return () => unsub()
  }, [dealerId, navigate])

  const availableKg = mtToKg(stock)
  const reward = weightKg ? calculateReward(parseFloat(weightKg)) : 0

  const handleGenerate = async () => {
    const weightNum = parseFloat(weightKg)
    
    if (!weightKg || weightNum <= 0) {
      toast.error("Please enter a valid weight")
      return
    }

    if (weightNum > availableKg) {
      toast.error(`Weight exceeds available stock (${availableKg} Kg)`)
      return
    }

    if (!dealerId) return

    setIsGenerating(true)
    try {
      const newCoupon = generateCoupon(dealerId, weightNum)
      
      await runTransaction(db, async (transaction) => {
        const dealerRef = doc(db, "dealers", dealerId)
        const dSnap = await transaction.get(dealerRef)
        
        if (!dSnap.exists()) throw new Error("Dealer not found")
        
        const currentStock = dSnap.data().availableStockMT || 0
        const weightMT = weightNum / 1000
        
        if (currentStock < weightMT) throw new Error("Insufficient stock")
        
        // 1. Deduct Stock
        transaction.update(dealerRef, { 
          availableStockMT: currentStock - weightMT 
        })
        
        // 2. Create Coupon Record
        const couponRef = doc(db, "coupons", newCoupon.couponId)
        transaction.set(couponRef, {
          ...newCoupon,
          createdAt: serverTimestamp(),
          status: "Active"
        })
      })

      toast.success("Coupon generated successfully!")
      navigate(`/dealer/qr/${newCoupon.couponId}`)
    } catch (error: any) {
      console.error("Generation Error:", error)
      toast.error(error.message || "Failed to generate coupon")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-full shadow-sm border border-slate-100">
          <ChevronLeft className="h-6 w-6 text-slate-900" />
        </button>
        <h1 className="text-xl font-black text-slate-900">Generate QR Code</h1>
      </div>

      <Card className="border-none shadow-sm bg-blue-50/50">
        <CardContent className="p-4 flex items-center space-x-3">
          <div className="bg-blue-600/10 p-2 rounded-xl text-blue-600">
            <Info className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium text-blue-800">Available: <span className="font-bold">{availableKg.toLocaleString()} Kg</span></p>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-600 ml-1">Enter Weight Sold (in Kg)</label>
          <div className="relative">
            <Input
              type="tel"
              placeholder="e.g. 500"
              className="h-16 text-2xl font-black border-2 border-slate-100 focus-visible:border-blue-600 transition-colors"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value.replace(/\D/g, ''))}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Kg</span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium ml-1">Example: 1000 Kg = 1 MT</p>
        </div>

        <Card className="border-2 border-dashed border-slate-200 shadow-none bg-transparent">
          <CardContent className="p-6 text-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Estimated Reward</p>
            <h3 className="text-3xl font-black text-blue-600">₹{reward.toLocaleString()}</h3>
            <p className="text-[10px] text-slate-400 mt-1">@ ₹2 per Kg sold</p>
          </CardContent>
        </Card>

        <Button 
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full h-16 text-lg font-black bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-100 rounded-3xl text-white"
        >
          {isGenerating ? <Loader2 className="h-6 w-6 animate-spin" /> : (
            <>
              <Cpu className="h-6 w-6 mr-2" />
              Generate QR Code
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
