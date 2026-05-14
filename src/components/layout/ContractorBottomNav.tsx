import { NavLink } from "react-router-dom";
import { Home, QrCode, History, Fuel } from "lucide-react";
import { cn } from "@/lib/utils";

export function ContractorBottomNav() {
  const items = [
    { to: "/contractor/home", icon: Home, label: "Wallet" },
    { to: "/contractor/scan-coupon", icon: QrCode, label: "Scan" },
    { to: "/contractor/scan-pump", icon: Fuel, label: "Fuel" },
    { to: "/contractor/transactions", icon: History, label: "History" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-t border-slate-100 px-6 py-3 flex justify-between items-center safe-area-bottom max-w-md mx-auto">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => 
            cn(
              "flex flex-col items-center space-y-1 transition-colors",
              isActive ? "text-brand" : "text-slate-400 hover:text-slate-600"
            )
          }
        >
          <item.icon className="h-6 w-6" />
          <span className="text-[10px] font-bold uppercase tracking-tight">{item.label}</span>
        </NavLink>
      ))}
    </div>
  );
}
