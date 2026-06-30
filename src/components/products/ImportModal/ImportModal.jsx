/**
 * ImportModal.jsx
 * Modal component for bulk CSV product import.
 */
import { useState, useRef } from 'react';
import { Upload, AlertCircle, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import { Modal } from '../../common/Modal/Modal';
import { Button } from '../../common/Button/Button';
import { parseCSV } from '../../../utils/csvParser';
import { useProducts } from '../../../hooks/useProducts';
import { useInventory } from '../../../contexts/InventoryContext';
import toast from 'react-hot-toast';
import './ImportModal.css';

export const ImportModal = ({ isOpen, onClose }) => {
  const { addProduct } = useProducts();
  const { fetchProducts } = useInventory();
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [parseErrors, setParseErrors] = useState([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleReset = () => {
    setFile(null);
    setParsedData([]);
    setParseErrors([]);
    setImportProgress(0);
    setIsImporting(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;
    if (!selectedFile.name.endsWith('.csv')) {
      toast.error('Only CSV files are supported.');
      return;
    }

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const parsed = parseCSV(text);
      if (parsed.success) {
        setParsedData(parsed.data);
        setParseErrors(parsed.errors || []);
        if (parsed.data.length === 0) {
          toast.error('No valid rows found in the CSV file.');
        } else {
          toast.success(`Successfully parsed ${parsed.data.length} products!`);
        }
      } else {
        toast.error(parsed.error || 'Failed to parse CSV file.');
        handleReset();
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    handleFile(droppedFile);
  };

  const handleConfirmImport = async () => {
    if (parsedData.length === 0) return;
    setIsImporting(true);
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < parsedData.length; i++) {
      const product = parsedData[i];
      try {
        const result = await addProduct(product);
        if (result.success) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (err) {
        failCount++;
      }
      setImportProgress(Math.round(((i + 1) / parsedData.length) * 100));
    }

    setIsImporting(false);
    if (successCount > 0) {
      toast.success(`Import complete! Successfully added ${successCount} products.`);
      // Force reload list
      if (fetchProducts) await fetchProducts();
    }
    if (failCount > 0) {
      toast.error(`Failed to import ${failCount} products. Check for duplicate SKUs.`);
    }

    handleReset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={isImporting ? () => {} : onClose}
      title="Bulk Import Products"
      size="large"
    >
      <div className="import-modal">
        {!file ? (
          <div
            className="import-modal__dropzone"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={48} className="import-modal__upload-icon" />
            <h3>Drag & Drop your CSV file here</h3>
            <p>or click to browse from your computer</p>
            <span className="import-modal__format-info">Expected columns: Name, SKU, Category, Price, Stock, Reorder Level, Unit, Supplier, Location, Description</span>
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv"
              onChange={(e) => handleFile(e.target.files[0])}
              style={{ display: 'none' }}
            />
          </div>
        ) : (
          <div className="import-modal__details">
            <div className="import-modal__file-info">
              <FileText size={24} className="import-modal__file-icon" />
              <div className="import-modal__file-meta">
                <strong>{file.name}</strong>
                <span>{(file.size / 1024).toFixed(1)} KB</span>
              </div>
              <Button size="small" variant="secondary" onClick={handleReset} disabled={isImporting}>
                Change File
              </Button>
            </div>

            {parseErrors.length > 0 && (
              <div className="import-modal__warnings">
                <h4>
                  <AlertCircle size={16} /> Warnings ({parseErrors.length})
                </h4>
                <ul>
                  {parseErrors.map((err, index) => (
                    <li key={index}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {parsedData.length > 0 && (
              <div className="import-modal__preview">
                <h4>Products Preview ({parsedData.length})</h4>
                <div className="import-modal__table-wrapper">
                  <table className="import-modal__table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>SKU</th>
                        <th>Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedData.slice(0, 10).map((prod, index) => (
                        <tr key={index}>
                          <td>{prod.name}</td>
                          <td>{prod.category}</td>
                          <td>₱{prod.unitPrice.toFixed(2)}</td>
                          <td>{prod.currentStock} {prod.unit}</td>
                          <td><code>{prod.sku || 'Auto'}</code></td>
                          <td>{prod.location || '—'}</td>
                        </tr>
                      ))}
                      {parsedData.length > 10 && (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
                            Showing first 10 items. +{parsedData.length - 10} more rows...
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {isImporting && (
              <div className="import-modal__progress-container">
                <div className="import-modal__progress-bar">
                  <div className="import-modal__progress-fill" style={{ width: `${importProgress}%` }} />
                </div>
                <div className="import-modal__progress-text">
                  <Loader2 size={16} className="spin" />
                  Importing products... {importProgress}%
                </div>
              </div>
            )}

            <div className="import-modal__actions">
              <Button variant="secondary" onClick={handleReset} disabled={isImporting}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmImport}
                disabled={parsedData.length === 0 || isImporting}
                loading={isImporting}
                icon={<CheckCircle2 size={18} />}
              >
                Confirm Import ({parsedData.length} items)
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
