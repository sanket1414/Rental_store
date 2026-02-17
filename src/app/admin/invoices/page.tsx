'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Eye, Printer, X, Check } from 'lucide-react';
import { getInvoices, updateInvoice } from '@/lib/data-store';
import { Invoice, InvoiceStatus } from '@/lib/types';

const statusColors: Record<InvoiceStatus, string> = {
    draft: 'bg-gray-800 text-gray-400',
    sent: 'bg-amber-900/30 text-amber-400',
    paid: 'bg-green-900/30 text-green-400',
};

export default function AdminInvoicesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [selected, setSelected] = useState<Invoice | null>(null);
    const printRef = useRef<HTMLDivElement>(null);

    useEffect(() => { reload(); }, []);
    const reload = async () => {
        const data = await getInvoices();
        setInvoices(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    };

    const handleStatusChange = async (id: string, status: InvoiceStatus) => {
        await updateInvoice(id, { status });
        reload();
        if (selected?.id === id) setSelected({ ...selected, status });
    };

    const handlePrint = () => {
        if (!printRef.current) return;
        const win = window.open('', '_blank');
        if (!win) return;
        win.document.write(`
      <html><head><title>Invoice ${selected?.invoiceNumber}</title>
      <style>
        body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #111; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
        .brand { font-size: 24px; font-weight: bold; }
        .brand small { display: block; color: #D4AF37; font-size: 10px; text-transform: uppercase; letter-spacing: 3px; }
        .inv-num { font-size: 14px; color: #666; text-align: right; }
        .inv-num strong { display: block; font-size: 18px; color: #111; }
        table { width: 100%; border-collapse: collapse; margin: 30px 0; }
        th { text-align: left; padding: 10px; border-bottom: 2px solid #ddd; font-size: 12px; text-transform: uppercase; color: #888; }
        td { padding: 10px; border-bottom: 1px solid #eee; }
        .total-row td { border-top: 2px solid #111; font-weight: bold; font-size: 16px; }
        .footer { margin-top: 60px; text-align: center; color: #999; font-size: 12px; }
        @media print { body { padding: 20px; } }
      </style></head><body>
      ${printRef.current.innerHTML}
      <div class="footer">Parnika — The Rental Studio | Thank you for your business</div>
      </body></html>
    `);
        win.document.close();
        win.print();
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">Invoices & Receipts</h1>
                <p className="text-gray-500 text-sm mt-1">{invoices.length} invoices generated</p>
            </div>

            <div className="bg-[#121212] rounded-2xl border border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead><tr className="border-b border-gray-800 text-left">
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Invoice #</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Customer</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Total</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Date</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Actions</th>
                        </tr></thead>
                        <tbody className="divide-y divide-gray-800">
                            {invoices.map((inv) => (
                                <tr key={inv.id} className="hover:bg-gray-800/30 transition-colors">
                                    <td className="px-6 py-4 text-white text-sm font-mono">{inv.invoiceNumber}</td>
                                    <td className="px-6 py-4">
                                        <p className="text-white text-sm">{inv.customerName}</p>
                                        <p className="text-gray-500 text-xs">{inv.customerPhone}</p>
                                    </td>
                                    <td className="px-6 py-4 text-white text-sm font-bold">₹{inv.total.toLocaleString()}</td>
                                    <td className="px-6 py-4"><span className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${statusColors[inv.status]}`}>{inv.status}</span></td>
                                    <td className="px-6 py-4 text-gray-400 text-sm">{new Date(inv.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 flex gap-2">
                                        <button onClick={() => setSelected(inv)} className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-[#D4AF37] transition-all"><Eye size={16} /></button>
                                        {inv.status === 'draft' && <button onClick={() => handleStatusChange(inv.id, 'sent')} className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-amber-400 transition-all" title="Mark as Sent"><Check size={16} /></button>}
                                        {inv.status === 'sent' && <button onClick={() => handleStatusChange(inv.id, 'paid')} className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-green-400 transition-all" title="Mark as Paid"><Check size={16} /></button>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {invoices.length === 0 && (
                    <div className="p-12 text-center text-gray-600">
                        <FileText size={32} className="mx-auto mb-3 opacity-50" />
                        <p className="text-sm">No invoices yet. Create one from the Requests page.</p>
                    </div>
                )}
            </div>

            {/* Invoice Detail & Print */}
            <AnimatePresence>
                {selected && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="bg-[#121212] rounded-2xl border border-gray-800 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-white">{selected.invoiceNumber}</h2>
                                <div className="flex gap-2">
                                    <button onClick={handlePrint} className="flex items-center gap-2 bg-[#D4AF37] text-black px-4 py-2 rounded-xl text-sm font-bold hover:opacity-90 transition-all"><Printer size={16} /> Print</button>
                                    <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-white"><X size={20} /></button>
                                </div>
                            </div>

                            {/* Printable Content */}
                            <div ref={printRef} className="p-6">
                                <div className="header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                                    <div>
                                        <div className="brand" style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>PARNIKA</div>
                                        <div style={{ color: '#D4AF37', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '3px' }}>The Rental Studio</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ color: '#999', fontSize: '12px' }}>Invoice</div>
                                        <div style={{ color: 'white', fontWeight: 'bold' }}>{selected.invoiceNumber}</div>
                                        <div style={{ color: '#999', fontSize: '12px' }}>{new Date(selected.createdAt).toLocaleDateString()}</div>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <div style={{ color: '#999', fontSize: '12px', marginBottom: '4px' }}>Bill To</div>
                                    <div style={{ color: 'white', fontWeight: 'bold' }}>{selected.customerName}</div>
                                    <div style={{ color: '#999', fontSize: '13px' }}>{selected.customerPhone}</div>
                                </div>

                                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid #333' }}>
                                            <th style={{ textAlign: 'left', padding: '8px 0', color: '#999', fontSize: '11px', textTransform: 'uppercase' }}>Item</th>
                                            <th style={{ textAlign: 'right', padding: '8px 0', color: '#999', fontSize: '11px', textTransform: 'uppercase' }}>Days</th>
                                            <th style={{ textAlign: 'right', padding: '8px 0', color: '#999', fontSize: '11px', textTransform: 'uppercase' }}>Rate</th>
                                            <th style={{ textAlign: 'right', padding: '8px 0', color: '#999', fontSize: '11px', textTransform: 'uppercase' }}>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selected.items.map((item, i) => (
                                            <tr key={i} style={{ borderBottom: '1px solid #222' }}>
                                                <td style={{ padding: '8px 0', color: 'white', fontSize: '13px' }}>{item.productName}</td>
                                                <td style={{ padding: '8px 0', color: '#ccc', fontSize: '13px', textAlign: 'right' }}>{item.days}</td>
                                                <td style={{ padding: '8px 0', color: '#ccc', fontSize: '13px', textAlign: 'right' }}>₹{item.pricePerDay.toLocaleString()}</td>
                                                <td style={{ padding: '8px 0', color: 'white', fontSize: '13px', textAlign: 'right', fontWeight: 'bold' }}>₹{item.total.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan={3} style={{ textAlign: 'right', padding: '8px 0', color: '#999', fontSize: '13px' }}>Subtotal</td>
                                            <td style={{ textAlign: 'right', padding: '8px 0', color: 'white', fontSize: '13px', fontWeight: 'bold' }}>₹{selected.subtotal.toLocaleString()}</td>
                                        </tr>
                                        <tr>
                                            <td colSpan={3} style={{ textAlign: 'right', padding: '8px 0', color: '#999', fontSize: '13px' }}>Advance Paid</td>
                                            <td style={{ textAlign: 'right', padding: '8px 0', color: '#D4AF37', fontSize: '13px', fontWeight: 'bold' }}>- ₹{selected.advancePaid.toLocaleString()}</td>
                                        </tr>
                                        <tr>
                                            <td colSpan={3} style={{ textAlign: 'right', padding: '8px 0', color: '#999', fontSize: '13px' }}>Security Deposit</td>
                                            <td style={{ textAlign: 'right', padding: '8px 0', color: 'white', fontSize: '13px', fontWeight: 'bold' }}>+ ₹{selected.depositAmount.toLocaleString()}</td>
                                        </tr>
                                        <tr style={{ borderTop: '2px solid #D4AF37' }}>
                                            <td colSpan={3} style={{ textAlign: 'right', padding: '12px 0', color: 'white', fontSize: '16px', fontWeight: 'bold' }}>Balance Due</td>
                                            <td style={{ textAlign: 'right', padding: '12px 0', color: '#D4AF37', fontSize: '18px', fontWeight: 'bold' }}>₹{(selected.total - selected.advancePaid + selected.depositAmount).toLocaleString()}</td>
                                        </tr>
                                    </tfoot>
                                </table>


                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
