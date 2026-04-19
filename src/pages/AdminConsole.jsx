import { useEffect } from 'react';
import { VenueDB } from '../db/venueDB';
import { useAppStore } from '../store/useAppStore';
import { useSimulation } from '../hooks/useSimulation';
import LockScreen from '../components/auth/LockScreen';
import AppShell   from '../components/layout/AppShell';

export default function AdminConsole() {
  const isLoggedIn = useAppStore(s => s.isLoggedIn);

  // Boot IndexedDB on mount
  useEffect(() => {
    VenueDB.init().catch(err => console.error('[VenueDB] Init failed:', err));
  }, []);

  // Kick off simulation loops once (always active)
  useSimulation();

  return (
    <>
      <LockScreen />
      {isLoggedIn && <AppShell />}
    </>
  );
}
