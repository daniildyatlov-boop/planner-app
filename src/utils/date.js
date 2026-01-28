export function formatDate(date) {
    const today = new Date();
    const d = new Date(date);
    if (d.toDateString() === today.toDateString()) return 'Сегодня';
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (d.toDateString() === tomorrow.toDateString()) return 'Завтра';
    
    return d.toLocaleDateString('ru-RU', { weekday: 'long' });
}

export function formatDateSubtitle(date) {
    const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}.`;
}
