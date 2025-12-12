import { useEffect, useState } from 'react';
import api from '../api';
import { Save, Plus, Trash2, Search, RefreshCw } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { motion, AnimatePresence } from 'framer-motion';

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

    if (loading) return (
        <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
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
                    <button
                        onClick={async () => {
                            if (confirm(t.confirmReset || 'Reset all mappings to default?')) {
                                try {
                                    await api.delete('/api/mappings');
                                    window.location.reload();
                                } catch {
                                    alert('Error resetting mappings');
                                }
                            }
                        }}
                        className="btn-danger flex items-center gap-2"
                    >
                        <RefreshCw size={18} />
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={20} />
                <input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="glass-input w-full pl-10"
                />
            </div>

            {/* Table */}
            <GlassCard className="overflow-hidden p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#0f172a] text-slate-400 font-semibold uppercase text-[11px] tracking-wider border-b border-white/10">
                            <tr>
                                <th className="px-6 py-4 text-left">{t.headers.financialGroup}</th>
                                <th className="px-6 py-4 text-left">{t.headers.costCenter}</th>
                                <th className="px-6 py-4 text-left">{t.headers.supplier}</th>
                                <th className="px-6 py-4 text-left">{t.headers.plLine}</th>
                                <th className="px-6 py-4 text-left">{t.headers.type}</th>
                                <th className="px-6 py-4 text-center">{t.headers.actions}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.02]">
                            <AnimatePresence>
                                {filteredMappings.map((item, index) => (
                                    <motion.tr
                                        key={index}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="group transition-colors odd:bg-transparent even:bg-white/[0.02] hover:!bg-white/[0.04]"
                                    >
                                        <td className="px-6 py-4">
                                            <input
                                                type="text"
                                                value={item.grupo_financeiro}
                                                onChange={(e) => handleChange(index, 'grupo_financeiro', e.target.value)}
                                                className="bg-transparent border-none w-full text-slate-300 focus:ring-0 focus:text-cyan-300 p-0 placeholder-slate-600"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <input
                                                type="text"
                                                value={item.centro_custo}
                                                onChange={(e) => handleChange(index, 'centro_custo', e.target.value)}
                                                className="bg-transparent border-none w-full text-slate-300 focus:ring-0 focus:text-cyan-300 p-0 placeholder-slate-600"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <input
                                                type="text"
                                                value={item.fornecedor_cliente}
                                                onChange={(e) => handleChange(index, 'fornecedor_cliente', e.target.value)}
                                                className="bg-transparent border-none w-full text-slate-300 focus:ring-0 focus:text-cyan-300 p-0 placeholder-slate-600"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <input
                                                type="text"
                                                value={item.linha_pl}
                                                onChange={(e) => handleChange(index, 'linha_pl', e.target.value)}
                                                className="bg-transparent border-none w-full text-cyan-400 font-mono focus:ring-0 p-0 placeholder-slate-600"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={item.tipo}
                                                onChange={(e) => handleChange(index, 'tipo', e.target.value)}
                                                className="bg-transparent border-none text-slate-300 focus:ring-0 p-0 focus:text-cyan-300 cursor-pointer"
                                            >
                                                <option value="Despesa" className="bg-slate-900 text-slate-300">Despesa</option>
                                                <option value="Receita" className="bg-slate-900 text-slate-300">Receita</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleDelete(index)}
                                                className="text-slate-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100 transform hover:scale-110"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </GlassCard>
        </motion.div>
    );
}
