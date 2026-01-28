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
    
    // 4. Sections List (in Sections Screen)
    renderSectionsList();
}

export function renderSectionsList() {
    const list = document.getElementById('sectionsList');
    if (!list) return;
    
    if (state.sections.length === 0) {
        list.innerHTML = '<div style="text-align:center; padding:20px; color:var(--text-secondary);">Нет разделов</div>';
        return;
    }
    
    let html = '';
    state.sections.forEach(section => {
        html += `
            <div class="section-item" style="display:flex; align-items:center; padding:15px; border-bottom:1px solid var(--border-primary); justify-content:space-between;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <div style="font-size:24px;">${section.icon || '📝'}</div>
                    <div style="font-weight:500;">${section.title}</div>
                </div>
                <button class="delete-btn-small" style="background:none; border:none; color:var(--text-secondary);" 
                        data-action="DELETE_SECTION" data-params='{"id": "${section.id}"}'>✕</button>
            </div>
        `;
    });
    list.innerHTML = html;
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
