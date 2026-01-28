'use strict';


// --- CONFIG & CONSTANTS ---
const APP_VERSION = 'v7.0.0-STABLE';
const STORAGE_KEY = 'planner_state_v7';
const MIGRATION_KEY = 'planner_migration_v7_complete';

// TELEGRAM WEB APP INIT
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  tg.enableClosingConfirmation();
  
  if (tg.themeParams) {
    document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#f2f2f7');
    document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#000000');
    document.documentElement.style.setProperty('--tg-theme-hint-color', tg.themeParams.hint_color || '#8e8e93');
    document.documentElement.style.setProperty('--tg-theme-link-color', tg.themeParams.link_color || '#007aff');
    document.documentElement.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color || '#007aff');
    document.documentElement.style.setProperty('--tg-theme-button-text-color', tg.themeParams.button_text_color || '#ffffff');
  }
  
  tg.BackButton.onClick(() => {
    const modals = document.querySelectorAll('.modal, .popup');
    let hasOpenModal = false;
    modals.forEach(m => {
      if (m.style.display === 'flex') {
        m.style.display = 'none';
        hasOpenModal = true;
      }
    });
    
    if (!hasOpenModal) {
      tg.close();
    } else {
        tg.BackButton.hide();
    }
  });
}

const ICONS = {
  rooms: ['🏠', '🛏️', '🍳', '🛁', '💼', '🏃', '📚', '🎮', '🌿', '🔧'],
  activities: ['🎯', '🎨', '🎵', '🏋️', '🧘', '🍕', '☕', '🌟', '💡', '🔥'],
  special: ['🎪', '🎭', '🎬', '📱', '💻', '🎸', '🎹', '🎤', '🎫', '📷'],
  travel: ['✈️', '🚗', '🏖️', '🏔️', '🌊', '🌙', '☀️', '🌈', '⚡', '❄️'],
  navigation: {
    tasks: '📝',
    nutrition: '🍽️', 
    habits: '🎯',
    home: '🏠',
    profile: '👤',
    settings: '⚙️',
    support: '💬',
    premium: '⭐',
    sections: '⚙️'
  },
  meals: {
    breakfast: '🌅',
    lunch: '🍽️',
    dinner: '🌙',
    snack: '🍎'
  }
};

// --- STATE MANAGEMENT ---
const initialState = {
    plans: [],
    sections: [], // Templates only
    habits: [],
    nutrition: {
        water: { daily: {}, target: 8 }, // daily: { 'YYYY-MM-DD': count }
        meals: {}, // date -> { mealId: { content, time, completed } }
        mealTypes: {} // date -> [ {id, name, icon, time} ]
    },
    ui: {
        currentDate: new Date().toISOString().split('T')[0],
        currentTab: 'tasks',
        selectedTaskId: null,
        user: { name: 'Пользователь' }
    }
};

let state = JSON.parse(JSON.stringify(initialState));

// --- CORE FUNCTIONS ---

function initApp() {
    console.log(`🚀 Initializing ${APP_VERSION}`);
    
    // Initialize Icons in UI
    initializeIcons();
    
    loadState();
    migrateData();
    
    // Bind global click listener for delegation
    document.body.addEventListener('click', handleGlobalClick);
    
    // Initial Render
    render();
}

function loadState() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            state = JSON.parse(saved);
        } else {
            recoverFromOldFormat();
        }
    } catch (e) {
        console.error('Failed to load state:', e);
        state = JSON.parse(JSON.stringify(initialState));
    }
    
    // Ensure structure integrity
    if (!state.ui) state.ui = { ...initialState.ui };
    if (!state.plans) state.plans = [];
    if (!state.nutrition) state.nutrition = { ...initialState.nutrition };
    if (!state.nutrition.water) state.nutrition.water = { daily: {}, target: 8 };
    
    // Set current date to today on load
    state.ui.currentDate = new Date().toISOString().split('T')[0];
}

