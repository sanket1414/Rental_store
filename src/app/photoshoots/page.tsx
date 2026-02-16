'use client';

import { Camera } from 'lucide-react';
import CategoryPageLayout from '@/components/CategoryPageLayout';

export default function PhotoshootsPage() {
    return (
        <CategoryPageLayout
            category="photoshoots"
            title="Shoots & Matching"
            subtitle="Outfits curated for picture-perfect moments — pre-wedding shoots, maternity sessions, baby showers, and matching couple sets."
            badgeLabel="Photoshoot Specials"
            badgeIcon={<Camera size={14} />}
            ctaTitle="Planning a Shoot?"
            ctaDescription="Tell us your theme and vision — we'll help you pick the perfect outfits for your photoshoot. Couple matching available!"
        />
    );
}
