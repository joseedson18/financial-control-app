import React, { useEffect, useState } from 'react';
import api from '../api';
import { Save, Plus, Trash2 } from 'lucide-react';

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
        try {
            await api.post('/mappings', { mappings });
            alert('Mappings saved successfully!');
        } catch (error) {
            console.error('Error saving mappings:', error);
            alert('Error saving mappings');
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

    if (loading) return <div>Loading mappings...</div>;

    return (
        <div className="p-4 bg-white rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Cost Center Mappings</h2>
                <div className="flex gap-2">
                    <button onClick={handleAdd} className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">
                        <Plus size={16} /> Add
                    </button>
                    <button onClick={handleSave} className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
                        <Save size={16} /> Save
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto max-h-[600px]">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                        <tr>
                            <th className="px-2 py-1 border">Group</th>
                            <th className="px-2 py-1 border">Cost Center</th>
                            <th className="px-2 py-1 border">Supplier/Client</th>
                            <th className="px-2 py-1 border">P&L Line</th>
                            <th className="px-2 py-1 border">Type</th>
                            <th className="px-2 py-1 border">Active</th>
                            <th className="px-2 py-1 border">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mappings.map((item, idx) => (
                            <tr key={idx}>
                                <td className="p-1 border"><input className="w-full p-1 border rounded" value={item.grupo_financeiro} onChange={e => handleChange(idx, 'grupo_financeiro', e.target.value)} /></td>
                                <td className="p-1 border"><input className="w-full p-1 border rounded" value={item.centro_custo} onChange={e => handleChange(idx, 'centro_custo', e.target.value)} /></td>
                                <td className="p-1 border"><input className="w-full p-1 border rounded" value={item.fornecedor_cliente} onChange={e => handleChange(idx, 'fornecedor_cliente', e.target.value)} /></td>
                                <td className="p-1 border"><input className="w-full p-1 border rounded w-16" value={item.linha_pl} onChange={e => handleChange(idx, 'linha_pl', e.target.value)} /></td>
                                <td className="p-1 border">
                                    <select className="w-full p-1 border rounded" value={item.tipo} onChange={e => handleChange(idx, 'tipo', e.target.value)}>
                                        <option value="Receita">Revenue</option>
                                        <option value="Custo">Cost</option>
                                        <option value="Despesa">Expense</option>
                                    </select>
                                </td>
                                <td className="p-1 border">
                                    <select className="w-full p-1 border rounded" value={item.ativo} onChange={e => handleChange(idx, 'ativo', e.target.value)}>
                                        <option value="Sim">Yes</option>
                                        <option value="Não">No</option>
                                    </select>
                                </td>
                                <td className="p-1 border text-center">
                                    <button onClick={() => handleDelete(idx)} className="text-red-600 hover:text-red-800"><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MappingManager;
