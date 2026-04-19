import { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import HeatmapCanvas from '../canvas/HeatmapCanvas';
import { VenueDB } from '../../db/venueDB';

export default function VenueMapView() {
  const venueFormat   = useAppStore(s => s.venueFormat);
  const setVenueFormat = useAppStore(s => s.setVenueFormat);
  const setCustomZones = useAppStore(s => s.setCustomZones);
  const openPlotter   = useAppStore(s => s.openVenuePlotter);
  const [customLayouts, setCustomLayouts] = useState([]);

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
    } else if (val.startsWith('saved_')) {
      const id = parseInt(val.replace('saved_', ''), 10);
      const layout = customLayouts.find(l => l.id === id);
      if (layout) {
        setCustomZones(layout.zones);
        setVenueFormat('custom');
      }
    } else {
      setVenueFormat(val);
    }
  };

  return (
    <div className="card" style={{ height: '600px', display:'flex', flexDirection:'column' }}>
      <div className="card-header">
        <span className="card-title">Advanced Spatial Analysis</span>
        <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
          <select
            value={venueFormat === 'custom' ? (customLayouts.length > 0 ? 'custom' : 'custom') : venueFormat}
            onChange={handleFormatChange}
            style={{ background:'transparent', border:'1px solid var(--border-light)', color:'white', padding:'4px 12px', borderRadius:'4px', fontSize:'0.8rem' }}
          >
            <option value="stadium">Stadium Layout</option>
            <option value="arena">Arena Layout</option>
            <hr />
            {customLayouts.map(l => (
              <option key={l.id} value={`saved_${l.id}`}>📍 {l.name}</option>
            ))}
            <option value="custom">+ CREATE NEW CUSTOM</option>
          </select>
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
