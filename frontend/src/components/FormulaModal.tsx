import { X, Calculator, Code } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BreakdownStep {
    label: string;
    value: number;
    symbol?: '+' | '-' | '*' | '/' | '=';
    isSubItem?: boolean;
}

interface FormulaModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    value: number;
    breakdown: BreakdownStep[];
    matlabFormula: string;
    language: 'pt' | 'en';
}

const translations = {
    pt: {
        calculation: 'Cálculo Detalhado',
        matlabFormula: 'Fórmula MATLAB',
        components: 'Componentes',
        result: 'Resultado',
        close: 'Fechar',
        auditNote: 'Para Auditoria'
    },
    en: {
        calculation: 'Detailed Calculation',
        matlabFormula: 'MATLAB Formula',
        components: 'Components',
        result: 'Result',
        close: 'Close',
        auditNote: 'For Audit'
    }
};

const formatCurrency = (value: number, locale: string = 'pt-BR'): string => {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2
    }).format(value);
};

export default function FormulaModal({
    isOpen,
    onClose,
    title,
    value,
    breakdown,
    matlabFormula,
    language
}: FormulaModalProps) {
    const t = translations[language];

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ duration: 0.2 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-slate-800 rounded-2xl border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl"
                >
                    {/* Header */}
                    <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 text-xs text-blue-400 mb-2">
                                <Calculator size={14} />
                                <span>{t.auditNote}</span>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-1">{title}</h2>
                            <div className="text-3xl font-bold text-blue-400">
                                {formatCurrency(value)}
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                            aria-label={t.close}
                        >
                            <X size={20} className="text-gray-400" />
                        </button>
                    </div>

                    {/* Calculation Breakdown */}
                    <div className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Calculator size={18} className="text-emerald-400" />
                            <h3 className="text-lg font-semibold text-gray-200">{t.calculation}</h3>
                        </div>

                        <div className="bg-slate-900 rounded-xl p-6 border border-slate-700 font-mono text-sm">
                            {breakdown.map((step, index) => {
                                const isLastStep = index === breakdown.length - 1;
                                const isResult = step.symbol === '=';

                                return (
                                    <div key={index}>
                                        <div
                                            className={`flex items-center justify-between py-2 ${step.isSubItem ? 'pl-6 text-gray-400' : ''
                                                } ${isResult ? 'border-t-2 border-slate-600 mt-2 pt-4' : ''}`}
                                        >
                                            <span
                                                className={`flex-1 ${isResult
                                                        ? 'text-emerald-400 font-bold'
                                                        : step.isSubItem
                                                            ? 'text-gray-400'
                                                            : 'text-gray-300'
                                                    }`}
                                            >
                                                {step.isSubItem && '└─ '}
                                                {step.label}
                                                {step.label && !step.label.endsWith(':') && ':'}
                                            </span>
                                            <span
                                                className={`ml-4 mr-3 text-right min-w-[140px] ${isResult
                                                        ? 'text-emerald-400 font-bold'
                                                        : step.value < 0
                                                            ? 'text-red-400'
                                                            : 'text-blue-400'
                                                    }`}
                                            >
                                                {formatCurrency(Math.abs(step.value))}
                                            </span>
                                            <span
                                                className={`w-6 text-center ${isResult
                                                        ? 'text-emerald-400 font-bold text-lg'
                                                        : step.symbol === '-'
                                                            ? 'text-red-400'
                                                            : 'text-gray-500'
                                                    }`}
                                            >
                                                {step.symbol || ''}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* MATLAB Formula */}
                        <div className="mt-6">
                            <div className="flex items-center gap-2 mb-3">
                                <Code size={18} className="text-purple-400" />
                                <h3 className="text-lg font-semibold text-gray-200">{t.matlabFormula}</h3>
                            </div>

                            <div className="bg-slate-950 rounded-xl p-4 border border-purple-500/30">
                                <pre className="text-purple-300 font-mono text-sm overflow-x-auto whitespace-pre-wrap break-words">
                                    {matlabFormula}
                                </pre>
                            </div>
                        </div>

                        {/* Timestamp for Audit */}
                        <div className="mt-6 pt-4 border-t border-slate-700 text-xs text-gray-500">
                            {language === 'pt' ? 'Gerado em' : 'Generated at'}:{' '}
                            {new Date().toLocaleString(language === 'pt' ? 'pt-BR' : 'en-US', {
                                dateStyle: 'full',
                                timeStyle: 'medium'
                            })}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
