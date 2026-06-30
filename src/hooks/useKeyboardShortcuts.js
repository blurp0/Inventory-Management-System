/**
 * useKeyboardShortcuts.js
 * Custom hook for managing global keyboard shortcuts.
 */
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useKeyboardShortcuts = () => {
  const location = useLocation();

  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.tagName === 'SELECT' ||
          activeEl.isContentEditable);

      // If user is actively typing in a form or input, ignore shortcuts
      if (isInput) {
        if (e.key === 'Escape') {
          activeEl.blur();
        }
        return;
      }

      // 1. Focus Search Bar: Slash (/)
      if (e.key === '/') {
        const searchInput = document.querySelector('.search-bar__input');
        if (searchInput) {
          e.preventDefault();
          searchInput.focus();
          searchInput.select();
        }
      }

      // 2. Add New Product: "n" or "N" (only on the Products page)
      if ((e.key === 'n' || e.key === 'N') && location.pathname === '/products') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('shortcut-add-product'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [location.pathname]);
};
