/**
 * SearchBar.jsx
 * Search input with debounce functionality
 */
import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import './SearchBar.css';

export const SearchBar = ({
  value,
  onChange,
  placeholder = 'Search...',
  debounce = 300,
}) => {
  const [localValue, setLocalValue] = useState(value || '');

  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue);
    }, debounce);

    return () => clearTimeout(timer);
  }, [localValue, debounce, onChange]);

  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  return (
    <div className="search-bar">
      <Search className="search-bar__icon" size={18} />
      <input
        type="text"
        className="search-bar__input"
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
      />
      {localValue && (
        <button
          className="search-bar__clear"
          onClick={handleClear}
          aria-label="Clear search"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};
