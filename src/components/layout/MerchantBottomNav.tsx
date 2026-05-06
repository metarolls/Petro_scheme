import { NavLink } from "react-router-dom";
import { Home, BarChart3, Landmark, QrCode, History } from "lucide-react";
import { cn } from "@/lib/utils";

export function MerchantBottomNav() {
  const items = [
    { to: "/merchant/home", icon: Home, label: "Live" },
    { to: "/merchant/summary", icon: BarChart3, label: "Summary" },
    { to: "/merchant/settlement", icon: Landmark, label: "Settlement" },
    { to: "/merchant/qr", icon: QrCode, label: "QR" },
    { to: "/merchant/transactions", icon: History, label: "History" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-t border-slate-100 px-4 py-3 flex justify-between items-center safe-area-bottom max-w-md mx-auto">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => 
            cn(
              "flex flex-col items-center space-y-1 transition-colors min-w-[64px]",
              isActive ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
            )
          }
        >
          <item.icon className="h-5 w-5" />
          <span className="text-[9px] font-bold uppercase tracking-tighter">{item.label}</span>
        </NavLink>
      ))}
    </div>
  );
}
