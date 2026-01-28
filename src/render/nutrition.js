import { state } from '../state/state.js';

export function renderNutrition(container) {
    const waterTarget = state.nutrition.water.target;
    const waterCurrent = state.nutrition.water.daily[state.ui.currentDate] || 0;
    const width = Math.min(100, (waterCurrent / waterTarget) * 100);
    
    container.innerHTML = `
        <div class="nutrition-container">
            <div class="water-tracker animate-slide-right">
                <div class="water-header">
                    <div class="water-info">
                        <div class="water-label">💧 Вода сегодня</div>
                        <div class="water-stats">${waterCurrent}/${waterTarget} стаканов</div>
                    </div>
                </div>
                <div class="water-progress">
                    <div class="water-progress-bar">
                        <div class="water-progress-fill" style="width: ${width}%"></div>
                    </div>
                    <div class="water-controls">
                        <button class="water-btn minus" data-action="CHANGE_WATER" data-params='{"delta": -1}'>−</button>
                        <span class="water-current">${waterCurrent}</span>
                        <button class="water-btn plus" data-action="CHANGE_WATER" data-params='{"delta": 1}'>+</button>
                    </div>
                </div>
            </div>
            
            <div style="padding: 20px; text-align: center; color: var(--text-secondary);">
                <p>Трекер питания (Beta)</p>
                <p>Задачи создаются отдельно в разделе Задачи.</p>
            </div>
        </div>
    `;
}
