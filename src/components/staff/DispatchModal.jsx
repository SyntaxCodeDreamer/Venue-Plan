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
  const addAlert      = useAppStore(s => s.addAlert);

  const [selUnit,   setSelUnit]   = useState('');
  const [selSector, setSelSector] = useState(SECTORS[0]);

  const handleConfirm = async () => {
    const unitName = selUnit || staff[0]?.name;
    const unit = staff.find(u => u.name === unitName);
    if (!unit) { close(); return; }

    const updated = { ...unit, status:'En-route', zone: selSector.split(' ')[0] };
    updateUnit(updated);
    await VenueDB.updateStaffUnit(updated);

    const alert = { type:'success', msg:`DISPATCH: ${unit.name} rerouted to ${selSector}.`, time: fmtTime(new Date()) };
    addAlert(alert);
    await VenueDB.addAlert(alert);

    // Simulate arrival
    setTimeout(async () => {
      const arrived = { ...updated, status:'Active' };
      updateUnit(arrived);
      await VenueDB.updateStaffUnit(arrived);
    }, 5000);

    close();
  };

  return (
    <Modal isOpen={isOpen} onClose={close} title="📡 Unit Dispatch" subtitle="Re-assign tactical units to specific sectors." maxWidth="440px">
      <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
        <div>
          <label style={{ display:'block', fontSize:'0.7rem', color:'var(--text-muted)', marginBottom:'4px' }}>Select Unit</label>
          <select
            value={selUnit}
            onChange={e => setSelUnit(e.target.value)}
            style={{ width:'100%', padding:'0.8rem', background:'var(--bg-primary)', border:'1px solid var(--border-light)', borderRadius:'8px', color:'white' }}
          >
            {staff.map(u => (
              <option key={u.name} value={u.name}>{u.name} ({u.role})</option>
            ))}
          </select>
        </div>
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
        <button onClick={handleConfirm} style={{ padding:'0.6rem 2rem', background:'var(--accent-indigo)', color:'white', borderRadius:'8px', fontWeight:700, border:'none', cursor:'pointer' }}>
          Confirm Dispatch
        </button>
      </div>
    </Modal>
  );
}
