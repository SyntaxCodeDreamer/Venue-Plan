import { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { VenueDB } from '../../db/venueDB';

const VENUES = [
  { value: 'main',     label: 'Main Stadium' },
  { value: 'north',    label: 'North Arena' },
  { value: 'training', label: 'Training Grounds' },
];

export default function LockScreen() {
  const isLoggedIn   = useAppStore(s => s.isLoggedIn);
  const setSession   = useAppStore(s => s.setSession);
  const setCustomZones = useAppStore(s => s.setCustomZones);
  const setVenueFormat = useAppStore(s => s.setVenueFormat);
  const setActiveView  = useAppStore(s => s.setActiveView);
  const setAlerts    = useAppStore(s => s.setAlerts);
  const setStaff     = useAppStore(s => s.setStaff);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [error,    setError]    = useState('');
  const [unlocking, setUnlocking] = useState(false);


  // Restore session on mount
  useEffect(() => {
    (async () => {
      await VenueDB.init();          // ensure DB is open before any reads
      
      // Clear previous venues fetching logic


      const session = await VenueDB.getSession();
      if (session) {
        const dbUser = await VenueDB.getUser(session.username);
        applySession(dbUser, session.username, session.venueName);
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function applySession(dbUser, uname, venueName) {
    const role = dbUser?.role || 'coordinator';

    // Hydrate DB data
    const [dbAlerts, dbStaff, dbZones] = await Promise.all([
      VenueDB.getAlerts(), VenueDB.getStaff(), VenueDB.getZones()
    ]);
    if (dbAlerts.length > 0) setAlerts(dbAlerts);
    if (dbStaff.length > 0)  setStaff(dbStaff);
    if (dbZones.length > 0)  setCustomZones(dbZones);

    // Coordinator: lock to assigned layout
    if (role === 'coordinator' && dbUser?.assignedLayoutId) {
      const layout = await VenueDB.getLayout(dbUser.assignedLayoutId);
      if (layout?.zones?.length > 0) {
        setCustomZones(layout.zones);
        setVenueFormat('custom');
      }
      setActiveView('venue-map');
    }

    setSession({ username: uname, venueName, role, assignedLayoutId: dbUser?.assignedLayoutId });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const venueName = 'VenueFlow Operations';


    const dbUser = await VenueDB.getUser(username);
    if (!dbUser || dbUser.password !== password) {
      setError('ACCESS DENIED: Invalid credentials');
      return;
    }

    // Custom layout selection logic removed as dropdown is gone


    await VenueDB.saveSession(username, venueName);
    setUnlocking(true);
    setTimeout(() => applySession(dbUser, username, venueName), 600);
  };

  if (isLoggedIn) return null;

  return (
    <div className={`lock-screen ${unlocking ? 'unlocked' : ''}`}>
      <div className="login-form">
        <div className="brand" style={{ marginBottom: '3rem', border: 'none', justifyContent: 'center' }}>
          <div className="brand-icon">V</div>
          <h1 style={{ fontSize: '2rem' }}>VenueFlow</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>
          ENTER SECURITY CLEARANCE KEY
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Operator Username"
            value={username}
            onChange={e => setUsername(e.target.value.trim().toLowerCase())}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {/* Venue selection removed */}

          {error && (
            <p style={{ color: 'var(--accent-red)', fontSize: '0.75rem', marginBottom: '1rem' }}>{error}</p>
          )}
          <button type="submit">Access Console</button>
        </form>

        <p style={{ marginTop: '2rem', fontSize: '0.6rem', color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>
          SECURE NODE: ALPHA-7 // V-OS 3.0
        </p>
      </div>
    </div>
  );
}
