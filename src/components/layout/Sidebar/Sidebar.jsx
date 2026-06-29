import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Box,
  Sun,
  Moon,
} from 'lucide-react';
import { useInventory } from '../../../contexts/InventoryContext';
import { useTheme } from '../../../contexts/ThemeContext';
import './Sidebar.css';

const NAV_ITEMS = [
  {
    section: 'Overview',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ],
  },
  {
    section: 'Inventory',
    items: [
      { to: '/products',     icon: Package,         label: 'Products' },
      { to: '/transactions', icon: ArrowLeftRight,   label: 'Transactions' },
    ],
  },
  {
    section: 'Analytics',
    items: [
      { to: '/reports', icon: BarChart3, label: 'Reports' },
    ],
  },
];

export default function Sidebar() {
  const { state, dispatch, lowStockProducts, outOfStockProducts } = useInventory();
  const { theme, toggleTheme } = useTheme();
  const isCollapsed = !state.ui.sidebarOpen;

  const alertCount = lowStockProducts.length + outOfStockProducts.length;

  return (
    <aside className={`sidebar${isCollapsed ? ' collapsed' : ''}`} aria-label="Main navigation">
      {/* Brand */}
      <div className="sidebar__brand">
        <div className="sidebar__brand-icon" aria-hidden="true">
          <Box size={20} color="#fff" />
        </div>
        {!isCollapsed && (
          <div>
            <div className="sidebar__brand-name">StockFlow</div>
            <div className="sidebar__brand-sub">IMS</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="sidebar__nav">
        {NAV_ITEMS.map(({ section, items }) => (
          <div key={section}>
            <div className="sidebar__section-label">{section}</div>
            {items.map(({ to, icon: Icon, label }) => {
              const showBadge = to === '/products' && alertCount > 0;
              return (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `sidebar__nav-item${isActive ? ' active' : ''}`
                  }
                  title={isCollapsed ? label : undefined}
                >
                  <Icon className="sidebar__nav-icon" size={20} aria-hidden="true" />
                  <span className="sidebar__nav-label">{label}</span>
                  {showBadge && (
                    <span className="sidebar__badge" aria-label={`${alertCount} alerts`}>
                      {alertCount}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}

        {/* Low stock quick-access */}
        {alertCount > 0 && (
          <div style={{ marginTop: 'auto', paddingTop: 'var(--space-4)' }}>
            <NavLink
              to="/products?status=low_stock"
              className="sidebar__nav-item"
              style={{ color: 'var(--color-warning)' }}
              title={isCollapsed ? 'Low Stock Alerts' : undefined}
            >
              <AlertTriangle className="sidebar__nav-icon" size={20} aria-hidden="true" />
              <span className="sidebar__nav-label">
                {alertCount} Alert{alertCount !== 1 ? 's' : ''}
              </span>
            </NavLink>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="sidebar__footer">
        {/* Theme toggle */}
        <button
          className="sidebar__nav-item"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={isCollapsed ? (theme === 'dark' ? 'Light Mode' : 'Dark Mode') : undefined}
        >
          {theme === 'dark'
            ? <Sun className="sidebar__nav-icon" size={20} aria-hidden="true" />
            : <Moon className="sidebar__nav-icon" size={20} aria-hidden="true" />
          }
          <span className="sidebar__nav-label">
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </span>
        </button>

        {/* Collapse toggle */}
        <button
          className="sidebar__nav-item"
          onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed
            ? <ChevronRight className="sidebar__nav-icon" size={20} aria-hidden="true" />
            : <ChevronLeft className="sidebar__nav-icon" size={20} aria-hidden="true" />
          }
          <span className="sidebar__nav-label">Collapse</span>
        </button>
      </div>
    </aside>
  );
}
