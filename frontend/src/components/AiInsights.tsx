import { useState, useEffect } from 'react';
import api from '../api';
import { Brain, Sparkles, Loader2, Settings, Key } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { GlassCard } from './ui/GlassCard';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardData {
    kpis?: Record<string, number>;
    monthly_data?: Record<string, unknown>[];
    cost_structure?: Record<string, number>;
}

interface AiInsightsProps {
    data: DashboardData | null;
    language: 'pt' | 'en';
}

const translations = {
    pt: {
        title: 'Análise de IA',
        subtitle: 'Insights financeiros gerados por inteligência artificial',
        placeholder: 'Cole sua chave de API da OpenAI aqui (opcional)',
        configure: 'Configurar API Key',
        generate: 'Gerar Insights',
        analyzing: 'Analisando dados...',
        disclaimer: 'Os insights são gerados por IA e devem ser revisados por um profissional.',
        error: 'Erro ao gerar insights.',
        empty: 'Sem insights ainda.',
        save: 'Salvar',
        cancel: 'Cancelar'
    },
    en: {
        title: 'AI Insights',
        subtitle: 'AI-powered financial analysis',
        placeholder: 'Paste your OpenAI API key here (optional)',
        configure: 'Configure API Key',
        generate: 'Generate Insights',
        analyzing: 'Analyzing data...',
        disclaimer: 'Insights are AI-generated and should be reviewed by a professional.',
        error: 'Error generating insights.',
        empty: 'No insights yet.',
        save: 'Save',
        cancel: 'Cancel'
    }
};

export default function AiInsights({ data, language }: AiInsightsProps) {
    const t = translations[language];
    const [insights, setInsights] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSettings, setShowSettings] = useState(false);
    const [apiKey, setApiKey] = useState('');

    useEffect(() => {
        const savedKey = localStorage.getItem('openai_api_key');
        if (savedKey) {
            setApiKey(savedKey);
        }
    }, []);

    // Auto-generate insights when data changes AND we have a key
    useEffect(() => {
        if (data && !insights && !loading && apiKey) {
            handleGenerate();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, apiKey]);

    const handleSaveKey = (key: string) => {
        localStorage.setItem('openai_api_key', key);
        setApiKey(key);
        setShowSettings(false);
    };

    const handleGenerate = async () => {
        if (!apiKey) {
            setError('API Key is missing. Please configure it in settings.');
            setShowSettings(true);
            return;
        }

        setLoading(true);
        setError('');
        setInsights('');

        try {
            const response = await api.post('/api/insights', {
                data: data,
                api_key: apiKey
            });
            setInsights(response.data.insights);
        } catch {
            setError(t.error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <GlassCard className="relative overflow-hidden border-purple-500/30">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

            <div className="relative z-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/20">
                            <Brain size={24} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                                {t.title}
                                <Sparkles size={16} className="text-yellow-400 animate-pulse" />
                            </h3>
                            <p className="text-sm text-slate-400">{t.subtitle}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                        title={t.configure}
                    >
                        <Settings size={20} />
                    </button>
                </div>

                <AnimatePresence>
                    {showSettings && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mb-6 overflow-hidden"
                        >
                            <div className="bg-slate-900/50 p-4 rounded-xl border border-white/10">
                                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                                    <Key size={16} className="text-purple-400" />
                                    {t.placeholder}
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="password"
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                        placeholder="sk-..."
                                        className="glass-input flex-1 !py-2 !text-sm" />
                                    <button
                                        onClick={() => handleSaveKey(apiKey)}
                                        className="btn-primary"
                                    >
                                        {t.save}
                                    </button>
                                </div>
                                <p className="text-xs text-slate-500 mt-2">{t.disclaimer}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {loading && (
                    <div className="flex items-center justify-center p-8 text-purple-400 animate-pulse gap-2">
                        <Loader2 size={24} className="animate-spin" />
                        <span>{t.analyzing}</span>
                    </div>
                )}

                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm mb-4 flex items-center justify-between">
                        <span>{error}</span>
                        <button onClick={handleGenerate} className="ml-2 underline hover:text-red-300">Retry</button>
                    </div>
                )}

                {insights && (
                    <div className="prose prose-invert max-w-none">
                        <div className="bg-[#0f172a]/40 rounded-2xl p-6 sm:p-8 border border-white/5 shadow-inner">
                            <ReactMarkdown>{insights}</ReactMarkdown>
                        </div>
                        <button
                            onClick={handleGenerate}
                            className="mt-4 text-sm text-slate-400 hover:text-white transition-colors underline flex items-center gap-1"
                        >
                            <Sparkles size={12} /> Regenerate Analysis
                        </button>
                    </div>
                )}

                {!insights && !loading && !error && apiKey && (
                    <div className="text-center p-8">
                        <button
                            onClick={handleGenerate}
                            className="btn-primary py-3 px-8 text-base shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_30px_rgba(147,51,234,0.5)] bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center gap-3 mx-auto"
                        >
                            <Sparkles size={20} className="text-purple-200" />
                            {t.generate}
                        </button>
                    </div>
                )}
            </div>
        </GlassCard>
    );
}
