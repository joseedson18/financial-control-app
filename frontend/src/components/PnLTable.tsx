import { useEffect, useState } from 'react';
import api from '../api';
import { ChevronDown, Edit2, Save, X, Download, Search } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { motion } from 'framer-motion';

interface PnLRow {
    line_number: number;
    description: string;
    values: { [key: string]: number };
    is_header: boolean;
    is_total: boolean;
    indent_level: number;
}

interface PnLData {
    headers: string[];
    rows: PnLRow[];
}

interface PnLTableProps {
    language: 'pt' | 'en';
}

const translations = {
    pt: {
        title: 'Demonstrativo de Resultados (DRE)',
        subtitle: 'Visão detalhada de receitas, custos e despesas',
        loading: 'Carregando DRE...',
        save: 'Salvar',
        cancel: 'Cancelar',
        edit: 'Editar',
        export: 'Exportar CSV',
        filter: 'Filtrar',
        search: 'Buscar conta...',
        noData: 'Nenhum dado disponível'
    },
    en: {
        title: 'Profit & Loss Statement (P&L)',
        subtitle: 'Detailed view of revenue, costs, and expenses',
        loading: 'Loading P&L...',
        save: 'Save',
        cancel: 'Cancel',
        edit: 'Edit',
        export: 'Export CSV',
        filter: 'Filter',
        search: 'Search account...',
        noData: 'No data available'
    }
};

export default function PnLTable({ language }: PnLTableProps) {
    const [data, setData] = useState<PnLData | null>(null);
    const [loading, setLoading] = useState(true);
    const [editingCell, setEditingCell] = useState<{ line: number, month: string } | null>(null);
    const [editValue, setEditValue] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const t = translations[language];

    useEffect(() => {
        fetchPnL();
    }, []);

    const fetchPnL = async () => {
        try {
            const response = await api.get('/pnl');
            setData(response.data);
        } catch (error) {
            console.error('Error fetching P&L:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (line: number, month: string, value: number) => {
        setEditingCell({ line, month });
        setEditValue(value.toString());
    };

    const handleSave = async () => {
        if (!editingCell || !data) return;

        try {
            await api.post('/pnl/override', {
                line_number: editingCell.line,
                month: editingCell.month,
                value: parseFloat(editValue)
            });

            // Optimistic update
            const newRows = data.rows.map(row => {
                if (row.line_number === editingCell.line) {
                    return {
                        ...row,
                        values: { ...row.values, [editingCell.month]: parseFloat(editValue) }
                    };
                }
                return row;
            });
            setData({ ...data, rows: newRows });
            setEditingCell(null);
        } catch (error) {
            console.error('Error saving override:', error);
            alert('Failed to save changes');
        }
    };

    const formatCurrency = (val: number) => {
        return val.toLocaleString(language === 'pt' ? 'pt-BR' : 'en-US', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    };

    const handleExport = () => {
        alert('Export functionality coming soon!');
    };

    if (loading) return (
        <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
    );

    if (!data) return <div className="text-center text-slate-400 mt-12">{t.noData}</div>;

    const filteredRows = data.rows.filter(row =>
        row.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">{t.title}</h2>
                    <p className="text-slate-400 text-sm">{t.subtitle}</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={16} />
                        <input
                            type="text"
                            placeholder={t.search}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="glass-input w-full pl-10"
                        />
                    </div>
                    <button onClick={handleExport} className="btn-secondary flex items-center gap-2">
                        <Download size={16} /> {t.export}
                    </button>
                </div>
            </div>

            {/* Table Container */}
            <GlassCard className="overflow-hidden p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-900/80 text-slate-400 font-medium uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4 sticky left-0 bg-slate-900/95 backdrop-blur-sm z-10 min-w-[300px]">Description</th>
                                {data.headers.map(header => (
                                    <th key={header} className="px-6 py-4 text-right min-w-[120px]">{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredRows.map((row, index) => {
                                const isHeader = row.is_header;
                                const isTotal = row.is_total;

                                return (
                                    <motion.tr
                                        key={row.line_number}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.02 }}
                                        className={`
                                            group transition-colors hover:bg-white/5
                                            ${isHeader ? 'bg-slate-800/30 font-semibold text-cyan-400' : ''}
                                            ${isTotal ? 'bg-slate-800/50 font-bold text-white border-t-2 border-white/10' : 'text-slate-300'}
                                        `}
                                    >
                                        <td className="px-6 py-3 sticky left-0 bg-slate-900/20 backdrop-blur-sm group-hover:bg-slate-800/40 transition-colors">
                                            <div className="flex items-center gap-2" style={{ paddingLeft: `${row.indent_level * 16}px` }}>
                                                {isHeader && <ChevronDown size={14} />}
                                                {!isHeader && !isTotal && <div className="w-4" />}
                                                {row.description}
                                            </div>
                                        </td>
                                        {data.headers.map(month => {
                                            const val = row.values[month] || 0;
                                            const isEditing = editingCell?.line === row.line_number && editingCell?.month === month;
                                            const isNegative = val < 0;

                                            return (
                                                <td key={month} className="px-6 py-3 text-right relative group/cell">
                                                    {isEditing ? (
                                                        <div className="flex items-center justify-end gap-2 absolute inset-0 px-2 bg-slate-800 z-20">
                                                            <input
                                                                autoFocus
                                                                type="number"
                                                                value={editValue}
                                                                onChange={(e) => setEditValue(e.target.value)}
                                                                className="w-24 bg-slate-900 border border-cyan-500 rounded px-2 py-1 text-right text-white outline-none"
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') handleSave();
                                                                    if (e.key === 'Escape') setEditingCell(null);
                                                                }}
                                                            />
                                                            <button onClick={handleSave} className="text-emerald-400 hover:text-emerald-300"><Save size={14} /></button>
                                                            <button onClick={() => setEditingCell(null)} className="text-red-400 hover:text-red-300"><X size={14} /></button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-end gap-2">
                                                            <span className={`${isNegative ? 'text-red-400' : (isTotal ? 'text-emerald-400' : 'text-slate-300')}`}>
                                                                {formatCurrency(val)}
                                                            </span>
                                                            {!isHeader && !isTotal && (
                                                                <button
                                                                    onClick={() => handleEditClick(row.line_number, month, val)}
                                                                    className="opacity-0 group-hover/cell:opacity-100 transition-opacity text-slate-500 hover:text-cyan-400"
                                                                >
                                                                    <Edit2 size={12} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
        </motion.div>
    );
}
