import { useState, useEffect } from 'react';
import { Settings, Save, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { userService } from '../../services/userService';

function CapacitySettings({ isExpanded }) {
    const [capacity, setCapacity] = useState(6.0);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    useEffect(() => {
        if (isSettingsOpen) {
            loadCapacity();
        }
    }, [isSettingsOpen]);

    const loadCapacity = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await userService.getDailyCapacity();
            setCapacity(data.daily_limit_hours);
        } catch (err) {
            console.error("Error cargando capacidad:", err);
            setError("No se pudo cargar el límite actual.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setError(null);
        setSuccessMsg(null);

        const hours = parseFloat(capacity);
        if (isNaN(hours) || hours < 1 || hours > 16) {
            setError("El límite debe estar entre 1 y 16 horas.");
            return;
        }

        setIsSaving(true);
        try {
            await userService.updateDailyCapacity(hours);
            setSuccessMsg("Capacidad actualizada.");
            setTimeout(() => {
                setSuccessMsg(null);
                setIsSettingsOpen(false); // Opcional: Cerrar después de guardar
            }, 2000);
        } catch (err) {
            console.error("Error guardando capacidad:", err);
            setError(err.response?.data?.message || "Error al guardar el límite.");
        } finally {
            setIsSaving(false);
        }
    };

    if (!isExpanded && !isSettingsOpen) {
         return (
             <button
                 onClick={() => setIsSettingsOpen(true)}
                 className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800/50 flex flex-col justify-center gap-4 mt-2"
                 title="Configurar Capacidad Diaria"
             >
                 <Settings size={20} />
             </button>
         );
    }

    if (!isSettingsOpen) {
        return (
            <button
                onClick={() => setIsSettingsOpen(true)}
                className={`flex items-center gap-3 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors px-3 py-2 w-full mt-2`}
                title="Configurar Capacidad Diaria"
            >
                <Settings size={20} className="flex-shrink-0" />
                <span className="whitespace-nowrap">Capacidad Diaria</span>
            </button>
        )
    }

    // Modal / Popover simplificado incrustado en el Sidebar temporalmente para ajustes
    return (
        <div className={`mt-2 bg-slate-800 rounded-xl p-3 border border-slate-700/50 ${isExpanded ? 'w-full' : 'absolute left-24 bottom-24 w-48 shadow-lg'}`}>
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-200">Límite Diario</span>
                <button onClick={() => setIsSettingsOpen(false)} className="text-slate-500 hover:text-slate-300">
                    &times;
                </button>
            </div>
            
            {isLoading ? (
                <div className="flex justify-center py-2"><Loader2 size={16} className="animate-spin text-slate-400" /></div>
            ) : (
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            min="1"
                            max="16"
                            step="0.5"
                            value={capacity}
                            onChange={(e) => setCapacity(e.target.value)}
                            className="bg-slate-900 border border-slate-700 text-white rounded px-2 py-1 w-full text-sm focus:outline-none focus:border-blue-500"
                        />
                        <span className="text-slate-400 text-sm">h/día</span>
                    </div>

                    {error && (
                        <div className="flex items-start gap-1 text-red-400 text-xs mt-1">
                            <AlertCircle size={12} className="flex-shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}
                    
                    {successMsg && (
                        <div className="flex items-center gap-1 text-emerald-400 text-xs mt-1">
                            <CheckCircle2 size={12} />
                            <span>{successMsg}</span>
                        </div>
                    )}

                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="mt-1 flex justify-center items-center gap-1 w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-1.5 rounded transition-colors disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                        Guardar
                    </button>
                </div>
            )}
        </div>
    );
}

export default CapacitySettings;
