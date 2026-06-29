/**
 * useStock.js
 * Custom hook for stock transaction operations
 */
import { useInventory } from '../contexts/InventoryContext';
import { stockService } from '../services/stockService';
import toast from 'react-hot-toast';

export const useStock = () => {
  const { state, dispatch } = useInventory();

  const stockIn = (productId, quantity, reason, performedBy = 'Admin') => {
    const product = state.products.find((p) => p.id === productId);
    if (!product) {
      toast.error('Product not found');
      return { success: false };
    }

    const validation = stockService.validateStockTransaction(product, quantity, 'STOCK_IN');
    if (!validation.isValid) {
      Object.values(validation.errors).forEach((error) => toast.error(error));
      return { success: false, errors: validation.errors };
    }

    const data = stockService.createStockInData(productId, quantity, reason, performedBy);
    dispatch({ type: 'STOCK_IN', payload: data });
    toast.success(`Added ${quantity} units to "${product.name}"`);
    return { success: true };
  };

  const stockOut = (productId, quantity, reason, performedBy = 'Admin') => {
    const product = state.products.find((p) => p.id === productId);
    if (!product) {
      toast.error('Product not found');
      return { success: false };
    }

    const validation = stockService.validateStockTransaction(product, quantity, 'STOCK_OUT');
    if (!validation.isValid) {
      Object.values(validation.errors).forEach((error) => toast.error(error));
      return { success: false, errors: validation.errors };
    }

    const data = stockService.createStockOutData(productId, quantity, reason, performedBy);
    dispatch({ type: 'STOCK_OUT', payload: data });
    toast.success(`Removed ${quantity} units from "${product.name}"`);
    return { success: true };
  };

  const getProductTransactions = (productId) => {
    return stockService.getProductTransactions(state.transactions, productId);
  };

  const getRecentTransactions = (limit = 10) => {
    return stockService.getRecentTransactions(state.transactions, limit);
  };

  return {
    transactions: state.transactions,
    stockIn,
    stockOut,
    getProductTransactions,
    getRecentTransactions,
  };
};
