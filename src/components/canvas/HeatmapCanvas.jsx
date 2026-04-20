import { useRef, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';

const lerp = (a, b, t) => a + (b - a) * t;

function drawVenueLayout(ctx, w, h, format, customZones) {
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 2;
  ctx.setLineDash([]);

  if (format === 'stadium') {
    ctx.beginPath(); ctx.roundRect(w*0.1, h*0.1, w*0.8, h*0.8, 50); ctx.stroke();
    ctx.setLineDash([5,5]);
    ctx.beginPath(); ctx.roundRect(w*0.25, h*0.25, w*0.5, h*0.5, 5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w*0.5, h*0.25); ctx.lineTo(w*0.5, h*0.75); ctx.stroke();
    ctx.beginPath(); ctx.arc(w*0.5, h*0.5, w*0.06, 0, Math.PI*2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle='rgba(255,255,255,0.02)';
    ctx.fillRect(w*0.15, h*0.12, w*0.7, h*0.1);
    ctx.fillRect(w*0.15, h*0.78, w*0.7, h*0.1);
  } else if (format === 'arena') {
    ctx.beginPath(); ctx.strokeRect(w*0.35, h*0.3, w*0.3, h*0.4);
    for (let i=1; i<=3; i++) {
      ctx.beginPath();
      ctx.roundRect(w*(0.35-i*0.08), h*(0.3-i*0.06), w*(0.3+i*0.16), h*(0.4+i*0.12), 20);
      ctx.stroke();
    }
  } else if (format === 'custom' && customZones?.length > 0) {
    if (customZones.length > 1) {
      ctx.beginPath();
      ctx.moveTo(customZones[0].x*w, customZones[0].y*h);
      for (let i=1; i<customZones.length; i++) ctx.lineTo(customZones[i].x*w, customZones[i].y*h);
      if (customZones.length > 2) ctx.closePath();
      ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth=2;
      ctx.setLineDash([8,5]); ctx.stroke(); ctx.setLineDash([]);

      // Spoke lines from centroid
      const cx = customZones.reduce((s,z) => s+z.x, 0) / customZones.length;
      const cy = customZones.reduce((s,z) => s+z.y, 0) / customZones.length;
      ctx.strokeStyle = 'rgba(255,255,255,0.07)'; ctx.lineWidth=1;
      customZones.forEach(z => {
        ctx.beginPath(); ctx.moveTo(cx*w, cy*h); ctx.lineTo(z.x*w, z.y*h); ctx.stroke();
      });
    }
    // Zone circles + labels
    customZones.forEach(z => {
      ctx.strokeStyle='rgba(255,255,255,0.2)'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.arc(z.x*w, z.y*h, 20, 0, Math.PI*2); ctx.stroke();
      ctx.fillStyle='#fff'; ctx.font='12px monospace';
      ctx.fillText(z.name, z.x*w+25, z.y*h+5);
    });
  }
}

export default function HeatmapCanvas({ className = '', style = {} }) {
  const canvasRef = useRef(null);
  const venueFormat = useAppStore(s => s.venueFormat);
  const customZones = useAppStore(s => s.customZones);
  const storeZones = useAppStore(s => s.zones);

  // mutable zone data (density lerps each frame)
  const zonesRef = useRef({
    north: { density: 0.72, target: 0.75 },
    south: { density: 0.88, target: 0.90 },
    east:  { density: 0.45, target: 0.40 },
    west:  { density: 0.32, target: 0.35 }
  });

  // Keep internal ref in sync with current store zones to prevent "ghost" dots
  useEffect(() => {
    const nextZones = {};
    const currentKeys = Object.keys(storeZones);
    
    // IF STORE ZONES ARE EMPTY, WE MUST RESET ENTIRELY
    if (currentKeys.length === 0) {
      zonesRef.current = {
        north: { density: 0.1, target: 0.1 },
        south: { density: 0.1, target: 0.1 },
        east:  { density: 0.1, target: 0.1 },
        west:  { density: 0.1, target: 0.1 }
      };
      return;
    }

    currentKeys.forEach(k => {
      nextZones[k] = zonesRef.current[k] || { 
        density: 0.1, 
        target: storeZones[k]?.target || 0.1 
      };
    });
    
    // If we have default zones for stadium/arena, keep them
    if (venueFormat !== 'custom') {
      ['north','south','east','west'].forEach(k => {
        if (!nextZones[k]) nextZones[k] = zonesRef.current[k] || { density:0.1, target:0.1 };
      });
    }

    zonesRef.current = nextZones;
  }, [storeZones, venueFormat]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let rafId;

    function resize() {
      canvas.width  = canvas.offsetWidth  || 300;
      canvas.height = canvas.offsetHeight || 200;
    }
    resize();
    const ro = new ResizeObserver(() => resize());
    ro.observe(canvas);

    function draw() {
      const w = canvas.width, h = canvas.height;
      if (w <= 0 || h <= 0) { rafId = requestAnimationFrame(draw); return; }

      // Sync zone targets from store
      const currentStoreZones = useAppStore.getState().zones;
      Object.keys(currentStoreZones).forEach(k => {
        if (zonesRef.current[k]) zonesRef.current[k].target = currentStoreZones[k].target;
      });

      ctx.clearRect(0,0,w,h);
      ctx.fillStyle='#000'; ctx.fillRect(0,0,w,h);
      drawVenueLayout(ctx, w, h, venueFormat, customZones);

      let zones = [
        { x:0.2, y:0.2, k:'north' }, { x:0.8, y:0.8, k:'south' },
        { x:0.8, y:0.2, k:'east'  }, { x:0.2, y:0.8, k:'west'  }
      ];
      if (venueFormat === 'custom' && customZones) zones = customZones;

      zones.forEach(z => {
        const zd = zonesRef.current[z.k];
        if (!zd) return;
        zd.density = lerp(zd.density, zd.target, 0.02);
        const r = Math.min(w,h) * 0.4;
        const grad = ctx.createRadialGradient(z.x*w, z.y*h, 0, z.x*w, z.y*h, r);
        const i = zd.density;
        const color = i > 0.8 ? '255,77,77' : i > 0.5 ? '245,158,11' : '16,185,129';
        grad.addColorStop(0, `rgba(${color},${i*0.4})`);
        grad.addColorStop(1, `rgba(${color},0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(0,0,w,h);
      });

      rafId = requestAnimationFrame(draw);
    }
    rafId = requestAnimationFrame(draw);

    return () => { cancelAnimationFrame(rafId); ro.disconnect(); };
  }, [venueFormat, customZones]); // Re-draw when format changes

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width:'100%', height:'100%', background:'#000', borderRadius:'10px', display:'block', ...style }}
    />
  );
}
