'use client';

import { Gem } from 'lucide-react';
import CategoryPageLayout from '@/components/CategoryPageLayout';

export default function JewelleryPage() {
    return (
        <CategoryPageLayout
            category="jewellery"
            title="Jewellery Rental"
            subtitle="Complete your look with our exquisite range of rented jewellery — from traditional temple sets to modern statement pieces."
            badgeLabel="Premium Collection"
            badgeIcon={<Gem size={14} />}
            ctaTitle="Pair It With Your Outfit"
            ctaDescription="Rent jewellery along with your outfit for the complete bridal or event look. Our stylists will help you match perfectly."
        />
    );
}
