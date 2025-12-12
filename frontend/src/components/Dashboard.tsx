import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, Legend, PieChart, Pie, Cell, Sector, Brush, ReferenceLine, ComposedChart, LineChart } from 'recharts';
import api from '../api';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import StatCard from './StatCard';
import AiInsights from './AiInsights';
import FormulaModal from './FormulaModal';
import { getFormulaBreakdown } from '../utils/formulaBreakdown';
import { TrendingUp, DollarSign, Activity, PieChart as PieChartIcon, Trash2, Download } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { motion } from 'framer-motion';

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
        loading: 'Carregando dashboard...',
        noDataTitle: 'Nenhum Dado Disponível',
        noDataDesc: 'Importe um arquivo CSV do Conta Azul para ver seu dashboard financeiro.',
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
        confirmClear: 'Tem certeza que deseja apagar todos os dados?',
        forecast: 'Previsão ML',
        showForecast: 'Ver Previsão (3 meses)',
        downloading: 'Baixando PDF...'
    },
    en: {
        loading: 'Loading dashboard...',
        noDataTitle: 'No Data Available',
        noDataDesc: 'Upload a CSV file from Conta Azul to see your financial dashboard.',
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
        confirmClear: 'Are you sure you want to clear all data?',
        forecast: 'ML Forecast',
        showForecast: 'Show Forecast (3 months)',
        downloading: 'Downloading PDF...'
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
            <text x={cx} y={cy} dy={8} textAnchor="middle" fill="#fff" className="text-xl font-bold drop-shadow-lg">
                {payload.name}
            </text>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius + 8}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
                className="drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
            />
            <Sector
                cx={cx}
                cy={cy}
                startAngle={startAngle}
                endAngle={endAngle}
                innerRadius={outerRadius + 8}
                outerRadius={outerRadius + 12}
                fill={fill}
                opacity={0.3}
            />
            <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" strokeWidth={2} />
            <circle cx={ex} cy={ey} r={3} fill={fill} stroke="#fff" strokeWidth={1} />
            <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#fff" className="text-sm font-medium">{`R$ ${value.toLocaleString()}`}</text>
            <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#94a3b8" className="text-xs">
                {`(${(percent * 100).toFixed(1)}%)`}
            </text>
        </g>
    );
};

