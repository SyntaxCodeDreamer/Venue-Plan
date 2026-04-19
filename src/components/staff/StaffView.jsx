import { useAppStore } from '../../store/useAppStore';
import StaffCard from './StaffCard';
import StaffReadiness from './StaffReadiness';

export default function StaffView() {
  const staff      = useAppStore(s => s.staff);
  const openDispatch = useAppStore(s => s.openDispatch);

  return (
    <div className="grid-container">
      <div className="card" style={{ gridColumn:'span 2' }}>
        <div className="card-header">
          <span className="card-title">Tactical Unit Deployment</span>
          <button
            onClick={openDispatch}
            className="emergency-btn"
            style={{ background:'var(--accent-indigo)', color:'white', border:'none', padding:'4px 12px' }}
          >
            + DISPATCH UNIT
          </button>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
          {staff.map(unit => <StaffCard key={unit.name} unit={unit} />)}
          {staff.length === 0 && (
            <p style={{ color:'var(--text-muted)', fontSize:'0.8rem' }}>No staff units loaded.</p>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Unit Readiness</span>
        </div>
        <StaffReadiness />
      </div>
    </div>
  );
}
