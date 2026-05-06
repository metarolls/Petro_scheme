import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "sonner"
import { Login } from "@/pages/Login"
import { Dashboard } from "@/pages/Dashboard"
import { DealerManagement } from "@/pages/DealerManagement"
import { PumpManagement } from "@/pages/PumpManagement"
import { Settlements } from "@/pages/Settlements"
import { Reports } from "@/pages/Reports"
import { DashboardLayout } from "@/components/layout/DashboardLayout"

// Dealer PWA Pages
import { DealerLogin } from "@/pages/dealer/DealerLogin"
import { DealerHome } from "@/pages/dealer/DealerHome"
import { GenerateQR } from "@/pages/dealer/GenerateQR"
import { QRDisplay } from "@/pages/dealer/QRDisplay"
import { StockHistory } from "@/pages/dealer/StockHistory"
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
import { ContractorMobileLayout } from "@/components/layout/ContractorMobileLayout"

// Merchant PWA Pages
import { MerchantLogin } from "@/pages/merchant/MerchantLogin"
import { HomeLiveFeed } from "@/pages/merchant/HomeLiveFeed"
import { DailySummary } from "@/pages/merchant/DailySummary"
import { Settlement } from "@/pages/merchant/Settlement"
import { TransactionHistory as MerchantTransactions } from "@/pages/merchant/TransactionHistory"
import { PumpQR } from "@/pages/merchant/PumpQR"
import { MerchantMobileLayout } from "@/components/layout/MerchantMobileLayout"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin Panel Routes */}
        <Route path="/login" element={<Login />} />
        
        <Route path="/dashboard" element={
          <DashboardLayout>
            <Dashboard />
          </DashboardLayout>
        } />

        <Route path="/dealers" element={
          <DashboardLayout>
            <DealerManagement />
          </DashboardLayout>
        } />

        <Route path="/petrol-pumps" element={
          <DashboardLayout>
            <PumpManagement />
          </DashboardLayout>
        } />

        <Route path="/settlements" element={
          <DashboardLayout>
            <Settlements />
          </DashboardLayout>
        } />

        <Route path="/reports" element={
          <DashboardLayout>
            <Reports />
          </DashboardLayout>
        } />

        {/* Dealer PWA Routes */}
        <Route path="/dealer/login" element={<DealerLogin />} />
        
        <Route element={<MobileLayout />}>
          <Route path="/dealer/home" element={<DealerHome />} />
          <Route path="/dealer/generate" element={<GenerateQR />} />
          <Route path="/dealer/qr/:couponId" element={<QRDisplay />} />
          <Route path="/dealer/history" element={<StockHistory />} />
        </Route>

        {/* Contractor PWA Routes */}
        <Route path="/contractor/login" element={<ContractorLogin />} />
        
        <Route element={<ContractorMobileLayout />}>
          <Route path="/contractor/home" element={<ContractorHome />} />
          <Route path="/contractor/scan-coupon" element={<ScanCoupon />} />
          <Route path="/contractor/reward-success/:couponId" element={<RewardSuccess />} />
          <Route path="/contractor/scan-pump" element={<ScanPump />} />
          <Route path="/contractor/fuel-payment" element={<FuelPayment />} />
          <Route path="/contractor/payment-success/:transactionId" element={<PaymentSuccess />} />
          <Route path="/contractor/transactions" element={<ContractorTransactions />} />
        </Route>

        {/* Merchant PWA Routes */}
        <Route path="/merchant/login" element={<MerchantLogin />} />
        
        <Route element={<MerchantMobileLayout />}>
          <Route path="/merchant/home" element={<HomeLiveFeed />} />
          <Route path="/merchant/summary" element={<DailySummary />} />
          <Route path="/merchant/settlement" element={<Settlement />} />
          <Route path="/merchant/transactions" element={<MerchantTransactions />} />
          <Route path="/merchant/qr" element={<PumpQR />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
      <Toaster position="top-right" richColors />
    </BrowserRouter>
  )
}

export default App
