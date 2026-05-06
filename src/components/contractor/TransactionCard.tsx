import { Card, CardContent } from "@/components/ui/card";
import { Fuel, Trophy } from "lucide-react";
import type { Transaction } from "@/data/contractor/mockTransactions";
import { formatCurrency, cn } from "@/lib/utils";

interface TransactionCardProps {
  transaction: Transaction;
}

export function TransactionCard({ transaction }: TransactionCardProps) {
  const isCredit = transaction.direction === "credit";

  return (
    <Card className="border-slate-100 shadow-sm active:scale-[0.98] transition-transform">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={cn(
            "h-12 w-12 rounded-2xl flex items-center justify-center transition-colors shadow-sm",
            isCredit ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
          )}>
            {transaction.type === "Reward Earned" ? <Trophy className="h-6 w-6" /> : <Fuel className="h-6 w-6" />}
          </div>
          <div>
            <p className="text-sm font-black text-slate-900 leading-tight">{transaction.source}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              {transaction.type} • {transaction.createdAt}
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className={cn(
            "text-lg font-black tracking-tighter",
            isCredit ? "text-emerald-600" : "text-slate-900"
          )}>
            {isCredit ? "+" : "-"}{formatCurrency(transaction.amount)}
          </p>
          <div className="flex items-center justify-end space-x-1">
            <span className={cn(
              "w-1.5 h-1.5 rounded-full",
              transaction.status === "Success" ? "bg-emerald-500" : "bg-amber-500"
            )} />
            <p className="text-[10px] font-bold text-slate-400 uppercase">{transaction.status}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
