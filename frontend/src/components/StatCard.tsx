import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string;
    icon: LucideIcon;
    gradient: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, gradient }) => {
    return (
        <div className="card-dark p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
            <div className={`absolute top-0 right-0 w-24 h-24 opacity-10 rounded-bl-full ${gradient} transition-opacity group-hover:opacity-20`} />

            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl bg-white/5 ${gradient.replace('bg-gradient-to-br', 'text-white')} bg-clip-text`}>
                    <Icon size={24} className="text-gray-200" />
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium bg-white/5 text-gray-400`}>
                    Last Month
                </div>
            </div>

            <div>
                <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-gray-100">{value}</h3>
            </div>
        </div>
    );
};

export default StatCard;
