/**
 * productService.js
 * Async Supabase-backed product CRUD — replaces localStorage mutations.
 * Field mapping: JS camelCase ↔ DB snake_case
 */
import { supabase } from '../lib/supabase';
import { generateSKUFromDB } from '../utils/skuGenerator';

// ── Field Mappers ──────────────────────────────────────────────

/** DB row (snake_case) → JS object (camelCase) */
const fromDB = (row) => ({
  id:            row.id,
  sku:           row.sku,
  name:          row.name,
  description:   row.description ?? '',
  category:      row.category,
  imageUrl:      row.image_url ?? '',
  unitPrice:     parseFloat(row.unit_price) ?? 0,
  currentStock:  row.current_stock ?? 0,
  reorderLevel:  row.reorder_level ?? 10,
  unit:          row.unit ?? 'pcs',
  supplier:      row.supplier ?? '',
  location:      row.location ?? '',
  warehouseId:   row.warehouse_id ?? null,
  isDeleted:     row.is_deleted ?? false,
  createdAt:     row.created_at,
  updatedAt:     row.updated_at,
});

/** JS object (camelCase) → DB row (snake_case) */
const toDB = (data) => ({
  sku:           data.sku,
  name:          data.name?.trim(),
  description:   data.description?.trim() ?? '',
  category:      data.category?.trim(),
  image_url:     data.imageUrl ?? '',
  unit_price:    parseFloat(data.unitPrice) ?? 0,
  current_stock: parseInt(data.currentStock) ?? 0,
  reorder_level: parseInt(data.reorderLevel) ?? 10,
  unit:          data.unit?.trim() ?? 'pcs',
  supplier:      data.supplier?.trim() ?? '',
  location:      data.location?.trim() ?? '',
  warehouse_id:  data.warehouseId ?? null,
});

// ── Service ────────────────────────────────────────────────────

export const productService = {

  /** Fetch all non-deleted products */
  getAllProducts: async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(fromDB);
  },

  /** Fetch single product by ID */
  getProductById: async (id) => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return fromDB(data);
  },

  /** Create a new product */
  createProduct: async (formData) => {
    // Generate SKU from DB so soft-deleted SKUs are never recycled
    const sku = formData.sku?.trim() || await generateSKUFromDB();

    const payload = toDB({ ...formData, sku });

    const { data, error } = await supabase
      .from('products')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;

    // Auto-register category
    await supabase
      .from('categories')
      .upsert([{ name: formData.category.trim() }], { onConflict: 'name', ignoreDuplicates: true });

    return fromDB(data);
  },

  /** Update an existing product (metadata only — stock via transactions) */
  updateProduct: async (id, formData) => {
    const payload = {
      name:          formData.name?.trim(),
      description:   formData.description?.trim() ?? '',
      category:      formData.category?.trim(),
      image_url:     formData.imageUrl ?? '',
      unit_price:    parseFloat(formData.unitPrice) ?? 0,
      reorder_level: parseInt(formData.reorderLevel) ?? 10,
      unit:          formData.unit?.trim() ?? 'pcs',
      supplier:      formData.supplier?.trim() ?? '',
      location:      formData.location?.trim() ?? '',
      warehouse_id:  formData.warehouseId ?? null,
    };

    const { data, error } = await supabase
      .from('products')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Keep category table in sync
    await supabase
      .from('categories')
      .upsert([{ name: formData.category.trim() }], { onConflict: 'name', ignoreDuplicates: true });

    return fromDB(data);
  },

  /** Soft-delete a product */
  deleteProduct: async (id) => {
    const { error } = await supabase
      .from('products')
      .update({ is_deleted: true })
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  },

  /** Restore a soft-deleted product */
  restoreProduct: async (id) => {
    const { error } = await supabase
      .from('products')
      .update({ is_deleted: false })
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  },

  // ── Validation (kept client-side — no DB round-trip needed) ──

  validateProduct: (data) => {
    const errors = {};

    if (!data.name?.trim())
      errors.name = 'Product name is required';

    if (!data.category?.trim())
      errors.category = 'Category is required';

    if (!data.unitPrice || parseFloat(data.unitPrice) < 0)
      errors.unitPrice = 'Unit price must be a positive number';

    if (data.reorderLevel !== undefined && parseInt(data.reorderLevel) < 0)
      errors.reorderLevel = 'Reorder level cannot be negative';

    if (data.currentStock !== undefined && parseInt(data.currentStock) < 0)
      errors.currentStock = 'Stock quantity cannot be negative';

    return { isValid: Object.keys(errors).length === 0, errors };
  },

  // ── Search / Filter helpers (kept client-side for speed) ─────

  searchProducts: (products, query) => {
    if (!query) return products;
    const q = query.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
    );
  },

  filterByCategory: (products, category) => {
    if (category === 'all') return products;
    return products.filter((p) => p.category === category);
  },

  filterByStatus: (products, status) => {
    if (status === 'all') return products;
    return products.filter((p) => {
      if (status === 'out_of_stock') return p.currentStock === 0;
      if (status === 'low_stock')    return p.currentStock > 0 && p.currentStock <= p.reorderLevel;
      if (status === 'in_stock')     return p.currentStock > p.reorderLevel;
      return true;
    });
  },

  sortProducts: (products, sortBy, sortOrder = 'asc') => {
    return [...products].sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  },
};
