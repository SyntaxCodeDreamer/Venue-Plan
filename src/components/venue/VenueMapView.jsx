import { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import HeatmapCanvas from '../canvas/HeatmapCanvas';
import { VenueDB } from '../../db/venueDB';

export default function VenueMapView() {
  const venueFormat   = useAppStore(s => s.venueFormat);
  const setVenueFormat = useAppStore(s => s.setVenueFormat);
  const setCustomZones = useAppStore(s => s.setCustomZones);
  const updateZoneTargets = useAppStore(s => s.updateZoneTargets);
  const resetLayout     = useAppStore(s => s.resetLayout);
  const openPlotter      = useAppStore(s => s.openVenuePlotter);
  const [customLayouts, setCustomLayouts] = useState([]);
  const [selectedSavedId, setSelectedSavedId] = useState(null);

  useEffect(() => {
    loadLayouts();
  }, []);

  async function loadLayouts() {
    await VenueDB.init();
    const all = await VenueDB.getLayouts();
    setCustomLayouts(all);
  }

  const handleFormatChange = (e) => {
    const val = e.target.value;
    if (val === 'custom') {
      openPlotter();
      setSelectedSavedId(null);
    } else if (val.startsWith('saved_')) {
      const id = parseInt(val.replace('saved_', ''), 10);
      const layout = customLayouts.find(l => l.id === id);
      if (layout) {
        setCustomZones(layout.zones);
        setVenueFormat('custom');
        setSelectedSavedId(id);
      }
    } else {
      setVenueFormat(val);
      setSelectedSavedId(null);
    }
  };

  const handleDeleteLayout = async () => {
    if (!selectedSavedId) return;
    if (!confirm('Are you sure you want to permanently delete this layout?')) return;

    try {
      await VenueDB.deleteLayout(selectedSavedId);
      await loadLayouts();
      
      // CRITICAL: Atomic reset of all layout state
      resetLayout();
      await VenueDB.clearZones();
      setSelectedSavedId(null);
    } catch (err) {
      console.error('Failed to delete layout:', err);
      alert('Error deleting layout.');
    }
  };

  return (
    <div className="card" style={{ height: '600px', display:'flex', flexDirection:'column' }}>
      <div className="card-header">
        <span className="card-title">Advanced Spatial Analysis</span>
        <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
          <select
            value={selectedSavedId ? `saved_${selectedSavedId}` : (venueFormat === 'custom' ? 'custom' : venueFormat)}
            onChange={handleFormatChange}
            style={{ 
              background: 'transparent', 
              border: '1px solid var(--border-light)', 
              color: 'var(--accent-indigo)', 
              padding: '6px 14px', 
              borderRadius: '8px', 
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none',
              transition: 'all 0.2s',
              appearance: 'none',
              WebkitAppearance: 'none'
            }}
            onMouseOver={e => e.currentTarget.style.borderColor = 'var(--accent-indigo)'}
            onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border-light)'}
          >
            <option value="stadium">🏟️ Stadium Layout</option>
            <option value="arena">🏀 Arena Layout</option>
            <hr />
            {customLayouts.map(l => (
              <option key={l.id} value={`saved_${l.id}`}>📍 {l.name}</option>
            ))}
            <option value="custom" style={{ color: 'var(--text-primary)' }}>+ CREATE NEW CUSTOM</option>
          </select>

          {selectedSavedId && (
            <button
              onClick={handleDeleteLayout}
              title="Delete Layout"
              style={{
                width: '32px', height: '32px', borderRadius: '4px',
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
            >
              🗑️
            </button>
          )}

          <button
            onClick={openPlotter}
            style={{ padding:'4px 12px', borderRadius:'4px', background:'var(--accent-indigo)', color:'white', fontSize:'0.7rem', fontWeight:700, cursor:'pointer', border:'none' }}
          >
            CREATE CUSTOM
          </button>
        </div>
      </div>
      <div style={{ flex:1, borderRadius:'12px', overflow:'hidden' }}>
        <HeatmapCanvas style={{ width:'100%', height:'100%' }} />
      </div>
    </div>
  );
}
