import { useState, useEffect } from 'react'
import { getActivitiesById } from '../services/activityService'

export const useActivity = (id) => {
    const [viewState, setViewState] = useState('loading')
    const [activity, setActivity] = useState(null)

    const loadData = async () => {
        setViewState('loading')
        try {
            const data = await getActivitiesById(id)
            setActivity(data)
            setViewState('success')
        } catch (err) {
            setViewState('error')
        }
    }

    useEffect(() => {
        if (id) loadData()
    }, [id])

    return { activity, viewState, reload: loadData }
}