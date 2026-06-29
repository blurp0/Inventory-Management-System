/**
 * StockModal.jsx
 * Modal for stock in/out transactions
 */
import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Package } from 'lucide-react';
import { Modal } from '../../common/Modal/Modal';
import { Input, Textarea } from '../../common/Input/Input';
import { Button } from '../../common/Button/Button';
import { Badge } from '../../common/Badge/Badge';
import { useStock } from '../../../hooks/useStock';
import { useProducts } from '../../../hooks/useProducts';
import { formatCurrency, getStockStatus } from '../../../utils/formatters';
import './StockModal.css';

export const StockModal = ({ isOpen, onClose, productId, type }) => {
  const { stockIn, stockOut } = useStock();
  const { getProductById } = useProducts();
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const product = productId ? getProductById(productId) : null;
  const isStockIn = type === 'in';

  useEffect(() => {
    if (isOpen) {
      setQuantity('');
      setReason('');
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const result = isStockIn
      ? stockIn(productId, quantity, reason)
      : stockOut(productId, quantity, reason);

    setIsSubmitting(false);

    if (result.success) {
      onClose();
    }
  };

  if (!product) return null;

  const status = getStockStatus(product.currentStock, product.reorderLevel);
  const projectedStock = isStockIn
    ? product.currentStock + (parseInt(quantity) || 0)
    : product.currentStock - (parseInt(quantity) || 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isStockIn ? 'Stock In' : 'Stock Out'}
      size="medium"
    >
      <form onSubmit={handleSubmit} className="stock-modal">
        <div className="stock-modal__product">
          <div className="stock-modal__product-icon">
            <Package size={24} />
          </div>
          <div className="stock-modal__product-info">
            <h3>{product.name}</h3>
            <p>
              <code>{product.sku}</code> · {product.category}
            </p>
          </div>
        </div>

        <div className="stock-modal__current">
          <div className="stock-modal__stat">
            <span className="stock-modal__stat-label">Current Stock</span>
            <div className="stock-modal__stat-value">
              {product.currentStock} {product.unit}
            </div>
          </div>
          <div className="stock-modal__stat">
            <span className="stock-modal__stat-label">Status</span>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
          <div className="stock-modal__stat">
            <span className="stock-modal__stat-label">Stock Value</span>
            <div className="stock-modal__stat-value">
              {formatCurrency(product.currentStock * product.unitPrice)}
            </div>
          </div>
        </div>

        <Input
          label={`Quantity to ${isStockIn ? 'Add' : 'Remove'}`}
          type="number"
          min="1"
          max={isStockIn ? undefined : product.currentStock}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Enter quantity"
          required
          icon={isStockIn ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
        />

        {quantity && (
          <div className="stock-modal__projection">
            <span>Projected Stock:</span>
            <strong>
              {projectedStock} {product.unit}
            </strong>
            {projectedStock < 0 && (
              <span className="stock-modal__error">
                Cannot remove more than available stock
              </span>
            )}
          </div>
        )}

        <Textarea
          label="Reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={
            isStockIn
              ? 'e.g., Purchase Order #123, Restocking'
              : 'e.g., Sale, Damaged, Return'
          }
          rows={3}
        />

        <div className="stock-modal__actions">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant={isStockIn ? 'success' : 'danger'}
            loading={isSubmitting}
            icon={isStockIn ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
          >
            {isStockIn ? 'Add Stock' : 'Remove Stock'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
