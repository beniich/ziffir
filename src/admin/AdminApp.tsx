import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AdminGuard } from './AdminGuard';
import { AdminLayout } from './components/AdminLayout';
import { ToastProvider } from './hooks/useToast';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminLeadsPage } from './pages/AdminLeadsPage';
import { AdminLeadDetailPage } from './pages/AdminLeadDetailPage';
import { AdminHotelsPage } from './pages/AdminHotelsPage';
import { AdminHotelDetailPage } from './pages/AdminHotelDetailPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdminAuditPage } from './pages/AdminAuditPage';
import { AdminSettingsPage } from './pages/AdminSettingsPage';

import './styles/admin.css';

export function AdminApp() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route element={<AdminGuard><AdminLayout /></AdminGuard>}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/leads" element={<AdminLeadsPage />} />
            <Route path="/admin/leads/:id" element={<AdminLeadDetailPage />} />
            <Route path="/admin/hotels" element={<AdminHotelsPage />} />
            <Route path="/admin/hotels/:id" element={<AdminHotelDetailPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/audit" element={<AdminAuditPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
          </Route>
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}
