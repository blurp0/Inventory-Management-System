/**
 * ReportsPage.jsx
 * Reports & Analytics dashboard. Features KPI summary cards,
 * interactive Recharts visualizations (Value, Category Distribution, Movement trends,
 * Low Stock compare), theme-aware chart components, and PDF/CSV export tools.
 */
import { useMemo } from 'react';
import PageWrapper from '../../components/layout/PageWrapper/PageWrapper';
import { useInventory } from '../../contexts/InventoryContext';
import { useTheme } from '../../contexts/ThemeContext';
import { exportService } from '../../services/exportService';
import { Button } from '../../components/common/Button/Button';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import dayjs from 'dayjs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import {
  FileText,
  Download,
  DollarSign,
  Package,
  ArrowUpDown,
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react';
import './ReportsPage.css';

// Hex palettes for theme customization
const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#22D3EE', '#8B5CF6', '#EC4899', '#38BDF8'];

export default function ReportsPage() {
  const { state, activeProducts, lowStockProducts, totalStockValue } = useInventory();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Dynamic Theme Colors for Charts
  const chartStyles = {
    gridColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)',
    textColor: isDark ? '#94A3B8' : '#64748B',
    tooltipBg: isDark ? '#1E293B' : '#FFFFFF',
    tooltipBorder: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
  };

  // ── Calculation 1: Stock Value by Category ─────────────────
  const valueByCategoryData = useMemo(() => {
    const categoryTotals = {};
    activeProducts.forEach((p) => {
      categoryTotals[p.category] = (categoryTotals[p.category] || 0) + (p.currentStock * p.unitPrice);
    });
    return Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value,
    }));
  }, [activeProducts]);

  // ── Calculation 2: Category Distribution (Counts) ──────────
  const categoryCountData = useMemo(() => {
    const categoryCounts = {};
    activeProducts.forEach((p) => {
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
    });
    return Object.entries(categoryCounts).map(([name, value]) => ({
      name,
      value,
    }));
  }, [activeProducts]);

  // ── Calculation 3: Stock Movements Trend (Last 15 Days) ────
  const movementsTrendData = useMemo(() => {
    // Generate dates for the last 15 days
    const dates = Array.from({ length: 15 }, (_, i) => {
      return dayjs().subtract(14 - i, 'day').format('YYYY-MM-DD');
    });

    const dailySummary = {};
    dates.forEach((d) => {
      dailySummary[d] = { dateLabel: dayjs(d).format('MMM DD'), inVolume: 0, outVolume: 0 };
    });

    // Populate with actual transactions
    state.transactions.forEach((tx) => {
      const txDate = dayjs(tx.createdAt).format('YYYY-MM-DD');
      if (dailySummary[txDate]) {
        if (tx.type === 'STOCK_IN') {
          dailySummary[txDate].inVolume += tx.quantity;
        } else {
          dailySummary[txDate].outVolume += tx.quantity;
        }
      }
    });

    return Object.values(dailySummary);
  }, [state.transactions]);

  // ── Calculation 4: Low Stock Compare (Limit to top 8 items) ──
  const lowStockCompareData = useMemo(() => {
    return lowStockProducts.slice(0, 8).map((p) => ({
      name: p.name,
      'Current Stock': p.currentStock,
      'Reorder Level': p.reorderLevel,
    }));
  }, [lowStockProducts]);

  // ── Export Trigger Wrappers ────────────────────────────────
  const handleExportProductsPDF = () => {
    exportService.exportProductsPDF(state.products);
  };

  const handleExportTransactionsPDF = () => {
    exportService.exportTransactionsPDF(state.transactions, state.products);
  };

  const handleExportProductsCSV = () => {
    exportService.exportProductsCSV(state.products);
  };

  const handleExportTransactionsCSV = () => {
    exportService.exportTransactionsCSV(state.transactions, state.products);
  };

  return (
    <PageWrapper
      title="Reports & Analytics"
      subtitle="Inventory statistics, trend charts, and professional PDF/CSV exports"
    >
      {/* 1. Statistics Cards */}
      <div className="reports-stats-grid mb-6">
        <div className="report-kpi bg-glass rounded-xl p-4 border shadow-sm flex items-start gap-4">
          <div className="report-kpi__icon bg-primary-dim text-primary rounded-lg p-3">
            <DollarSign size={20} />
          </div>
          <div>
            <span className="report-kpi__label">Total Assets Valuation</span>
            <h3 className="report-kpi__value">{formatCurrency(totalStockValue)}</h3>
            <span className="report-kpi__sub">Sum of stock × price</span>
          </div>
        </div>

        <div className="report-kpi bg-glass rounded-xl p-4 border shadow-sm flex items-start gap-4">
          <div className="report-kpi__icon bg-success-dim text-success rounded-lg p-3">
            <Package size={20} />
          </div>
          <div>
            <span className="report-kpi__label">Catalog Items</span>
            <h3 className="report-kpi__value">{formatNumber(activeProducts.length)}</h3>
            <span className="report-kpi__sub">Active products tracked</span>
          </div>
        </div>

        <div className="report-kpi bg-glass rounded-xl p-4 border shadow-sm flex items-start gap-4">
          <div className="report-kpi__icon bg-info-dim text-info rounded-lg p-3">
            <ArrowUpDown size={20} />
          </div>
          <div>
            <span className="report-kpi__label">Audit Movements</span>
            <h3 className="report-kpi__value">{formatNumber(state.transactions.length)}</h3>
            <span className="report-kpi__sub">Total ledger records</span>
          </div>
        </div>

        <div className="report-kpi bg-glass rounded-xl p-4 border shadow-sm flex items-start gap-4">
          <div className="report-kpi__icon bg-warning-dim text-warning rounded-lg p-3">
            <AlertTriangle size={20} />
          </div>
          <div>
            <span className="report-kpi__label">Low Stock Alerts</span>
            <h3 className="report-kpi__value text-warning">{formatNumber(lowStockProducts.length)}</h3>
            <span className="report-kpi__sub">Items requiring restock</span>
          </div>
        </div>
      </div>

      {/* 2. Export Actions Grid */}
      <div className="export-grid mb-8">
        {/* PDF Export Panel */}
        <div className="export-card pdf-export bg-glass rounded-xl p-5 border shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex-start gap-2 mb-2 text-primary font-bold">
              <FileText size={20} />
              <h4>PDF Documents Export</h4>
            </div>
            <p className="text-secondary text-sm mb-4">
              Generate formatted executive PDF documents with summaries, KPIs, and structured tables.
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Button
              variant="primary"
              size="small"
              icon={<Download size={14} />}
              onClick={handleExportProductsPDF}
            >
              Product Inventory PDF
            </Button>
            <Button
              variant="primary"
              size="small"
              icon={<Download size={14} />}
              onClick={handleExportTransactionsPDF}
            >
              Stock Audit PDF
            </Button>
          </div>
        </div>

        {/* CSV Export Panel */}
        <div className="export-card csv-export bg-glass rounded-xl p-5 border shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex-start gap-2 mb-2 text-accent font-bold">
              <FileSpreadsheet size={20} />
              <h4>CSV Spreadsheet Export</h4>
            </div>
            <p className="text-secondary text-sm mb-4">
              Download clean raw dataset files ready for import and advanced data analysis in Excel.
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Button
              variant="accent"
              size="small"
              icon={<Download size={14} />}
              onClick={handleExportProductsCSV}
            >
              Products Catalog CSV
            </Button>
            <Button
              variant="accent"
              size="small"
              icon={<Download size={14} />}
              onClick={handleExportTransactionsCSV}
            >
              Transactions CSV
            </Button>
          </div>
        </div>
      </div>

      {/* 3. Charts Grid */}
      <div className="charts-grid">
        {/* Chart 1: Stock Value by Category */}
        <div className="chart-card bg-glass rounded-xl p-5 border shadow-sm">
          <h4 className="chart-title mb-4">Inventory valuation by category</h4>
          {valueByCategoryData.length === 0 ? (
            <div className="chart-empty text-muted">No category valuation data available.</div>
          ) : (
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={valueByCategoryData} margin={{ bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartStyles.gridColor} vertical={false} />
                  <XAxis dataKey="name" stroke={chartStyles.textColor} fontSize={11} tickLine={false} />
                  <YAxis
                    stroke={chartStyles.textColor}
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(v) => `₱${formatNumber(v)}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: chartStyles.tooltipBg,
                      borderColor: chartStyles.tooltipBorder,
                      color: isDark ? '#fff' : '#000',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 'var(--text-sm)',
                    }}
                    formatter={(v) => [formatCurrency(v), 'Valuation']}
                  />
                  <Bar dataKey="value" fill="var(--color-primary)" radius={[4, 4, 0, 0]} maxBarSize={45}>
                    {valueByCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Chart 2: Category Distribution */}
        <div className="chart-card bg-glass rounded-xl p-5 border shadow-sm">
          <h4 className="chart-title mb-4">Category distribution (Product Count)</h4>
          {categoryCountData.length === 0 ? (
            <div className="chart-empty text-muted">No category counts data available.</div>
          ) : (
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryCountData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={{ stroke: chartStyles.textColor, strokeWidth: 0.5 }}
                  >
                    {categoryCountData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: chartStyles.tooltipBg,
                      borderColor: chartStyles.tooltipBorder,
                      color: isDark ? '#fff' : '#000',
                      borderRadius: 'var(--radius-md)',
                    }}
                    formatter={(v) => [`${v} products`, 'Quantity']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Chart 3: Stock Movements Trend */}
        <div className="chart-card bg-glass rounded-xl p-5 border shadow-sm">
          <h4 className="chart-title mb-4">Stock inflows vs outflows (Last 15 days)</h4>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={movementsTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartStyles.gridColor} />
                <XAxis dataKey="dateLabel" stroke={chartStyles.textColor} fontSize={11} tickLine={false} />
                <YAxis stroke={chartStyles.textColor} fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: chartStyles.tooltipBg,
                    borderColor: chartStyles.tooltipBorder,
                    color: isDark ? '#fff' : '#000',
                    borderRadius: 'var(--radius-md)',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                <Line
                  type="monotone"
                  dataKey="inVolume"
                  name="Stock In"
                  stroke="var(--color-success)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="outVolume"
                  name="Stock Out"
                  stroke="var(--color-danger)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Low Stock Compare */}
        <div className="chart-card bg-glass rounded-xl p-5 border shadow-sm">
          <h4 className="chart-title mb-4">Low stock comparison (Current stock vs Reorder level)</h4>
          {lowStockCompareData.length === 0 ? (
            <div className="chart-empty text-muted">No low stock items currently detected.</div>
          ) : (
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={lowStockCompareData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartStyles.gridColor} horizontal={false} />
                  <XAxis type="number" stroke={chartStyles.textColor} fontSize={11} tickLine={false} />
                  <YAxis dataKey="name" type="category" stroke={chartStyles.textColor} fontSize={11} width={80} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: chartStyles.tooltipBg,
                      borderColor: chartStyles.tooltipBorder,
                      color: isDark ? '#fff' : '#000',
                      borderRadius: 'var(--radius-md)',
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                  <Bar dataKey="Current Stock" fill="var(--color-danger)" radius={[0, 4, 4, 0]} maxBarSize={15} />
                  <Bar dataKey="Reorder Level" fill="var(--color-warning)" radius={[0, 4, 4, 0]} maxBarSize={15} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
