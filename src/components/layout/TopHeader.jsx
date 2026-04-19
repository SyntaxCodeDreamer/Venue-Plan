import { useAppStore } from '../../store/useAppStore';
import { useClock } from '../../hooks/useClock';
import { VenueDB } from '../../db/venueDB';
import EmergencyButton from '../ui/EmergencyButton';

const VIEW_META = {
  'dashboard':        { icon: '📊', label: 'Dashboard' },
  'venue-map':        { icon: '🏟️', label: 'Venue Map' },
  'crowd-flow':       { icon: '🌀', label: 'Crowd Flow' },
  'security':         { icon: '🎥', label: 'Security Feeds' },
  'staff':            { icon: '👥', label: 'Staff Units' },
  'alerts':           { icon: '🔔', label: 'Alerts & Logs' },
  'coordinator-mgmt': { icon: '⚙️', label: 'Coordinators' },
};

export default function TopHeader() {
  const activeView   = useAppStore(s => s.activeView);
  const setActiveView = useAppStore(s => s.setActiveView);
  const isAlertMode  = useAppStore(s => s.isAlertMode);
  const setAlertMode = useAppStore(s => s.setAlertMode);
  const addAlert     = useAppStore(s => s.addAlert);
  const role         = useAppStore(s => s.session?.role);
  const clock        = useClock();

  const meta = VIEW_META[activeView] || { icon: '📊', label: 'Dashboard' };

  const handleHighAlert = () => {
    const next = !isAlertMode;
    setAlertMode(next);
    document.body.classList.toggle('emergency-mode', next);
    if (next) {
      const alert = { type: 'danger', msg: 'GLOBAL EMERGENCY SYSTEM TRIGGERED', time: 'SYSTEM' };
      addAlert(alert);
      VenueDB.addAlert(alert);
    }
  };

  return (
    <header className="top-header">
      <div className="view-title">
        <span>{meta.icon}</span>
        <h2>{meta.label}</h2>
      </div>
      <div className="header-tools">
        {role === 'admin' && (
          <EmergencyButton
            style={{ background: 'var(--bg-tertiary)', marginRight: '1rem', color: 'var(--text-secondary)', border: '1px solid var(--border-light)' }}
            onClick={() => setActiveView('coordinator-mgmt')}
          >
            ⚙ COORDINATORS
          </EmergencyButton>
        )}
        <div className="clock">{clock}</div>
        {role !== 'coordinator' && (
          <EmergencyButton active={isAlertMode} onClick={handleHighAlert}>
            {isAlertMode ? 'CODE RED: ACTIVE' : 'HIGH ALERT'}
          </EmergencyButton>
        )}
      </div>
    </header>
  );
}
