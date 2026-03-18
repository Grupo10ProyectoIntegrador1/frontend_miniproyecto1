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
            const hasData = result.overdue.length > 0 
                         || result.today.length > 0 
                         || result.upcoming.length > 0
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