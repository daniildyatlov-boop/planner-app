import { handleAction } from '../actions/index.js';
import { render } from '../render/index.js';

export function initEventDelegation() {
    console.log('[DELEGATION ACTIVE]');
    document.body.addEventListener('click', handleGlobalClick);
    
    // Также можно добавить обработчики для других событий, если нужно (например, change для input)
    // Но согласно правилам, кнопки - это основное.
    // Для input'ов лучше использовать onchange/oninput внутри render, если это локальное состояние UI,
    // но если это меняет глобальный state, то тоже через delegation или прямую привязку в render, 
    // но делегирование чище.
    
    // Для простоты и стабильности, начнем с кликов.
}

function handleGlobalClick(event) {
    // Ищем ближайший элемент с data-action
    const target = event.target.closest('[data-action]');
    if (!target) return;

    const action = target.dataset.action;
    console.log('[CLICK]', action); // Diagnostic log as requested
    let params = {};

    // Парсим параметры из data-params
    if (target.dataset.params) {
        try {
            // Если параметры в JSON
            params = JSON.parse(target.dataset.params);
        } catch (e) {
            console.error('Error parsing params for action:', action, e);
            // Fallback: если это не JSON, можно попробовать просто вернуть строку, 
            // но по правилам мы должны использовать JSON для data-params.
            // Однако, для простых ID иногда пишут просто id.
            // Приведем к объекту, если это возможно.
        }
    }
    
    // Если есть отдельные data-атрибуты, соберем их в params (для удобства)
    // Например data-id="123" -> params.id = "123"
    // Это упрощает верстку.
    if (target.dataset.id) params.id = target.dataset.id;
    if (target.dataset.tab) params.tab = target.dataset.tab;
    if (target.dataset.days) params.days = parseInt(target.dataset.days, 10);
    if (target.dataset.delta) params.delta = parseInt(target.dataset.delta, 10);
    if (target.dataset.icon) params.icon = target.dataset.icon;
    
    // Вызываем единый обработчик
    handleAction(action, params);
    
    // После любого действия обновляем UI
    try {
        render();
    } catch (e) {
        console.error('Render error after action:', action, e);
    }
}
