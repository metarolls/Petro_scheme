import { NavLink } from "react-router-dom";
import { Home, BarChart3, Landmark, QrCode, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function MerchantBottomNav() {
  const items = [
    { to: "/merchant/home", icon: Home, label: "Live", sub: "लाईव्ह" },
    { to: "/merchant/summary", icon: BarChart3, label: "Summary", sub: "अहवाल" },
    { to: "/merchant/scan", icon: QrCode, label: "Scan", sub: "स्कॅन" },
    { to: "/merchant/settlement", icon: Landmark, label: "Settled", sub: "सेटलमेंट" },
    { to: "/merchant/qr", icon: QrCode, label: "QR", sub: "क्युआर" },
    { to: "/merchant/transactions", icon: History, label: "History", sub: "इतिहास" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2 max-w-md mx-auto pointer-events-none">
      <div className="bg-white/90 backdrop-blur-xl border border-slate-200/50 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] rounded-[2.5rem] px-2 py-2 flex justify-between items-center pointer-events-auto">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => 
              cn(
                "flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-300 relative group",
                isActive ? "text-brand" : "text-slate-400 hover:text-slate-600"
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-brand-soft rounded-2xl -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <item.icon className={cn("h-5 w-5 mb-1 transition-transform group-active:scale-90", isActive && "scale-110")} />
                <div className="flex flex-col items-center">
                  <span className="text-[8px] font-black uppercase tracking-tighter leading-none">{item.label}</span>
                  <span className="text-[7px] font-bold opacity-60 leading-none mt-0.5">{item.sub}</span>
                </div>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
