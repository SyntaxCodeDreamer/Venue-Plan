/* ==========================================================================
   VenueFlow — IndexedDB Database Layer v2.0 (ES Module)
   ========================================================================== */

const DB_NAME    = 'VenueFlowDB';
const DB_VERSION = 2;
let db = null;

const S = {
  USERS: 'users', SESSIONS: 'sessions', ZONES: 'zones',
  ALERTS: 'alerts', STAFF: 'staff', LAYOUTS: 'layouts'
};

const SEED_USERS = [
  { username: 'admin',    password: 'venue404',  role: 'admin',    assignedLayoutId: null },
  { username: 'security', password: 'alpha123',  role: 'security', assignedLayoutId: null },
  { username: 'manager',  password: 'flow2026',  role: 'manager',  assignedLayoutId: null }
];
const SEED_ALERTS = [];

const SEED_STAFF = [];


function openDB() {
  return new Promise((resolve, reject) => {
    if (db) { resolve(db); return; }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const idb = e.target.result;
      const old = e.oldVersion;
      if (old < 1) {
        idb.createObjectStore(S.USERS,    { keyPath: 'username' });
        idb.createObjectStore(S.SESSIONS, { keyPath: 'id' });
        idb.createObjectStore(S.ZONES,    { keyPath: 'id', autoIncrement: true });
        const aStore = idb.createObjectStore(S.ALERTS, { keyPath: 'id', autoIncrement: true });
        aStore.createIndex('time', 'time', { unique: false });
        idb.createObjectStore(S.STAFF, { keyPath: 'name' });
      }
      if (old < 2) {
        if (!idb.objectStoreNames.contains(S.LAYOUTS))
          idb.createObjectStore(S.LAYOUTS, { keyPath: 'id', autoIncrement: true });
      }
    };
    req.onsuccess = async (e) => {
      db = e.target.result;
      await _seedIfEmpty();
      resolve(db);
    };
    req.onerror = () => reject(req.error);
  });
}

function store(name, mode = 'readonly') {
  return db.transaction(name, mode).objectStore(name);
}
function p(req) {
  return new Promise((res, rej) => {
    req.onsuccess = () => res(req.result);
    req.onerror   = () => rej(req.error);
  });
}

async function _seedIfEmpty() {
  const uc = await p(store(S.USERS).count());
  
  // Wipe old simulated data once to ensure a clean slate for the user
  if (!localStorage.getItem('vf_db_cleaned_v2')) {
    await VenueDB.clearAlerts();
    // Keep staff for now or clear it? User said "all temporary data"
    const tx = db.transaction(S.STAFF, 'readwrite');
    await p(tx.objectStore(S.STAFF).clear());
    localStorage.setItem('vf_db_cleaned_v2', 'true');
  }

  if (uc === 0) { const us = store(S.USERS, 'readwrite');  SEED_USERS.forEach(u  => us.put(u)); }
  // Simulated alerts and staff seeding removed
}


export const VenueDB = {
  async init() { await openDB(); },

  // USERS
  getUser(username)    { return p(store(S.USERS).get(username.toLowerCase())); },
  addUser(username, password, role = 'coordinator', assignedLayoutId = null) {
    return p(store(S.USERS, 'readwrite').put({ username: username.toLowerCase(), password, role, assignedLayoutId }));
  },
  getAllUsers()         { return p(store(S.USERS).getAll()); },
  deleteUser(username) { return p(store(S.USERS, 'readwrite').delete(username.toLowerCase())); },

  // SESSIONS
  saveSession(username, venueName) {
    return p(store(S.SESSIONS, 'readwrite').put({ id: 'current', username, venueName, loginTime: new Date().toISOString() }));
  },
  getSession()  { return p(store(S.SESSIONS).get('current')); },
  clearSession(){ return p(store(S.SESSIONS, 'readwrite').delete('current')); },

  // ZONES
  async saveZones(zones) {
    await p(store(S.ZONES, 'readwrite').clear());
    const st = store(S.ZONES, 'readwrite');
    for (const z of zones) { const { id, ...rest } = z; st.add(rest); }
  },
  getZones()  { return p(store(S.ZONES).getAll()); },
  clearZones(){ return p(store(S.ZONES, 'readwrite').clear()); },

  // LAYOUTS
  saveLayout(name, zones) {
    return p(store(S.LAYOUTS, 'readwrite').add({ name, zones, createdAt: new Date().toISOString() }));
  },
  getLayout(id)  { return p(store(S.LAYOUTS).get(Number(id))); },
  getLayouts()   { return p(store(S.LAYOUTS).getAll()); },
  deleteLayout(id){ return p(store(S.LAYOUTS, 'readwrite').delete(Number(id))); },

  // ALERTS
  addAlert(alert) { const { id, ...rest } = alert; return p(store(S.ALERTS, 'readwrite').add(rest)); },
  async getAlerts() { const all = await p(store(S.ALERTS).getAll()); return all.reverse(); },
  clearAlerts(){ return p(store(S.ALERTS, 'readwrite').clear()); },

  // STAFF
  getStaff()              { return p(store(S.STAFF).getAll()); },
  updateStaffUnit(member) { return p(store(S.STAFF, 'readwrite').put(member)); }
};
