export default function StaffCard({ unit }) {
  const statusColor =
    unit.status === 'Active'   ? 'var(--accent-green)'  :
    unit.status === 'En-route' ? 'var(--accent-yellow)' :
                                  'var(--text-muted)';
  return (
    <div className="card" style={{ padding:'1rem' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontWeight:700, fontSize:'0.8rem' }}>{unit.name}</span>
        <span style={{ fontSize:'0.6rem', color: statusColor }}>{unit.status}</span>
      </div>
      <p style={{ fontSize:'0.65rem', color:'var(--text-secondary)', marginTop:'4px' }}>
        {unit.role} // {unit.zone} Sector
      </p>
    </div>
  );
}
