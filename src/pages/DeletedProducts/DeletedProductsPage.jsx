/**
 * DeletedProductsPage.jsx
 * Admin-only page to view and restore deleted/archived products.
 * Shows product details and associated transaction count.
 */
import { useState, useEffect } from 'react';
import { Trash2, RotateCcw, Search, Package, ArrowLeftRight, X } from 'lucide-react';
import { Button } from '../../components/common/Button/Button';
import { ConfirmDialog } from '../../components/common/ConfirmDialog/ConfirmDialog';
import { Modal } from '../../components/common/Modal/Modal';
import { useProducts } from '../../hooks/useProducts';
import { useAuth } from '../../contexts/AuthContext';
import './DeletedProductsPage.css';

export default function DeletedProductsPage() {
    const { getDeletedProducts, restoreFromArchive } = useProducts();
    const { isAdmin } = useAuth();

    const [deletedProducts, setDeletedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [restoreConfirm, setRestoreConfirm] = useState({ isOpen: false, productId: null, productName: '' });
    const [transactionsModal, setTransactionsModal] = useState({ isOpen: false, product: null });

    const loadDeletedProducts = async () => {
        setLoading(true);
        const data = await getDeletedProducts();
        setDeletedProducts(data);
        setLoading(false);
    };

    useEffect(() => {
        if (isAdmin) {
            loadDeletedProducts();
        }
    }, [isAdmin]);

    const handleRestoreClick = (product) => {
        setRestoreConfirm({
            isOpen: true,
            productId: product.productId,
            productName: product.name,
        });
    };

    const handleConfirmRestore = async () => {
        if (restoreConfirm.productId) {
            await restoreFromArchive(restoreConfirm.productId);
            setRestoreConfirm({ isOpen: false, productId: null, productName: '' });
            // Refresh the list
            await loadDeletedProducts();
        }
    };

    const filteredProducts = deletedProducts.filter((p) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            p.name.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q)
        );
    });

    if (!isAdmin) {
        return (
            <div className="deleted-products-page">
                <div className="deleted-products-page__empty">
                    <Package size={48} />
                    <h2>Access Denied</h2>
                    <p>Only administrators can view deleted products.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="deleted-products-page">
            <div className="deleted-products-page__header">
                <div>
                    <h1>Deleted Products</h1>
                    <p>View and restore archived products</p>
                </div>
                <Button
                    variant="secondary"
                    onClick={loadDeletedProducts}
                    disabled={loading}
                >
                    Refresh
                </Button>
            </div>

            <div className="deleted-products-page__search">
                <div className="deleted-products-page__search-input-wrapper">
                    <Search size={18} className="deleted-products-page__search-icon" />
                    <input
                        type="text"
                        placeholder="Search deleted products by name, SKU, or category..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="deleted-products-page__search-input"
                    />
                </div>
            </div>

            {loading ? (
                <div className="deleted-products-page__loading">
                    <div className="deleted-products-page__spinner" />
                    <p>Loading deleted products...</p>
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="deleted-products-page__empty">
                    <Trash2 size={48} />
                    <h2>No Deleted Products</h2>
                    <p>
                        {searchQuery
                            ? 'No deleted products match your search.'
                            : 'There are no deleted products in the archive.'}
                    </p>
                </div>
            ) : (
                <div className="deleted-products-page__table-wrapper">
                    <table className="deleted-products-page__table">
                        <thead>
                            <tr>
                                <th>Product Name</th>
                                <th>SKU</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock at Deletion</th>
                                <th>Transactions</th>
                                <th>Deleted At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map((product) => (
                                <tr key={product.archiveId}>
                                    <td className="deleted-products-page__name-cell">
                                        <span className="deleted-products-page__product-name">{product.name}</span>
                                    </td>
                                    <td>
                                        <code className="deleted-products-page__sku">{product.sku}</code>
                                    </td>
                                    <td>
                                        <span className="deleted-products-page__category-badge">
                                            {product.category}
                                        </span>
                                    </td>
                                    <td className="deleted-products-page__price">
                                        ${parseFloat(product.unitPrice).toFixed(2)}
                                    </td>
                                    <td>
                                        <span className={`deleted-products-page__stock ${product.currentStock === 0 ? 'deleted-products-page__stock--empty' : ''
                                            }`}>
                                            {product.currentStock}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="deleted-products-page__transaction-btn"
                                            onClick={() => setTransactionsModal({ isOpen: true, product })}
                                            title="View archived transactions"
                                        >
                                            <ArrowLeftRight size={14} />
                                            <span>{product.transactionCount}</span>
                                        </button>
                                    </td>
                                    <td className="deleted-products-page__date">
                                        {new Date(product.deletedAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </td>
                                    <td>
                                        <Button
                                            variant="primary"
                                            size="small"
                                            icon={<RotateCcw size={16} />}
                                            onClick={() => handleRestoreClick(product)}
                                        >
                                            Restore
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <ConfirmDialog
                isOpen={restoreConfirm.isOpen}
                onClose={() => setRestoreConfirm({ isOpen: false, productId: null, productName: '' })}
                onConfirm={handleConfirmRestore}
                title="Restore Product"
                message={`Are you sure you want to restore "${restoreConfirm.productName}"? It will be added back to the active product list with all its transaction history preserved.`}
                confirmText="Restore"
                cancelText="Cancel"
                variant="primary"
            />

            {/* Archived Transactions Viewer Modal */}
            <Modal
                isOpen={transactionsModal.isOpen}
                onClose={() => setTransactionsModal({ isOpen: false, product: null })}
                title={`Archived Transactions - ${transactionsModal.product?.name || ''}`}
                size="large"
            >
                {transactionsModal.product && (
                    <div className="deleted-products-page__transactions-modal">
                        <div className="deleted-products-page__transactions-summary">
                            <span className="deleted-products-page__transactions-count">
                                {transactionsModal.product.transactionCount} archived transaction{transactionsModal.product.transactionCount !== 1 ? 's' : ''}
                            </span>
                        </div>
                        {transactionsModal.product.transactions && transactionsModal.product.transactions.length > 0 ? (
                            <table className="deleted-products-page__transactions-table">
                                <thead>
                                    <tr>
                                        <th>Type</th>
                                        <th>Quantity</th>
                                        <th>Previous Stock</th>
                                        <th>New Stock</th>
                                        <th>Reason</th>
                                        <th>By</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactionsModal.product.transactions.map((tx) => (
                                        <tr key={tx.id}>
                                            <td>
                                                <span className={`deleted-products-page__tx-type ${tx.type === 'STOCK_IN' ? 'deleted-products-page__tx-type--in' : 'deleted-products-page__tx-type--out'
                                                    }`}>
                                                    {tx.type === 'STOCK_IN' ? 'Stock In' : 'Stock Out'}
                                                </span>
                                            </td>
                                            <td className="deleted-products-page__tx-quantity">{tx.quantity}</td>
                                            <td className="deleted-products-page__tx-stock">{tx.previous_stock}</td>
                                            <td className="deleted-products-page__tx-stock">{tx.new_stock}</td>
                                            <td className="deleted-products-page__tx-reason">{tx.reason || '-'}</td>
                                            <td>{tx.performed_by}</td>
                                            <td className="deleted-products-page__date">
                                                {new Date(tx.created_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="deleted-products-page__transactions-empty">
                                No archived transactions for this product.
                            </p>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}
