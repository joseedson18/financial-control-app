import { Calendar, Building2, FileText, TrendingDown, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface Transaction {
    date: string;
    month: string;
    centro_custo: string;
    fornecedor: string;
    descricao: string;
    valor: number;
    categoria: string;
}

interface TransactionListProps {
    transactions: Transaction[];
    total: number;
    language: 'pt' | 'en';
}

const translations = {
    pt: {
        transactions: 'Transações Individuais',
        total: 'Total',
        noTransactions: 'Nenhuma transação encontrada',
        centroCusto: 'Centro de Custo',
        fornecedor: 'Fornecedor',
        date: 'Data',
        description: 'Descrição',
        value: 'Valor'
    },
    en: {
        transactions: 'Individual Transactions',
        total: 'Total',
        noTransactions: 'No transactions found',
        centroCusto: 'Cost Center',
        fornecedor: 'Supplier',
        date: 'Date',
        description: 'Description',
        value: 'Value'
    }
};

const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2
    }).format(value);
};

const formatDate = (dateStr: string): string => {
    if (!dateStr) return '-';
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('pt-BR');
    } catch {
        return dateStr;
    }
};

export default function TransactionList({
    transactions,
    total,
    language
}: TransactionListProps) {
    const t = translations[language];

    if (!transactions || transactions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <FileText size={48} className="text-gray-600 mb-4" />
                <p className="text-gray-400">{t.noTransactions}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                    <FileText size={20} className="text-blue-400" />
                    {t.transactions}
                </h4>
                <div className="text-sm text-gray-400">
                    {transactions.length} {transactions.length === 1 ? 'transação' : 'transações'}
                </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {transactions.map((tx, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 glass-panel border border-white/5 hover:border-white/10 transition-all rounded-xl"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <Building2 size={16} className="text-gray-500" />
                                    <span className="text-white font-medium">
                                        {tx.fornecedor || 'N/A'}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-400 ml-6">
                                    {tx.centro_custo || 'N/A'}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={`font-bold text-lg ${tx.valor < 0 ? 'text-red-400' : 'text-emerald-400'
                                    }`}>
                                    {tx.valor < 0 && (
                                        <TrendingDown size={16} className="inline mr-1" />
                                    )}
                                    {tx.valor > 0 && (
                                        <TrendingUp size={16} className="inline mr-1" />
                                    )}
                                    {formatCurrency(Math.abs(tx.valor))}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                    <Calendar size={12} />
                                    {formatDate(tx.date)}
                                </div>
                            </div>
                        </div>

                        {tx.descricao && (
                            <div className="mt-2 pt-2 border-t border-slate-800">
                                <div className="text-sm text-gray-400 flex items-start gap-2">
                                    <FileText size={14} className="mt-0.5 flex-shrink-0 text-gray-600" />
                                    <span className="line-clamp-2">{tx.descricao}</span>
                                </div>
                            </div>
                        )}

                        {tx.categoria && (
                            <div className="mt-2">
                                <span className="inline-block px-2 py-1 text-xs rounded-md bg-white/5 hover:bg-white/10 transition-colors text-slate-400 border border-white/5">
                                    {tx.categoria}
                                </span>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Total */}
            <div className="border-t-2 border-emerald-500/50 pt-4 mt-6">
                <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-white">{t.total}:</span>
                    <span className={`text-2xl font-bold ${total < 0 ? 'text-red-400' : 'text-emerald-400'
                        }`}>
                        {formatCurrency(Math.abs(total))}
                    </span>
                </div>
            </div>
        </div>
    );
}
