import { useState, useEffect, useCallback } from 'react'
import { getTodaySubtasks } from '../services/subtaskService'

export const useTodaySubtasks = () => {
    const [viewState, setViewState] = useState('loading')
    const [data, setData] = useState({ overdue: [], today: [], upcoming: [] })
    const [filters, setFilters] = useState({ course: '', status: 'all', days: '' })

    const loadData = useCallback(async () => {
        setViewState('loading')
        try {
            const result = await getTodaySubtasks(filters)
            const hasAnyItems = result.overdue.length > 0
                            || result.today.length > 0
                            || result.upcoming.length > 0

            // When status is 'all' (Estado = 'Todos' in the UI), the Hoy page hides
            // the 'Completadas' group. If the backend returns only done subtasks,
            // treat it as empty to avoid rendering a blank success state.
            const hasVisibleItems = filters.status === 'all'
                ? [...result.overdue, ...result.today, ...result.upcoming].some((subtask) => subtask?.status !== 'done')
                : hasAnyItems

            setData(result)
            setViewState(hasVisibleItems ? 'success' : 'empty')
        } catch {
            setViewState('error')
        }
    }, [filters])

    useEffect(() => {
        loadData()
    }, [loadData])

    return { data, viewState, filters, setFilters, reload: loadData }
}