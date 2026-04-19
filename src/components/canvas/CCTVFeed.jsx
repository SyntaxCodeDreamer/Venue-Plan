import { useRef, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';

export default function CCTVFeed({ name }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let rafId;

    function drawNoise() {
      const { activeView } = useAppStore.getState();
      if (activeView !== 'security' && activeView !== 'dashboard') {
        rafId = setTimeout(drawNoise, 1000);
        return;
      }
      canvas.width  = canvas.offsetWidth  || 300;
      canvas.height = canvas.offsetHeight || 200;
      if (canvas.width > 0 && canvas.height > 0) {
        const idata = ctx.createImageData(canvas.width, canvas.height);
        const data = idata.data;
        for (let i = 0; i < data.length; i += 4) {
          const v = Math.random() * 25;
          data[i]=v; data[i+1]=v; data[i+2]=v; data[i+3]=255;
        }
        ctx.putImageData(idata, 0, 0);
      }
      rafId = requestAnimationFrame(drawNoise);
    }
    rafId = requestAnimationFrame(drawNoise);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(rafId);
    };
  }, []);

  return (
    <div className="cctv-feed">
      <div className="feed-label">{name}</div>
      <div className="feed-rec">● REC</div>
      <canvas ref={canvasRef} style={{ width:'100%', height:'100%', display:'block' }} />
    </div>
  );
}
