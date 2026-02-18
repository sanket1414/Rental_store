'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Eye, Printer, X, Check, MessageCircle } from 'lucide-react';
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
    const receiptRef = useRef<HTMLDivElement>(null);
    const refundRef = useRef<HTMLDivElement>(null);
    const [editAdvance, setEditAdvance] = useState<number | ''>(0);
    const [editDeposit, setEditDeposit] = useState<number | ''>(0);
    const [refundAmount, setRefundAmount] = useState<number | ''>(0);

    useEffect(() => { reload(); }, []);

    useEffect(() => {
        if (selected) {
            setEditAdvance(selected.advancePaid);
            setEditDeposit(selected.depositAmount);
        }
    }, [selected]);
    const reload = async () => {
        const data = await getInvoices();
        setInvoices(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    };

    const handleStatusChange = async (id: string, status: InvoiceStatus) => {
        await updateInvoice(id, { status });
        reload();
        if (selected?.id === id) setSelected({ ...selected, status });
    };

    const handleSavePayment = async () => {
        if (!selected) return;
        const advance = editAdvance === '' ? 0 : editAdvance;
        const deposit = editDeposit === '' ? 0 : editDeposit;
        const updated = await updateInvoice(selected.id, { advancePaid: advance, depositAmount: deposit });
        if (updated) {
            await reload();
            setSelected(updated);
            alert('Payment details updated for this invoice.');
        }
    };

    const handlePrint = (mode: 'invoice' | 'receipt' | 'refund' = 'invoice') => {
        const sourceNode =
            mode === 'invoice'
                ? printRef.current
                : mode === 'receipt'
                    ? receiptRef.current
                    : refundRef.current;
        if (!sourceNode) return;
        const win = window.open('', '_blank');
        if (!win) return;
        win.document.write(`
      <html><head><title>${mode === 'invoice' ? 'Invoice' : 'Receipt'} ${selected?.invoiceNumber}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 40px; color: #111; background: #ffffff; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
        .brand { font-size: 24px; font-weight: bold; }
        .brand small { display: block; color: #D4AF37; font-size: 10px; text-transform: uppercase; letter-spacing: 3px; }
        .inv-num { font-size: 12px; color: #555; text-align: right; }
        .inv-num strong { display: block; font-size: 18px; color: #111; }
        table { width: 100%; border-collapse: collapse; margin: 30px 0; }
        th { text-align: left; padding: 10px 0; border-bottom: 2px solid #ddd; font-size: 11px; text-transform: uppercase; color: #666; letter-spacing: 0.08em; }
        td { padding: 8px 0; border-bottom: 1px solid #eee; font-size: 13px; color: #222; }
        tfoot td { border-bottom: none; }
        .muted { color: #666; font-size: 12px; }
        .amount-main { color: #111; font-weight: 700; }
        .amount-accent { color: #D4AF37; font-weight: 700; }
        .border-top-strong td { border-top: 2px solid #111; }
        .footer { margin-top: 48px; text-align: center; color: #888; font-size: 11px; }
        @media print { body { padding: 20px; } }
      </style></head><body>
      ${sourceNode.innerHTML}
      <div class="footer">Parnika — The Rental Studio · Thank you for your business</div>
      </body></html>
    `);
        win.document.close();
        win.print();
    };

    const handleWhatsApp = () => {
        if (!selected) return;
        const raw = selected.customerPhone || '';
        const digits = raw.replace(/\D/g, '');
        const phone = digits.length === 10 ? `91${digits}` : digits;
        if (!phone) {
            alert('Customer phone number is missing or invalid.');
            return;
        }
        const msg = [
            `Hi ${selected.customerName},`,
            ``,
            `Here are your invoice details from Parnika The Rental Studio:`,
            `Invoice: ${selected.invoiceNumber}`,
            `Amount: ₹${selected.total.toLocaleString()}`,
            selected.advancePaid ? `Advance paid: ₹${selected.advancePaid.toLocaleString()}` : undefined,
            selected.depositAmount ? `Security deposit: ₹${selected.depositAmount.toLocaleString()}` : undefined,
            ``,
            `Thank you!`
        ].filter(Boolean).join('\n');

        const url = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(msg)}`;
        window.open(url, '_blank');
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
                                    <button
                                        onClick={handleWhatsApp}
                                        className="flex items-center gap-2 bg-transparent border border-gray-700 text-gray-300 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-gray-800/60 transition-all"
                                    >
                                        <MessageCircle size={14} /> WhatsApp
                                    </button>
                                    <button
                                        onClick={() => handlePrint('invoice')}
                                        className="flex items-center gap-2 bg-[#D4AF37] text-black px-4 py-2 rounded-xl text-sm font-bold hover:opacity-90 transition-all"
                                    >
                                        <Printer size={16} /> Print Invoice
                                    </button>
                                    <button
                                        onClick={() => handlePrint('receipt')}
                                        className="flex items-center gap-2 bg-transparent border border-gray-700 text-gray-300 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-gray-800/60 transition-all"
                                    >
                                        <Printer size={14} /> Receipt
                                    </button>
                                    <button
                                        onClick={() => handlePrint('refund')}
                                        className="flex items-center gap-2 bg-transparent border border-gray-700 text-gray-300 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-gray-800/60 transition-all"
                                        title="Deposit refund receipt"
                                    >
                                        <Printer size={14} /> Refund
                                    </button>
                                    <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-white"><X size={20} /></button>
                                </div>
                            </div>

                            {/* Inline payment editor for this invoice */}
                            <div className="px-6 pb-4 bg-[#0f0f0f] border-t border-gray-800 flex flex-col gap-3">
                                <div className="flex flex-wrap gap-4 items-end">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 mb-1">Advance Paid (₹)</label>
                                        <input
                                            type="number"
                                            min={0}
                                            value={editAdvance}
                                            onChange={(e) => setEditAdvance(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                                            className="w-36 px-3 py-2 rounded-md bg-[#1a1a1a] border border-gray-700 text-sm text-white focus:border-[#D4AF37] outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 mb-1">Security Deposit (₹)</label>
                                        <input
                                            type="number"
                                            min={0}
                                            value={editDeposit}
                                            onChange={(e) => setEditDeposit(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                                            className="w-36 px-3 py-2 rounded-md bg-[#1a1a1a] border border-gray-700 text-sm text-white focus:border-[#D4AF37] outline-none"
                                        />
                                    </div>
                                    <div className="ml-auto flex flex-col items-end gap-1 text-xs text-gray-400">
                                        <span>Total rental: ₹{selected.total.toLocaleString()}</span>
                                        <span>Received now: ₹{((editAdvance === '' ? 0 : editAdvance) + (editDeposit === '' ? 0 : editDeposit)).toLocaleString()}</span>
                                        <div className="mt-1 flex items-center gap-2">
                                            <span className="text-[10px] uppercase tracking-wide text-gray-500">Refund Amount (₹)</span>
                                            <input
                                                type="number"
                                                min={0}
                                                value={refundAmount}
                                                onChange={(e) => setRefundAmount(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                                                className="w-24 px-2 py-1 rounded-md bg-[#1a1a1a] border border-gray-700 text-[11px] text-white focus:border-[#D4AF37] outline-none"
                                            />
                                        </div>
                                        <button
                                            onClick={handleSavePayment}
                                            className="mt-1 inline-flex items-center gap-1 bg-[#D4AF37]/10 text-[#D4AF37] px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-[#D4AF37]/20 transition-all"
                                        >
                                            Save Payment
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Printable Content (Invoice preview) */}
                            <div ref={printRef} className="p-6 bg-white text-black rounded-b-2xl">
                                <div className="header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                                    <div>
                                        <div className="brand" style={{ fontSize: '20px', fontWeight: 'bold', color: '#111' }}>PARNIKA</div>
                                        <div style={{ color: '#D4AF37', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '3px' }}>The Rental Studio</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ color: '#555', fontSize: '12px' }}>Invoice</div>
                                        <div style={{ color: '#111', fontWeight: 'bold' }}>{selected.invoiceNumber}</div>
                                        <div style={{ color: '#555', fontSize: '12px' }}>{new Date(selected.createdAt).toLocaleDateString()}</div>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <div style={{ color: '#666', fontSize: '12px', marginBottom: '4px' }}>Bill To</div>
                                    <div style={{ color: '#111', fontWeight: 'bold' }}>{selected.customerName}</div>
                                    <div style={{ color: '#555', fontSize: '13px' }}>{selected.customerPhone}</div>
                                </div>

                                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid #333' }}>
                                            <th style={{ textAlign: 'left', padding: '8px 0', color: '#666', fontSize: '11px', textTransform: 'uppercase' }}>Item</th>
                                            <th style={{ textAlign: 'right', padding: '8px 0', color: '#666', fontSize: '11px', textTransform: 'uppercase' }}>Days</th>
                                            <th style={{ textAlign: 'right', padding: '8px 0', color: '#666', fontSize: '11px', textTransform: 'uppercase' }}>Rate</th>
                                            <th style={{ textAlign: 'right', padding: '8px 0', color: '#666', fontSize: '11px', textTransform: 'uppercase' }}>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selected.items.map((item, i) => (
                                            <tr key={i} style={{ borderBottom: '1px solid #222' }}>
                                                <td style={{ padding: '8px 0', color: '#111', fontSize: '13px' }}>{item.productName}</td>
                                                <td style={{ padding: '8px 0', color: '#555', fontSize: '13px', textAlign: 'right' }}>{item.days}</td>
                                                <td style={{ padding: '8px 0', color: '#555', fontSize: '13px', textAlign: 'right' }}>₹{item.pricePerDay.toLocaleString()}</td>
                                                <td style={{ padding: '8px 0', color: '#111', fontSize: '13px', textAlign: 'right', fontWeight: 'bold' }}>₹{item.total.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan={3} style={{ textAlign: 'right', padding: '8px 0', color: '#666', fontSize: '13px' }}>Subtotal</td>
                                            <td style={{ textAlign: 'right', padding: '8px 0', color: '#111', fontSize: '13px', fontWeight: 'bold' }}>₹{selected.subtotal.toLocaleString()}</td>
                                        </tr>
                                        <tr>
                                            <td colSpan={3} style={{ textAlign: 'right', padding: '8px 0', color: '#666', fontSize: '13px' }}>Advance Paid</td>
                                            <td style={{ textAlign: 'right', padding: '8px 0', color: '#D4AF37', fontSize: '13px', fontWeight: 'bold' }}>₹{selected.advancePaid.toLocaleString()}</td>
                                        </tr>
                                        <tr>
                                            <td colSpan={3} style={{ textAlign: 'right', padding: '8px 0', color: '#666', fontSize: '13px' }}>Security Deposit (held)</td>
                                            <td style={{ textAlign: 'right', padding: '8px 0', color: '#111', fontSize: '13px', fontWeight: 'bold' }}>₹{selected.depositAmount.toLocaleString()}</td>
                                        </tr>
                                        <tr style={{ borderTop: '2px solid #D4AF37' }}>
                                            <td colSpan={3} style={{ textAlign: 'right', padding: '12px 0', color: '#111', fontSize: '16px', fontWeight: 'bold' }}>Balance Due (rental)</td>
                                            <td style={{ textAlign: 'right', padding: '12px 0', color: '#D4AF37', fontSize: '18px', fontWeight: 'bold' }}>₹{Math.max(selected.total - selected.advancePaid, 0).toLocaleString()}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {/* Hidden receipt layout used only for "Receipt" print button */}
                            <div ref={receiptRef} className="hidden">
                                <div className="header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                                    <div>
                                        <div className="brand" style={{ fontSize: '20px', fontWeight: 'bold', color: '#111' }}>PARNIKA</div>
                                        <div style={{ color: '#D4AF37', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '3px' }}>The Rental Studio</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ color: '#555', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Receipt</div>
                                        <div style={{ color: '#111', fontWeight: 'bold' }}>{selected.invoiceNumber}</div>
                                        <div style={{ color: '#555', fontSize: '12px' }}>{new Date(selected.createdAt).toLocaleDateString()}</div>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <div style={{ color: '#666', fontSize: '12px', marginBottom: '4px' }}>Received From</div>
                                    <div style={{ color: '#111', fontWeight: 'bold' }}>{selected.customerName}</div>
                                    <div style={{ color: '#555', fontSize: '13px' }}>{selected.customerPhone}</div>
                                </div>

                                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                                    <tbody>
                                        <tr>
                                            <td style={{ padding: '8px 0', color: '#666', fontSize: '13px' }}>Rental Amount</td>
                                            <td style={{ padding: '8px 0', color: '#111', fontSize: '13px', textAlign: 'right' }}>₹{selected.total.toLocaleString()}</td>
                                        </tr>
                                        <tr>
                                            <td style={{ padding: '8px 0', color: '#666', fontSize: '13px' }}>Advance Received</td>
                                            <td style={{ padding: '8px 0', color: '#111', fontSize: '13px', textAlign: 'right' }}>₹{selected.advancePaid.toLocaleString()}</td>
                                        </tr>
                                        <tr>
                                            <td style={{ padding: '8px 0', color: '#666', fontSize: '13px' }}>Security Deposit</td>
                                            <td style={{ padding: '8px 0', color: '#111', fontSize: '13px', textAlign: 'right' }}>₹{selected.depositAmount.toLocaleString()}</td>
                                        </tr>
                                        <tr style={{ borderTop: '2px solid #111' }}>
                                            <td style={{ padding: '12px 0', color: '#111', fontSize: '14px', fontWeight: 'bold' }}>Total Received</td>
                                            <td style={{ padding: '12px 0', color: '#D4AF37', fontSize: '16px', fontWeight: 'bold', textAlign: 'right' }}>₹{(selected.advancePaid + selected.depositAmount).toLocaleString()}</td>
                                        </tr>
                                    </tbody>
                                </table>

                                <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'space-between' }}>
                                    <div style={{ color: '#777', fontSize: '11px', maxWidth: '60%' }}>
                                        This is a computer-generated receipt for rental booking and security deposit. Final settlement will be done at the time of outfit return.
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ borderTop: '1px solid #999', paddingTop: '8px', fontSize: '12px', color: '#333' }}>Authorised Signatory</div>
                                    </div>
                                </div>
                            </div>

                            {/* Hidden refund receipt layout used only for "Refund" print button */}
                            <div ref={refundRef} className="hidden">
                                <div className="header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                                    <div>
                                        <div className="brand" style={{ fontSize: '20px', fontWeight: 'bold', color: '#111' }}>PARNIKA</div>
                                        <div style={{ color: '#D4AF37', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '3px' }}>The Rental Studio</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ color: '#555', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Deposit Refund</div>
                                        <div style={{ color: '#111', fontWeight: 'bold' }}>{selected.invoiceNumber}</div>
                                        <div style={{ color: '#555', fontSize: '12px' }}>{new Date().toLocaleDateString()}</div>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <div style={{ color: '#666', fontSize: '12px', marginBottom: '4px' }}>Refunded To</div>
                                    <div style={{ color: '#111', fontWeight: 'bold' }}>{selected.customerName}</div>
                                    <div style={{ color: '#555', fontSize: '13px' }}>{selected.customerPhone}</div>
                                </div>

                                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                                    <tbody>
                                        <tr>
                                            <td style={{ padding: '8px 0', color: '#666', fontSize: '13px' }}>Original Security Deposit</td>
                                            <td style={{ padding: '8px 0', color: '#111', fontSize: '13px', textAlign: 'right' }}>₹{selected.depositAmount.toLocaleString()}</td>
                                        </tr>
                                        <tr style={{ borderTop: '2px solid #111' }}>
                                            <td style={{ padding: '12px 0', color: '#111', fontSize: '14px', fontWeight: 'bold' }}>Deposit Refunded</td>
                                            <td style={{ padding: '12px 0', color: '#D4AF37', fontSize: '16px', fontWeight: 'bold', textAlign: 'right' }}>
                                                ₹{((refundAmount === '' ? selected.depositAmount : refundAmount) || 0).toLocaleString()}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                                <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'space-between' }}>
                                    <div style={{ color: '#777', fontSize: '11px', maxWidth: '60%' }}>
                                        This receipt confirms that the above security deposit has been refunded for the rental under Invoice {selected.invoiceNumber}. All dues are settled subject to normal wear and tear.
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ borderTop: '1px solid #999', paddingTop: '8px', fontSize: '12px', color: '#333' }}>Authorised Signatory</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
