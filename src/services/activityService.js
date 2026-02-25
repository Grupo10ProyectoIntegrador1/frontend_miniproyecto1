import api from './api'

//Post /api/activities/
export const createActivity = async (activityData) => {
    const response = await api.post('/activities/', activityData)
    return response.data
}

//Get /api/activities/
export const getActivities = async () => {
    const response = await api.get('/activities/')
    return response.data
}

//Get /api/activities/:id
export const getActivitiesById = async (id) => {
    const response = await api.get(`/activities/${id}/`)
    return response.data
}

