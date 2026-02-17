'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, MessageCircle } from 'lucide-react';

const CATCHPHRASES = [
    { main: "Rent the look.", sub: "Own the moment." },
    { main: "Wear it.", sub: "Wow them." },
    { main: "Iconic outfits,", sub: "just a rent away." },
    { main: "Style that", sub: "shows up." },
    { main: "Glamour,", sub: "by the day." }
];

const Hero = () => {
    const [phrase, setPhrase] = useState(CATCHPHRASES[0]);

    useEffect(() => {
        const random = CATCHPHRASES[Math.floor(Math.random() * CATCHPHRASES.length)];
        setPhrase(random);
    }, []);

    return (
        <section className="relative min-h-[90vh] flex items-center bg-background pt-24 pb-12 overflow-hidden transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-left"
                    >
                        <span className="inline-block px-4 py-1.5 rounded-full border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-bold tracking-widest uppercase mb-8 mt-8 bg-[#D4AF37]/10">
                            Premium Ethnic Wear
                        </span>

                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-gray-900 dark:text-white leading-[1.1] mb-8 transition-colors duration-300 min-h-[3em]">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={phrase.main}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    {phrase.main} <br />
                                    <span className="text-[#D4AF37] italic">{phrase.sub}</span>
                                </motion.div>
                            </AnimatePresence>
                        </h1>

                        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-lg mb-10 leading-relaxed font-light transition-colors duration-300">
                            Discover the finest collection of bridal lehengas, heavy gowns, jewelry, and sherwanis. Luxury fashion made accessible for your special moments.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <a href="#collections" className="bg-[#D4AF37] px-8 py-4 rounded-full font-bold text-sm uppercase tracking-wider hover:bg-white transition-all shadow-lg shadow-[#D4AF37]/25 text-black hover:text-black" style={{ color: 'black' }}>
                                View Collection
                            </a>
                            <Link href="/request" className="bg-transparent border border-gray-900 dark:border-gray-600 text-gray-900 dark:text-white px-8 py-4 rounded-full font-bold text-sm uppercase tracking-wider hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex items-center gap-2">
                                <MessageCircle size={18} /> Chat with Stylist
                            </Link>
                        </div>
                    </motion.div>

                    {/* Right Images Grid */}
                    <div className="relative h-[600px] hidden lg:block">
                        {/* Main Large Image */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="absolute right-0 top-0 w-2/3 h-[45%] rounded-[2rem] overflow-hidden shadow-2xl z-10 border-4 border-white dark:border-[#121212] transition-colors duration-300"
                        >
                            <img src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=80" className="w-full h-full object-cover" alt="Luxury Bridal Couture" />
                        </motion.div>

                        {/* Staggered Image 1 (Sherwani) - Force Visibility */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="absolute left-0 top-[20%] w-3/5 h-[40%] rounded-[2rem] overflow-hidden shadow-xl z-50 border-2 border-white dark:border-[#121212] transition-colors duration-300"
                        >
                            <img src="https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=800&q=80" className="w-full h-full object-cover" alt="Premium Groom Sherwani" />
                        </motion.div>

                        {/* Staggered Image 2 (Bottom) */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.6 }}
                            className="absolute bottom-0 right-[10%] w-3/5 h-[35%] rounded-[2rem] overflow-hidden shadow-2xl z-20 border-4 border-white dark:border-[#121212] transition-colors duration-300"
                        >
                            <img src="https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=800&q=80" className="w-full h-full object-cover" alt="Crafted Temple Jewelry" />
                        </motion.div>

                        {/* Circular Badge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.8 }}
                            className="absolute top-[40%] left-[55%] -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-[#121212] w-24 h-24 rounded-full shadow-2xl flex flex-col items-center justify-center z-30 border-4 border-gray-100 dark:border-[#050505] transition-colors duration-300"
                        >
                            <span className="text-2xl font-serif font-bold text-[#D4AF37]">100+</span>
                            <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest font-semibold">Designs</span>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gray-50 dark:bg-[#121212] -z-10 rounded-l-[5rem] transition-colors duration-300"></div>
        </section>
    );
};

export default Hero;
