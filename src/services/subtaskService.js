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

