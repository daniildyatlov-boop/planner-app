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
            if (params.title) {
                Tasks.createTask(params);
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
             // Assuming confirmed by event handler logic or pre-check
             if (state.ui.selectedTaskId) {
                 Tasks.deleteTask(state.ui.selectedTaskId);
             }
             break;
             
        case 'SAVE_TASK_EDIT':
            if (params.id && params.updates) {
                Tasks.updateTask(params.id, params.updates);
            }
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
