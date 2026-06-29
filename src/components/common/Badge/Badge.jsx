/**
 * Badge.jsx
 * Reusable badge component for status indicators
 */
import './Badge.css';

export const Badge = ({ children, variant = 'default', size = 'medium' }) => {
  return (
    <span className={`badge badge--${variant} badge--${size}`}>
      {children}
    </span>
  );
};
