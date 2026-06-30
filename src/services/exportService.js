/**
 * exportService.js
 * Client-side PDF and CSV export logic using jsPDF, jsPDF-AutoTable, and Blob APIs.
 */
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency, formatNumber, formatDateTime, getStockStatus } from '../utils/formatters';

export const exportService = {
  /**
   * Export product catalog to PDF
   */
  exportProductsPDF: (products) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const currentDate = formatDateTime(new Date().toISOString());

    // 1. Header Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(15, 23, 42); // Slate 900
    doc.text('StockFlow IMS', 14, 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // Slate 500
    doc.text('Inventory Status Report', 14, 26);
    doc.text(`Generated: ${currentDate}`, pageWidth - 14, 26, { align: 'right' });

    // Decorative line
    doc.setDrawColor(226, 232, 240); // Slate 200
    doc.setLineWidth(0.5);
    doc.line(14, 30, pageWidth - 14, 30);

    // 2. Metrics Calculations
    const activeProducts = products.filter(p => !p.isDeleted);
    const totalValue = activeProducts.reduce((sum, p) => sum + (p.currentStock * p.unitPrice), 0);
    const outOfStock = activeProducts.filter(p => p.currentStock === 0).length;
    const lowStock = activeProducts.filter(p => p.currentStock > 0 && p.currentStock <= p.reorderLevel).length;

    // 3. Summary Cards
    const cardWidth = (pageWidth - 28 - 9) / 4; // 4 cards, 3 gaps of 3 units
    const cardY = 36;
    const cardHeight = 22;

    const drawCard = (x, title, value, color) => {
      // Draw background
      doc.setFillColor(248, 250, 252); // Slate 50
      doc.roundedRect(x, cardY, cardWidth, cardHeight, 2, 2, 'F');
      
      // Draw left border glow
      doc.setFillColor(color[0], color[1], color[2]);
      doc.rect(x, cardY, 2, cardHeight, 'F');

      // Card Title
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139); // Slate 500
      doc.text(title, x + 6, cardY + 7);

      // Card Value
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42); // Slate 900
      doc.text(value, x + 6, cardY + 16);
    };

    drawCard(14, 'Total Products', formatNumber(activeProducts.length), [99, 102, 241]); // Indigo
    drawCard(14 + cardWidth + 3, 'Total Valuation', formatCurrency(totalValue), [16, 185, 129]); // Emerald
    drawCard(14 + (cardWidth + 3) * 2, 'Low Stock Items', formatNumber(lowStock), [245, 158, 11]); // Amber
    drawCard(14 + (cardWidth + 3) * 3, 'Out of Stock', formatNumber(outOfStock), [239, 68, 68]); // Red

    // 4. Data Preparation for Table
    const tableColumns = [
      { header: 'SKU', dataKey: 'sku' },
      { header: 'Product Name', dataKey: 'name' },
      { header: 'Category', dataKey: 'category' },
      { header: 'Stock', dataKey: 'stock' },
      { header: 'Price', dataKey: 'price' },
      { header: 'Value', dataKey: 'value' },
      { header: 'Status', dataKey: 'status' }
    ];

    const tableRows = activeProducts.map(p => {
      const status = getStockStatus(p.currentStock, p.reorderLevel);
      return {
        sku: p.sku || 'N/A',
        name: p.name,
        category: p.category,
        stock: `${p.currentStock} ${p.unit || 'pcs'}`,
        price: formatCurrency(p.unitPrice),
        value: formatCurrency(p.currentStock * p.unitPrice),
        status: status.label
      };
    });

    // 5. Render Table
    autoTable(doc, {
      columns: tableColumns,
      body: tableRows,
      startY: 66,
      theme: 'striped',
      headStyles: {
        fillColor: [99, 102, 241], // Indigo 500
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 9
      },
      bodyStyles: {
        fontSize: 8.5,
        textColor: [51, 65, 85] // Slate 700
      },
      columnStyles: {
        sku: { cellWidth: 32, font: 'courier' },
        name: { cellWidth: 'auto' },
        category: { cellWidth: 28 },
        stock: { cellWidth: 20, halign: 'right' },
        price: { cellWidth: 26, halign: 'right' },
        value: { cellWidth: 28, halign: 'right' },
        status: { cellWidth: 24, halign: 'center' }
      },
      didDrawPage: (data) => {
        // Page number footer
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184); // Slate 400
        doc.text(
          `Page ${data.pageNumber} of ${doc.internal.getNumberOfPages()}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }
    });

    doc.save(`products_inventory_report_${new Date().toISOString().split('T')[0]}.pdf`);
  },

  /**
   * Export transaction log to PDF
   */
  exportTransactionsPDF: (transactions, products) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const currentDate = formatDateTime(new Date().toISOString());

    // 1. Header Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(15, 23, 42); // Slate 900
    doc.text('StockFlow IMS', 14, 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // Slate 500
    doc.text('Stock Movements Audit Report', 14, 26);
    doc.text(`Generated: ${currentDate}`, pageWidth - 14, 26, { align: 'right' });

    // Decorative line
    doc.setDrawColor(226, 232, 240); // Slate 200
    doc.setLineWidth(0.5);
    doc.line(14, 30, pageWidth - 14, 30);

    // 2. Metrics Calculations
    const totalTransactions = transactions.length;
    
    const stockInVolume = transactions
      .filter(t => t.type === 'STOCK_IN')
      .reduce((sum, t) => sum + t.quantity, 0);
    const stockOutVolume = transactions
      .filter(t => t.type === 'STOCK_OUT')
      .reduce((sum, t) => sum + t.quantity, 0);

    // 3. Summary Cards
    const cardWidth = (pageWidth - 28 - 9) / 4; // 4 cards
    const cardY = 36;
    const cardHeight = 22;

    const drawCard = (x, title, value, color) => {
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(x, cardY, cardWidth, cardHeight, 2, 2, 'F');
      
      doc.setFillColor(color[0], color[1], color[2]);
      doc.rect(x, cardY, 2, cardHeight, 'F');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(title, x + 6, cardY + 7);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text(value, x + 6, cardY + 16);
    };

    drawCard(14, 'Total Transactions', formatNumber(totalTransactions), [99, 102, 241]); // Indigo
    drawCard(14 + cardWidth + 3, 'Stock In Volume', `+${formatNumber(stockInVolume)} units`, [16, 185, 129]); // Emerald
    drawCard(14 + (cardWidth + 3) * 2, 'Stock Out Volume', `-${formatNumber(stockOutVolume)} units`, [239, 68, 68]); // Red
    drawCard(14 + (cardWidth + 3) * 3, 'Net Stock Delta', `${stockInVolume - stockOutVolume >= 0 ? '+' : ''}${formatNumber(stockInVolume - stockOutVolume)}`, [34, 211, 238]); // Cyan

    // 4. Table Mapping
    const tableColumns = [
      { header: 'Date & Time', dataKey: 'date' },
      { header: 'Product Name', dataKey: 'product' },
      { header: 'SKU', dataKey: 'sku' },
      { header: 'Type', dataKey: 'type' },
      { header: 'Qty', dataKey: 'qty' },
      { header: 'New Stock', dataKey: 'newStock' },
      { header: 'User', dataKey: 'user' },
      { header: 'Reason', dataKey: 'reason' }
    ];

    const tableRows = transactions.map(t => {
      const prod = products.find(p => p.id === t.productId);
      return {
        date: formatDateTime(t.createdAt),
        product: prod ? prod.name : 'Unknown Product',
        sku: prod ? prod.sku : 'N/A',
        type: t.type === 'STOCK_IN' ? 'STOCK IN' : 'STOCK OUT',
        qty: `${t.type === 'STOCK_IN' ? '+' : '-'}${t.quantity}`,
        newStock: t.newStock,
        user: t.performedBy || 'Admin',
        reason: t.reason
      };
    });

    // 5. Render Table
    autoTable(doc, {
      columns: tableColumns,
      body: tableRows,
      startY: 66,
      theme: 'striped',
      headStyles: {
        fillColor: [99, 102, 241],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 9
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [51, 65, 85]
      },
      columnStyles: {
        date: { cellWidth: 28 },
        product: { cellWidth: 32 },
        sku: { cellWidth: 26, font: 'courier' },
        type: { cellWidth: 20, halign: 'center' },
        qty: { cellWidth: 14, halign: 'right' },
        newStock: { cellWidth: 16, halign: 'right' },
        user: { cellWidth: 18 },
        reason: { cellWidth: 'auto' }
      },
      didDrawPage: (data) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `Page ${data.pageNumber} of ${doc.internal.getNumberOfPages()}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }
    });

    doc.save(`transactions_audit_report_${new Date().toISOString().split('T')[0]}.pdf`);
  },

  /**
   * Helper to escape CSV strings
   */
  escapeCSV: (val) => {
    if (val === null || val === undefined) return '';
    let stringVal = String(val);
    if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
      stringVal = '"' + stringVal.replace(/"/g, '""') + '"';
    }
    return stringVal;
  },

  /**
   * Export products to CSV
   */
  exportProductsCSV: (products) => {
    const activeProducts = products.filter(p => !p.isDeleted);
    
    // Headers
    const headers = ['SKU', 'Name', 'Category', 'Current Stock', 'Unit', 'Unit Price', 'Total Valuation', 'Supplier', 'Location', 'Reorder Level', 'Description', 'Updated At'];
    
    const rows = activeProducts.map(p => [
      p.sku || '',
      p.name,
      p.category,
      p.currentStock,
      p.unit || 'pcs',
      p.unitPrice,
      p.currentStock * p.unitPrice,
      p.supplier || '',
      p.location || '',
      p.reorderLevel,
      p.description || '',
      p.updatedAt
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => exportService.escapeCSV(cell)).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `products_inventory_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Export transactions to CSV
   */
  exportTransactionsCSV: (transactions, products) => {
    // Headers
    const headers = ['Date Time', 'Transaction ID', 'SKU', 'Product Name', 'Type', 'Quantity', 'Previous Stock', 'New Stock', 'Performed By', 'Reason'];

    const rows = transactions.map(t => {
      const prod = products.find(p => p.id === t.productId);
      return [
        t.createdAt,
        t.id,
        prod ? prod.sku : 'N/A',
        prod ? prod.name : 'Unknown Product',
        t.type,
        t.quantity,
        t.previousStock,
        t.newStock,
        t.performedBy || 'Admin',
        t.reason || ''
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => exportService.escapeCSV(cell)).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_log_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
