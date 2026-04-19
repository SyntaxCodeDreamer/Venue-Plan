export default function NavBadge({ children, color = 'var(--accent-red)' }) {
  return (
    <span className="nav-badge" style={{ background: color }}>
      {children}
    </span>
  );
}
