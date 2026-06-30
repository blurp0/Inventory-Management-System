import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { InventoryProvider } from './contexts/InventoryContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import LoginPage      from './pages/Auth/LoginPage';
import DashboardPage  from './pages/Dashboard/DashboardPage';
import ProductsPage   from './pages/Products/ProductsPage';
import TransactionsPage from './pages/Transactions/TransactionsPage';
import ReportsPage    from './pages/Reports/ReportsPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected routes — require auth */}
            <Route element={<ProtectedRoute />}>
              <Route element={<InventoryProvider><AppLayout /></InventoryProvider>}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard"    element={<DashboardPage />} />
                <Route path="/products"     element={<ProductsPage />} />
                <Route path="/transactions" element={<TransactionsPage />} />
                <Route path="/reports"      element={<ReportsPage />} />
                <Route path="*"             element={<Navigate to="/dashboard" replace />} />
              </Route>
            </Route>
          </Routes>

          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--color-surface)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border)',
              },
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
