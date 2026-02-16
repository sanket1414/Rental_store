'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isAdminLoggedIn } from '@/lib/data-store';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
    const [authorized, setAuthorized] = useState(false);
    const [checking, setChecking] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    // Skip auth check on the login page itself to avoid infinite redirect
    const isLoginPage = pathname === '/admin/login';

    useEffect(() => {
        if (isLoginPage) {
            setAuthorized(true);
            setChecking(false);
            return;
        }
        if (isAdminLoggedIn()) {
            setAuthorized(true);
        } else {
            router.push('/admin/login');
        }
        setChecking(false);
    }, [router, isLoginPage]);

    if (checking) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!authorized) return null;

    return <>{children}</>;
}
