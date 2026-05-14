import { NavLink } from "react-router-dom";
import { Home, History, IndianRupee } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const items = [
    { to: "/dealer/home", icon: Home, label: "Home" },
    { to: "/dealer/transfer", icon: IndianRupee, label: "Pay Fuel" },
    { to: "/dealer/history", icon: History, label: "History" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-t border-slate-100 px-6 py-3 flex justify-between items-center safe-area-bottom">
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
