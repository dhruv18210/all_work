import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/common/Toast';
import { ProtectedLayout, PublicOnly } from './components/common/ProtectedLayout';
import Login          from './pages/admin/Login';
import Signup         from './pages/admin/Signup';
import RegisterCompany from './pages/admin/RegisterCompany';
import Dashboard      from './pages/admin/Dashboard';
import Leads          from './pages/admin/Leads';
import LeadDetail     from './pages/admin/LeadDetail';
import Employees      from './pages/admin/Employees';
import HRDashboard    from './pages/admin/HRDashboard';
import ClientPortal   from './pages/client/ClientPortal';
import './styles/index.css';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public – Client Portal (no auth) */}
            <Route path="/apply/:token" element={<ClientPortal />} />

            {/* Public only – Login, Signup, Register Company */}
            <Route element={<PublicOnly />}>
              <Route path="/login"            element={<Login />} />
              <Route path="/signup"           element={<Signup />} />
              <Route path="/register-company" element={<RegisterCompany />} />
            </Route>

            {/* Protected – Admin / Employee */}
            <Route element={<ProtectedLayout />}>
              <Route path="/dashboard"    element={<Dashboard />} />
              <Route path="/leads"        element={<Leads />} />
              <Route path="/leads/:id"    element={<LeadDetail />} />
              <Route path="/employees"    element={<Employees />} />
              <Route path="/hr-dashboard" element={<HRDashboard />} />
            </Route>

            {/* Default redirect */}
            <Route path="/"  element={<Navigate to="/dashboard" replace />} />
            <Route path="*"  element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
