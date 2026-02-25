import React, { useState, useEffect } from 'react';
import {
    CheckCircle2,
    AlertCircle,
    BookOpen,
    UserCircle,
    Plus,
    ArrowUpRight,
    Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getActivities } from '../services/activityService';

const ProgressPage = () => {
    const [viewState, setViewState] = useState('loading'); // 'loading', 'success', 'empty', 'error'
    const [activities, setActivities] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            setViewState('loading');
            try {

                // En un escenario real
                // await getActivities();
                // Simulacion de carga de datos ( implementar api)
                await new Promise(resolve => setTimeout(resolve, 1200));

                const dummyActivities = [
                    { id: 1, name: 'Actividad 1', course: 'curso1', completed: 2, total: 3, type: 'Examen' },
                    { id: 2, name: 'Actividad 2', course: 'curso2', completed: 4, total: 4, type: 'Examen' },
                    { id: 3, name: 'Actividad 3', course: 'curso3', completed: 1, total: 4, type: 'Examen' },
                ];

                setActivities(dummyActivities);
                setViewState(dummyActivities.length > 0 ? 'success' : 'empty');
            } catch (err) {
                setViewState('error');
            }
        };

        loadData();
    }, []);

    // Calcular estadísticas dinámicamente
    const calculateStats = () => {
        const totalTasks = activities.reduce((acc, act) => acc + act.total, 0);
        const completedTasks = activities.reduce((acc, act) => acc + act.completed, 0);
        const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 1000) / 10 : 0;

        return {
            total: totalTasks,
            completed: completedTasks,
            percentage: percentage,
            activityCount: activities.length
        };
    };

    const stats = calculateStats();

    const renderHeader = () => (
        <div className="flex justify-between items-center mb-8 border-b border-zinc-100 pb-4">
            <h1 className="text-xl font-semibold text-zinc-800">Actividades</h1>
            <div className="flex items-center gap-2 text-zinc-700">
                <UserCircle className="text-blue-600" size={32} />
                <span className="font-medium text-sm">Estudiante</span>
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
                <div className="relative flex items-center justify-center w-24 h-24 rounded-full border-4 border-blue-600">
                    <span className="text-blue-600 font-bold text-xl">{stats.percentage}%</span>
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
                </div>
            </div>
        );
    };

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
                                    <h3 className="text-lg font-bold text-zinc-900">{activity.name}</h3>
                                    <p className="text-zinc-400 text-xs font-medium uppercase tracking-tight">{activity.course}</p>
                                </div>
                                <span className="bg-zinc-50 text-zinc-500 text-[10px] uppercase tracking-wider px-2.5 py-1 rounded border border-zinc-100 font-bold">
                                    {activity.type}
                                </span>
                            </div>
                            <p className="text-zinc-500 text-sm mb-2 font-medium">{activity.completed}/{activity.total} tareas</p>
                            <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden mb-4">
                                <div
                                    className="h-full bg-blue-600 transition-all duration-1000"
                                    style={{ width: `${(activity.completed / activity.total) * 100}%` }}
                                ></div>
                            </div>
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
                    <BookOpen className="text-zinc-800 mb-6" size={64} strokeWidth={1.5} />
                    <h3 className="text-3xl font-bold text-zinc-900 mb-6 tracking-tight">¿Deseas crear tu primera actividad?</h3>
                    <Link to="/crear" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl text-lg font-bold transition-all shadow-lg hover:shadow-xl active:scale-95">
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

export default ProgressPage;
