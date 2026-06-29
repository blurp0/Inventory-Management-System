/**
 * ProductTable.jsx
 * Table component for displaying products with actions
 */
import { Package, Edit, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { Badge } from '../../common/Badge/Badge';
import { Button } from '../../common/Button/Button';
import { formatCurrency, formatDate, getStockStatus } from '../../../utils/formatters';
import './ProductTable.css';

export const ProductTable = ({
  products,
  onEdit,
  onDelete,
  onStockIn,
  onStockOut,
}) => {
  if (products.length === 0) {
    return (
      <div className="product-table-empty">
        <Package size={48} />
        <h3>No products found</h3>
        <p>Add your first product to get started</p>
      </div>
    );
  }

  return (
    <div className="product-table-wrapper">
      <table className="product-table">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Product Name</th>
            <th>Category</th>
            <th>Stock</th>
            <th>Unit Price</th>
            <th>Stock Value</th>
            <th>Status</th>
            <th>Updated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const status = getStockStatus(product.currentStock, product.reorderLevel);
            const stockValue = product.currentStock * product.unitPrice;

            return (
              <tr key={product.id}>
                <td>
                  <code className="product-sku">{product.sku}</code>
                </td>
                <td>
                  <div className="product-name">
                    <strong>{product.name}</strong>
                    {product.description && (
                      <span className="product-description">
                        {product.description}
                      </span>
                    )}
                  </div>
                </td>
                <td>{product.category}</td>
                <td>
                  <strong>{product.currentStock}</strong> {product.unit}
                </td>
                <td>{formatCurrency(product.unitPrice)}</td>
                <td>
                  <strong>{formatCurrency(stockValue)}</strong>
                </td>
                <td>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </td>
                <td className="product-date">{formatDate(product.updatedAt)}</td>
                <td>
                  <div className="product-actions">
                    <Button
                      size="small"
                      variant="ghost"
                      icon={<TrendingUp size={16} />}
                      onClick={() => onStockIn(product.id)}
                      title="Stock In"
                    />
                    <Button
                      size="small"
                      variant="ghost"
                      icon={<TrendingDown size={16} />}
                      onClick={() => onStockOut(product.id)}
                      title="Stock Out"
                    />
                    <Button
                      size="small"
                      variant="ghost"
                      icon={<Edit size={16} />}
                      onClick={() => onEdit(product.id)}
                      title="Edit"
                    />
                    <Button
                      size="small"
                      variant="ghost"
                      icon={<Trash2 size={16} />}
                      onClick={() => onDelete(product.id)}
                      title="Delete"
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
