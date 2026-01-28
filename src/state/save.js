import { state } from './state.js';
import { STORAGE_KEY } from '../utils/constants.js';

export function saveState() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
        console.error('Error saving state:', e);
    }
}
