import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, Box } from 'lucide-react';
import Link from 'next/link';
import { getProductsByCategory } from '@/lib/data-store';
import { Product, Category } from '@/lib/types';

interface CategoryPageProps {
    category: Category;
    title: string;
    subtitle: string;
    badgeLabel: string;
    badgeIcon: React.ReactNode;
    ctaTitle?: string;
    ctaDescription: string;
    ctaButtonText?: string;
    ctaLink?: string;
}

const ProductMedia = ({ product }: { product: Product }) => {
    const images = [product.image, ...(product.additionalImages || [])];
    const [index, setIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [show3d, setShow3d] = useState(false);

    const next = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIndex((prev) => (prev + 1) % images.length);
    };

    const prev = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    // Auto-advance if hovered? Maybe not, manual is better for control.

    return (
        <div
            className="relative h-80 overflow-hidden"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
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
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShow3d(false); }}
                            className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-gray-700 hover:bg-[#D4AF37] hover:text-black transition-all"
                        >
                            Exit 3D View
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="w-full h-full"
                    >
                        <img
                            src={isHovered && product.gifUrl ? product.gifUrl : images[index]}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>

            {/* Tags */}
            <span className="absolute top-4 left-4 bg-[#D4AF37] text-black text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full z-10">
                {product.tag}
            </span>

            {/* Controls Hidden during 3D */}
            {!show3d && (
                <>
                    {/* Multi-image indicators */}
                    {images.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                            {images.map((_, i) => (
                                <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === index ? 'bg-[#D4AF37] w-4' : 'bg-white/40'}`}></div>
                            ))}
                        </div>
                    )}

                    {/* Navigation Arrows */}
                    {images.length > 1 && isHovered && (
                        <>
                            <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-all z-20"><ChevronLeft size={18} /></button>
                            <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-all z-20"><ChevronRight size={18} /></button>
                        </>
                    )}

                    {/* 3D Trigger */}
                    {product.model3dUrl && (
                        <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShow3d(true); }}
                            className="absolute top-4 right-4 bg-black/40 backdrop-blur-md text-white p-2 rounded-full hover:bg-[#D4AF37] hover:text-black transition-all z-20 shadow-lg"
                            title="View in 3D"
                        >
                            <Box size={18} />
                        </button>
                    )}
                </>
            )}

            {product.inventory <= 2 && product.inventory > 0 && (
                <span className="absolute top-16 left-4 bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full z-10">
                    Only {product.inventory} left
                </span>
            )}

            {product.inventory === 0 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-30">
                    <span className="bg-gray-900 text-white text-sm font-bold px-6 py-2 rounded-full">Out of Stock</span>
                </div>
            )}
        </div>
    );
};

const SUB_CATEGORIES: Record<Category, string[]> = {
    women: ['All', 'Bridal/Siders Lehengas', 'Wedding Ballgowns/Lehengas', 'Groom+Bride Matching Outfits', 'Reception & Engagement gowns', 'Sangeet & Mehendi Lehengas', 'Sister of Bride Ballgowns/ Lehengas', 'Nauvari/Paithani/ South Sarees', 'Heavy Array Work Blouses'],
    men: ['All', 'Wedding Sherwanis', 'Jodhpuris/ Tuxedos/ Indo-Western', 'Men\'s Designer Jackets'],
    jewellery: ['All', 'Jewellery on Rent', 'AD stone', 'South Indian', 'Maharashtrian', 'Others'],
    photoshoots: ['All', 'Maternity Shoot Gowns', 'Pre-Wedding Shoot Outfits', 'Baby Shower Outfits', 'Others']
};

export default function CategoryPageLayout({ category, title, subtitle, badgeLabel, badgeIcon, ctaTitle, ctaDescription, ctaButtonText, ctaLink }: CategoryPageProps) {
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [activeSub, setActiveSub] = useState('All');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            const data = await getProductsByCategory(category);
            setAllProducts(data);
            setLoading(false);
        };
        fetch();
    }, [category]);

    const products = activeSub === 'All'
        ? allProducts
        : allProducts.filter(p => p.subCategory === activeSub);

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
                    <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 text-[#D4AF37] px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6 transition-colors duration-300">
                        {badgeIcon} {badgeLabel}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-serif font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-300">
                        {title}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg transition-colors duration-300">
                        {subtitle}
                    </p>
                </motion.div>

                {/* Sub-Category Tabs */}
                <div className="flex flex-wrap justify-center gap-3 mb-12">
                    {SUB_CATEGORIES[category].map((sub) => (
                        <button
                            key={sub}
                            onClick={() => setActiveSub(sub)}
                            className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 border ${activeSub === sub
                                ? 'bg-[#D4AF37] border-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20 scale-105'
                                : 'bg-transparent border-gray-200 dark:border-gray-800 text-gray-500 hover:border-[#D4AF37] hover:text-[#D4AF37]'
                                }`}
                        >
                            {sub}
                        </button>
                    ))}
                </div>

                {/* Product Section */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-6">
                        <div className="w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] animate-pulse">Curating your collection...</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                            {products.map((product, index) => (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1, duration: 0.5 }}
                                    className="group bg-white dark:bg-[#121212] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:shadow-2xl hover:shadow-[#D4AF37]/10 transition-all duration-500 cursor-pointer"
                                >
                                    <Link href={`/product/${product.id}`} className="block">
                                        <ProductMedia product={product} />

                                        <div className="p-6">
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 transition-colors duration-300">{product.name}</h3>
                                            <p className="text-xs text-gray-400 dark:text-gray-600 font-mono mb-2">ID: {product.id}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 transition-colors duration-300 h-10 overflow-hidden line-clamp-2">{product.description}</p>

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
                                                <div className="inline-flex items-center gap-2 text-[#D4AF37] font-semibold text-sm hover:gap-3 transition-all">
                                                    View Details <ArrowRight size={16} />
                                                </div>
                                            ) : (
                                                <span className="text-gray-500 text-sm transition-colors duration-300">Currently unavailable</span>
                                            )}
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>

                        {products.length === 0 && (
                            <div className="text-center py-32 bg-gray-50 dark:bg-[#0a0a0a] rounded-[2.5rem] border border-dashed border-gray-200 dark:border-gray-800 mb-20 animate-in fade-in zoom-in duration-500">
                                <p className="text-gray-500 dark:text-gray-400 font-serif text-2xl mb-3 italic">Curating New Styles</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em]">We are updating this exclusive collection shortly.</p>
                            </div>
                        )}
                    </>
                )}

                {ctaDescription && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white dark:bg-[#121212] rounded-3xl p-10 md:p-16 text-center border border-gray-200 dark:border-gray-800 transition-colors duration-300"
                    >
                        {ctaTitle && (
                            <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
                                {ctaTitle}
                            </h2>
                        )}
                        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-lg mx-auto transition-colors duration-300">
                            {ctaDescription}
                        </p>
                        <Link
                            href={ctaLink || "/request"}
                            className="inline-flex items-center gap-2 bg-[#D4AF37] text-black px-8 py-4 rounded-full font-bold uppercase tracking-wider hover:opacity-90 transition-all shadow-lg shadow-[#D4AF37]/20"
                        >
                            {ctaButtonText || "Request a Rental"} <ArrowRight size={18} />
                        </Link>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
