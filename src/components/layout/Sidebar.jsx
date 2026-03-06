import { NavLink } from "react-router-dom";
import { Plus, Calendar, ListTodo, BarChart2, LogIn, LogOut, Loader2, User } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import { useState } from "react";
import logo from '../../assets/bb51bc4eb2882c49a664ff7c04a240151df066fc.png';

const navItems = [
    { to: '/crear', label: 'Crear Actividad', icon: Calendar },
    { to: '/actividades', label: 'Actividades', icon: ListTodo },
    { to: '/progreso', label: 'Progreso', icon: BarChart2 },
]

function Sidebar() {
    const { isAuthenticated, logout } = useAuth();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logout();
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <aside className="h-screen w-64 bg-[#232836] text-slate-300 flex flex-col px-4 py-8 fixed left-0 top-0">

            {/* Logo */}
            <div className="flex items-center gap-3 mb-10 px-2">
                <img src={logo} alt="Floz Logo" className="w-12 h-12 object-contain" />
                <h1 className="text-2xl font-bold text-white tracking-wide">Planificador</h1>
            </div>

            {/* Links de navegación */}
            <nav className="flex flex-col gap-2 flex-1">
                {/* Botón especial para Hoy */}
                <NavLink
                    to="/hoy"
                    className={({ isActive }) =>
                        `flex items-center gap-4 px-4 py-3 rounded-xl text-[15px] font-medium transition-all ${isActive
                            ? 'bg-[#3b82f6] text-white shadow-md'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                        }`
                    }
                >
                    {({ isActive }) => (
                        <>
                            <Plus size={20} className={isActive ? 'text-white' : 'text-slate-400'} />
                            Hoy
                        </>
                    )}
                </NavLink>

                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `flex items-center gap-4 px-4 py-3 rounded-xl text-[15px] font-medium transition-all ${isActive
                                    ? 'bg-[#3b82f6] text-white shadow-md'
                                    : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <Icon size={20} className={isActive ? 'text-white' : 'text-slate-400'} />
                                    {item.label}
                                </>
                            )}
                        </NavLink>
                    )
                })}
            </nav>

            {/* Acciones de cuenta al fondo */}
            {isAuthenticated ? (
                <div className="mt-auto border-t border-slate-700/50 pt-6 px-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#3b82f6] flex items-center justify-center text-white shadow-sm">
                            <User size={20} />
                        </div>
                        <span className="text-[15px] font-medium text-slate-300">Estudiante</span>
                    </div>
                    {isLoggingOut ? (
                        <Loader2 size={20} className="animate-spin text-slate-400" />
                    ) : (
                        <button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800/50"
                            title="Cerrar sesión"
                        >
                            <LogOut size={20} />
                        </button>
                    )}
                </div>
            ) : (
                <div className="mt-auto border-t border-slate-700/50 pt-6 px-2">
                    <NavLink
                        to="/login"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                        <LogIn size={20} />
                        Iniciar sesión
                    </NavLink>
                </div>
            )}

        </aside>
    )
}

export default Sidebar