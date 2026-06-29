/**
 * inventoryReducer.js
 * Pure reducer — all state transitions for the Inventory Management System.
 */
import { generateId } from '../utils/formatters';

export const initialState = {
  products: [],
  transactions: [],
  categories: [],
  filters: {
    search: '',
    category: 'all',
    status: 'all',   // 'all' | 'in_stock' | 'low_stock' | 'out_of_stock'
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  },
  ui: {
    activeModal: null, // null | 'addProduct' | 'editProduct' | 'stockIn' | 'stockOut' | 'deleteProduct'
    selectedProductId: null,
    sidebarOpen: true,
  },
};

export const inventoryReducer = (state, action) => {
  switch (action.type) {

    // ── Products ──────────────────────────────────────────
    case 'ADD_PRODUCT': {
      const newProduct = {
        ...action.payload,
        id: generateId(),
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      // Auto-register new category if it doesn't exist
      const categories = state.categories.includes(newProduct.category)
        ? state.categories
        : [...state.categories, newProduct.category];
      return {
        ...state,
        products: [newProduct, ...state.products],
        categories,
      };
    }

    case 'UPDATE_PRODUCT': {
      const categories = [
        ...new Set([
          ...state.categories,
          action.payload.category,
        ]),
      ];
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === action.payload.id
            ? { ...p, ...action.payload, updatedAt: new Date().toISOString() }
            : p
        ),
        categories,
      };
    }

    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === action.payload
            ? { ...p, isDeleted: true, updatedAt: new Date().toISOString() }
            : p
        ),
      };

    case 'RESTORE_PRODUCT':
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === action.payload
            ? { ...p, isDeleted: false, updatedAt: new Date().toISOString() }
            : p
        ),
      };

    case 'PURGE_PRODUCT':
      return {
        ...state,
        products: state.products.filter((p) => p.id !== action.payload),
        transactions: state.transactions.filter((t) => t.productId !== action.payload),
      };

    // ── Stock Transactions ─────────────────────────────────
    case 'STOCK_IN': {
      const { productId, quantity, reason, performedBy } = action.payload;
      const product = state.products.find((p) => p.id === productId);
      if (!product) return state;

      const previousStock = product.currentStock;
      const newStock = previousStock + quantity;
      const transaction = {
        id: generateId(),
        productId,
        type: 'STOCK_IN',
        quantity,
        reason: reason || 'Stock Replenishment',
        previousStock,
        newStock,
        performedBy: performedBy || 'Admin',
        createdAt: new Date().toISOString(),
      };

      return {
        ...state,
        products: state.products.map((p) =>
          p.id === productId
            ? { ...p, currentStock: newStock, updatedAt: new Date().toISOString() }
            : p
        ),
        transactions: [transaction, ...state.transactions],
      };
    }

    case 'STOCK_OUT': {
      const { productId, quantity, reason, performedBy } = action.payload;
      const product = state.products.find((p) => p.id === productId);
      if (!product) return state;
      if (product.currentStock < quantity) return state; // Guard: prevent negative stock

      const previousStock = product.currentStock;
      const newStock = previousStock - quantity;
      const transaction = {
        id: generateId(),
        productId,
        type: 'STOCK_OUT',
        quantity,
        reason: reason || 'Stock Withdrawal',
        previousStock,
        newStock,
        performedBy: performedBy || 'Admin',
        createdAt: new Date().toISOString(),
      };

      return {
        ...state,
        products: state.products.map((p) =>
          p.id === productId
            ? { ...p, currentStock: newStock, updatedAt: new Date().toISOString() }
            : p
        ),
        transactions: [transaction, ...state.transactions],
      };
    }

    // ── Filters ────────────────────────────────────────────
    case 'SET_SEARCH':
      return { ...state, filters: { ...state.filters, search: action.payload } };

    case 'SET_FILTER':
      return { ...state, filters: { ...state.filters, ...action.payload } };

    case 'RESET_FILTERS':
      return { ...state, filters: { ...initialState.filters } };

    // ── UI ─────────────────────────────────────────────────
    case 'OPEN_MODAL':
      return {
        ...state,
        ui: {
          ...state.ui,
          activeModal: action.payload.modal,
          selectedProductId: action.payload.productId ?? null,
        },
      };

    case 'CLOSE_MODAL':
      return {
        ...state,
        ui: { ...state.ui, activeModal: null, selectedProductId: null },
      };

    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        ui: { ...state.ui, sidebarOpen: !state.ui.sidebarOpen },
      };

    default:
      return state;
  }
};
