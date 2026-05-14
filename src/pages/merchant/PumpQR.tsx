import * as React from "react"
import { Download, Share2, Info } from "lucide-react"
import { QRDisplay } from "@/components/merchant/QRDisplay"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { mockMerchantPump } from "@/data/merchant/mockPump"
import { toast } from "sonner"
import { motion } from "framer-motion"

export function PumpQR() {
  const [amount, setAmount] = React.useState("")
  
  const handleDownload = () => {
    toast.success("QR code downloaded successfully")
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Pump Payment QR',
          text: `Pay for fuel at ${mockMerchantPump.pumpName}${amount ? ` - Amount: ₹${amount}` : ''}`,
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
    <div className="min-h-screen bg-[#f8fafc] pb-24">
      <div className="bg-white px-6 pt-12 pb-6 border-b border-slate-100 backdrop-blur-md bg-white/80 sticky top-0 z-30">
        <div className="flex justify-between items-center mb-1">
          <div>
            <p className="text-[10px] font-black text-brand uppercase tracking-[0.2em] mb-1">Point of Sale</p>
            <h1 className="text-2xl font-black text-navy tracking-tight">Accept Payments</h1>
          </div>
          <div className="p-3 bg-brand-soft rounded-2xl">
            <Share2 className="h-5 w-5 text-brand" />
          </div>
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Display this QR at your pump station</p>
      </div>

      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Enter Amount (Optional)</label>
          <div className="relative">
            <Input 
              type="tel"
              placeholder="Leave blank for open payment"
              className="h-14 bg-white border-slate-100 rounded-2xl px-6 font-bold text-lg"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
            />
            <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-slate-300">₹</span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", damping: 20 }}
          className="bg-white p-2 rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
        >
          <div className="bg-navy p-8 rounded-[2.5rem] flex flex-col items-center">
            <div className="bg-white p-6 rounded-3xl shadow-xl mb-6">
              <QRDisplay pumpData={mockMerchantPump} amount={amount} />
            </div>
            <h3 className="text-white text-lg font-black tracking-tight mb-1">{mockMerchantPump.pumpName}</h3>
            <p className="text-[10px] font-black text-brand uppercase tracking-widest mb-4">ID: {mockMerchantPump.pumpId}</p>
            
            {amount && (
              <div className="mb-4 px-4 py-2 bg-brand/20 rounded-2xl border border-brand/30">
                <p className="text-xs font-black text-white">Fixed Amount: ₹{amount}</p>
              </div>
            )}

            <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full">
              <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
              <span className="text-[8px] font-black text-white uppercase tracking-widest">Secure Payment Gateway</span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 gap-4">
          <Button 
            variant="outline" 
            className="h-20 border-none shadow-lg shadow-slate-200/50 rounded-[2rem] font-black uppercase text-[10px] tracking-widest bg-white flex flex-col items-center justify-center gap-2 group transition-all active:scale-95"
            onClick={handleDownload}
          >
            <Download className="h-6 w-6 text-brand transition-transform group-hover:-translate-y-1" />
            Download
          </Button>
          <Button 
            variant="outline" 
            className="h-20 border-none shadow-lg shadow-slate-200/50 rounded-[2rem] font-black uppercase text-[10px] tracking-widest bg-white flex flex-col items-center justify-center gap-2 group transition-all active:scale-95"
            onClick={handleShare}
          >
            <Share2 className="h-6 w-6 text-brand transition-transform group-hover:-translate-y-1" />
            Share Link
          </Button>
        </div>

        <div className="bg-navy p-6 rounded-[2.5rem] relative overflow-hidden">
          <div className="absolute inset-0 bg-brand/10" />
          <div className="relative z-10 flex items-start gap-4">
            <div className="h-10 w-10 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm shrink-0">
              <Info className="h-5 w-5 text-brand" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-widest mb-3">Setup Instructions</h4>
              <ul className="space-y-2">
                <li className="text-[10px] text-slate-300 font-bold leading-relaxed flex gap-2">
                  <span className="text-brand">01.</span> Print this QR and display it prominently at your pump station.
                </li>
                <li className="text-[10px] text-slate-300 font-bold leading-relaxed flex gap-2">
                  <span className="text-brand">02.</span> Contractors scan this using their Wallet app to pay.
                </li>
                <li className="text-[10px] text-slate-300 font-bold leading-relaxed flex gap-2">
                  <span className="text-brand">03.</span> Payments appear in your "Live Feed" instantly.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
