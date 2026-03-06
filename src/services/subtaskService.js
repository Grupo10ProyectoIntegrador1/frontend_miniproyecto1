import api from './api'

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
    const response = await api.get(url)
    return response.data.data  // { overdue: [...], today: [...], upcoming: [...] }
}


