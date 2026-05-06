import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle, Clock, Wallet } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";

interface TransactionCardProps {
  transaction: any;
}

export function TransactionCard({ transaction }: TransactionCardProps) {
  const isSuccess = transaction.status === "Success";
  const isFailed = transaction.status === "Failed";

  return (
    <Card className={cn(
      "border-slate-100 shadow-sm transition-opacity",
      isFailed && "opacity-60 grayscale-[0.5]"
    )}>
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={cn(
            "h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm",
            isSuccess ? "bg-emerald-50 text-emerald-600" : isFailed ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"
          )}>
            {isSuccess ? <CheckCircle2 className="h-6 w-6" /> : isFailed ? <XCircle className="h-6 w-6" /> : <Clock className="h-6 w-6" />}
          </div>
          <div>
            <p className="text-sm font-black text-slate-900 leading-tight">{transaction.contractorName}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              {transaction.createdAt}
            </p>
            <p className="text-[9px] font-medium text-slate-300 mt-1 uppercase tracking-tight">ID: {transaction.transactionId}</p>
          </div>
        </div>

        <div className="text-right">
          <p className={cn(
            "text-lg font-black tracking-tighter",
            isSuccess ? "text-emerald-600" : isFailed ? "text-rose-600" : "text-amber-600"
          )}>
            {formatCurrency(transaction.amount)}
          </p>
          <div className="flex items-center justify-end space-x-1">
            <Wallet className="h-3 w-3 text-slate-300" />
            <p className="text-[10px] font-bold text-slate-400 uppercase">Wallet</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
