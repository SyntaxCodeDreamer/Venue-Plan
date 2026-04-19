import { VenueDB } from '../../db/venueDB';

export default function CoordinatorCard({ coordinator, layout, onDelete }) {
  const layoutLabel = layout
    ? `📍 ${layout.name} · ${layout.zones?.length || 0} zones`
    : null;

  const handleDelete = async () => {
    await VenueDB.deleteUser(coordinator.username);
    onDelete?.();
  };

  return (
    <div style={{
      display:'flex', justifyContent:'space-between', alignItems:'center',
      padding:'0.85rem 1rem',
      background:'rgba(255,255,255,0.03)',
      border:'1px solid var(--border-light)',
      borderRadius:'10px', gap:'1rem'
    }}>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontWeight:700, fontSize:'0.85rem', color:'white' }}>
          👤 {coordinator.username}
        </div>
        <div style={{ fontSize:'0.68rem', marginTop:'3px', color:'var(--accent-indigo)' }}>
          {layoutLabel || <span style={{ color:'var(--accent-red)' }}>No layout assigned</span>}
        </div>
      </div>
      <button
        onClick={handleDelete}
        style={{
          fontSize:'0.7rem', background:'rgba(239,68,68,0.1)', color:'#ef4444',
          border:'1px solid rgba(239,68,68,0.3)', borderRadius:'6px',
          padding:'5px 12px', cursor:'pointer'
        }}
      >
        ✕ Remove
      </button>
    </div>
  );
}
