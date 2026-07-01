/**
 * InventoryContext.jsx
 * Global state provider — now async-first with Supabase.
 * Fetches data on mount, subscribes to Realtime changes, exposes derived selectors.
 */
import { createContext, useContext, useReducer, useEffect, useMemo, useCallback } from 'react';
import { inventoryReducer, initialState } from './inventoryReducer';
import { productService } from '../services/productService';
import { stockService } from '../services/stockService';
import { categoryService } from '../services/categoryService';
import { supabase } from '../lib/supabase';

// ── Context ─────────────────────────────────────────────────────
const InventoryContext = createContext(null);

// ── Provider ─────────────────────────────────────────────────────
export const InventoryProvider = ({ children }) => {
  const [state, dispatch] = useReducer(inventoryReducer, initialState);

  // ── Initial Data Fetch ──────────────────────────────────────

  const fetchProducts = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: { products: true } });
    try {
      const products = await productService.getAllProducts();
      dispatch({ type: 'SET_PRODUCTS', payload: products });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: { transactions: true } });
    try {
      const transactions = await stockService.getAllTransactions();
      dispatch({ type: 'SET_TRANSACTIONS', payload: transactions });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const categories = await categoryService.getAll();
      dispatch({ type: 'SET_CATEGORIES', payload: categories });
    } catch (err) {
      console.warn('[InventoryContext] Failed to fetch categories:', err.message);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchTransactions();
    fetchCategories();
  }, [fetchProducts, fetchTransactions, fetchCategories]);

  // ── Realtime Subscriptions ──────────────────────────────────

  useEffect(() => {
    // Products channel — re-fetch on any change
    const productsChannel = supabase
      .channel('realtime-products')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => fetchProducts()
      )
      .subscribe();

    // Transactions channel — listen for ALL changes (INSERT, UPDATE, DELETE)
    // so that when a product is deleted and its transactions are removed,
    // the frontend immediately reflects the change.
    const transactionsChannel = supabase
      .channel('realtime-transactions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'stock_transactions' },
        () => fetchTransactions()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(productsChannel);
      supabase.removeChannel(transactionsChannel);
    };
  }, [fetchProducts, fetchTransactions]);

  // ── Derived / Computed Selectors ────────────────────────────

  const activeProducts = useMemo(
    () => state.products.filter((p) => !p.isDeleted),
    [state.products]
  );

  const lowStockProducts = useMemo(
    () => activeProducts.filter((p) => p.currentStock > 0 && p.currentStock <= p.reorderLevel),
    [activeProducts]
  );

  const outOfStockProducts = useMemo(
    () => activeProducts.filter((p) => p.currentStock === 0),
    [activeProducts]
  );

  const totalStockValue = useMemo(
    () => activeProducts.reduce((sum, p) => sum + p.currentStock * p.unitPrice, 0),
    [activeProducts]
  );

  const filteredProducts = useMemo(() => {
    const { search, category, status, sortBy, sortOrder } = state.filters;
    let result = activeProducts;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    if (category !== 'all') result = result.filter((p) => p.category === category);

    if (status !== 'all') {
      result = result.filter((p) => {
        if (status === 'out_of_stock') return p.currentStock === 0;
        if (status === 'low_stock') return p.currentStock > 0 && p.currentStock <= p.reorderLevel;
        if (status === 'in_stock') return p.currentStock > p.reorderLevel;
        return true;
      });
    }

    result = [...result].sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [activeProducts, state.filters]);

  const value = {
    state,
    dispatch,
    // Async re-fetch helpers
    fetchProducts,
    fetchTransactions,
    fetchCategories,
    // Computed
    activeProducts,
    filteredProducts,
    lowStockProducts,
    outOfStockProducts,
    totalStockValue,
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};

// ── Hook ─────────────────────────────────────────────────────────
export const useInventory = () => {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error('useInventory must be used within <InventoryProvider>');
  return ctx;
};
