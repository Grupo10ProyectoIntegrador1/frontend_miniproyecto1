import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import koalaLogo from '../assets/bb51bc4eb2882c49a664ff7c04a240151df066fc.png';
import { useAuth } from '../context/useAuth';

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const result = await login(username, password);

        if (result.success) {
            navigate('/hoy');
        } else {
            setError(result.error || 'Credenciales inválidas');
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* Left side - Login Form */}
            <div className="w-full md:w-[55%] flex items-center justify-center p-8 bg-white">
                <div className="w-full max-w-2xl">
                    <h1 className="text-7xl font-extrabold mb-16 text-black text-center">
                        Iniciar Sesión
                    </h1>

                    {error && (
                        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl text-center text-lg">
                            {error}
                        </div>
                    )}

                    <form className="space-y-10" onSubmit={handleSubmit}>
                        {/* Username Input */}
                        <div className="space-y-4">
                            <label className="block text-2xl font-semibold text-gray-800">
                                Nombre de usuario
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Ingresa tu nombre de usuario"
                                className="w-full px-6 py-5 text-xl rounded-2xl bg-gray-100 border-transparent focus:border-blue-500 focus:bg-white focus:ring-0 outline-none transition-all placeholder:text-gray-400"
                                required
                            />
                        </div>

                        {/* Password Input */}
                        <div className="space-y-4">
                            <label className="block text-2xl font-semibold text-gray-800">
                                Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Ingresa tu contraseña"
                                    className="w-full px-6 py-5 text-xl rounded-2xl bg-gray-100 border-transparent focus:border-blue-500 focus:bg-white focus:ring-0 outline-none transition-all placeholder:text-gray-400 pr-16"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                >
                                    {showPassword ? (
                                        <Eye className="w-8 h-8" />
                                    ) : (
                                        <EyeOff className="w-8 h-8" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between pt-4">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-6 h-6 rounded border-gray-300 text-blue-500 focus:ring-blue-500 bg-gray-100"
                                />
                                <span className="text-xl font-medium text-gray-600">Recordarme</span>
                            </label>

                            <Link to="#" className="text-xl font-medium text-blue-500 hover:text-blue-600">
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full text-white text-2xl font-medium py-6 rounded-2xl transition-colors mt-12 shadow-sm ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-[#3b82f6] hover:bg-blue-600'
                                }`}
                        >
                            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                        </button>

                        {/* Sign Up Link */}
                        <div className="text-center pt-8">
                            <span className="text-gray-500 text-xl">¿No tienes una cuenta? </span>
                            <Link to="/registro" className="text-blue-500 text-xl font-medium hover:text-blue-600">
                                Regístrate aquí
                            </Link>
                        </div>
                    </form>
                </div>
            </div>

            {/* Right side - Illustration */}
            <div className="hidden md:flex w-[45%] bg-[#2d7df6] rounded-bl-[250px] items-center justify-center p-12 relative overflow-hidden">
                <div className="flex flex-col items-center justify-center relative z-10 w-full max-w-[900px] text-center">
                    {/* Logo / Illustration */}
                    <div className="mb-0 w-full flex justify-center relative -mt-10">
                        <img
                            src={koalaLogo}
                            alt="Floz Koala"
                            className="w-full max-w-[800px] object-contain drop-shadow-2xl"
                        />
                    </div>

                    <p className="text-white/70 text-5xl font-light px-8 whitespace-pre-line -mt-16">
                        Planifica tus actividades con
                        calma y eficiencia
                    </p>
                </div>
            </div>
        </div>
    );
}
