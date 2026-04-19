import { useAppStore } from '../../store/useAppStore';
import StatCard from './StatCard';
import MiniAlerts from './MiniAlerts';
import HeatmapCanvas from '../canvas/HeatmapCanvas';

export default function DashboardView() {
  const activeFans  = useAppStore(s => s.activeFans);
  const customZones = useAppStore(s => s.customZones);
  const staff       = useAppStore(s => s.staff);
  const openPlotter = useAppStore(s => s.openVenuePlotter);
  const setActiveView = useAppStore(s => s.setActiveView);

  const deployedCount = staff.filter(s => s.status !== 'Standby').length;

  return (
    <>
      {/* KPI Row */}
      <div className="grid-container">
        <StatCard
          title="Active Fan Portals Connected"
          value={activeFans}
          trend="Real-time Sync"
          trendDir="down"
        />
        <StatCard
          title="Active Custom Zones"
          value={customZones?.length || 0}
          trend="Operational Plotting"
          trendDir="up"
        />
        <StatCard
          title="Deployed Assets"
          value={deployedCount}
          trend="Staff Monitoring"
          trendDir="down"
        />
      </div>

      {/* Heatmap + Alerts Row */}
      <div className="grid-container" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Venue Heatmap (Real-time)</span>
            <div style={{ display:'flex', gap:'12px' }}>
              <button className="card-action" style={{ color:'var(--accent-indigo)' }} onClick={() => { setActiveView('venue-map'); openPlotter(); }}>
                CREATE CUSTOM
              </button>
              <button className="card-action" onClick={() => setActiveView('venue-map')}>
                FULL MAP
              </button>
            </div>
          </div>
          <div className="heatmap-mini">
            <HeatmapCanvas className="heatmap-canvas" />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Critical Alerts</span>
          </div>
          <MiniAlerts />
        </div>
      </div>
    </>
  );
}
