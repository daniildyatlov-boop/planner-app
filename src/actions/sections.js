import { state } from '../state/state.js';
import { saveState } from '../state/save.js';

export function selectRoomIcon(icon) {
    state.ui.tempIcon = icon;
}

export function createSection(title) {
    createRoom(title, state.ui.tempIcon);
}

export function createRoom(title, icon) {
    if (!title) return;
    state.sections.push({
        id: `room_${Date.now()}`,
        title,
        icon: icon || '📝',
        // No schedule, no auto-creation. Pure template/category.
    });
    saveState();
}

export function deleteSection(id) {
    state.sections = state.sections.filter(s => s.id !== id);
    saveState();
}
