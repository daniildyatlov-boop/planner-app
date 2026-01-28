import { state } from '../state/state.js';

export function selectRoomIcon(icon) {
    state.ui.tempIcon = icon;
}

export function createRoom(title, icon) {
    if (!title) return;
    state.sections.push({
        id: `room_${Date.now()}`,
        title,
        icon: icon || '📝'
    });
}