function saveState() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
        console.error('Failed to save state:', e);
    }
}

function recoverFromOldFormat() {
    console.log('Recovering from old formats...');
    try {
        const oldPlans = localStorage.getItem('planner_plans');
        if (oldPlans) {
            const parsed = JSON.parse(oldPlans);
            if (Array.isArray(parsed)) {
                // Filter out routine/ghost tasks immediately
                state.plans = parsed.filter(p => 
                    !p.sectionId && 
                    !p.createdFromSection && 
                    !p.id?.toString().startsWith('section:')
                );
            }
        }
        
        // Recover sections if needed (as templates)
        const oldSections = localStorage.getItem('planner_sections');
        if (oldSections) {
             state.sections = JSON.parse(oldSections);
        }
        
    } catch (e) {
        console.error('Recovery failed:', e);
    }
}

function migrateData() {
    if (localStorage.getItem(MIGRATION_KEY)) return;

    console.log('🧹 Performing ONE-TIME migration...');
    
    // 1. Remove all auto-generated tasks
    state.plans = state.plans.filter(p => {
        const isRoutine = p.sectionId || p.createdFromSection || p.id?.toString().startsWith('section:');
        return !isRoutine;
    });

    // 2. Fix dates
    state.plans.forEach(p => {
        if (p.date && !p.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
            try {
                p.date = new Date(p.date).toISOString().split('T')[0];
            } catch(e) {}
        }
    });

    // 3. Clear old storage keys
    ['planner_plans', 'planner_sections', 'planner_teams', 'planner_rooms', 'plans', 'teams'].forEach(key => {
        localStorage.removeItem(key);
    });

    localStorage.setItem(MIGRATION_KEY, 'true');
    saveState();
}

// --- ACTIONS HANDLER ---

function handleGlobalClick(event) {
    const target = event.target.closest('[data-action]');
    if (!target) return;
    
    const action = target.dataset.action;
    const paramsString = target.dataset.params;
    let params = {};
    if (paramsString) {
        try {
            params = JSON.parse(paramsString);
        } catch (e) {
            console.error('Error parsing params', e);
        }
    }
    
    handleAction(action, params);
}

