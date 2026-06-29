/**
 * stockService.js
 * Business logic for stock transactions (Stock In/Out)
 */

export const stockService = {
  /**
   * Validate stock transaction
   */
  validateStockTransaction: (product, quantity, type) => {
    const errors = {};

    if (!quantity || parseInt(quantity) <= 0) {
      errors.quantity = 'Quantity must be greater than 0';
    }

    if (type === 'STOCK_OUT') {
      const qty = parseInt(quantity) || 0;
      if (qty > product.currentStock) {
        errors.quantity = `Cannot remove ${qty} units. Only ${product.currentStock} available.`;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },

  /**
   * Create stock in transaction data
   */
  createStockInData: (productId, quantity, reason, performedBy = 'Admin') => {
    return {
      productId,
      quantity: parseInt(quantity),
      reason: reason?.trim() || 'Stock Replenishment',
      performedBy,
    };
  },

  /**
   * Create stock out transaction data
   */
  createStockOutData: (productId, quantity, reason, performedBy = 'Admin') => {
    return {
      productId,
      quantity: parseInt(quantity),
      reason: reason?.trim() || 'Stock Withdrawal',
      performedBy,
    };
  },

  /**
   * Get transactions for a specific product
   */
  getProductTransactions: (transactions, productId) => {
    return transactions.filter((t) => t.productId === productId);
  },

  /**
   * Get recent transactions (limited)
   */
  getRecentTransactions: (transactions, limit = 10) => {
    return transactions.slice(0, limit);
  },

  /**
   * Calculate total stock movements
   */
  calculateStockMovements: (transactions) => {
    return transactions.reduce(
      (acc, t) => {
        if (t.type === 'STOCK_IN') {
          acc.totalIn += t.quantity;
        } else {
          acc.totalOut += t.quantity;
        }
        acc.netMovement = acc.totalIn - acc.totalOut;
        return acc;
      },
      { totalIn: 0, totalOut: 0, netMovement: 0 }
    );
  },
};
