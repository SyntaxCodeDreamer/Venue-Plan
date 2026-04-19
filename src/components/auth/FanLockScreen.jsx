import { useState, useEffect } from 'react';
import { VenueDB } from '../../db/venueDB';

const VENUES = [
  { value: 'main',     label: 'Main Stadium' },
  { value: 'north',    label: 'North Arena' },
  { value: 'training', label: 'Training Grounds' },
];

export default function FanLockScreen({ onUnlock }) {
  const [ticketId, setTicketId]   = useState('');
  const [fanName,  setFanName]    = useState('');
  const [venue,    setVenue]      = useState('');
  const [venues,   setVenues]     = useState([
    { value: 'main',     label: 'Main Stadium' },
    { value: 'north',    label: 'North Arena' },
    { value: 'training', label: 'Training Grounds' },
  ]);
  const [leaving,  setLeaving]    = useState(false);

  useEffect(() => {
    (async () => {
      await VenueDB.init();
      const dbLayouts = await VenueDB.getLayouts();
      if (dbLayouts.length > 0) {
        setVenues(prev => {
          // Prevent duplicates if useEffect runs twice
          const existingIds = new Set(prev.map(v => v.value));
          const newItems = dbLayouts
            .map(l => ({ value: `custom_${l.id}`, label: l.name, data: l }))
            .filter(item => !existingIds.has(item.value));
          return [...prev, ...newItems];
        });
      }
    })();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const selected = venues.find(v => v.value === venue);
    const venueLabel = selected?.label || 'VenueFlow';

    const count = parseInt(localStorage.getItem('venueflow_active_fans') || '0', 10);
    localStorage.setItem('venueflow_active_fans', count + 1);
    setLeaving(true);
    setTimeout(() => onUnlock({ ticketId, fanName, venue, venueLabel, layoutData: selected?.data }), 500);
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: '#050508', zIndex: 10000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'opacity 0.5s', opacity: leaving ? 0 : 1
      }}
    >
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.05)',
        padding: '2rem', borderRadius: '20px',
        width: '90%', maxWidth: '400px', textAlign: 'center'
      }}>
        <h2 style={{ color: 'white', marginBottom: '2rem' }}>Fan Access Portal</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Ticket ID (e.g., TKT-123)"
            value={ticketId}
            onChange={e => setTicketId(e.target.value)}
            required
            style={{
              width: '100%', padding: '1rem',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px',
              color: 'white', marginBottom: '1rem', textAlign: 'center', outline: 'none'
            }}
          />
          <input
            type="text"
            placeholder="Full Name"
            value={fanName}
            onChange={e => setFanName(e.target.value)}
            required
            style={{
              width: '100%', padding: '1rem',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px',
              color: 'white', marginBottom: '1rem', textAlign: 'center', outline: 'none'
            }}
          />
          <select
            value={venue}
            onChange={e => setVenue(e.target.value)}
            required
            style={{
              width: '100%', padding: '1rem',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px',
              color: 'white', marginBottom: '1.5rem', textAlign: 'center'
            }}
          >
            <option value="" disabled>Select Attending Venue</option>
            {venues.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
          </select>
          <button
            type="submit"
            style={{
              width: '100%', padding: '1rem',
              background: '#10b981', color: 'white',
              border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer'
            }}
          >
            Validate Ticket
          </button>
        </form>
      </div>
    </div>
  );
}
