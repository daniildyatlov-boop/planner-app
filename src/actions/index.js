import { state } from '../state/state.js';
import * as Tasks from './tasks.js';
import * as UI from './ui.js';
import * as Nutrition from './nutrition.js';
import * as Sections from './sections.js';
import { saveState } from '../state/save.js';

export function handleAction(action, params = {}) {
    console.log(`Action: ${action}`, params);

    switch (action) {
        case 'SWITCH_TAB':
            UI.switchTab(params.tab);
            break;
            
        case 'CHANGE_DATE':
            UI.changeDate(params.days);
            break;
            
        case 'ADD_TASK_MODAL':
            UI.setModal('add');
            break;
            
        case 'CREATE_TASK':
            Tasks.createTask(params);
            break;
            
        case 'CREATE_TASK_FROM_MODAL':
            const titleInput = document.getElementById('planTitle');
            const dateInput = document.getElementById('planDate');
            const timeInput = document.getElementById('planTime');
            const roomInput = document.getElementById('planRoom');
            
            if (titleInput && titleInput.value.trim()) {
                Tasks.createTask({
                    title: titleInput.value.trim(),
                    date: dateInput ? dateInput.value : state.ui.currentDate,
                    time: timeInput ? timeInput.value : '',
                    sectionId: roomInput ? roomInput.value : null
                });
                
                // Clear inputs
                titleInput.value = '';
                if (timeInput) timeInput.value = '';
                if (roomInput) roomInput.value = '';
                
                UI.closeModals();
            }
            break;
            
        case 'TOGGLE_TASK':
            Tasks.toggleTask(params.id);
            break;
            
        case 'DELETE_TASK':
            Tasks.deleteTask(params.id);
            break;
            
        case 'SHOW_TASK_MENU':
            state.ui.selectedTaskId = params.id;
            UI.setModal('menu');
            break;
            
        case 'EDIT_TASK_FROM_MENU':
            UI.setModal('edit');
            break;
            
        case 'DELETE_TASK_FROM_MENU':
            if (state.ui.selectedTaskId) {
                Tasks.deleteTask(state.ui.selectedTaskId);
            }
            break;
            
        case 'DELETE_TASK_FROM_EDIT':
             if (state.ui.selectedTaskId) {
                 Tasks.deleteTask(state.ui.selectedTaskId);
             }
             break;
             
        case 'SAVE_TASK_EDIT':
            if (state.ui.selectedTaskId) {
                const editTitle = document.getElementById('editPlanTitle');
                const editDate = document.getElementById('editPlanDateInput');
                // We can support time if needed, but sticking to basics first
                
                const updates = {};
                if (editTitle) updates.title = editTitle.value.trim();
                if (editDate && editDate.value) updates.date = editDate.value;
                
                // Read toggles
                const notifToggle = document.getElementById('notificationToggle');
                if (notifToggle) updates.notification = notifToggle.classList.contains('active');
                
                const impToggle = document.getElementById('importantToggle');
                if (impToggle) updates.important = impToggle.classList.contains('active');
                
                Tasks.updateTask(state.ui.selectedTaskId, updates);
                UI.closeModals();
            }
            break;
            
        case 'TOGGLE_NOTIFICATION':
            UI.toggleSwitch('notificationToggle');
            break;
            
        case 'TOGGLE_IMPORTANT':
            UI.toggleSwitch('importantToggle');
            break;

        case 'SHOW_SECTIONS':
            UI.setModal('sections');
            break;

        case 'SHOW_ADD_SECTION_MODAL':
            UI.setModal('add_section');
            break;

        case 'CREATE_SECTION_FROM_MODAL':
            const sectionTitle = document.getElementById('newSectionTitle');
            if (sectionTitle && sectionTitle.value.trim()) {
                Sections.createSection(sectionTitle.value.trim()); // Assuming Sections.createSection exists
                sectionTitle.value = '';
                UI.closeModals();
            }
            break;

        case 'DELETE_SECTION':
            Sections.deleteSection(params.id);
            break;
            
        case 'SHOW_PROFILE_MENU':
            UI.setModal('profile');
            break;
            
        case 'HIDE_PROFILE_MENU':
            UI.closeModals();
            break;
            
        case 'SHOW_ROOMS_MODAL':
            UI.setModal('rooms');
            break;
            
        case 'SHOW_ADD_ROOM_MODAL':
            UI.setModal('add_room');
            break;
            
        case 'CLOSE_MODAL':
            UI.closeModals();
            break;
            
        case 'SHOW_POPUP':
            UI.showPopup(params.title, params.message, params.buttons);
            break;
            
        case 'HIDE_POPUP':
            UI.closeModals();
            break;
            
        case 'CHANGE_WATER':
            Nutrition.changeWater(params.delta);
            break;

        case 'SELECT_ROOM_ICON':
             Sections.selectRoomIcon(params.icon);
             break;
             
        case 'CREATE_ROOM_FROM_MODAL':
             const roomTitle = document.getElementById('newRoomTitle');
             if (roomTitle && roomTitle.value.trim()) {
                 Sections.createRoom(roomTitle.value.trim(), state.ui.tempIcon);
                 roomTitle.value = ''; // Clear
                 UI.closeModals();
             }
             break;

        case 'CREATE_ROOM':
             Sections.createRoom(params.title, params.icon);
             UI.setModal('rooms');
             break;
    }
    
    saveState();
}
