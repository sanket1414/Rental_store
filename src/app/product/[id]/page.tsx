'use client';

import { useEffect, useState, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Box, ChevronLeft, ChevronRight, Share2, Heart, ShieldCheck, Truck, RefreshCcw } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getProductById } from '@/lib/data-store';
import { Product } from '@/lib/types';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [mainMediaIndex, setMainMediaIndex] = useState(0);
    const [show3d, setShow3d] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            const data = await getProductById(id);
            if (data) {
                setProduct(data);
            }
            setLoading(false);
        };
        fetchProduct();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <h1 className="text-2xl font-bold mb-4">Product not found</h1>
                <Link href="/" className="text-[#D4AF37] hover:underline flex items-center gap-2">
                    <ArrowLeft size={18} /> Back to Home
                </Link>
            </div>
        );
    }

    const allImages = [product.image, ...(product.additionalImages || [])];

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
                    <Link href="/" className="hover:text-[#D4AF37] transition-colors">Home</Link>
                    <ChevronRight size={14} />
                    <button onClick={() => router.back()} className="hover:text-[#D4AF37] transition-colors capitalize">{product.category}</button>
                    {product.subCategory && (
                        <>
                            <ChevronRight size={14} />
                            <span className="text-gray-500">{product.subCategory}</span>
                        </>
                    )}
                    <ChevronRight size={14} />
                    <span className="text-gray-900 dark:text-white font-medium truncate">{product.name}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Left: Media Gallery (5 cols) */}
                    <div className="lg:col-span-7 space-y-4">
                        <div className="relative aspect-[4/5] bg-gray-100 dark:bg-[#121212] rounded-[2rem] overflow-hidden border border-gray-200 dark:border-gray-800 shadow-xl">
                            <AnimatePresence mode="wait">
                                {show3d && product.model3dUrl ? (
                                    <motion.div
                                        key="3d"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="w-full h-full bg-[#0a0a0a]"
                                    >
                                        {/* @ts-ignore */}
                                        <model-viewer
                                            src={product.model3dUrl}
                                            alt={product.name}
                                            auto-rotate
                                            camera-controls
                                            shadow-intensity="1"
                                            style={{ width: '100%', height: '100%' }}
                                        /* @ts-ignore */
                                        ></model-viewer>
                                        <button
                                            onClick={() => setShow3d(false)}
                                            className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-full border border-gray-700 hover:bg-[#D4AF37] hover:text-black transition-all shadow-2xl"
                                        >
                                            Return to Gallery
                                        </button>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key={mainMediaIndex}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.5 }}
                                        className="w-full h-full group"
                                    >
                                        <img
                                            src={allImages[mainMediaIndex]}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                        />

                                        {/* GIF Overlay on Hover */}
                                        {product.gifUrl && (
                                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                                                <img src={product.gifUrl} alt="GIF Preview" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Floating Action Buttons */}
                            <div className="absolute top-6 right-6 flex flex-col gap-3">
                                <button className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-[#D4AF37] hover:text-black transition-all shadow-lg">
                                    <Heart size={20} />
                                </button>
                                <button className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-[#D4AF37] hover:text-black transition-all shadow-lg">
                                    <Share2 size={20} />
                                </button>
                            </div>

                            {/* 3D Trigger */}
                            {product.model3dUrl && !show3d && (
                                <button
                                    onClick={() => setShow3d(true)}
                                    className="absolute bottom-6 right-6 bg-[#D4AF37] text-black px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-transform shadow-2xl"
                                >
                                    <Box size={18} /> View in 3D
                                </button>
                            )}

                            {/* Stock Badge */}
                            {product.inventory <= 2 && product.inventory > 0 && (
                                <div className="absolute top-6 left-6 bg-red-500 text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg">
                                    Only {product.inventory} Left
                                </div>
                            )}
                        </div>

                        {/* Thumbnails */}
                        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                            {allImages.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => { setMainMediaIndex(i); setShow3d(false); }}
                                    className={`relative flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all ${mainMediaIndex === i && !show3d ? 'border-[#D4AF37] scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                >
                                    <img src={img} alt={`Thumb ${i}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                            {product.model3dUrl && (
                                <button
                                    onClick={() => setShow3d(true)}
                                    className={`relative flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 bg-gray-900 flex flex-col items-center justify-center gap-1 transition-all ${show3d ? 'border-[#D4AF37] scale-105' : 'border-transparent opacity-60 hover:opacity-100 text-white'}`}
                                >
                                    <Box size={24} />
                                    <span className="text-[10px] font-bold">3D VIEW</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Right: Product Info (5 cols) */}
                    <div className="lg:col-span-5">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="sticky top-32"
                        >
                            <div className="flex flex-wrap gap-2 mb-6">
                                <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 text-[#D4AF37] px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors duration-300">
                                    {product.tag || 'Exclusive Collection'}
                                </div>
                                {product.subCategory && (
                                    <div className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors duration-300">
                                        {product.subCategory}
                                    </div>
                                )}
                            </div>

                            <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                                {product.name}
                            </h1>

                            <p className="text-gray-500 dark:text-gray-400 text-lg mb-8 leading-relaxed">
                                {product.description}
                            </p>

                            {/* Pricing Card */}
                            <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-3xl p-8 mb-8 shadow-sm">
                                <div className="flex items-end gap-4 mb-6">
                                    <div className="space-y-1">
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Rental Price</p>
                                        <p className="text-5xl font-bold text-[#D4AF37]">
                                            ₹{(product.discountedPrice || product.price).toLocaleString()}
                                        </p>
                                    </div>
                                    {product.discountedPrice && (
                                        <div className="mb-1">
                                            <p className="text-gray-400 line-through text-lg">₹{product.price.toLocaleString()}</p>
                                            <p className="text-green-500 text-sm font-bold">
                                                Save {Math.round(((product.price - product.discountedPrice) / product.price) * 100)}%
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <Link
                                    href={`/request?productId=${product.id}&productName=${encodeURIComponent(product.name)}`}
                                    className="w-full bg-[#D4AF37] text-black h-16 rounded-2xl flex items-center justify-center gap-3 font-bold text-lg uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-[#D4AF37]/20"
                                >
                                    Request This Rental <ArrowRight size={20} />
                                </Link>

                                <p className="text-center text-xs text-gray-500 mt-4">
                                    * Security deposit and rental terms apply
                                </p>
                            </div>

                            {/* Value Props */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-[#1a1a1a] border border-gray-100 dark:border-gray-800">
                                    <div className="text-[#D4AF37]"><ShieldCheck size={24} /></div>
                                    <div>
                                        <h4 className="font-bold text-sm">Quality Guaranteed</h4>
                                        <p className="text-xs text-gray-500">Premium dry-cleaned finish</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-[#1a1a1a] border border-gray-100 dark:border-gray-800">
                                    <div className="text-[#D4AF37] transition-colors"><Truck size={24} /></div>
                                    <div>
                                        <h4 className="font-bold text-sm">Express Pickup</h4>
                                        <p className="text-xs text-gray-500">Fast local studio access</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-[#1a1a1a] border border-gray-100 dark:border-gray-800">
                                    <div className="text-[#D4AF37] transition-colors"><RefreshCcw size={24} /></div>
                                    <div>
                                        <h4 className="font-bold text-sm">Easy Returns</h4>
                                        <p className="text-xs text-gray-500">Stress-free rental process</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