function handleAction(action, params) {
    console.log(`Action: ${action}`, params);
    
    switch (action) {
        // TABS
        case 'SWITCH_TAB':
            state.ui.currentTab = params.tab;
            break;
            
        // DATE
        case 'CHANGE_DATE':
            changeDate(params.days);
            break;
        case 'SET_DATE':
            state.ui.currentDate = params.date;
            state.ui.calendarViewDate = params.date;
            break;
            
        // TASKS
        case 'ADD_TASK_MODAL':
            showAddModal();
            return;
        case 'CREATE_TASK':
            createTask(params);
            hideAddModal();
            break;
        case 'CREATE_TASK_FROM_MODAL':
            {
                const title = document.getElementById('planTitle')?.value;
                const time = document.getElementById('planTime')?.value;
                const room = document.getElementById('planRoom')?.value;
                const date = document.getElementById('planDate')?.value;
                if (title) {
                    createTask({ title, time, room, date });
                    hideAddModal();
                }
            }
            break;
        case 'TOGGLE_TASK':
            toggleTask(params.id);
            break;
        case 'DELETE_TASK':
            deleteTask(params.id);
            break;
        case 'SHOW_TASK_MENU':
            state.ui.selectedTaskId = params.id;
            const overlay = document.getElementById('overlay');
            const menu = document.getElementById('menu');
            if (overlay && menu) {
                overlay.style.display = 'flex';
                requestAnimationFrame(() => menu.classList.add('active'));
            }
            return;
            
        case 'EDIT_TASK_FROM_MENU':
            hideMenu();
            showEditScreen(state.ui.selectedTaskId);
            return;
            
        case 'DELETE_TASK_FROM_MENU':
            if (state.ui.selectedTaskId) {
                deleteTask(state.ui.selectedTaskId);
            }
            hideMenu();
            break;
            
        case 'DELETE_TASK_FROM_EDIT':
            if (state.ui.selectedTaskId && confirm('Удалить задачу?')) {
                deleteTask(state.ui.selectedTaskId);
                hideEditScreen();
            }
            break;
            
        case 'SAVE_TASK_EDIT':
            saveTaskEdit();
            hideEditScreen();
            break;
            
        // NAVIGATION & ACCOUNT
        case 'SHOW_PROFILE_MENU':
            document.getElementById('profileScreen').style.display = 'block';
            return;
        case 'HIDE_PROFILE_MENU':
            document.getElementById('profileScreen').style.display = 'none';
            return;
        case 'SHOW_ROOMS_MODAL':
             document.getElementById('roomsScreen').style.display = 'block';
             return;
        case 'CLOSE_MODAL':
            hideAllModals();
            return;

        // POPUPS
        case 'SHOW_POPUP':
            showPopup(params.title, params.message, params.buttons);
            return;
        case 'HIDE_POPUP':
            hidePopup();
            return;
            
        // CALENDAR
        case 'SHOW_DATE_PICKER':
            showDatePicker();
            return;
        case 'HIDE_CALENDAR':
            hideCalendar();
            return;
        case 'CHANGE_CALENDAR_MONTH':
            changeCalendarMonth(params.delta);
            return;
        case 'SELECT_DATE': // Legacy support if needed
            state.ui.currentDate = params.date;
            hideCalendar();
            break;

        // ROOMS
        case 'SHOW_ADD_ROOM_MODAL': // showAddRoom replacement
             showAddRoom();
             return;
        case 'SELECT_ROOM_ICON':
             selectRoomIcon(params.icon);
             return;
        case 'SHOW_ROOM_NAME_INPUT':
             showRoomNameInput();
             return;
        case 'CREATE_ROOM':
             createRoom(params.name, params.icon);
             hidePopup();
             document.getElementById('roomsScreen').style.display = 'block';
             break;
             
        // NOTIFICATIONS
        case 'TOGGLE_NOTIFICATION':
        case 'TOGGLE_IMPORTANT':
            showPopup('Премиум функция', 'Доступно с подпиской Премиум', [{text:'OK', action: hidePopup}]);
            return;
        case 'SHOW_EDIT_DATE_PICKER':
            showEditDatePicker();
            return;

        // NUTRITION
        case 'CHANGE_WATER':
            changeWater(params.delta);
            break;
            
        // FALLBACK
        case 'SHOW_ACCOUNT':
        case 'SHOW_SETTINGS':
        case 'SHOW_SUPPORT':
        case 'EDIT_NAME':
        case 'SHOW_SECTIONS':
            alert('Функция в разработке (STABLE CORE)');
            return;
    }
    
    saveState();
    render();
}

// --- LOGIC ---

function changeDate(days) {
    const date = new Date(state.ui.currentDate);
    date.setDate(date.getDate() + days);
    state.ui.currentDate = date.toISOString().split('T')[0];
}

function createTask({ title, time, room, date }) {
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
}

function toggleTask(id) {
    const task = state.plans.find(p => p.id === id);
    if (task) task.completed = !task.completed;
}

function deleteTask(id) {
    state.plans = state.plans.filter(p => p.id !== id);
    hideAllModals();
}

function changeWater(delta) {
    const date = state.ui.currentDate;
    const current = state.nutrition.water.daily[date] || 0;
    const newVal = Math.max(0, current + delta);
    state.nutrition.water.daily[date] = newVal;
}

// --- RENDER ---

function render() {
    renderHeader();
    renderNav();
    
    const content = document.querySelector('.content');
    if (!content) return;

    if (state.ui.currentTab === 'tasks') {
        renderTasksTab(content);
    } else if (state.ui.currentTab === 'nutrition') {
        renderNutritionTab(content);
    } else if (state.ui.currentTab === 'habits') {
        renderHabitsTab(content);
    }
}

