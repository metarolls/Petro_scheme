import * as React from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Search, IndianRupee, Loader2, ShieldCheck, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { db } from "@/lib/firebase"
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  runTransaction, 
  serverTimestamp
} from "firebase/firestore"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"

import { REWARD_RATE, MT_TO_KG } from "@/lib/constants"

interface Contractor {
  id: string;
  fullName?: string;
  name?: string; // Support both name fields if they exist
  mobileNumber?: string;
  location?: string;
  walletBalance: number;
}

export function DealerTransfer() {
  const navigate = useNavigate()
  const [contractors, setContractors] = React.useState<Contractor[]>([])
  const [searchTerm, setSearchTerm] = React.useState("")
  const [selectedContractor, setSelectedContractor] = React.useState<Contractor | null>(null)
  const [weight, setWeight] = React.useState("")
  const [loading, setLoading] = React.useState(true)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [dealerBalance, setDealerBalance] = React.useState(0)
  const [dealerStock, setDealerStock] = React.useState(0)
  const [pin, setPin] = React.useState("")

  const { profile } = useAuth()
  
  const dealerId = profile?.id
  const dealerName = profile?.fullName || profile?.name
  const dealerFirm = profile?.firmName

  React.useEffect(() => {
    if (!profile || !dealerId) return

    // Listen to current dealer balance and stock
    const unsubDealer = onSnapshot(doc(db, "dealers", dealerId), (doc) => {
      if (doc.exists()) {
        const data = doc.data()
        setDealerBalance(data.walletBalance || 0)
        setDealerStock(data.stockMT || 0)
      }
    })

    // Listen to contractors
    const unsubContractors = onSnapshot(query(collection(db, "contractors"), orderBy("fullName")), (snap) => {
      const contractorsData = snap.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        name: doc.data().fullName || doc.data().name // Normalizing name
      })) as Contractor[]
      setContractors(contractorsData)
      setLoading(false)
    }, (err) => {
      console.error("Error fetching contractors:", err)
      setLoading(false)
    })

    return () => {
      unsubDealer()
      unsubContractors()
    }
  }, [dealerId, profile])

  const filteredContractors = contractors.filter(c => 
    (c.fullName || c.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.mobileNumber?.includes(searchTerm) ||
    c.location?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const weightInKg = parseFloat(weight) || 0
  const weightInMT = weightInKg / MT_TO_KG
  const calculatedReward = weightInKg * REWARD_RATE

  const handleTransfer = async () => {
    if (!selectedContractor || !weight) {
      toast.error("कृपया कॉन्ट्रॅक्टर निवडा आणि वजन टाका (Please select contractor and enter weight)")
      return
    }

    if (weightInKg <= 0) {
      toast.error("कृपया वैध वजन टाका (Please enter valid weight)")
      return
    }

    if (weightInMT > dealerStock) {
      toast.error(`तुमच्याकडे पुरेसा स्टॉक नाही. उपलब्ध: ${dealerStock.toFixed(3)} MT`)
      return
    }

    if (calculatedReward > dealerBalance) {
      toast.error(`तुमच्या वॉलेटमध्ये पुरेसे पैसे नाहीत. उपलब्ध: ₹${dealerBalance.toLocaleString()}`)
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

    setIsSubmitting(true)
    try {
      await runTransaction(db, async (transaction) => {
        const dealerRef = doc(db, "dealers", dealerId!)
        const contractorRef = doc(db, "contractors", selectedContractor.id)
        
        const dDoc = await transaction.get(dealerRef)
        const cDoc = await transaction.get(contractorRef)

        if (!dDoc.exists()) throw new Error("Dealer profile not found")
        if (!cDoc.exists()) throw new Error("Contractor profile not found")

        const currentDBalance = dDoc.data().walletBalance || 0
        const currentDStock = dDoc.data().stockMT || 0
        const currentCBalance = cDoc.data().walletBalance || 0

        // Final double-check in transaction
        if (currentDStock < weightInMT) throw new Error("Insufficient Stock (Transaction aborted)")
        if (currentDBalance < calculatedReward) throw new Error("Insufficient Balance (Transaction aborted)")

        // 1. Deduct from Dealer
        transaction.update(dealerRef, { 
          walletBalance: currentDBalance - calculatedReward,
          stockMT: currentDStock - weightInMT,
          lastTransferAt: serverTimestamp()
        })
        
        // 2. Add to Contractor
        transaction.update(contractorRef, { 
          walletBalance: currentCBalance + calculatedReward,
          lastCreditAt: serverTimestamp()
        })

        // 3. Log Detailed History
        const historyRef = doc(collection(db, "wallet_history"))
        transaction.set(historyRef, {
          type: 'transfer',
          status: 'completed',
          sourceId: dealerId, // Mobile
          sourceName: dealerFirm || dealerName,
          destinationId: selectedContractor.id, // Mobile
          destinationName: selectedContractor.fullName || selectedContractor.name,
          amount: calculatedReward,
          weightKg: weightInKg,
          weightMt: weightInMT,
          rewardRate: REWARD_RATE,
          timestamp: serverTimestamp(),
          description: `Reward Transfer: ${weightInKg} KG sale`,
          metadata: {
            dealerPrevStock: currentDStock,
            dealerNewStock: currentDStock - weightInMT,
            contractorPrevBalance: currentCBalance,
            contractorNewBalance: currentCBalance + calculatedReward
          }
        })
      })

      toast.success(`Success! ₹${calculatedReward.toLocaleString()} reward transferred.`)
      navigate('/dealer/home')
    } catch (error: any) {
      console.error("Transfer Error:", error)
      toast.error("Transfer failed: " + (error.message || "Unknown error"))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full bg-white shadow-sm"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5 text-navy" />
        </Button>
        <div>
          <h1 className="text-2xl font-black text-navy leading-none">Allocate Rewards</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">कॉन्ट्रॅक्टर रिवॉर्ड ट्रान्सफर</p>
        </div>
      </div>

      {/* Balance Indicator */}
      <Card className="bg-slate-50 border-none shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-brand/10 rounded-xl flex items-center justify-center">
              <IndianRupee className="h-5 w-5 text-brand" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Your Balance</p>
              <p className="text-lg font-black text-navy">{formatCurrency(dealerBalance)}</p>
            </div>
          </div>
          <div className="text-right">
            <ShieldCheck className="h-5 w-5 text-emerald-500 ml-auto" />
            <p className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest mt-0.5">Secure Wallet</p>
          </div>
        </CardContent>
      </Card>

      {!selectedContractor ? (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input 
              placeholder="Search Contractor Name or Mobile..."
              className="pl-12 h-14 bg-white border-none shadow-lg rounded-2xl text-base font-bold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Contractor</p>
            {filteredContractors.map(contractor => (
              <Card 
                key={contractor.id}
                className="border-none shadow-sm active:scale-[0.98] transition-all cursor-pointer hover:bg-slate-50 rounded-2xl"
                onClick={() => setSelectedContractor(contractor)}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-black text-navy text-base">{contractor.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-[10px] font-bold text-slate-400">{contractor.mobileNumber}</p>
                      <span className="text-slate-300">•</span>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{contractor.location || 'Maharashtra'}</p>
                    </div>
                  </div>
                  <div className="h-8 w-8 bg-slate-100 rounded-full flex items-center justify-center">
                    <ArrowLeft className="h-4 w-4 text-slate-400 rotate-180" />
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredContractors.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-400 font-bold">No contractors found</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <Card className="border-none shadow-xl rounded-[2rem] bg-navy text-white overflow-hidden">
            <CardContent className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-1">Transferring To</p>
                  <h3 className="text-2xl font-black">{selectedContractor.name}</h3>
                  <p className="text-white/40 text-xs font-medium">{selectedContractor.location || 'Contractor'}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white/50 hover:text-white"
                  onClick={() => setSelectedContractor(null)}
                >
                  Change
                </Button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest ml-1">Sale Weight (kg)</p>
                  <div className="relative">
                    <Input 
                      type="number"
                      placeholder="Enter Weight"
                      className="h-20 bg-white/10 border-white/20 focus:bg-white/20 text-3xl font-black text-white rounded-2xl placeholder:text-white/20"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg font-bold text-white/30">KG</span>
                  </div>
                </div>

                <div className="p-4 bg-brand/20 rounded-2xl border border-brand/30 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-brand-light uppercase tracking-widest mb-0.5">Reward Amount</p>
                    <p className="text-2xl font-black text-brand-light">₹{calculatedReward.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-bold text-white/40 uppercase tracking-tighter">Rate: ₹{REWARD_RATE}/kg</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest ml-1">Secure PIN</p>
                  <Input 
                    type="password"
                    placeholder="••••"
                    maxLength={4}
                    className="h-16 bg-white/10 border-white/20 focus:bg-white/20 text-3xl font-black text-white rounded-2xl text-center tracking-[0.5em]"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  />
                </div>

                <p className="text-center text-white/50 text-xs font-medium italic">
                  Wallet Balance After: {formatCurrency(dealerBalance - calculatedReward)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Button 
            className="w-full h-16 bg-brand hover:bg-brand-hover text-white font-black text-xl rounded-2xl shadow-xl shadow-brand/20 active:scale-[0.98] transition-all"
            disabled={isSubmitting || !weight}
            onClick={handleTransfer}
          >
            {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : (
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6" />
                <span>TRANSFER REWARD</span>
              </div>
            )}
          </Button>

          <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-tighter px-4">
            By confirming, you authorize a direct wallet-to-wallet reward transfer. This deduction is calculated at ₹{REWARD_RATE}/kg.
          </p>
        </div>
      )}
    </div>
  )
}

