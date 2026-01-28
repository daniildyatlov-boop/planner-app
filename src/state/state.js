export const initialState = {
    plans: [],
    sections: [], // Templates only
    habits: [],
    nutrition: {
        water: { daily: {}, target: 8 },
        meals: {},
        mealTypes: {}
    },
    ui: {
        currentDate: new Date().toISOString().split('T')[0],
        currentTab: 'tasks',
        selectedTaskId: null,
        user: { name: 'Пользователь' },
        calendarViewDate: new Date().toISOString().split('T')[0]
    }
};

export let state = JSON.parse(JSON.stringify(initialState));

export function setState(newState) {
    state = newState;
}
