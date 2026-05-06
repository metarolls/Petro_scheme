import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ChevronLeft, Share2, PlusCircle, Home } from "lucide-react"
import { QRCodeCanvas } from "qrcode.react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge } from "@/components/dealer/StatusBadge"
import { formatCurrency } from "@/lib/utils"
import { getWhatsAppShareUrl } from "@/lib/dealer/whatsappShare"
import type { Coupon } from "@/data/dealer/mockCoupons"

export function QRDisplay() {
  const navigate = useNavigate()
  const { couponId } = useParams()
  const [coupon, setCoupon] = React.useState<Coupon | null>(null)

  React.useEffect(() => {
    const savedCoupons = JSON.parse(localStorage.getItem('dealerCoupons') || '[]')
    const found = savedCoupons.find((c: Coupon) => c.couponId === couponId)
    setCoupon(found || null)
  }, [couponId])

  if (!coupon) {
    return <div className="p-10 text-center">Coupon not found</div>
  }

  const qrData = JSON.stringify({
    couponId: coupon.couponId,
    dealerId: coupon.dealerId,
    weightKg: coupon.weightKg,
    rewardValue: coupon.rewardValue,
    generatedAt: coupon.generatedAt
  })

  return (
    <div className="p-6 space-y-8 animate-in zoom-in duration-500">
      <div className="flex items-center space-x-4">
        <button onClick={() => navigate("/dealer/home")} className="p-2 bg-white rounded-full shadow-sm border border-slate-100">
          <ChevronLeft className="h-6 w-6 text-slate-900" />
        </button>
        <h1 className="text-xl font-black text-slate-900">Coupon QR</h1>
      </div>

      <div className="flex flex-col items-center">
        <div className="bg-white p-8 rounded-[40px] shadow-2xl shadow-blue-100 border-8 border-slate-50 mb-8">
          <QRCodeCanvas 
            value={qrData} 
            size={200}
            level="H"
            includeMargin={false}
          />
        </div>

        <Card className="w-full border-none shadow-sm bg-white overflow-hidden rounded-3xl">
          <CardContent className="p-0">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Coupon Details</p>
                <p className="text-sm font-black text-slate-900">{coupon.couponId}</p>
              </div>
              <StatusBadge status={coupon.status} className="h-6 px-3" />
            </div>
            
            <div className="p-6 grid grid-cols-2 gap-y-6">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Weight</p>
                <p className="text-lg font-black text-slate-900">{coupon.weightKg} Kg</p>
                <p className="text-xs text-slate-500">{coupon.weightMT} MT</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Reward Value</p>
                <p className="text-xl font-black text-blue-600">{formatCurrency(coupon.rewardValue)}</p>
              </div>
              <div className="col-span-2 pt-2 border-t border-slate-50">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Generated On</p>
                <p className="text-sm text-slate-600 font-medium">{coupon.generatedAt}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <Button 
          className="w-full h-16 bg-emerald-600 hover:bg-emerald-700 text-lg font-black rounded-3xl shadow-lg shadow-emerald-100"
          onClick={() => window.open(getWhatsAppShareUrl(coupon), '_blank')}
        >
          <Share2 className="h-6 w-6 mr-2" />
          Share on WhatsApp
        </Button>
        
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline"
            className="h-14 font-bold border-2 border-slate-100 rounded-2xl bg-white"
            onClick={() => navigate("/dealer/generate")}
          >
            <PlusCircle className="h-5 w-5 mr-2 text-blue-600" />
            Generate New
          </Button>
          <Button 
            variant="outline"
            className="h-14 font-bold border-2 border-slate-100 rounded-2xl bg-white"
            onClick={() => navigate("/dealer/home")}
          >
            <Home className="h-5 w-5 mr-2 text-slate-600" />
            Go Home
          </Button>
        </div>
      </div>
    </div>
  )
}
