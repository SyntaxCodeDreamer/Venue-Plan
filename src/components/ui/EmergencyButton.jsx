export default function EmergencyButton({ active, onClick, children, style = {} }) {
  return (
    <button
      className="emergency-btn"
      onClick={onClick}
      style={{
        background: active ? 'var(--accent-red)' : undefined,
        ...style
      }}
    >
      {children}
    </button>
  );
}
