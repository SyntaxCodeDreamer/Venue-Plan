import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { VenueDB } from '../../db/venueDB';
import Modal from '../ui/Modal';

const SECTORS = ['North Tier', 'South Tier', 'East Wing', 'West Wing'];

const fmtTime = d => d.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' });

export default function DispatchModal() {
  const isOpen        = useAppStore(s => s.isDispatchOpen);
  const close         = useAppStore(s => s.closeDispatch);
  const staff         = useAppStore(s => s.staff);
  const updateUnit    = useAppStore(s => s.updateStaffUnit);
  const addStaffUnit  = useAppStore(s => s.addStaffUnit);
  const addAlert      = useAppStore(s => s.addAlert);

  const [unitName,   setUnitName]   = useState('');
  const [unitRole,   setUnitRole]   = useState('Security');
  const [selSector,  setSelSector]  = useState(SECTORS[0]);

  // Sync unitName with selection if they pick from dropdown
  const handleSelectExisting = (name) => {
    setUnitName(name);
    const existing = staff.find(u => u.name === name);
    if (existing) setUnitRole(existing.role);
  };

  const handleConfirm = async () => {
    if (!unitName.trim()) return;

    let unit = staff.find(u => u.name === unitName);
    const isNew = !unit;

    if (isNew) {
      unit = { name: unitName, role: unitRole, status: 'Standby', zone: 'Unassigned' };
      addStaffUnit(unit);
      await VenueDB.updateStaffUnit(unit); // Using update (put) for new ones too
    }

    const updated = { ...unit, status:'En-route', zone: selSector.split(' ')[0] };
    updateUnit(updated);
    await VenueDB.updateStaffUnit(updated);

    const alert = { type:'success', msg:`DISPATCH: ${unit.name} (${unit.role}) rerouted to ${selSector}.`, time: fmtTime(new Date()) };
    addAlert(alert);
    await VenueDB.addAlert(alert);

    // Simulate arrival
    setTimeout(async () => {
      const arrived = { ...updated, status:'Active' };
      updateUnit(arrived);
      await VenueDB.updateStaffUnit(arrived);
    }, 5000);

    setUnitName('');
    close();
  };

  return (
    <Modal isOpen={isOpen} onClose={close} title="📡 Unit Dispatch" subtitle="Deploy or re-assign tactical units." maxWidth="440px">
      <div style={{ display:'flex', flexDirection:'column', gap:'1.2rem' }}>
        
        <div>
          <label style={{ display:'block', fontSize:'0.7rem', color:'var(--text-muted)', marginBottom:'4px' }}>Unit Name</label>
          <div style={{ display:'flex', gap:'8px' }}>
            <input
              type="text"
              placeholder="Enter name (e.g. Unit Delta)"
              value={unitName}
              onChange={e => setUnitName(e.target.value)}
              style={{ flex:1, padding:'0.8rem', background:'var(--bg-primary)', border:'1px solid var(--border-light)', borderRadius:'8px', color:'white' }}
            />
            {staff.length > 0 && (
              <select
                value={unitName}
                onChange={e => handleSelectExisting(e.target.value)}
                style={{ width:'40px', background:'var(--bg-tertiary)', border:'1px solid var(--border-light)', borderRadius:'8px', color:'white', textAlign:'center' }}
              >
                <option value="" disabled>▼</option>
                {staff.map(u => (
                  <option key={u.name} value={u.name}>{u.name}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {!staff.find(u => u.name === unitName) && (
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <label style={{ display:'block', fontSize:'0.7rem', color:'var(--text-muted)', marginBottom:'4px' }}>Assign Role (New Unit)</label>
            <input
              type="text"
              placeholder="Unit Role (e.g. Tactical Response)"
              value={unitRole}
              onChange={e => setUnitRole(e.target.value)}
              style={{ width:'100%', padding:'0.8rem', background:'var(--bg-primary)', border:'1px solid var(--border-light)', borderRadius:'8px', color:'white' }}
            />
          </div>
        )}

        <div>
          <label style={{ display:'block', fontSize:'0.7rem', color:'var(--text-muted)', marginBottom:'4px' }}>Target Sector</label>
          <select
            value={selSector}
            onChange={e => setSelSector(e.target.value)}
            style={{ width:'100%', padding:'0.8rem', background:'var(--bg-primary)', border:'1px solid var(--border-light)', borderRadius:'8px', color:'white' }}
          >
            {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display:'flex', gap:'1rem', justifyContent:'flex-end', marginTop:'2rem' }}>
        <button onClick={close} style={{ padding:'0.6rem 1.5rem', color:'var(--text-secondary)', background:'var(--bg-tertiary)', border:'1px solid var(--border-light)', borderRadius:'8px', cursor:'pointer' }}>
          Cancel
        </button>
        <button 
          onClick={handleConfirm} 
          disabled={!unitName.trim()}
          style={{ padding:'0.6rem 2rem', background:'var(--accent-indigo)', opacity: unitName.trim() ? 1 : 0.5, color:'white', borderRadius:'8px', fontWeight:700, border:'none', cursor:'pointer' }}
        >
          Confirm Dispatch
        </button>
      </div>
    </Modal>
  );
}
