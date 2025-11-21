import React, { useState, useEffect } from 'react';
import api from '../api';
import { Brain, Sparkles, Loader2 } from 'lucide-react';
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
    const [insights, setInsights] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const t = translations[language];

    // Auto-generate insights when data changes
    useEffect(() => {
        if (data && !insights && !loading) {
            handleGenerate();
        }
    }, [data]);

    const handleGenerate = async () => {
        setLoading(true);
        setError('');
        setInsights('');

        try {
            // API Key is handled by backend now
            const response = await api.post('/api/insights', {
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

                {loading && (
                    <div className="flex items-center justify-center p-8 text-purple-400 animate-pulse gap-2">
                        <Loader2 size={24} className="animate-spin" />
                        <span>{t.analyzing}</span>
                    </div>
                )}

                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm mb-4">
                        {error}
                        <button onClick={handleGenerate} className="ml-2 underline hover:text-red-300">Retry</button>
                    </div>
                )}

                {insights && (
                    <div className="prose prose-invert max-w-none">
                        <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
                            <ReactMarkdown>{insights}</ReactMarkdown>
                        </div>
                        <button
                            onClick={handleGenerate}
                            className="mt-4 text-sm text-gray-400 hover:text-white transition-colors underline flex items-center gap-1"
                        >
                            <Sparkles size={12} /> Regenerate Analysis
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AiInsights;
