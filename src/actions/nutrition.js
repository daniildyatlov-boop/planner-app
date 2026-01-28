import { state } from '../state/state.js';

export function changeWater(delta) {
    const date = state.ui.currentDate;
    const current = state.nutrition.water.daily[date] || 0;
    const newVal = Math.max(0, current + delta);
    state.nutrition.water.daily[date] = newVal;
}
