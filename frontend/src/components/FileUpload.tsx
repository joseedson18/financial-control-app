import React, { useState } from 'react';
import api from '../api';
import { Upload, CheckCircle, AlertCircle, FileSpreadsheet, Loader2 } from 'lucide-react';

const FileUpload: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

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
            setMessage(`Successfully processed ${response.data.rows} records.`);

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
                const detail = error.response.data?.detail || error.response.data?.message || 'Unknown server error';
                setMessage(`Upload failed: ${detail}`);
            } else if (error.request) {
                // Request made but no response
                setMessage('Upload failed: Cannot connect to server. Please check if the backend is running.');
            } else {
                // Something else happened
                setMessage(`Upload failed: ${error.message || 'Unknown error occurred'}`);
            }
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 text-center">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Upload size={32} />
                </div>

                <h2 className="text-2xl font-bold text-slate-800 mb-2">Upload Financial Data</h2>
                <p className="text-slate-500 mb-8">Upload your Conta Azul CSV export to generate the P&L and Dashboard.</p>

                <div className="relative group cursor-pointer mb-6">
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className={`
            border-2 border-dashed rounded-xl p-8 transition-all
            ${file ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'}
          `}>
                        {file ? (
                            <div className="flex items-center justify-center gap-3 text-blue-700">
                                <FileSpreadsheet size={24} />
                                <span className="font-medium">{file.name}</span>
                            </div>
                        ) : (
                            <div className="text-slate-500">
                                <span className="text-blue-600 font-medium">Click to upload</span> or drag and drop
                                <p className="text-xs mt-1">CSV files only</p>
                            </div>
                        )}
                    </div>
                </div>

                <button
                    onClick={handleUpload}
                    disabled={!file || status === 'uploading'}
                    className={`
            w-full py-3 px-4 rounded-lg font-medium text-white transition-all flex items-center justify-center gap-2
            ${!file || status === 'uploading'
                            ? 'bg-slate-300 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20'}
          `}
                >
                    {status === 'uploading' ? (
                        <>
                            <Loader2 size={20} className="animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            <Upload size={20} />
                            Process File
                        </>
                    )}
                </button>

                {message && (
                    <div className={`mt-6 p-4 rounded-lg flex items-center gap-3 text-sm text-left ${status === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                        }`}>
                        {status === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        <span>{message}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileUpload;
