import { useEffect, useState } from 'react';
import api from '../api';
import { Save, Plus, Trash2, Search } from 'lucide-react';

interface MappingManagerProps {
    language: 'pt' | 'en';
}

interface MappingItem {
    grupo_financeiro: string;
    centro_custo: string;
    fornecedor_cliente: string;
    linha_pl: string;
    tipo: string;
    ativo: string;
    observacoes?: string;
}

const translations = {
    pt: {
        title: 'Gerenciador de Mapeamentos',
        subtitle: 'Configure como suas despesas são categorizadas no DRE',
        searchPlaceholder: 'Buscar mapeamentos...',
        saveChanges: 'Salvar Alterações',
        addMapping: 'Adicionar Mapeamento',
        loading: 'Carregando mapeamentos...',
        headers: {
            financialGroup: 'Grupo Financeiro',
            costCenter: 'Centro de Custo',
            supplier: 'Fornecedor/Cliente',
            plLine: 'Linha DRE',
            type: 'Tipo',
            active: 'Ativo',
            actions: 'Ações'
        },
        success: 'Mapeamentos salvos com sucesso!',
        error: 'Erro ao salvar mapeamentos.',
        resetMappings: 'Resetar Padrão',
        confirmReset: 'Tem certeza que deseja resetar os mapeamentos para o padrão?'
    },
    en: {
        title: 'Mapping Manager',
        subtitle: 'Configure how your expenses are categorized in the P&L',
        searchPlaceholder: 'Search mappings...',
        saveChanges: 'Save Changes',
        addMapping: 'Add Mapping',
        loading: 'Loading mappings...',
        headers: {
            financialGroup: 'Financial Group',
            costCenter: 'Cost Center',
            supplier: 'Supplier/Client',
            plLine: 'P&L Line',
            type: 'Type',
            active: 'Active',
            actions: 'Actions'
        },
        success: 'Mappings saved successfully!',
        error: 'Error saving mappings.',
        resetMappings: 'Reset Defaults',
        confirmReset: 'Are you sure you want to reset mappings to default?'
    }
};

export default function MappingManager({ language }: MappingManagerProps) {
    const [mappings, setMappings] = useState<MappingItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const t = translations[language];

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
            setHasUnsavedChanges(false);
            alert(t.success);
        } catch (error) {
            console.error('Error saving mappings:', error);
            alert(t.error);
        }
    };

    const handleAdd = () => {
        setMappings([
            {
                grupo_financeiro: '',
                centro_custo: '',
                fornecedor_cliente: '',
                linha_pl: '',
                tipo: 'Despesa',
                ativo: 'Sim'
            },
            ...mappings
        ]);
        setHasUnsavedChanges(true);
    };

    const handleDelete = (index: number) => {
        const newMappings = [...mappings];
        newMappings.splice(index, 1);
        setMappings(newMappings);
        setHasUnsavedChanges(true);
    };

    const handleChange = (index: number, field: keyof MappingItem, value: string) => {
        const newMappings = [...mappings];
        newMappings[index] = { ...newMappings[index], [field]: value };
        setMappings(newMappings);
        setHasUnsavedChanges(true);
    };

    const filteredMappings = mappings.filter(m =>
        Object.values(m).some(val =>
            String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    if (loading) return <div className="p-8 text-center text-cyan-400 animate-pulse">{t.loading}</div>;

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-xl font-semibold text-gray-200">{t.title}</h2>
                    <p className="text-sm text-gray-400">{t.subtitle}</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button
                        onClick={async () => {
                            if (confirm(t.confirmReset || 'Reset all mappings to default?')) {
                                try {
                                    await api.delete('/api/mappings');
                                    window.location.reload();
                                } catch (e) {
                                    alert('Error resetting mappings');
                                }
                            }
                        }}
                        className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 transition-colors flex items-center gap-2"
                    >
                        <Trash2 size={18} />
                        {t.resetMappings || 'Reset'}
                    </button>
                    <button
                        onClick={handleAdd}
                        className="btn-secondary flex items-center gap-2"
                    >
                        <Plus size={18} />
                        {t.addMapping}
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!hasUnsavedChanges}
                        className={`btn-primary flex items-center gap-2 ${!hasUnsavedChanges && 'opacity-50 cursor-not-allowed'}`}
                    >
                        <Save size={18} />
                        {t.saveChanges}
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
                <input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-gray-200 focus:outline-none focus:border-cyan-500 transition-colors"
                />
            </div>

            {/* Table */}
            <div className="card-dark overflow-hidden p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-800/50 text-gray-400 font-medium uppercase">
                            <tr>
                                <th className="px-4 py-3">{t.headers.financialGroup}</th>
                                <th className="px-4 py-3">{t.headers.costCenter}</th>
                                <th className="px-4 py-3">{t.headers.supplier}</th>
                                <th className="px-4 py-3">{t.headers.plLine}</th>
                                <th className="px-4 py-3">{t.headers.type}</th>
                                <th className="px-4 py-3 text-center">{t.headers.actions}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {filteredMappings.map((item, index) => (
                                <tr key={index} className="hover:bg-white/5 transition-colors">
                                    <td className="p-2">
                                        <input
                                            type="text"
                                            value={item.grupo_financeiro}
                                            onChange={(e) => handleChange(index, 'grupo_financeiro', e.target.value)}
                                            className="bg-transparent border-none w-full text-gray-300 focus:ring-0"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <input
                                            type="text"
                                            value={item.centro_custo}
                                            onChange={(e) => handleChange(index, 'centro_custo', e.target.value)}
                                            className="bg-transparent border-none w-full text-gray-300 focus:ring-0"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <input
                                            type="text"
                                            value={item.fornecedor_cliente}
                                            onChange={(e) => handleChange(index, 'fornecedor_cliente', e.target.value)}
                                            className="bg-transparent border-none w-full text-gray-300 focus:ring-0"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <input
                                            type="text"
                                            value={item.linha_pl}
                                            onChange={(e) => handleChange(index, 'linha_pl', e.target.value)}
                                            className="bg-transparent border-none w-full text-cyan-400 font-mono focus:ring-0"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <select
                                            value={item.tipo}
                                            onChange={(e) => handleChange(index, 'tipo', e.target.value)}
                                            className="bg-transparent border-none text-gray-300 focus:ring-0"
                                        >
                                            <option value="Despesa">Despesa</option>
                                            <option value="Receita">Receita</option>
                                        </select>
                                    </td>
                                    <td className="p-2 text-center">
                                        <button
                                            onClick={() => handleDelete(index)}
                                            className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-400/10 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
