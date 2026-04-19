import { useState, useEffect } from 'react';

const FACILITIES = [
  { icon: '🍔', name: 'Food Court',         wait: 8,  level: 'mid' },
  { icon: '🚻', name: 'Restrooms (Level 2)', wait: 2,  level: 'low' },
  { icon: '🎁', name: 'Merch Stand',         wait: 15, level: 'high' },
];

function FacilityCard({ icon, name, wait, level }) {
  const [currentWait, setWait]   = useState(wait);
  const [currentLevel, setLevel] = useState(level);

  useEffect(() => {
    const id = setInterval(() => {
      if (Math.random() > 0.7) {
        const mins = 5 + Math.floor(Math.random() * 20);
        setWait(mins);
        setLevel(mins > 15 ? 'high' : mins > 8 ? 'mid' : 'low');
      }
    }, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="facility-card">
      <span className="f-icon">{icon}</span>
      <div className="f-info">
        <span className="f-name">{name}</span>
        <span className={`f-wait ${currentLevel}`}>{currentWait} min wait</span>
      </div>
    </div>
  );
}

function getFacilityIcon(name) {
  const n = name.toLowerCase();
  if (n.includes('food') || n.includes('eat') || n.includes('burger')) return '🍔';
  if (n.includes('restroom') || n.includes('toilet') || n.includes('wc')) return '🚻';
  if (n.includes('merch') || n.includes('shop') || n.includes('gift')) return '🎁';
  if (n.includes('gate') || n.includes('entry') || n.includes('exit')) return '🚪';
  if (n.includes('security') || n.includes('police')) return '🛡️';
  if (n.includes('medical') || n.includes('first aid')) return '🏥';
  if (n.includes('ticket')) return '🎫';
  if (n.includes('bar') || n.includes('drink')) return '🍺';
  return '📍';
}

export default function FanFacilitiesSection({ layoutData }) {
  const customZones = layoutData?.zones || [];
  
  return (
    <>
      <section className="facilities-grid">
        {(customZones.length > 0 ? customZones : FACILITIES).map((f, idx) => (
          <FacilityCard 
            key={f.name + idx} 
            icon={f.icon || getFacilityIcon(f.name)} 
            name={f.name} 
            wait={f.wait || 5} 
            level={f.level || 'low'} 
          />
        ))}
      </section>

      <section className="insight-section" style={{ marginTop: '1.5rem' }}>
        <h3>Travel &amp; Wayfinding</h3>
        <div className="facility-card">
          <span className="f-icon">🚆</span>
          <div className="f-info">
            <span className="f-name">Central Station Transit</span>
            <span className="f-wait low">Clear Flow</span>
          </div>
        </div>
        <p style={{ fontSize:'0.75rem', color:'var(--text-soft)', marginTop:'0.5rem', lineHeight:1.4 }}>
          {layoutData ? `Wayfinding paths for ${layoutData.name} are active. ` : ''}
          Trains are departing every 4 minutes. Post-match surge is expected in <strong>45 minutes</strong>.
        </p>
      </section>
    </>
  );
}
