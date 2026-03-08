'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
    INDIA_AID_LOCATIONS,
    TYPE_LABELS,
    TYPE_COLORS,
    TYPE_EMOJIS,
    type AidLocationType,
    type AidLocation,
} from '@/lib/india-aid-locations';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Users, Building2, Home, AlertTriangle } from 'lucide-react';

// Stats icon map
const TYPE_ICONS = {
    ngo: Building2,
    orphanage: Home,
    shelter: Users,
    slum: AlertTriangle,
};

const ALL_TYPES: AidLocationType[] = ['ngo', 'orphanage', 'shelter', 'slum'];

interface LeafletMapProps {
    locations: AidLocation[];
    onSelectLocation: (loc: AidLocation | null) => void;
    selectedLocation: AidLocation | null;
}

// Dynamically import the actual map to avoid SSR issues with Leaflet
const LeafletMap = dynamic<LeafletMapProps>(() => import('./leaflet-food-aid-map'), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center h-full bg-muted/30 rounded-lg">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm">Loading map…</p>
            </div>
        </div>
    ),
});

export default function FoodAidMapView() {
    const [activeTypes, setActiveTypes] = useState<Set<AidLocationType>>(new Set(ALL_TYPES));
    const [search, setSearch] = useState('');
    const [selectedLocation, setSelectedLocation] = useState<AidLocation | null>(null);

    const filteredLocations = useMemo(() => {
        const q = search.toLowerCase().trim();
        return INDIA_AID_LOCATIONS.filter(loc => {
            if (!activeTypes.has(loc.type)) return false;
            if (q && !loc.name.toLowerCase().includes(q) && !loc.city.toLowerCase().includes(q) && !loc.state.toLowerCase().includes(q)) return false;
            return true;
        });
    }, [activeTypes, search]);

    const toggleType = (type: AidLocationType) => {
        setActiveTypes(prev => {
            const next = new Set(prev);
            if (next.has(type)) {
                next.delete(type);
            } else {
                next.add(type);
            }
            return next;
        });
    };

    const counts = useMemo(() => {
        const c: Record<AidLocationType, number> = { ngo: 0, orphanage: 0, shelter: 0, slum: 0 };
        filteredLocations.forEach(l => { c[l.type]++; });
        return c;
    }, [filteredLocations]);

    return (
        <div className="flex flex-col h-full gap-3 p-4 pb-2">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <MapPin className="h-6 w-6 text-primary" />
                    Food Aid Map — India
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Map of NGOs, orphanages, shelters and slum areas across India where food donations are needed.
                </p>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-2">
                {/* Search */}
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, city or state…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-8 h-9"
                    />
                </div>

                {/* Filter pills */}
                <div className="flex flex-wrap gap-1.5 items-center">
                    <span className="text-xs text-muted-foreground mr-1">Filter:</span>
                    {ALL_TYPES.map(type => {
                        const active = activeTypes.has(type);
                        return (
                            <button
                                key={type}
                                onClick={() => toggleType(type)}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all"
                                style={{
                                    backgroundColor: active ? TYPE_COLORS[type] + '20' : 'transparent',
                                    borderColor: active ? TYPE_COLORS[type] : 'hsl(var(--border))',
                                    color: active ? TYPE_COLORS[type] : 'hsl(var(--muted-foreground))',
                                }}
                            >
                                <span>{TYPE_EMOJIS[type]}</span>
                                {TYPE_LABELS[type]}
                                <Badge
                                    variant="secondary"
                                    className="ml-0.5 h-4 px-1 text-[10px]"
                                    style={{ backgroundColor: active ? TYPE_COLORS[type] + '30' : undefined }}
                                >
                                    {counts[type]}
                                </Badge>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Stats strip */}
            <div className="flex flex-wrap gap-2">
                {ALL_TYPES.map(type => {
                    const Icon = TYPE_ICONS[type];
                    const total = INDIA_AID_LOCATIONS.filter(l => l.type === type).length;
                    return (
                        <div
                            key={type}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border bg-card"
                            style={{ borderLeftColor: TYPE_COLORS[type], borderLeftWidth: 3 }}
                        >
                            <Icon className="h-3.5 w-3.5" style={{ color: TYPE_COLORS[type] }} />
                            <span className="font-semibold">{total}</span>
                            <span className="text-muted-foreground">{TYPE_LABELS[type]}s</span>
                        </div>
                    );
                })}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border bg-card">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    <span className="font-semibold">{filteredLocations.length}</span>
                    <span className="text-muted-foreground">showing</span>
                </div>
            </div>

            {/* Map — isolation:isolate scopes Leaflet z-indexes so they can't overlay the sidebar */}
            <div className="flex-1 min-h-[400px] rounded-xl overflow-hidden border shadow-md" style={{ isolation: 'isolate', position: 'relative' }}>
                <LeafletMap
                    locations={filteredLocations}
                    onSelectLocation={setSelectedLocation}
                    selectedLocation={selectedLocation}
                />
            </div>

            {/* Data notice */}
            <p className="text-[11px] text-muted-foreground text-center pb-1">
                📌 Data sourced from NGOdarpan, Ministry of Women &amp; Child Development, Akshaya Patra, SOS Children&apos;s Villages &amp; public records. Covers all 28 states + 8 UTs.
            </p>
        </div>
    );
}
