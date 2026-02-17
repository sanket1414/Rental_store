'use client';

import { Sparkles } from 'lucide-react';
import CategoryPageLayout from '@/components/CategoryPageLayout';

const CONTACT_NUMBER = '90499399455';

export default function WomensPage() {
    return (
        <CategoryPageLayout
            category="women"
            title="Women's Couture"
            subtitle="From bridal lehengas to reception gowns, discover our handpicked collection of premium rental outfits for every occasion."
            badgeLabel="Women's Collection"
            badgeIcon={<Sparkles size={14} />}
            ctaTitle="Can't find what you're looking for?"
            ctaDescription={`Our stylists can help you find the perfect outfit. Call us on ${CONTACT_NUMBER} and we'll help you personally.`}
            ctaButtonText="Contact Us"
            ctaLink={`tel:${CONTACT_NUMBER}`}
        />
    );
}
