'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getProductsByCategory } from '@/lib/data-store';
import { Product, Category } from '@/lib/types';

interface CategoryPageProps {
    category: Category;
    title: string;
    subtitle: string;
    badgeLabel: string;
    badgeIcon: React.ReactNode;
    ctaTitle: string;
    ctaDescription: string;
}

export default function CategoryPageLayout({ category, title, subtitle, badgeLabel, badgeIcon, ctaTitle, ctaDescription }: CategoryPageProps) {
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        const fetch = async () => setProducts(await getProductsByCategory(category));
        fetch();
    }, [category]);

    return (
        <div className="min-h-screen bg-background pt-28 pb-16 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Hero Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 text-[#D4AF37] px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                        {badgeIcon} {badgeLabel}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-serif font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-300">
                        {title}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg transition-colors duration-300">
                        {subtitle}
                    </p>
                </motion.div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                    {products.map((product, index) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            className="group bg-white dark:bg-[#121212] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:shadow-2xl hover:shadow-[#D4AF37]/10 transition-all duration-500"
                        >
                            <div className="relative h-80 overflow-hidden">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                <span className="absolute top-4 left-4 bg-[#D4AF37] text-black text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                                    {product.tag}
                                </span>
                                {product.inventory <= 2 && product.inventory > 0 && (
                                    <span className="absolute top-4 right-4 bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                                        Only {product.inventory} left
                                    </span>
                                )}
                                {product.inventory === 0 && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                        <span className="bg-gray-900 text-white text-sm font-bold px-6 py-2 rounded-full">Out of Stock</span>
                                    </div>
                                )}
                            </div>
                            <div className="p-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 transition-colors duration-300">{product.name}</h3>
                                <p className="text-xs text-gray-400 dark:text-gray-600 font-mono mb-2">ID: {product.id}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 transition-colors duration-300">{product.description}</p>

                                {/* Pricing */}
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-xl font-bold text-[#D4AF37]">
                                        ₹{(product.discountedPrice || product.price).toLocaleString()}
                                    </span>
                                    {product.discountedPrice && (
                                        <>
                                            <span className="text-sm text-gray-400 line-through">₹{product.price.toLocaleString()}</span>
                                            <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-bold">
                                                {Math.round(((product.price - product.discountedPrice) / product.price) * 100)}% OFF
                                            </span>
                                        </>
                                    )}
                                </div>

                                {product.inventory > 0 ? (
                                    <Link
                                        href={`/request?productId=${product.id}&productName=${encodeURIComponent(product.name)}`}
                                        className="inline-flex items-center gap-2 text-[#D4AF37] font-semibold text-sm hover:gap-3 transition-all"
                                    >
                                        Request This <ArrowRight size={16} />
                                    </Link>
                                ) : (
                                    <span className="text-gray-500 text-sm">Currently unavailable</span>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {products.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-gray-500">No products available in this category right now.</p>
                    </div>
                )}

                {/* CTA Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-white dark:bg-[#121212] rounded-3xl p-10 md:p-16 text-center border border-gray-200 dark:border-gray-800 transition-colors duration-300"
                >
                    <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
                        {ctaTitle}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-lg mx-auto transition-colors duration-300">
                        {ctaDescription}
                    </p>
                    <Link
                        href="/request"
                        className="inline-flex items-center gap-2 bg-[#D4AF37] text-black px-8 py-4 rounded-full font-bold uppercase tracking-wider hover:opacity-90 transition-all shadow-lg shadow-[#D4AF37]/20"
                    >
                        Request a Rental <ArrowRight size={18} />
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