function renderHeader() {
    const date = new Date(state.ui.currentDate);
    const dayTitle = document.getElementById('dayTitle');
    const daySubtitle = document.getElementById('daySubtitle');
    if (dayTitle) dayTitle.textContent = formatDate(date);
    if (daySubtitle) daySubtitle.textContent = formatDateSubtitle(date);
    
    // Also render sections/rooms as they might have changed
    renderSections();
}

function renderSections() {
    // 1. Populate Dropdown in Add Modal
    const select = document.getElementById('planRoom');
    if (select) {
        const currentVal = select.value;
        select.innerHTML = '<option value="">Без раздела</option>';
        state.sections.forEach(room => {
            const opt = document.createElement('option');
            opt.value = room.title;
            opt.textContent = `${room.icon || '📝'} ${room.title}`;
            select.appendChild(opt);
        });
        select.value = currentVal;
    }
    
    // 2. Populate Rooms Screen List
    const list = document.getElementById('roomsList');
    if (list) {
        list.innerHTML = '';
        state.sections.forEach(room => {
            const item = document.createElement('div');
            item.className = 'room-item';
            item.innerHTML = `
                <div class="room-icon">${room.icon || '📝'}</div>
                <div class="room-name">${room.title}</div>
            `;
            // Maybe add delete button in future, keeping it simple for now
            list.appendChild(item);
        });
    }
}    
    // Progress
    const plans = getPlansForDate(state.ui.currentDate);
    const total = plans.length;
    const completed = plans.filter(p => p.completed).length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
    
    const circle = document.getElementById('progressCircle');
    const text = document.getElementById('progressText');
    if (circle) {
        circle.style.background = `conic-gradient(var(--accent-primary) ${percent}%, transparent 0)`;
    }
    if (text) {
        text.textContent = `${percent}%`;
    }
}

function renderNav() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.tab === state.ui.currentTab);
    });
}

