import { Download, Share2, Info } from "lucide-react"
import { QRDisplay } from "@/components/merchant/QRDisplay"
import { Button } from "@/components/ui/button"
import { mockMerchantPump } from "@/data/merchant/mockPump"
import { toast } from "sonner"

export function PumpQR() {
  const handleDownload = () => {
    toast.success("QR code downloaded successfully")
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Pump Payment QR',
          text: `Pay for fuel at ${mockMerchantPump.pumpName}`,
          url: window.location.href,
        })
      } catch (err) {
        console.error(err)
      }
    } else {
      toast.info("QR data copied to clipboard")
    }
  }

  return (
    <div className="p-6 space-y-8 animate-in slide-in-from-right-4 duration-300">
      <div className="text-center space-y-2">
        <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Pump Payment QR</h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">तुमचा पंप QR कोड</p>
      </div>

      <QRDisplay pumpData={mockMerchantPump} />

      <div className="grid grid-cols-2 gap-4">
        <Button 
          variant="outline" 
          className="h-16 border-2 border-slate-100 rounded-[24px] font-black uppercase text-[10px] tracking-widest bg-white"
          onClick={handleDownload}
        >
          <Download className="h-5 w-5 mr-2 text-blue-600" />
          Download QR
        </Button>
        <Button 
          variant="outline" 
          className="h-16 border-2 border-slate-100 rounded-[24px] font-black uppercase text-[10px] tracking-widest bg-white"
          onClick={handleShare}
        >
          <Share2 className="h-5 w-5 mr-2 text-blue-600" />
          Share QR
        </Button>
      </div>

      <div className="bg-blue-50 p-6 rounded-[32px] border border-blue-100 space-y-4">
        <div className="flex items-center space-x-3 text-blue-600">
          <Info className="h-5 w-5" />
          <h4 className="text-xs font-black uppercase tracking-widest">How to use?</h4>
        </div>
        <p className="text-[11px] text-blue-900/70 font-medium leading-relaxed">
          १. हे क्युआर कोड प्रिंट करून पंपावर लावा.<br/>
          २. कंत्राटदार त्यांच्या वॉलेटमधून हे स्कॅन करतील.<br/>
          ३. पेमेंट झाल्यानंतर तुम्हाला 'Live' मध्ये लगेच दिसेल.
        </p>
      </div>
    </div>
  )
}
