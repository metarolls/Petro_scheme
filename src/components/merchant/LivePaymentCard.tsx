import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Wallet, Fuel } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { getTimeAgo } from "@/utils/merchant/timeAgo";
import { motion } from "framer-motion";

interface LivePaymentCardProps {
  transaction: any;
  isNew?: boolean;
}

export function LivePaymentCard({ transaction, isNew }: LivePaymentCardProps) {
  return (
    <motion.div
      initial={isNew ? { x: -20, opacity: 0, scale: 0.95 } : false}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      className="relative"
    >
      <Card className={cn(
        "border-slate-100 shadow-sm transition-all",
        isNew && "ring-2 ring-emerald-500 ring-offset-2"
      )}>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm">
              <Fuel className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 leading-tight">
                Contractor <span className="text-blue-600">{transaction.contractorName}</span>
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                Paid {formatCurrency(transaction.amount)} • {getTimeAgo(transaction.createdAt)}
              </p>
              <p className="text-[9px] font-medium text-slate-400 mt-1 uppercase">ID: {transaction.transactionId}</p>
            </div>
          </div>

          <div className="text-right flex flex-col items-end space-y-1">
            <div className="flex items-center space-x-1 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="h-3 w-3" />
              <span className="text-[10px] font-bold uppercase tracking-tighter">Success</span>
            </div>
            <div className="flex items-center space-x-1 text-slate-400">
              <Wallet className="h-3 w-3" />
              <span className="text-[9px] font-bold uppercase tracking-widest">Wallet</span>
            </div>
          </div>
        </CardContent>
      </Card>
      {isNew && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
        </span>
      )}
    </motion.div>
  );
}
