/**
 * storageService.js
 * Supabase Storage — product image upload/delete.
 * Replaces the old localStorage version.
 */
import { supabase } from '../lib/supabase';

const BUCKET = 'product-images';

export const storageService = {

  /**
   * Upload a product image file.
   * Returns the public URL string.
   */
  uploadProductImage: async (file, productId) => {
    // Sanitise filename: use productId + original extension
    const ext = file.name.split('.').pop();
    const path = `${productId}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  },

  /**
   * Delete a product image from storage.
   */
  deleteProductImage: async (productId) => {
    // Try both jpg and png extensions
    const paths = [`${productId}.jpg`, `${productId}.png`, `${productId}.jpeg`, `${productId}.webp`];
    await supabase.storage.from(BUCKET).remove(paths);
  },

  /**
   * Get the public URL for a product image.
   */
  getPublicUrl: (path) => {
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  },
};
