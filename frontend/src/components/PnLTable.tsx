import { useEffect, useState } from 'react';
import api from '../api';
import { Download, Edit2, Save, Trash2 } from 'lucide-react';

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
        confirmClear: 'Tem certeza que deseja limpar todas as edições manuais?'
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
        confirmClear: 'Are you sure you want to clear all manual edits?'
    }
};

export default function PnLTable({ language }: PnLProps) {
    const [data, setData] = useState<PnLData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingCell, setEditingCell] = useState<{ line: number, month: string } | null>(null);
    const [editValue, setEditValue] = useState('');
    const t = translations[language];

    const fetchData = async () => {
        try {
            const response = await api.get('/pnl');
            setData(response.data);
        } catch (error) {
            console.error('Error fetching P&L:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

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
        <div className="space-y-4">
            <div className="flex justify-between items-center">
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
