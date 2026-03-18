import { userService } from '../services/userService';

export const DAILY_CAPACITY_CONFLICT_STORAGE_KEY = 'dailyCapacityOverloadConflict';

export const broadcastDailyCapacityConflict = (conflict) => {
    try {
        window.dispatchEvent(new CustomEvent('daily-capacity-conflict', { detail: conflict }));
    } catch {
        // no-op
    }
};

export const setStoredDailyCapacityConflict = (conflict) => {
    try {
        if (!conflict) {
            sessionStorage.removeItem(DAILY_CAPACITY_CONFLICT_STORAGE_KEY);
            broadcastDailyCapacityConflict(null);
            return;
        }

        sessionStorage.setItem(
            DAILY_CAPACITY_CONFLICT_STORAGE_KEY,
            JSON.stringify({
                ...conflict,
                ts: Date.now(),
            })
        );

        broadcastDailyCapacityConflict(conflict);
    } catch {
        // no-op
    }
};

export const getStoredDailyCapacityConflict = () => {
    try {
        const raw = sessionStorage.getItem(DAILY_CAPACITY_CONFLICT_STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch {
        return null;
    }
};

export const syncDailyCapacityConflictWithBackend = async () => {
    const storedConflict = getStoredDailyCapacityConflict();
    if (!storedConflict) return;

    const limitHours = Number(storedConflict.limitHours);
    if (!Number.isFinite(limitHours)) {
        setStoredDailyCapacityConflict(null);
        return;
    }

    try {
        await userService.updateDailyCapacity(limitHours);
        setStoredDailyCapacityConflict(null);
    } catch (err) {
        const overloadConflict = err?.response?.data?.errors?.overload_conflict?.[0];
        if (overloadConflict) {
            const conflicts = overloadConflict?.conflicts || [];
            const conflictDates = conflicts.map((c) => c.date).filter(Boolean);
            setStoredDailyCapacityConflict({
                limitHours,
                conflicts,
                conflictDates,
            });
            return;
        }

        // If backend no longer returns overload conflict details, avoid stale UI conflict.
        setStoredDailyCapacityConflict(null);
    }
};
