// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

// Обработка ошибок загрузки
window.addEventListener('error', (e) => {
    console.error('App error:', e);
    showErrorScreen();
});

// Обработка ошибок сети
window.addEventListener('offline', () => {
    showErrorScreen();
});

// Показать экран ошибки
function showErrorScreen() {
    document.body.innerHTML = `
        <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
            <div style="text-align: center; max-width: 280px;">
                <div style="font-size: 22px; font-weight: 600; margin-bottom: 24px; color: var(--tg-theme-text-color, #000000);">
                    Временно недоступно
                </div>
                <div style="font-size: 16px; line-height: 1.5; margin-bottom: 16px; color: var(--tg-theme-text-color, #000000);">
                    Планер сейчас обновляется или недоступен.<br>
                    Попробуйте открыть его чуть позже.
                </div>
                <div style="font-size: 15px; margin-bottom: 40px; color: var(--tg-theme-hint-color, #8e8e93);">
                    Обычно это занимает пару минут.
                </div>
                <button onclick="window.location.reload()" style="font-size: 17px; color: var(--tg-theme-link-color, #007aff); cursor: pointer; padding: 12px 20px; border-radius: 12px; background: rgba(0, 122, 255, 0.08); border: none; font-family: inherit; font-weight: 500;">
                    Обновить
                </button>
            </div>
        </div>
    `;
}

// Состояние приложения
let currentDate = new Date();
let plans = JSON.parse(localStorage.getItem('plans') || '[]');
let isAddMode = false;
let pullStartY = 0;
let isPulling = false;

// DOM элементы
const app = document.getElementById('app');
const dayTitle = document.getElementById('dayTitle');
const content = document.getElementById('content');
const addOverlay = document.getElementById('addOverlay');
const planInput = document.getElementById('planInput');
const pullIndicator = document.getElementById('pullIndicator');
const softEntryArea = document.getElementById('softEntryArea');

// Форматирование даты
function formatDate(date) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
        return 'Сегодня';
    } else if (date.toDateString() === tomorrow.toDateString()) {
        return 'Завтра';
    } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Вчера';
    } else {
        return date.toLocaleDateString('ru-RU', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long' 
        });
    }
}

// Парсинг текста плана
function parsePlanText(text) {
    const plan = {
        text: text.trim(),
        time: null,
        room: null,
        date: new Date(currentDate)
    };
    
    // Поиск времени (HH:MM или словами)
    const timeRegex = /(\d{1,2}):(\d{2})/;
    const timeMatch = text.match(timeRegex);
    if (timeMatch) {
        plan.time = `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`;
        plan.text = text.replace(timeRegex, '').trim();
    }
    
    // Поиск времени словами
    if (!plan.time) {
        if (text.includes('утром')) {
            plan.time = '09:00';
            plan.text = text.replace('утром', '').trim();
        } else if (text.includes('вечером')) {
            plan.time = '19:00';
            plan.text = text.replace('вечером', '').trim();
        }
    }
    
    // Поиск даты
    if (text.includes('завтра')) {
        plan.date = new Date(currentDate);
        plan.date.setDate(plan.date.getDate() + 1);
        plan.text = text.replace('завтра', '').trim();
    }
    
    // Поиск комнаты (последнее слово)
    const words = plan.text.split(' ');
    const possibleRooms = ['зал', 'офис', 'дом', 'парк', 'клиника', 'кафе', 'магазин'];
    const lastWord = words[words.length - 1]?.toLowerCase();
    
    if (lastWord && (possibleRooms.includes(lastWord) || lastWord.length > 2)) {
        plan.room = words.pop();
        plan.text = words.join(' ');
    }
    
    return plan;
}

// Сохранение планов
function savePlans() {
    localStorage.setItem('plans', JSON.stringify(plans));
}

// Получение планов на дату
function getPlansForDate(date) {
    const dateStr = date.toDateString();
    return plans.filter(plan => new Date(plan.date).toDateString() === dateStr);
}

