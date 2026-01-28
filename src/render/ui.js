import { state } from '../state/state.js';
import { formatDate, formatDateSubtitle } from '../utils/date.js';

export function renderHeader() {
    const date = new Date(state.ui.currentDate);
    const dayTitle = document.getElementById('dayTitle');
    const daySubtitle = document.getElementById('daySubtitle');
    if (dayTitle) dayTitle.textContent = formatDate(date);
    if (daySubtitle) daySubtitle.textContent = formatDateSubtitle(date);
}

export function renderNav() {
    document.querySelectorAll('.nav-item').forEach(item => {
        let action = null;
        try {
             if (item.dataset.params) {
                 action = JSON.parse(item.dataset.params).tab;
             }
        } catch(e) {}
        
        if (action === state.ui.currentTab) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

export function renderModals() {
    // Hide all known screens/modals first
    const modals = [
        'addModal', 'overlay', 'editPlanScreen', 'profileScreen', 'roomsScreen', 'popup', 'addRoomModal'
    ];
    
    modals.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    
    const menu = document.getElementById('menu');
    if (menu) menu.classList.remove('active');
    
    // Show active
    const active = state.ui.activeModal;
    if (!active) return;
    
    if (active === 'add') {
        const el = document.getElementById('addModal');
        if (el) el.style.display = 'flex';
    } else if (active === 'menu') {
        const el = document.getElementById('overlay');
        if (el) el.style.display = 'flex';
        if (menu) {
             // Use timeout to allow display:flex to apply before adding class for animation
             setTimeout(() => menu.classList.add('active'), 10);
        }
    } else if (active === 'edit') {
        const el = document.getElementById('editPlanScreen');
        if (el) {
            el.style.display = 'block';
            populateEditScreen();
        }
    } else if (active === 'profile') {
        const el = document.getElementById('profileScreen');
        if (el) el.style.display = 'block';
    } else if (active === 'rooms') {
        const el = document.getElementById('roomsScreen');
        if (el) el.style.display = 'block';
    } else if (active === 'add_room') {
        const el = document.getElementById('addRoomModal');
        if (el) el.style.display = 'flex';
    } else if (active === 'popup') {
        const el = document.getElementById('popup');
        if (el) {
             el.style.display = 'flex';
             const p = state.ui.popup;
             if (p) {
                 const titleEl = el.querySelector('.popup-title');
                 const msgEl = el.querySelector('.popup-message');
                 const btnsEl = el.querySelector('.popup-buttons');
                 if (titleEl) titleEl.textContent = p.title;
                 if (msgEl) msgEl.innerHTML = p.message;
                 if (btnsEl) {
                     btnsEl.innerHTML = '';
                     p.buttons.forEach(btn => {
                         const button = document.createElement('button');
                         button.className = `popup-btn ${btn.type || 'confirm'}`;
                         button.textContent = btn.text;
                         if (btn.action) {
                             button.dataset.action = btn.action;
                             if (btn.params) {
                                 button.dataset.params = JSON.stringify(btn.params);
                             }
                         } else {
                             button.dataset.action = 'HIDE_POPUP';
                         }
                         btnsEl.appendChild(button);
                     });
                 }
             }
        }
    }
}

function populateEditScreen() {
    const task = state.plans.find(p => p.id === state.ui.selectedTaskId);
    if (!task) return;
    
    const title = document.getElementById('editPlanTitle');
    const time = document.getElementById('editPlanTime');
    const date = document.getElementById('editPlanDate');
    const id = document.getElementById('editPlanId'); // Hidden input?
    
    if (title) title.value = task.title;
    if (time) time.value = task.time || '';
    if (date) date.textContent = formatDate(task.date);
    // We might need to store ID somewhere to save.
    // I'll add a hidden input or just rely on selectedTaskId in state.
}
