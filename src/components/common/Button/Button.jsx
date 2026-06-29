/**
 * Button.jsx
 * Reusable button component with variants
 */
import './Button.css';

export const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  onClick,
  type = 'button',
  fullWidth = false,
  ...props
}) => {
  const classNames = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    fullWidth && 'btn--full-width',
    loading && 'btn--loading',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={classNames}
      disabled={disabled || loading}
      onClick={onClick}
      type={type}
      {...props}
    >
      {icon && <span className="btn__icon">{icon}</span>}
      <span className="btn__text">{children}</span>
      {loading && <span className="btn__spinner"></span>}
    </button>
  );
};
