/**
 * InventoryContext.jsx
 * Global state provider — wraps the app and exposes state + dispatch.
 * Automatically persists to localStorage on every state change.
 */
import { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
import { inventoryReducer, initialState } from './inventoryReducer';
import { loadState, saveState } from '../services/storageService';

// ── Context ─────────────────────────────────────────────────
const InventoryContext = createContext(null);

// ── Provider ─────────────────────────────────────────────────
export const InventoryProvider = ({ children }) => {
  // Hydrate from localStorage on first render
  const hydrated = useMemo(() => {
    const saved = loadState();
    if (saved) {
      // Merge saved data into initial state shape (handles new keys gracefully)
      return {
        ...initialState,
        products: saved.products ?? [],
        transactions: saved.transactions ?? [],
        categories: saved.categories ?? [],
        // Don't restore UI/filter state — always start fresh
      };
    }
    return initialState;
  }, []);

  const [state, dispatch] = useReducer(inventoryReducer, hydrated);

  // Persist to localStorage whenever products/transactions/categories change
  useEffect(() => {
    saveState({
      products: state.products,
      transactions: state.transactions,
      categories: state.categories,
    });
  }, [state.products, state.transactions, state.categories]);

  // ── Derived / computed selectors ───────────────────────────
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

    if (category !== 'all') {
      result = result.filter((p) => p.category === category);
    }

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

// ── Hook ─────────────────────────────────────────────────────
export const useInventory = () => {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error('useInventory must be used within <InventoryProvider>');
  return ctx;
};
