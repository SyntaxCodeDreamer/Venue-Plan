import { useRef, useEffect, useState, useCallback } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { VenueDB } from '../../db/venueDB';
import Modal from '../ui/Modal';

export default function VenuePlotter() {
  const isOpen          = useAppStore(s => s.isVenuePlotterOpen);
  const close           = useAppStore(s => s.closeVenuePlotter);
  const setCustomZones  = useAppStore(s => s.setCustomZones);
  const setVenueFormat  = useAppStore(s => s.setVenueFormat);

  const canvasRef   = useRef(null);
  const drawnRef    = useRef([]);
  const [drawn,     setDrawn]     = useState([]);
  const [zoneName,  setZoneName]  = useState('Zone 1');
  const [layoutName,setLayoutName]= useState('My Custom Layout');
  const [status,    setStatus]    = useState('READY TO PLOT');

  // Render drawn zones on canvas
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;

    ctx.fillStyle='#000'; ctx.fillRect(0,0,W,H);

    // Grid
    ctx.strokeStyle='rgba(255,255,255,0.05)'; ctx.lineWidth=1;
    const cols=10, rows=6;
    for (let i=1; i<cols; i++) { ctx.beginPath(); ctx.moveTo((W/cols)*i,0); ctx.lineTo((W/cols)*i,H); ctx.stroke(); }
    for (let i=1; i<rows; i++) { ctx.beginPath(); ctx.moveTo(0,(H/rows)*i); ctx.lineTo(W,(H/rows)*i); ctx.stroke(); }

    ctx.strokeStyle='rgba(255,255,255,0.12)'; ctx.lineWidth=1;
    ctx.strokeRect(0,0,W,H);

    const pts = drawnRef.current;
    if (pts.length > 1) {
      ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
      for (let i=1; i<pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      if (pts.length > 2) ctx.closePath();
      ctx.strokeStyle='rgba(99,102,241,0.65)'; ctx.lineWidth=1.5;
      ctx.setLineDash([6,4]); ctx.stroke(); ctx.setLineDash([]);
    }

    pts.forEach((p, i) => {
      ctx.fillStyle='rgba(99,102,241,0.25)';
      ctx.beginPath(); ctx.arc(p.x,p.y,18,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='rgba(99,102,241,0.8)';
      ctx.beginPath(); ctx.arc(p.x,p.y,8,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='#6366f1'; ctx.lineWidth=1.5; ctx.stroke();
      ctx.fillStyle='#fff'; ctx.font='bold 8px monospace'; ctx.textAlign='center';
      ctx.fillText(i+1, p.x, p.y+3); ctx.textAlign='left';
      ctx.font='10px monospace'; ctx.fillStyle='rgba(255,255,255,0.85)';
      ctx.fillText(p.name, p.x+22, p.y+4);
    });
  }, []);

  // Re-render whenever drawn changes
  useEffect(() => { render(); }, [drawn, render]);

  // Resize canvas when modal opens
  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width  = canvas.offsetWidth  || 500;
        canvas.height = canvas.offsetHeight || 300;
        render();
      }
    }, 150);
    return () => clearTimeout(t);
  }, [isOpen, render]);

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const r = canvas.getBoundingClientRect();
    const x = (e.clientX - r.left) * (canvas.width  / r.width);
    const y = (e.clientY - r.top)  * (canvas.height / r.height);
    const name = zoneName.trim() || `Zone ${drawnRef.current.length + 1}`;

    const newPt = { x, y, name };
    drawnRef.current = [...drawnRef.current, newPt];
    setDrawn([...drawnRef.current]);

    const match = name.match(/^(.*?)(\d+)$/);
    if (match) setZoneName(`${match[1]}${parseInt(match[2],10)+1}`);
    else setZoneName(`${name} ${drawnRef.current.length+1}`);

    setStatus(`${drawnRef.current.length} ZONES PLOTTED`);
  };

  const handleClear = () => {
    drawnRef.current = [];
    setDrawn([]);
    setStatus('READY TO PLOT');
    render();
  };

  const handleCancel = () => {
    close();
  };

  const handleConfirm = async () => {
    if (drawnRef.current.length === 0) { close(); return; }
    const canvas = canvasRef.current;
    const W = canvas?.width || 500, H = canvas?.height || 300;

    const zones = drawnRef.current.map(z => ({
      x: z.x / W, y: z.y / H, k: 'other', name: z.name
    }));

    setCustomZones(zones);
    setVenueFormat('custom');
    await VenueDB.saveZones(zones);

    const name = layoutName.trim() || `Layout-${Date.now()}`;
    await VenueDB.saveLayout(name, zones);

    close();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title="🏟️ Custom Venue Blueprint"
      subtitle="Manually plot operational zones for a non-standard venue layout."
    >
      {/* Layout name */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display:'block', fontSize:'0.65rem', color:'var(--text-muted)', letterSpacing:'1.5px', marginBottom:'6px' }}>
          LAYOUT NAME (used for coordinator assignment)
        </label>
        <input
          type="text"
          value={layoutName}
          onChange={e => setLayoutName(e.target.value)}
          style={{ width:'100%', padding:'0.7rem 1rem', background:'rgba(0,0,0,0.5)', border:'1px solid var(--border-light)', borderRadius:'8px', color:'white', fontFamily:'var(--mono)', fontSize:'0.85rem', boxSizing:'border-box', outline:'none' }}
        />
      </div>

      {/* Zone name + canvas */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display:'flex', gap:'1rem', marginBottom:'1rem' }}>
          <input
            type="text"
            value={zoneName}
            onChange={e => setZoneName(e.target.value)}
            style={{ flex:1, padding:'0.5rem', background:'#000', border:'1px solid rgba(255,255,255,0.2)', color:'#fff', borderRadius:'4px', textAlign:'center', outline:'none' }}
          />
          <span style={{ alignSelf:'center', fontSize:'0.65rem', color:'var(--accent-indigo)', fontWeight:700 }}>
            {status}
          </span>
        </div>

        <div style={{ position:'relative', background:'#000', border:'1px dashed var(--border-light)', borderRadius:'8px', overflow:'hidden', cursor:'crosshair' }}>
          <canvas
            ref={canvasRef}
            width={500} height={300}
            style={{ width:'100%', display:'block', pointerEvents:'auto' }}
            onClick={handleCanvasClick}
          />
          <div style={{ position:'absolute', top:'10px', right:'10px' }}>
            <button
              onClick={handleClear}
              style={{ padding:'4px 10px', background:'rgba(255,255,255,0.1)', borderRadius:'4px', fontSize:'0.7rem', cursor:'pointer', border:'none', color:'white' }}
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display:'flex', gap:'1rem', justifyContent:'flex-end' }}>
        <button
          onClick={handleCancel}
          style={{ padding:'0.6rem 1.5rem', color:'var(--text-secondary)', background:'var(--bg-tertiary)', border:'1px solid var(--border-light)', borderRadius:'8px', cursor:'pointer' }}
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          style={{ padding:'0.6rem 2rem', background:'var(--accent-indigo)', color:'white', borderRadius:'8px', fontWeight:700, border:'none', cursor:'pointer' }}
        >
          Deploy Layout
        </button>
      </div>
    </Modal>
  );
}
