const STORAGE_PREFIX = 'subtask_postpone_note_v1:';

const keyFor = (subtaskId) => `${STORAGE_PREFIX}${String(subtaskId)}`;

export const getStoredPostponeNote = (subtaskId) => {
    if (subtaskId === undefined || subtaskId === null) return '';
    try {
        const raw = localStorage.getItem(keyFor(subtaskId));
        if (!raw) return '';
        return String(raw);
    } catch {
        return '';
    }
};

export const setStoredPostponeNote = (subtaskId, note) => {
    if (subtaskId === undefined || subtaskId === null) return;
    const text = (note ?? '').toString().trim();
    try {
        if (!text) {
            localStorage.removeItem(keyFor(subtaskId));
            return;
        }
        localStorage.setItem(keyFor(subtaskId), text);
    } catch {
        // no-op
    }
};

export const clearStoredPostponeNote = (subtaskId) => {
    if (subtaskId === undefined || subtaskId === null) return;
    try {
        localStorage.removeItem(keyFor(subtaskId));
    } catch {
        // no-op
    }
};
