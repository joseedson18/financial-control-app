import React, { useState } from 'react';
import api from '../api';
import { Upload, CheckCircle, AlertCircle, FileSpreadsheet, Loader2, Trash2 } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { motion, AnimatePresence } from 'framer-motion';

interface FileUploadProps {
    language: 'pt' | 'en';
}

const translations = {
    pt: {
        title: 'Importar Dados Financeiros',
        subtitle: 'Faça upload do arquivo CSV exportado do Conta Azul para gerar o DRE e Dashboard.',
        dragDrop: 'Clique para selecionar',
        orDrag: 'ou arraste e solte',
        fileType: 'Arquivos CSV do Conta Azul',
        processBtn: 'Processar Arquivo',
        processing: 'Processando...',
        success: 'Registros processados com sucesso.',
        error: 'Falha no upload:',
        serverError: 'Falha no upload: Não foi possível conectar ao servidor.',
        unknownError: 'Erro desconhecido',
        clearData: 'Limpar Todos os Dados',
        confirmClear: 'Tem certeza que deseja apagar todos os dados?'
    },
    en: {
        title: 'Upload Financial Data',
        subtitle: 'Upload your Conta Azul CSV export to generate the P&L and Dashboard.',
        dragDrop: 'Click to upload',
        orDrag: 'or drag and drop',
        fileType: 'CSV files from Conta Azul',
        processBtn: 'Process File',
        processing: 'Processing...',
        success: 'Successfully processed records.',
        error: 'Upload failed:',
        serverError: 'Upload failed: Cannot connect to server.',
        unknownError: 'Unknown error occurred',
        clearData: 'Clear All Data',
        confirmClear: 'Are you sure you want to clear all data?'
    }
};

export default function FileUpload({ language }: FileUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const t = translations[language];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setStatus('idle');
            setMessage('');
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setStatus('uploading');
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post('/upload', formData);
            setStatus('success');
            setMessage(`${t.success} (${response.data.rows} records)`);

            // Refresh the page data after successful upload
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (error: unknown) {
            console.error('Error:', error);
            console.error('Upload error:', error);

            // Better error messaging
            if (error instanceof Error) {
                setMessage(`${t.error} ${error.message || t.unknownError}`);
            } else if (typeof error === 'object' && error !== null && 'response' in error && typeof (error as any).response === 'object' && (error as any).response !== null) {
                // Server responded with error
                const detail = (error as any).response?.data?.detail || (error as any).response?.data?.message || t.unknownError;
                setMessage(`${t.error} ${detail}`);
            } else if (typeof error === 'object' && error !== null && 'request' in error) {
                // Request made but no response
                setMessage(t.serverError);
            } else {
                // Something else happened
                setMessage(`${t.error} ${t.unknownError}`);
            }
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto"
        >
            <GlassCard className="p-6 sm:p-8 lg:p-12 text-center relative overflow-hidden">
                {/* Decorative background elements */}


                {/* Icon Header */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-white/5 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-[0_0_30px_rgba(6,182,212,0.2)] border border-white/10 group-hover:scale-110 transition-transform duration-500">
                    <Upload size={32} className="text-cyan-400 sm:hidden" />
                    <Upload size={40} className="text-cyan-400 hidden sm:block" />
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">
                    {t.title}
                </h2>
                <p className="text-slate-400 mb-8 sm:mb-12 max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
                    {t.subtitle}
                </p>

                {/* Upload Area */}
                <div className="relative group cursor-pointer mb-10 max-w-xl mx-auto">
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    />
                    <div className={`
                        relative border-2 border-dashed rounded-2xl p-8 sm:p-12 transition-all duration-300
                        ${file
                            ? 'border-cyan-500 bg-cyan-500/10 shadow-[0_0_30px_rgba(6,182,212,0.15)]'
                            : 'border-white/10 hover:border-cyan-500/50 hover:bg-white/[0.02] hover:shadow-lg hover:shadow-cyan-500/5'
                        }
                    `}>
                        {file ? (
                            <div className="flex flex-col items-center gap-4">
                                <div className="p-4 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                                    <FileSpreadsheet size={48} className="text-cyan-400" />
                                </div>
                                <div className="text-center">
                                    <p className="font-semibold text-cyan-400 text-lg">{file.name}</p>
                                    <p className="text-slate-500 text-sm mt-1">
                                        {(file.size / 1024).toFixed(2)} KB
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center">
                                <div className="mb-4">
                                    <Upload size={48} className="mx-auto text-slate-500 group-hover:text-cyan-400 transition-colors" />
                                </div>
                                <p className="text-slate-300 font-medium text-lg mb-2">
                                    <span className="text-cyan-400">{t.dragDrop}</span> {t.orDrag}
                                </p>
                                <p className="text-slate-500 text-sm">{t.fileType}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Upload Button */}
                <button
                    onClick={handleUpload}
                    disabled={!file || status === 'uploading'}
                    className={`
                        w-full max-w-xl mx-auto btn-primary py-4 text-lg
                        ${!file || status === 'uploading' ? 'opacity-50 cursor-not-allowed grayscale' : ''}
                    `}
                >
                    {status === 'uploading' ? (
                        <>
                            <Loader2 size={24} className="animate-spin" />
                            <span>{t.processing}</span>
                        </>
                    ) : (
                        <>
                            <Upload size={24} />
                            <span>{t.processBtn}</span>
                        </>
                    )}
                </button>

                {/* Clear Data Button */}
                <button
                    onClick={async () => {
                        if (confirm(t.confirmClear || 'Are you sure you want to clear all data?')) {
                            try {
                                await api.delete('/api/data');
                                window.location.reload();
                            } catch {
                                alert('Error clearing data');
                            }
                        }
                    }}
                    className="mt-6 text-red-400 hover:text-red-300 text-sm flex items-center justify-center gap-2 mx-auto transition-colors"
                >
                    <Trash2 size={16} />
                    <span>{t.clearData || 'Clear Data'}</span>
                </button>

                {/* Status Message */}
                <AnimatePresence>
                    {message && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={`
                                mt-6 p-4 rounded-xl flex items-center gap-4 text-sm border max-w-xl mx-auto
                                ${status === 'success'
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                    : 'bg-red-500/10 border-red-500/30 text-red-400'}
                            `}
                        >
                            <div className="flex-shrink-0">
                                {status === 'success'
                                    ? <CheckCircle size={24} className="text-emerald-400" />
                                    : <AlertCircle size={24} className="text-red-400" />}
                            </div>
                            <span className="flex-1 font-medium text-left">{message}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </GlassCard>
        </motion.div>
    );
}
