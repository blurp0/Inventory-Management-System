/**
 * inventoryReducer.js
 * UI-only reducer — all data mutations now happen in Supabase services.
 * This reducer only manages: filters, modals, sidebar, and local product cache.
 */

export const initialState = {
  // Server data cache (populated by InventoryContext on load)
  products: [],
  transactions: [],
  categories: [],

  // Loading/error states
  loading: {
    products: false,
    transactions: false,
    categories: false,
  },
  error: null,

  // Client-side filter state (never persisted to DB)
  filters: {
    search: '',
    category: 'all',
    status: 'all',
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  },

  // UI state
  ui: {
    activeModal: null,
    selectedProductId: null,
    sidebarOpen: true,
  },
};

export const inventoryReducer = (state, action) => {
  switch (action.type) {

    // ── Cache updates (triggered after successful DB writes) ───

    case 'SET_PRODUCTS':
      return { ...state, products: action.payload, loading: { ...state.loading, products: false } };

    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload, loading: { ...state.loading, transactions: false } };

    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload, loading: { ...state.loading, categories: false } };

    case 'ADD_PRODUCT_CACHE':
      return { ...state, products: [action.payload, ...state.products] };

    case 'UPDATE_PRODUCT_CACHE':
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === action.payload.id ? { ...p, ...action.payload } : p
        ),
      };

    case 'REMOVE_PRODUCT_CACHE':
      return {
        ...state,
        products: state.products.filter((p) => p.id !== action.payload),
      };

    case 'ADD_TRANSACTION_CACHE':
      return { ...state, transactions: [action.payload, ...state.transactions] };

    case 'REMOVE_TRANSACTION_CACHE':
      return {
        ...state,
        transactions: state.transactions.filter((t) => t.id !== action.payload),
      };

    case 'ADD_CATEGORY_CACHE':
      return {
        ...state,
        categories: state.categories.includes(action.payload)
          ? state.categories
          : [...state.categories, action.payload].sort(),
      };

    // ── Loading / Error ────────────────────────────────────────

    case 'SET_LOADING':
      return { ...state, loading: { ...state.loading, ...action.payload } };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'CLEAR_ERROR':
      return { ...state, error: null };

    // ── Filters ────────────────────────────────────────────────

    case 'SET_SEARCH':
      return { ...state, filters: { ...state.filters, search: action.payload } };

    case 'SET_FILTER':
      return { ...state, filters: { ...state.filters, ...action.payload } };

    case 'RESET_FILTERS':
      return { ...state, filters: { ...initialState.filters } };

    // ── UI ─────────────────────────────────────────────────────

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
      return { ...state, ui: { ...state.ui, activeModal: null, selectedProductId: null } };

    case 'TOGGLE_SIDEBAR':
      return { ...state, ui: { ...state.ui, sidebarOpen: !state.ui.sidebarOpen } };

    default:
      return state;
  }
};
