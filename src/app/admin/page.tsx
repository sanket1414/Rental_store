'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, ClipboardList, Users, FileText, TrendingUp, AlertCircle } from 'lucide-react';
import { getProducts, getRequests, getCustomers, getInvoices } from '@/lib/data-store';
import Link from 'next/link';

export default function AdminDashboard() {
    const [stats, setStats] = useState({ products: 0, pending: 0, customers: 0, invoices: 0, revenue: 0 });
    const [recentRequests, setRecentRequests] = useState<any[]>([]);

    useEffect(() => {
        const fetchStats = async () => {
            const [products, requests, customers, invoices] = await Promise.all([
                getProducts(),
                getRequests(),
                getCustomers(),
                getInvoices()
            ]);

            const pending = requests.filter((r) => r.status === 'pending').length;
            const revenue = invoices.filter((i) => i.status === 'paid').reduce((sum, i) => sum + i.total, 0);

            setStats({
                products: products.length,
                pending,
                customers: customers.length,
                invoices: invoices.length,
                revenue
            });

            setRecentRequests(requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5));
        };
        fetchStats();
    }, []);

    const cards = [
        { label: 'Total Products', value: stats.products, icon: Package, color: 'bg-blue-500/10 text-blue-400', href: '/admin/products' },
        { label: 'Pending Requests', value: stats.pending, icon: AlertCircle, color: 'bg-amber-500/10 text-amber-400', href: '/admin/requests' },
        { label: 'Customers', value: stats.customers, icon: Users, color: 'bg-emerald-500/10 text-emerald-400', href: '/admin/customers' },
        { label: 'Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: TrendingUp, color: 'bg-purple-500/10 text-purple-400', href: '/admin/invoices' },
    ];



    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                <p className="text-gray-500 text-sm mt-1">Overview of your rental business</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                {cards.map((card, i) => {
                    const Icon = card.icon;
                    return (
                        <motion.div
                            key={card.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Link href={card.href} className="block bg-[#121212] rounded-2xl p-6 border border-gray-800 hover:border-gray-700 transition-all">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${card.color}`}>
                                    <Icon size={20} />
                                </div>
                                <p className="text-2xl font-bold text-white">{card.value}</p>
                                <p className="text-gray-500 text-sm mt-1">{card.label}</p>
                            </Link>
                        </motion.div>
                    );
                })}
            </div>

            {/* Recent Requests */}
            <div className="bg-[#121212] rounded-2xl border border-gray-800 overflow-hidden">
                <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white">Recent Requests</h2>
                    <Link href="/admin/requests" className="text-[#D4AF37] text-sm font-medium hover:underline">View All</Link>
                </div>
                {recentRequests.length > 0 ? (
                    <div className="divide-y divide-gray-800">
                        {recentRequests.map((req) => (
                            <div key={req.id} className="px-6 py-4 flex items-center justify-between">
                                <div>
                                    <p className="text-white font-medium text-sm">{req.customerName}</p>
                                    <p className="text-gray-500 text-xs">{req.productName || req.outfitType} • {new Date(req.createdAt).toLocaleDateString()}</p>
                                </div>
                                <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${req.status === 'pending' ? 'bg-amber-900/30 text-amber-400' :
                                    req.status === 'approved' ? 'bg-green-900/30 text-green-400' :
                                        req.status === 'rejected' ? 'bg-red-900/30 text-red-400' :
                                            'bg-blue-900/30 text-blue-400'
                                    }`}>
                                    {req.status}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center text-gray-600">
                        <ClipboardList size={32} className="mx-auto mb-3 opacity-50" />
                        <p className="text-sm">No requests yet. They will appear here when customers submit forms.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
