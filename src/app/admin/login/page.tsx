'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, AlertCircle, LogIn } from 'lucide-react';
import { adminLogin } from '@/lib/data-store';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        await new Promise((r) => setTimeout(r, 500));

        if (adminLogin(password)) {
            router.push('/admin');
        } else {
            setError('Invalid password. Access denied.');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Lock size={28} className="text-[#D4AF37]" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
                    <p className="text-gray-500 text-sm mt-1">Parnika — The Rental Studio</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-[#121212] rounded-2xl p-8 border border-gray-800">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-gray-700 text-white placeholder-gray-500 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all"
                                placeholder="Enter admin password"
                                autoFocus
                            />
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 p-3 rounded-lg"
                            >
                                <AlertCircle size={16} />
                                {error}
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !password}
                            className="w-full bg-[#D4AF37] text-black py-3 rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? 'Verifying...' : <><LogIn size={18} /> Access Portal</>}
                        </button>
                    </div>
                </form>

                <p className="text-center text-gray-600 text-xs mt-6">
                    This area is restricted to authorized personnel only.
                </p>
            </motion.div>
        </div>
    );
}
