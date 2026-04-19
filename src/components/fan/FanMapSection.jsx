import { useRef, useEffect } from 'react';

const lerp = (a, b, t) => a + (b - a) * t;

const FAN_ZONES = [
  { name: 'North Concourse', density: 0.4, target: 0.5, x: 0.5, y: 0.2 },
  { name: 'East Gate',       density: 0.7, target: 0.8, x: 0.8, y: 0.5 },
  { name: 'South Food Court',density: 0.9, target: 0.95,x: 0.5, y: 0.8 },
  { name: 'West Entry',      density: 0.2, target: 0.1, x: 0.2, y: 0.5 },
];

function FanHeatmap({ customZones }) {
  const canvasRef = useRef(null);
  const zonesRef  = useRef(((customZones && customZones.length > 0) ? customZones : FAN_ZONES).map(z => ({ ...z })));

  useEffect(() => {
    // If customZones changes (e.g. login), update ref
    const nextZones = (customZones && customZones.length > 0) ? customZones : FAN_ZONES;
    zonesRef.current = nextZones.map(z => ({
      ...z,
      density: z.density || (0.1 + Math.random() * 0.4),
      target: z.target || (0.2 + Math.random() * 0.7)
    }));
  }, [customZones]);

  useEffect(() => {
    const canvas = canvasRef.current;
// ... (rest of useEffect logic same as before)
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let rafId;

    function resize() {
      canvas.width  = canvas.offsetWidth  || 300;
      canvas.height = canvas.offsetHeight || 200;
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    function draw() {
      const w = canvas.width, h = canvas.height;
      if (w <= 0 || h <= 0) { rafId = requestAnimationFrame(draw); return; }

      ctx.clearRect(0,0,w,h);
      ctx.fillStyle='#050508'; ctx.fillRect(0,0,w,h);

      // Stadium outline
      ctx.strokeStyle='rgba(255,255,255,0.05)'; ctx.lineWidth=2;
      ctx.beginPath();
      if (zonesRef.current.length > 0) {
        ctx.roundRect(w*0.05, h*0.05, w*0.9, h*0.9, 20);
      } else {
        ctx.roundRect(w*0.1, h*0.1, w*0.8, h*0.8, 40);
      }
      ctx.stroke();

      zonesRef.current.forEach(z => {
        z.density = lerp(z.density, z.target, 0.005);
        if (Math.abs(z.density - z.target) < 0.01) z.target = 0.1 + Math.random() * 0.8;
        const r = Math.min(w,h) * 0.4;
        if (r > 0) {
          const grad = ctx.createRadialGradient(z.x*w, z.y*h, 0, z.x*w, z.y*h, r);
          const i = z.density;
          const color = i > 0.75 ? '239,68,68' : i > 0.4 ? '245,158,11' : '16,185,129';
          grad.addColorStop(0, `rgba(${color},${i*0.5})`);
          grad.addColorStop(1, `rgba(${color},0)`);
          ctx.fillStyle = grad; ctx.fillRect(0,0,w,h);
        }
      });

      rafId = requestAnimationFrame(draw);
    }
    rafId = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(rafId); ro.disconnect(); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="fan-heatmap"
      style={{ width:'100%', height:'100%', display:'block' }}
    />
  );
}

export default function FanMapSection({ layoutData }) {
  return (
    <>
      <section className="status-card">
        <div className="status-header">
          <span className="pulse-dot" />
          <h2>{layoutData?.name || 'Stadium Overview'}</h2>
        </div>
        <p className="status-text">
          Operational metrics are being processed. Crowd flow is <span className="flow-state">Steady</span>.
        </p>
      </section>

      <section className="insight-section">
        <h3>Live Crowd Map</h3>
        <div className="map-container">
          <FanHeatmap customZones={layoutData?.zones} />
          <div className="map-overlay">
            {(!layoutData || layoutData.name === 'stadium') && (
              <>
                <div className="zone-label north">NORTH TIER</div>
                <div className="zone-label south">SOUTH TIER</div>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
