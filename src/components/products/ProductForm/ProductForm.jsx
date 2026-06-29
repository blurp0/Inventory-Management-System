/**
 * ProductForm.jsx
 * Form component for adding/editing products
 */
import { useState, useEffect } from 'react';
import { Input, Textarea, Select } from '../../common/Input/Input';
import { Button } from '../../common/Button/Button';
import { Modal } from '../../common/Modal/Modal';
import { useProducts } from '../../../hooks/useProducts';
import { useInventory } from '../../../contexts/InventoryContext';
import './ProductForm.css';

export const ProductForm = ({ isOpen, onClose, productId = null }) => {
  const { addProduct, updateProduct, getProductById } = useProducts();
  const { state } = useInventory();
  const isEditMode = !!productId;

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    category: '',
    unitPrice: '',
    currentStock: '',
    reorderLevel: '10',
    unit: 'pcs',
    supplier: '',
    location: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEditMode && productId) {
      const product = getProductById(productId);
      if (product) {
        setFormData({
          name: product.name,
          sku: product.sku,
          description: product.description || '',
          category: product.category,
          unitPrice: product.unitPrice.toString(),
          currentStock: product.currentStock.toString(),
          reorderLevel: product.reorderLevel.toString(),
          unit: product.unit,
          supplier: product.supplier || '',
          location: product.location || '',
        });
      }
    } else {
      setFormData({
        name: '',
        sku: '',
        description: '',
        category: '',
        unitPrice: '',
        currentStock: '0',
        reorderLevel: '10',
        unit: 'pcs',
        supplier: '',
        location: '',
      });
    }
    setErrors({});
  }, [isOpen, isEditMode, productId, getProductById]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const result = isEditMode
      ? updateProduct(productId, formData)
      : addProduct(formData);

    setIsSubmitting(false);

    if (result.success) {
      onClose();
    } else if (result.errors) {
      setErrors(result.errors);
    }
  };

  const categoryOptions = [
    { value: '', label: 'Select Category' },
    ...state.categories.map((cat) => ({ value: cat, label: cat })),
    { value: '__new__', label: '+ Add New Category' },
  ];

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    if (value === '__new__') {
      const newCategory = prompt('Enter new category name:');
      if (newCategory?.trim()) {
        setFormData((prev) => ({ ...prev, category: newCategory.trim() }));
      }
    } else {
      setFormData((prev) => ({ ...prev, category: value }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Product' : 'Add New Product'}
      size="large"
    >
      <form onSubmit={handleSubmit} className="product-form">
        <div className="product-form__grid">
          <Input
            label="Product Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            required
            placeholder="e.g., Wireless Mouse"
          />

          <Input
            label="SKU"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            placeholder="Auto-generated if left empty"
            disabled={isEditMode}
          />

          <Select
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleCategoryChange}
            options={categoryOptions}
            error={errors.category}
            required
          />

          <Input
            label="Unit Price (₱)"
            name="unitPrice"
            type="number"
            step="0.01"
            min="0"
            value={formData.unitPrice}
            onChange={handleChange}
            error={errors.unitPrice}
            required
            placeholder="0.00"
          />

          {!isEditMode && (
            <Input
              label="Initial Stock"
              name="currentStock"
              type="number"
              min="0"
              value={formData.currentStock}
              onChange={handleChange}
              error={errors.currentStock}
              placeholder="0"
            />
          )}

          <Input
            label="Reorder Level"
            name="reorderLevel"
            type="number"
            min="0"
            value={formData.reorderLevel}
            onChange={handleChange}
            error={errors.reorderLevel}
            placeholder="10"
          />

          <Input
            label="Unit"
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            placeholder="e.g., pcs, kg, box"
          />

          <Input
            label="Supplier"
            name="supplier"
            value={formData.supplier}
            onChange={handleChange}
            placeholder="Supplier name"
          />

          <Input
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g., Shelf A-3"
          />
        </div>

        <Textarea
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Product description..."
          rows={3}
        />

        <div className="product-form__actions">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
          >
            {isEditMode ? 'Update Product' : 'Add Product'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
