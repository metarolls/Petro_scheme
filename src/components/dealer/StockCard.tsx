import { Card, CardContent } from "@/components/ui/card";

interface StockCardProps {
  stockMT: number;
}

export function StockCard({ stockMT }: StockCardProps) {
  return (
    <Card className="bg-white border-none shadow-sm overflow-hidden">
      <CardContent className="p-6 text-center">
        <p className="text-muted-foreground text-sm mb-1">Available Stock</p>
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">
          {stockMT.toFixed(1)} <span className="text-2xl font-bold">MT</span>
        </h2>
        <p className="text-blue-600 font-medium text-xs mt-1">उपलब्ध TMT स्टॉक</p>
      </CardContent>
    </Card>
  );
}
