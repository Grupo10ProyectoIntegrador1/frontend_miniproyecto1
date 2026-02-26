import React, { useState, useEffect } from 'react';
import {
    AlertCircle,
    BookOpen,
    UserCircle,
    Plus,
    ArrowUpRight,
    Loader2
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

const ActiviyPage = () => {
    const { activities, viewState } = useActivities();

    const renderHeader = () => (
        <div className="flex justify-between items-center mb-8 border-b border-zinc-100 pb-4">
            <h1 className="text-xl font-semibold text-zinc-800">Actividades</h1>
            <div className="flex items-center gap-2 text-zinc-700">
                <UserCircle className="text-blue-600" size={32} />
                <span className="font-medium text-sm">Estudiante</span>
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
    
                <div className="flex justify-between items-center mb-6">
                    <p className="text-zinc-400 text-sm font-medium">
                        {viewState === 'success' ? `${activities.length} actividades` :
                            viewState === 'empty' ? '0 actividades' : 'Error cargando las actividades.'}
                    </p>
                    {(viewState === 'success' || viewState === 'empty') && (
                        <Link to="/crear" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all shadow-sm hover:shadow">
                            <div className="bg-white/20 rounded-full p-0.5"><Plus size={14} /></div>
                            Crear actividad
                        </Link>
                    )}
                </div>
        
                {viewState === 'success' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {activities.map(activity => (
                            <div key={activity.id} className="bg-white border border-zinc-100 rounded-xl p-6 hover:shadow-md transition-all duration-300">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-zinc-900">{activity.title}</h3>
                                        <p className="text-zinc-400 text-xs font-medium uppercase tracking-tight">{activity.course || 'Sin curso'}</p>
                                    </div>
                                    <span className="bg-zinc-50 text-zinc-500 text-[10px] uppercase tracking-wider px-2.5 py-1 rounded border border-zinc-100 font-bold">
                                        {ACTIVITY_TYPES_MAP[activity.type] || activity.type}
                                    </span>
                                </div>
                            
                                <div className="flex gap-2 mt-4">
                                    <Link to={`/actividad/${activity.id}`} className="flex-1 bg-zinc-50 hover:bg-zinc-100 text-zinc-600 text-center py-2 rounded-lg text-xs font-bold transition-colors border border-zinc-200">
                                        Ver / Editar
                                    </Link>
                                    <button className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100">
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
    
                {viewState === 'empty' && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <BookOpen className="text-zinc-200 mb-6" size={64} />
                        <h3 className="text-xl font-bold text-zinc-900 mb-2">No tienes actividades</h3>
                        <p className="text-zinc-500 mb-6">Empieza por crear tu primera actividad evaluativa.</p>
                        <Link to="/crear" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">
                            Crear actividad
                        </Link>
                    </div>
                )}
    
                {viewState === 'error' && (
                    <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
                        <div className="w-48 h-48 bg-zinc-100 rounded-full flex items-center justify-center mb-8 border border-zinc-200 shadow-inner">
                            <AlertCircle size={80} className="text-zinc-300" strokeWidth={1} />
                        </div>
                        <p className="text-zinc-500 text-xl font-medium max-w-sm leading-relaxed">
                            Ha ocurrido un error cargando la información, <br />
                            <span className="text-blue-600 cursor-pointer hover:underline" onClick={() => window.location.reload()}>intentelo de nuevo.</span>
                        </p>
                    </div>
                )}
            </div>
        );
};

export default ActiviyPage;
