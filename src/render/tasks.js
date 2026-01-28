import { state } from '../state/state.js';
import { getPlansForDate, getRoomIcon } from '../utils/helpers.js';
import { escapeHtml } from '../utils/dom.js';

export function renderTasks(container) {
    const plans = getPlansForDate(state.ui.currentDate);
    
    if (plans.length === 0) {
        container.innerHTML = `
            <div class="empty-state" id="empty" style="display: flex;">
                <div class="empty-icon">📝</div>
                <div class="empty-title">Нет задач</div>
                <div class="empty-subtitle">Нажмите +, чтобы добавить задачу</div>
                <button class="add-btn-large" data-action="ADD_TASK_MODAL">
                    Добавить первую задачу
                </button>
            </div>
            <div class="plans-container" id="plansContainer" style="display: none;"></div>
        `;
    } else {
        let html = '<div class="plans-container" id="plansContainer" style="display: flex;"><div class="plans-list" id="plans">';
        
        plans.forEach(plan => {
            html += `
                <div class="plan ${plan.completed ? 'completed' : ''}" data-action="SHOW_TASK_MENU" data-params='{"id": "${plan.id}"}'>
                    <div class="checkbox ${plan.completed ? 'checked' : ''}" 
                         data-action="TOGGLE_TASK" data-params='{"id": "${plan.id}"}'></div>
                    <div class="plan-content">
                        <div class="plan-title">
                            ${plan.time ? `<span class="plan-time-inline">${plan.time}</span>` : ''}${escapeHtml(plan.title)}
                        </div>
                        ${plan.room ? `<div class="room">${getRoomIcon(plan.room)} ${escapeHtml(plan.room)}</div>` : ''}
                    </div>
                </div>
            `;
        });
        
        html += `
            <button class="add-task-btn" data-action="ADD_TASK_MODAL">
                <span class="add-icon">+</span>
                Добавить задачу
            </button>
        `;
        
        html += '</div></div>';
        container.innerHTML = html;
    }
}
