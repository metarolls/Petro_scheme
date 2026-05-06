import { Outlet } from "react-router-dom";
import { ContractorBottomNav } from "./ContractorBottomNav";

export function ContractorMobileLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto relative shadow-2xl">
      {/* Main Content Area */}
      <main className="flex-1 pb-24 overflow-y-auto">
        <Outlet />
      </main>

      {/* Contractor Bottom Tab Bar */}
      <ContractorBottomNav />
    </div>
  );
}
