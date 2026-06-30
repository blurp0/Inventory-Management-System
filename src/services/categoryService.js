/**
 * categoryService.js
 * Supabase-backed category management.
 */
import { supabase } from '../lib/supabase';

export const categoryService = {

  /** Fetch all category names */
  getAll: async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('name')
      .order('name', { ascending: true });

    if (error) throw error;
    return data.map((c) => c.name);
  },

  /** Add a new category (no-op if already exists) */
  add: async (name) => {
    const { error } = await supabase
      .from('categories')
      .upsert([{ name: name.trim() }], { onConflict: 'name', ignoreDuplicates: true });

    if (error) throw error;
    return { success: true };
  },
};
