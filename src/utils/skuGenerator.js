/**
 * skuGenerator.js
 * Generates a unique SKU in the format: SKU-YYYY-NNNN
 *
 * Queries the DB directly (including soft-deleted rows) so a deleted
 * product's SKU is never recycled, preventing unique-constraint violations.
 */
import { supabase } from '../lib/supabase';

/**
 * Async version — used by productService.createProduct.
 * Fetches the highest SKU sequence number from ALL products (including
 * is_deleted = true) then increments by 1.
 */
export const generateSKUFromDB = async () => {
  const year = new Date().getFullYear();
  const pattern = `SKU-${year}-%`;

  const { data } = await supabase
    .from('products')
    .select('sku')
    .like('sku', pattern)
    // no is_deleted filter — deliberately includes deleted rows
    .order('sku', { ascending: false })
    .limit(1);

  if (data && data.length > 0) {
    const match = data[0].sku?.match(/^SKU-\d{4}-(\d{4})$/);
    const lastNum = match ? parseInt(match[1], 10) : 0;
    return `SKU-${year}-${String(lastNum + 1).padStart(4, '0')}`;
  }

  return `SKU-${year}-0001`;
};

/**
 * Sync fallback — kept for any legacy callers that pass existingProducts.
 * Should not be used for new product creation.
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