function renderTasksTab(container) {
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

function renderNutritionTab(container) {
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

function renderHabitsTab(container) {
    container.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 40px 20px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 20px;">🎯</div>
            <h2 style="color: var(--text-primary); margin-bottom: 12px; font-size: 24px;">Привычки</h2>
            <p style="color: var(--text-secondary); margin-bottom: 24px;">Трекинг привычек скоро будет доступен</p>
        </div>
    `;
}

// --- UTILS ---

function getPlansForDate(dateStr) {
    return state.plans
        .filter(p => p.date === dateStr)
        .sort((a, b) => {
            if (a.completed !== b.completed) return a.completed ? 1 : -1;
            if (a.time && b.time) return a.time.localeCompare(b.time);
            if (a.time) return -1;
            if (b.time) return 1;
            return 0;
        });
}

function formatDate(date) {
    const today = new Date();
    const d = new Date(date);
    if (d.toDateString() === today.toDateString()) return 'Сегодня';
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (d.toDateString() === tomorrow.toDateString()) return 'Завтра';
    
    return d.toLocaleDateString('ru-RU', { weekday: 'long' });
}

function formatDateSubtitle(date) {
    const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}.`;
}

function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function getRoomIcon(roomName) {
    const defaults = { 'Дом': '🏠', 'Работа': '💼', 'Спорт': '🏃', 'Питание': '🍽️' };
    return defaults[roomName] || '📝';
}

function initializeIcons() {
    const mapping = {
        'tasksIcon': ICONS.navigation.tasks,
        'habitsIcon': ICONS.navigation.habits,
        'nutritionIcon': ICONS.navigation.nutrition,
        'roomsBtn': ICONS.navigation.home,
        'profileIcon': ICONS.navigation.profile,
        'settingsIcon': ICONS.navigation.settings
    };
    
    for (const [id, icon] of Object.entries(mapping)) {
        const el = document.getElementById(id);
        if (el) el.textContent = icon;
    }
}

// --- MODALS (Legacy UI support) ---

function showAddModal() {
    const modal = document.getElementById('addModal');
    if (modal) {
        modal.style.display = 'flex';
        const titleInput = document.getElementById('taskTitle');
        if (titleInput) {
            titleInput.value = '';
            setTimeout(() => titleInput.focus(), 100);
        }
    }
}

function hideAddModal() {
    const modal = document.getElementById('addModal');
    if (modal) modal.style.display = 'none';
}

function hideAllModals() {
    document.querySelectorAll('.modal, .popup').forEach(m => m.style.display = 'none');
    
    // Hide specialized screens/overlays
    const overlay = document.getElementById('overlay');
    if (overlay) overlay.style.display = 'none';
    
    const menu = document.getElementById('menu');
    if (menu) menu.classList.remove('active');
    
    const editScreen = document.getElementById('editPlanScreen');
    if (editScreen) editScreen.style.display = 'none';
    
    const roomsScreen = document.getElementById('roomsScreen');
    if (roomsScreen) roomsScreen.style.display = 'none';
    
    const calendar = document.getElementById('calendar');
    if (calendar) calendar.style.display = 'none';
}

function hideMenu() {
    const overlay = document.getElementById('overlay');
    if (overlay) overlay.style.display = 'none';
    const menu = document.getElementById('menu');
    if (menu) menu.classList.remove('active');
}

function showEditScreen(id) {
    const task = state.plans.find(p => p.id === id);
    if (!task) return;
    
    const screen = document.getElementById('editPlanScreen');
    if (screen) {
        screen.style.display = 'block';
        
        const titleInput = document.getElementById('editPlanTitle');
        if (titleInput) titleInput.value = task.title;
        
        const dateSpan = document.getElementById('editPlanDate');
        if (dateSpan) dateSpan.textContent = new Date(task.date).toLocaleDateString('ru-RU');
    }
}

function hideEditScreen() {
    const screen = document.getElementById('editPlanScreen');
    if (screen) screen.style.display = 'none';
    state.ui.selectedTaskId = null;
}

function saveTaskEdit() {
    const id = state.ui.selectedTaskId;
    const task = state.plans.find(p => p.id === id);
    if (!task) return;
    
    const titleInput = document.getElementById('editPlanTitle');
    if (titleInput && titleInput.value) {
        task.title = titleInput.value;
    }
}

// --- RESTORED FUNCTIONS (STABLE CORE) ---

// Popup System
function showPopup(title, message, buttons = []) {
    const popup = document.getElementById('popup');
    if (!popup) return;
    
    const titleEl = popup.querySelector('.popup-title') || document.getElementById('popupTitle');
    const msgEl = popup.querySelector('.popup-message') || document.getElementById('popupMessage');
    const btnsEl = popup.querySelector('.popup-buttons') || document.getElementById('popupButtons');
    
    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.innerHTML = message;
    
    if (btnsEl) {
        btnsEl.innerHTML = '';
        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.className = `popup-btn ${btn.type || 'confirm'}`;
            button.textContent = btn.text;
            button.onclick = btn.action;
            btnsEl.appendChild(button);
        });
    }
    
    popup.classList.add('show');
    popup.style.display = 'flex';
}

function hidePopup() {
    const popup = document.getElementById('popup');
    if (popup) {
        popup.classList.remove('show');
        popup.style.display = 'none';
    }
}

// Calendar System
function showDatePicker() {
    state.ui.calendarViewDate = state.ui.calendarViewDate || state.ui.currentDate;
    renderCalendar();
    const calendar = document.getElementById('calendar');
    if (calendar) calendar.style.display = 'flex';
}

function hideCalendar() {
    const calendar = document.getElementById('calendar');
    if (calendar) calendar.style.display = 'none';
}

