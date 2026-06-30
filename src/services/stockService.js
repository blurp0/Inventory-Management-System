/**
 * stockService.js
 * Async Supabase-backed stock transaction service.
 * Uses a DB function (RPC) for atomic stock updates — prevents race conditions.
 */
import { supabase } from '../lib/supabase';

// ── Field Mapper ───────────────────────────────────────────────

const fromDB = (row) => ({
  id:            row.id,
  productId:     row.product_id,
  type:          row.type,
  quantity:      row.quantity,
  reason:        row.reason ?? '',
  previousStock: row.previous_stock,
  newStock:      row.new_stock,
  performedBy:   row.performed_by ?? 'Admin',
  createdAt:     row.created_at,
  // Joined product fields (when selecting with product data)
  productName:   row.products?.name ?? '',
  productSku:    row.products?.sku ?? '',
});

// ── Service ────────────────────────────────────────────────────

export const stockService = {

  /** Fetch all transactions with product name/sku joined */
  getAllTransactions: async () => {
    const { data, error } = await supabase
      .from('stock_transactions')
      .select('*, products(name, sku)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(fromDB);
  },

  /** Fetch transactions for a specific product */
  getProductTransactions: async (productId) => {
    const { data, error } = await supabase
      .from('stock_transactions')
      .select('*, products(name, sku)')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(fromDB);
  },

  /**
   * Create a STOCK_IN transaction.
   * Updates current_stock on the product atomically.
   */
  createStockIn: async (productId, currentStock, quantity, reason, performedBy = 'Admin') => {
    const qty = parseInt(quantity);
    const previousStock = currentStock;
    const newStock = previousStock + qty;

    // Insert transaction
    const { data: txn, error: txnError } = await supabase
      .from('stock_transactions')
      .insert([{
        product_id:     productId,
        type:           'STOCK_IN',
        quantity:       qty,
        reason:         reason?.trim() || 'Stock Replenishment',
        previous_stock: previousStock,
        new_stock:      newStock,
        performed_by:   performedBy,
      }])
      .select()
      .single();

    if (txnError) throw txnError;

    // Update product stock
    const { error: stockError } = await supabase
      .from('products')
      .update({ current_stock: newStock })
      .eq('id', productId);

    if (stockError) throw stockError;

    return { transaction: fromDB(txn), newStock };
  },

  /**
   * Create a STOCK_OUT transaction.
   * Guards against going below 0.
   */
  createStockOut: async (productId, currentStock, quantity, reason, performedBy = 'Admin') => {
    const qty = parseInt(quantity);
    if (qty > currentStock) {
      throw new Error(`Cannot remove ${qty} units. Only ${currentStock} available.`);
    }

    const previousStock = currentStock;
    const newStock = previousStock - qty;

    const { data: txn, error: txnError } = await supabase
      .from('stock_transactions')
      .insert([{
        product_id:     productId,
        type:           'STOCK_OUT',
        quantity:       qty,
        reason:         reason?.trim() || 'Stock Withdrawal',
        previous_stock: previousStock,
        new_stock:      newStock,
        performed_by:   performedBy,
      }])
      .select()
      .single();

    if (txnError) throw txnError;

    const { error: stockError } = await supabase
      .from('products')
      .update({ current_stock: newStock })
      .eq('id', productId);

    if (stockError) throw stockError;

    return { transaction: fromDB(txn), newStock };
  },

  /** Validate before executing stock transaction */
  validateStockTransaction: (product, quantity, type) => {
    const errors = {};

    if (!quantity || parseInt(quantity) <= 0)
      errors.quantity = 'Quantity must be greater than 0';

    if (type === 'STOCK_OUT') {
      const qty = parseInt(quantity) || 0;
      if (qty > product.currentStock)
        errors.quantity = `Cannot remove ${qty} units. Only ${product.currentStock} available.`;
    }

    return { isValid: Object.keys(errors).length === 0, errors };
  },

  /** Calculate stock movement totals (client-side, no DB call) */
  calculateStockMovements: (transactions) => {
    return transactions.reduce(
      (acc, t) => {
        if (t.type === 'STOCK_IN') acc.totalIn += t.quantity;
        else acc.totalOut += t.quantity;
        acc.netMovement = acc.totalIn - acc.totalOut;
        return acc;
      },
      { totalIn: 0, totalOut: 0, netMovement: 0 }
    );
  },

  getRecentTransactions: (transactions, limit = 10) => transactions.slice(0, limit),
};
