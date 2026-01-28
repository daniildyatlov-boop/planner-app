import { state } from '../state/state.js';
import { closeModals } from './ui.js';

export function createTask({ title, time, room, date }) {
    if (!title) return;
    const newTask = {
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        title,
        date: date || state.ui.currentDate,
        time: time || '',
        room: room || 'Дом',
        completed: false,
        createdAt: new Date().toISOString()
    };
    state.plans.push(newTask);
    closeModals();
}

export function toggleTask(id) {
    const task = state.plans.find(p => p.id === id);
    if (task) task.completed = !task.completed;
}

export function deleteTask(id) {
    state.plans = state.plans.filter(p => p.id !== id);
    closeModals();
}

export function updateTask(id, updates) {
    const task = state.plans.find(p => p.id === id);
    if (task) {
        Object.assign(task, updates);
    }
    closeModals();
}
