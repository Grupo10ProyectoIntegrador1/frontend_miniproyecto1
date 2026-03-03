import axios from 'axios';
import { supabase } from './supabaseClient';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    async (config) => {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) {
                console.error("[API Interceptor] Error fetching session:", error);
            }

            if (session && session.access_token) {
                config.headers.Authorization = `Bearer ${session.access_token}`;
            }
            return config;
        } catch (err) {
            console.error("[API Interceptor] Catch block hit:", err);
            return Promise.reject(err);
        }
    },
    (error) => {
        console.error("[API Interceptor] Request error:", error);
        return Promise.reject(error);
    }
);


api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        if (error.response && error.response.status === 401) {
            await supabase.auth.signOut();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
