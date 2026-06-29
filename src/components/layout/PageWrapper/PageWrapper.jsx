import './PageWrapper.css';

export default function PageWrapper({ title, subtitle, actions, children }) {
  return (
    <div className="page-wrapper">
      {(title || actions) && (
        <div className="page-wrapper__header">
          <div>
            {title && <h2 className="page-wrapper__title">{title}</h2>}
            {subtitle && <p className="page-wrapper__subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="page-wrapper__actions">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
