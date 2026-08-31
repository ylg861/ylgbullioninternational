/* ═══════════════════════════════════════════════════
   notifications-bell.js — YLG Bullion
   Floating notification bell for logged-in users.
   Add to pages: <script type="module" src="notifications-bell.js"></script>
   ═══════════════════════════════════════════════════ */
import { auth, db } from './firebase-init.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { collection, query, where, onSnapshot }
    from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

let _unsub = null, _notifs = [], _open = false, _knownIds = new Set();

onAuthStateChanged(auth, user => {
    if (user) { buildBell(); subscribe(user); }
    else { destroy(); }
});

/* ── Push permission ── */
function requestPushPermission() {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

/* ── Build UI ── */
function buildBell() {
    if (document.getElementById('ylg-bell-overlay')) return;
    requestPushPermission();
    document.body.insertAdjacentHTML('beforeend', `
        <div id="ylg-bell-overlay"
            onclick="if(event.target===this)window._ylgBellClose()"
            style="display:none;position:fixed;inset:0;z-index:9001;background:rgba(0,0,0,0.5);">
            <div id="ylg-bell-panel" style="
                position:absolute;top:0;right:0;
                width:320px;max-width:100vw;height:100%;
                background:#111;border-left:2px solid #C9A84C;
                display:flex;flex-direction:column;
                transform:translateX(100%);transition:transform 0.24s ease;">

                <!-- Header -->
                <div style="padding:14px 16px;border-bottom:1px solid #222;
                            display:flex;justify-content:space-between;align-items:center;flex-shrink:0;">
                    <span style="color:#C9A84C;font-weight:700;font-size:14px;">
                        <i class="fas fa-bell" style="margin-right:7px;"></i>Notifications
                    </span>
                    <div style="display:flex;gap:6px;align-items:center;">
                        <button onclick="window._ylgMarkRead()" style="
                            background:none;border:1px solid #2a2a2a;color:#555;
                            padding:3px 9px;border-radius:5px;cursor:pointer;font-size:11px;
                            font-family:inherit;transition:color 0.15s;"
                            onmouseover="this.style.color='#C9A84C'"
                            onmouseout="this.style.color='#555'">Mark read</button>
                        <button onclick="window._ylgBellClose()" style="
                            background:none;border:none;color:#444;cursor:pointer;
                            font-size:17px;line-height:1;padding:2px 4px;
                            transition:color 0.15s;"
                            onmouseover="this.style.color='#fff'"
                            onmouseout="this.style.color='#444'">✕</button>
                    </div>
                </div>

                <!-- List -->
                <div id="ylg-bell-list" style="flex:1;overflow-y:auto;"></div>
            </div>
        </div>
    `);
}

function destroy() {
    if (typeof _unsub === 'function') _unsub();
    const ov = document.getElementById('ylg-bell-overlay');
    if (ov) ov.remove();
    const dot = document.getElementById('mobile-bell-dot');
    if (dot) dot.style.display = 'none';
}

/* ── Firestore subscription ── */
function subscribe(user) {
    if (typeof _unsub === 'function') _unsub();
    const q = query(
        collection(db, 'notifications'),
        where('targetUserId', 'in', ['all', user.uid])
    );
    const isFirstLoad = { v: true };
    _unsub = onSnapshot(q, snap => {
        const incoming = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        _notifs = incoming.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

        if (!isFirstLoad.v) {
            // Show browser push for brand-new notifications
            incoming.forEach(n => {
                if (!_knownIds.has(n.id) && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
                    new Notification(n.title || 'YLG Bullion', {
                        body: n.message || '',
                        icon: '/icon-192.png',
                        badge: '/favicon-32.png'
                    });
                }
            });
        }
        incoming.forEach(n => _knownIds.add(n.id));
        isFirstLoad.v = false;

        updateBadge();
        if (_open) render();
    }, () => {});
}

/* ── Panel open / close ── */
window._ylgBellToggle = () => { _open ? closeBell() : openBell(); };
window._ylgBellClose  = closeBell;
window._ylgMarkRead   = () => {
    localStorage.setItem('ylg_nr', Date.now().toString());
    updateBadge();
    if (_open) render();
};

function openBell() {
    const ov = document.getElementById('ylg-bell-overlay');
    const pn = document.getElementById('ylg-bell-panel');
    if (!ov || !pn) return;
    _open = true;
    ov.style.display = 'block';
    requestAnimationFrame(() => { pn.style.transform = 'translateX(0)'; });
    render();
}

function closeBell() {
    const ov = document.getElementById('ylg-bell-overlay');
    const pn = document.getElementById('ylg-bell-panel');
    if (!ov || !pn) return;
    _open = false;
    pn.style.transform = 'translateX(100%)';
    setTimeout(() => { ov.style.display = 'none'; }, 240);
}

/* ── Badge ── */
function updateBadge() {
    const dot = document.getElementById('mobile-bell-dot');
    if (!dot) return;
    const last = parseFloat(localStorage.getItem('ylg_nr') || '0');
    const n = _notifs.filter(x => (x.createdAt?.seconds || 0) * 1000 > last).length;
    dot.style.display = n > 0 ? 'block' : 'none';
}

/* ── Render list ── */
const ICONS = {
    kyc:          'fa-id-card:#9C27B0',
    deposit:      'fa-arrow-down:#4CAF50',
    withdrawal:   'fa-arrow-up:#FF9800',
    trade:        'fa-chart-line:#2196F3',
    announcement: 'fa-bullhorn:#C9A84C',
};

function timeAgo(ts) {
    const ms = (ts?.seconds || 0) * 1000;
    if (!ms) return '';
    const d = Date.now() - ms;
    if (d < 60e3)    return 'Just now';
    if (d < 3600e3)  return Math.floor(d / 60e3) + 'm ago';
    if (d < 86400e3) return Math.floor(d / 3600e3) + 'h ago';
    return new Date(ms).toLocaleDateString();
}

function esc(s) {
    return String(s || '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function render() {
    const list = document.getElementById('ylg-bell-list');
    if (!list) return;
    const last = parseFloat(localStorage.getItem('ylg_nr') || '0');

    if (!_notifs.length) {
        list.innerHTML = `
            <div style="text-align:center;color:#444;padding:50px 20px;">
                <i class="fas fa-bell-slash" style="font-size:30px;display:block;margin-bottom:10px;color:#333;"></i>
                No notifications yet
            </div>`;
        return;
    }

    list.innerHTML = _notifs.map(n => {
        const isNew   = (n.createdAt?.seconds || 0) * 1000 > last;
        const [ico, col] = (ICONS[n.type] || ICONS.announcement).split(':');
        return `
        <div style="padding:12px 16px;border-bottom:1px solid #1c1c1c;
                    display:flex;gap:10px;align-items:flex-start;
                    ${isNew ? 'background:rgba(201,168,76,0.05);' : ''}">
            <div style="width:34px;height:34px;border-radius:50%;
                        background:${col}22;flex-shrink:0;
                        display:flex;align-items:center;justify-content:center;">
                <i class="fas ${ico}" style="color:${col};font-size:13px;"></i>
            </div>
            <div style="flex:1;min-width:0;">
                <div style="font-size:13px;font-weight:${isNew ? '700' : '500'};
                            color:${isNew ? '#eee' : '#bbb'};
                            line-height:1.3;margin-bottom:3px;">${esc(n.title)}</div>
                <div style="font-size:12px;color:#777;line-height:1.5;">${esc(n.message)}</div>
                <div style="font-size:10px;color:#444;margin-top:5px;">${timeAgo(n.createdAt)}</div>
            </div>
            ${isNew ? '<div style="width:7px;height:7px;border-radius:50%;background:#C9A84C;flex-shrink:0;margin-top:6px;"></div>' : ''}
        </div>`;
    }).join('');
}
