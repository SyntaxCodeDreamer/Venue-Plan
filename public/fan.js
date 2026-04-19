/* ==========================================================================
   VenueFlow Fan Assistant Logic v1.1 - Dynamic Layouts & Facilities
   ========================================================================== */

const DB_NAME = 'VenueFlowDB';
const DB_VERSION = 2;

const fanState = {
    selectedLayout: null,
    zones: [] // Will be populated from selected layout
};

// --- DATABASE LAYER ---
async function openDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onsuccess = (e) => resolve(e.target.result);
        req.onerror = (e) => reject(e.target.error);
    });
}

async function getLayouts() {
    const db = await openDB();
    return new Promise((resolve) => {
        const tx = db.transaction('layouts', 'readonly');
        const store = tx.objectStore('layouts');
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result);
    });
}

// --- UI UTILITIES ---
function getFacilityIcon(name) {
    const n = name.toLowerCase();
    if (n.includes('food') || n.includes('eat') || n.includes('burger')) return '🍔';
    if (n.includes('restroom') || n.includes('toilet') || n.includes('wc')) return '🚻';
    if (n.includes('merch') || n.includes('shop') || n.includes('gift')) return '🎁';
    if (n.includes('gate') || n.includes('entry') || n.includes('exit')) return '🚪';
    if (n.includes('security') || n.includes('police')) return '🛡️';
    if (n.includes('medical') || n.includes('first aid')) return '🏥';
    if (n.includes('ticket')) return '🎫';
    if (n.includes('bar') || n.includes('drink')) return '🍺';
    return '📍';
}

function renderFacilities(zones) {
    const container = document.getElementById('facilities-list');
    if (!container) return;
    container.innerHTML = '';

    zones.forEach(z => {
        const card = document.createElement('div');
        card.className = 'facility-card';
        card.innerHTML = `
            <span class="f-icon">${getFacilityIcon(z.name)}</span>
            <div class="f-info">
                <span class="f-name">${z.name}</span>
                <span class="f-wait low">Calculating...</span>
            </div>
        `;
        container.appendChild(card);
    });
}

