import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "Success" | "Pending" | "Failed" | "Paid";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles = {
    Success: "bg-emerald-100 text-emerald-700",
    Pending: "bg-amber-100 text-amber-700",
    Failed: "bg-rose-100 text-rose-700",
    Paid: "bg-emerald-100 text-emerald-700"
  };

  return (
    <span className={cn(
      "text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-current opacity-80",
      styles[status]
    )}>
      {status}
    </span>
  );
}
