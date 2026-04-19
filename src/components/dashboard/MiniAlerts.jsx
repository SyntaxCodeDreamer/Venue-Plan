import { useAppStore } from '../../store/useAppStore';

export default function MiniAlerts() {
  const alerts = useAppStore(s => s.alerts);

  return (
    <div className="mini-alerts">
      {alerts.slice(0, 5).map((a, i) => (
        <div key={i} className={`mini-alert ${a.type}`}>
          <span className="ma-time">{a.time}</span>
          <span>{a.msg}</span>
        </div>
      ))}
      {alerts.length === 0 && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', padding: '1rem' }}>
          No active alerts.
        </p>
      )}
    </div>
  );
}
