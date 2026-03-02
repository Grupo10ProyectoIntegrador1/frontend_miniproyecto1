import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { AuthContext } from './useAuth';
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Al cargar la app, comprobamos si hay un token
        const checkAuth = async () => {
            const token = Cookies.get('token');
            if (token) {
                // Aqui podemos decodificar el token o llamar a un endpoint /me para validar y obtener usuario
                try {
                    // Simulación o llamada real
                    // const userData = await authService.verifyToken();
                    // setUser(userData);

                    setIsAuthenticated(true);

                    // Si el JWT contiene datos del usuario, puedes instalar jwt-decode
                    // const decoded = jwtDecode(token);
                    // setUser({ id: decoded.sub, ... });
                } catch (error) {
                    console.error("Error validando token:", error);
                    logout();
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const logout = () => {
        Cookies.remove('token');
        setUser(null);
        setIsAuthenticated(false);
        // Opcionalmente llamar a authService.logout() si el backend maneja sesiones
    };

    const login = async (username) => {
        // En un escenario real, esto hace la llamada al backend.
        // Si el backend responde con el token en el body:

        try {
            // const response = await authService.login(username, password);
            // const token = response.access_token; // Suponiendo

            // Simulación temporal para el frontend
            const token = "mock_jwt_token_12345";
            const mockUser = { username: username };

            // Opciones de seguridad para JS Cookies.
            // Nota: Si usas HttpOnly cookies configuradas por el backend, NO usas js-cookie aquí para setearlas
            Cookies.set('token', token, {
                expires: 7, // 7 días
                secure: true, // solo transmitir sobre HTTPS
                sameSite: 'strict'
            });

            setUser(mockUser);
            setIsAuthenticated(true);
            return { success: true };
        } catch (error) {
            console.error("Error de login", error);
            return { success: false, error: 'Login failed' };
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
