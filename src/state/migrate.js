import { state } from './state.js';
import { saveState } from './save.js';
import { MIGRATION_KEY } from '../utils/constants.js';

export function migrateData() {
    if (localStorage.getItem(MIGRATION_KEY)) return;

    console.log('🧹 Performing ONE-TIME migration...');
    
    // 1. Remove all auto-generated tasks
    state.plans = state.plans.filter(p => {
        const isRoutine = p.sectionId || p.createdFromSection || p.id?.toString().startsWith('section:');
        return !isRoutine;
    });

    // 2. Fix dates
    state.plans.forEach(p => {
        if (p.date && !p.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
            try {
                p.date = new Date(p.date).toISOString().split('T')[0];
            } catch(e) {}
        }
    });

    // 3. Clear old storage keys
    ['planner_plans', 'planner_sections', 'planner_teams', 'planner_rooms', 'plans', 'teams'].forEach(key => {
        localStorage.removeItem(key);
    });

    localStorage.setItem(MIGRATION_KEY, 'true');
    saveState();
}
