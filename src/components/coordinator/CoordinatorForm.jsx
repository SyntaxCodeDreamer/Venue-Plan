import { useState, useEffect } from 'react';
import { VenueDB } from '../../db/venueDB';

export default function CoordinatorForm({ onCreated }) {
  const [username,  setUsername]  = useState('');
  const [password,  setPassword]  = useState('');
  const [layoutId,  setLayoutId]  = useState('');
  const [layouts,   setLayouts]   = useState([]);
  const [status,    setStatus]    = useState({ msg: '', color: '' });

  useEffect(() => {
    (async () => {
      await VenueDB.init();
      loadLayouts();
    })();
  }, []);

  async function loadLayouts() {
    const all = await VenueDB.getLayouts();
    setLayouts(all);
  }

  const setMsg = (msg, color) => {
    setStatus({ msg, color });
    setTimeout(() => setStatus({ msg:'', color:'' }), 3500);
  };

  const handleCreate = async () => {
    if (!username || !password) { setMsg('⚠ Username and password are required.', 'var(--accent-red)'); return; }
    if (!layoutId)              { setMsg('⚠ Please assign a venue layout.',        'var(--accent-yellow)'); return; }

    const existing = await VenueDB.getUser(username);
    if (existing) { setMsg(`⚠ "${username}" already exists.`, 'var(--accent-red)'); return; }

    await VenueDB.addUser(username, password, 'coordinator', parseInt(layoutId));
    setMsg(`✓ Coordinator "${username}" created!`, 'var(--accent-green)');
    setUsername(''); setPassword(''); setLayoutId('');
    onCreated?.();
  };

  const inputStyle = {
    width:'100%', padding:'0.85rem',
    background:'rgba(0,0,0,0.4)', border:'1px solid var(--border-light)',
    borderRadius:'10px', color:'white', fontFamily:'var(--mono)',
    fontSize:'0.85rem', boxSizing:'border-box', outline:'none'
  };
  const labelStyle = {
    display:'block', fontSize:'0.65rem', color:'var(--text-muted)',
    letterSpacing:'1.5px', marginBottom:'6px'
  };

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">🆕 New Coordinator</span>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:'1.1rem', paddingTop:'0.5rem' }}>
        <div>
          <label style={labelStyle}>USERNAME</label>
          <input type="text" value={username} onChange={e => setUsername(e.target.value.trim().toLowerCase())} placeholder="e.g. coord_north" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>PASSWORD</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Set a secure password" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>ASSIGN VENUE LAYOUT</label>
          <select value={layoutId} onChange={e => setLayoutId(e.target.value)} style={{ ...inputStyle }}>
            <option value="">-- Select a saved layout --</option>
            {layouts.map(l => (
              <option key={l.id} value={l.id}>{l.name} ({l.zones?.length || 0} zones)</option>
            ))}
          </select>
          <p style={{ fontSize:'0.65rem', color:'var(--text-muted)', marginTop:'5px' }}>
            💡 Create a layout via <strong style={{ color:'var(--accent-indigo)' }}>Venue Map → Create Custom</strong> first.
          </p>
        </div>
        <button
          onClick={handleCreate}
          style={{ width:'100%', padding:'0.95rem', background:'linear-gradient(135deg,#6366f1,#7c3aed)', color:'white', border:'none', borderRadius:'10px', fontWeight:700, fontSize:'0.85rem', cursor:'pointer', letterSpacing:'1px' }}
        >
          ✓ CREATE COORDINATOR
        </button>
        {status.msg && (
          <div style={{ fontSize:'0.75rem', textAlign:'center', color: status.color }}>{status.msg}</div>
        )}
      </div>
    </div>
  );
}
