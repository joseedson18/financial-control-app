import { useEffect, useState } from 'react';
import api from '../api';
import { Download, Edit2, Save, Trash2, Calendar } from 'lucide-react';

interface PnLProps {
    language: 'pt' | 'en';
}

interface PnLItem {
    line_number: number;
    description: string;
    values: { [key: string]: number };
    is_header: boolean;
    is_total: boolean;
}

interface PnLData {
    headers: string[];
    rows: PnLItem[];
}

type FilterType = 'all' | 'today' | 'week' | 'month' | 'year' | 'custom';

const translations = {
    pt: {
        title: 'Demonstrativo de Resultados',
        export: 'Exportar CSV',
        editMode: 'Modo de Edição',
        save: 'Salvar',
        cancel: 'Cancelar',
        loading: 'Carregando DRE...',
        noData: 'Nenhum dado disponível.',
        description: 'Descrição',
        editing: 'Editando...',
        overrideSuccess: 'Valor atualizado com sucesso!',
        overrideError: 'Erro ao atualizar valor.',
        clearEdits: 'Limpar Edições',
        confirmClear: 'Tem certeza que deseja limpar todas as edições manuais?',
        filterLabel: 'Período:',
        filterAll: 'Todos',
        filterToday: 'Hoje',
        filterWeek: 'Esta Semana',
        filterMonth: 'Este Mês',
        filterYear: 'Este Ano',
        filterCustom: 'Personalizado',
        filterFrom: 'De:',
        filterTo: 'Até:',
        filterApply: 'Aplicar'
    },
    en: {
        title: 'Profit & Loss Statement',
        export: 'Export CSV',
        editMode: 'Edit Mode',
        save: 'Save',
        cancel: 'Cancel',
        loading: 'Loading P&L...',
        noData: 'No data available.',
        description: 'Description',
        editing: 'Editing...',
        overrideSuccess: 'Value updated successfully!',
        overrideError: 'Error updating value.',
        clearEdits: 'Clear Edits',
        confirmClear: 'Are you sure you want to clear all manual edits?',
        filterLabel: 'Period:',
        filterAll: 'All',
        filterToday: 'Today',
        filterWeek: 'This Week',
        filterMonth: 'This Month',
        filterYear: 'This Year',
        filterCustom: 'Custom Range',
        filterFrom: 'From:',
        filterTo: 'To:',
        filterApply: 'Apply'
    }
};

