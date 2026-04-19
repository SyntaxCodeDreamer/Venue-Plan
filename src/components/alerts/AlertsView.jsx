import { useAppStore } from '../../store/useAppStore';

export default function AlertsView() {
  const alerts = useAppStore(s => s.alerts);

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Operational Log Feed</span>
        <span style={{ fontSize:'0.65rem', color:'var(--text-muted)', fontFamily:'var(--mono)' }}>
          {alerts.length} events
        </span>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
        {alerts.map((a, i) => (
          <div key={i} className={`mini-alert ${a.type}`}>
            <span className="ma-time">{a.time}</span>
            <span>{a.msg}</span>
          </div>
        ))}
        {alerts.length === 0 && (
          <p style={{ color:'var(--text-muted)', fontSize:'0.8rem', textAlign:'center', padding:'2rem' }}>
            No operational events recorded.
          </p>
        )}
      </div>
    </div>
  );
}
