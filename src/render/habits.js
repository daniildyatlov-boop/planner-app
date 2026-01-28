export function renderHabits(container) {
    container.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 40px 20px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 20px;">🎯</div>
            <h2 style="color: var(--text-primary); margin-bottom: 12px; font-size: 24px;">Привычки</h2>
            <p style="color: var(--text-secondary); margin-bottom: 24px;">Трекинг привычек скоро будет доступен</p>
        </div>
    `;
}
