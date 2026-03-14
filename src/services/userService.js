import api from './api';

export const userService = {
    getDailyCapacity: async () => {
        const response = await api.get('/users/capacity/');
        return response.data;
    },

    updateDailyCapacity: async (hours) => {
        const response = await api.put('/users/capacity/', { daily_limit_hours: hours });
        return response.data;
    }
};
