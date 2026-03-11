import React, { useState, useEffect } from 'react';
import { useTodaySubtasks } from '../hooks/useTodaySubtasks';
import { getActivities } from '../services/activityService';
import { updateSubtask } from '../services/subtaskService';
import { getLocalTodayStr } from '../utils/dateUtils';
import { parseOverloadError } from '../utils/errorUtils';
import Modal from '../components/Modal';
import { UserCircle, AlertCircle, HelpCircle, Calendar, Clock, CheckCircle2, CalendarClock, Loader2, Coffee, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';


const ACTIVITY_TYPES_MAP = {
    'exam': 'Examen',
    'quiz': 'Quiz',
    'project': 'Proyecto',
    'homework': 'Tarea',
    'presentation': 'Presentación'
};

const STATUS_TO_API = {
    'Todos': '',
    'Pendiente': 'pending',
    'Completada': 'done',
    'Postergada': 'postponed',
    'Vencida': 'overdue',
};

const STATUS_BADGE = {
    'pending': { text: 'Pendiente', className: 'bg-zinc-200 text-zinc-600' },
    'done': { text: 'Completada', className: 'bg-green-100 text-green-700' },
    'postponed': { text: 'Postergada', className: 'bg-yellow-100 text-yellow-700' },
    'overdue': { text: 'Vencida', className: 'bg-red-600 text-white' },
};

const formatDateShort = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + "T00:00:00");
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return `${d.getDate()} ${months[d.getMonth()]}`;
};

const getBadge = (subtask, groupDefault) => {
    return STATUS_BADGE[subtask.status] || groupDefault;
};

