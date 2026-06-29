import { useLocation } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';
import { useInventory } from '../../../contexts/InventoryContext';
import './Topbar.css';

const PAGE_META = {
  '/dashboard':    { title: 'Dashboard',        breadcrumb: 'Home / Dashboard' },
  '/products':     { title: 'Products',          breadcrumb: 'Home / Inventory / Products' },
  '/transactions': { title: 'Stock Movements',   breadcrumb: 'Home / Inventory / Transactions' },
  '/reports':      { title: 'Reports & Analytics', breadcrumb: 'Home / Analytics / Reports' },
};

export default function Topbar() {
  const { state, lowStockProducts, outOfStockProducts } = useInventory();
  const location = useLocation();
  const isCollapsed = !state.ui.sidebarOpen;

  const meta = PAGE_META[location.pathname] ?? { title: 'StockFlow IMS', breadcrumb: 'Home' };
  const hasAlerts = lowStockProducts.length + outOfStockProducts.length > 0;

  return (
    <header className={`topbar${isCollapsed ? ' sidebar-collapsed' : ''}`}>
      <div className="topbar__left">
        <h1 className="topbar__page-title">{meta.title}</h1>
        <span className="topbar__breadcrumb" aria-label="Breadcrumb">{meta.breadcrumb}</span>
      </div>

      <div className="topbar__right">
        <button
          className="topbar__icon-btn"
          aria-label="Search"
          title="Search (press /)"
        >
          <Search size={18} />
        </button>

        <button
          className="topbar__icon-btn"
          aria-label={hasAlerts ? 'View stock alerts' : 'Notifications'}
          title="Notifications"
        >
          <Bell size={18} />
          {hasAlerts && <span className="topbar__alert-dot" aria-hidden="true" />}
        </button>

        <div className="topbar__divider" aria-hidden="true" />

        <div
          className="topbar__user-avatar"
          role="button"
          tabIndex={0}
          aria-label="User profile"
          title="Admin"
        >
          A
        </div>
      </div>
    </header>
  );
}
