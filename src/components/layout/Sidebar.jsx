import { NavLink } from "react-router-dom";
import { CalendarDays, PlusCircle, BarChart2, LogIn } from "lucide-react";

const navItems = [
    { to: '/hoy', label: 'Hoy', icon:CalendarDays },
    { to: '/crear', label: 'Crear actividad', icon: PlusCircle },
    { to: '/progreso', label: 'Progreso', icon: BarChart2 },
]

function Sidebar() {
    return (
        <aside>
            {/* Logo */}
            <div className="mb-10 px-2">
                <h1 className="text-xl font-bold text-white">Planificador de tareas</h1>
                <p className="text-xs text-zinc-400 mt-1">Organiza tu semestre</p>
            </div>

            {/*Links de navegacion */}
            <nav className="flex flex-col gap-1 flex-1">
                {navItems.map(({ to, label, icon: Icon}) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) => 
                            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                                isActive
                                ? 'bg-zinc-700 text-white font-medium'
                                : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                            }`
                        }
                    >
                        <Icon size={18}/>
                        {label}
                    </NavLink>
                ))}
            </nav>

            {/* Login al fondo*/}
            <NavLink
                to="/login"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
            >
                <LogIn size={18}/>
                Inciar sesión
            </NavLink>

        </aside>
    )
}

export default Sidebar