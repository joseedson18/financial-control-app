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
        if (grad.includes('cyan')) return 'from-cyan-500/20 to-blue-500/20 text-cyan-400';
        if (grad.includes('emerald')) return 'from-emerald-500/20 to-teal-500/20 text-emerald-400';
        if (grad.includes('purple')) return 'from-purple-500/20 to-pink-500/20 text-purple-400';
        if (grad.includes('amber')) return 'from-amber-500/20 to-orange-500/20 text-amber-400';
        return 'from-gray-500/20 to-slate-500/20 text-gray-400';
    };

    const iconStyle = getGradientColors(gradient);
    const isPositive = trend && trend >= 0;

    return (
        <GlassCard
            className={`p-6 flex flex-col justify-between h-full group transition-all ${isNegative ? 'border-2 border-red-500/40 shadow-red-500/20' : ''
                }`}
            hoverEffect={true}
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-sm font-medium text-slate-400 mb-1 group-hover:text-slate-300 transition-colors">{title}</p>
                    <h3 className={`text-2xl font-bold tracking-tight ${isNegative ? 'text-red-400' : 'text-white'
                        }`}>{value}</h3>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${iconStyle} shadow-lg ${isNegative ? 'ring-2 ring-red-500/30' : ''
                    }`}>
                    <Icon size={20} />
                </div>
            </div>

            {trend !== undefined && (
                <div className="flex items-center gap-2 text-xs font-medium">
                    <span className={`flex items-center gap-1 px-2 py-1 rounded-full ${isPositive
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                        {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {Math.abs(trend)}%
                    </span>
                    <span className="text-slate-500">{trendLabel}</span>
                </div>
            )}
        </GlassCard>
    );
}
