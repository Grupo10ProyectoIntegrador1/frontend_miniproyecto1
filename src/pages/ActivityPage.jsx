import React from 'react';
import { 
    Calendar, 
    Eye, 
    Pencil, 
    Trash2, 
    Plus, 
    UserCircle, 
    Loader2, 
    BookOpen,
    AlertCircle,
    LayoutList
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useActivities } from '../hooks/useActivities';

const ACTIVITY_TYPES_MAP = {
    'exam': 'Examen',
    'quiz': 'Quiz',
    'project': 'Proyecto',
    'homework': 'Tarea',
    'presentation': 'Presentación'
};

const ActivityPage = () => {
    const { activities = [], viewState } = useActivities();

    const renderHeader = () => (
    <div className="flex justify-between items-start mb-10 pb-6 border-b border-zinc-100">
        <div className="flex gap-4">
            <div className="mt-1 p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-100">
                <LayoutList size={28} strokeWidth={2.5} />
            </div>
            <div>
                <h1 className="text-4xl font-black text-zinc-900 tracking-tight leading-none mb-2">
                    Actividades
                </h1>
                <p className="text-zinc-500 text-sm font-medium">
                    Gestiona y planifica tus compromisos académicos
                </p>
            </div>
        </div>
        
        <div className="hidden md:flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-zinc-200 shadow-sm">
            <div className="text-right">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none mb-1">Perfil</p>
                <span className="font-bold text-sm text-zinc-800">Estudiante</span>
            </div>
            <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-400 border border-zinc-200">
                <UserCircle size={32} strokeWidth={1.5} />
            </div>
        </div>
    </div>
);

    if (viewState === 'loading') {
        return (
            <div className="p-8 max-w-5xl mx-auto">
                {renderHeader()}
                <div className="flex flex-col items-center justify-center h-[60vh]">
                    <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
                    <p className="text-zinc-500 font-medium">Cargando actividades...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-5xl mx-auto">
            {renderHeader()}

            {viewState !== 'error' && (
                <div className="flex justify-between items-center mb-6">
                    <p className="text-zinc-400 text-sm font-medium">
                        {viewState === 'success' ? `${activities.length} actividades` : '0 actividades'}
                    </p>
                    <Link to="/crear" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all shadow-sm hover:shadow">
                        <div className="bg-white/20 rounded-full p-0.5"><Plus size={14} /></div>
                        Nueva actividad
                    </Link>
                </div>
            )}

            {viewState === 'success' && (
                <div className="flex flex-col gap-4">
                    {activities.map(activity => (
                        <div key={activity.id} className="bg-white border border-zinc-100 rounded-xl p-5 hover:shadow-sm transition-all duration-300">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-base font-bold text-zinc-900">{activity.title}</h3>
                                        {activity.course && (
                                            <span className="text-zinc-400 text-xs font-medium bg-zinc-50 px-2 py-0.5 rounded border border-zinc-100">
                                                {activity.course}
                                            </span>
                                        )}
                                    </div>
                                    
                                    <div className="flex items-center gap-4 text-zinc-400 text-xs mt-3">
                                        <span className="bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded font-bold uppercase text-[10px]">
                                            {ACTIVITY_TYPES_MAP[activity.type] || activity.type}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <Calendar size={14} /> 
                                            <span>Límite: {activity.due_date}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-xs font-bold text-zinc-400 bg-zinc-50 px-2 py-1 rounded-full border border-zinc-100">
                                    {activity.completed_subtasks || 0} / {activity.total_subtasks || 0}
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6 pt-4 border-t border-zinc-50">
                                <Link to={`/actividad/${activity.id}`} className="flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-blue-600 transition-colors border border-zinc-200 px-3 py-1.5 rounded-lg">
                                    <Eye size={14} /> Ver
                                </Link>
                                <button className="flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-900 transition-colors border border-zinc-200 px-3 py-1.5 rounded-lg">
                                    <Pencil size={14} /> Editar
                                </button>
                                <button className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors border border-zinc-200 px-3 py-1.5 rounded-lg">
                                    <Trash2 size={14} /> Eliminar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {viewState === 'empty' && (
                <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
                    <BookOpen className="text-zinc-200 mb-6" size={64} strokeWidth={1.5} />
                    <h3 className="text-xl font-bold text-zinc-900 mb-2">No tienes actividades</h3>
                    <p className="text-zinc-500 mb-8 max-w-xs">¿Deseas crear tu primera actividad?</p>
                    <Link to="/crear" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-xl active:scale-95">
                        Crear actividad
                    </Link>
                </div>
            )}

            {viewState === 'error' && (
                <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
                    <div className="w-48 h-48 bg-zinc-50 rounded-full flex items-center justify-center mb-8 border border-zinc-100">
                        <AlertCircle size={80} className="text-zinc-300" strokeWidth={1} />
                    </div>
                    <p className="text-zinc-500 text-lg font-medium max-w-sm leading-relaxed">
                        Ha ocurrido un error cargando las actividades, . <br />
                        <span 
                            className="text-blue-600 cursor-pointer hover:underline" 
                            onClick={() => window.location.reload()}
                        >
                            intentelo de nuevo
                        </span>
                    </p>
                </div>
            )}
        </div>
    );
};

export default ActivityPage;