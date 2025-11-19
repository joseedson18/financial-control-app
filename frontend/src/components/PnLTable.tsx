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

    if (loading) return <div className="p-8 text-center">Loading P&L...</div>;
    if (!data || data.rows.length === 0) return <div className="p-8 text-center">No data available. Please upload a file.</div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-slate-800">Profit & Loss Statement</h2>
                <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium"
                >
                    <Download size={16} /> Export to Excel
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 font-medium">
                        <tr>
                            <th className="px-6 py-3 border-b border-slate-200 sticky left-0 bg-slate-50 z-10">Description</th>
                            {data.headers.map(header => (
                                <th key={header} className="px-6 py-3 border-b border-slate-200 text-right whitespace-nowrap">{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {data.rows.map((row, idx) => (
                            <tr
                                key={idx}
                                className={`
                  hover:bg-slate-50 transition-colors
                  ${row.is_header ? 'bg-slate-50 font-bold text-slate-700' : ''}
                  ${row.is_total ? 'bg-blue-50 font-bold text-slate-800' : ''}
                `}
                            >
                                <td className={`px-6 py-3 sticky left-0 bg-inherit z-10 ${row.is_header || row.is_total ? '' : 'pl-10'}`}>
                                    {row.description}
                                </td>
                                {data.headers.map(header => (
                                    <td key={header} className="px-6 py-3 text-right whitespace-nowrap font-mono text-slate-600">
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
