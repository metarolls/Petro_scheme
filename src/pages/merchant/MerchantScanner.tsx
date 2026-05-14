import * as React from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, QrCode, User, Info, Loader2, CheckCircle2, X } from "lucide-react"
import { ScannerBox } from "@/components/contractor/ScannerBox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { db } from "@/lib/firebase"
import { doc, runTransaction, collection, serverTimestamp } from "firebase/firestore"
import { useAuth } from "@/contexts/AuthContext"
import { formatCurrency } from "@/lib/utils"

export function MerchantScanner() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [manualData, setManualData] = React.useState("")
  const [scannedTxn, setScannedTxn] = React.useState<any>(null)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [isSuccess, setIsSuccess] = React.useState(false)

  const merchantId = profile?.id
  const merchantName = profile?.pumpName || profile?.fullName || "Merchant"

  const handleScan = (data: string) => {
    try {
      const parsed = JSON.parse(data)
      if (parsed.type !== 'redemption') {
        toast.error("Invalid QR: Not a redemption code")
        return
      }
      
      // Check for expiry (e.g., 5 minutes)
      const now = Date.now()
      if (now - parsed.timestamp > 300000) {
        toast.error("QR Code Expired. Please ask contractor to generate a new one.")
        return
      }

      setScannedTxn(parsed)
    } catch (e) {
      toast.error("Invalid QR Code Data")
    }
  }

  const processTransaction = async () => {
    if (!merchantId || !scannedTxn) return

    setIsProcessing(true)
    try {
      await runTransaction(db, async (transaction) => {
        const contractorRef = doc(db, "contractors", scannedTxn.contractorId)
        const merchantRef = doc(db, "merchant", merchantId)
        
        const cDoc = await transaction.get(contractorRef)
        const mDoc = await transaction.get(merchantRef)

        if (!cDoc.exists()) throw new Error("Contractor profile not found")
        if (!mDoc.exists()) throw new Error("Merchant profile not found")

        const amtNum = scannedTxn.amount
        const currentCBalance = cDoc.data().walletBalance || 0
        const currentMBalance = mDoc.data().walletBalance || 0

        if (currentCBalance < amtNum) throw new Error("Insufficient Contractor Balance")

        const newCBalance = currentCBalance - amtNum
        const newMBalance = currentMBalance + amtNum

        // 1. Deduct from Contractor
        transaction.update(contractorRef, { 
          walletBalance: newCBalance,
          lastPaymentAt: serverTimestamp()
        })
        
        // 2. Add to Merchant
        transaction.update(merchantRef, { 
          walletBalance: newMBalance,
          lastReceiptAt: serverTimestamp()
        })

        // 3. Log History
        const historyRef = doc(collection(db, "wallet_history"))
        transaction.set(historyRef, {
          type: 'payment',
          status: 'completed',
          sourceId: scannedTxn.contractorId,
          sourceName: scannedTxn.contractorName,
          destinationId: merchantId,
          destinationName: merchantName,
          amount: amtNum,
          timestamp: serverTimestamp(),
          note: `QR Redemption by ${scannedTxn.contractorName}`,
          metadata: {
            method: 'qr_redemption',
            prevBalanceSource: currentCBalance,
            newBalanceSource: newCBalance,
            prevBalanceDest: currentMBalance,
            newBalanceDest: newMBalance,
            sourceType: 'contractor',
            destType: 'merchant'
          }
        })
      })

      setIsSuccess(true)
      toast.success("Payment Received Successfully!")
    } catch (error: any) {
      toast.error("Transaction failed: " + error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="p-6 h-screen flex flex-col items-center justify-center space-y-8 animate-in zoom-in-95 duration-500">
        <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle2 className="h-16 w-16 text-green-600 animate-bounce" />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-navy">₹{formatCurrency(scannedTxn?.amount)}</h1>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Received from {scannedTxn?.contractorName}</p>
        </div>
        <Button 
          onClick={() => navigate('/merchant/dashboard')}
          className="w-full h-16 bg-brand text-white rounded-3xl font-black text-lg shadow-xl shadow-brand/20"
        >
          Back to Dashboard
        </Button>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8 animate-in slide-in-from-right-4 duration-300">
      <div className="flex items-center space-x-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-full shadow-sm border border-slate-100">
          <ChevronLeft className="h-6 w-6 text-navy" />
        </button>
        <h1 className="text-xl font-black text-navy">Redemption Scanner</h1>
      </div>

      {!scannedTxn ? (
        <>
          <ScannerBox 
            title="कंत्राटदाराचा QR स्कॅन करा"
            hint="Scan contractor's redemption QR"
            onScan={handleScan}
          />

          <div className="space-y-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-50 px-4 text-slate-400 font-bold tracking-widest">Manual Input</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Paste QR Data</label>
              <div className="flex space-x-2">
                <Input 
                  placeholder='{"type": "redemption", ...}'
                  value={manualData}
                  onChange={(e) => setManualData(e.target.value)}
                  className="h-12 bg-white border-slate-100 rounded-xl text-xs font-mono"
                />
                <Button 
                  className="h-12 bg-slate-900 text-white rounded-xl font-bold px-4"
                  onClick={() => handleScan(manualData)}
                >
                  Parse
                </Button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
          <Card className="border-none shadow-2xl bg-white rounded-[40px] overflow-hidden">
            <div className="bg-brand p-8 text-white flex flex-col items-center space-y-4">
              <div className="h-20 w-20 bg-white/20 rounded-[32px] flex items-center justify-center">
                <User className="h-10 w-10" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-black">{scannedTxn.contractorName}</h3>
                <p className="text-xs opacity-60 uppercase tracking-widest font-bold">Requesting Payment</p>
              </div>
            </div>
            <CardContent className="p-8 space-y-6">
              <div className="text-center space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Transaction Amount</p>
                <h2 className="text-4xl font-black text-navy">₹{formatCurrency(scannedTxn.amount)}</h2>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center space-x-3 text-slate-500">
                  <QrCode className="h-4 w-4" />
                  <span className="text-xs font-bold">ID: {scannedTxn.contractorId}</span>
                </div>
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              </div>

              <div className="space-y-3 pt-4">
                <Button 
                  onClick={processTransaction}
                  disabled={isProcessing}
                  className="w-full h-16 bg-brand text-white rounded-[24px] font-black text-lg shadow-xl shadow-brand/20 flex items-center justify-center space-x-3"
                >
                  {isProcessing ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <>
                      <span>Confirm & Dispense Fuel</span>
                      <CheckCircle2 className="h-6 w-6" />
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="ghost"
                  onClick={() => setScannedTxn(null)}
                  disabled={isProcessing}
                  className="w-full h-12 text-slate-400 font-bold hover:text-red-500 hover:bg-red-50 rounded-2xl"
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject Transaction
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="bg-blue-50 p-4 rounded-2xl flex items-start space-x-3 border border-blue-100">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <p className="text-[10px] text-blue-900 font-medium leading-relaxed uppercase tracking-tight">
              Please verify the contractor identity before confirming. Funds will be credited to your wallet instantly upon confirmation.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
