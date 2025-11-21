import React, { useEffect, useState } from 'react';
import api from '../api';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';

interface PnLItem {
    line_number: number;
    description: string;
    values: Record<string, number>;
    is_header: boolean;
    is_total: boolean;
}

interface PnLResponse {
    headers: string[];
    rows: PnLItem[];
}

const PnLTable: React.FC = () => {
    const [data, setData] = useState<PnLResponse | null>(null);
    const [loading, setLoading] = useState(true);

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

    const handleDownload = () => {
        if (!data) return;

        // Prepare data for Excel
        const wsData = [];

        // Header row
        wsData.push(['Description', ...data.headers]);

        // Data rows
        data.rows.forEach(row => {
            const rowData = [row.description];
            data.headers.forEach(header => {
                rowData.push(String(row.values[header] || 0));
            });
            wsData.push(rowData);
        });

        const ws = XLSX.utils.aoa_to_sheet(wsData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "P&L");
        XLSX.writeFile(wb, "PnL_Statement.xlsx");
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-16">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading P&L...</p>
                </div>
            </div>
        );
    }

    if (!data || data.rows.length === 0) {
        return (
            <div className="card-dark text-center max-w-2xl mx-auto">
                <p className="text-gray-400">No data available. Please upload a file.</p>
            </div>
        );
    }

    return (
        <div className="card-dark overflow-hidden p-0">
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-semibold text-gray-200 flex items-center gap-2">
                        <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                        Profit & Loss Statement
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">{data.rows.length} line items across {data.headers.length} months</p>
                </div>
                <button
                    onClick={handleDownload}
                    className="btn-secondary flex items-center gap-2 text-sm"
                >
                    <Download size={18} />
                    <span>Export to Excel</span>
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto scrollbar-dark">
                <table className="w-full text-sm">
                    <thead className="glass-strong sticky top-0 z-10">
                        <tr>
                            <th className="px-6 py-4 text-left border-b border-white/10 text-gray-300 font-semibold sticky left-0 glass-strong">
                                Description
                            </th>
                            {data.headers.map(header => (
                                <th key={header} className="px-6 py-4 text-right border-b border-white/10 text-gray-300 font-semibold whitespace-nowrap">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {data.rows.map((row, idx) => (
                            <tr
                                key={idx}
                                className={`
                                    transition-colors
                                    ${row.is_header ? 'glass bg-white/5 font-bold text-cyan-400' : ''}
                                    ${row.is_total ? 'glass bg-purple-500/10 font-bold text-purple-400 border-y-2 border-purple-500/30' : ''}
                                    ${!row.is_header && !row.is_total ? 'hover:bg-white/5' : ''}
                                `}
                            >
                                <td className={`px-6 py-3 sticky left-0 glass-strong ${row.is_header || row.is_total ? '' : 'pl-10'} text-gray-200`}>
                                    {row.description}
                                </td>
                                {data.headers.map(header => (
                                    <td key={header} className="px-6 py-3 text-right whitespace-nowrap font-mono text-gray-300">
                                        {row.description.includes('%')
                                            ? ((row.values[header] || 0) * 100).toFixed(2) + '%'
                                            : (row.values[header] || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                                        }
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PnLTable;
