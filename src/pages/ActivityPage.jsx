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
import { deleteActivity } from '../services/activityService';
import { useAuth } from '../context/useAuth';
import { getStoredDailyCapacityConflict, syncDailyCapacityConflictWithBackend } from '../utils/dailyCapacityConflict';
import { StreakWidget } from '../components/StreakWidget';

const ACTIVITY_TYPES_MAP = {
    'exam': 'Examen',
    'quiz': 'Quiz',
    'project': 'Proyecto',
    'homework': 'Tarea',
    'presentation': 'Presentación'
};

const ActivityPage = () => {
    const { activities = [], viewState, reload } = useActivities();
    const { user, loading: authLoading } = useAuth();
    const [deletingId, setDeletingId] = React.useState(null)
    const [dailyCapacityConflict, setDailyCapacityConflict] = React.useState(null)
    const [searchTerm, setSearchTerm] = React.useState('');
    const [itemsPerPage, setItemsPerPage] = React.useState(5);
    const [currentPage, setCurrentPage] = React.useState(1);

    React.useEffect(() => {
        const loadStored = () => {
            setDailyCapacityConflict(getStoredDailyCapacityConflict())
        }

        const onConflictEvent = (evt) => {
            setDailyCapacityConflict(evt?.detail || null)
        }

        loadStored()
        window.addEventListener('daily-capacity-conflict', onConflictEvent)
        return () => window.removeEventListener('daily-capacity-conflict', onConflictEvent)
    }, [])

    const displayName = (() => {
        const fullName = `${user?.name ?? ''} ${user?.last_name ?? ''}`.trim();
        if (fullName) return fullName;
        return 'Estudiante';
    })();

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar esta actividad?')) return
        setDeletingId(id)
        try {
            await deleteActivity(id)
            reload() // Recarga la lista después de eliminar
            await syncDailyCapacityConflictWithBackend()
        } catch {
            alert('Ocurrió un error al eliminar la actividad. Intenta de nuevo.')
        } finally {
            setDeletingId(null)
        }
    }

    const renderHeader = () => (
        <div className="flex justify-between items-start mb-10 pb-6 border-b border-zinc-100">
            <div className="flex gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-[#0B1525] mb-2 tracking-tight">Actividades</h1>
                    <p className="text-zinc-500 text-sm font-medium">
                        Gestiona y planifica tus compromisos académicos
                    </p>
                </div>
            </div>
            <div className="hidden md:flex">
                <StreakWidget />
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
        <div className="p-8 w-full min-h-screen bg-[#F8FAFC]">
            {renderHeader()}

            {viewState !== 'error' && (
                <>
                    <div className="flex flex-col gap-4 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    placeholder="Buscar actividades..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full border border-zinc-200 rounded-lg px-4 py-2.5 text-sm font-medium text-zinc-800 outline-none focus:border-blue-500 bg-white"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-zinc-600">Mostrar:</span>
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => {
                                        setItemsPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="border border-zinc-200 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-800 outline-none focus:border-blue-500 bg-white"
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={15}>15</option>
                                    <option value={20}>20</option>
                                </select>
                            </div>

                            <Link
                                to="/crear"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all shadow-sm hover:shadow"
                            >
                                <Plus size={16} />
                                Nueva actividad
                            </Link>
                        </div>
                    </div>
                </>
            )}

            {viewState === 'loading' && (
                <div className="flex flex-col items-center justify-center h-[60vh]">
                    <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
                    <p className="text-zinc-500 font-medium">Cargando actividades...</p>
                </div>
            )}

            {viewState === 'success' && (
                <>
                    {filteredActivities.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[40vh] text-center">
                            <BookOpen size={48} className="text-zinc-300 mb-4" />
                            <p className="text-zinc-500 font-medium">No se encontraron actividades</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-col gap-2 mb-6">
                                {paginatedActivities.map((activity) => {
                                    const statusBadge = getStatusBadge(activity);
                                    const isConflict = (() => {
                                        const storedIds = dailyCapacityConflict?.activityIds;
                                        if (Array.isArray(storedIds) && storedIds.includes(activity.id)) {
                                            return true;
                                        }

                                        const conflictDates = dailyCapacityConflict?.conflictDates ||
                                            dailyCapacityConflict?.conflicts?.map(c => c.date) || [];
                                        if (!Array.isArray(conflictDates) || conflictDates.length === 0) {
                                            return false;
                                        }

                                        const subtasks = Array.isArray(activity?.subtasks) ? activity.subtasks : [];
                                        return subtasks.some((s) =>
                                            Boolean(s?.target_date) &&
                                            conflictDates.includes(s.target_date) &&
                                            s.status !== 'done' &&
                                            s.status !== 'postponed'
                                        );
                                    })();

                                    return (
                                        <div
                                            key={activity.id}
                                            className={`bg-white border rounded-lg p-4 hover:shadow-md transition-all duration-300 flex items-center justify-between ${
                                                isConflict ? 'border-red-300 bg-red-50' : 'border-zinc-200'
                                            }`}
                                        >
                                            <div className="flex-1 flex items-center gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-sm font-bold text-zinc-900 truncate">
                                                        {activity.title}
                                                    </h3>
                                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                        <span className="text-xs font-bold uppercase bg-zinc-100 text-zinc-700 px-2 py-1 rounded border border-zinc-200">
                                                            {ACTIVITY_TYPES_MAP[activity.type] || activity.type}
                                                        </span>
                                                        <span
                                                            className={`text-xs font-semibold px-2 py-1 rounded border ${statusBadge.className}`}
                                                        >
                                                            {statusBadge.text}
                                                        </span>
                                                        {activity.course && (
                                                            <span className="text-xs text-zinc-500 font-medium">
                                                                {activity.course}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="text-right ml-4">
                                                    <div className="text-xs text-zinc-500 font-medium mb-1">
                                                        {activity.due_date && (
                                                            <>
                                                                <Calendar size={12} className="inline mr-1" />
                                                                {activity.due_date}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-right ml-6 min-w-fit">
                                                <div className="text-xs text-zinc-600 font-bold mb-2">
                                                    {activity.completed_subtasks || 0}/{activity.total_subtasks || 0} tareas
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Link
                                                        to={`/actividad/${activity.id}`}
                                                        className="text-xs font-bold text-zinc-600 hover:text-blue-600 transition-colors px-3 py-1.5 border border-zinc-200 rounded-lg flex items-center gap-1"
                                                    >
                                                        <Eye size={14} />
                                                        Ver
                                                    </Link>
                                                    <Link
                                                        to={`/actividad/${activity.id}?edit=true`}
                                                        className="text-xs font-bold text-zinc-600 hover:text-zinc-900 transition-colors px-3 py-1.5 border border-zinc-200 rounded-lg flex items-center gap-1"
                                                    >
                                                        <Pencil size={14} />
                                                        Editar
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(activity.id)}
                                                        disabled={deletingId === activity.id}
                                                        className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors px-3 py-1.5 border border-red-200 rounded-lg flex items-center gap-1 disabled:opacity-50"
                                                    >
                                                        <Trash2 size={14} />
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {totalPages > 1 && (
                                <div className="flex items-center justify-between mt-6 pt-4 border-t border-zinc-200">
                                    <p className="text-xs text-zinc-500 font-medium">
                                        Mostrando {startIdx + 1} a {Math.min(startIdx + itemsPerPage, filteredActivities.length)} de {filteredActivities.length} actividades
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                            className="text-xs font-bold text-zinc-600 hover:text-zinc-900 disabled:text-zinc-300 px-3 py-1.5 border border-zinc-200 rounded-lg transition-colors"
                                        >
                                            ← Previous
                                        </button>

                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                                <button
                                                    key={page}
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`text-xs font-bold px-2.5 py-1.5 rounded-lg transition-colors ${
                                                        currentPage === page
                                                            ? 'bg-blue-600 text-white'
                                                            : 'text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
                                                    }`}
                                                >
                                                    {page}
                                                </button>
                                            ))}
                                        </div>

                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                            disabled={currentPage === totalPages}
                                            className="text-xs font-bold text-zinc-600 hover:text-zinc-900 disabled:text-zinc-300 px-3 py-1.5 border border-zinc-200 rounded-lg transition-colors"
                                        >
                                            Next →
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}

            {viewState === 'error' && (
                <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                    <AlertCircle size={64} className="text-zinc-300 mb-4" />
                    <p className="text-zinc-500 font-medium">Ocurrió un error al cargar las actividades</p>
                </div>
            )}
        </div>
    );
};

export default ActivityPage;