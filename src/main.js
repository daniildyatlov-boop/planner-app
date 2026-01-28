import { loadState } from './state/load.js';
import { migrateData } from './state/migrate.js';
import { initEventDelegation } from './events/delegation.js';
import { render } from './render/index.js';
import { state } from './state/state.js';
import { initializeIcons as initIcons } from './utils/helpers.js';

// Главная функция инициализации
export function initApp() {
    console.log('Initializing app...');

    try {
        // 1. Загрузка состояния
        loadState();

        // 2. Миграция данных (одноразовая очистка)
        migrateData();
        
        // 3. Первичный рендер
        render();

        // 4. Привязка событий (Event Delegation)
        // ВАЖНО: Вызывается ПОСЛЕ рендера, как требует STABLE CORE
        initEventDelegation();

        // Инициализация Telegram WebApp (если есть)
        if (window.Telegram && window.Telegram.WebApp) {
            window.Telegram.WebApp.ready();
            window.Telegram.WebApp.expand();
        }

        console.log('App initialized successfully');

    } catch (error) {
        console.error('Critical error during app initialization:', error);
        // Fallback: попробуем отрендерить хотя бы что-то или показать ошибку
        document.body.innerHTML = '<div style="padding: 20px; color: red;">Something went wrong. Please reload.</div>';
    }
}

// Запуск при загрузке DOM
document.addEventListener('DOMContentLoaded', initApp);
