import React, { useState } from 'react';
import api from '../api';
import { Upload, CheckCircle, AlertCircle, FileSpreadsheet, Loader2, Trash2 } from 'lucide-react';

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
            const response = await api.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setStatus('success');
            setMessage(`${t.success} (${response.data.rows} records)`);

            // Refresh the page data after successful upload
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (error: any) {
            setStatus('error');
            console.error('Upload error:', error);

            // Better error messaging
            if (error.response) {
                // Server responded with error
                const detail = error.response.data?.detail || error.response.data?.message || t.unknownError;
                setMessage(`${t.error} ${detail}`);
            } else if (error.request) {
                // Request made but no response
                setMessage(t.serverError);
            } else {
                // Something else happened
                setMessage(`${t.error} ${error.message || t.unknownError}`);
            }
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="card-dark hover:border-cyan-500/30 transition-all duration-500">
                {/* Icon Header */}
                <div className="w-20 h-20 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-cyan-500/30 glow-cyan">
                    <Upload size={40} className="text-white" />
                </div>

                <h2 className="text-3xl font-bold text-center mb-3">
                    <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                        {t.title}
                    </span>
                </h2>
                <p className="text-gray-400 text-center mb-10">
                    {t.subtitle}
                </p>

                {/* Upload Area */}
                <div className="relative group cursor-pointer mb-8">
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className={`
            relative border-2 border-dashed rounded-2xl p-12 transition-all duration-300
            ${file
                            ? 'border-cyan-500 bg-cyan-500/5 glow-cyan'
                            : 'border-gray-600 hover:border-cyan-500/50 hover:bg-white/5 group-hover:glow-cyan'
                        }
          `}>
                        {file ? (
                            <div className="flex flex-col items-center gap-4">
                                <div className="p-4 bg-cyan-500/10 rounded-xl">
                                    <FileSpreadsheet size={48} className="text-cyan-400" />
                                </div>
                                <div className="text-center">
                                    <p className="font-semibold text-cyan-400 text-lg">{file.name}</p>
                                    <p className="text-gray-500 text-sm mt-1">
                                        {(file.size / 1024).toFixed(2)} KB
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center">
                                <div className="mb-4">
                                    <Upload size={48} className="mx-auto text-gray-500 group-hover:text-cyan-400 transition-colors" />
                                </div>
                                <p className="text-gray-300 font-medium text-lg mb-2">
                                    <span className="text-gradient-primary">{t.dragDrop}</span> {t.orDrag}
                                </p>
                                <p className="text-gray-500 text-sm">{t.fileType}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Upload Button */}
                <button
                    onClick={handleUpload}
                    disabled={!file || status === 'uploading'}
                    className={`
            w-full py-4 px-6 rounded-xl font-semibold text-white text-lg
            transition-all duration-300 flex items-center justify-center gap-3
            ${!file || status === 'uploading'
                            ? 'bg-gray-700 cursor-not-allowed opacity-50'
                            : 'gradient-primary shadow-xl shadow-cyan-500/30 hover:shadow-2xl hover:shadow-cyan-500/40 hover:scale-105 glow-cyan'}
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
                            } catch (e) {
                                alert('Error clearing data');
                            }
                        }
                    }}
                    className="w-full mt-4 py-3 px-6 rounded-xl font-semibold text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-all flex items-center justify-center gap-2"
                >
                    <Trash2 size={20} />
                    <span>{t.clearData || 'Clear Data'}</span>
                </button>

                {/* Status Message */}
                {message && (
                    <div className={`
            mt-6 p-5 rounded-xl flex items-center gap-4 text-sm border
            ${status === 'success'
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-red-500/10 border-red-500/30 text-red-400'}
          `}>
                        <div className="flex-shrink-0">
                            {status === 'success'
                                ? <CheckCircle size={24} className="text-emerald-400" />
                                : <AlertCircle size={24} className="text-red-400" />}
                        </div>
                        <span className="flex-1 font-medium">{message}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
