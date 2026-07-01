/**
 * deletedProductService.js
 * Service for managing deleted/archived products.
 * Uses Supabase RPC functions for secure operations.
 */
import { supabase } from '../lib/supabase';

const fromDB = (row) => ({
    archiveId: row.archive_id,
    productId: row.product_id,
    sku: row.sku,
    name: row.name,
    category: row.category,
    unitPrice: parseFloat(row.unit_price) ?? 0,
    currentStock: row.current_stock ?? 0,
    supplier: row.supplier ?? '',
    deletedBy: row.deleted_by,
    deletedAt: row.deleted_at,
    originalCreatedAt: row.original_created_at,
    transactionCount: parseInt(row.transaction_count) ?? 0,
    transactions: row.transactions || [],
});

export const deletedProductService = {

    /** Fetch all deleted products (admin only) */
    getDeletedProducts: async () => {
        const { data, error } = await supabase.rpc('get_deleted_products');
        if (error) throw error;
        return (data || []).map(fromDB);
    },

    /** Restore a deleted product by its original product ID */
    restoreProduct: async (productId) => {
        const { data, error } = await supabase.rpc('restore_deleted_product', {
            p_product_id: productId,
        });
        if (error) throw error;
        return { success: data };
    },

    /** Get transactions for a specific archived product */
    getArchivedTransactions: async (productId) => {
        const { data, error } = await supabase.rpc('get_archived_transactions', {
            p_product_id: productId,
        });
        if (error) throw error;
        return data || [];
    },
};
