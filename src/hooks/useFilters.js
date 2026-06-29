/**
 * useFilters.js
 * Custom hook for search, filter, and sort operations
 */
import { useInventory } from '../contexts/InventoryContext';

export const useFilters = () => {
  const { state, dispatch } = useInventory();

  const setSearch = (query) => {
    dispatch({ type: 'SET_SEARCH', payload: query });
  };

  const setCategory = (category) => {
    dispatch({ type: 'SET_FILTER', payload: { category } });
  };

  const setStatus = (status) => {
    dispatch({ type: 'SET_FILTER', payload: { status } });
  };

  const setSortBy = (sortBy) => {
    dispatch({ type: 'SET_FILTER', payload: { sortBy } });
  };

  const setSortOrder = (sortOrder) => {
    dispatch({ type: 'SET_FILTER', payload: { sortOrder } });
  };

  const setFilter = (filters) => {
    dispatch({ type: 'SET_FILTER', payload: filters });
  };

  const resetFilters = () => {
    dispatch({ type: 'RESET_FILTERS' });
  };

  return {
    filters: state.filters,
    setSearch,
    setCategory,
    setStatus,
    setSortBy,
    setSortOrder,
    setFilter,
    resetFilters,
  };
};
