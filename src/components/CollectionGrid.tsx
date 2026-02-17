'use client';

import { motion } from 'framer-motion';
import { Shirt, Gem, Camera, User, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const collections = [
    {
        id: 'womens',
        title: "Women's Couture",
        items: [
            'Bridal/Siders Lehengas',
            'Wedding Ballgowns/Lehengas',
            'Groom+Bride Matching Outfits',
            'Reception & Engagement gowns',
            'Sangeet & Mehendi Lehengas',
            'Sister of Bride Ballgowns/ Lehengas',
            'Nauvari/Paithani/ South Sarees',
            'Heavy Array Work Blouses'
        ],
        image: 'https://images.unsplash.com/photo-1583074551184-7a387ee4c43a?auto=format&fit=crop&w=800&q=80',
        link: '/women',
        icon: User,
        color: 'bg-[#D4AF37]'
    },
    {
        id: 'mens',
        title: "Gentlemen's Edit",
        items: [
            'Wedding Sherwanis',
            'Jodhpuris/ Tuxedos/ Indo-Western',
            'Men\'s Designer Jackets'
        ],
        image: 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=800&q=80',
        link: '/men',
        icon: Shirt,
        color: 'bg-[#C5A029]'
    },
    {
        id: 'shoots',
        title: "Shoots & Matching",
        items: [
            'Maternity Shoot Gowns',
            'Pre-Wedding Shoot Outfits',
            'Baby Shower Outfits'
        ],
        image: 'https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&w=800&q=80',
        link: '/photoshoots',
        icon: Camera,
        color: 'bg-[#111111]'
    }
];

const CollectionGrid = () => {
    return (
        <section id="collections" className="py-24 bg-background transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 dark:text-white mb-6 relative inline-block transition-colors duration-300">
                        Our Exclusive Collection
                        <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-20 h-1 bg-[#D4AF37]"></span>
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-8 tracking-wide transition-colors duration-300">Curated for elegance, crafted for you.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {collections.map((collection, index) => (
                        <motion.div
                            key={collection.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.6 }}
                            viewport={{ once: true }}
                        >
                            <Link href={collection.link} className="block group bg-white dark:bg-[#121212] rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-[#D4AF37]/10 transition-all duration-500 border border-gray-200 dark:border-gray-800 h-full">
                                {/* Image Area */}
                                <div className="relative h-80 overflow-hidden">
                                    <img
                                        src={collection.image}
                                        alt={collection.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                                    />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors"></div>

                                    {/* Floating Circular Icon */}
                                    <div className={`absolute -bottom-8 right-8 w-16 h-16 rounded-full ${collection.color} text-white flex items-center justify-center shadow-lg border-4 border-white dark:border-[#121212] z-10 group-hover:scale-110 transition-transform duration-300`}>
                                        <collection.icon size={28} />
                                    </div>
                                </div>

                                {/* Content Area */}
                                <div className="pt-12 pb-10 px-8">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-2xl font-serif font-bold text-gray-900 dark:text-white transition-colors duration-300">{collection.title}</h3>
                                        <ArrowRight size={20} className="text-[#D4AF37] opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                                    </div>
                                    <ul className="space-y-3">
                                        {collection.items.map((item, idx) => (
                                            <li key={idx} className="flex items-center text-gray-500 dark:text-gray-400 text-sm font-medium transition-colors duration-300">
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] mr-3"></span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Promotional Banner for Jewellery */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="mt-16 bg-white dark:bg-[#121212] rounded-[2rem] overflow-hidden shadow-lg border border-gray-200 dark:border-gray-800 transition-colors duration-300"
                >
                    <Link href="/jewellery" className="flex flex-col md:row group">
                        <div className="flex flex-col md:flex-row w-full">
                            <div className="md:w-2/5 relative min-h-[300px] overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=1200&q=80" className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-110" alt="Jewellery" />
                            </div>
                            <div className="md:w-3/5 p-12 flex flex-col justify-center">
                                <div className="flex items-center gap-2 text-[#D4AF37] mb-4">
                                    <Gem size={20} />
                                    <span className="font-bold tracking-widest text-xs uppercase">Limited Edition</span>
                                </div>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-3xl font-serif font-bold text-gray-900 dark:text-white transition-colors duration-300">Premium Jewellery Rental</h3>
                                    <ArrowRight size={24} className="text-[#D4AF37] opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed transition-colors duration-300">
                                    Jewellery on Rent (AD stone, South & Maharashtrian & more). Complete your look with our exquisite collection.
                                </p>
                                <div className="flex gap-3 flex-wrap">
                                    {['AD Stone', 'South Indian Temple', 'Maharashtrian Nath', 'Kundan Sets', 'Bridal Sets'].map(tag => (
                                        <span key={tag} className="px-4 py-2 bg-gray-100 dark:bg-[#1a1a1a] text-gray-600 dark:text-gray-300 rounded-full text-xs font-medium border border-gray-200 dark:border-gray-700 transition-colors duration-300">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
};

export default CollectionGrid;
