import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { InventoryProvider } from './contexts/InventoryContext';
import { ThemeProvider } from './contexts/ThemeContext';
import AppLayout from './components/layout/AppLayout';
import DashboardPage    from './pages/Dashboard/DashboardPage';
import ProductsPage     from './pages/Products/ProductsPage';
import TransactionsPage from './pages/Transactions/TransactionsPage';
import ReportsPage      from './pages/Reports/ReportsPage';

export default function App() {
  return (
    <ThemeProvider>
      <InventoryProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              {/* Redirect root → dashboard */}
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard"    element={<DashboardPage />} />
              <Route path="/products"     element={<ProductsPage />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/reports"      element={<ReportsPage />} />
              {/* 404 fallback */}
              <Route path="*"             element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </InventoryProvider>
    </ThemeProvider>
  );
}
