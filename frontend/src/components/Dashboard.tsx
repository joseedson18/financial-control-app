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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

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

    if (loading) return <div className="p-8 text-center">Loading Dashboard...</div>;
    if (!data || !data.kpis.revenue) return <div className="p-8 text-center">No data available. Please upload a file.</div>;

    const formatCurrency = (val: number) => val?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const formatPercent = (val: number) => (val * 100).toFixed(2) + '%';

    const costPieData = Object.entries(data.cost_structure).map(([key, value]) => ({
        name: key.replace('_', ' ').toUpperCase(),
        value: value as number
    })).filter(item => item.value > 0);

    return (
        <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total Revenue</p>
                            <h3 className="text-2xl font-bold text-slate-800 mt-1">{formatCurrency(data.kpis.revenue)}</h3>
                        </div>
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <DollarSign size={20} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-slate-500">EBITDA</p>
                            <h3 className="text-2xl font-bold text-slate-800 mt-1">{formatCurrency(data.kpis.ebitda)}</h3>
                        </div>
                        <div className="p-2 bg-green-50 rounded-lg text-green-600">
                            <Activity size={20} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-slate-500">EBITDA Margin</p>
                            <h3 className="text-2xl font-bold text-slate-800 mt-1">{formatPercent(data.kpis.ebitda_margin)}</h3>
                        </div>
                        <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                            <Percent size={20} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Gross Margin</p>
                            <h3 className="text-2xl font-bold text-slate-800 mt-1">{formatPercent(data.kpis.gross_margin)}</h3>
                        </div>
                        <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                            <TrendingUp size={20} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-semibold mb-6 text-slate-800">Revenue vs Costs Trend</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.monthly_data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                                <Legend />
                                <Bar dataKey="revenue" name="Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="costs" name="Costs" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-semibold mb-6 text-slate-800">EBITDA Evolution</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.monthly_data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                                <Legend />
                                <Line type="monotone" dataKey="ebitda" name="EBITDA" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-semibold mb-6 text-slate-800">Cost Structure (Latest Month)</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={costPieData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                >
                                    {costPieData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
