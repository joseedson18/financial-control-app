import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, PieChart, Pie, Cell, Sector } from 'recharts';
import api from '../api';
import StatCard from './StatCard';
import AiInsights from './AiInsights';
import { Printer, TrendingUp, DollarSign, Activity, PieChart as PieChartIcon, Trash2 } from 'lucide-react';

interface DashboardProps {
    language: 'pt' | 'en';
}

interface DashboardData {
    kpis: any;
    monthly_data: any[];
    cost_structure: any;
}

const translations = {
    pt: {
        loading: 'Carregando dados do dashboard...',
        noDataTitle: 'Nenhum Dado Disponível',
        noDataDesc: 'Importe um arquivo CSV do Conta Azul para ver seu dashboard financeiro com KPIs, gráficos e insights.',
        uploadBtn: 'Importar Arquivo',
        revenue: 'Receita Total',
        grossProfit: 'Lucro Bruto',
        ebitda: 'EBITDA',
        netResult: 'Resultado Líquido',
        revenueVsCosts: 'Receita vs Custos',
        costStructure: 'Estrutura de Custos',
        monthlyTrends: 'Tendências Mensais',
        exportPdf: 'Exportar PDF',
        rev: 'Receita',
        cost: 'Custos',
        profit: 'Lucro',
        marketing: 'Marketing',
        wages: 'Salários',
        tech: 'Tecnologia',
        other: 'Outros',
        clearData: 'Limpar Dados',
        confirmClear: 'Tem certeza que deseja apagar todos os dados?'
    },
    en: {
        loading: 'Loading dashboard data...',
        noDataTitle: 'No Data Available',
        noDataDesc: 'Upload a CSV file from Conta Azul to see your financial dashboard with KPIs, charts, and insights.',
        uploadBtn: 'Upload File',
        revenue: 'Total Revenue',
        grossProfit: 'Gross Profit',
        ebitda: 'EBITDA',
        netResult: 'Net Result',
        revenueVsCosts: 'Revenue vs Costs',
        costStructure: 'Cost Structure',
        monthlyTrends: 'Monthly Trends',
        exportPdf: 'Export PDF',
        rev: 'Revenue',
        cost: 'Costs',
        profit: 'Profit',
        marketing: 'Marketing',
        wages: 'Wages',
        tech: 'Tech',
        other: 'Other',
        clearData: 'Clear Data',
        confirmClear: 'Are you sure you want to clear all data?'
    }
};

const COLORS = {
    revenue: '#06b6d4', // Cyan 500
    cost: '#ec4899',    // Pink 500
    profit: '#8b5cf6',  // Violet 500
    marketing: '#f59e0b', // Amber 500
    wages: '#10b981',   // Emerald 500
    tech: '#3b82f6',    // Blue 500
    other: '#6366f1'    // Indigo 500
};

const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
        <g>
            <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="text-lg font-bold">
                {payload.name}
            </text>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius + 6}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
            />
            <Sector
                cx={cx}
                cy={cy}
                startAngle={startAngle}
                endAngle={endAngle}
                innerRadius={outerRadius + 6}
                outerRadius={outerRadius + 10}
                fill={fill}
            />
            <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
            <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
            <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#fff" className="text-sm">{`R$ ${value.toLocaleString()}`}</text>
            <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999" className="text-xs">
                {`(${(percent * 100).toFixed(1)}%)`}
            </text>
        </g>
    );
};

