import React, { useState } from 'react';
import { Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import api from '../api';

interface LoginProps {
    onLogin: (token: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('username', email);
            formData.append('password', password);

            const response = await api.post('/api/login', formData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            const token = response.data.access_token;
            onLogin(token);
        } catch (err) {
            setError('Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700">
                <div className="text-center mb-8">
                    <div className="w-24 h-24 mx-auto mb-4">
                        <img
                            src="/logo.png"
                            alt="UMatch Logo"
                            className="w-full h-full object-contain rounded-xl"
                        />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Admin Portal</h1>
                    <p className="text-slate-400">Sign in to access the dashboard</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 flex items-center gap-3">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                                placeholder="admin@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Signing in...
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
