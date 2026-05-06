import * as React from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, Info, Search } from "lucide-react"
import { ScannerBox } from "@/components/contractor/ScannerBox"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { parsePumpQR } from "@/lib/contractor/qrParser"
import { toast } from "sonner"
import { mockPump } from "@/data/contractor/mockPump"

export function ScanPump() {
  const navigate = useNavigate()
  const [manualData, setManualData] = React.useState("")

  const handleScan = (data: string) => {
    const pump = parsePumpQR(data)
    
    if (!pump) {
      toast.error("Invalid Pump QR Code")
      return
    }

    // Save pump info in state or temp storage for the payment screen
    sessionStorage.setItem('selected_pump', JSON.stringify(pump))
    navigate("/contractor/fuel-payment")
  }

  const useMockPump = () => {
    handleScan(JSON.stringify(mockPump))
  }

  return (
    <div className="p-6 space-y-8 animate-in slide-in-from-right-4 duration-300">
      <div className="flex items-center space-x-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-full shadow-sm border border-slate-100">
          <ChevronLeft className="h-6 w-6 text-slate-900" />
        </button>
        <h1 className="text-xl font-black text-slate-900">Scan Petrol Pump</h1>
      </div>

      <ScannerBox 
        title="पेट्रोल पंपाचा QR स्कॅन करा"
        hint="Scan pump QR code to pay for fuel"
        onScan={handleScan}
      />

      <div className="space-y-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-50 px-4 text-slate-400 font-bold tracking-widest">Testing Tools</span>
          </div>
        </div>

        <div className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full h-14 rounded-2xl border-2 border-slate-200 font-bold bg-white"
            onClick={useMockPump}
          >
            <Search className="h-5 w-5 mr-2 text-blue-600" />
            Use Mock Pump
          </Button>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Paste Pump Data Manually</label>
            <div className="flex space-x-2">
              <Input 
                placeholder='{"pumpId": "...", ...}'
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

      <div className="bg-blue-50 p-4 rounded-2xl flex items-start space-x-3 border border-blue-100">
        <Info className="h-5 w-5 text-blue-600 mt-0.5" />
        <p className="text-xs text-blue-900 font-medium leading-relaxed">
          Scan the official QR code displayed at the petrol pump counter to initiate your wallet payment.
        </p>
      </div>
    </div>
  )
}
