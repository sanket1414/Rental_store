 'use client';

import { Camera } from 'lucide-react';
import CategoryPageLayout from '@/components/CategoryPageLayout';

const CONTACT_NUMBER = '90499399455';

export default function PhotoshootsPage() {
    return (
        <CategoryPageLayout
            category="photoshoots"
            title="Shoots & Matching"
            subtitle="Outfits curated for picture-perfect moments — pre-wedding shoots, maternity sessions, baby showers, and matching couple sets."
            badgeLabel="Photoshoot Specials"
            badgeIcon={<Camera size={14} />}
            ctaTitle="Can't find what you're looking for?"
            ctaDescription={`Planning a shoot? Call us on ${CONTACT_NUMBER} and we'll help you pick matching outfits for your theme.`}
            ctaButtonText="Contact Us"
            ctaLink={`tel:${CONTACT_NUMBER}`}
        />
    );
}

