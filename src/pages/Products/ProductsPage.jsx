/**
 * ProductsPage.jsx
 * Main products page with CRUD operations
 */
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../../components/common/Button/Button';
import { SearchBar } from '../../components/common/SearchBar/SearchBar';
import { Select } from '../../components/common/Input/Input';
import { ProductTable } from '../../components/products/ProductTable/ProductTable';
import { ProductForm } from '../../components/products/ProductForm/ProductForm';
import { StockModal } from '../../components/stock/StockModal/StockModal';
import { useProducts } from '../../hooks/useProducts';
import { useFilters } from '../../hooks/useFilters';
import { useInventory } from '../../contexts/InventoryContext';
import './ProductsPage.css';

export default function ProductsPage() {
  const { filteredProducts, deleteProduct } = useProducts();
  const { filters, setSearch, setCategory, setStatus, setSortBy } = useFilters();
  const { state } = useInventory();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [stockModalState, setStockModalState] = useState({
    isOpen: false,
    productId: null,
    type: null,
  });

  const handleAddProduct = () => {
    setEditingProductId(null);
    setIsFormOpen(true);
  };

  const handleEditProduct = (productId) => {
    setEditingProductId(productId);
    setIsFormOpen(true);
  };

  const handleDeleteProduct = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProduct(productId);
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
        <Button
          variant="primary"
          icon={<Plus size={18} />}
          onClick={handleAddProduct}
        >
          Add Product
        </Button>
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

      <StockModal
        isOpen={stockModalState.isOpen}
        onClose={handleCloseStockModal}
        productId={stockModalState.productId}
        type={stockModalState.type}
      />
    </div>
  );
}
