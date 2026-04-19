import { useState } from 'react';
import '../../styles/fan.css';
import FanHeader           from './FanHeader';
import FanNav              from './FanNav';
import FanMapSection       from './FanMapSection';
import FanFacilitiesSection from './FanFacilitiesSection';
import FanTicketSection    from './FanTicketSection';
import FanLockScreen       from '../auth/FanLockScreen';

export default function FanPortal() {
  const [fanInfo,  setFanInfo]  = useState(null);   // null = not yet logged in
  const [activeTab, setActiveTab] = useState('map');
  const [sessionId] = useState(() => {
    let id = sessionStorage.getItem('vf_fan_sid');
    if (!id) {
      id = Math.random().toString(36).substring(2, 10);
      sessionStorage.setItem('vf_fan_sid', id);
    }
    return id;
  });

  // Heartbeat reporter
  useEffect(() => {
    if (!fanInfo) return;
    
    const heartbeatKey = `vf_heartbeat_${sessionId}`;
    const report = () => localStorage.setItem(heartbeatKey, Date.now().toString());
    
    report();
    const interval = setInterval(report, 5000);
    
    return () => {
      clearInterval(interval);
      localStorage.removeItem(heartbeatKey); // Cleanup on unmount (navigation)
    };
  }, [fanInfo, sessionId]);

  if (!fanInfo) {
    return <FanLockScreen onUnlock={(info) => setFanInfo(info)} />;
  }


  return (
    <div className="fan-app">
      <FanHeader venueName={fanInfo.venueLabel} />

      <main className="fan-main">
        {activeTab === 'map' && (
          <div className="fan-section active">
            <FanMapSection layoutData={fanInfo.layoutData} />
          </div>
        )}
        {activeTab === 'facilities' && (
          <div className="fan-section active">
            <FanFacilitiesSection layoutData={fanInfo.layoutData} />
          </div>
        )}
        {activeTab === 'tickets' && (
          <div className="fan-section active">
            <FanTicketSection fanInfo={fanInfo} />
          </div>
        )}
      </main>

      <FanNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
