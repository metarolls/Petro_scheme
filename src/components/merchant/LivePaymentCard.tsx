import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Fuel, Clock, ArrowRight } from "lucide-react";
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
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="relative"
    >
      <Card className={cn(
        "border-none shadow-xl shadow-slate-200/40 rounded-3xl overflow-hidden transition-all duration-500",
        isNew ? "bg-success-soft/80 ring-2 ring-success/20" : "bg-white"
      )}>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "h-10 w-10 rounded-2xl flex items-center justify-center shadow-sm",
                isNew ? "bg-success text-white" : "bg-brand-soft text-brand"
              )}>
                <Fuel className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Incoming Payment</p>
                <p className="text-sm font-black text-navy tracking-tight">
                  {transaction.contractorName}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-black text-navy tracking-tighter">
                {formatCurrency(transaction.amount)}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-50">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                <Clock className="h-3 w-3" />
                {getTimeAgo(transaction.createdAt)}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-success uppercase tracking-tight bg-success-soft px-2 py-0.5 rounded-full">
                <CheckCircle2 className="h-3 w-3" />
                Success
              </div>
            </div>
            
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
              <span className="text-[8px]">ID: {transaction.transactionId.slice(-6)}</span>
              <ArrowRight className="h-3 w-3" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {isNew && (
        <span className="absolute top-2 right-2 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
        </span>
      )}
    </motion.div>
  );
}
