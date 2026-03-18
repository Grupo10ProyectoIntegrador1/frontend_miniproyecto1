import React from 'react';
import {
    CheckCircle2,
    AlertCircle,
    BookOpen,
    UserCircle,
    Plus,
    ArrowUpRight,
    Loader2,
    ClipboardList,
    CirclePlus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useActivities } from '../hooks/useActivities';
import { useAuth } from '../context/useAuth';

const ACTIVITY_TYPES_MAP = {
    'exam': 'Examen',
    'quiz': 'Quiz',
    'project': 'Proyecto',
    'homework': 'Tarea',
    'presentation': 'Presentación'
};

const ProgressPage = () => {
    const { activities, viewState, stats } = useActivities();
    const { user, loading: authLoading } = useAuth();

    const getProgressColor = (percentage) => {
        const clamped = Math.max(0, Math.min(100, Number(percentage) || 0));
        // 0% = red (0deg), 100% = green (120deg)
        const hue = (clamped / 100) * 120;
        return `hsl(${hue} 85% 45%)`;
    };

    const displayName = (() => {
        const fullName = `${user?.name ?? ''} ${user?.last_name ?? ''}`.trim();
        if (fullName) return fullName;
        return 'Estudiante';
    })();

    const renderHeader = () => (
        <div className="flex justify-between items-center mb-8 border-b border-zinc-100 pb-4">
            <h1 className="text-4xl font-extrabold text-[#0B1525] mb-2 tracking-tight">Progreso</h1>
            <div className="flex items-center gap-2 text-zinc-700">
                <UserCircle className="text-blue-600" size={32} />
                <span className="font-medium text-sm">{authLoading ? '...' : displayName}</span>
            </div>
        </div>
    );

    const renderProgressCard = (state) => {
        let title, subtext, barColor, percentageContent;

        if (state === 'success') {
            title = "Progreso General";
            subtext = `${stats.completed} de ${stats.total} tareas completadas en ${stats.activityCount} actividades.`;
            barColor = "bg-blue-600";
            percentageContent = (
                <div className="relative w-24 h-24">
                    <svg width={size} height={size} className="-rotate-90">
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="transparent"
                            stroke="rgb(228 228 231)"
                            strokeWidth={stroke}
                        />
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="transparent"
                            stroke="rgb(37 99 235)"
                            strokeWidth={stroke}
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={dashOffset}
                            className="transition-[stroke-dashoffset] duration-700"
                        />
                    </svg>

                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-xl">{progress}%</span>
                    </div>
                </div>
            );
        } else if (state === 'empty') {
            title = "Progreso General";
            subtext = "No tienes actividades creadas.";
            barColor = "bg-green-500";
            percentageContent = (
                <div className="flex items-center justify-center w-24 h-24 rounded-full border-4 border-blue-600 text-blue-600">
                    <CheckCircle2 size={48} />
                </div>
            );
        } else if (state === 'error') {
            title = "Progreso General";
            subtext = "No se han podido cargar las tareas.";
            barColor = "bg-red-600";
            percentageContent = (
                <div className="flex items-center justify-center w-24 h-24 rounded-full border-4 border-zinc-200 text-zinc-300">
                    <span className="text-4xl font-light">X</span>
                </div>
            );
        }

        return (
            <div className="bg-zinc-50/50 border border-zinc-100 rounded-xl p-8 mb-8 flex items-center gap-8">
                {percentageContent}
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-zinc-900 mb-1">{title}</h2>
                    <p className="text-zinc-500 text-sm mb-4">{subtext}</p>
                    <div className="w-full bg-zinc-200 h-2.5 rounded-full overflow-hidden">
                        <div
                            className={`h-full ${barColor} transition-all duration-700`}
                            style={{ width: state === 'success' ? `${stats.percentage}%` : '100%' }}
                        ></div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium bg-green-50 border-green-200 text-green-700">
                            <span className="h-2.5 w-2.5 rounded-full bg-green-500"></span>
                            {stats.completed} Completadas
                        </span>

                        <span className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium bg-zinc-50 border-zinc-200 text-zinc-700">
                            <span className="h-2.5 w-2.5 rounded-full bg-zinc-500"></span>
                            {stats.pending} Pendientes
                        </span>

                        <span className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium bg-amber-50 border-amber-200 text-amber-700">
                            <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
                            {stats.postponed} Pospuestas
                        </span>

                        <span className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium bg-red-50 border-red-200 text-red-700">
                            <span className="h-2.5 w-2.5 rounded-full bg-red-500"></span>
                            {stats.overdue} Vencidas
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    const size = 96;
    const stroke = 8;
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.max(0, Math.min(100, stats.percentage));
    const dashOffset = circumference * (1 - progress / 100);

    if (viewState === 'loading') {
        return (
            <div className="p-8 max-w-5xl mx-auto">
                {renderHeader()}
                <div className="flex flex-col items-center justify-center h-[60vh]">
                    <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
                    <p className="text-zinc-500 font-medium">Cargando progreso...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-5xl mx-auto">
            {renderHeader()}

            <div className="flex justify-between items-center mb-6">
                <p className="text-zinc-400 text-sm font-medium">
                    {viewState === 'success' ? `${stats.activityCount} actividades` :
                        viewState === 'empty' ? '0 actividades' : 'Error cargando las actividades.'}
                </p>
                {(viewState === 'success' || viewState === 'empty') && (
                    <Link to="/crear" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all shadow-sm hover:shadow">
                        <div className="bg-white/20 rounded-full p-0.5"><Plus size={14} /></div>
                        Crear actividad
                    </Link>
                )}
            </div>

            {renderProgressCard(viewState)}

            {viewState === 'success' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {activities.map(activity => (
                        <div key={activity.id} className="bg-white border border-zinc-100 rounded-xl p-6 hover:shadow-md transition-all duration-300">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-zinc-900">{activity.title || activity.name}</h3>
                                    <p className="text-zinc-400 text-xs font-medium uppercase tracking-tight">{activity.course}</p>
                                </div>
                                <span className="bg-zinc-50 text-zinc-500 text-[10px] uppercase tracking-wider px-2.5 py-1 rounded border border-zinc-100 font-bold">
                                    {ACTIVITY_TYPES_MAP[activity.type] || activity.type}
                                </span>
                            </div>
                            <p className="text-zinc-500 text-sm mb-2 font-medium">{(activity.completed || 0)}/{(activity.total || 0)} tareas</p>
                            {(activity.total || 0) > 0 ? (
                                <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden mb-4">
                                    <div
                                        className="h-full transition-all duration-1000"
                                        style={{
                                            width: `${(activity.completed / activity.total) * 100}%`,
                                            backgroundColor: getProgressColor((activity.completed / activity.total) * 100),
                                        }}
                                    ></div>
                                </div>
                            ) : (
                                <div className="w-full mb-4 px-4 py-3 rounded-lg bg-[#F8FAFC] border border-dashed border-zinc-300 text-zinc-500 text-sm font-semibold text-center">
                                    Sin tareas asignadas
                                </div>
                            )}
                            <Link to={`/actividad/${activity.id}`} className="text-zinc-500 hover:text-blue-600 text-xs font-bold flex items-center gap-1.5 transition-colors group">
                                <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                Ver detalle
                            </Link>
                        </div>
                    ))}
                </div>
            )}

            {viewState === 'empty' && (
                <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
                    <div className="w-28 h-28 rounded-full bg-[#EFF6FF] flex items-center justify-center mb-6">
                        <ClipboardList className="text-[#93C5FD]" size={64} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-3xl font-bold text-zinc-900 mb-6 tracking-tight">No hay actividades aún</h3>
                    <p className="text-zinc-500 text-lg mb-8 max-w-md leading-relaxed">
                        Parece que tu tablero está vacío. Comienza a organizar tu progreso creando tu primera actividad para hacer seguimiento de tus tareas y metas. <br />
                    </p>
                    <Link to="/crear" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl text-lg font-bold transition-all shadow-lg hover:shadow-xl active:scale-95 inline-flex items-center justify-center gap-3">
                        <CirclePlus className="text-white" size={22} />
                        Crear mi primera actividad
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

export default ProgressPage;
