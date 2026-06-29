/**
 * skuGenerator.js
 * Generates unique SKU codes in the format: SKU-YYYY-NNNN
 */

export const generateSKU = (existingProducts = []) => {
  const year = new Date().getFullYear();
  const existingNumbers = existingProducts
    .map((p) => {
      const match = p.sku?.match(/^SKU-\d{4}-(\d{4})$/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter(Boolean);

  const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
  return `SKU-${year}-${String(nextNumber).padStart(4, '0')}`;
};
