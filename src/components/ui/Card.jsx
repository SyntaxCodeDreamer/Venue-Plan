export default function Card({ children, className = '', style = {} }) {
  return (
    <div className={`card ${className}`} style={style}>
      {children}
    </div>
  );
}

export function CardHeader({ title, children }) {
  return (
    <div className="card-header">
      <span className="card-title">{title}</span>
      {children}
    </div>
  );
}
