import React, { useEffect, useState } from 'react';
import api from '../api';
import { Save, Plus, Trash2, Check } from 'lucide-react';

interface MappingItem {
    grupo_financeiro: string;
    centro_custo: string;
    fornecedor_cliente: string;
    linha_pl: string;
    tipo: string;
    ativo: string;
    observacoes?: string;
}

const MappingManager: React.FC = () => {
    const [mappings, setMappings] = useState<MappingItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchMappings();
    }, []);

    const fetchMappings = async () => {
        try {
            const response = await api.get('/mappings');
            setMappings(response.data);
        } catch (error) {
            console.error('Error fetching mappings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.post('/mappings', { mappings });
            // Show success feedback
            setTimeout(() => setSaving(false), 1000);
        } catch (error) {
            console.error('Error saving mappings:', error);
            alert('Error saving mappings');
            setSaving(false);
        }
    };

    const handleChange = (index: number, field: keyof MappingItem, value: string) => {
        const newMappings = [...mappings];
        newMappings[index] = { ...newMappings[index], [field]: value };
        setMappings(newMappings);
    };

    const handleDelete = (index: number) => {
        const newMappings = mappings.filter((_, i) => i !== index);
        setMappings(newMappings);
    };

    const handleAdd = () => {
        setMappings([...mappings, {
            grupo_financeiro: '',
            centro_custo: '',
            fornecedor_cliente: '',
            linha_pl: '',
            tipo: 'Despesa',
            ativo: 'Sim',
            observacoes: ''
        }]);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-16">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading mappings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="card-dark p-0 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-semibold text-gray-200 flex items-center gap-2">
                        <div className="w-1 h-6 bg-gradient-to-b from-cyan-500 to-purple-500 rounded-full"></div>
                        Cost Center Mappings
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">{mappings.length} mapping rules</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleAdd}
                        className="btn-secondary flex items-center gap-2 text-sm"
                    >
                        <Plus size={18} />
                        <span>Add Rule</span>
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`flex items-center gap-2 text-sm ${saving
                            ? 'btn-secondary'
                            : 'btn-primary'
                            }`}
                    >
                        {saving ? (
                            <>
                                <Check size={18} className="animate-pulse" />
                                <span>Saved!</span>
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                <span>Save Changes</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto scrollbar-dark max-h-[600px]">
                <table className="min-w-full text-sm">
                    <thead className="glass-strong sticky top-0 z-10">
                        <tr>
                            <th className="px-3 py-3 text-left text-gray-300 font-semibold border-b border-white/10">Group</th>
                            <th className="px-3 py-3 text-left text-gray-300 font-semibold border-b border-white/10">Cost Center</th>
                            <th className="px-3 py-3 text-left text-gray-300 font-semibold border-b border-white/10">Supplier/Client</th>
                            <th className="px-3 py-3 text-left text-gray-300 font-semibold border-b border-white/10 w-24">P&L Line</th>
                            <th className="px-3 py-3 text-left text-gray-300 font-semibold border-b border-white/10 w-32">Type</th>
                            <th className="px-3 py-3 text-left text-gray-300 font-semibold border-b border-white/10 w-24">Active</th>
                            <th className="px-3 py-3 text-center text-gray-300 font-semibold border-b border-white/10 w-20">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {mappings.map((item, idx) => (
                            <tr key={idx} className="hover:bg-white/5 transition-colors">
                                <td className="p-2 border-r border-white/5">
                                    <input
                                        className="input-dark w-full text-sm py-1.5"
                                        value={item.grupo_financeiro}
                                        onChange={e => handleChange(idx, 'grupo_financeiro', e.target.value)}
                                        placeholder="Financial Group"
                                    />
                                </td>
                                <td className="p-2 border-r border-white/5">
                                    <input
                                        className="input-dark w-full text-sm py-1.5"
                                        value={item.centro_custo}
                                        onChange={e => handleChange(idx, 'centro_custo', e.target.value)}
                                        placeholder="Cost Center"
                                    />
                                </td>
                                <td className="p-2 border-r border-white/5">
                                    <input
                                        className="input-dark w-full text-sm py-1.5"
                                        value={item.fornecedor_cliente}
                                        onChange={e => handleChange(idx, 'fornecedor_cliente', e.target.value)}
                                        placeholder="Supplier/Client"
                                    />
                                </td>
                                <td className="p-2 border-r border-white/5">
                                    <input
                                        className="input-dark w-full text-sm py-1.5"
                                        value={item.linha_pl}
                                        onChange={e => handleChange(idx, 'linha_pl', e.target.value)}
                                        placeholder="Line #"
                                    />
                                </td>
                                <td className="p-2 border-r border-white/5">
                                    <select
                                        className="input-dark w-full text-sm py-1.5"
                                        value={item.tipo}
                                        onChange={e => handleChange(idx, 'tipo', e.target.value)}
                                    >
                                        <option value="Receita">Revenue</option>
                                        <option value="Custo">Cost</option>
                                        <option value="Despesa">Expense</option>
                                    </select>
                                </td>
                                <td className="p-2 border-r border-white/5">
                                    <select
                                        className="input-dark w-full text-sm py-1.5"
                                        value={item.ativo}
                                        onChange={e => handleChange(idx, 'ativo', e.target.value)}
                                    >
                                        <option value="Sim">Yes</option>
                                        <option value="Não">No</option>
                                    </select>
                                </td>
                                <td className="p-2 text-center">
                                    <button
                                        onClick={() => handleDelete(idx)}
                                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                                        title="Delete mapping"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer Info */}
            <div className="p-4 border-t border-white/10 bg-white/5">
                <p className="text-xs text-gray-500 text-center">
                    Changes are saved to memory. Click "Save Changes" to persist your modifications.
                </p>
            </div>
        </div>
    );
};

export default MappingManager;
