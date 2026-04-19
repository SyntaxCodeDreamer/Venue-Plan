import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

const clamp = (v, mn, mx) => Math.max(mn, Math.min(mx, v));

export function useSimulation() {
  const setAttendance    = useAppStore(s => s.setAttendance);
  const setBaseWait      = useAppStore(s => s.setBaseWait);
  const updateZoneTargets = useAppStore(s => s.updateZoneTargets);
  const setActiveFans    = useAppStore(s => s.setActiveFans);

  useEffect(() => {
    const simId = setInterval(() => {
      // Only simulate growth if there are active portals or historical connections
      const activeCount = useAppStore.getState().activeFans;
      if (activeCount > 0) {
        setAttendance(n => n + Math.floor(Math.random() * 5));
        setBaseWait(w => clamp(w + (Math.random() - 0.5) * 0.2, 1, 15));
      }

      updateZoneTargets(zones => {
        const next = {};
        Object.keys(zones).forEach(k => {
          next[k] = {
            ...zones[k],
            target: clamp(zones[k].target + (Math.random() - 0.5) * 0.05, 0.1, 0.95)
          };
        });
        return next;
      });
    }, 3000);

    const fanId = setInterval(() => {
      // Accurate real-time tracking via heartbeat keys
      const now = Date.now();
      let activeCount = 0;
      
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('vf_heartbeat_')) {
            const timestamp = parseInt(localStorage.getItem(key) || '0', 10);
            // Expire heartbeats older than 15 seconds
            if (now - timestamp < 15000) {
              activeCount++;
            } else if (now - timestamp > 60000) {
              // Cleanup very old stale heartbeats
              localStorage.removeItem(key);
            }
          }
        }
      } catch (e) {
        console.warn('Heartbeat scan failed:', e);
      }

      // If no heartbeats found, fall back to the legacy counter (optional)
      // but the goal is to move to real-time.
      const fallbackCount = parseInt(localStorage.getItem('venueflow_active_fans') || '0', 10);
      setActiveFans(activeCount > 0 ? activeCount : fallbackCount);
    }, 2000);

    return () => { clearInterval(simId); clearInterval(fanId); };

  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
