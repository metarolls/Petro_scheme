import * as React from "react"
import { Html5Qrcode } from "html5-qrcode"
import { Camera, RefreshCw } from "lucide-react"

interface ScannerBoxProps {
  onScan: (data: string) => void;
  title?: string;
  hint?: string;
}

export function ScannerBox({ onScan, title, hint }: ScannerBoxProps) {
  const [isScanning, setIsScanning] = React.useState(false)
  const scannerId = "qr-reader"

  React.useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null

    if (isScanning) {
      html5QrCode = new Html5Qrcode(scannerId)
      const config = { fps: 10, qrbox: { width: 250, height: 250 } }

      html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          onScan(decodedText)
          stopScanner()
        },
        () => {}
      ).catch(() => {
        setIsScanning(false)
      })
    }

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(() => {})
      }
    }
  }, [isScanning])

  const stopScanner = () => {
    setIsScanning(false)
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        {title && <h2 className="text-lg font-black text-slate-900">{title}</h2>}
        {hint && <p className="text-xs text-slate-500 font-medium">{hint}</p>}
      </div>

      <div className="relative aspect-square w-full max-w-[300px] mx-auto bg-slate-900 rounded-[40px] overflow-hidden shadow-2xl border-8 border-white group">
        {!isScanning ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
            <div className="p-4 bg-white/10 rounded-3xl backdrop-blur-md">
              <Camera className="h-10 w-10 text-white" />
            </div>
            <button 
              onClick={() => setIsScanning(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-full font-bold text-sm shadow-lg shadow-blue-500/30 active:scale-95 transition-transform"
            >
              Start Camera
            </button>
          </div>
        ) : (
          <div id={scannerId} className="w-full h-full" />
        )}

        {/* Scanner Overlay UI */}
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none border-[40px] border-black/40">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500" />
            
            {/* Animated Scanning Line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-scan" />
          </div>
        )}
      </div>

      {isScanning && (
        <button 
          onClick={stopScanner}
          className="flex items-center justify-center mx-auto space-x-2 text-slate-400 font-bold text-xs p-2 active:text-slate-600"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Stop Scanner</span>
        </button>
      )}
    </div>
  )
}