const HoyPage = () => {
    const { data, viewState, setFilters, reload } = useTodaySubtasks();
    const { overdue, today: todayTasks, upcoming } = data;

    const [courses, setCourses] = useState(['Todos']);
    const [courseFilter, setCourseFilter] = useState('Todos');
    const [statusFilter, setStatusFilter] = useState('Todos');
    const [daysFilter, setDaysFilter] = useState('');

    const [conflictModal, setConflictModal] = useState({
        isOpen: false,
        subtask: null, // La subtarea que causó el problema
        conflictData: null // El objeto de error que mande el backend
    });

    // Cargar lista de cursos para el dropdown
    useEffect(() => {
        getActivities()
            .then(activities => {
                const unique = [...new Set(activities.map(a => a.course).filter(Boolean))];
                setCourses(['Todos', ...unique]);
            })
            .catch(() => { });
    }, []);

    const handleCourseChange = (value) => {
        setCourseFilter(value);
        setFilters(prev => ({ ...prev, course: value === 'Todos' ? '' : value }));
    };

    const handleStatusChange = (value) => {
        setStatusFilter(value);
        setFilters(prev => ({ ...prev, status: STATUS_TO_API[value] || '' }));
    };

    const handleDaysChange = (value) => {
        setDaysFilter(value);
        setFilters(prev => ({ ...prev, days: value }));
    };

    const hasActiveFilters = courseFilter !== 'Todos' || statusFilter !== 'Todos' || daysFilter !== '';


    const [rescheduleModal, setRescheduleModal] = useState({
        isOpen: false,
        subtask: null,
        newDate: ''
    });
    const [isRescheduling, setIsRescheduling] = useState(false);
    const [alertModal, setAlertModal] = useState({
        isOpen: false,
        type: 'success', // 'success' o 'error'
        title: '',
        message: ''
    });

    const [reduceModal, setReduceModal] = useState({
        isOpen: false,
        subtask: null,
        newDate: '',
        newHours: 0
    });
    const [isReducing, setIsReducing] = useState(false);

    const handleOpenReschedule = (subtask) => {
        setRescheduleModal({
            isOpen: true,
            subtask: subtask,
            newDate: subtask.target_date || ''
        });
    };

    const handleCloseReschedule = () => {
        setRescheduleModal({ isOpen: false, subtask: null, newDate: '' });
    };

    const handleRescheduleConfirm = async () => {
        if (!rescheduleModal.subtask || !rescheduleModal.newDate) return;

        setIsRescheduling(true);
        try {
            await updateSubtask(rescheduleModal.subtask.id, { target_date: rescheduleModal.newDate });

            // Si todo sale bien
            setAlertModal({
                isOpen: true,
                type: 'success',
                title: 'Reprogramar',
                message: 'La fecha de la subtarea se actualizó correctamente.'
            });
            handleCloseReschedule();
            reload();

        } catch (error) {
            const { isOverloadConflict, conflictMessage, errorMessage } = parseOverloadError(error, 'Ha ocurrido un error reprogramando la subtarea.');

            if (isOverloadConflict) {
                handleCloseReschedule();

                setConflictModal({
                    isOpen: true,
                    subtask: rescheduleModal.subtask,
                    conflictData: { message: conflictMessage || errorMessage, attemptedDate: rescheduleModal.newDate }
                });
                return;
            }

            setAlertModal({
                isOpen: true,
                type: 'error',
                title: 'Error al actualizar',
                message: errorMessage
            });
            handleCloseReschedule();

        } finally {
            setIsRescheduling(false);
        }
    };

    const handleOpenReduce = (subtask, newDate) => {
        setReduceModal({
            isOpen: true,
            subtask: subtask,
            newDate: newDate,
            newHours: subtask.estimated_hours || 1
        });
    };

    const handleCloseReduce = () => {
        setReduceModal({ isOpen: false, subtask: null, newDate: '', newHours: 0 });
    };

    const handleReduceConfirm = async () => {
        if (!reduceModal.subtask || !reduceModal.newDate || reduceModal.newHours <= 0) return;

        setIsReducing(true);
        try {
            await updateSubtask(reduceModal.subtask.id, {
                target_date: reduceModal.newDate,
                estimated_hours: reduceModal.newHours
            });

            // Éxito: solo cerramos y recargamos para no saturar de modales
            handleCloseReduce();
            reload();

        } catch (error) {
            const { isOverloadConflict, conflictMessage, errorMessage } = parseOverloadError(error, 'Ha ocurrido un error al actualizar las horas.');

            if (isOverloadConflict) {
                handleCloseReduce();
                setConflictModal({
                    isOpen: true,
                    subtask: reduceModal.subtask,
                    conflictData: { message: conflictMessage || errorMessage, attemptedDate: reduceModal.newDate }
                });
                return;
            }

            setAlertModal({
                isOpen: true,
                type: 'error',
                title: 'Error al actualizar',
                message: errorMessage
            });
            handleCloseReduce();

        } finally {
            setIsReducing(false);
        }
    };


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

    const renderFilters = () => (
        <div className="flex flex-wrap items-end gap-6 mb-10 pb-6 border-b border-zinc-100">
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-500">Curso</label>
                <select
                    value={courseFilter}
                    onChange={(e) => handleCourseChange(e.target.value)}
                    className="border border-zinc-200 rounded-lg px-3 py-2 text-sm font-medium text-zinc-800 outline-none focus:border-blue-500 bg-white"
                >
                    {courses.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-500">Estado</label>
                <select
                    value={statusFilter}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="border border-zinc-200 rounded-lg px-3 py-2 text-sm font-medium text-zinc-800 outline-none focus:border-blue-500 bg-white"
                >
                    <option value="Todos">Todos</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="Completada">Completada</option>
                    <option value="Postergada">Postergada</option>
                    <option value="Vencida">Vencida</option>
                </select>
            </div>
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-500">Días</label>
                <input
                    type="number"
                    value={daysFilter}
                    onChange={(e) => handleDaysChange(e.target.value === '' ? '' : Number(e.target.value))}
                    min={0}
                    placeholder="Todos"
                    className="border border-zinc-200 rounded-lg px-3 py-2 text-sm font-medium text-zinc-800 outline-none focus:border-blue-500 bg-white w-20"
                />
            </div>
            <div className="ml-auto relative group mb-3">
                <button className="flex items-center gap-1.5 justify-center text-blue-500 text-sm font-semibold hover:text-blue-600 transition-colors">
                    <HelpCircle size={16} />
                    ¿Cómo se ordena?
                </button>
                <div className="absolute right-0 top-full mt-2 w-96 bg-zinc-800 text-zinc-200 text-xs rounded-xl p-3 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none leading-relaxed">
                    <span className="font-bold text-white block mb-1">Regla de prioridad</span>
                    Las subtareas se agrupan en Vencidas, Para hoy y Próximas según su fecha objetivo.
                    Dentro de cada grupo se ordenan por fecha (más antigua/cercana primero).
                    En caso de empate, se muestra primero la de menor esfuerzo estimado.
                </div>
            </div>
        </div>
    );

    const SubtaskCard = ({ subtask, badgeText, badgeClassName }) => {
        const parent = subtask.parent_activity;
        let icon = '📝';
        if (parent.type === 'project') icon = '💻';
        if (parent.type === 'exam' || parent.type === 'quiz') icon = '📚';
        if (parent.type === 'presentation') icon = '📊';

        return (
            <div className="bg-white border border-zinc-100 rounded-2xl p-5 hover:shadow-sm transition-all shadow-sm mb-4">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <Link to={`/actividad/${parent.id}`}>
                            <h3 className="text-[17px] font-bold text-zinc-900 leading-tight mb-1 hover:text-blue-600 transition-colors">
                                {subtask.title}
                            </h3>
                        </Link>
                        <p className="text-sm text-zinc-500 mb-2">De: {parent.title}</p>
                        <div className="flex items-center gap-2 text-sm text-zinc-500 font-medium">
                            <span>{icon}</span>
                            {ACTIVITY_TYPES_MAP[parent.type] || parent.type} {parent.course ? `- ${parent.course}` : ''}
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
                        {formatDateShort(subtask.target_date)}
                    </div>
                    {subtask.estimated_hours && (
                        <div className="flex items-center gap-1.5">
                            <Clock size={14} />
                            {subtask.estimated_hours}h estimadas
                        </div>
                    )}
                </div>

                <div className="flex gap-2">
                    <button className="flex-1 max-w-[160px] flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors">
                        <CheckCircle2 size={18} /> Hecha
                    </button>
                    <button title="Posponer" className="w-14 flex flex-shrink-0 items-center justify-center bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-xl transition-colors">
                        <Clock size={18} />
                    </button>
                    <button
                        onClick={() => handleOpenReschedule(subtask)}
                        title="Reprogramar"
                        className="w-14 flex flex-shrink-0 items-center justify-center bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-xl transition-colors">
                        <CalendarClock size={18} />
                    </button>
                </div>
            </div>
        );
    };

    const renderSuccess = () => (
        <div className="flex flex-row gap-6 overflow-x-auto pb-8 items-start w-full snap-x">
            {overdue.length > 0 && (
                <section className="flex-1 min-w-[340px] bg-zinc-50 rounded-2xl p-5 border border-zinc-200/60 snap-start">
                    <h2 className="text-xl font-bold text-red-600 mb-5 flex items-center gap-2">
                        Vencidas
                        <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">{overdue.length}</span>
                    </h2>
                    <div className="flex flex-col">
                        {overdue.map(sub => {
                            const badge = getBadge(sub, { text: 'Vencida', className: 'bg-red-600 text-white' });
                            return <SubtaskCard key={sub.id} subtask={sub} badgeText={badge.text} badgeClassName={badge.className} />;
                        })}
                    </div>
                </section>
            )}

            {todayTasks.length > 0 && (
                <section className="flex-1 min-w-[340px] bg-zinc-50 rounded-2xl p-5 border border-zinc-200/60 snap-start">
                    <h2 className="text-xl font-bold text-blue-500 mb-5 flex items-center gap-2">
                        Para hoy
                        <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">{todayTasks.length}</span>
                    </h2>
                    <div className="flex flex-col">
                        {todayTasks.map(sub => {
                            const badge = getBadge(sub, { text: 'Para hoy', className: 'bg-blue-500 text-white' });
                            return <SubtaskCard key={sub.id} subtask={sub} badgeText={badge.text} badgeClassName={badge.className} />;
                        })}
                    </div>
                </section>
            )}

            {upcoming.length > 0 && (
                <section className="flex-1 min-w-[340px] bg-zinc-50 rounded-2xl p-5 border border-zinc-200/60 snap-start">
                    <h2 className="text-xl font-bold text-zinc-800 mb-5 flex items-center gap-2">
                        Próximas {daysFilter !== '' ? `(${daysFilter} días)` : ''}
                        <span className="bg-zinc-200 text-zinc-600 text-xs px-2 py-0.5 rounded-full">{upcoming.length}</span>
                    </h2>
                    <div className="flex flex-col">
                        {upcoming.map(sub => {
                            const badge = getBadge(sub, { text: 'Pendiente', className: 'bg-zinc-200 text-zinc-600' });
                            return <SubtaskCard key={sub.id} subtask={sub} badgeText={badge.text} badgeClassName={badge.className} />;
                        })}
                    </div>
                </section>
            )}
        </div>
    );

    const renderModals = () => (
        <>
            {/* Modal Reprogramar */}
            <Modal
                isOpen={rescheduleModal.isOpen}
                onClose={handleCloseReschedule}
                onConfirm={handleRescheduleConfirm}
                title="Reprogramar"
                confirmText="Reprogramar"
                showCancel={true}
                isLoading={isRescheduling}
            >
                <div className="py-2">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-zinc-700">Elige una nueva fecha</label>
                        <input
                            type="date"
                            value={rescheduleModal.newDate}
                            onChange={(e) => setRescheduleModal({ ...rescheduleModal, newDate: e.target.value })}
                            className="w-full border border-zinc-300 rounded-lg px-4 py-3 text-sm font-medium text-zinc-800 outline-none focus:border-blue-500"
                        />
                    </div>
                </div>
            </Modal>

            {/* Modal Alerta */}
            <Modal
                isOpen={alertModal.isOpen}
                onClose={() => setAlertModal({ isOpen: false, type: 'success', title: '', message: '' })}
                onConfirm={() => setAlertModal({ isOpen: false, type: 'success', title: '', message: '' })}
                title={alertModal.title}
                message={alertModal.message}
                type={alertModal.type}
                confirmText="Aceptar"
            />
        </>
    );

    const renderConflictModal = () => (
        <Modal
            isOpen={conflictModal.isOpen}
            onClose={() => setConflictModal({ isOpen: false, subtask: null, conflictData: null })}
            title="¡Sobrecarga Detectada!"
        >
            {conflictModal.conflictData && (
                <div className="flex flex-col gap-4 text-gray-700">
                    {/* Mensaje de advertencia */}
                    <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-md">
                        <p className="text-orange-700 font-medium">
                            {conflictModal.conflictData.message}
                        </p>
                        <p className="text-sm text-orange-600 mt-1">
                            Intentar realizar esta tarea superará tu límite diario. ¿Qué deseas hacer?
                        </p>
                    </div>

                    {/* Opciones */}
                    <div className="flex flex-col gap-3 mt-2">

                        {/* Opción 1: Mover */}
                        <button
                            onClick={() => {
                                // Cierra este modal y abre el de elegir fecha de nuevo
                                const subtask = conflictModal.subtask;
                                setConflictModal({ isOpen: false, subtask: null, conflictData: null });
                                handleOpenReschedule(subtask);
                            }}
                            className="flex items-center justify-between w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <div>
                                <span className="font-semibold text-gray-800 block">Elegir otra fecha</span>
                                <span className="text-xs text-gray-500">Mover la tarea a un día con menos carga.</span>
                            </div>
                            <span className="text-gray-400">→</span>
                        </button>

                        {/* Opción 2: Reducir */}
                        <button
                            onClick={() => {
                                // Cierra este modal y abre el de reducir horas
                                const subtask = conflictModal.subtask;
                                // Para reducir, usamos la fecha que estábamos intentando asignar (que causó el conflicto).
                                // La guardamos adicionalmente en conflictData.attemptedDate, o usamos la nueva del rescheduleModal
                                const targetDate = conflictModal.conflictData.attemptedDate || rescheduleModal.newDate || subtask.target_date;

                                setConflictModal({ isOpen: false, subtask: null, conflictData: null });
                                handleOpenReduce(subtask, targetDate);
                            }}
                            className="flex items-center justify-between w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <div>
                                <span className="font-semibold text-gray-800 block"> Reducir horas estimadas</span>
                                <span className="text-xs text-gray-500">Ajustar el tiempo que le dedicarás hoy.</span>
                            </div>
                            <span className="text-gray-400">→</span>
                        </button>

                        {/* Opción 3: Posponer */}
                        <button
                            onClick={() => {
                                // Lógica para posponer
                                console.log("Acción: Posponer");
                            }}
                            className="flex items-center justify-between w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <div>
                                <span className="font-semibold text-gray-800 block">Posponer para después</span>
                                <span className="text-xs text-gray-500">Quitarle la fecha y dejarla en estado postergado.</span>
                            </div>
                            <span className="text-gray-400">→</span>
                        </button>
                    </div>

                    {/* Botón Cancelar */}
                    <div className="flex justify-end mt-4">
                        <button
                            onClick={() => setConflictModal({ isOpen: false, subtask: null, conflictData: null })}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </Modal>
    );

    const renderReduceModal = () => (
        <Modal
            isOpen={reduceModal.isOpen}
            onClose={handleCloseReduce}
            onConfirm={handleReduceConfirm}
            title="Reducir horas estimadas"
            confirmText="Guardar"
            showCancel={true}
            isLoading={isReducing}
        >
            <div className="py-2">
                <div className="space-y-4">
                    <p className="text-sm text-zinc-600">
                        Ajusta el tiempo que le dedicarás a esta tarea el <b>{formatDateShort(reduceModal.newDate)}</b> para no exceder tu límite.
                    </p>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-bold text-zinc-700">Nuevas horas estimadas</label>
                        <input
                            type="number"
                            min="0.5"
                            step="0.5"
                            value={reduceModal.newHours}
                            onChange={(e) => setReduceModal({ ...reduceModal, newHours: parseFloat(e.target.value) || '' })}
                            className="w-full border border-zinc-300 rounded-lg px-4 py-3 text-sm font-medium text-zinc-800 outline-none focus:border-blue-500"
                        />
                    </div>
                </div>
            </div>
        </Modal>
    );

    return (
        <div className="p-8 w-full min-h-screen bg-[#F8FAFC]">
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
                <div className="flex flex-col items-center justify-center py-32 text-center">
                    {hasActiveFilters ? (
                        <p className="text-zinc-500 font-medium">
                            No hay tareas que coincidan con los filtros aplicados.
                        </p>
                    ) : (
                        <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
                            <Coffee size={64} strokeWidth={1.5} className="mb-4 text-zinc-300" />
                            <p className="font-medium text-zinc-500 text-lg mb-6">
                                No hay tareas programadas.
                            </p>
                            <Link to="/crear" className="bg-[#3b82f6] hover:bg-blue-600 text-white px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-lg active:scale-95">
                                Crear actividad
                            </Link>
                        </div>
                    )}
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
            {renderModals()}
            {renderConflictModal()}
            {renderReduceModal()}
        </div>
    );
};

export default HoyPage;
