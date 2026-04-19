import { useAppStore } from '../../store/useAppStore';
import { VenueDB } from '../../db/venueDB';
import NavBadge from '../ui/NavBadge';

const NAV_ITEMS = {
  core: {
    label: 'Core Operations',
    links: [
      { id: 'dashboard',   icon: '📊', label: 'Dashboard' },
      { id: 'venue-map',   icon: '🏟️', label: 'Venue Map' },
      { id: 'crowd-flow',  icon: '🌀', label: 'Crowd Flow' },
    ]
  },
  tactical: {
    label: 'Tactical & Security',
    links: [
      { id: 'security', icon: '🎥', label: 'Security Feeds', badge: 'LIVE' },
      { id: 'staff',    icon: '👥', label: 'Staff Units' },
      { id: 'alerts',   icon: '🔔', label: 'Alerts & Logs', badgeDynamic: true },
    ]
  },
  admin: {
    label: 'Administration',
    adminOnly: true,
    links: [
      { id: 'coordinator-mgmt', icon: '⚙️', label: 'Coordinators' }
    ]
  }
};

export default function Sidebar() {
  const activeView  = useAppStore(s => s.activeView);
  const setActiveView = useAppStore(s => s.setActiveView);
  const session     = useAppStore(s => s.session);
  const clearSession = useAppStore(s => s.clearSession);
  const alerts      = useAppStore(s => s.alerts);
  const role        = session?.role || '';

  const handleLogout = async () => {
    await VenueDB.clearSession();
    clearSession();
  };

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="brand" onClick={() => setActiveView('dashboard')}>
        <div className="brand-icon">V</div>
        <div className="brand-text">
          <h2 style={{ fontSize: '1.1rem', lineHeight: 1 }}>
            {session?.venueName || 'VenueFlow'}
          </h2>
          <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Orchestrator v3
          </span>
        </div>
      </div>

      {/* Nav */}
      <div className="sidebar-nav">
        {Object.entries(NAV_ITEMS).map(([key, group]) => {
          if (group.adminOnly && role !== 'admin') return null;
          if (key === 'tactical' && role === 'coordinator') return null;
          return (
            <nav className="nav-group" key={key}>
              <p className="nav-label">{group.label}</p>
              {group.links.map(link => (
                <button
                  key={link.id}
                  className={`nav-link ${activeView === link.id ? 'active' : ''}`}
                  onClick={() => setActiveView(link.id)}
                >
                  <span>{link.icon}</span>
                  {link.label}
                  {link.badge && <NavBadge color="var(--accent-green)">{link.badge}</NavBadge>}
                  {link.badgeDynamic && <NavBadge>{alerts.length}</NavBadge>}
                </button>
              ))}
            </nav>
          );
        })}
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <div style={{ marginBottom: '1rem', padding: '0 0.5rem' }}>
          <a
            href="/fan"
            target="_blank"
            rel="noreferrer"
            className="nav-link"
            style={{ background: 'rgba(0,245,255,0.05)', color: 'var(--accent-cyan)', border: '1px solid rgba(0,245,255,0.1)' }}
          >
            <span>🌐</span> Public Portal
          </a>
        </div>
        <div className="user-widget">
          <div className="user-avatar">{(session?.username?.[0] || 'A').toUpperCase()}</div>
          <div className="user-info">
            <span className="user-name">
              Op: {(session?.username || 'Admin').toUpperCase()} [{(role || 'ADMIN').toUpperCase()}]
            </span>
            <div className="user-status">● Online</div>
          </div>
          <button
            onClick={handleLogout}
            style={{ fontSize: '0.8rem', opacity: 0.4, background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
          >
            ⏻
          </button>
        </div>
      </div>
    </aside>
  );
}
