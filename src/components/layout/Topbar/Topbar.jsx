import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Search, AlertTriangle, AlertCircle, CheckCircle2, Settings } from 'lucide-react';
import { useInventory } from '../../../contexts/InventoryContext';
import { useAuth } from '../../../contexts/AuthContext';
import { Badge } from '../../common/Badge/Badge';
import './Topbar.css';

const PAGE_META = {
  '/dashboard':    { title: 'Dashboard',        breadcrumb: 'Home / Dashboard' },
  '/products':     { title: 'Products',          breadcrumb: 'Home / Inventory / Products' },
  '/transactions': { title: 'Stock Movements',   breadcrumb: 'Home / Inventory / Transactions' },
  '/reports':      { title: 'Reports & Analytics', breadcrumb: 'Home / Analytics / Reports' },
  '/settings':     { title: 'Settings',           breadcrumb: 'Home / Account / Settings' },
};

export default function Topbar() {
  const { state, lowStockProducts, outOfStockProducts } = useInventory();
  const { user, role } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isCollapsed = !state.ui.sidebarOpen;
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const containerRef = useRef(null);

  const meta = PAGE_META[location.pathname] ?? { title: 'StockFlow IMS', breadcrumb: 'Home' };
  const hasAlerts = lowStockProducts.length + outOfStockProducts.length > 0;
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  // Handle closing the notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };

    if (isNotificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationsOpen]);

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

        <div className="topbar__notification-container" ref={containerRef}>
          <button
            className="topbar__icon-btn"
            aria-label={hasAlerts ? 'View stock alerts' : 'Notifications'}
            title="Notifications"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
          >
            <Bell size={18} />
            {hasAlerts && <span className="topbar__alert-dot" aria-hidden="true" />}
          </button>

          {isNotificationsOpen && (
            <div className="notifications-dropdown">
              <div className="notifications-dropdown__header">
                <h3>Notifications</h3>
                {hasAlerts && (
                  <Badge variant="danger">
                    {lowStockProducts.length + outOfStockProducts.length} Alert(s)
                  </Badge>
                )}
              </div>
              <div className="notifications-dropdown__content">
                <div className="notifications-list">
                  {outOfStockProducts.map((p) => (
                    <div key={p.id} className="notification-item notification-item--out-of-stock">
                      <AlertCircle className="notification-item__icon" size={18} />
                      <div className="notification-item__content">
                        <h4>{p.name} is Out of Stock</h4>
                        <p>SKU: <code>{p.sku}</code> · Category: {p.category}</p>
                      </div>
                      <Badge variant="danger">0 left</Badge>
                    </div>
                  ))}
                  {lowStockProducts.map((p) => (
                    <div key={p.id} className="notification-item notification-item--low-stock">
                      <AlertTriangle className="notification-item__icon" size={18} />
                      <div className="notification-item__content">
                        <h4>{p.name} is Low in Stock</h4>
                        <p>SKU: <code>{p.sku}</code> · Reorder level: {p.reorderLevel}</p>
                      </div>
                      <Badge variant="warning">{p.currentStock} left</Badge>
                    </div>
                  ))}
                  {lowStockProducts.length === 0 && outOfStockProducts.length === 0 && (
                    <div className="notification-item--empty">
                      <CheckCircle2 size={32} />
                      <p>No active stock alerts. All items are sufficiently stocked!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="topbar__divider" aria-hidden="true" />

        <div
          className="topbar__user-avatar"
          role="button"
          tabIndex={0}
          aria-label="User settings"
          title={`${displayName} — ${role ?? 'viewer'} · Click to open Settings`}
          onClick={() => navigate('/settings')}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/settings')}
        >
          {initials}
          <span className="topbar__role-dot" data-role={role} aria-hidden="true" />
        </div>
      </div>
    </header>
  );
}
