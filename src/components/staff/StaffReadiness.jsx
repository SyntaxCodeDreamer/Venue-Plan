import { useAppStore } from '../../store/useAppStore';

export default function StaffReadiness() {
  const staff = useAppStore(s => s.staff);
  const active = staff.filter(s => s.status === 'Active').length;
  const total  = staff.length;
  const pct    = total > 0 ? Math.round((active / total) * 100) : 0;

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px', fontSize:'0.8rem' }}>
        <span>Overall Readiness</span>
        <span style={{ color:'var(--accent-green)' }}>{pct}%</span>
      </div>
      <div style={{ height:'4px', background:'rgba(255,255,255,0.1)', borderRadius:'2px' }}>
        <div style={{ height:'100%', width:`${pct}%`, background:'var(--accent-green)', borderRadius:'2px', transition:'width 0.5s' }} />
      </div>
      <div style={{ marginTop:'1rem', display:'flex', flexDirection:'column', gap:'8px' }}>
        {[
          { label:'Active',   count: staff.filter(s => s.status === 'Active').length,   color:'var(--accent-green)' },
          { label:'En-route', count: staff.filter(s => s.status === 'En-route').length, color:'var(--accent-yellow)' },
          { label:'Standby',  count: staff.filter(s => s.status === 'Standby').length,  color:'var(--text-muted)' },
        ].map(row => (
          <div key={row.label} style={{ display:'flex', justifyContent:'space-between', fontSize:'0.75rem' }}>
            <span style={{ color:row.color }}>{row.label}</span>
            <span style={{ fontWeight:700 }}>{row.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
