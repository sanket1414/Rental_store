'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ClipboardList, Users, FileText, LogOut, Store } from 'lucide-react';
import { adminLogout } from '@/lib/data-store';
import { useRouter } from 'next/navigation';

const navLinks = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Products', href: '/admin/products', icon: Package },
    { label: 'Requests', href: '/admin/requests', icon: ClipboardList },
    { label: 'Customers', href: '/admin/customers', icon: Users },
    { label: 'Invoices', href: '/admin/invoices', icon: FileText },
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        adminLogout();
        router.push('/admin/login');
    };

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0a0a0a] border-r border-gray-800 flex flex-col z-50">
            {/* Logo */}
            <div className="p-6 border-b border-gray-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center">
                        <Store size={20} className="text-[#D4AF37]" />
                    </div>
                    <div>
                        <p className="text-white font-bold text-sm">PARNIKA</p>
                        <p className="text-[#D4AF37] text-[10px] uppercase tracking-widest">Admin Portal</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                {navLinks.map((link) => {
                    const isActive = pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href));
                    const Icon = link.icon;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                                    ? 'bg-[#D4AF37]/10 text-[#D4AF37]'
                                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                                }`}
                        >
                            <Icon size={18} />
                            {link.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-800 space-y-2">
                <Link
                    href="/"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-800/50 hover:text-white transition-all"
                >
                    <Store size={18} />
                    View Website
                </Link>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-900/20 transition-all"
                >
                    <LogOut size={18} />
                    Logout
                </button>
            </div>
        </aside>
    );
}
