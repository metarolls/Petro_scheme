import { Card, CardContent } from "@/components/ui/card";
import { Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface WalletCardProps {
  balance: number;
  contractorName: string;
}

export function WalletCard({ balance, contractorName }: WalletCardProps) {
  // Convert number to Marathi/Devanagari numerals
  const toDevanagari = (num: number) => {
    const devanagariMap: Record<string, string> = {
      '0': '०', '1': '१', '2': '२', '3': '३', '4': '४',
      '5': '५', '6': '६', '7': '७', '8': '८', '9': '९'
    };
    return num.toString().replace(/\d/g, d => devanagariMap[d]);
  };

  const devanagariBalance = toDevanagari(Math.floor(balance));

  return (
    <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 border-none shadow-xl shadow-blue-200 rounded-[32px] overflow-hidden relative">
      {/* Decorative Background Element */}
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
      
      <CardContent className="p-8 text-white relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
            <Wallet className="h-6 w-6 text-white" />
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">Contractor Wallet</p>
            <p className="text-sm font-bold">{contractorName}</p>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-medium opacity-80">Wallet Balance</p>
          <div className="flex flex-col">
            <h2 className="text-4xl font-black tracking-tighter">
              ₹ {devanagariBalance}
            </h2>
            <p className="text-lg font-bold opacity-70 tracking-tight">
              {formatCurrency(balance)}
            </p>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t border-white/10 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest opacity-50">
          <span>TMT REWARD SYSTEM</span>
          <span>ACTIVE WALLET</span>
        </div>
      </CardContent>
    </Card>
  );
}
