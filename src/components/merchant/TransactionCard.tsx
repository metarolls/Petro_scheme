import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";

interface TransactionCardProps {
  transaction: any;
}

export function TransactionCard({ transaction }: TransactionCardProps) {
  const isSuccess = transaction.status === "Success";
  const isFailed = transaction.status === "Failed";

  return (
    <Card className={cn(
      "border-none shadow-xl shadow-slate-200/30 rounded-3xl overflow-hidden transition-all duration-300 bg-white group hover:scale-[1.01]",
      isFailed && "opacity-70"
    )}>
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={cn(
            "h-11 w-11 rounded-2xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110",
            isSuccess ? "bg-emerald-50 text-emerald-600" : isFailed ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"
          )}>
            {isSuccess ? <CheckCircle2 className="h-5 w-5" /> : isFailed ? <XCircle className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
          </div>
          <div>
            <p className="text-sm font-black text-slate-900 leading-none">{transaction.contractorName}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                {new Date(transaction.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
              </p>
              <span className="w-1 h-1 bg-slate-200 rounded-full" />
              <p className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter leading-none">ID: {transaction.transactionId.slice(-8)}</p>
            </div>
          </div>
        </div>

        <div className="text-right flex flex-col items-end gap-1">
          <p className={cn(
            "text-base font-black tracking-tighter leading-none",
            isSuccess ? "text-slate-900" : isFailed ? "text-rose-600" : "text-amber-600"
          )}>
            {formatCurrency(transaction.amount)}
          </p>
          <div className={cn(
            "flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tight",
            isSuccess ? "bg-emerald-50 text-emerald-600" : isFailed ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"
          )}>
            {isSuccess ? "Success" : isFailed ? "Failed" : "Pending"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
