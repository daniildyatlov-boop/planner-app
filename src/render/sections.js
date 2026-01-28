import { state } from '../state/state.js';
import { ICONS } from '../utils/constants.js';

export function renderSections() {
    // 1. Dropdown in Add Modal
    const select = document.getElementById('planRoom');
    if (select) {
        const currentVal = select.value;
        let html = '<option value="">Без раздела</option>';
        state.sections.forEach(room => {
            html += `<option value="${room.title}">${room.icon || '📝'} ${room.title}</option>`;
        });
        if (select.innerHTML !== html) select.innerHTML = html;
        if (currentVal && Array.from(select.options).some(o => o.value === currentVal)) {
            select.value = currentVal;
        }
    }
    
    // 2. Rooms Screen
    const list = document.getElementById('roomsList');
    if (list) {
        let html = '';
        state.sections.forEach(room => {
            html += `
                <div class="room-item">
                    <div class="room-icon">${room.icon || '📝'}</div>
                    <div class="room-name">${room.title}</div>
                </div>
            `;
        });
        list.innerHTML = html;
    }

    // 3. Room Icons Grid (in Add Room Modal)
    renderRoomIcons();
}

function renderRoomIcons() {
    const grid = document.getElementById('roomIconsGrid');
    if (!grid) return;
    
    // Use icons from constants
    // We can combine categories or just use rooms category
    const icons = ICONS.rooms || ['🏠', '🛏️', '🍳', '🛁', '💼', '🏃', '📚', '🎮', '🌿', '🔧'];
    
    let html = '';
    icons.forEach(icon => {
        const isSelected = state.ui.tempIcon === icon;
        html += `
            <div class="icon-option ${isSelected ? 'selected' : ''}" 
                 data-action="SELECT_ROOM_ICON" 
                 data-params='{"icon": "${icon}"}'>
                ${icon}
            </div>
        `;
    });
    
    if (grid.innerHTML !== html) grid.innerHTML = html;
}
