import { useState, useEffect } from 'react';
import { AuthContext } from './useAuth';
import { supabase } from '../services/supabaseClient';
import { authService } from '../services/authService';
import api from '../services/api';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                await fetchProfile();
            } else {
                setLoading(false);
            }
        };

        initAuth();

        const { data: authListener } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                    if (!user) {
                        setTimeout(() => fetchProfile(), 0);
                    }
                } else if (event === 'SIGNED_OUT') {
                    setUser(null);
                    setIsAuthenticated(false);
                    setLoading(false);
                }
            }
        );

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/users/profile/');
            setUser(response.data.data);
            setIsAuthenticated(true);
        } catch (error) {
            console.error("Error fetching user profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error("Error logging out", error);
        } finally {
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    const login = async (email, password) => {
        try {
            await authService.login(email, password);
            await fetchProfile(); // Explicitly fetch profile so state is updated before navigating
            return { success: true };
        } catch (error) {
            console.error("Error de login:", error);
            let errorMessage = error.message || 'Error al iniciar sesión';
            if (errorMessage.includes('Invalid login credentials')) {
                errorMessage = 'Credenciales inválidas. Verifica tu correo y contraseña.';
            }
            return { success: false, error: errorMessage };
        }
    };

    const register = async (userData) => {
        try {
            await authService.register(userData);
            await fetchProfile(); // Explicitly fetch profile so state is updated before navigating
            return { success: true };
        } catch (error) {
            console.error("Error de registro:", error);
            return { success: false, error: error.message || 'Registration failed' };
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
