/**
 * CategoryModal.jsx
 * Modal for adding new categories
 */
import { useState } from 'react';
import { FolderPlus } from 'lucide-react';
import { Modal } from '../Modal/Modal';
import { Input } from '../Input/Input';
import { Button } from '../Button/Button';
import './CategoryModal.css';

export const CategoryModal = ({ isOpen, onClose, onAdd, existingCategories = [] }) => {
  const [categoryName, setCategoryName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const trimmedName = categoryName.trim();

    // Validation
    if (!trimmedName) {
      setError('Category name is required');
      return;
    }

    if (trimmedName.length < 2) {
      setError('Category name must be at least 2 characters');
      return;
    }

    if (trimmedName.length > 50) {
      setError('Category name must be less than 50 characters');
      return;
    }

    // Check for duplicates (case-insensitive)
    const isDuplicate = existingCategories.some(
      (cat) => cat.toLowerCase() === trimmedName.toLowerCase()
    );

    if (isDuplicate) {
      setError('This category already exists');
      return;
    }

    setIsSubmitting(true);
    onAdd(trimmedName);
    setIsSubmitting(false);
    setCategoryName('');
    onClose();
  };

  const handleClose = () => {
    setCategoryName('');
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New Category"
      size="small"
    >
      <form onSubmit={handleSubmit} className="category-modal">
        <div className="category-modal__icon">
          <FolderPlus size={48} />
        </div>

        <Input
          label="Category Name"
          value={categoryName}
          onChange={(e) => {
            setCategoryName(e.target.value);
            setError('');
          }}
          error={error}
          placeholder="e.g., Electronics, Office Supplies"
          required
          autoFocus
        />

        <div className="category-modal__existing">
          <p className="category-modal__existing-label">Existing Categories:</p>
          <div className="category-modal__tags">
            {existingCategories.length > 0 ? (
              existingCategories.map((cat) => (
                <span key={cat} className="category-modal__tag">
                  {cat}
                </span>
              ))
            ) : (
              <span className="category-modal__empty">No categories yet</span>
            )}
          </div>
        </div>

        <div className="category-modal__actions">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            icon={<FolderPlus size={18} />}
          >
            Add Category
          </Button>
        </div>
      </form>
    </Modal>
  );
};
