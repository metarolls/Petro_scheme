import { Card, CardContent } from "@/components/ui/card";
import type { Coupon } from "@/data/dealer/mockCoupons";
import { StatusBadge } from "./StatusBadge";
import { formatCurrency } from "@/lib/utils";

interface CouponCardProps {
  coupon: Coupon;
  onClick?: () => void;
}

export function CouponCard({ coupon, onClick }: CouponCardProps) {
  return (
    <Card 
      className="border-slate-100 shadow-sm active:scale-[0.98] transition-transform cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{coupon.couponId}</p>
            <p className="text-xs text-slate-500">{coupon.generatedAt}</p>
          </div>
          <StatusBadge status={coupon.status} />
        </div>
        
        <div className="flex justify-between items-end">
          <div>
            <p className="text-sm font-semibold text-slate-800">{coupon.weightKg} Kg <span className="text-[10px] text-slate-400 font-normal">({coupon.weightMT} MT)</span></p>
          </div>
          <div className="text-right">
            <p className="text-lg font-black text-blue-600">{formatCurrency(coupon.rewardValue)}</p>
            <p className="text-[10px] text-slate-400">Reward</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
