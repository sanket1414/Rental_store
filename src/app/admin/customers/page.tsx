'use client';

import { useEffect, useState } from 'react';
import { Users, Search } from 'lucide-react';
import { getCustomers, getRequests } from '@/lib/data-store';
import { Customer, RentalRequest } from '@/lib/types';

export default function AdminCustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [requests, setRequests] = useState<RentalRequest[]>([]);
    const [search, setSearch] = useState('');

    useEffect(() => { reload(); }, []);
    const reload = async () => {
        const [custData, reqData] = await Promise.all([getCustomers(), getRequests()]);
        setCustomers(custData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        setRequests(reqData);
    };

    const filtered = customers
        .filter((c) =>
            c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
        )
        .map((c) => {
            const customerReqs = requests.filter((r) => r.phone === c.phone);
            const totalSpent = customerReqs
                .filter((r) => r.status === 'completed')
                .reduce((sum, r) => sum + (r.quotedPrice || 0), 0);

            return {
                ...c,
                requestCount: customerReqs.length,
                totalSpent: totalSpent,
            };
        });

    const getCustomerRequests = (phone: string) => requests.filter((r) => r.phone === phone);

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white">Customers</h1>
                    <p className="text-gray-500 text-sm mt-1">{customers.length} registered customers</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-xs mb-6">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#121212] border border-gray-800 text-white text-sm placeholder-gray-500 focus:border-[#D4AF37] outline-none"
                    placeholder="Search by name or phone…"
                />
            </div>

            {/* Cards */}
            {filtered.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filtered.map((c) => {
                        const reqs = getCustomerRequests(c.phone);
                        return (
                            <div key={c.id} className="bg-[#121212] rounded-2xl border border-gray-800 p-6 hover:border-gray-700 transition-all">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-white font-bold">{c.name}</h3>
                                        <p className="text-gray-500 text-xs font-mono mt-0.5">ID: {c.id}</p>
                                    </div>
                                    <span className="bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-bold px-3 py-1 rounded-full">
                                        {c.requestCount} requests
                                    </span>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500">Phone</span>
                                        <span className="text-gray-300">{c.phone}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500">Email</span>
                                        <span className="text-gray-300">{c.email || '—'}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500">Total Spent</span>
                                        <span className="text-white font-bold">₹{c.totalSpent.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500">Since</span>
                                        <span className="text-gray-300">{new Date(c.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                {/* Request History */}
                                {reqs.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-gray-800">
                                        <p className="text-xs font-bold text-gray-500 uppercase mb-2">Recent Requests</p>
                                        <div className="space-y-2">
                                            {reqs.slice(0, 3).map((r) => (
                                                <div key={r.id} className="flex items-center justify-between text-xs">
                                                    <span className="text-gray-400 truncate flex-1">{r.productName || r.outfitType}</span>
                                                    <span className={`font-bold uppercase px-2 py-0.5 rounded-full ml-2 ${r.status === 'pending' ? 'bg-amber-900/30 text-amber-400' :
                                                        r.status === 'approved' ? 'bg-green-900/30 text-green-400' :
                                                            r.status === 'rejected' ? 'bg-red-900/30 text-red-400' :
                                                                'bg-blue-900/30 text-blue-400'
                                                        }`}>{r.status}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-[#121212] rounded-2xl border border-gray-800 p-12 text-center">
                    <Users size={32} className="mx-auto mb-3 text-gray-600 opacity-50" />
                    <p className="text-gray-600 text-sm">No customers yet. They appear automatically when requests are submitted.</p>
                </div>
            )}
        </div>
    );
}
