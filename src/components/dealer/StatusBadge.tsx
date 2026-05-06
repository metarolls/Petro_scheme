import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CouponStatus } from "@/data/dealer/mockCoupons";

interface StatusBadgeProps {
  status: CouponStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variants: Record<CouponStatus, "success" | "default" | "secondary"> = {
    Active: "success",
    Used: "default",
    Expired: "secondary"
  };

  const statusMap: Record<CouponStatus, string> = {
    Active: "Active",
    Used: "Used",
    Expired: "Expired"
  };

  return (
    <Badge 
      variant={variants[status]} 
      className={cn("text-[10px] font-medium px-2 py-0", className)}
    >
      {statusMap[status]}
    </Badge>
  );
}
