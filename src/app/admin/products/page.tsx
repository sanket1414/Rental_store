'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Search, Filter, Package, Upload, ImageIcon, Link2 } from 'lucide-react';
import { getProducts, addProduct, updateProduct, deleteProduct } from '@/lib/data-store';
import { Product, Category } from '@/lib/types';

const categories: { value: Category | 'all'; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'women', label: "Women's" },
    { value: 'men', label: "Men's" },
    { value: 'jewellery', label: 'Jewellery' },
    { value: 'photoshoots', label: 'Photoshoots' },
];

const emptyForm = {
    name: '', description: '', image: '', price: 0, discountedPrice: undefined as number | undefined,
    category: 'women' as Category, tag: '', inventory: 1, isActive: true,
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
        setForm({ name: p.name, description: p.description, image: p.image, price: p.price, discountedPrice: p.discountedPrice, category: p.category, tag: p.tag, inventory: p.inventory, isActive: p.isActive });
        setEditing(p);
        setShowForm(true);
    };

    const handleSave = async () => {
        if (editing) {
            await updateProduct(editing.id, form);
        } else {
            await addProduct(form as Omit<Product, 'id' | 'createdAt'>);
        }
        setShowForm(false);
        reload();
    };

    const handleDelete = async (id: string) => {
        if (confirm('Delete this product? This cannot be undone.')) {
            await deleteProduct(id);
            reload();
        }
    };

    return (
        <div>
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
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 block mb-1.5">Price (₹)</label>
                                        <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="w-full px-4 py-2.5 rounded-xl bg-[#1a1a1a] border border-gray-700 text-white text-sm focus:border-[#D4AF37] outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 block mb-1.5">Discounted Price (₹)</label>
                                        <input type="number" value={form.discountedPrice || ''} onChange={(e) => setForm({ ...form, discountedPrice: e.target.value ? Number(e.target.value) : undefined })} placeholder="Optional" className="w-full px-4 py-2.5 rounded-xl bg-[#1a1a1a] border border-gray-700 text-white text-sm focus:border-[#D4AF37] outline-none" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 block mb-1.5">Category</label>
                                        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Category })} className="w-full px-4 py-2.5 rounded-xl bg-[#1a1a1a] border border-gray-700 text-white text-sm focus:border-[#D4AF37] outline-none">
                                            <option value="women">Women&apos;s</option>
                                            <option value="men">Men&apos;s</option>
                                            <option value="jewellery">Jewellery</option>
                                            <option value="photoshoots">Photoshoots</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 block mb-1.5">Tag</label>
                                        <input value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} placeholder="e.g. Bestseller" className="w-full px-4 py-2.5 rounded-xl bg-[#1a1a1a] border border-gray-700 text-white text-sm focus:border-[#D4AF37] outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 block mb-1.5">Inventory</label>
                                        <input type="number" value={form.inventory} onChange={(e) => setForm({ ...form, inventory: Number(e.target.value) })} className="w-full px-4 py-2.5 rounded-xl bg-[#1a1a1a] border border-gray-700 text-white text-sm focus:border-[#D4AF37] outline-none" />
                                    </div>
                                </div>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 rounded accent-[#D4AF37]" />
                                    <span className="text-sm text-gray-300">Active (visible on website)</span>
                                </label>
                            </div>
                            <div className="p-6 border-t border-gray-800 flex gap-3 justify-end">
                                <button onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-800 transition-all">Cancel</button>
                                <button onClick={handleSave} disabled={!form.name || !form.price} className="bg-[#D4AF37] text-black px-5 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50">{editing ? 'Update' : 'Add Product'}</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