export default function Dashboard({ language }: DashboardProps) {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const [forecastData, setForecastData] = useState<any[]>([]);
    const [showForecast, setShowForecast] = useState(false);
    const [showYoY, setShowYoY] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [formulaModal, setFormulaModal] = useState<{
        isOpen: boolean;
        title: string;
        value: number;
        breakdown: any[];
        matlabFormula: string;
    } | null>(null);
    const t = translations[language];

    const showFormula = (type: string) => {
        if (!data) return;
        const breakdown = getFormulaBreakdown(type, data, language);
        if (breakdown) {
            setFormulaModal({
                isOpen: true,
                ...breakdown
            });
        }
    };

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

    const fetchForecast = async () => {
        if (showForecast) {
            setShowForecast(false);
            return;
        }

        try {
            const response = await api.get('/api/forecast?months=3');
            setForecastData(response.data.forecast);
            setShowForecast(true);
        } catch (error) {
            console.error("Error fetching forecast:", error);
        }
    };

    const handlePrint = async () => {
        setIsDownloading(true);
        const element = document.getElementById('dashboard-content');
        if (!element) return;

        try {
            const canvas = await html2canvas(element, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`dashboard-report-${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error("PDF Export failed:", error);
        } finally {
            setIsDownloading(false);
        }
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
                <div className="glass-panel p-4 rounded-xl !bg-[#0f172a]/95 border-none shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]">
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-3 pb-2 border-b border-white/5">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center justify-between gap-6 mb-2 last:mb-0">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: entry.color, color: entry.color }} />
                                <span className="text-slate-300 text-sm font-medium">{entry.name}</span>
                            </div>
                            <span className="text-white font-bold font-mono text-sm">
                                {entry.name === 'Margin' || entry.name === 'EBITDA %'
                                    ? formatPercent(entry.value)
                                    : formatCurrency(entry.value)}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (loading) return (
        <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
    );

    if (!data || !data.monthly_data || data.monthly_data.length === 0) {
        return (
            <div className="text-center p-12">
                <GlassCard className="max-w-md mx-auto p-12">
                    <div className="bg-white/5 backdrop-blur-sm w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                        <Activity size={40} className="text-cyan-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">{t.noDataTitle}</h3>
                    <p className="text-slate-400 mb-8">{t.noDataDesc}</p>
                </GlassCard>
            </div>
        );
    }

    const costPieData = Object.entries(data.cost_structure || {}).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value
    }));

    const pieColors = [COLORS.marketing, COLORS.wages, COLORS.tech, COLORS.other, COLORS.cost];

    // Calculate trends (mock data for now, could be real if backend supported it)
    const revenueTrend = 12.5;
    const profitTrend = 8.2;
    const marginTrend = -2.1;
    const ebitdaTrend = 15.3;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-8 pb-12"
            id="dashboard-content"
        >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">Dashboard Overview</h2>
                    <p className="text-slate-400 text-xs sm:text-sm">Real-time financial insights</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                    <button
                        onClick={() => setShowYoY(!showYoY)}
                        disabled={showForecast}
                        className={`flex items-center justify-center gap-2 w-full sm:w-auto text-sm px-4 py-2 rounded-lg border transition-all ${showYoY ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300' : 'bg-white/5 border-white/10 hover:bg-white/10'} ${showForecast ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <Activity size={18} className={showYoY ? "text-cyan-400" : ""} />
                        YoY
                    </button>
                    <button
                        onClick={async () => {
                            if (confirm(t.confirmClear || 'Are you sure?')) {
                                try {
                                    await api.delete('/api/data');
                                    window.location.reload();
                                } catch { alert('Error'); }
                            }
                        }}
                        className="btn-danger flex items-center justify-center gap-2 w-full sm:w-auto text-sm"
                    >
                        <Trash2 size={18} /> {t.clearData}
                    </button>

                    <button
                        onClick={fetchForecast}
                        className={`flex items-center justify-center gap-2 w-full sm:w-auto text-sm px-4 py-2 rounded-lg border transition-all ${showForecast ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                    >
                        <TrendingUp size={18} className={showForecast ? "text-indigo-400" : ""} />
                        {t.showForecast}
                    </button>

                    <button onClick={handlePrint} disabled={isDownloading} className="btn-secondary flex items-center justify-center gap-2 w-full sm:w-auto text-sm">
                        <Download size={18} /> {isDownloading ? t.downloading : t.exportPdf}
                    </button>
                </div>
            </div>

            {/* AI Insights Section */}
            <div className="print:hidden">
                <AiInsights data={data} language={language} />
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div onClick={() => showFormula('total_revenue')} className="cursor-pointer transition-all hover:scale-105">
                    <StatCard
                        title={t.revenue}
                        value={formatCurrency(data.kpis.total_revenue)}
                        icon={DollarSign}
                        gradient="cyan"
                        trend={revenueTrend}
                        isNegative={data.kpis.total_revenue < 0}
                    />
                </div>
                <div onClick={() => showFormula('net_result')} className="cursor-pointer transition-all hover:scale-105">
                    <StatCard
                        title={t.netResult}
                        value={formatCurrency(data.kpis.net_result)}
                        icon={Activity}
                        gradient="emerald"
                        trend={profitTrend}
                        isNegative={data.kpis.net_result < 0}
                    />
                </div>
                <div onClick={() => showFormula('gross_profit')} className="cursor-pointer transition-all hover:scale-105">
                    <StatCard
                        title={t.grossProfit}
                        value={formatPercent(data.kpis.gross_margin)}
                        icon={TrendingUp}
                        gradient="purple"
                        trend={marginTrend}
                        isNegative={data.kpis.gross_margin < 0}
                    />
                </div>
                <div onClick={() => showFormula('ebitda')} className="cursor-pointer transition-all hover:scale-105">
                    <StatCard
                        title={t.ebitda}
                        value={formatCurrency(data.kpis.ebitda)}
                        icon={PieChartIcon}
                        gradient="amber"
                        trend={ebitdaTrend}
                        isNegative={data.kpis.ebitda < 0}
                    />
                </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                <GlassCard className="h-[300px] sm:h-[400px]" gradient="cyan">
                    <h3 className="text-lg font-semibold mb-6 text-white flex items-center gap-2">
                        <div className="w-1 h-5 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
                        {t.revenueVsCosts}
                    </h3>
                    <div className="h-[220px] sm:h-[300px] w-full">
                        {data.monthly_data.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[...data.monthly_data, ...(showForecast ? forecastData : [])]} barGap={8} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenueGraph" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={COLORS.revenue} stopOpacity={0.8} />
                                            <stop offset="95%" stopColor={COLORS.revenue} stopOpacity={0.3} />
                                        </linearGradient>
                                        <linearGradient id="colorCostGraph" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={COLORS.cost} stopOpacity={0.8} />
                                            <stop offset="95%" stopColor={COLORS.cost} stopOpacity={0.3} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '10px' }} axisLine={false} tickLine={false} dy={10} interval="preserveStartEnd" />
                                    <YAxis stroke="#64748b" style={{ fontSize: '10px' }} axisLine={false} tickLine={false} dx={-10} width={60} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                    <Bar dataKey="revenue" name={t.rev} fill="url(#colorRevenueGraph)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                    <Bar dataKey="costs" name={t.cost} fill="url(#colorCostGraph)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                    <Brush dataKey="month" height={30} stroke="#64748b" fill="#0f172a" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-500">
                                No chart data available
                            </div>
                        )}
                    </div>
                </GlassCard>

                <GlassCard className="h-[300px] sm:h-[400px]" gradient="emerald">
                    <h3 className="text-lg font-semibold mb-6 text-white flex items-center gap-2">
                        <div className="w-1 h-5 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                        {t.ebitda} Trend
                    </h3>
                    <div className="h-[220px] sm:h-[300px] w-full">
                        {data.monthly_data.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                {showYoY ? (
                                    <LineChart margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                        <XAxis dataKey="month" type="category" allowDuplicatedCategory={false} stroke="#64748b" style={{ fontSize: '10px' }} axisLine={false} tickLine={false} dy={10} />
                                        <YAxis stroke="#64748b" style={{ fontSize: '10px' }} axisLine={false} tickLine={false} dx={-10} width={60} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                        {Array.from(new Set(data.monthly_data.map(d => d.month.split('-')[0]))).map((year, i) => (
                                            <Line
                                                key={year}
                                                data={data.monthly_data.filter(d => d.month.startsWith(year)).map(d => ({ ...d, month: d.month.split('-')[1] }))}
                                                type="monotone"
                                                dataKey="ebitda"
                                                name={`EBITDA ${year}`}
                                                stroke={[COLORS.profit, COLORS.revenue, COLORS.marketing][i % 3]}
                                                strokeWidth={3}
                                                dot={{ r: 4 }}
                                            />
                                        ))}
                                    </LineChart>
                                ) : (
                                    <ComposedChart data={[...data.monthly_data, ...(showForecast ? forecastData : [])]} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorEbitdaGraph" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                        <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '10px' }} axisLine={false} tickLine={false} dy={10} interval="preserveStartEnd" />
                                        <YAxis stroke="#64748b" style={{ fontSize: '10px' }} axisLine={false} tickLine={false} dx={-10} width={60} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                        <Line
                                            type="monotone"
                                            dataKey="ebitda"
                                            name="EBITDA"
                                            stroke="#10b981"
                                            strokeWidth={3}
                                            dot={{ r: 4, fill: '#0f172a', stroke: '#10b981', strokeWidth: 2 }}
                                            activeDot={{ r: 6, fill: '#10b981', stroke: '#fff' }}
                                            strokeDasharray={showForecast ? "5 5" : ""} // Dashed line for forecast? No, this makes whole line dashed.
                                        // We need two lines or segment logic. For simplicity, we just show connected line.
                                        // But we can distinguish forecast points using the `is_forecast` prop in the data.
                                        />
                                        {showForecast && (
                                            <ReferenceLine x={data.monthly_data[data.monthly_data.length - 1].month} stroke="red" strokeDasharray="3 3" label="Forecast Start" />
                                        )}
                                        <Brush dataKey="month" height={30} stroke="#64748b" fill="#0f172a" />
                                    </ComposedChart>
                                )}
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-500">
                                No trend data available
                            </div>
                        )}
                    </div>
                </GlassCard>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                <GlassCard className="h-[350px] sm:h-[450px]" gradient="purple">
                    <h3 className="text-lg font-semibold mb-6 text-white flex items-center gap-2">
                        <div className="w-1 h-5 bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
                        {t.costStructure}
                    </h3>
                    <div className="h-[260px] sm:h-[350px] w-full">
                        {costPieData.some((d: any) => d.value > 0) ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                    <Pie
                                        // @ts-ignore
                                        activeIndex={activeIndex}
                                        activeShape={renderActiveShape}
                                        data={costPieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={110}
                                        fill="#8884d8"
                                        dataKey="value"
                                        onMouseEnter={onPieEnter}
                                        paddingAngle={2}
                                    >
                                        {costPieData.map((_, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={pieColors[index % pieColors.length]}
                                                stroke="rgba(0,0,0,0.2)"
                                                strokeWidth={2}
                                            />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-500">
                                No cost structure data available
                            </div>
                        )}
                    </div>
                </GlassCard>
            </div>

            {/* Formula Modal */}
            {formulaModal && (
                <FormulaModal
                    isOpen={formulaModal.isOpen}
                    onClose={() => setFormulaModal(null)}
                    title={formulaModal.title}
                    value={formulaModal.value}
                    breakdown={formulaModal.breakdown}
                    matlabFormula={formulaModal.matlabFormula}
                    language={language}
                />
            )}
        </motion.div>
    );
}

