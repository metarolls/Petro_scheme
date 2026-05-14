import { Outlet } from "react-router-dom";
import { MerchantBottomNav } from "./MerchantBottomNav";
import { MobileHeader } from "./MobileHeader";
import { useAuth } from "@/contexts/AuthContext";

export function MerchantMobileLayout() {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-brand border-t-transparent rounded-full" />
      </div>
    );
  }

  const merchantName = profile?.ownerName || profile?.name || "Merchant";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto relative shadow-2xl">
      <MobileHeader roleName="Petrol Pump Partner" userName={merchantName} />
      {/* Main Content Area */}
      <main className="flex-1 pb-24 overflow-y-auto">
        <Outlet />
      </main>

      {/* Merchant Bottom Tab Bar */}
      <MerchantBottomNav />
    </div>
  );
}

