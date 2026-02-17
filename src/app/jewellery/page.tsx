 'use client';

import { Gem } from 'lucide-react';
import CategoryPageLayout from '@/components/CategoryPageLayout';

const CONTACT_NUMBER = '90499399455';

export default function JewelleryPage() {
    return (
        <CategoryPageLayout
            category="jewellery"
            title="Jewellery Rental"
            subtitle="Complete your look with our exquisite range of rented jewellery — from traditional temple sets to modern statement pieces."
            badgeLabel="Premium Collection"
            badgeIcon={<Gem size={14} />}
            ctaTitle="Can't find what you're looking for?"
            ctaDescription={`Need jewellery to match your outfit? Call us on ${CONTACT_NUMBER} and our stylists will help you curate the perfect set.`}
            ctaButtonText="Contact Us"
            ctaLink={`tel:${CONTACT_NUMBER}`}
        />
    );
}
