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
            ctaTitle="Need a Custom Fit?"
            ctaDescription="Let our stylists help you with alterations and styling. Request a consultation today."
        />
    );
}
