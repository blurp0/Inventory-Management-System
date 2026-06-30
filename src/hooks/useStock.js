/**
 * useStock.js
 * Async stock transaction hook — wraps stockService Supabase calls.
 */
import { useInventory } from '../contexts/InventoryContext';
import { stockService } from '../services/stockService';
import toast from 'react-hot-toast';

export const useStock = () => {
  const { state, dispatch } = useInventory();

  const stockIn = async (productId, quantity, reason, performedBy = 'Admin') => {
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

    try {
      const { transaction, newStock } = await stockService.createStockIn(
        productId, product.currentStock, quantity, reason, performedBy
      );

      // Optimistic update cache
      dispatch({
        type: 'UPDATE_PRODUCT_CACHE',
        payload: { id: productId, currentStock: newStock },
      });
      dispatch({ type: 'ADD_TRANSACTION_CACHE', payload: transaction });

      toast.success(`Added ${quantity} units to "${product.name}"`);
      return { success: true, transaction };
    } catch (err) {
      toast.error(`Stock In failed: ${err.message}`);
      return { success: false, error: err.message };
    }
  };

  const stockOut = async (productId, quantity, reason, performedBy = 'Admin') => {
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

    try {
      const { transaction, newStock } = await stockService.createStockOut(
        productId, product.currentStock, quantity, reason, performedBy
      );

      dispatch({
        type: 'UPDATE_PRODUCT_CACHE',
        payload: { id: productId, currentStock: newStock },
      });
      dispatch({ type: 'ADD_TRANSACTION_CACHE', payload: transaction });

      toast.success(`Removed ${quantity} units from "${product.name}"`);
      return { success: true, transaction };
    } catch (err) {
      toast.error(`Stock Out failed: ${err.message}`);
      return { success: false, error: err.message };
    }
  };

  const getProductTransactions = (productId) =>
    stockService.getProductTransactions
      ? state.transactions.filter((t) => t.productId === productId)
      : [];

  const getRecentTransactions = (limit = 10) =>
    stockService.getRecentTransactions(state.transactions, limit);

  return {
    transactions: state.transactions,
    loading: state.loading.transactions,
    stockIn,
    stockOut,
    getProductTransactions,
    getRecentTransactions,
  };
};
