import { useState, useEffect, useMemo } from 'react';
import { getActivities } from '../services/activityService';

export const useActivities = () => {
    const [viewState, setViewState] = useState('loading'); // 'loading', 'success', 'empty', 'error'
    const [activities, setActivities] = useState([]);

    const loadData = async () => {
        await Promise.resolve();
        setViewState('loading');
        try {
            const data = await getActivities();
            setActivities(data);
            setViewState(data.length > 0 ? 'success' : 'empty');
        } catch (err) {
            setViewState('error');
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadData();
    }, []);

    // Calcular estadísticas dinámicamente con useMemo para optimizar
    const stats = useMemo(() => {
        const totalTasks = activities.reduce((acc, act) => acc + (act.total || 0), 0);
        const completedTasks = activities.reduce((acc, act) => acc + (act.completed || 0), 0);
        const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 1000) / 10 : 0;

        return {
            total: totalTasks,
            completed: completedTasks,
            percentage: percentage,
            activityCount: activities.length
        };
    }, [activities]);

    return {
        activities,
        viewState,
        stats,
        reload: loadData
    };
};
