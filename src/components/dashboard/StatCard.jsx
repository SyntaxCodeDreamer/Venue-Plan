export default function StatCard({ title, value, trend, trendDir = 'down' }) {
  return (
    <div className="card stat-card">
      <div className="card-header">
        <span className="card-title">{title}</span>
      </div>
      <div className="kpi-value">{value}</div>
      <div className={`kpi-trend trend-${trendDir}`}>{trend}</div>
    </div>
  );
}