export default function Dashboard({ language }: DashboardProps) {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const t = translations[language];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get('/dashboard');
                setData(response.data);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handlePrint = () => {
        window.print();
    };

    const onPieEnter = (_: any, index: number) => {
        setActiveIndex(index);
    };

    const formatCurrency = (value: number) => {
        return value.toLocaleString(language === 'pt' ? 'pt-BR' : 'en-US', {
            style: 'currency',
            currency: 'BRL'
        });
    };

    const formatPercent = (value: number) => {
        return (value * 100).toFixed(1) + '%';
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-gray-900 border border-gray-700 p-3 rounded shadow-xl">
                    <p className="text-gray-300 font-semibold mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} style={{ color: entry.color }} className="text-sm">
                            {entry.name}: {
                                entry.name === 'Margin' || entry.name === 'EBITDA %'
                                    ? formatPercent(entry.value)
                                    : formatCurrency(entry.value)
                            }
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (loading) return <div className="p-8 text-center text-cyan-400 animate-pulse">{t.loading}</div>;

    // Check if we have data (allow 0 revenue if we have monthly data)
    if (!data || !data.monthly_data || data.monthly_data.length === 0) {
        return (
            <div className="text-center p-12">
                <div className="bg-gray-800/50 rounded-2xl p-8 max-w-md mx-auto border border-gray-700">
                    <Activity size={48} className="mx-auto text-gray-500 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-200 mb-2">{t.noDataTitle}</h3>
                    <p className="text-gray-400 mb-6">{t.noDataDesc}</p>
                </div>
            </div>
        );
    }

    // Prepare Pie Chart Data
    const costPieData = Object.entries(data.cost_structure || {}).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize
        value
    }));

    const pieColors = [COLORS.marketing, COLORS.wages, COLORS.tech, COLORS.other, COLORS.cost];

    return (
        <div className="space-y-6 print:space-y-4">
            <div className="flex justify-end gap-3 print:hidden">
                <button
                    onClick={async () => {
                        if (confirm(t.confirmClear || 'Are you sure you want to clear all data?')) {
                            try {
                                await api.delete('/api/data');
                                window.location.reload();
                            } catch (e) {
                                alert('Error clearing data');
                            }
                        }
                    }}
                    className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 transition-colors flex items-center gap-2"
                >
                    <Trash2 size={18} /> {t.clearData || 'Clear Data'}
                </button>
                <button onClick={handlePrint} className="btn-secondary flex items-center gap-2">
                    <Printer size={18} /> {t.exportPdf}
                </button>
            </div>

            {/* AI Insights Section */}
            <div className="print:hidden">
                <AiInsights data={data} language={language} />
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title={t.revenue}
                    value={formatCurrency(data.kpis.total_revenue)}
                    icon={DollarSign}
                    gradient="bg-gradient-to-br from-cyan-500 to-blue-500"
                />
                <StatCard
                    title={t.netResult}
                    value={formatCurrency(data.kpis.net_result)}
                    icon={Activity}
                    gradient="bg-gradient-to-br from-emerald-500 to-teal-500"
                />
                <StatCard
                    title={t.grossProfit}
                    value={formatPercent(data.kpis.gross_margin)}
                    icon={TrendingUp}
                    gradient="bg-gradient-to-br from-purple-500 to-pink-500"
                />
                <StatCard
                    title={t.ebitda}
                    value={formatCurrency(data.kpis.ebitda)}
                    icon={PieChartIcon}
                    gradient="bg-gradient-to-br from-amber-500 to-orange-500"
                />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="card-dark">
                    <h3 className="text-xl font-semibold mb-6 text-gray-200 flex items-center gap-2">
                        <div className="w-1 h-6 bg-gradient-to-b from-cyan-500 to-purple-500 rounded-full"></div>
                        {t.revenueVsCosts}
                    </h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.monthly_data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
                                <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ color: '#d1d5db' }} />
                                <Bar dataKey="revenue" name={t.rev} fill={COLORS.revenue} radius={[8, 8, 0, 0]} />
                                <Bar dataKey="costs" name={t.cost} fill={COLORS.cost} radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card-dark">
                    <h3 className="text-xl font-semibold mb-6 text-gray-200 flex items-center gap-2">
                        <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-cyan-500 rounded-full"></div>
                        {t.ebitda}
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
                        {t.costStructure}
                    </h3>
                    <div className="h-96 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    // @ts-ignore
                                    activeIndex={activeIndex}
                                    activeShape={renderActiveShape}
                                    data={costPieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    onMouseEnter={onPieEnter}
                                >
                                    {costPieData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
