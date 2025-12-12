import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';

interface StatCardProps {
    title: string;
    value: string;
    icon: LucideIcon;
    gradient: string;
    trend?: number; // Percentage change (e.g., 12.5 or -5.2)
    trendLabel?: string; // e.g., "vs last month"
    isNegative?: boolean; // NEW: Highlight negative financial values
}

export default function StatCard({ title, value, icon: Icon, gradient, trend, trendLabel = "vs last month", isNegative = false }: StatCardProps) {
    // Extract gradient colors for the icon background
    const getGradientColors = (grad: string) => {
        if (grad.includes('cyan')) return 'from-cyan-500 to-blue-600 text-white shadow-cyan-500/30';
        if (grad.includes('emerald')) return 'from-emerald-500 to-teal-600 text-white shadow-emerald-500/30';
        if (grad.includes('purple')) return 'from-purple-500 to-pink-600 text-white shadow-purple-500/30';
        if (grad.includes('amber')) return 'from-amber-500 to-orange-600 text-white shadow-amber-500/30';
        return 'from-slate-700 to-slate-600 text-slate-300';
    };

    const iconStyle = getGradientColors(gradient);
    const isPositive = trend && trend >= 0;

    return (
        <GlassCard
            className={`p-6 flex flex-col justify-between h-full group transition-all duration-500 hover:border-white/20 ${isNegative ? 'border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.1)]' : ''
                }`}
            hoverEffect={true}
        >
            <div className="flex justify-between items-start mb-6">
                <div className="relative z-10">
                    <p className="text-sm font-medium text-slate-400 mb-1 group-hover:text-cyan-200 transition-colors uppercase tracking-wider text-[10px]">{title}</p>
                    <h3 className={`text-3xl font-bold tracking-tight text-glow transition-all duration-300 ${isNegative ? 'text-red-400' : 'text-white group-hover:scale-105 origin-left'
                        }`}>{value}</h3>
                </div>

                <div className={`p-3.5 rounded-xl bg-gradient-to-br ${iconStyle} shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-overlay"></div>
                    <Icon size={22} className="relative z-10" />
                </div>
            </div>

            {trend !== undefined && (
                <div className="flex items-center gap-3 text-sm font-medium pt-4 border-t border-white/5">
                    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-sm transition-colors ${isPositive
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20 group-hover:bg-red-500/20'
                        }`}>
                        {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {Math.abs(trend)}%
                    </span>
                    <span className="text-slate-500 text-xs">{trendLabel}</span>
                </div>
            )}
        </GlassCard>
    );
}
