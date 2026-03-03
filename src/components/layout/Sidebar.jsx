import { NavLink } from "react-router-dom";
import { CalendarDays, PlusCircle, BarChart2, LogIn, LogOut, LayoutList } from "lucide-react";
import { useAuth } from "../../context/useAuth";

const navItems = [
    { to: '/hoy', label: 'Hoy', icon: CalendarDays },
    { to: '/crear', label: 'Crear actividad', icon: PlusCircle },
    { to: '/actividades', label: 'Actividades', icon: LayoutList },
    { to: '/progreso', label: 'Progreso', icon: BarChart2 },
]

function Sidebar() {
    const { isAuthenticated, logout } = useAuth();

    return (
        <aside className="h-screen w-64 bg-zinc-900 text-white flex flex-col px-4 py-6 fixed left-0 top-0">

            {/* Logo */}
            <div className="mb-10 px-2">
                <h1 className="text-xl font-bold text-white">Planificador</h1>
            </div>

            {/* Links de navegación */}
            <nav className="flex flex-col gap-1 flex-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActive
                                    ? 'bg-blue-600 text-white font-medium'
                                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                                }`
                            }
                        >
                            <Icon size={18} />
                            {item.label}
                        </NavLink>
                    )
                })}
            </nav>

            {/* Acciones de cuenta al fondo */}
            {isAuthenticated ? (
                <button
                    onClick={logout}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors w-full text-left"
                >
                    <LogOut size={18} />
                    Cerrar sesión
                </button>
            ) : (
                <NavLink
                    to="/login"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                >
                    <LogIn size={18} />
                    Iniciar sesión
                </NavLink>
            )}

        </aside>
    )
}

export default Sidebar