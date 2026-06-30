/**
 * ProductForm.jsx
 * Form component for adding/editing products
 */
import { useState, useEffect } from 'react';
import { Input, Textarea, Select } from '../../common/Input/Input';
import { Button } from '../../common/Button/Button';
import { Modal } from '../../common/Modal/Modal';
import { CategoryModal } from '../../common/CategoryModal/CategoryModal';
import { ConfirmDialog } from '../../common/ConfirmDialog/ConfirmDialog';
import { useProducts } from '../../../hooks/useProducts';
import { useInventory } from '../../../contexts/InventoryContext';
import { categoryService } from '../../../services';
import toast from 'react-hot-toast';
import './ProductForm.css';

export const ProductForm = ({ isOpen, onClose, productId = null }) => {
  const { addProduct, updateProduct, getProductById } = useProducts();
  const { state, dispatch } = useInventory();
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
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [initialFormData, setInitialFormData] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    if (!isOpen) return; // Only run when modal opens
    
    const initialData = {
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
    };
    
    if (isEditMode && productId) {
      const product = getProductById(productId);
      if (product) {
        const editData = {
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
        };
        setFormData(editData);
        setInitialFormData(editData);
      }
    } else {
      setFormData(initialData);
      setInitialFormData(initialData);
    }
    setErrors({});
    setHasUnsavedChanges(false);
  }, [isOpen, productId]); // Removed getProductById and isEditMode from dependencies

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      // Check if form has changes
      const hasChanges = JSON.stringify(newData) !== JSON.stringify(initialFormData);
      setHasUnsavedChanges(hasChanges);
      return newData;
    });
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const result = isEditMode
        ? await updateProduct(productId, formData)
        : await addProduct(formData);

      if (result.success) {
        // Reset form to default values on successful submit
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
        setHasUnsavedChanges(false);
        onClose();
      } else if (result.errors) {
        setErrors(result.errors);
      }
    } catch (err) {
      console.error(err);
      toast.error('An unexpected error occurred while saving the product.');
    } finally {
      setIsSubmitting(false);
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
      setIsCategoryModalOpen(true);
    } else {
      setFormData((prev) => {
        const newData = { ...prev, category: value };
        const hasChanges = JSON.stringify(newData) !== JSON.stringify(initialFormData);
        setHasUnsavedChanges(hasChanges);
        return newData;
      });
    }
  };

  const handleAddCategory = async (categoryName) => {
    try {
      await categoryService.add(categoryName);
      // Update local context cache
      dispatch({ type: 'ADD_CATEGORY_CACHE', payload: categoryName });
      
      setFormData((prev) => {
        const newData = { ...prev, category: categoryName };
        const hasChanges = JSON.stringify(newData) !== JSON.stringify(initialFormData);
        setHasUnsavedChanges(hasChanges);
        return newData;
      });
      
      toast.success(`Category "${categoryName}" added successfully!`);
    } catch (err) {
      toast.error(err.message || 'Failed to add category');
      throw err; // propagates to CategoryModal to display error and prevent close
    }
  };

  const handleCloseAttempt = () => {
    if (hasUnsavedChanges) {
      setShowConfirmDialog(true);
    } else {
      onClose();
    }
  };

  const handleConfirmClose = () => {
    setHasUnsavedChanges(false);
    setShowConfirmDialog(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Product' : 'Add New Product'}
      size="large"
      preventClose={hasUnsavedChanges}
      onCloseAttempt={handleCloseAttempt}
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
            onClick={handleCloseAttempt}
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

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onAdd={handleAddCategory}
        existingCategories={state.categories}
      />

      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirmClose}
        title="Unsaved Changes"
        message="You have unsaved changes. Are you sure you want to close this form? All changes will be lost."
        confirmText="Discard Changes"
        cancelText="Keep Editing"
        variant="warning"
      />
    </Modal>
  );
};
