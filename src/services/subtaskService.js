import api from './api'
import { getActivities } from './activityService'
import { getLocalTodayStr } from '../utils/dateUtils'

let todayEndpointAvailability = null // null = unknown, true = exists, false = missing

const toSubtaskWithParent = (activity, subtask) => {
    const parent_activity = {
        id: activity?.id,
        title: activity?.title,
        type: activity?.type,
        course: activity?.course,
        weight: activity?.weight,
        due_date: activity?.due_date,
    }

    return {
        ...subtask,
        parent_activity,
    }
}

const buildTodayGroupsFromActivities = (activities = [], params = {}) => {
    const todayStr = getLocalTodayStr()
    const courseFilter = params?.course || ''
    const statusFilter = params?.status || 'all'
    const days = params?.days === '' || params?.days === undefined ? '' : Number(params?.days)

    const all = (Array.isArray(activities) ? activities : [])
        .filter((a) => {
            if (!courseFilter) return true
            return (a?.course || '') === courseFilter
        })
        .flatMap((activity) => {
            const subtasks = Array.isArray(activity?.subtasks) ? activity.subtasks : []
            return subtasks.map((st) => toSubtaskWithParent(activity, st))
        })

    const withinDays = (dateStr) => {
        if (days === '' || Number.isNaN(days)) return true
        if (!dateStr) return false
        const base = new Date(todayStr + 'T00:00:00')
        const max = new Date(base)
        max.setDate(max.getDate() + days)
        const d = new Date(dateStr + 'T00:00:00')
        return d <= max
    }

    // Mantener soporte de filtro por status (all/pending/done/postponed/overdue)
    const filteredByStatus = all.filter((st) => {
        if (!statusFilter || statusFilter === 'all') return true
        return st?.status === statusFilter
    })

    const overdue = []
    const today = []
    const upcoming = []

    for (const st of filteredByStatus) {
        const target = st?.target_date || null
        const status = st?.status

        // Postergadas se consideran dentro de Próximas
        if (status === 'postponed') {
            upcoming.push(st)
            continue
        }

        // Completadas: las devolvemos en upcoming para que la UI pueda agruparlas (doneGrouped)
        // sin crear un cuarto array en el contrato {overdue,today,upcoming}.
        if (status === 'done') {
            upcoming.push(st)
            continue
        }

        // Overdue explícitas o por fecha (fallback por si existieran)
        if (status === 'overdue' || (target && target < todayStr)) {
            overdue.push(st)
            continue
        }

        if (target && target === todayStr) {
            today.push(st)
            continue
        }

        if (target && target > todayStr) {
            if (withinDays(target)) {
                upcoming.push(st)
            }
            continue
        }

        // Sin fecha objetivo: no se muestra en Hoy (coincide con comportamiento usual)
    }

    return { overdue, today, upcoming }
}

//POST /api/activities/:activityID/subtasks/
export const createSubtask = async (activityId, subtaskData) => {
    const response = await api.post(`/activities/${activityId}/subtasks/`, subtaskData)
    return response.data
}

//GET /api/subtasks/:id/
export const getSubtaskById = async (id) => {
    const response = await api.get(`/subtasks/${id}/`)
    return response.data
}

// PATCH /api/subtasks/:id/
export const updateSubtask = async (id, subtaskData) => {
    const response = await api.patch(`/subtasks/${id}/`, subtaskData)
    return response.data
}

export const deleteSubtask = async (id) => {
    const response = await api.delete(`/subtasks/${id}/`)
    return response.data
}

// GET /api/subtasks/today/
export const getTodaySubtasks = async (params = {}) => {
    const query = new URLSearchParams()
    if (params.course) query.append('course', params.course)
    if (params.status) query.append('status', params.status)
    if (params.days !== undefined && params.days !== '') query.append('days', params.days)
    
    const queryStr = query.toString()
    const url = queryStr ? `/subtasks/today/?${queryStr}` : '/subtasks/today/'

    if (todayEndpointAvailability === false) {
        const activities = await getActivities()
        return buildTodayGroupsFromActivities(activities, params)
    }

    try {
        const response = await api.get(url)
        todayEndpointAvailability = true
        return response.data.data  // { overdue: [...], today: [...], upcoming: [...] }
    } catch (err) {
        const status = err?.response?.status
        if (status === 404) {
            todayEndpointAvailability = false
            const activities = await getActivities()
            return buildTodayGroupsFromActivities(activities, params)
        }
        throw err
    }
}


