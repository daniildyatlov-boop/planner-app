import { state } from '../state/state.js';

export function switchTab(tab) {
    state.ui.currentTab = tab;
}

export function setDate(date) {
    state.ui.currentDate = date;
    state.ui.calendarViewDate = date;
}

export function changeDate(days) {
    const date = new Date(state.ui.currentDate);
    date.setDate(date.getDate() + days);
    state.ui.currentDate = date.toISOString().split('T')[0];
}

export function setModal(modalName) {
    state.ui.activeModal = modalName;
}

export function showPopup(title, message, buttons = []) {
    state.ui.popup = { title, message, buttons };
    state.ui.activeModal = 'popup';
}

export function closeModals() {
    state.ui.activeModal = null;
    state.ui.popup = null;
    state.ui.selectedTaskId = null;
}
