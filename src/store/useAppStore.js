import { create } from 'zustand';

export const useAppStore = create((set) => ({
  // ── Simulation ────────────────────────────────────────────────────────
  attendance: 0,
  baseWait: 0,

  activeFans: 0,
  isAlertMode: false,
  activeView: 'dashboard',

  // ── Heatmap zones (density lerped in rAF, target updated by simulation) ─
  zones: {},


  // ── Venue ─────────────────────────────────────────────────────────────
  venueFormat: 'stadium',
  customZones: null,

  // ── Data ──────────────────────────────────────────────────────────────
  alerts: [],
  staff: [],

  // ── Auth ──────────────────────────────────────────────────────────────
  isLoggedIn: false,
  session: null, // { username, venueName, role, assignedLayoutId }

  // ── Modal flags ───────────────────────────────────────────────────────
  isVenuePlotterOpen: false,
  isDispatchOpen: false,

  // ── Actions ───────────────────────────────────────────────────────────
  setActiveView: (view) => set({ activeView: view }),
  setAlertMode: (mode) => set({ isAlertMode: mode }),
  setActiveFans: (n) => set({ activeFans: n }),
  setSession: (session) => set({ session, isLoggedIn: true }),
  clearSession: () => set({ session: null, isLoggedIn: false }),
  setAlerts: (alerts) => set({ alerts }),
  addAlert: (alert) => set((s) => ({ alerts: [alert, ...s.alerts] })),
  setStaff: (staff) => set({ staff }),
  updateStaffUnit: (unit) => set((s) => ({
    staff: s.staff.map(u => u.name === unit.name ? { ...u, ...unit } : u)
  })),
  addStaffUnit: (unit) => set((s) => ({
    staff: [...s.staff, unit]
  })),
  setCustomZones: (zones) => set({ customZones: zones }),
  setVenueFormat: (fmt) => set({ venueFormat: fmt }),
  setAttendance: (fn) => set((s) => ({ attendance: typeof fn === 'function' ? fn(s.attendance) : fn })),
  setBaseWait: (fn) => set((s) => ({ baseWait: typeof fn === 'function' ? fn(s.baseWait) : fn })),
  updateZoneTargets: (updater) => set((s) => ({ zones: updater(s.zones) })),
  openVenuePlotter: () => set({ isVenuePlotterOpen: true }),
  closeVenuePlotter: () => set({ isVenuePlotterOpen: false }),
  openDispatch: () => set({ isDispatchOpen: true }),
  closeDispatch: () => set({ isDispatchOpen: false }),
  resetLayout: () => set({ venueFormat: 'stadium', customZones: null, zones: {} }),
}));
