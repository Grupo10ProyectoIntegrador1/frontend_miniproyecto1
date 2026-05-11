import { Flame, Loader2 } from 'lucide-react';
import { useStreak } from '../hooks/useStreak';

export const StreakWidget = () => {
    const { streak, loading } = useStreak();

    if (loading) {
        return (
            <div className="bg-white rounded-2xl shadow-md p-4 flex items-center justify-center w-40 h-16">
                <Loader2 size={20} className="animate-spin text-slate-400" />
            </div>
        );
    }

    const days = streak?.streak_current || 0;
    const isEmpty = days === 0;

    return (
        <div className={`rounded-2xl shadow-md p-4 flex items-center gap-3 ${isEmpty ? 'bg-white' : 'bg-white'}`}>
            <div className={`flex-shrink-0 ${isEmpty ? 'text-slate-400' : 'text-orange-500'}`}>
                <Flame size={24} fill={isEmpty ? 'none' : 'currentColor'} />
            </div>
            <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Racha</span>
                <span className={`text-sm font-bold ${isEmpty ? 'text-slate-600' : 'text-orange-600'}`}>
                    {isEmpty ? '¡Comienza!' : `${days} ${days === 1 ? 'día' : 'días'}`}
                </span>
            </div>
        </div>
    );
};