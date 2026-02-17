'use client';

import { Crown } from 'lucide-react';
import CategoryPageLayout from '@/components/CategoryPageLayout';

const CONTACT_NUMBER = '90499399455';

export default function MensPage() {
    return (
        <CategoryPageLayout
            category="men"
            title="Gentlemen's Edit"
            subtitle="From wedding sherwanis to designer tuxedos, find the perfect outfit to make your special day unforgettable."
            badgeLabel="Men's Collection"
            badgeIcon={<Crown size={14} />}
            ctaTitle="Can't find what you're looking for?"
            ctaDescription={`Looking for something specific or need styling advice? Call us on ${CONTACT_NUMBER} and our experts will help you out.`}
            ctaButtonText="Contact Us"
            ctaLink={`tel:${CONTACT_NUMBER}`}
        />
    );
}
