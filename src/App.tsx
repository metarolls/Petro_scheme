import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "sonner"
import { AuthProvider } from "@/contexts/AuthContext"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { Login } from "@/pages/Login"
import { Dashboard } from "@/pages/Dashboard"
import { DealerManagement } from "@/pages/DealerManagement"
import PetrolPumps from "@/pages/PetrolPumps"
import { Settlements } from "@/pages/Settlements"
import SettlementLedger from "@/pages/SettlementLedger"
import { Reports } from "@/pages/Reports"
import { Settings } from "@/pages/Settings"
import { Support } from "@/pages/Support"
import { Profile } from "@/pages/Profile"
import { SalesWallet } from "@/pages/SalesWallet"
import { Analytics } from "@/pages/Analytics"
import { DashboardLayout } from "@/components/layout/DashboardLayout"

// Dealer PWA Pages
import { DealerLogin } from "@/pages/dealer/DealerLogin"
import { DealerHome } from "@/pages/dealer/DealerHome"
import { GenerateQR } from "@/pages/dealer/GenerateQR"
import { QRDisplay } from "@/pages/dealer/QRDisplay"
import { StockHistory } from "@/pages/dealer/StockHistory"
import { DealerTransfer } from "@/pages/dealer/DealerTransfer"
import { MobileLayout } from "@/components/layout/MobileLayout"

// Contractor PWA Pages
import { ContractorLogin } from "@/pages/contractor/ContractorLogin"
import { ContractorHome } from "@/pages/contractor/ContractorHome"
import { ScanCoupon } from "@/pages/contractor/ScanCoupon"
import { RewardSuccess } from "@/pages/contractor/RewardSuccess"
import { ScanPump } from "@/pages/contractor/ScanPump"
import { FuelPayment } from "@/pages/contractor/FuelPayment"
import { PaymentSuccess } from "@/pages/contractor/PaymentSuccess"
import { TransactionHistory as ContractorTransactions } from "@/pages/contractor/TransactionHistory"
import { RedeemQR } from "@/pages/contractor/RedeemQR"
import { ContractorMobileLayout } from "@/components/layout/ContractorMobileLayout"

// Merchant PWA Pages
import { MerchantLogin } from "@/pages/merchant/MerchantLogin"
import HomeLiveFeed from "@/pages/merchant/HomeLiveFeed"
import { DailySummary } from "@/pages/merchant/DailySummary"
import { Settlement } from "@/pages/merchant/Settlement"
import { TransactionHistory as MerchantTransactions } from "@/pages/merchant/TransactionHistory"
import { PumpQR } from "@/pages/merchant/PumpQR"
import { MerchantScanner } from "@/pages/merchant/MerchantScanner"
import { MerchantMobileLayout } from "@/components/layout/MerchantMobileLayout"

import { AddDealer } from "@/pages/AddDealer"
import { ContractorManagement } from "@/pages/ContractorManagement"
import { AddContractor } from "@/pages/AddContractor"
import { useAuth } from "@/contexts/AuthContext"

function DynamicLayout() {
  const { role } = useAuth();
  if (role === 'admin' || role === 'rm' || role === 'mo') return <DashboardLayout />;
  if (role === 'dealer') return <MobileLayout />;
  if (role === 'contractor') return <ContractorMobileLayout />;
  if (role === 'merchant') return <MerchantMobileLayout />;
  return <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Login Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/dealer/login" element={<DealerLogin />} />
          <Route path="/contractor/login" element={<ContractorLogin />} />
          <Route path="/merchant/login" element={<MerchantLogin />} />

          {/* Admin Panel Routes */}
          <Route element={<ProtectedRoute allowedRoles={["admin", "rm", "mo"]}><DashboardLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dealers" element={<DealerManagement />} />
            <Route path="/dealers/add" element={<AddDealer />} />
            <Route path="/contractors" element={<ContractorManagement />} />
            <Route path="/contractors/add" element={<AddContractor />} />
            <Route path="/petrol-pumps" element={<PetrolPumps />} />
            <Route path="/settlements" element={<Settlements />} />
            <Route path="/settlements/ledger" element={<SettlementLedger />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/sales-wallet" element={<SalesWallet />} />
            <Route path="/analytics" element={<Analytics />} />
          </Route>

          {/* Shared Routes for All Roles */}
          <Route element={<ProtectedRoute allowedRoles={["admin", "rm", "mo", "dealer", "contractor", "merchant"]}><DynamicLayout /></ProtectedRoute>}>
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/support" element={<Support />} />
          </Route>

          {/* Dealer PWA Routes */}
          <Route element={<ProtectedRoute allowedRoles={["dealer"]}><MobileLayout /></ProtectedRoute>}>
            <Route path="/dealer/home" element={<DealerHome />} />
            <Route path="/dealer/generate" element={<GenerateQR />} />
            <Route path="/dealer/qr/:couponId" element={<QRDisplay />} />
            <Route path="/dealer/transfer" element={<DealerTransfer />} />
            <Route path="/dealer/history" element={<StockHistory />} />
          </Route>

          {/* Contractor PWA Routes */}
          <Route element={<ProtectedRoute allowedRoles={["contractor"]}><ContractorMobileLayout /></ProtectedRoute>}>
            <Route path="/contractor/home" element={<ContractorHome />} />
            <Route path="/contractor/scan-coupon" element={<ScanCoupon />} />
            <Route path="/contractor/reward-success/:couponId" element={<RewardSuccess />} />
            <Route path="/contractor/scan-pump" element={<ScanPump />} />
            <Route path="/contractor/fuel-payment" element={<FuelPayment />} />
            <Route path="/contractor/redeem-qr" element={<RedeemQR />} />
            <Route path="/contractor/payment-success/:transactionId" element={<PaymentSuccess />} />
            <Route path="/contractor/transactions" element={<ContractorTransactions />} />
          </Route>

          {/* Merchant PWA Routes */}
          <Route element={<ProtectedRoute allowedRoles={["merchant"]}><MerchantMobileLayout /></ProtectedRoute>}>
            <Route path="/merchant/home" element={<HomeLiveFeed />} />
            <Route path="/merchant/summary" element={<DailySummary />} />
            <Route path="/merchant/settlement" element={<Settlement />} />
            <Route path="/merchant/transactions" element={<MerchantTransactions />} />
            <Route path="/merchant/scan" element={<MerchantScanner />} />
            <Route path="/merchant/qr" element={<PumpQR />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
      <Toaster position="top-right" richColors />
    </BrowserRouter>
  )
}

export default App
