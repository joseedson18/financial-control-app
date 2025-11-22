import { useState, useEffect } from 'react';
import api from '../api';
import { Brain, Sparkles, Loader2, Settings, Key } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { GlassCard } from './ui/GlassCard';
import { motion, AnimatePresence } from 'framer-motion';

interface AiInsightsProps {
    data: any;
    language: 'pt' | 'en';
}

const translations = {
    pt: {
        title: 'Análise de IA',
        subtitle: 'Insights financeiros gerados por inteligência artificial',
        placeholder: 'Cole sua chave de API da OpenAI aqui (opcional)',
        generate: 'Gerar Insights',
        analyzing: 'Analisando dados...',
        disclaimer: 'Os insights são gerados por IA e devem ser revisados por um profissional.',
        error: 'Erro ao gerar insights. Verifique sua chave de API.',
        empty: 'Sem insights ainda. Clique em "Gerar Insights" para começar.',
        configure: 'Configurar API Key',
        save: 'Salvar',
        cancel: 'Cancelar'
    },
    en: {
        title: 'AI Insights',
        subtitle: 'AI-powered financial analysis',
        placeholder: 'Paste your OpenAI API key here (optional)',
        generate: 'Generate Insights',
        analyzing: 'Analyzing data...',
        disclaimer: 'Insights are AI-generated and should be reviewed by a professional.',
        error: 'Error generating insights. Check your API key.',
        empty: 'No insights yet. Click "Generate Insights" to start.',
        configure: 'Configure API Key',
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
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.detail || t.error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <GlassCard className="relative overflow-hidden border-purple-500/30">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/20">
                            <Brain size={24} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
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
                                        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500" />
                                    <button
                                        onClick={() => handleSaveKey(apiKey)}
                                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-colors"
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
                        <div className="bg-slate-800/50 rounded-xl p-6 border border-white/5">
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
                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-medium shadow-lg shadow-purple-500/25 transition-all hover:scale-105 flex items-center gap-2 mx-auto"
                        >
                            <Sparkles size={20} />
                            {t.generate}
                        </button>
                    </div>
                )}
            </div>
        </GlassCard>
    );
}
