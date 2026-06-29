/**
 * storageService.js
 * Abstraction layer over localStorage with schema versioning.
 */

const STORAGE_KEY = 'stockflow_ims';
const SCHEMA_VERSION = 1;

export const saveState = (state) => {
  try {
    const payload = JSON.stringify({ _version: SCHEMA_VERSION, ...state });
    localStorage.setItem(STORAGE_KEY, payload);
  } catch (err) {
    console.warn('[StorageService] Failed to save state:', err);
  }
};

export const loadState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed._version !== SCHEMA_VERSION) {
      console.warn('[StorageService] Schema version mismatch — resetting state.');
      return null;
    }
    return parsed;
  } catch (err) {
    console.warn('[StorageService] Failed to load state:', err);
    return null;
  }
};

export const clearState = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('[StorageService] Failed to clear state:', err);
  }
};
