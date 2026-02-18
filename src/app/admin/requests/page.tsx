'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, Eye, X, Check, XCircle, FileText } from 'lucide-react';
import { getRequests, updateRequest, getProductById, addInvoice, getCustomers, getInvoices } from '@/lib/data-store';
import { RentalRequest, RequestStatus, Invoice } from '@/lib/types';
import Link from 'next/link';

const statusTabs: { value: RequestStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'completed', label: 'Completed' },
    { value: 'rejected', label: 'Rejected' },
];

const statusColors: Record<RequestStatus, string> = {
    pending: 'bg-amber-900/30 text-amber-400',
    approved: 'bg-green-900/30 text-green-400',
    rejected: 'bg-red-900/30 text-red-400',
    completed: 'bg-blue-900/30 text-blue-400',
};

export default function AdminRequestsPage() {
    const [requests, setRequests] = useState<RentalRequest[]>([]);
    const [filter, setFilter] = useState<RequestStatus | 'all'>('all');
    const [selected, setSelected] = useState<RentalRequest | null>(null);
    const [editPrice, setEditPrice] = useState<number | ''>(0);
    const [editAdvance, setEditAdvance] = useState<number | ''>(0);
    const [editDeposit, setEditDeposit] = useState<number | ''>(0);
    const [editNotes, setEditNotes] = useState('');
    const [invoices, setInvoices] = useState<Invoice[]>([]);

    useEffect(() => { reload(); }, []);
    const reload = async () => {
        const [reqData, invData] = await Promise.all([getRequests(), getInvoices()]);
        setRequests(reqData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        setInvoices(invData);
    };

    const filtered = requests.filter((r) => filter === 'all' || r.status === filter);

    const openDetail = (r: RentalRequest) => {
        setSelected(r);
        setEditPrice(r.quotedPrice);
        setEditAdvance(r.advancePaid);
        setEditDeposit(r.depositAmount);
        setEditNotes(r.adminNotes);
    };

    const hasInvoice = selected ? invoices.some(inv => inv.requestId === selected.id) : false;

    const handleStatusChange = async (status: RequestStatus) => {
        if (!selected) return;
        const price = editPrice === '' ? 0 : editPrice;
        const advance = editAdvance === '' ? 0 : editAdvance;
        const deposit = editDeposit === '' ? 0 : editDeposit;
        await updateRequest(selected.id, {
            status,
            quotedPrice: price,
            advancePaid: advance,
            depositAmount: deposit,
            adminNotes: editNotes
        });
        await reload();
        setSelected(null);
        alert(`Request ${status} successfully!`);
    };

    const handleSaveNotes = async () => {
        if (!selected) return;
        const price = editPrice === '' ? 0 : editPrice;
        const advance = editAdvance === '' ? 0 : editAdvance;
        const deposit = editDeposit === '' ? 0 : editDeposit;
        await updateRequest(selected.id, {
            quotedPrice: price,
            advancePaid: advance,
            depositAmount: deposit,
            adminNotes: editNotes
        });
        await reload();
        alert('Finance details and notes saved!');
    };

    const handleCreateInvoice = async () => {
        if (!selected) return;
        if (hasInvoice) {
            alert('An invoice already exists for this request.');
            return;
        }

        const customers = await getCustomers();
        const customer = customers.find((c) => c.phone === selected.phone);
        const price = editPrice === '' ? 0 : editPrice;
        const advance = editAdvance === '' ? 0 : editAdvance;
        const deposit = editDeposit === '' ? 0 : editDeposit;

        try {
            // Update the request with current finance details first
            // Here, deposit is the PLANNED security deposit (not yet paid in most cases)
            await updateRequest(selected.id, {
                quotedPrice: price,
                advancePaid: advance,
                depositAmount: deposit,
                adminNotes: editNotes,
                status: 'approved', // Automatically approve if not already
            });

            // When creating the invoice, we only treat the advance as actually paid.
            // Security deposit will be collected later at pickup and updated on the invoice screen.
            await addInvoice({
                requestId: selected.id,
                customerId: customer?.id || '',
                customerName: selected.customerName,
                customerPhone: selected.phone,
                items: [{
                    productId: selected.productId,
                    productName: selected.productName || selected.outfitType,
                    days: selected.daysRequired,
                    pricePerDay: (price || 0) / (selected.daysRequired || 1),
                    total: price || 0,
                }],
                subtotal: price || 0,
                discount: 0,
                total: price || 0,
                advancePaid: advance || 0,
                // Deposit is NOT counted as paid at invoice creation time
                depositAmount: 0,
                status: 'draft',
                notes: deposit
                    ? `Planned security deposit: ₹${deposit.toLocaleString()}`
                    : '',
            });
            await reload();
            setSelected(null);
            alert('Invoice created successfully!');
        } catch (e: any) {
            alert(e.message || 'Failed to create invoice.');
        }
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">Requests & Bookings</h1>
                <p className="text-gray-500 text-sm mt-1">{requests.length} total requests</p>
            </div>

            {/* Status Tabs */}
            < div className="flex gap-1 bg-[#121212] rounded-xl border border-gray-800 p-1 mb-6 w-fit" >
                {
                    statusTabs.map((t) => (
                        <button key={t.value} onClick={() => setFilter(t.value)}
                            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${filter === t.value ? 'bg-[#D4AF37] text-black' : 'text-gray-400 hover:text-white'}`}>
                            {t.label} {t.value !== 'all' && <span className="ml-1 opacity-60">({requests.filter(r => r.status === t.value).length})</span>}
                        </button>
                    ))
                }
            </div >

            {/* Requests Table */}
            < div className="bg-[#121212] rounded-2xl border border-gray-800 overflow-hidden" >
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead><tr className="border-b border-gray-800 text-left">
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Customer</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Product / Type</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Event Date</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Days</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Price</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Actions</th>
                        </tr></thead>
                        <tbody className="divide-y divide-gray-800">
                            {filtered.map((r) => (
                                <tr key={r.id} className="hover:bg-gray-800/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="text-white text-sm font-medium">{r.customerName}</p>
                                        <p className="text-gray-500 text-xs">{r.phone}</p>
                                    </td>
                                    <td className="px-6 py-4 text-gray-300 text-sm">{r.productName || r.outfitType}</td>
                                    <td className="px-6 py-4 text-gray-400 text-sm">{r.eventDate}</td>
                                    <td className="px-6 py-4 text-gray-400 text-sm">{r.daysRequired}</td>
                                    <td className="px-6 py-4"><span className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${statusColors[r.status]}`}>{r.status}</span></td>
                                    <td className="px-6 py-4 text-white text-sm">{r.quotedPrice ? `₹${r.quotedPrice.toLocaleString()}` : '—'}</td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => openDetail(r)} className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-[#D4AF37] transition-all"><Eye size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {
                    filtered.length === 0 && (
                        <div className="p-12 text-center text-gray-600">
                            <ClipboardList size={32} className="mx-auto mb-3 opacity-50" />
                            <p className="text-sm">No requests in this category.</p>
                        </div>
                    )
                }
            </div >

            {/* Detail Modal */}
            <AnimatePresence>
                {
                    selected && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
                            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="bg-[#121212] rounded-2xl border border-gray-800 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                                <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-bold text-white">Request Details</h2>
                                        <p className="text-gray-500 text-xs font-mono mt-1">ID: {selected.id}</p>
                                    </div>
                                    <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-white"><X size={20} /></button>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><p className="text-xs text-gray-500">Customer</p><p className="text-white text-sm font-medium">{selected.customerName}</p></div>
                                        <div><p className="text-xs text-gray-500">Phone</p><p className="text-white text-sm">{selected.phone}</p></div>
                                        <div><p className="text-xs text-gray-500">Email</p><p className="text-white text-sm">{selected.email || '—'}</p></div>
                                        <div><p className="text-xs text-gray-500">Event Date</p><p className="text-white text-sm">{selected.eventDate}</p></div>
                                        <div><p className="text-xs text-gray-500">Days Required</p><p className="text-white text-sm">{selected.daysRequired}</p></div>
                                        <div><p className="text-xs text-gray-500">Product / Type</p><p className="text-white text-sm">{selected.productName || selected.outfitType}</p></div>
                                    </div>
                                    {selected.message && <div><p className="text-xs text-gray-500">Customer Message</p><p className="text-gray-300 text-sm mt-1">{selected.message}</p></div>}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 block mb-1.5">Quoted Price (₹)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={editPrice}
                                                onChange={(e) => setEditPrice(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                                                className="w-full px-4 py-2.5 rounded-xl bg-[#1a1a1a] border border-gray-700 text-white text-sm focus:border-[#D4AF37] outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 block mb-1.5">Advance Paid (₹)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={editAdvance}
                                                onChange={(e) => setEditAdvance(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                                                className="w-full px-4 py-2.5 rounded-xl bg-[#1a1a1a] border border-gray-700 text-white text-sm focus:border-[#D4AF37] outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 block mb-1.5">Security Deposit (₹)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={editDeposit}
                                                onChange={(e) => setEditDeposit(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                                                className="w-full px-4 py-2.5 rounded-xl bg-[#1a1a1a] border border-gray-700 text-white text-sm focus:border-[#D4AF37] outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 block mb-1.5">Admin Notes</label>
                                        <textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} rows={2} className="w-full px-4 py-2.5 rounded-xl bg-[#1a1a1a] border border-gray-700 text-white text-sm focus:border-[#D4AF37] outline-none resize-none" />
                                    </div>
                                    <button onClick={handleSaveNotes} className="text-sm text-[#D4AF37] font-medium hover:underline">Save Price & Notes</button>
                                </div>
                                <div className="p-6 border-t border-gray-800 flex flex-wrap gap-2">
                                    {(selected.status === 'pending') && !hasInvoice && (
                                        <button onClick={() => handleStatusChange('approved')} className="flex items-center gap-2 bg-green-900/30 text-green-400 px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-900/50 transition-all"><Check size={16} /> Approve</button>
                                    )}
                                    {selected.status !== 'completed' && (
                                        <button onClick={() => handleStatusChange('completed')} className="flex items-center gap-2 bg-blue-900/30 text-blue-400 px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-900/50 transition-all"><Check size={16} /> Complete</button>
                                    )}
                                    {selected.status !== 'rejected' && !hasInvoice && (
                                        <button onClick={() => handleStatusChange('rejected')} className="flex items-center gap-2 bg-red-900/30 text-red-400 px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-900/50 transition-all"><XCircle size={16} /> Reject</button>
                                    )}
                                    <button
                                        onClick={handleCreateInvoice}
                                        disabled={hasInvoice}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ml-auto ${hasInvoice ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-purple-900/30 text-purple-400 hover:bg-purple-900/50'}`}
                                    >
                                        <FileText size={16} /> {hasInvoice ? 'Already Invoiced' : 'Create Invoice'}
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )
                }
            </AnimatePresence >
        </div >
    );
}
