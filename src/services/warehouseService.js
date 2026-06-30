/**
 * warehouseService.js
 * Phase 3 — Supabase-backed Warehouse CRUD.
 * Supports multi-warehouse product placement.
 */
import { supabase } from '../lib/supabase';

const fromDB = (row) => ({
  id:          row.id,
  name:        row.name,
  location:    row.location ?? '',
  description: row.description ?? '',
  createdAt:   row.created_at,
});

export const warehouseService = {

  /** Fetch all warehouses */
  getAll: async () => {
    const { data, error } = await supabase
      .from('warehouses')
      .select('*')
      .order('name', { ascending: true });
    if (error) throw error;
    return data.map(fromDB);
  },

  /** Create a warehouse */
  create: async ({ name, location, description }) => {
    const { data, error } = await supabase
      .from('warehouses')
      .insert([{ name: name.trim(), location: location?.trim() ?? '', description: description?.trim() ?? '' }])
      .select()
      .single();
    if (error) throw error;
    return fromDB(data);
  },

  /** Update a warehouse */
  update: async (id, { name, location, description }) => {
    const { data, error } = await supabase
      .from('warehouses')
      .update({ name: name.trim(), location: location?.trim() ?? '', description: description?.trim() ?? '' })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return fromDB(data);
  },

  /** Delete a warehouse */
  delete: async (id) => {
    const { error } = await supabase
      .from('warehouses')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { success: true };
  },
};
