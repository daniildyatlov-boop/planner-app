import { state, setState, initialState } from './state.js';
import { STORAGE_KEY } from '../utils/constants.js';

export function loadState() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            // Merge with initial state to ensure structure
            // Use deep merge for nested objects like ui/nutrition if necessary, 
            // but for now simple spread with specific sub-objects is enough
            const merged = { 
                ...initialState, 
                ...parsed, 
                ui: { ...initialState.ui, ...(parsed.ui || {}) },
                nutrition: { ...initialState.nutrition, ...(parsed.nutrition || {}) }
            };
            setState(merged);
        }
    } catch (e) {
        console.error('Error loading state:', e);
        setState(JSON.parse(JSON.stringify(initialState)));
    }
}
