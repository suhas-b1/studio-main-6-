'use client';
import dynamic from 'next/dynamic';

const DonorHotspotMap = dynamic(() => import('@/components/maps/donor-hotspot-map'), {
    ssr: false,
    loading: () => <div className="flex h-full w-full items-center justify-center text-muted-foreground">Loading map...</div>,
});

export default function DonorHotspotMapPage() {
    return <DonorHotspotMap />;
}