// --- CONTEXT INITIALIZATION ---
async function initFanApp() {
    console.log('VenueFlow Fan App Initializing...');

    // 1. Populate Venue Dropdown
    const venueSelect = document.getElementById('fan-venue');
    try {
        const layouts = await getLayouts();
        venueSelect.innerHTML = '<option value="" disabled selected>Select Attending Venue</option>';
        
        // Add Default
        const optDefault = document.createElement('option');
        optDefault.value = 'default';
        optDefault.textContent = 'Main Stadium (Simulation Mode)';
        venueSelect.appendChild(optDefault);

        // Add Custom Layouts
        layouts.forEach(l => {
            const opt = document.createElement('option');
            opt.value = l.id;
            opt.textContent = l.name;
            venueSelect.appendChild(opt);
            // Cache layout data for easy access
            venueSelect.dataset[`layout_${l.id}`] = JSON.stringify(l);
        });
    } catch (err) {
        console.error('Failed to load layouts:', err);
        venueSelect.innerHTML = '<option value="default">Main Stadium (Offline)</option>';
    }

    // 2. Setup Authentication & Login
    const lockScreen = document.getElementById('fan-lock-screen');
    const loginForm = document.getElementById('fan-login-form');
    
    loginForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const tktId = document.getElementById('ticket-id')?.value || 'TKT-0000';
        const fName = document.getElementById('fan-name')?.value || 'VIP Fan';
        const venueId = venueSelect.value;
        
        // Load Layout Data
        let selectedName = "Stadium Overview";
        if (venueId === 'default') {
            selectedName = "Main Stadium";
            fanState.zones = []; // Temporary seed data removed

        } else {
            const layoutData = JSON.parse(venueSelect.dataset[`layout_${venueId}`] || '{}');
            selectedName = layoutData.name || "Custom Venue";
            fanState.zones = layoutData.zones.map(z => ({
                ...z,
                density: Math.random() * 0.5,
                target: 0.2 + Math.random() * 0.6
            }));
        }

        // Update UI
        document.getElementById('venue-title').textContent = selectedName;
        document.getElementById('ticket-display-id').textContent = tktId;
        document.getElementById('ticket-display-name').textContent = fName;
        renderFacilities(fanState.zones);
        
        let count = parseInt(localStorage.getItem('venueflow_active_fans') || '0', 10);
        localStorage.setItem('venueflow_active_fans', count + 1);

        // Unlock screen
        lockScreen.style.opacity = '0';
        setTimeout(() => lockScreen.style.display = 'none', 500);

        // Heartbeat reporter (Legacy)
        const sessionId = Math.random().toString(36).substring(2, 10);
        const heartbeatKey = `vf_heartbeat_${sessionId}`;
        const report = () => localStorage.setItem(heartbeatKey, Date.now().toString());
        
        report();
        setInterval(report, 5000);
        window.addEventListener('beforeunload', () => localStorage.removeItem(heartbeatKey));
    });


    // 3. Setup Tab Navigation
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.fan-section');
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetId = item.dataset.target;
            if (!targetId) return;
            
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            sections.forEach(sec => {
                sec.style.display = 'none';
                sec.classList.remove('active');
            });
            
            const targetSec = document.getElementById(targetId);
            if (targetSec) {
                targetSec.style.display = 'block';
                targetSec.classList.add('active');
            }
        });
    });

    // 4. Setup Simulation & Canvas
    setInterval(() => {
        const waits = document.querySelectorAll('.f-wait');
        waits.forEach(w => {
            if (Math.random() > 0.6) {
                const time = 2 + Math.floor(Math.random() * 15);
                w.textContent = `${time} min wait`;
                w.className = `f-wait ${time > 10 ? 'high' : time > 5 ? 'med' : 'low'}`;
            }
        });
    }, 4000);

    const canvas = document.getElementById('fan-heatmap');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const lerp = (a, b, t) => a + (b - a) * t;

    function resize() {
        canvas.width = canvas.offsetWidth || 300;
        canvas.height = canvas.offsetHeight || 200;
    }
    resize();
    window.addEventListener('resize', resize);

    function draw() {
        const w = canvas.width, h = canvas.height;
        if (w <= 0 || h <= 0) {
            requestAnimationFrame(draw);
            return;
        }

        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#050508';
        ctx.fillRect(0, 0, w, h);
        
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (fanState.zones.length > 0) {
            // Draw a subtle boundary based on points
            ctx.roundRect(w*0.05, h*0.05, w*0.9, h*0.9, 20);
            ctx.stroke();
        } else {
            ctx.roundRect(w*0.1, h*0.1, w*0.8, h*0.8, 40);
            ctx.stroke();
            
            // Draw "Waiting for Data" message
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.font = '14px Outfit, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Awaiting Venue Live Data...', w/2, h/2);
            
            ctx.font = '10px Outfit, sans-serif';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.fillText('Syncing with Operations Console', w/2, h/2 + 25);
        }


        fanState.zones.forEach(z => {
            z.density = lerp(z.density, z.target, 0.005);
            if (Math.abs(z.density - z.target) < 0.01) z.target = 0.1 + Math.random() * 0.8;

            const r = Math.min(w, h) * 0.4;
            if (r > 0) {
                const grad = ctx.createRadialGradient(z.x*w, z.y*h, 0, z.x*w, z.y*h, r);
                const intensity = z.density;
                const color = intensity > 0.75 ? '239, 68, 68' : intensity > 0.4 ? '245, 158, 11' : '16, 185, 129';
                grad.addColorStop(0, `rgba(${color}, ${intensity * 0.5})`);
                grad.addColorStop(1, `rgba(${color}, 0)`);
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, w, h);
                
                // Optional: Point indicator
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(z.x*w, z.y*h, 2, 0, Math.PI*2);
                ctx.fill();
            }
        });

        requestAnimationFrame(draw);
    }
    draw();
}

document.addEventListener('DOMContentLoaded', initFanApp);
