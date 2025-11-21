import React, { useEffect, useState } from 'react';
import api from '../api';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { DollarSign, TrendingUp, Activity, Percent } from 'lucide-react';

interface DashboardData {
    kpis: {
        revenue: number;
        ebitda: number;
        ebitda_margin: number;
        gross_margin: number;
        nau: number;
        cpa: number;
    };
    monthly_data: any[];
    cost_structure: any;
}

const COLORS = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'];

const Dashboard: React.FC = () => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const response = await api.get('/dashboard');
            setData(response.data);
        } catch (error) {
            console.error('Error fetching dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-16">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading Dashboard...</p>
                </div>
            </div>
        );
    }

    if (!data || !data.kpis.revenue) {
        return (
            <div className="card-dark text-center max-w-2xl mx-auto">
                <div className="w-24 h-24 mx-auto mb-6 gradient-primary rounded-2xl flex items-center justify-center glow-cyan">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-200 mb-3">No Data Available</h3>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                    Upload a CSV file from Conta Azul to see your financial dashboard with KPIs, charts, and insights.
                </p>
                <button
                    onClick={() => window.location.href = '/'}
                    className="btn-primary inline-flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 0 11-1 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Upload File
                </button>
            </div>
        );
    }

    const formatCurrency = (val: number) => val?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const formatPercent = (val: number) => (val * 100).toFixed(2) + '%';

    const costPieData = Object.entries(data.cost_structure).map(([key, value]) => ({
        name: key.replace('_', ' ').toUpperCase(),
        value: value as number
    })).filter(item => item.value > 0);

    // Custom tooltip for charts
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="glass-strong p-4 rounded-xl border border-white/20">
                    <p className="text-cyan-400 font-semibold mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} className="text-gray-300 text-sm">
                            {entry.name}: <span className="font-semibold" style={{ color: entry.color }}>
                                {formatCurrency(entry.value)}
                            </span>
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    const KPICard = ({ title, value, icon: Icon, gradient }: any) => (
        <div className="card-dark hover:scale-105 group">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-gray-400 mb-2">{title}</p>
                    <h3 className="text-3xl font-bold text-gray-100">{value}</h3>
                </div>
                <div className={`p-3 rounded-xl ${gradient} shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon size={24} className="text-white" />
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="Total Revenue"
                    value={formatCurrency(data.kpis.revenue)}
                    icon={DollarSign}
                    gradient="gradient-primary"
                />
                <KPICard
                    title="EBITDA"
                    value={formatCurrency(data.kpis.ebitda)}
                    icon={Activity}
                    gradient="gradient-success"
                />
                <KPICard
                    title="EBITDA Margin"
                    value={formatPercent(data.kpis.ebitda_margin)}
                    icon={Percent}
                    gradient="bg-gradient-to-br from-purple-500 to-pink-500"
                />
                <KPICard
                    title="Gross Margin"
                    value={formatPercent(data.kpis.gross_margin)}
                    icon={TrendingUp}
                    gradient="bg-gradient-to-br from-amber-500 to-orange-500"
                />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="card-dark">
                    <h3 className="text-xl font-semibold mb-6 text-gray-200 flex items-center gap-2">
                        <div className="w-1 h-6 bg-gradient-to-b from-cyan-500 to-purple-500 rounded-full"></div>
                        Revenue vs Costs Trend
                    </h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.monthly_data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
                                <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ color: '#d1d5db' }} />
                                <Bar dataKey="revenue" name="Revenue" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                                <Bar dataKey="costs" name="Costs" fill="#ef4444" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card-dark">
                    <h3 className="text-xl font-semibold mb-6 text-gray-200 flex items-center gap-2">
                        <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-cyan-500 rounded-full"></div>
                        EBITDA Evolution
                    </h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.monthly_data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
                                <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ color: '#d1d5db' }} />
                                <Line
                                    type="monotone"
                                    dataKey="ebitda"
                                    name="EBITDA"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    dot={{ r: 5, fill: '#10b981', strokeWidth: 2, stroke: '#0a0a0a' }}
                                    activeDot={{ r: 7 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="card-dark">
                    <h3 className="text-xl font-semibold mb-6 text-gray-200 flex items-center gap-2">
                        <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                        Cost Structure (Latest Month)
                    </h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={costPieData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={110}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                    style={{ fontSize: '12px', fill: '#d1d5db' }}
                                >
                                    {costPieData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
