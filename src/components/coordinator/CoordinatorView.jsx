import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { VenueDB } from '../../db/venueDB';
import CoordinatorForm from './CoordinatorForm';
import CoordinatorCard from './CoordinatorCard';

export default function CoordinatorView() {
  const activeView = useAppStore(s => s.activeView);
  const [coordinators, setCoordinators] = useState([]);
  const [layouts,      setLayouts]      = useState([]);

  const refresh = useCallback(async () => {
    const [allUsers, allLayouts] = await Promise.all([VenueDB.getAllUsers(), VenueDB.getLayouts()]);
    setCoordinators(allUsers.filter(u => u.role === 'coordinator'));
    setLayouts(allLayouts);
  }, []);

  // Refresh when this view becomes active
  useEffect(() => {
    if (activeView === 'coordinator-mgmt') refresh();
  }, [activeView, refresh]);

  return (
    <div className="grid-container" style={{ gridTemplateColumns:'380px 1fr', alignItems:'start' }}>
      {/* Create form */}
      <CoordinatorForm onCreated={refresh} />

      {/* List */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">👥 Active Coordinators</span>
          <span className="nav-badge">{coordinators.length}</span>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem', maxHeight:'460px', overflowY:'auto' }}>
          {coordinators.length === 0 ? (
            <p style={{ color:'var(--text-muted)', fontSize:'0.8rem', textAlign:'center', padding:'2rem' }}>
              No coordinators yet. Create one using the form.
            </p>
          ) : (
            coordinators.map(coord => (
              <CoordinatorCard
                key={coord.username}
                coordinator={coord}
                layout={layouts.find(l => l.id === coord.assignedLayoutId)}
                onDelete={refresh}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
