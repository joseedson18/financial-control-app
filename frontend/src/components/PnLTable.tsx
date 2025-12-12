import { useEffect, useState } from 'react';
import api from '../api';
import { ChevronDown, Edit2, Save, X, Download, Search, Calculator } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { motion } from 'framer-motion';
import FormulaModal from './FormulaModal';

interface PnLRow {
    line_number: number;
    description: string;
    values: { [key: string]: number };
    is_header: boolean;
    is_total: boolean;
    indent_level: number;
}

interface Transaction {
    date: string;
    month: string;
    centro_custo: string;
    fornecedor: string;
    descricao: string;
    valor: number;
    categoria: string;
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
    const [transactionModal, setTransactionModal] = useState<{
        isOpen: boolean;
        title: string;
        value: number;
        transactions: Transaction[];
        loading: boolean;
    } | null>(null);
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
        if (!data) return;

        // Generate CSV content from P&L data
        let csvContent = "Description," + data.headers.join(",") + "\n";

        data.rows.forEach(row => {
            const values = data.headers.map(header => {
                const val = row.values[header] || 0;
                return val.toFixed(2);
            }).join(",");

            csvContent += `"${row.description}",${values}\n`;
        });

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `DRE_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleCellClick = async (row: PnLRow, month: string, value: number) => {
        // Don't open modal for headers
        if (row.is_header) return;

        // Open modal with loading state
        setTransactionModal({
            isOpen: true,
            title: `${row.description} - ${month}`,
            value: value,
            transactions: [],
            loading: true
        });

        try {
            // Fetch transactions for this line
            const response = await api.get(`/pnl/transactions/${row.line_number}`, {
                params: { month }
            });

            setTransactionModal({
                isOpen: true,
                title: `${row.description} - ${month}`,
                value: response.data.total,
                transactions: response.data.transactions || [],
                loading: false
            });
        } catch (error) {
            console.error('Error fetching transactions:', error);
            setTransactionModal(prev => prev ? { ...prev, loading: false } : null);
        }
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
                        <thead className="bg-[#0f172a] text-slate-400 font-semibold uppercase text-[11px] tracking-wider border-b border-white/10">
                            <tr>
                                <th className="px-6 py-4 sticky left-0 bg-[#0f172a] z-20 min-w-[300px]">Description</th>
                                {data.headers.map(header => (
                                    <th key={header} className="px-6 py-4 text-right min-w-[120px] font-bold text-slate-300">{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredRows.map((row, index) => {
                                const isHeader = row.is_header;
                                const isTotal = row.is_total;

                                // Determine if this is a revenue-related row
                                const isRevenue = row.description.toLowerCase().includes('receita') ||
                                    row.description.toLowerCase().includes('revenue') ||
                                    row.description.toLowerCase().includes('vendas') ||
                                    row.description.toLowerCase().includes('sales');

                                // Determine if this is a profit/lucro row
                                const isProfit = row.description.toLowerCase().includes('lucro') ||
                                    row.description.toLowerCase().includes('profit') ||
                                    row.description.toLowerCase().includes('resultado');

                                return (
                                    <motion.tr
                                        key={row.line_number}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.02 }}
                                        className={`
                                            group transition-colors odd:bg-transparent even:bg-white/[0.02] hover:!bg-white/[0.04]
                                            ${isHeader ? '!bg-slate-800/40 text-cyan-300 font-semibold border-y border-white/5' : ''}
                                            ${isTotal ? '!bg-slate-800/60 font-bold border-y border-white/10 shadow-lg' : ''}
                                            ${!isHeader && !isTotal ? 'border-b border-white/[0.02]' : ''}
                                        `}
                                    >
                                        <td className={`px-6 py-3.5 sticky left-0 transition-colors z-10 text-sm
                                            group-odd:bg-[#0b1221] group-even:bg-[#0d1526] group-hover:!bg-[#111a2d]
                                            ${isHeader ? '!bg-[#1e293b]' : isTotal ? '!bg-[#1e293b]' : ''}
                                        `}>
                                            <div className="flex items-center gap-2" style={{ paddingLeft: `${row.indent_level * 16}px` }}>
                                                {isHeader && <ChevronDown size={14} className="text-cyan-400/70" />}
                                                {!isHeader && !isTotal && <div className="w-4" />}
                                                <span className={`${isHeader ? 'uppercase tracking-wider text-[11px]' : ''}`}>
                                                    {row.description}
                                                </span>
                                            </div>
                                        </td>
                                        {data.headers.map(month => {
                                            const val = row.values[month] || 0;
                                            const isEditing = editingCell?.line === row.line_number && editingCell?.month === month;
                                            const isNegative = val < 0;
                                            const isPositive = val > 0;

                                            // Determine color based on type and value
                                            let valueColor = 'text-slate-400'; // Zero or default
                                            if (isNegative) {
                                                valueColor = 'text-red-400 font-semibold';
                                            } else if (isRevenue && isPositive) {
                                                valueColor = 'text-emerald-400 font-semibold';
                                            } else if (isTotal || isProfit) {
                                                if (isPositive) {
                                                    valueColor = 'text-emerald-400 font-bold';
                                                } else if (isNegative) {
                                                    valueColor = 'text-red-400 font-bold';
                                                } else {
                                                    valueColor = 'text-white font-bold';
                                                }
                                            } else if (isPositive) {
                                                valueColor = 'text-white';
                                            }

                                            return (
                                                <td key={month} className={`px-6 py-4 text-right min-w-[120px] relative group/cell ${isTotal ? 'font-bold' : ''
                                                    }`}>
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
                                                        <div
                                                            className={`flex items-center justify-end h-full ${!isHeader && val !== 0 ? 'cursor-pointer hover:bg-blue-900/20 transition-colors rounded px-2 -mx-2' : ''
                                                                }`}
                                                            onClick={() => !isHeader && val !== 0 && handleCellClick(row, month, val)}
                                                            title={!isHeader && val !== 0 ? 'Clique para ver detalhes' : ''}
                                                        >
                                                            <span className={valueColor}>
                                                                {formatCurrency(val)}
                                                            </span>

                                                            {/* Action Icons - Absolute positioned to not affect alignment */}
                                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover/cell:opacity-100 transition-opacity">
                                                                {!isHeader && !isTotal && val !== 0 && (
                                                                    <div className="bg-slate-900/80 p-1 rounded backdrop-blur-sm">
                                                                        <Calculator
                                                                            size={14}
                                                                            className="text-slate-400 hover:text-cyan-400"
                                                                        />
                                                                    </div>
                                                                )}
                                                                {!isHeader && !isTotal && (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleEditClick(row.line_number, month, val);
                                                                        }}
                                                                        className="bg-slate-900/80 p-1 rounded backdrop-blur-sm text-slate-400 hover:text-cyan-400"
                                                                    >
                                                                        <Edit2 size={12} />
                                                                    </button>
                                                                )}
                                                            </div>
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

            {/* Transaction Modal */}
            {transactionModal && (
                <FormulaModal
                    isOpen={transactionModal.isOpen}
                    onClose={() => setTransactionModal(null)}
                    title={transactionModal.title}
                    value={transactionModal.value}
                    transactions={transactionModal.transactions}
                    showTransactions={true}
                    language={language}
                />
            )}
        </motion.div>
    );
}
