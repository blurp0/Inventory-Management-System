/**
 * productService.js
 * Business logic for product CRUD operations
 */
import { generateSKU } from '../utils/skuGenerator';

export const productService = {
  /**
   * Create a new product
   */
  createProduct: (data, existingProducts = []) => {
    return {
      sku: data.sku || generateSKU(existingProducts),
      name: data.name.trim(),
      description: data.description?.trim() || '',
      category: data.category.trim(),
      imageUrl: data.imageUrl || '',
      unitPrice: parseFloat(data.unitPrice) || 0,
      currentStock: parseInt(data.currentStock) || 0,
      reorderLevel: parseInt(data.reorderLevel) || 10,
      unit: data.unit?.trim() || 'pcs',
      supplier: data.supplier?.trim() || '',
      location: data.location?.trim() || '',
    };
  },

  /**
   * Update an existing product
   */
  updateProduct: (id, data) => {
    return {
      id,
      name: data.name.trim(),
      description: data.description?.trim() || '',
      category: data.category.trim(),
      imageUrl: data.imageUrl || '',
      unitPrice: parseFloat(data.unitPrice) || 0,
      reorderLevel: parseInt(data.reorderLevel) || 10,
      unit: data.unit?.trim() || 'pcs',
      supplier: data.supplier?.trim() || '',
      location: data.location?.trim() || '',
      // Note: currentStock is NOT updated here — use Stock In/Out instead
    };
  },

  /**
   * Validate product data
   */
  validateProduct: (data) => {
    const errors = {};

    if (!data.name?.trim()) {
      errors.name = 'Product name is required';
    }

    if (!data.category?.trim()) {
      errors.category = 'Category is required';
    }

    if (!data.unitPrice || parseFloat(data.unitPrice) < 0) {
      errors.unitPrice = 'Unit price must be a positive number';
    }

    if (data.reorderLevel !== undefined && parseInt(data.reorderLevel) < 0) {
      errors.reorderLevel = 'Reorder level cannot be negative';
    }

    if (data.currentStock !== undefined && parseInt(data.currentStock) < 0) {
      errors.currentStock = 'Stock quantity cannot be negative';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },

  /**
   * Search products by query
   */
  searchProducts: (products, query) => {
    if (!query) return products;
    const q = query.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
    );
  },

  /**
   * Filter products by category
   */
  filterByCategory: (products, category) => {
    if (category === 'all') return products;
    return products.filter((p) => p.category === category);
  },

  /**
   * Filter products by stock status
   */
  filterByStatus: (products, status) => {
    if (status === 'all') return products;
    return products.filter((p) => {
      if (status === 'out_of_stock') return p.currentStock === 0;
      if (status === 'low_stock') return p.currentStock > 0 && p.currentStock <= p.reorderLevel;
      if (status === 'in_stock') return p.currentStock > p.reorderLevel;
      return true;
    });
  },

  /**
   * Sort products
   */
  sortProducts: (products, sortBy, sortOrder = 'asc') => {
    return [...products].sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  },
};
