import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import { useAppStore } from '../../store/useAppStore';

// Views
import DashboardView    from '../dashboard/DashboardView';
import VenueMapView     from '../venue/VenueMapView';
import CrowdFlowView    from '../crowdflow/CrowdFlowView';
import SecurityView     from '../security/SecurityView';
import StaffView        from '../staff/StaffView';
import AlertsView       from '../alerts/AlertsView';
import CoordinatorView  from '../coordinator/CoordinatorView';

// Modals
import VenuePlotter  from '../canvas/VenuePlotter';
import DispatchModal from '../staff/DispatchModal';

const VIEWS = {
  'dashboard':        DashboardView,
  'venue-map':        VenueMapView,
  'crowd-flow':       CrowdFlowView,
  'security':         SecurityView,
  'staff':            StaffView,
  'alerts':           AlertsView,
  'coordinator-mgmt': CoordinatorView,
};

export default function AppShell() {
  const activeView = useAppStore(s => s.activeView);

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-wrapper">
        <TopHeader />
        <div className="content-outlet">
          {Object.entries(VIEWS).map(([id, ViewComponent]) => (
            <section
              key={id}
              className={`view-section ${activeView === id ? 'active' : ''}`}
            >
              <ViewComponent />
            </section>
          ))}
        </div>
      </main>

      {/* Global Modals */}
      <VenuePlotter />
      <DispatchModal />
    </div>
  );
}
