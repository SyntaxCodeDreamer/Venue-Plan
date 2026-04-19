export default function Modal({ isOpen, onClose, title, subtitle, maxWidth = '600px', children }) {
  if (!isOpen) return null;
  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content" style={{ maxWidth }}>
        {title && <h2 style={{ marginBottom: '1rem' }}>{title}</h2>}
        {subtitle && (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </div>
  );
}
