import * as React from "react"
import { useNavigate } from "react-router-dom"
import { QrCode, Fuel, TrendingUp, TrendingDown, ArrowRight, History } from "lucide-react"
import { WalletCard } from "@/components/contractor/WalletCard"
import { TransactionCard } from "@/components/contractor/TransactionCard"
import { Card, CardContent } from "@/components/ui/card"
import { mockContractor } from "@/data/contractor/mockContractor"
import { getWalletBalance, getTransactions } from "@/lib/contractor/walletStorage"
import { formatCurrency, cn } from "@/lib/utils"

export function ContractorHome() {
  const navigate = useNavigate()
  const [balance, setBalance] = React.useState(mockContractor.walletBalance)
  const [transactions, setTransactions] = React.useState(getTransactions())

  React.useEffect(() => {
    setBalance(getWalletBalance())
    setTransactions(getTransactions())
  }, [])

  const totalEarned = transactions
    .filter(t => t.direction === "credit")
    .reduce((acc, t) => acc + t.amount, 0)
    
  const totalSpent = transactions
    .filter(t => t.direction === "debit")
    .reduce((acc, t) => acc + t.amount, 0)

  return (
    <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-black text-slate-900">My Wallet</h1>
        <button 
          onClick={() => navigate("/contractor/transactions")}
          className="p-2 bg-slate-100 rounded-full active:bg-slate-200 transition-colors"
        >
          <History className="h-5 w-5 text-slate-600" />
        </button>
      </div>

      <WalletCard balance={balance} contractorName={mockContractor.name} />

      {/* Main Actions */}
      <div className="grid grid-cols-2 gap-4">
        <ActionButton 
          label="Scan Coupon" 
          subtitle="कूपन स्कॅन करा"
          icon={QrCode} 
          onClick={() => navigate("/contractor/scan-coupon")}
          color="bg-emerald-600 shadow-emerald-100"
        />
        <ActionButton 
          label="Pay for Fuel" 
          subtitle="इंधन पेमेंट"
          icon={Fuel} 
          onClick={() => navigate("/contractor/scan-pump")}
          color="bg-blue-600 shadow-blue-100"
        />
      </div>

      {/* Quick Summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-none bg-emerald-50/50 shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-emerald-600 mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Total Earned</span>
            </div>
            <p className="text-lg font-black text-slate-900">{formatCurrency(totalEarned)}</p>
          </CardContent>
        </Card>
        <Card className="border-none bg-slate-100/50 shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-slate-400 mb-1">
              <TrendingDown className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Total Spent</span>
            </div>
            <p className="text-lg font-black text-slate-900">{formatCurrency(totalSpent)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Recent Transactions</h3>
          <button 
            onClick={() => navigate("/contractor/transactions")}
            className="text-[10px] font-bold text-blue-600 uppercase flex items-center"
          >
            See All <ArrowRight className="h-3 w-3 ml-1" />
          </button>
        </div>
        
        <div className="space-y-3">
          {transactions.slice(0, 3).map((txn) => (
            <TransactionCard key={txn.transactionId} transaction={txn} />
          ))}
        </div>
      </div>
    </div>
  )
}

function ActionButton({ label, subtitle, icon: Icon, onClick, color }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center p-6 rounded-[32px] text-white space-y-3 transition-all active:scale-[0.96] shadow-xl",
        color
      )}
    >
      <div className="bg-white/20 p-3 rounded-2xl">
        <Icon className="h-8 w-8" />
      </div>
      <div className="text-center">
        <p className="text-sm font-black uppercase tracking-tighter leading-none">{label}</p>
        <p className="text-[10px] font-medium opacity-70 mt-1">{subtitle}</p>
      </div>
    </button>
  )
}
