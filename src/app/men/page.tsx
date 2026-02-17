'use client';

import { Crown } from 'lucide-react';
import CategoryPageLayout from '@/components/CategoryPageLayout';

export default function MensPage() {
    return (
        <CategoryPageLayout
            category="men"
            title="Gentlemen's Edit"
            subtitle="From wedding sherwanis to designer tuxedos, find the perfect outfit to make your special day unforgettable."
            badgeLabel="Men's Collection"
            badgeIcon={<Crown size={14} />}
            ctaDescription="Looking for something specific or need styling advice? Our experts are just a call away."
            ctaButtonText="Contact Us"
            ctaLink="tel:+910000000000"
        />
    );
}
