import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import AppLayout from '@/components/layout/AppLayout'
import LandingPage from '@/pages/landing/LandingPage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import DashboardPage from '@/pages/DashboardPage'
import CustomersPage from '@/pages/CustomersPage'
import CustomerDetailPage from '@/pages/CustomerDetailPage'
import OrdersPage from '@/pages/OrdersPage'
import SegmentsPage from '@/pages/SegmentsPage'
import CampaignsPage from '@/pages/CampaignsPage'
import CampaignDetailPage from '@/pages/CampaignDetailPage'
import AnalyticsPage from '@/pages/AnalyticsPage'
import CopilotPage from '@/pages/CopilotPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth()
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  return token ? <>{children}</> : <Navigate to="/landing" />
}

export default function App() {
  return (
    <Routes>
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/customers" element={<CustomersPage />} />
                <Route path="/customers/:id" element={<CustomerDetailPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/segments" element={<SegmentsPage />} />
                <Route path="/campaigns" element={<CampaignsPage />} />
                <Route path="/campaigns/:id" element={<CampaignDetailPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
              </Routes>
            </AppLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
