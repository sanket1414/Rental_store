'use client';

import { Sparkles } from 'lucide-react';
import CategoryPageLayout from '@/components/CategoryPageLayout';

export default function WomensPage() {
    return (
        <CategoryPageLayout
            category="women"
            title="Women's Couture"
            subtitle="From bridal lehengas to reception gowns, discover our handpicked collection of premium rental outfits for every occasion."
            badgeLabel="Women's Collection"
            badgeIcon={<Sparkles size={14} />}
            ctaTitle="Can't Find What You're Looking For?"
            ctaDescription="Our stylists can help you find the perfect outfit. Send us a request and we'll get back within 24 hours."
        />
    );
}
