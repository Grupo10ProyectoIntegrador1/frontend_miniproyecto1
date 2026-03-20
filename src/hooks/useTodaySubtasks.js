import { useState, useEffect, useCallback } from 'react'
import { getTodaySubtasks } from '../services/subtaskService'
import { getLocalTodayStr } from '../utils/dateUtils'

export const useTodaySubtasks = () => {
    const [viewState, setViewState] = useState('loading')
    const [data, setData] = useState({ overdue: [], today: [], upcoming: [] })
    const [filters, setFilters] = useState({ course: '', status: 'all', days: '' })

    const loadData = useCallback(async () => {
        setViewState('loading')
        try {
            const result = await getTodaySubtasks(filters)

            const todayStr = getLocalTodayStr()
            const allSubtasks = [...(result?.overdue || []), ...(result?.today || []), ...(result?.upcoming || [])]

            const postponed = allSubtasks.filter((sub) => sub.status === 'postponed')
            const overdueVisible = (result?.overdue || []).filter(
                (sub) => sub.status !== 'done' && sub.status !== 'postponed'
            )
            const todayVisible = (result?.today || []).filter(
                (sub) => sub.target_date === todayStr && sub.status !== 'done' && sub.status !== 'postponed'
            )
            const upcomingVisible = (result?.upcoming || []).filter(
                (sub) => sub.status !== 'done' && sub.status !== 'postponed'
            )

            const hasVisibleInTodos =
                overdueVisible.length + todayVisible.length + upcomingVisible.length + postponed.length > 0

            const hasAnyFromApi =
                (result?.overdue || []).length > 0 || (result?.today || []).length > 0 || (result?.upcoming || []).length > 0

            const hasData = filters.status === 'all' ? hasVisibleInTodos : hasAnyFromApi
            setData(result)
            setViewState(hasData ? 'success' : 'empty')
        } catch {
            setViewState('error')
        }
    }, [filters])

    useEffect(() => {
        loadData()
    }, [loadData])

    return { data, viewState, filters, setFilters, reload: loadData }
}