function changeCalendarMonth(delta) {
    let date = new Date(state.ui.calendarViewDate || state.ui.currentDate);
    date.setMonth(date.getMonth() + delta);
    state.ui.calendarViewDate = date.toISOString().split('T')[0];
    renderCalendar();
}

function renderCalendar() {
    const viewDate = new Date(state.ui.calendarViewDate || state.ui.currentDate);
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    
    const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    
    const title = document.getElementById('calendarTitle');
    if (title) title.textContent = `${monthNames[month]} ${year}`;
    
    const grid = document.getElementById('calendarGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - (firstDay.getDay() || 7) + 1);
    
    const today = new Date();
    const selected = new Date(state.ui.currentDate);
    
    for (let i = 0; i < 42; i++) {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + i);
        const dStr = d.toISOString().split('T')[0];
        
        const btn = document.createElement('button');
        btn.className = 'calendar-day';
        btn.textContent = d.getDate();
        
        if (d.getMonth() !== month) btn.classList.add('other-month');
        if (dStr === today.toISOString().split('T')[0]) btn.classList.add('today');
        if (dStr === selected.toISOString().split('T')[0]) btn.classList.add('selected');
        
        btn.onclick = () => handleAction('SET_DATE', { date: dStr });
        
        grid.appendChild(btn);
    }
}

// Rooms / Sections
function showAddRoom() {
    state.ui.tempIcon = '📝';
    showRoomIconSelector();
}

function showRoomIconSelector() {
    const icons = ['📝', '🏠', '💼', '🏃', '🍽️', '🎓', '✈️', '🛒', '💊', '💤'];
    
    let html = '<div class="icon-selector" style="display:grid; grid-template-columns:repeat(5,1fr); gap:10px;">';
    icons.forEach(icon => {
        html += `<div class="icon-option" style="font-size:24px; cursor:pointer; padding:10px; border-radius:10px; text-align:center;" 
                 data-action="SELECT_ROOM_ICON" data-params='{"icon": "${icon}"}'>${icon}</div>`;
    });
    html += '</div>';
    
    showPopup('Выберите иконку', html, [
        { text: 'Отмена', type: 'cancel', action: () => handleAction('HIDE_POPUP') },
        { text: 'Далее', type: 'confirm', action: () => handleAction('SHOW_ROOM_NAME_INPUT') }
    ]);
}

function selectRoomIcon(icon) {
    state.ui.tempIcon = icon;
    document.querySelectorAll('.icon-option').forEach(el => el.style.background = 'transparent');
    const selected = Array.from(document.querySelectorAll('.icon-option')).find(el => el.textContent === icon);
    if (selected) selected.style.background = 'var(--bg-secondary)';
}

function showRoomNameInput() {
    showPopup(`${state.ui.tempIcon} Новый раздел`, 
        `<input id="newRoomName" class="input" placeholder="Название раздела" autofocus>`,
        [
            { text: 'Отмена', type: 'cancel', action: () => handleAction('HIDE_POPUP') },
            { text: 'Создать', type: 'confirm', action: () => {
                const name = document.getElementById('newRoomName').value;
                if (name) handleAction('CREATE_ROOM', { name, icon: state.ui.tempIcon });
            }}
        ]
    );
}

function createRoom(name, icon) {
    const newRoom = {
        id: 'room_' + Date.now(),
        title: name,
        icon: icon
    };
    state.sections.push(newRoom);
    saveState();
}

function showEditDatePicker() {
    showPopup('Изменить дату', 'Выберите дату', [
        { text: 'Отмена', action: hidePopup },
        { text: 'Сегодня', action: () => { 
            const d = new Date().toISOString().split('T')[0];
            document.getElementById('editPlanDate').textContent = new Date(d).toLocaleDateString('ru-RU');
            hidePopup();
        }}
    ]);
}

// Init
window.addEventListener('load', initApp);

