/**
 * TransactionsPage.jsx
 * Fully featured page displaying all inventory transactions (Stock In/Out)
 * with robust filters, search, sorting, pagination, and detail inspection.
 */
import { useState, useMemo, useEffect } from 'react';
import PageWrapper from '../../components/layout/PageWrapper/PageWrapper';
import { useInventory } from '../../contexts/InventoryContext';
import { Badge } from '../../components/common/Badge/Badge';
import { Button } from '../../components/common/Button/Button';
import { Modal } from '../../components/common/Modal/Modal';
import { SearchBar } from '../../components/common/SearchBar/SearchBar';
import { Select } from '../../components/common/Input/Input';
import { formatDateTime, formatNumber } from '../../utils/formatters';
import {
  Eye,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Calendar,
  Layers,
  Inbox
} from 'lucide-react';
import './TransactionsPage.css';

const ITEMS_PER_PAGE = 10;

export default function TransactionsPage() {
  const { state } = useInventory();

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [productFilter, setProductFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Sorting State
  const [sortBy, setSortBy] = useState('createdAt'); // 'createdAt' | 'quantity'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // Selected Transaction for Modal Inspect
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // Reset page to 1 when filters or sorting change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, typeFilter, productFilter, startDate, endDate, sortBy, sortOrder]);

  // Derived filters options
  const productOptions = useMemo(() => {
    return [
      { value: 'all', label: 'All Products' },
      ...state.products.map((p) => ({
        value: p.id,
        label: `${p.name} (${p.sku})` + (p.isDeleted ? ' [Deleted]' : ''),
      })),
    ];
  }, [state.products]);

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'STOCK_IN', label: 'Stock In' },
    { value: 'STOCK_OUT', label: 'Stock Out' },
  ];

  // Filtering & Sorting Logic
  const filteredTransactions = useMemo(() => {
    let result = state.transactions;

    // 1. Text Search (Matches Product Name, SKU, Operator, Reason)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((t) => {
        const prod = state.products.find((p) => p.id === t.productId);
        return (
          t.reason?.toLowerCase().includes(q) ||
          t.performedBy?.toLowerCase().includes(q) ||
          prod?.name?.toLowerCase().includes(q) ||
          prod?.sku?.toLowerCase().includes(q)
        );
      });
    }

    // 2. Type Filter
    if (typeFilter !== 'all') {
      result = result.filter((t) => t.type === typeFilter);
    }

    // 3. Product Filter
    if (productFilter !== 'all') {
      result = result.filter((t) => t.productId === productFilter);
    }

    // 4. Date Range Filter
    if (startDate) {
      result = result.filter((t) => new Date(t.createdAt) >= new Date(startDate + 'T00:00:00'));
    }
    if (endDate) {
      result = result.filter((t) => new Date(t.createdAt) <= new Date(endDate + 'T23:59:59'));
    }

    // 5. Sorting
    result = [...result].sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (sortBy === 'createdAt') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [state.transactions, state.products, searchQuery, typeFilter, productFilter, startDate, endDate, sortBy, sortOrder]);

  // Paginated View
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE) || 1;
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredTransactions, currentPage]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setProductFilter('all');
    setStartDate('');
    setEndDate('');
    setSortBy('createdAt');
    setSortOrder('desc');
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleViewDetails = (transaction) => {
    const product = state.products.find((p) => p.id === transaction.productId);
    setSelectedTransaction({
      ...transaction,
      productName: product?.name ?? 'Unknown Product',
      productSKU: product?.sku ?? 'N/A',
      productCategory: product?.category ?? 'N/A',
      productUnit: product?.unit ?? 'pcs',
    });
  };

  return (
    <PageWrapper
      title="Stock Movements"
      subtitle="Complete audit log of every stock in and stock out transaction"
    >
      {/* Filters Toolbar */}
      <div className="transactions-filters bg-glass rounded-xl p-4 mb-6 shadow-sm">
        <div className="filters-grid">
          <div className="filter-search">
            <label className="filter-label">Search Transactions</label>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by SKU, product, user, reason..."
            />
          </div>

          <div className="filter-field">
            <label className="filter-label">Movement Type</label>
            <Select
              options={typeOptions}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            />
          </div>

          <div className="filter-field">
            <label className="filter-label">Filter Product</label>
            <Select
              options={productOptions}
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
            />
          </div>

          <div className="filter-field">
            <label className="filter-label">Start Date</label>
            <div className="date-input-wrapper">
              <Calendar className="date-icon" size={16} />
              <input
                type="date"
                className="input filter-date-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
          </div>

          <div className="filter-field">
            <label className="filter-label">End Date</label>
            <div className="date-input-wrapper">
              <Calendar className="date-icon" size={16} />
              <input
                type="date"
                className="input filter-date-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
              />
            </div>
          </div>
        </div>

        <div className="filters-actions mt-4 flex flex-between">
          <span className="text-sm text-secondary">
            Found <strong>{formatNumber(filteredTransactions.length)}</strong> transactions
          </span>
          <Button
            variant="ghost"
            size="small"
            icon={<RotateCcw size={14} />}
            onClick={handleResetFilters}
          >
            Reset Filters
          </Button>
        </div>
      </div>

      {/* Main Table */}
      {paginatedTransactions.length === 0 ? (
        <div className="transactions-empty bg-glass rounded-xl p-8 text-center border shadow-sm">
          <Inbox size={48} className="text-muted mb-4" />
          <h3>No transactions found</h3>
          <p className="text-secondary mb-4">No stock movements match your active filters.</p>
          <Button variant="primary" onClick={handleResetFilters}>
            Clear All Filters
          </Button>
        </div>
      ) : (
        <div className="transactions-table-container bg-glass rounded-xl border shadow-sm">
          <div className="table-responsive">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th className="sortable" onClick={() => toggleSort('createdAt')}>
                    <div className="flex-start gap-1">
                      Date & Time
                      <ArrowUpDown size={13} className={sortBy === 'createdAt' ? 'text-primary' : 'text-muted'} />
                    </div>
                  </th>
                  <th>SKU</th>
                  <th>Product</th>
                  <th>Type</th>
                  <th className="sortable text-right" onClick={() => toggleSort('quantity')}>
                    <div className="flex-end gap-1">
                      Quantity
                      <ArrowUpDown size={13} className={sortBy === 'quantity' ? 'text-primary' : 'text-muted'} />
                    </div>
                  </th>
                  <th className="text-right">New Stock</th>
                  <th>Operator</th>
                  <th>Reason</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTransactions.map((tx) => {
                  const product = state.products.find((p) => p.id === tx.productId);
                  const isIn = tx.type === 'STOCK_IN';
                  return (
                    <tr key={tx.id}>
                      <td className="text-secondary whitespace-nowrap">{formatDateTime(tx.createdAt)}</td>
                      <td>
                        <code className="product-sku">{product?.sku ?? 'N/A'}</code>
                      </td>
                      <td>
                        <div className="product-info-cell">
                          <strong>{product?.name ?? 'Unknown Product'}</strong>
                          {product?.isDeleted && <Badge variant="default">Deleted</Badge>}
                        </div>
                      </td>
                      <td>
                        <Badge variant={isIn ? 'success' : 'danger'}>{isIn ? 'Stock In' : 'Stock Out'}</Badge>
                      </td>
                      <td className={`text-right font-semibold ${isIn ? 'text-success' : 'text-danger'}`}>
                        {isIn ? '+' : '-'}{tx.quantity}
                      </td>
                      <td className="text-right font-medium">{tx.newStock}</td>
                      <td className="text-secondary">{tx.performedBy || 'Admin'}</td>
                      <td className="text-secondary truncate-cell" title={tx.reason}>
                        {tx.reason}
                      </td>
                      <td className="text-center">
                        <Button
                          size="small"
                          variant="ghost"
                          icon={<Eye size={16} />}
                          onClick={() => handleViewDetails(tx)}
                          title="View Details"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="pagination-bar p-4 border-top flex flex-between flex-wrap gap-4">
            <span className="text-sm text-secondary">
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to{' '}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredTransactions.length)} of{' '}
              {filteredTransactions.length} items
            </span>
            <div className="pagination-buttons flex gap-2">
              <Button
                variant="ghost"
                size="small"
                icon={<ChevronLeft size={16} />}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="pagination-indicator text-sm font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="ghost"
                size="small"
                icon={<ChevronRight size={16} />}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Details Modal */}
      <Modal
        isOpen={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        title="Transaction Details"
        size="medium"
      >
        {selectedTransaction && (
          <div className="tx-details-modal">
            {/* Modal Header Badge */}
            <div className="flex-between mb-4 pb-2 border-bottom">
              <div>
                <span className="text-xs text-muted">TRANSACTION ID</span>
                <p className="mono text-sm text-primary font-semibold">{selectedTransaction.id}</p>
              </div>
              <Badge variant={selectedTransaction.type === 'STOCK_IN' ? 'success' : 'danger'}>
                {selectedTransaction.type === 'STOCK_IN' ? 'STOCK INFLOW' : 'STOCK OUTFLOW'}
              </Badge>
            </div>

            {/* Product Summary */}
            <div className="modal-section mb-4">
              <div className="section-title flex-start gap-2 text-secondary mb-2">
                <Layers size={16} />
                <span>Product Information</span>
              </div>
              <div className="details-card rounded-lg p-3 bg-elevated">
                <div className="details-row">
                  <span className="details-label">Name</span>
                  <span className="details-value font-bold">{selectedTransaction.productName}</span>
                </div>
                <div className="details-row">
                  <span className="details-label">SKU Code</span>
                  <span className="details-value mono font-semibold">{selectedTransaction.productSKU}</span>
                </div>
                <div className="details-row">
                  <span className="details-label">Category</span>
                  <span className="details-value">{selectedTransaction.productCategory}</span>
                </div>
              </div>
            </div>

            {/* Adjustment Flow */}
            <div className="modal-section mb-4">
              <div className="section-title flex-start gap-2 text-secondary mb-2">
                {selectedTransaction.type === 'STOCK_IN' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span>Stock Level Delta</span>
              </div>
              <div className="delta-flow-container rounded-lg p-4 bg-elevated text-center flex flex-between">
                <div className="flow-step">
                  <span className="flow-label">Previous Stock</span>
                  <p className="flow-value">{selectedTransaction.previousStock} {selectedTransaction.productUnit}</p>
                </div>
                <div className="flow-connector text-muted font-bold text-lg">
                  {selectedTransaction.type === 'STOCK_IN' ? '＋' : '－'}
                </div>
                <div className="flow-step">
                  <span className="flow-label">Adjustment</span>
                  <p className={`flow-value font-bold ${selectedTransaction.type === 'STOCK_IN' ? 'text-success' : 'text-danger'}`}>
                    {selectedTransaction.quantity} {selectedTransaction.productUnit}
                  </p>
                </div>
                <div className="flow-connector text-muted font-bold text-lg">＝</div>
                <div className="flow-step">
                  <span className="flow-label font-bold text-primary">Final Stock</span>
                  <p className="flow-value font-bold text-primary">{selectedTransaction.newStock} {selectedTransaction.productUnit}</p>
                </div>
              </div>
            </div>

            {/* Audit Logs */}
            <div className="modal-section">
              <div className="details-card rounded-lg p-3 bg-elevated">
                <div className="details-row">
                  <span className="details-label">Date & Time</span>
                  <span className="details-value">{formatDateTime(selectedTransaction.createdAt)}</span>
                </div>
                <div className="details-row">
                  <span className="details-label">Performed By</span>
                  <span className="details-value font-medium">{selectedTransaction.performedBy || 'Admin'}</span>
                </div>
                <div className="details-row flex-col items-start gap-1">
                  <span className="details-label">Reason / Notes</span>
                  <span className="details-value text-secondary bg-base rounded-md p-2 w-full text-sm block mt-1 border">
                    {selectedTransaction.reason || 'No details provided.'}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Close */}
            <div className="flex-end mt-6">
              <Button variant="secondary" onClick={() => setSelectedTransaction(null)}>
                Close Details
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </PageWrapper>
  );
}
