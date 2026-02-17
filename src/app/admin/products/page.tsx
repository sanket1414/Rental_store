'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Search, Filter, Package, Upload, ImageIcon, Link2, Box, CheckCircle, Loader2 } from 'lucide-react';
import { getProducts, addProduct, updateProduct, deleteProduct } from '@/lib/data-store';
import { Product, Category } from '@/lib/types';

const categories: { value: Category | 'all'; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'women', label: "Women's" },
    { value: 'men', label: "Men's" },
    { value: 'jewellery', label: 'Jewellery' },
    { value: 'photoshoots', label: 'Photoshoots' },
];

const CATEGORIES: Category[] = ['women', 'men', 'jewellery', 'photoshoots'];

const SUB_CATEGORIES: Record<Category, string[]> = {
    women: ['Bridal/Siders Lehengas', 'Wedding Ballgowns/Lehengas', 'Groom+Bride Matching Outfits', 'Reception & Engagement gowns', 'Sangeet & Mehendi Lehengas', 'Sister of Bride Ballgowns/ Lehengas', 'Nauvari/Paithani/ South Sarees', 'Heavy Array Work Blouses'],
    men: ['Wedding Sherwanis', 'Jodhpuris/ Tuxedos/ Indo-Western', 'Men\'s Designer Jackets'],
    jewellery: ['Jewellery on Rent', 'AD stone', 'South Indian', 'Maharashtrian', 'Others'],
    photoshoots: ['Maternity Shoot Gowns', 'Pre-Wedding Shoot Outfits', 'Baby Shower Outfits', 'Others']
};

