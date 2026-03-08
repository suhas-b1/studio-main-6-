'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
    INDIA_AID_LOCATIONS,
    TYPE_COLORS,
    TYPE_EMOJIS,
    type AidLocationType,
    type AidLocation,
} from '@/lib/india-aid-locations';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Search, MapPin, AlertTriangle, Home, Users,
    Building2, TrendingUp, Navigation,
} from 'lucide-react';

// Only show places that NEED food (not NGOs that are pickup points)
const DONOR_RELEVANT_TYPES: AidLocationType[] = ['slum', 'shelter', 'orphanage'];

const TYPE_LABELS_DONOR: Record<AidLocationType, string> = {
    slum: 'Slum / Colony',
    shelter: 'Shelter Home',
    orphanage: 'Orphanage',
    ngo: 'NGO',
};

const TYPE_ICONS = {
    slum: AlertTriangle,
    shelter: Home,
    orphanage: Users,
    ngo: Building2,
};

const URGENCY_COLORS: Record<AidLocationType, string> = {
    slum: '#ef4444',     // red — highest need
    shelter: '#f97316',  // orange
    orphanage: '#8b5cf6', // purple
    ngo: '#3b82f6',      // blue
};

interface LeafletMapProps {
    locations: AidLocation[];
    onSelectLocation: (loc: AidLocation | null) => void;
    selectedLocation: AidLocation | null;
}

const LeafletMap = dynamic<LeafletMapProps>(
    () => import('./leaflet-food-aid-map'),
    {
        ssr: false,
        loading: () => (
            <div className="flex items-center justify-center h-full bg-muted/30 rounded-lg">
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm">Loading map…</p>
                </div>
            </div>
        ),
    }
);

export default function DonorHotspotMap() {
    const [activeTypes, setActiveTypes] = useState<Set<AidLocationType>>(
        new Set(DONOR_RELEVANT_TYPES)
    );
    const [search, setSearch] = useState('');
    const [selectedLocation, setSelectedLocation] = useState<AidLocation | null>(null);

    const filteredLocations = useMemo(() => {
        const q = search.toLowerCase().trim();
        return INDIA_AID_LOCATIONS.filter(loc => {
            if (!DONOR_RELEVANT_TYPES.includes(loc.type)) return false;
            if (!activeTypes.has(loc.type)) return false;
            if (
                q &&
                !loc.name.toLowerCase().includes(q) &&
                !loc.city.toLowerCase().includes(q) &&
                !loc.state.toLowerCase().includes(q)
            )
                return false;
            return true;
        });
    }, [activeTypes, search]);

    const toggleType = (type: AidLocationType) => {
        setActiveTypes(prev => {
            const next = new Set(prev);
            if (next.has(type)) next.delete(type);
            else next.add(type);
            return next;
        });
    };

    const counts = useMemo(() => {
        const c: Partial<Record<AidLocationType, number>> = {};
        DONOR_RELEVANT_TYPES.forEach(t => {
            c[t] = INDIA_AID_LOCATIONS.filter(l => l.type === t).length;
        });
        return c;
    }, []);

    return (
        <div className="flex flex-col h-full gap-4 p-4 pb-2">
            {/* ── Header ─────────────────────────────────────── */}
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="h-8 w-8 rounded-lg bg-red-500/15 flex items-center justify-center">
                            <TrendingUp className="h-4 w-4 text-red-400" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">Food Need Hotspots</h1>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Real locations across India where food donations are urgently needed — slums, shelters & orphanages.
                        Click any pin to get live directions.
                    </p>
                </div>
            </div>

            {/* ── Search + Filter ─────────────────────────────── */}
            <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, city or state…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-8 h-9"
                    />
                </div>

                <div className="flex flex-wrap gap-1.5 items-center">
                    <span className="text-xs text-muted-foreground mr-1">Filter:</span>
                    {DONOR_RELEVANT_TYPES.map(type => {
                        const active = activeTypes.has(type);
                        const color = URGENCY_COLORS[type];
                        return (
                            <button
                                key={type}
                                onClick={() => toggleType(type)}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all"
                                style={{
                                    backgroundColor: active ? color + '20' : 'transparent',
                                    borderColor: active ? color : 'hsl(var(--border))',
                                    color: active ? color : 'hsl(var(--muted-foreground))',
                                }}
                            >
                                <span>{TYPE_EMOJIS[type]}</span>
                                {TYPE_LABELS_DONOR[type]}
                                <Badge
                                    variant="secondary"
                                    className="ml-0.5 h-4 px-1 text-[10px]"
                                    style={{ backgroundColor: active ? color + '30' : undefined }}
                                >
                                    {counts[type] ?? 0}
                                </Badge>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Urgency Stats Strip ─────────────────────────── */}
            <div className="flex flex-wrap gap-2">
                {DONOR_RELEVANT_TYPES.map(type => {
                    const Icon = TYPE_ICONS[type];
                    const color = URGENCY_COLORS[type];
                    const total = counts[type] ?? 0;
                    const filtered = filteredLocations.filter(l => l.type === type).length;
                    return (
                        <div
                            key={type}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border bg-card"
                            style={{ borderLeftColor: color, borderLeftWidth: 3 }}
                        >
                            <Icon className="h-3.5 w-3.5" style={{ color }} />
                            <span className="font-semibold">{filtered}</span>
                            <span className="text-muted-foreground">/ {total} {TYPE_LABELS_DONOR[type]}s</span>
                        </div>
                    );
                })}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border bg-card">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    <span className="font-semibold">{filteredLocations.length}</span>
                    <span className="text-muted-foreground">showing</span>
                </div>
            </div>

            {/* ── Info Banner ─────────────────────────────────── */}
            <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-3">
                <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                    <span className="text-red-400 font-semibold">Click any map pin</span> to view details and get
                    live turn-by-turn Google Maps directions from your current location.
                    Data sourced from NGOdarpan, Ministry of WCD, urban planning reports & humanitarian research.
                </p>
            </div>

            {/* ── Map ─────────────────────────────────────────── */}
            <div
                className="flex-1 min-h-[420px] rounded-xl overflow-hidden border shadow-md"
                style={{ isolation: 'isolate', position: 'relative' }}
            >
                <LeafletMap
                    locations={filteredLocations}
                    onSelectLocation={setSelectedLocation}
                    selectedLocation={selectedLocation}
                />
            </div>

            {/* ── Footer ─────────────────────────────────────── */}
            <p className="text-[11px] text-muted-foreground text-center pb-1">
                📌 Covers slum areas, shelters & orphanages across all 28 Indian states & 8 UTs.
                Sources: NGOdarpan · Ministry of WCD · Akshaya Patra · SOS Children's Villages · OpenStreetMap.
            </p>
        </div>
    );
}
