'use client';
import dynamic from 'next/dynamic';

const FoodAidMapView = dynamic(() => import('@/components/maps/food-aid-map'), {
    ssr: false,
    loading: () => <div className="flex h-full w-full items-center justify-center text-muted-foreground">Loading map...</div>,
});

export default function FoodAidMapPage() {
    return <FoodAidMapView />;
}
