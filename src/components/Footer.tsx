'use client';

import Link from 'next/link';
import { Instagram, MapPin, Phone, MessageCircle } from 'lucide-react';

const Footer = () => {
    const socials = [
        {
            icon: Phone,
            href: 'tel:90499399455',
        },
        {
            // WhatsApp chat
            icon: MessageCircle,
            href: 'https://api.whatsapp.com/send?phone=919049939455',
            newTab: true,
        },
        {
            icon: MapPin,
            href: 'https://maps.app.goo.gl/pmGvFeP76X3awQZf9',
            newTab: true,
        },
        {
            icon: Instagram,
            href: 'https://www.instagram.com/parnika_rental_studio?igsh=MXVsM2J1dDExcnQ4OQ==',
            newTab: true,
        },
    ] as const;

    return (
        <footer className="relative bg-[#C5A029] text-[#000000] pt-32 pb-12 overflow-hidden mt-[-1px]">
            {/* Wavy Top SVG */}
            <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0]">
                <svg
                    data-name="Layer 1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 1200 120"
                    preserveAspectRatio="none"
                    className="relative block w-full h-[60px] md:h-[100px] fill-background transition-colors duration-300"
                >
                    <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
                </svg>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                    <h3 className="text-2xl font-serif font-bold mb-6 text-[#000000]">Tap to connect on:</h3>
                    <div className="flex justify-center gap-6">
                        {socials.map((social, idx) => (
                            <a
                                key={idx}
                                href={social.href}
                                target={social.newTab ? '_blank' : undefined}
                                rel={social.newTab ? 'noopener noreferrer' : undefined}
                                className="bg-[#000000] text-[#D4AF37] w-14 h-14 rounded-full flex items-center justify-center hover:bg-white hover:text-[#000000] transition-all duration-300 shadow-xl shadow-[#000000]/10"
                            >
                                <social.icon size={24} />
                            </a>
                        ))}
                    </div>
                </div>

                <div className="border-t border-[#000000]/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm font-medium opacity-80 text-[#000000]">
                    <p>&copy; {new Date().getFullYear()} Parnika The Rental Studio. All rights reserved.</p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <Link href="#" className="hover:text-white transition-colors">
                            Privacy Policy
                        </Link>
                        <Link href="#" className="hover:text-white transition-colors">
                            Terms of Service
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
