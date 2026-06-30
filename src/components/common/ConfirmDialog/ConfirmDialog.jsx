/**
 * ConfirmDialog.jsx
 * Reusable confirmation dialog component
 */
import { AlertTriangle } from 'lucide-react';
import { Modal } from '../Modal/Modal';
import { Button } from '../Button/Button';
import './ConfirmDialog.css';

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger', // 'danger', 'warning', 'primary'
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="small"
      showCloseButton={false}
    >
      <div className="confirm-dialog">
        <div className={`confirm-dialog__icon confirm-dialog__icon--${variant}`}>
          <AlertTriangle size={48} />
        </div>
        
        <p className="confirm-dialog__message">{message}</p>
        
        <div className="confirm-dialog__actions">
          <Button
            variant="secondary"
            onClick={onClose}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant}
            onClick={handleConfirm}
            fullWidth
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
