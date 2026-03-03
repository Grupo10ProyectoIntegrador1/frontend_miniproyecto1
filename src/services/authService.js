import api from './api';
import { supabase } from './supabaseClient';

export const authService = {
    login: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            throw error;
        }

        return data;
    },

    register: async (userData) => {
        const { data, error } = await supabase.auth.signUp({
            email: userData.email,
            password: userData.password,
        });

        if (error) {
            throw error;
        }

        let session = data.session;
        if (!session) {
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email: userData.email,
                password: userData.password,
            });

            if (signInError) {
                throw new Error("Por favor, verifica tu correo electrónico antes de poder iniciar sesión y completar el registro.");
            }
            session = signInData.session;
        }

        if (!session) {
            throw new Error("No pudimos obtener una sesión válida de Supabase. Revisa tu consola.");
        }

        try {
            const token = session.access_token;
            const response = await api.post('/users/register/', {
                name: userData.firstName,
                last_name: userData.lastName
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            return { ...data, backendProfile: response.data };
        } catch (backendError) {
            console.error("Error creating backend profile:", backendError.response?.data || backendError.message);
            throw new Error(backendError.response?.data?.message || "Error al crear el perfil en el servidor.");
        }
    },

    verifyToken: async () => {
        const response = await api.get('/users/profile/');
        return response.data;
    },

    logout: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            throw error;
        }
    }
};