// Отрисовка планов
function renderPlans() {
    const dayPlans = getPlansForDate(currentDate);
    dayTitle.textContent = formatDate(currentDate);
    
    if (dayPlans.length === 0) {
        content.innerHTML = `
            <div class="soft-entry-area" id="softEntryArea">
                <div class="empty-title">Планов нет</div>
                <div class="add-action">Добавить план</div>
                <div class="soft-hint">или потяните вниз</div>
            </div>
        `;
        content.classList.add('empty');
        
        // Добавляем мягкий обработчик для зоны
        const newSoftArea = document.getElementById('softEntryArea');
        newSoftArea.addEventListener('click', () => {
            showAddScreen();
            tg.HapticFeedback.impactOccurred('light');
        });
        
        return;
    }
    
    content.classList.remove('empty');
    
    const withTime = dayPlans.filter(p => p.time).sort((a, b) => a.time.localeCompare(b.time));
    const withoutTime = dayPlans.filter(p => !p.time);
    
    let html = '';
    
    if (withTime.length > 0) {
        html += '<div class="time-section"><div class="time-label">С временем</div>';
        withTime.forEach((plan, index) => {
            html += `
                <div class="plan-item" data-id="${plan.id}">
                    <div class="plan-time">${plan.time}</div>
                    <div class="plan-text">${plan.text}</div>
                    ${plan.room ? `<div class="room-badge">${plan.room}</div>` : ''}
                    <div class="delete-zone">Удалить</div>
                </div>
            `;
        });
        html += '</div>';
    }
    
    if (withoutTime.length > 0) {
        html += '<div class="time-section"><div class="time-label">Без времени</div>';
        withoutTime.forEach((plan, index) => {
            html += `
                <div class="plan-item" data-id="${plan.id}">
                    <div class="plan-text">${plan.text}</div>
                    ${plan.room ? `<div class="room-badge">${plan.room}</div>` : ''}
                    <div class="delete-zone">Удалить</div>
                </div>
            `;
        });
        html += '</div>';
    }
    
    content.innerHTML = html;
    
    // Добавляем обработчики для планов
    document.querySelectorAll('.plan-item').forEach(item => {
        let startX = 0;
        let currentX = 0;
        let isSwiping = false;
        
        item.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isSwiping = false;
        });
        
        item.addEventListener('touchmove', (e) => {
            currentX = e.touches[0].clientX;
            const diffX = startX - currentX;
            
            if (diffX > 10) {
                isSwiping = true;
                item.classList.add('swiping');
            } else if (diffX < -10) {
                item.classList.remove('swiping');
            }
        });
        
        item.addEventListener('touchend', () => {
            if (!isSwiping) {
                item.classList.remove('swiping');
            }
        });
        
        // Удаление по клику на зону удаления
        const deleteZone = item.querySelector('.delete-zone');
        deleteZone.addEventListener('click', () => {
            const planId = item.dataset.id;
            plans = plans.filter(p => p.id !== planId);
            savePlans();
            renderPlans();
            tg.HapticFeedback.impactOccurred('light');
        });
    });
}

// Добавление плана
function addPlan(text) {
    if (!text.trim()) return;
    
    const plan = parsePlanText(text);
    plan.id = Date.now().toString();
    
    plans.push(plan);
    savePlans();
    renderPlans();
    
    tg.HapticFeedback.notificationOccurred('success');
}

// Показать экран добавления
function showAddScreen() {
    isAddMode = true;
    addOverlay.classList.add('show');
    // Убираем автофокус - пользователь сам нажмет на поле
    // setTimeout(() => {
    //     planInput.focus();
    // }, 350);
}

// Скрыть экран добавления
function hideAddScreen() {
    isAddMode = false;
    addOverlay.classList.remove('show');
    planInput.value = '';
}

// Обработчики жестов
let startY = 0;
let currentY = 0;

app.addEventListener('touchstart', (e) => {
    if (isAddMode) return;
    startY = e.touches[0].clientY;
    pullStartY = startY;
});

app.addEventListener('touchmove', (e) => {
    if (isAddMode) return;
    
    currentY = e.touches[0].clientY;
    const diffY = currentY - startY;
    
    // Pull to add
    if (diffY > 50 && window.scrollY === 0) {
        isPulling = true;
        pullIndicator.classList.add('show');
        e.preventDefault();
    } else {
        isPulling = false;
        pullIndicator.classList.remove('show');
    }
});

app.addEventListener('touchend', (e) => {
    if (isAddMode) return;
    
    if (isPulling) {
        showAddScreen();
        tg.HapticFeedback.impactOccurred('medium');
    }
    
    isPulling = false;
    pullIndicator.classList.remove('show');
});

// Свайпы для смены дня
let startX = 0;
app.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
});

app.addEventListener('touchend', (e) => {
    if (isAddMode) return;
    
    const endX = e.changedTouches[0].clientX;
    const diffX = startX - endX;
    
    if (Math.abs(diffX) > 100) {
        if (diffX > 0) {
            // Swipe left - следующий день
            currentDate.setDate(currentDate.getDate() + 1);
        } else {
            // Swipe right - предыдущий день
            currentDate.setDate(currentDate.getDate() - 1);
        }
        renderPlans();
        tg.HapticFeedback.impactOccurred('light');
    }
});

// Обработчики для экрана добавления
planInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        addPlan(planInput.value);
        hideAddScreen();
    }
});

// Закрытие экрана добавления свайпом вниз
addOverlay.addEventListener('touchstart', (e) => {
    startY = e.touches[0].clientY;
});

addOverlay.addEventListener('touchend', (e) => {
    const endY = e.changedTouches[0].clientY;
    const diffY = endY - startY;
    
    if (diffY > 100) {
        hideAddScreen();
    }
});

// Обработчик для начальной мягкой зоны
if (softEntryArea) {
    softEntryArea.addEventListener('click', () => {
        showAddScreen();
        tg.HapticFeedback.impactOccurred('light');
    });
}

// Инициализация
renderPlans();

// Обработка кнопки "Назад" Telegram
tg.onEvent('backButtonClicked', () => {
    if (isAddMode) {
        hideAddScreen();
    } else {
        tg.close();
    }
});

// Показываем кнопку "Назад" когда в режиме добавления
function updateBackButton() {
    if (isAddMode) {
        tg.BackButton.show();
    } else {
        tg.BackButton.hide();
    }
}

// Обновляем кнопку при изменении режима
const originalShowAddScreen = showAddScreen;
const originalHideAddScreen = hideAddScreen;

showAddScreen = function() {
    originalShowAddScreen();
    updateBackButton();
};

hideAddScreen = function() {
    originalHideAddScreen();
    updateBackButton();
};