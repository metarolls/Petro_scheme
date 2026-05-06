import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, CreditCard, Fuel } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface SummaryCardProps {
  totalAmount: number;
  totalTransactions: number;
  averageTransaction: number;
  highestTransaction: number;
}

export function SummaryCard({ totalAmount, totalTransactions, averageTransaction, highestTransaction }: SummaryCardProps) {
  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-emerald-600 to-teal-700 border-none shadow-xl shadow-emerald-100 rounded-[32px] overflow-hidden relative">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <CardContent className="p-8 text-white relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">Daily Summary</p>
              <p className="text-sm font-bold">आजचा अहवाल</p>
            </div>
          </div>

          <div className="space-y-1 text-center">
            <p className="text-xs font-medium opacity-80 uppercase tracking-widest">आजचे एकूण Fuel Payments</p>
            <h2 className="text-5xl font-black tracking-tighter">
              {formatCurrency(totalAmount)}
            </h2>
          </div>
          
          <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest opacity-60 mb-1">Total</p>
              <p className="text-sm font-black">{totalTransactions}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest opacity-60 mb-1">Average</p>
              <p className="text-sm font-black">{formatCurrency(averageTransaction)}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest opacity-60 mb-1">Highest</p>
              <p className="text-sm font-black">{formatCurrency(highestTransaction)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="border-none bg-slate-100 shadow-none rounded-2xl">
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="p-2 bg-white rounded-xl shadow-sm text-slate-600">
              <Fuel className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Diesel Today</p>
              <p className="text-sm font-black text-slate-900">{formatCurrency(totalAmount)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none bg-slate-100 shadow-none rounded-2xl">
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="p-2 bg-white rounded-xl shadow-sm text-slate-600">
              <CreditCard className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Wallet Payments</p>
              <p className="text-sm font-black text-slate-900">{formatCurrency(totalAmount)}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
