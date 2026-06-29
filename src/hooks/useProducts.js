/**
 * useProducts.js
 * Custom hook for product CRUD operations
 */
import { useInventory } from '../contexts/InventoryContext';
import { productService } from '../services/productService';
import toast from 'react-hot-toast';

export const useProducts = () => {
  const { state, dispatch, activeProducts, filteredProducts } = useInventory();

  const addProduct = (data) => {
    const validation = productService.validateProduct(data);
    if (!validation.isValid) {
      Object.values(validation.errors).forEach((error) => toast.error(error));
      return { success: false, errors: validation.errors };
    }

    const product = productService.createProduct(data, state.products);
    dispatch({ type: 'ADD_PRODUCT', payload: product });
    toast.success(`Product "${product.name}" added successfully!`);
    return { success: true, product };
  };

  const updateProduct = (id, data) => {
    const validation = productService.validateProduct(data);
    if (!validation.isValid) {
      Object.values(validation.errors).forEach((error) => toast.error(error));
      return { success: false, errors: validation.errors };
    }

    const updates = productService.updateProduct(id, data);
    dispatch({ type: 'UPDATE_PRODUCT', payload: updates });
    toast.success('Product updated successfully!');
    return { success: true };
  };

  const deleteProduct = (id) => {
    const product = state.products.find((p) => p.id === id);
    if (!product) return;

    dispatch({ type: 'DELETE_PRODUCT', payload: id });
    
    // Show toast with custom action
    const toastId = toast.success(`Product "${product.name}" deleted. Click to undo.`, {
      duration: 5000,
      action: {
        label: 'Undo',
        onClick: () => {
          dispatch({ type: 'RESTORE_PRODUCT', payload: id });
          toast.dismiss(toastId);
          toast.success('Product restored!');
        },
      },
    });

    // Auto-purge after 5 seconds if not restored
    setTimeout(() => {
      const currentProduct = state.products.find((p) => p.id === id);
      if (currentProduct?.isDeleted) {
        dispatch({ type: 'PURGE_PRODUCT', payload: id });
      }
    }, 5000);

    return { success: true };
  };

  const restoreProduct = (id) => {
    dispatch({ type: 'RESTORE_PRODUCT', payload: id });
    toast.success('Product restored!');
    return { success: true };
  };

  const getProductById = (id) => {
    return state.products.find((p) => p.id === id);
  };

  const getProductBySKU = (sku) => {
    return state.products.find((p) => p.sku === sku);
  };

  return {
    products: activeProducts,
    filteredProducts,
    allProducts: state.products,
    addProduct,
    updateProduct,
    deleteProduct,
    restoreProduct,
    getProductById,
    getProductBySKU,
  };
};
