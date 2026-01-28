import { loadState } from './state/load.js';
import { migrateData } from './state/migrate.js';
import { initEventDelegation } from './events/delegation.js';
import { render } from './render/index.js';
import { state } from './state/state.js';
import { initIcons } from './utils/helpers.js';

// Главная функция инициализации
export function initApp() {
    console.log('Initializing app...');

    try {
        // 1. Загрузка состояния
        loadState();

        // 2. Миграция данных (одноразовая очистка)
        migrateData();
        
        // 3. Инициализация иконок (если их нет)
        // Это вспомогательная функция, чтобы иконки были доступны
        // Она не меняет стейт задач, только константы/ресурсы если нужно, 
        // но в нашем случае иконки жестко заданы в utils/constants.js
        // Проверим, нужно ли что-то делать с иконками.
        // В constants.js они экспортируются.
        // Если нужно инициализировать дефолтные секции в стейте (только шаблоны),
        // это должно было произойти в loadState или migrateData.
        
        // 4. Привязка событий (Event Delegation)
        initEventDelegation();

        // 5. Первичный рендер
        render();

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
