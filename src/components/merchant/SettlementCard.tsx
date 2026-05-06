import { Card, CardContent } from "@/components/ui/card";
import { Landmark, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface SettlementCardProps {
  balance: number;
  pumpName: string;
}

export function SettlementCard({ balance, pumpName }: SettlementCardProps) {
  return (
    <Card className="bg-gradient-to-br from-amber-500 to-orange-600 border-none shadow-xl shadow-amber-100 rounded-[32px] overflow-hidden relative">
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
      <CardContent className="p-8 text-white relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
            <Landmark className="h-6 w-6 text-white" />
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">Pending Settlement</p>
            <p className="text-sm font-bold">येणे बाकी रक्कम</p>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-medium opacity-80 uppercase tracking-widest">Outstanding Balance</p>
          <div className="flex items-baseline space-x-2">
            <h2 className="text-5xl font-black tracking-tighter">
              {formatCurrency(balance)}
            </h2>
          </div>
          <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest pt-1">कंपनीकडून येणे बाकी</p>
        </div>
        
        <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 opacity-60" />
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Next: Expected Tomorrow</span>
          </div>
          <div className="text-[10px] font-black uppercase bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
            {pumpName}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
