'use client';

import { motion } from 'framer-motion';
import { Instagram, MapPin, QrCode } from 'lucide-react';

const SocialMapSection = () => {
    return (
        <section className="py-20 bg-background transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-md mx-auto">

                    {/* Instagram Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="bg-white dark:bg-[#121212] p-10 rounded-[2rem] border border-gray-200 dark:border-gray-800 shadow-lg text-center group hover:shadow-2xl hover:shadow-[#D4AF37]/5 transition-all duration-300"
                    >
                        <div className="bg-white dark:bg-black w-48 h-48 mx-auto rounded-2xl p-4 flex items-center justify-center mb-6 shadow-sm border border-gray-100 dark:border-gray-800 group-hover:scale-105 transition-transform duration-300">
                            {/* Simulated QR Code */}
                            <div className="relative w-full h-full bg-white rounded-lg flex items-center justify-center overflow-hidden">
                                <div className="absolute inset-0 opacity-20 bg-[url('https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg')] bg-cover"></div>
                                <QrCode size={64} className="text-black relative z-10" />
                            </div>
                        </div>
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <div className="bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-500 text-white p-1.5 rounded-lg">
                                <Instagram size={18} />
                            </div>
                            <h3 className="text-xl font-serif font-bold text-gray-900 dark:text-white transition-colors duration-300">Instagram</h3>
                        </div>
                        <p className="text-gray-500 dark:text-gray-500 text-sm transition-colors duration-300">Follow us for latest arrivals</p>
                    </motion.div>

                </div>
            </div>
        </section>
    );
};

export default SocialMapSection;
