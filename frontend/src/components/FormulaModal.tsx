import { X, Calculator, Code, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TransactionList from './TransactionList';

interface BreakdownStep {
    label: string;
    value: number;
    symbol?: '+' | '-' | '*' | '/' | '=';
    isSubItem?: boolean;
}

interface Transaction {
    date: string;
    month: string;
    centro_custo: string;
    fornecedor: string;
    descricao: string;
    valor: number;
    categoria: string;
}

interface FormulaModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    value: number;
    breakdown?: BreakdownStep[];
    matlabFormula?: string;
    transactions?: Transaction[];  // NEW: transaction mode
    showTransactions?: boolean;    // NEW: toggle mode
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
    transactions,
    showTransactions = false,
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
                    className="glass-heavy rounded-2xl border border-white/10 max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl relative"
                >
                    {/* Header */}
                    <div className="sticky top-0 bg-[#0f172a]/95 backdrop-blur-xl border-b border-white/10 p-6 flex items-start justify-between z-10">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 text-xs text-cyan-400 mb-2 font-medium tracking-wide uppercase">
                                <Calculator size={14} />
                                <span>{t.auditNote}</span>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-1 tracking-tight">{title}</h2>
                            <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                                {formatCurrency(value)}
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                            aria-label={t.close}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Calculation Breakdown OR Transactions */}
                    <div className="p-6">
                        {showTransactions && transactions ? (
                            // Transaction Mode
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <FileText size={18} className="text-emerald-400" />
                                    <h3 className="text-lg font-semibold text-gray-200">
                                        {language === 'pt' ? 'Transações Individuais' : 'Individual Transactions'}
                                    </h3>
                                </div>
                                <TransactionList
                                    transactions={transactions}
                                    total={value}
                                    language={language}
                                />
                            </div>
                        ) : breakdown ? (
                            // Formula Breakdown Mode
                            <>
                                <div className="flex items-center gap-2 mb-4">
                                    <Calculator size={18} className="text-emerald-400" />
                                    <h3 className="text-lg font-semibold text-gray-200">{t.calculation}</h3>
                                </div>

                                <div className="glass-panel p-6 rounded-xl font-mono text-sm bg-black/20">
                                    {breakdown.map((step, index) => {
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
                                {matlabFormula && (
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
                                )}
                            </>
                        ) : null}

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