const emptyForm = {
    name: '', description: '', image: '', additionalImages: [] as string[],
    gifUrl: '', model3dUrl: '', price: 0, discountedPrice: undefined as number | undefined,
    category: 'women' as Category, subCategory: 'Bridal/Siders Lehengas', tag: '', inventory: 1, isActive: true,
};

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [filter, setFilter] = useState<Category | 'all'>('all');
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Product | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');
    const [dragOver, setDragOver] = useState(false);
    const [saving, setSaving] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (file: File) => {
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file.');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            setForm(prev => ({ ...prev, image: e.target?.result as string }));
        };
        reader.readAsDataURL(file);
    };

    const handleMultiFileUpload = (files: FileList) => {
        Array.from(files).forEach(file => {
            if (!file.type.startsWith('image/')) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                setForm(prev => ({
                    ...prev,
                    additionalImages: [...(prev.additionalImages || []), e.target?.result as string]
                }));
            };
            reader.readAsDataURL(file);
        });
    };

    const handleGifUpload = (file: File) => {
        if (!file.type.includes('gif')) {
            alert('Please upload a GIF file.');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            setForm(prev => ({ ...prev, gifUrl: e.target?.result as string }));
        };
        reader.readAsDataURL(file);
    };

    const handle3dUpload = (file: File) => {
        // .glb or .gltf
        const reader = new FileReader();
        reader.onload = (e) => {
            setForm(prev => ({ ...prev, model3dUrl: e.target?.result as string }));
        };
        reader.readAsDataURL(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileUpload(file);
    };

    useEffect(() => { reload(); }, []);

    const reload = async () => setProducts(await getProducts());

    const filtered = products
        .filter((p) => filter === 'all' || p.category === filter)
        .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

    const openAdd = () => { setForm(emptyForm); setEditing(null); setShowForm(true); };
    const openEdit = (p: Product) => {
        setForm({
            name: p.name,
            description: p.description,
            image: p.image,
            additionalImages: p.additionalImages || [],
            gifUrl: p.gifUrl || '',
            model3dUrl: p.model3dUrl || '',
            price: p.price,
            discountedPrice: p.discountedPrice,
            category: p.category,
            subCategory: p.subCategory || (SUB_CATEGORIES[p.category]?.[0] || 'Others'),
            tag: p.tag,
            inventory: p.inventory,
            isActive: p.isActive
        });
        setEditing(p);
        setShowForm(true);
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            if (editing) {
                await updateProduct(editing.id, form);
                setNotification({ type: 'success', message: 'Product updated successfully!' });
            } else {
                await addProduct(form as Omit<Product, 'id' | 'createdAt'>);
                setNotification({ type: 'success', message: 'Product added successfully!' });
            }
            setShowForm(false);
            reload();
            setTimeout(() => setNotification(null), 3000);
        } catch (error) {
            setNotification({ type: 'error', message: 'Something went wrong. Please try again.' });
            setTimeout(() => setNotification(null), 3000);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Delete this product? This cannot be undone.')) {
            await deleteProduct(id);
            reload();
        }
    };

    return (
        <div className="relative">
            {/* Success/Error Toast */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: -20, x: '-50%' }}
                        className={`fixed top-8 left-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border ${notification.type === 'success'
                            ? 'bg-green-500/10 border-green-500/50 text-green-400'
                            : 'bg-red-500/10 border-red-500/50 text-red-400'
                            } backdrop-blur-md`}
                    >
                        {notification.type === 'success' ? <CheckCircle size={18} /> : <X size={18} />}
                        <span className="text-sm font-bold tracking-wide">{notification.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white">Products</h1>
                    <p className="text-gray-500 text-sm mt-1">{products.length} items in inventory</p>
                </div>
                <button onClick={openAdd} className="bg-[#D4AF37] text-black px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-all">
                    <Plus size={18} /> Add Product
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
                <div className="relative flex-1 max-w-xs">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#121212] border border-gray-800 text-white text-sm placeholder-gray-500 focus:border-[#D4AF37] outline-none transition-all"
                        placeholder="Search products…"
                    />
                </div>
                <div className="flex gap-1 bg-[#121212] rounded-xl border border-gray-800 p-1">
                    {categories.map((c) => (
                        <button key={c.value} onClick={() => setFilter(c.value)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === c.value ? 'bg-[#D4AF37] text-black' : 'text-gray-400 hover:text-white'}`}>
                            {c.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-[#121212] rounded-2xl border border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-800 text-left">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Stock</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {filtered.map((p) => (
                                <tr key={p.id} className="hover:bg-gray-800/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                                            <div>
                                                <p className="text-white text-sm font-medium">{p.name}</p>
                                                <p className="text-gray-500 text-xs truncate max-w-[200px]">{p.description}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-400 text-xs font-mono">{p.id}</td>
                                    <td className="px-6 py-4"><span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-lg capitalize">{p.category}</span></td>
                                    <td className="px-6 py-4">
                                        <span className="text-white text-sm">₹{(p.discountedPrice || p.price).toLocaleString()}</span>
                                        {p.discountedPrice && <span className="text-gray-500 text-xs line-through ml-1">₹{p.price.toLocaleString()}</span>}
                                    </td>
                                    <td className="px-6 py-4"><span className={`text-sm font-medium ${p.inventory > 0 ? 'text-green-400' : 'text-red-400'}`}>{p.inventory}</span></td>
                                    <td className="px-6 py-4"><span className={`text-xs font-bold px-2 py-1 rounded-full ${p.isActive ? 'bg-green-900/30 text-green-400' : 'bg-gray-800 text-gray-500'}`}>{p.isActive ? 'Active' : 'Hidden'}</span></td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-[#D4AF37] transition-all"><Pencil size={15} /></button>
                                            <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-red-400 transition-all"><Trash2 size={15} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filtered.length === 0 && (
                    <div className="p-12 text-center text-gray-600">
                        <Package size={32} className="mx-auto mb-3 opacity-50" />
                        <p className="text-sm">No products found.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showForm && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-[#121212] rounded-2xl border border-gray-800 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-white">{editing ? 'Edit Product' : 'Add Product'}</h2>
                                <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white"><X size={20} /></button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 block mb-1.5">Name</label>
                                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-[#1a1a1a] border border-gray-700 text-white text-sm focus:border-[#D4AF37] outline-none" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 block mb-1.5">Description</label>
                                    <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-4 py-2.5 rounded-xl bg-[#1a1a1a] border border-gray-700 text-white text-sm focus:border-[#D4AF37] outline-none resize-none" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 block mb-1.5">Product Image</label>

                                    {/* Tabs */}
                                    <div className="flex gap-1 bg-[#0a0a0a] rounded-lg p-0.5 mb-3">
                                        <button
                                            type="button"
                                            onClick={() => setImageMode('upload')}
                                            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${imageMode === 'upload' ? 'bg-[#D4AF37] text-black' : 'text-gray-400 hover:text-white'}`}
                                        >
                                            <Upload size={13} /> Upload
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setImageMode('url')}
                                            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${imageMode === 'url' ? 'bg-[#D4AF37] text-black' : 'text-gray-400 hover:text-white'}`}
                                        >
                                            <Link2 size={13} /> URL
                                        </button>
                                    </div>

                                    {imageMode === 'upload' ? (
                                        <div
                                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                            onDragLeave={() => setDragOver(false)}
                                            onDrop={handleDrop}
                                            onClick={() => fileInputRef.current?.click()}
                                            className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${dragOver ? 'border-[#D4AF37] bg-[#D4AF37]/10' : 'border-gray-700 hover:border-gray-600 bg-[#1a1a1a]'
                                                }`}
                                        >
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }}
                                            />

                                            {form.image && (form.image.startsWith('data:') || form.image.startsWith('http') || form.image.startsWith('/')) ? (
                                                <div className="flex items-center gap-4">
                                                    <img src={form.image} alt="Preview" className="w-20 h-20 rounded-xl object-cover border border-gray-700" />
                                                    <div className="flex-1 text-left">
                                                        <p className="text-white text-sm font-medium">Image selected</p>
                                                        <p className="text-gray-500 text-xs mt-0.5">Click or drag to replace</p>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); setForm(f => ({ ...f, image: '' })); }}
                                                            className="text-red-400 text-xs font-medium mt-1 hover:underline"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mx-auto mb-3">
                                                        <ImageIcon size={22} className="text-gray-500" />
                                                    </div>
                                                    <p className="text-gray-300 text-sm font-medium">Drop image here or click to browse</p>
                                                    <p className="text-gray-600 text-xs mt-1">PNG, JPG, WEBP up to 5MB</p>
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <input
                                                value={form.image}
                                                onChange={(e) => setForm({ ...form, image: e.target.value })}
                                                placeholder="https://example.com/image.jpg"
                                                className="w-full px-4 py-2.5 rounded-xl bg-[#1a1a1a] border border-gray-700 text-white text-sm focus:border-[#D4AF37] outline-none"
                                            />
                                            {form.image && (form.image.startsWith('http') || form.image.startsWith('/')) && (
                                                <div className="flex items-center gap-3 p-2 bg-[#0a0a0a] rounded-lg border border-gray-800">
                                                    <img src={form.image} alt="URL preview" className="w-12 h-12 rounded-md object-cover" />
                                                    <span className="text-xs text-gray-500">URL Preview</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 block">GIF Preview (.gif)</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="file"
                                                accept="image/gif"
                                                className="hidden"
                                                id="gif-upload"
                                                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleGifUpload(f); }}
                                            />
                                            <label htmlFor="gif-upload" className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#1a1a1a] border border-gray-700 text-white text-xs cursor-pointer hover:border-[#D4AF37] transition-all">
                                                <Upload size={14} /> Upload GIF
                                            </label>
                                        </div>
                                        <input value={form.gifUrl} onChange={(e) => setForm({ ...form, gifUrl: e.target.value })} placeholder="or paste URL" className="w-full px-4 py-2 rounded-xl bg-[#1a1a1a] border border-gray-700 text-white text-xs focus:border-[#D4AF37] outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 block">3D Model (.glb)</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="file"
                                                accept=".glb,.gltf"
                                                className="hidden"
                                                id="model-upload"
                                                onChange={(e) => { const f = e.target.files?.[0]; if (f) handle3dUpload(f); }}
                                            />
                                            <label htmlFor="model-upload" className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#1a1a1a] border border-gray-700 text-white text-xs cursor-pointer hover:border-[#D4AF37] transition-all">
                                                <Box size={14} /> Upload 3D
                                            </label>
                                        </div>
                                        <input value={form.model3dUrl} onChange={(e) => setForm({ ...form, model3dUrl: e.target.value })} placeholder="or paste URL" className="w-full px-4 py-2 rounded-xl bg-[#1a1a1a] border border-gray-700 text-white text-xs focus:border-[#D4AF37] outline-none" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 block">Additional Images</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            className="hidden"
                                            id="multi-upload"
                                            onChange={(e) => { if (e.target.files) handleMultiFileUpload(e.target.files); }}
                                        />
                                        <label htmlFor="multi-upload" className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#1a1a1a] border-2 border-dashed border-gray-700 text-gray-400 text-sm cursor-pointer hover:border-[#D4AF37] hover:text-white transition-all">
                                            <Plus size={18} /> Add Images
                                        </label>
                                    </div>
                                    <textarea
                                        value={form.additionalImages?.join('\n')}
                                        onChange={(e) => setForm({ ...form, additionalImages: e.target.value.split('\n').filter(l => l.trim() !== '') })}
                                        className="w-full px-4 py-2.5 rounded-xl bg-[#1a1a1a] border border-gray-700 text-white text-sm focus:border-[#D4AF37] outline-none resize-none"
                                        rows={2}
                                        placeholder="Or paste image URLs (one per line)..."
                                    />
                                    {form.additionalImages && form.additionalImages.length > 0 && (
                                        <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
                                            {form.additionalImages.map((img, i) => (
                                                <div key={i} className="relative group flex-shrink-0">
                                                    <img src={img} alt="Extra" className="w-16 h-16 rounded-lg object-cover border border-gray-800" />
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setForm(f => ({ ...f, additionalImages: f.additionalImages.filter((_, idx) => idx !== i) }));
                                                        }}
                                                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X size={10} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 block mb-1.5">Price (₹)</label>
                                        <input
                                            type="number"
                                            value={form.price || ''}
                                            onChange={(e) => {
                                                const val = e.target.value === '' ? 0 : Number(e.target.value);
                                                setForm({ ...form, price: Math.max(0, val) });
                                            }}
                                            onFocus={(e) => e.target.select()}
                                            className="w-full px-4 py-2.5 rounded-xl bg-[#1a1a1a] border border-gray-700 text-white text-sm focus:border-[#D4AF37] outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 block mb-1.5">Discounted Price (₹)</label>
                                        <input
                                            type="number"
                                            value={form.discountedPrice || ''}
                                            onChange={(e) => {
                                                const val = e.target.value === '' ? undefined : Number(e.target.value);
                                                setForm({ ...form, discountedPrice: val !== undefined ? Math.max(0, val) : undefined });
                                            }}
                                            onFocus={(e) => e.target.select()}
                                            placeholder="Optional"
                                            className="w-full px-4 py-2.5 rounded-xl bg-[#1a1a1a] border border-gray-700 text-white text-sm focus:border-[#D4AF37] outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 block">Category</label>
                                        <select
                                            value={form.category}
                                            onChange={(e) => {
                                                const cat = e.target.value as Category;
                                                setForm({
                                                    ...form,
                                                    category: cat,
                                                    subCategory: SUB_CATEGORIES[cat][0]
                                                });
                                            }}
                                            className="w-full px-4 py-2.5 rounded-xl bg-[#1a1a1a] border border-gray-700 text-white text-sm focus:border-[#D4AF37] outline-none"
                                        >
                                            {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 block">Outfit Type (Sub-Category)</label>
                                        <select
                                            value={form.subCategory}
                                            onChange={(e) => setForm({ ...form, subCategory: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl bg-[#1a1a1a] border border-gray-700 text-white text-sm focus:border-[#D4AF37] outline-none"
                                        >
                                            {SUB_CATEGORIES[form.category].map(sc => <option key={sc} value={sc}>{sc}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 block mb-1.5">Tag</label>
                                        <input value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} placeholder="e.g. Bestseller" className="w-full px-4 py-2.5 rounded-xl bg-[#1a1a1a] border border-gray-700 text-white text-sm focus:border-[#D4AF37] outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 block mb-1.5">Inventory</label>
                                        <input
                                            type="number"
                                            value={form.inventory || ''}
                                            onChange={(e) => {
                                                const val = e.target.value === '' ? 0 : Number(e.target.value);
                                                setForm({ ...form, inventory: Math.max(0, val) });
                                            }}
                                            onFocus={(e) => e.target.select()}
                                            className="w-full px-4 py-2.5 rounded-xl bg-[#1a1a1a] border border-gray-700 text-white text-sm focus:border-[#D4AF37] outline-none"
                                        />
                                    </div>
                                </div>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 rounded accent-[#D4AF37]" />
                                    <span className="text-sm text-gray-300">Active (visible on website)</span>
                                </label>
                            </div>
                            <div className="p-6 border-t border-gray-800 flex gap-3 justify-end">
                                <button onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-800 transition-all">Cancel</button>
                                <button onClick={handleSave} disabled={!form.name || !form.price || saving} className="bg-[#D4AF37] text-black px-6 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2">
                                    {saving ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        editing ? 'Update Product' : 'Add Product'
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