export default function PnLTable({ language }: PnLProps) {
    const [data, setData] = useState<PnLData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingCell, setEditingCell] = useState<{ line: number, month: string } | null>(null);
    const [editValue, setEditValue] = useState('');

    // Filter states
    const [filterType, setFilterType] = useState<FilterType>('all');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

    const t = translations[language];

    // Helper to format date as YYYY-MM-DD
    const formatDate = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Get date range based on filter type
    const getFilterDates = () => {
        if (filterType === 'all') return null;

        if (filterType === 'custom') {
            if (!customStartDate || !customEndDate) return null;
            return { start: customStartDate, end: customEndDate };
        }

        const now = new Date();

        switch (filterType) {
            case 'today':
                return { start: formatDate(now), end: formatDate(now) };

            case 'week': {
                const weekStart = new Date(now);
                weekStart.setDate(now.getDate() - now.getDay());
                return { start: formatDate(weekStart), end: formatDate(now) };
            }

            case 'month': {
                const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                return { start: formatDate(monthStart), end: formatDate(now) };
            }

            case 'year': {
                const yearStart = new Date(now.getFullYear(), 0, 1);
                return { start: formatDate(yearStart), end: formatDate(now) };
            }

            default:
                return null;
        }
    };

    const fetchData = async () => {
        try {
            const dates = getFilterDates();
            const params = dates
                ? { start_date: dates.start, end_date: dates.end }
                : {};

            const response = await api.get('/pnl', { params });
            setData(response.data);
        } catch (error) {
            console.error('Error fetching P&L:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filterType, customStartDate, customEndDate]);

    const handleExport = () => {
        if (!data) return;

        const csvContent = [
            ['Description', ...data.headers].join(','),
            ...data.rows.map(row => {
                const values = data.headers.map(h => row.values[h] || 0);
                return [`"${row.description}"`, ...values].join(',');
            })
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'pnl_export.csv';
        link.click();
    };

    const handleCellClick = (row: PnLItem, month: string) => {
        if (!isEditMode) return;
        setEditingCell({ line: row.line_number, month });
        setEditValue(String(row.values[month] || 0));
    };

    const handleSaveOverride = async () => {
        if (!editingCell) return;

        try {
            await api.post('/pnl/override', {
                line_number: editingCell.line,
                month: editingCell.month,
                value: parseFloat(editValue)
            });

            // Refresh data
            await fetchData();
            setEditingCell(null);
        } catch (error) {
            console.error('Error saving override:', error);
            alert(t.overrideError);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSaveOverride();
        } else if (e.key === 'Escape') {
            setEditingCell(null);
        }
    };

    if (loading) return <div className="p-8 text-center text-cyan-400 animate-pulse">{t.loading}</div>;
    if (!data || data.rows.length === 0) return <div className="p-8 text-center text-gray-400">{t.noData}</div>;

    return (
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            {/* Header Actions */}
            <div className="flex flex-col gap-4 mb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h2 className="text-xl font-semibold text-gray-200">{t.title}</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsEditMode(!isEditMode)}
                            className={`btn-secondary flex items-center gap-2 ${isEditMode ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' : ''}`}
                        >
                            {isEditMode ? <Save size={18} /> : <Edit2 size={18} />}
                            {isEditMode ? t.save : t.editMode}
                        </button>
                        <button
                            onClick={async () => {
                                if (confirm(t.confirmClear || 'Clear all manual edits?')) {
                                    try {
                                        await api.delete('/api/pnl/overrides');
                                        fetchData();
                                    } catch (e) {
                                        alert('Error clearing edits');
                                    }
                                }
                            }}
                            className="px-3 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 transition-colors flex items-center gap-2"
                        >
                            <Trash2 size={18} />
                            {t.clearEdits || 'Clear Edits'}
                        </button>
                        <button
                            onClick={handleExport}
                            className="btn-secondary flex items-center gap-2"
                        >
                            <Download size={18} />
                            {t.export}
                        </button>
                    </div>
                </div>

                {/* Filter Controls */}
                <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
                    <div className="flex items-center gap-2">
                        <Calendar size={18} className="text-blue-400" />
                        <span className="text-sm text-gray-400">{t.filterLabel}</span>
                    </div>

                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as FilterType)}
                        className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                        <option value="all">{t.filterAll}</option>
                        <option value="today">{t.filterToday}</option>
                        <option value="week">{t.filterWeek}</option>
                        <option value="month">{t.filterMonth}</option>
                        <option value="year">{t.filterYear}</option>
                        <option value="custom">{t.filterCustom}</option>
                    </select>

                    {filterType === 'custom' && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400">{t.filterFrom}</span>
                            <input
                                type="date"
                                value={customStartDate}
                                onChange={(e) => setCustomStartDate(e.target.value)}
                                className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            />
                            <span className="text-sm text-gray-400">{t.filterTo}</span>
                            <input
                                type="date"
                                value={customEndDate}
                                onChange={(e) => setCustomEndDate(e.target.value)}
                                className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="overflow-x-auto pb-4">
                <div className="min-w-max">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                <th className="sticky left-0 z-20 bg-[#0f172a] p-4 text-left text-sm font-semibold text-gray-400 border-b border-gray-800 min-w-[300px]">
                                    {t.description}
                                </th>
                                {data.headers.map(header => (
                                    <th key={header} className="p-4 text-right text-sm font-semibold text-gray-400 border-b border-gray-800 min-w-[120px]">
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.rows.map((row) => (
                                <tr
                                    key={row.line_number}
                                    className={`
                    group transition-colors
                    ${row.is_header ? 'bg-gray-800/50 font-bold text-gray-200' : 'hover:bg-white/5 text-gray-300'}
                    ${row.is_total ? 'font-bold border-t border-gray-700 bg-gray-800/30' : ''}
                  `}
                                >
                                    <td className="sticky left-0 z-10 bg-inherit p-3 border-b border-gray-800/50 group-hover:bg-[#1e293b] transition-colors">
                                        {row.description}
                                    </td>
                                    {data.headers.map(month => {
                                        const isEditing = editingCell?.line === row.line_number && editingCell?.month === month;
                                        const value = row.values[month] || 0;

                                        return (
                                            <td
                                                key={month}
                                                className={`
                          p-3 text-right border-b border-gray-800/50 font-mono text-sm
                          ${isEditMode && !row.is_header && !row.is_total ? 'cursor-pointer hover:bg-amber-500/10 hover:text-amber-400' : ''}
                        `}
                                                onClick={() => !row.is_header && !row.is_total && handleCellClick(row, month)}
                                            >
                                                {isEditing ? (
                                                    <input
                                                        autoFocus
                                                        type="number"
                                                        className="w-full bg-gray-900 border border-cyan-500 rounded px-2 py-1 text-right text-white outline-none"
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        onBlur={handleSaveOverride}
                                                        onKeyDown={handleKeyDown}
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                ) : (
                                                    row.description.includes('%')
                                                        ? (value * 100).toFixed(1) + '%'
                                                        : value.toLocaleString(language === 'pt' ? 'pt-BR' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isEditMode && (
                <div className="fixed bottom-8 right-8 bg-amber-500 text-black px-4 py-2 rounded-lg shadow-lg animate-bounce font-semibold">
                    {t.editing}
                </div>
            )}
        </div>
    );
}
