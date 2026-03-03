import React, { useState } from 'react';
import { useActivities } from '../hooks/useActivities';
import { UserCircle, BookOpen, AlertCircle, HelpCircle, Calendar, Clock, CheckCircle2, RotateCcw, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getLocalTodayStr } from '../utils/dateUtils';

const ACTIVITY_TYPES_MAP = {
    'exam': 'Examen',
    'quiz': 'Quiz',
    'project': 'Proyecto',
    'homework': 'Tarea',
    'presentation': 'Presentación'
};

const formatDateShort = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + "T00:00:00");
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return `${d.getDate()} ${months[d.getMonth()]}`;
};

const HoyPage = () => {
    const { activities = [], viewState, reload } = useActivities();
    const [daysFilter, setDaysFilter] = useState('');
    const [courseFilter, setCourseFilter] = useState('Todos');
    const [statusFilter, setStatusFilter] = useState('Todos');

    const renderHeader = () => (
        <div className="flex justify-between items-start mb-8 pb-0">
            <div>
                <h1 className="text-4xl font-extrabold text-[#0B1525] mb-2 tracking-tight">Hoy</h1>
                <p className="text-zinc-500 text-sm font-medium">Gestiona y planifica tus compromisos académicos</p>
            </div>
            <div className="hidden md:flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-zinc-200/80 shadow-sm">
                <div className="text-right">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none mb-1">Perfil</p>
                    <span className="font-bold text-sm text-zinc-800 tracking-tight">Estudiante</span>
                </div>
                <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-400 border border-zinc-200">
                    <UserCircle size={28} strokeWidth={1.5} />
                </div>
            </div>
        </div>
    );

    const courses = ['Todos', ...new Set(activities.map(a => a.course).filter(Boolean))];

    const renderFilters = () => (
        <div className="flex flex-wrap items-end gap-6 mb-10 pb-6 border-b border-zinc-100">
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-500">Curso</label>
                <select
                    value={courseFilter}
                    onChange={(e) => setCourseFilter(e.target.value)}
                    className="border border-zinc-200 rounded-lg px-3 py-2 text-sm font-medium text-zinc-800 outline-none focus:border-blue-500 bg-white"
                >
                    {courses.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-500">Estado</label>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-zinc-200 rounded-lg px-3 py-2 text-sm font-medium text-zinc-800 outline-none focus:border-blue-500 bg-white"
                >
                    <option value="Todos">Todos</option>
                    <option value="Pendientes">Pendientes</option>
                    <option value="Completados">Completados</option>
                </select>
            </div>
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-500">Días</label>
                <input
                    type="number"
                    value={daysFilter}
                    onChange={(e) => setDaysFilter(e.target.value === '' ? '' : Number(e.target.value))}
                    min={0}
                    placeholder="Todos"
                    className="border border-zinc-200 rounded-lg px-3 py-2 text-sm font-medium text-zinc-800 outline-none focus:border-blue-500 bg-white w-20"
                />
            </div>
            <div className="ml-auto">
                <button className="flex items-center gap-1.5 justify-center text-blue-500 text-sm font-semibold hover:text-blue-600 transition-colors">
                    <HelpCircle size={16} />
                    ¿Cómo se ordena?
                </button>
            </div>
        </div>
    );

    // Logic to filter and group activities
    const todayStr = getLocalTodayStr();
    const getNextDaysStr = (days) => {
        const d = new Date();
        d.setDate(d.getDate() + days);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    const nextDaysStr = daysFilter !== '' ? getNextDaysStr(daysFilter) : null;

    const filteredActivities = activities.filter(a => {
        if (courseFilter !== 'Todos' && a.course !== courseFilter) return false;

        const isCompleted = a.completed === a.total && a.total > 0;
        if (statusFilter === 'Pendientes' && isCompleted) return false;
        if (statusFilter === 'Completados' && !isCompleted) return false;

        return true;
    });

    const vencidas = filteredActivities.filter(a => a.due_date < todayStr);
    const paraHoy = filteredActivities.filter(a => a.due_date === todayStr);
    const proximas = filteredActivities.filter(a => a.due_date > todayStr && (!nextDaysStr || a.due_date <= nextDaysStr));

    const ActivityCard = ({ activity, badgeText, badgeClassName }) => {
        let icon = '📝';
        if (activity.type === 'project') icon = '💻';
        if (activity.type === 'exam' || activity.type === 'quiz') icon = '📚';
        if (activity.type === 'presentation') icon = '📊';

        return (
            <div className="bg-white border border-zinc-100 rounded-2xl p-5 hover:shadow-sm transition-all shadow-sm mb-4">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <Link to={`/actividad/${activity.id}`}>
                            <h3 className="text-[17px] font-bold text-zinc-900 leading-tight mb-2 hover:text-blue-600 transition-colors">{activity.title}</h3>
                        </Link>
                        <div className="flex items-center gap-2 text-sm text-zinc-500 font-medium">
                            <span>{icon}</span>
                            {ACTIVITY_TYPES_MAP[activity.type] || activity.type} {activity.course ? `- ${activity.course}` : ''}
                        </div>
                    </div>
                    {badgeText && (
                        <span className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${badgeClassName}`}>
                            {badgeText}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-5 text-zinc-400 text-xs font-semibold mb-6">
                    <div className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        {formatDateShort(activity.due_date)}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Clock size={14} />
                        {activity.weight ? `${activity.weight}% del curso` : 'Sin peso asignado'}
                    </div>
                </div>

                <div className="flex gap-3">
                    <button className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-5 py-2 rounded-xl transition-colors">
                        <CheckCircle2 size={18} /> Hecha
                    </button>
                    <button className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-sm font-bold px-5 py-2 rounded-xl transition-colors">
                        <Clock size={18} /> Posponer
                    </button>
                    <button className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-sm font-bold px-5 py-2 rounded-xl transition-colors">
                        <RotateCcw size={18} /> Reprogramar
                    </button>
                </div>
            </div>
        );
    };

    const renderSuccess = () => (
        <div className="flex flex-col gap-8">
            {vencidas.length > 0 && (
                <section>
                    <h2 className="text-xl font-bold text-red-600 mb-4 flex items-center gap-2">
                        Vencidas
                        <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">{vencidas.length}</span>
                    </h2>
                    {vencidas.map(act => (
                        <ActivityCard
                            key={act.id}
                            activity={act}
                            badgeText="Vencida"
                            badgeClassName="bg-red-600 text-white"
                        />
                    ))}
                </section>
            )}

            {paraHoy.length > 0 && (
                <section>
                    <h2 className="text-xl font-bold text-blue-500 mb-4 flex items-center gap-2">
                        Para hoy
                        <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">{paraHoy.length}</span>
                    </h2>
                    {paraHoy.map(act => (
                        <ActivityCard
                            key={act.id}
                            activity={act}
                            badgeText="Para hoy"
                            badgeClassName="bg-blue-500 text-white"
                        />
                    ))}
                </section>
            )}

            {proximas.length > 0 && (
                <section className="mb-10">
                    <h2 className="text-xl font-bold text-zinc-800 mb-4 flex items-center gap-2">
                        Próximas {daysFilter !== '' ? `(${daysFilter} días)` : ''}
                        <span className="bg-zinc-200 text-zinc-600 text-xs px-2 py-0.5 rounded-full">{proximas.length}</span>
                    </h2>
                    {proximas.map(act => (
                        <ActivityCard
                            key={act.id}
                            activity={act}
                            badgeText="Pendiente"
                            badgeClassName="bg-zinc-200 text-zinc-600"
                        />
                    ))}
                </section>
            )}

            {vencidas.length === 0 && paraHoy.length === 0 && proximas.length === 0 && (
                <div className="text-center py-10">
                    <p className="text-zinc-500 font-medium">No hay actividades que coincidan con los filtros en este rango de fechas.</p>
                </div>
            )}
        </div>
    );

    return (
        <div className="p-8 max-w-5xl mx-auto min-h-screen bg-[#F8FAFC]">
            {renderHeader()}
            {renderFilters()}

            {viewState === 'loading' && (
                <div className="flex flex-col items-center justify-center py-32 text-center">
                    <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
                    <p className="text-zinc-500 font-medium">Cargando tu planificación...</p>
                </div>
            )}

            {viewState === 'success' && renderSuccess()}

            {viewState === 'empty' && (
                <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in zoom-in duration-500">
                    <BookOpen className="text-[#1e293b] mb-6" size={80} strokeWidth={1.5} />
                    <h3 className="text-[22px] font-medium text-[#1e293b] mb-8">¿Deseas crear tu primera actividad?</h3>
                    <Link to="/crear" className="bg-[#3b82f6] hover:bg-blue-600 text-white px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-lg active:scale-95">
                        Crear actividad
                    </Link>
                </div>
            )}

            {viewState === 'error' && (
                <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in duration-500">
                    <div className="w-40 h-40 bg-[#cbd5e1] rounded-full flex items-center justify-center mb-8">
                        <AlertCircle size={70} className="text-white" strokeWidth={2} />
                    </div>
                    <p className="text-[#94a3b8] text-lg font-medium max-w-md leading-relaxed mb-6">
                        Ha ocurrido un error cargando la información,
                        <br />inténtelo de nuevo.
                    </p>
                    <button
                        onClick={() => reload()}
                        className="flex items-center gap-2 bg-[#3b82f6] hover:bg-blue-600 text-white px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-lg active:scale-95"
                    >
                        <RotateCcw size={18} /> Reintentar
                    </button>
                </div>
            )}
        </div>
    );
};

export default HoyPage;
