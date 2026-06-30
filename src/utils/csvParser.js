/**
 * csvParser.js
 * Utility to parse CSV files client-side.
 * Handles commas in quotes and maps columns to product model fields.
 */

export const parseCSV = (csvText) => {
  const lines = [];
  let currentLine = [];
  let currentField = '';
  let inQuotes = false;

  // Process character by character to handle quotes and newlines correctly (RFC 4180)
  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          // Escaped quote
          currentField += '"';
          i++; // skip next quote
        } else {
          // Closing quote
          inQuotes = false;
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentLine.push(currentField.trim());
        currentField = '';
      } else if (char === '\n' || char === '\r') {
        // Handle CRLF or LF
        currentLine.push(currentField.trim());
        if (currentLine.length > 1 || currentLine[0] !== '') {
          lines.push(currentLine);
        }
        currentLine = [];
        currentField = '';
        if (char === '\r' && nextChar === '\n') {
          i++; // skip next char if it's LF
        }
      } else {
        currentField += char;
      }
    }
  }

  // Push remaining field/line
  if (currentField || currentLine.length > 0) {
    currentLine.push(currentField.trim());
    lines.push(currentLine);
  }

  if (lines.length < 2) {
    return { success: false, error: 'CSV file is empty or lacks data rows.' };
  }

  const headers = lines[0].map(h => h.toLowerCase());
  const rows = lines.slice(1);

  // Dynamic header mapping
  const colIndex = {
    name:          headers.findIndex(h => h.includes('name')),
    sku:           headers.findIndex(h => h.includes('sku')),
    category:      headers.findIndex(h => h.includes('cat')),
    unitPrice:     headers.findIndex(h => h.includes('price') || h.includes('rate')),
    currentStock:  headers.findIndex(h => h.includes('stock') || h.includes('qty') || h.includes('quantity')),
    reorderLevel:  headers.findIndex(h => h.includes('reorder') || h.includes('alert')),
    unit:          headers.findIndex(h => h.includes('unit') && !h.includes('price')),
    supplier:      headers.findIndex(h => h.includes('supplier') || h.includes('vendor')),
    location:      headers.findIndex(h => h.includes('loc') || h.includes('shelf')),
    description:   headers.findIndex(h => h.includes('desc')),
  };

  // Name and Category are absolutely required
  if (colIndex.name === -1) {
    return { success: false, error: 'CSV missing required column "Name".' };
  }
  if (colIndex.category === -1) {
    return { success: false, error: 'CSV missing required column "Category".' };
  }

  const parsedProducts = [];
  const errors = [];

  rows.forEach((row, idx) => {
    // Skip empty lines
    if (row.length === 0 || (row.length === 1 && row[0] === '')) return;

    const lineNum = idx + 2; // header is line 1, rows start at 0 (line 2)
    const name = colIndex.name !== -1 ? row[colIndex.name] : '';
    const category = colIndex.category !== -1 ? row[colIndex.category] : '';

    if (!name) {
      errors.push(`Row ${lineNum}: Missing product Name.`);
      return;
    }
    if (!category) {
      errors.push(`Row ${lineNum}: Missing product Category.`);
      return;
    }

    const priceRaw = colIndex.unitPrice !== -1 ? row[colIndex.unitPrice] : '0';
    const unitPrice = parseFloat(priceRaw.replace(/[^0-9.]/g, ''));
    if (isNaN(unitPrice) || unitPrice < 0) {
      errors.push(`Row ${lineNum}: Invalid price "${priceRaw}".`);
      return;
    }

    const stockRaw = colIndex.currentStock !== -1 ? row[colIndex.currentStock] : '0';
    const currentStock = parseInt(stockRaw.replace(/[^0-9]/g, ''), 10);
    if (isNaN(currentStock) || currentStock < 0) {
      errors.push(`Row ${lineNum}: Invalid stock count "${stockRaw}".`);
      return;
    }

    const reorderRaw = colIndex.reorderLevel !== -1 ? row[colIndex.reorderLevel] : '10';
    const reorderLevel = parseInt(reorderRaw.replace(/[^0-9]/g, ''), 10);

    const product = {
      name:          name.trim(),
      sku:           colIndex.sku !== -1 ? row[colIndex.sku]?.trim() : '',
      category:      category.trim(),
      unitPrice:     unitPrice,
      currentStock:  currentStock,
      reorderLevel:  isNaN(reorderLevel) ? 10 : reorderLevel,
      unit:          colIndex.unit !== -1 ? row[colIndex.unit]?.trim() || 'pcs' : 'pcs',
      supplier:      colIndex.supplier !== -1 ? row[colIndex.supplier]?.trim() : '',
      location:      colIndex.location !== -1 ? row[colIndex.location]?.trim() : '',
      description:   colIndex.description !== -1 ? row[colIndex.description]?.trim() : '',
    };

    parsedProducts.push(product);
  });

  return {
    success: true,
    data: parsedProducts,
    errors: errors,
  };
};
