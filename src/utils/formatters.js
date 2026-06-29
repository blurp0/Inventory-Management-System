/**
 * formatters.js
 * Utility functions for formatting currency, dates, numbers, and file sizes.
 */
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

/** Format Philippine Peso (₱) */
export const formatCurrency = (value) =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(value ?? 0);

/** Format a number with locale-aware commas */
export const formatNumber = (value) =>
  new Intl.NumberFormat('en-PH').format(value ?? 0);

/** Format a date as "Jun 29, 2026" */
export const formatDate = (isoString) =>
  dayjs(isoString).format('MMM DD, YYYY');

/** Format a date as "Jun 29, 2026 · 3:45 PM" */
export const formatDateTime = (isoString) =>
  dayjs(isoString).format('MMM DD, YYYY · h:mm A');

/** Relative time: "2 hours ago" */
export const formatRelative = (isoString) =>
  dayjs(isoString).fromNow();

/** Get a stock status label and variant */
export const getStockStatus = (currentStock, reorderLevel) => {
  if (currentStock === 0) return { label: 'Out of Stock', variant: 'danger' };
  if (currentStock <= reorderLevel) return { label: 'Low Stock', variant: 'warning' };
  return { label: 'In Stock', variant: 'success' };
};

/** Generate a UUID v4 */
export const generateId = () =>
  ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
  );
