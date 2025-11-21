import React, { useState } from 'react';
import api from '../api';
import { Brain, Sparkles, Lock, Send, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AiInsightsProps {
    data: any;
    language: 'pt' | 'en';
}

const translations = {
    pt: {
        title: 'Insights de IA',
        subtitle: 'Análise financeira inteligente com GPT-4',
        placeholder: 'Insira sua chave de API da OpenAI (sk-...)',
        generate: 'Gerar Análise',
        analyzing: 'Analisando...',
        disclaimer: 'Sua chave não é salva e é usada apenas para esta requisição.',
        error: 'Erro ao gerar insights. Verifique sua chave.',
        empty: 'Nenhum insight gerado ainda.'
    },
    en: {
        title: 'AI Insights',
        subtitle: 'Smart financial analysis with GPT-4',
        placeholder: 'Enter your OpenAI API Key (sk-...)',
        generate: 'Generate Analysis',
        analyzing: 'Analyzing...',
        disclaimer: 'Your key is not saved and is used only for this request.',
        error: 'Error generating insights. Check your key.',
        empty: 'No insights generated yet.'
    }
};

const AiInsights: React.FC<AiInsightsProps> = ({ data, language }) => {
    const [apiKey, setApiKey] = useState('');
    const [insights, setInsights] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const t = translations[language];

    const handleGenerate = async () => {
        if (!apiKey) return;

        setLoading(true);
        setError('');
        setInsights('');

        try {
            const response = await api.post('/api/insights', {
                api_key: apiKey,
                data: data
            });
            setInsights(response.data.insights);
        } catch (err) {
            console.error(err);
            setError(t.error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card-dark relative overflow-hidden border border-purple-500/30">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/20">
                        <Brain size={24} className="text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            {t.title}
                            <Sparkles size={16} className="text-yellow-400 animate-pulse" />
                        </h3>
                        <p className="text-sm text-gray-400">{t.subtitle}</p>
                    </div>
                </div>

                {!insights && (
                    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 backdrop-blur-sm mb-6">
                        <div className="flex flex-col gap-4">
                            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                <Lock size={14} className="text-gray-400" />
                                OpenAI API Key
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="password"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder={t.placeholder}
                                    className="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                />
                                <button
                                    onClick={handleGenerate}
                                    disabled={!apiKey || loading}
                                    className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-all
                                        ${!apiKey || loading
                                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-purple-500/25 active:scale-95'}
                                    `}
                                >
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                    {loading ? t.analyzing : t.generate}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                <Lock size={10} /> {t.disclaimer}
                            </p>
                            {error && <p className="text-red-400 text-sm">{error}</p>}
                        </div>
                    </div>
                )}

                {insights && (
                    <div className="prose prose-invert max-w-none">
                        <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
                            <ReactMarkdown>{insights}</ReactMarkdown>
                        </div>
                        <button
                            onClick={() => setInsights('')}
                            className="mt-4 text-sm text-gray-400 hover:text-white transition-colors underline"
                        >
                            Generate New Analysis
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AiInsights;
