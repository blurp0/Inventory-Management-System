import PageWrapper from '../../components/layout/PageWrapper/PageWrapper';
import { useInventory } from '../../contexts/InventoryContext';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import {
  Package,
  DollarSign,
  AlertTriangle,
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import './Dashboard.css';

const KPICard = ({ icon: Icon, label, value, sub, color = 'primary' }) => (
  <div className={`kpi-card kpi-card--${color}`}>
    <div className="kpi-card__icon" aria-hidden="true">
      <Icon size={22} />
    </div>
    <div className="kpi-card__body">
      <div className="kpi-card__value">{value}</div>
      <div className="kpi-card__label">{label}</div>
      {sub && <div className="kpi-card__sub">{sub}</div>}
    </div>
  </div>
);

export default function DashboardPage() {
  const {
    activeProducts,
    lowStockProducts,
    outOfStockProducts,
    totalStockValue,
    state,
  } = useInventory();

  const recentTransactions = state.transactions.slice(0, 5);
  const stockInCount = state.transactions.filter((t) => t.type === 'STOCK_IN').length;
  const stockOutCount = state.transactions.filter((t) => t.type === 'STOCK_OUT').length;

  return (
    <PageWrapper
      title="Dashboard"
      subtitle="Your inventory at a glance — real-time stock overview"
    >
      {/* KPI Cards */}
      <div className="dashboard-kpi-grid">
        <KPICard
          icon={Package}
          label="Total Products"
          value={formatNumber(activeProducts.length)}
          sub={`${outOfStockProducts.length} out of stock`}
          color="primary"
        />
        <KPICard
          icon={DollarSign}
          label="Total Stock Value"
          value={formatCurrency(totalStockValue)}
          sub="Current inventory value"
          color="success"
        />
        <KPICard
          icon={AlertTriangle}
          label="Low Stock Alerts"
          value={formatNumber(lowStockProducts.length)}
          sub={lowStockProducts.length > 0 ? 'Needs attention' : 'All good!'}
          color={lowStockProducts.length > 0 ? 'warning' : 'success'}
        />
        <KPICard
          icon={ArrowLeftRight}
          label="Total Transactions"
          value={formatNumber(state.transactions.length)}
          sub={`${stockInCount} in · ${stockOutCount} out`}
          color="accent"
        />
      </div>

      {/* Recent Transactions */}
      <div className="dashboard-section">
        <div className="dashboard-section__header">
          <h3 className="dashboard-section__title">Recent Activity</h3>
          <span className="dashboard-section__badge">Last {recentTransactions.length} entries</span>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="dashboard-empty">
            <ArrowLeftRight size={40} />
            <p>No transactions yet. Start by adding products and stocking them in.</p>
          </div>
        ) : (
          <div className="dashboard-activity">
            {recentTransactions.map((t) => {
              const product = state.products.find((p) => p.id === t.productId);
              const isIn = t.type === 'STOCK_IN';
              return (
                <div key={t.id} className="activity-row">
                  <div className={`activity-row__icon activity-row__icon--${isIn ? 'in' : 'out'}`} aria-hidden="true">
                    {isIn ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  </div>
                  <div className="activity-row__info">
                    <span className="activity-row__name">{product?.name ?? 'Unknown Product'}</span>
                    <span className="activity-row__reason">{t.reason}</span>
                  </div>
                  <div className="activity-row__meta">
                    <span className={`activity-row__qty activity-row__qty--${isIn ? 'in' : 'out'}`}>
                      {isIn ? '+' : '-'}{t.quantity} {product?.unit ?? 'pcs'}
                    </span>
                    <span className="activity-row__stock">→ {t.newStock} left</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Low Stock Warning */}
      {lowStockProducts.length > 0 && (
        <div className="dashboard-section dashboard-low-stock">
          <div className="dashboard-section__header">
            <h3 className="dashboard-section__title" style={{ color: 'var(--color-warning)' }}>
              ⚠️ Low Stock Items ({lowStockProducts.length})
            </h3>
          </div>
          <div className="low-stock-list">
            {lowStockProducts.map((p) => (
              <div key={p.id} className="low-stock-item">
                <span className="low-stock-item__name">{p.name}</span>
                <span className="low-stock-item__sku mono">{p.sku}</span>
                <span className="low-stock-item__qty">
                  {p.currentStock} / {p.reorderLevel} {p.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
