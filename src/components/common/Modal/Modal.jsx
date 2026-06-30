/**
 * Modal.jsx
 * Reusable modal dialog component
 */
import { useEffect } from 'react';
import { X } from 'lucide-react';
import './Modal.css';

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  showCloseButton = true,
  preventClose = false,
  onCloseAttempt,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]); // Only depend on isOpen

  const handleClose = () => {
    if (preventClose && onCloseAttempt) {
      onCloseAttempt();
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className={`modal modal--${size}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal__header">
          <h2 className="modal__title">{title}</h2>
          {showCloseButton && (
            <button
              className="modal__close"
              onClick={handleClose}
              aria-label="Close modal"
              type="button"
            >
              <X size={20} />
            </button>
          )}
        </div>
        <div className="modal__content">{children}</div>
      </div>
    </div>
  );
};
