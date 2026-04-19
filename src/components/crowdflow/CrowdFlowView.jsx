import { useRef, useEffect } from 'react';

const DRIFT_DATA = [
  { label: 'Sec N:', value: '+2.1%', color: 'var(--accent-green)' },
  { label: 'Sec S:', value: '+12.4%', color: 'var(--accent-red)' },
  { label: 'Sec E:', value: '-1.2%', color: 'var(--accent-yellow)' },
];

function FlowCanvas() {
  const canvasRef = useRef(null);
  const waveRef   = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let rafId;

    function resize() {
      canvas.width  = canvas.offsetWidth  || 600;
      canvas.height = canvas.offsetHeight || 300;
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    function draw() {
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0,0,w,h);
      ctx.fillStyle='#000'; ctx.fillRect(0,0,w,h);

      // Grid lines
      ctx.strokeStyle='rgba(255,255,255,0.04)'; ctx.lineWidth=1;
      for (let x=0; x<w; x+=40) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke(); }
      for (let y=0; y<h; y+=30) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }

      // Surge wave — 3 sine waves layered
      const waves = [
        { color:'rgba(99,102,241,0.7)',  amp:0.25, freq:0.012, phase:0      },
        { color:'rgba(168,85,247,0.45)', amp:0.18, freq:0.018, phase:1.2    },
        { color:'rgba(0,245,255,0.3)',   amp:0.12, freq:0.022, phase:2.5    },
      ];

      waves.forEach(({ color, amp, freq, phase }) => {
        ctx.beginPath();
        for (let x=0; x<=w; x++) {
          const y = h*0.5 + Math.sin(x*freq + waveRef.current + phase) * h*amp
                           + Math.sin(x*freq*1.7 + waveRef.current*0.9) * h*amp*0.4;
          x === 0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
        }
        ctx.strokeStyle=color; ctx.lineWidth=2.5; ctx.stroke();

        // Fill under wave
        ctx.lineTo(w,h); ctx.lineTo(0,h); ctx.closePath();
        const grad = ctx.createLinearGradient(0,0,0,h);
        // Strip existing alpha and build a new rgba with reduced opacity for the fill
        const fillColor = color.replace(/,[\d.]+\)$/, ', 0.08)');
        grad.addColorStop(0, fillColor);
        grad.addColorStop(1,'rgba(0,0,0,0)');
        ctx.fillStyle=grad; ctx.fill();
      });

      // Axis labels
      ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.font='10px monospace';
      ['NOW','T+10m','T+20m','T+30m'].forEach((l,i) => {
        ctx.fillText(l, (w/(3))*i + 8, h-8);
      });

      waveRef.current += 0.025;
      rafId = requestAnimationFrame(draw);
    }
    rafId = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(rafId); ro.disconnect(); };
  }, []);

  return <canvas ref={canvasRef} style={{ width:'100%', height:'300px', display:'block', background:'#000', borderRadius:'12px' }} />;
}

export default function CrowdFlowView() {
  return (
    <div className="grid-container">
      <div className="card card-2x" style={{ gridColumn:'span 2' }}>
        <div className="card-header">
          <span className="card-title">Real-time Surge Prediction</span>
        </div>
        <FlowCanvas />
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Active Sector Drift</span>
        </div>
        <div style={{ fontFamily:'var(--mono)', fontSize:'0.8rem' }}>
          {DRIFT_DATA.map(d => (
            <div key={d.label} style={{ display:'flex', justifyContent:'space-between', padding:'4px 0' }}>
              <span>{d.label}</span>
              <span style={{ color: d.color }}>{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
