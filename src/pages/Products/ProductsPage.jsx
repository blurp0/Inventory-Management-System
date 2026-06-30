/**
 * ProductsPage.jsx
 * Main products page with CRUD operations
 */
import { useState, useEffect } from 'react';
import { Plus, Upload } from 'lucide-react';
import { Button } from '../../components/common/Button/Button';
import { SearchBar } from '../../components/common/SearchBar/SearchBar';
import { Select } from '../../components/common/Input/Input';
import { ProductTable } from '../../components/products/ProductTable/ProductTable';
import { ProductForm } from '../../components/products/ProductForm/ProductForm';
import { ImportModal } from '../../components/products/ImportModal/ImportModal';
import { StockModal } from '../../components/stock/StockModal/StockModal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog/ConfirmDialog';
import { useProducts } from '../../hooks/useProducts';
import { useFilters } from '../../hooks/useFilters';
import { useInventory } from '../../contexts/InventoryContext';
import { useAuth } from '../../contexts/AuthContext';
import './ProductsPage.css';

export default function ProductsPage() {
  const { filteredProducts, deleteProduct } = useProducts();
  const { filters, setSearch, setCategory, setStatus, setSortBy } = useFilters();
  const { state } = useInventory();
  const { canEditProducts } = useAuth();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [stockModalState, setStockModalState] = useState({
    isOpen: false,
    productId: null,
    type: null,
  });
  const [deleteConfirmState, setDeleteConfirmState] = useState({
    isOpen: false,
    productId: null,
  });

  const handleAddProduct = () => {
    if (!canEditProducts) return;
    setEditingProductId(null);
    setIsFormOpen(true);
  };

  useEffect(() => {
    if (!canEditProducts) return;
    const handleShortcut = () => {
      handleAddProduct();
    };
    window.addEventListener('shortcut-add-product', handleShortcut);
    return () => {
      window.removeEventListener('shortcut-add-product', handleShortcut);
    };
  }, [canEditProducts]);

  const handleEditProduct = (productId) => {
    setEditingProductId(productId);
    setIsFormOpen(true);
  };

  const handleDeleteProduct = (productId) => {
    setDeleteConfirmState({ isOpen: true, productId });
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmState.productId) {
      await deleteProduct(deleteConfirmState.productId);
      setDeleteConfirmState({ isOpen: false, productId: null });
    }
  };

  const handleStockIn = (productId) => {
    setStockModalState({ isOpen: true, productId, type: 'in' });
  };

  const handleStockOut = (productId) => {
    setStockModalState({ isOpen: true, productId, type: 'out' });
  };

  const handleCloseStockModal = () => {
    setStockModalState({ isOpen: false, productId: null, type: null });
  };

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...state.categories.map((cat) => ({ value: cat, label: cat })),
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'in_stock', label: 'In Stock' },
    { value: 'low_stock', label: 'Low Stock' },
    { value: 'out_of_stock', label: 'Out of Stock' },
  ];

  const sortOptions = [
    { value: 'updatedAt', label: 'Recently Updated' },
    { value: 'name', label: 'Name' },
    { value: 'currentStock', label: 'Stock Level' },
    { value: 'unitPrice', label: 'Price' },
    { value: 'category', label: 'Category' },
  ];

  return (
    <div className="products-page">
      <div className="products-page__header">
        <div>
          <h1>Products</h1>
          <p>Manage your product inventory</p>
        </div>
        {canEditProducts && (
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <Button
              variant="secondary"
              icon={<Upload size={18} />}
              onClick={() => setIsImportOpen(true)}
            >
              Import CSV
            </Button>
            <Button
              variant="primary"
              icon={<Plus size={18} />}
              onClick={handleAddProduct}
            >
              Add Product
            </Button>
          </div>
        )}
      </div>

      <div className="products-page__toolbar">
        <div className="products-page__search">
          <SearchBar
            value={filters.search}
            onChange={setSearch}
            placeholder="Search products by name, SKU, or category..."
          />
        </div>

        <div className="products-page__filters">
          <Select
            options={categoryOptions}
            value={filters.category}
            onChange={(e) => setCategory(e.target.value)}
          />
          <Select
            options={statusOptions}
            value={filters.status}
            onChange={(e) => setStatus(e.target.value)}
          />
          <Select
            options={sortOptions}
            value={filters.sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          />
        </div>
      </div>

      <div className="products-page__stats">
        <div className="products-page__stat">
          <span className="products-page__stat-label">Total Products</span>
          <span className="products-page__stat-value">{filteredProducts.length}</span>
        </div>
      </div>

      <ProductTable
        products={filteredProducts}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
        onStockIn={handleStockIn}
        onStockOut={handleStockOut}
      />

      <ProductForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        productId={editingProductId}
      />

      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
      />

      <StockModal
        isOpen={stockModalState.isOpen}
        onClose={handleCloseStockModal}
        productId={stockModalState.productId}
        type={stockModalState.type}
      />

      <ConfirmDialog
        isOpen={deleteConfirmState.isOpen}
        onClose={() => setDeleteConfirmState({ isOpen: false, productId: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action will soft-delete the product."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
