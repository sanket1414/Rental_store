'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { ThemeToggle } from "./ThemeToggle";

const navItems = [
  { label: "Women's", href: '/women' },
  { label: "Men's", href: '/men' },
  { label: 'Jewellery', href: '/jewellery' },
  { label: 'Photoshoots', href: '/photoshoots' },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 dark:bg-[#050505]/90 backdrop-blur-md shadow-lg py-2' : 'bg-transparent py-4'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-12 h-12 md:w-16 md:h-16 group-hover:scale-105 transition-transform duration-300">
              <img
                src="/logo.png"
                alt="Parnika The Rental Studio"
                className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl md:text-2xl font-bold text-gray-900 dark:text-white tracking-wide leading-none group-hover:text-[#D4AF37] transition-colors">PARNIKA</span>
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#D4AF37] font-bold mt-0.5">The Rental Studio</span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 items-center">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-gray-700 dark:text-gray-300 hover:text-[#D4AF37] dark:hover:text-[#D4AF37] font-medium text-xs uppercase tracking-widest transition-colors relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#D4AF37] transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}

            <ThemeToggle />

            {/* CTA Button */}
            <Link href="/request" className="bg-[#D4AF37] px-6 py-2.5 rounded-full font-medium text-xs uppercase tracking-wider hover:bg-black dark:hover:bg-white transition-all duration-300 shadow-xl shadow-[#D4AF37]/20 hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center text-black hover:text-[#D4AF37] dark:hover:text-black">
              Request Rental
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-gray-900 dark:text-white p-2">
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-white/95 dark:bg-[#050505]/95 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800"
        >
          <div className="px-4 pt-4 pb-8 space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="block text-gray-900 dark:text-white hover:text-[#D4AF37] font-medium text-sm uppercase tracking-widest py-2"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-gray-800 mt-4 pt-4">
              <span className="text-gray-900 dark:text-white font-medium text-sm uppercase tracking-widest">Theme</span>
              <ThemeToggle />
            </div>
            <Link
              href="/request"
              className="block bg-[#D4AF37] text-black text-center py-3 rounded-full font-bold uppercase tracking-wider mt-4"
              onClick={() => setIsOpen(false)}
            >
              Request Rental
            </Link>
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;
