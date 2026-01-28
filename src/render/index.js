import { state } from '../state/state.js';
import { renderTasks } from './tasks.js';
import { renderNutrition } from './nutrition.js';
import { renderHabits } from './habits.js';
import { renderHeader, renderNav, renderModals } from './ui.js';
import { renderSections } from './sections.js';

export function render() {
    renderHeader();
    renderNav();
    renderModals();
    renderSections();
    
    const content = document.querySelector('.content');
    if (!content) return;

    if (state.ui.currentTab === 'tasks') {
        renderTasks(content);
    } else if (state.ui.currentTab === 'nutrition') {
        renderNutrition(content);
    } else if (state.ui.currentTab === 'habits') {
        renderHabits(content);
    }
}
