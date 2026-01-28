import { state } from '../state/state.js';
import { ICONS } from './constants.js';

export function getPlansForDate(dateStr) {
    return state.plans
        .filter(p => p.date === dateStr)
        .sort((a, b) => {
            if (a.completed !== b.completed) return a.completed ? 1 : -1;
            if (a.time && b.time) return a.time.localeCompare(b.time);
            if (a.time) return -1;
            if (b.time) return 1;
            return 0;
        });
}

export function getRoomIcon(roomName) {
    const defaults = { 'Дом': '🏠', 'Работа': '💼', 'Спорт': '🏃', 'Питание': '🍽️' };
    return defaults[roomName] || '📝';
}

export function initializeIcons() {
    const mapping = {
        'tasksIcon': ICONS.navigation.tasks,
        'habitsIcon': ICONS.navigation.habits,
        'nutritionIcon': ICONS.navigation.nutrition,
        'roomsBtn': ICONS.navigation.home,
        'profileIcon': ICONS.navigation.profile,
        'settingsIcon': ICONS.navigation.settings
    };
    
    for (const [id, icon] of Object.entries(mapping)) {
        const el = document.getElementById(id);
        if (el) el.textContent = icon;
    }
}
export { initializeIcons as initIcons };
