
'use client';

import { useState, useMemo } from "react";
import { BrainCircuit, Zap, Leaf, Clock, SortDesc, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DonationCard } from "@/components/donations/donation-card";
import { useDonations } from "@/context/donations-context";
import { cn } from "@/lib/utils";

type SortKey = 'distance' | 'urgency' | 'match';
type FoodFilter = 'all' | 'vegetarian' | 'prepared' | 'produce' | 'bakery';

const FOOD_FILTERS: { key: FoodFilter; label: string; emoji: string }[] = [
    { key: 'all', label: 'All', emoji: '🍽️' },
    { key: 'vegetarian', label: 'Vegetarian', emoji: '🌿' },
    { key: 'prepared', label: 'Ready to Eat', emoji: '🥘' },
    { key: 'produce', label: 'Fresh Produce', emoji: '🥦' },
    { key: 'bakery', label: 'Bakery', emoji: '🥖' },
];

export default function MatchesPage() {
    const { donations } = useDonations();
    const [sort, setSort] = useState<SortKey>('distance');
    const [foodFilter, setFoodFilter] = useState<FoodFilter>('all');
    const [aiEnabled, setAiEnabled] = useState(true);

    const available = useMemo(() => {
        let list = donations.filter(d => d.status === 'available');

        // food filter
        if (foodFilter === 'vegetarian') list = list.filter(d => d.type !== 'Prepared Meal' || d.description.toLowerCase().includes('veg'));
        if (foodFilter === 'prepared') list = list.filter(d => d.type === 'Prepared Meal');
        if (foodFilter === 'produce') list = list.filter(d => d.type === 'Produce');
        if (foodFilter === 'bakery') list = list.filter(d => d.type === 'Baked Goods');

        // sort
        if (sort === 'distance') list = [...list].sort((a, b) => a.distance - b.distance);
        if (sort === 'urgency') list = [...list].sort((a, b) => a.pickupDeadline.getTime() - b.pickupDeadline.getTime());
        if (sort === 'match') {
            const pct = (id: string) => { const n = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0); return 62 + (n % 37); };
            list = [...list].sort((a, b) => pct(b.id) - pct(a.id));
        }

        return list;
    }, [donations, sort, foodFilter]);

    return (
        <div className="container mx-auto py-8 px-4 md:px-6 max-w-4xl animate-slide-up">

            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-1">
                    <div className="h-9 w-9 rounded-xl bg-primary/15 flex items-center justify-center">
                        <BrainCircuit className="h-5 w-5 text-primary" />
                    </div>
                    <h1 className="text-2xl font-black text-foreground">Smart Match Feed</h1>
                </div>
                <p className="text-sm text-muted-foreground ml-12">AI-optimised donations sorted for your NGO's needs</p>
            </div>

            {/* AI toggle card */}
            <div className="rounded-2xl border border-border bg-card p-4 mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center">
                        <BrainCircuit className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-foreground">Smart Match AI</p>
                        <p className="text-xs text-muted-foreground">Optimising for your NGO's specific needs</p>
                    </div>
                </div>
                <button
                    onClick={() => setAiEnabled(v => !v)}
                    className={cn(
                        "relative h-6 w-11 rounded-full transition-colors duration-200",
                        aiEnabled ? "bg-primary" : "bg-muted"
                    )}
                >
                    <span className={cn(
                        "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-200",
                        aiEnabled ? "left-5" : "left-0.5"
                    )} />
                </button>
            </div>

            {/* Sort pills */}
            <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1">
                {([
                    { key: 'distance', label: 'Closest', icon: <SortDesc className="h-3 w-3" /> },
                    { key: 'urgency', label: 'Urgent', icon: <Zap className="h-3 w-3" /> },
                    { key: 'match', label: 'Best Match', icon: <BrainCircuit className="h-3 w-3" /> },
                ] as const).map(s => (
                    <button
                        key={s.key}
                        onClick={() => setSort(s.key)}
                        className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all",
                            sort === s.key
                                ? "bg-primary text-primary-foreground"
                                : "bg-card border border-border text-muted-foreground hover:border-primary/50"
                        )}
                    >
                        {s.icon}{s.label}
                    </button>
                ))}
            </div>

            {/* Food filter pills */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
                {FOOD_FILTERS.map(f => (
                    <button
                        key={f.key}
                        onClick={() => setFoodFilter(f.key)}
                        className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all",
                            foodFilter === f.key
                                ? "bg-primary/20 text-primary border border-primary/40"
                                : "bg-card border border-border text-muted-foreground hover:border-primary/40"
                        )}
                    >
                        <span>{f.emoji}</span>{f.label}
                    </button>
                ))}
            </div>

            {/* Results header */}
            {aiEnabled && (
                <div className="mb-4">
                    <span className="text-xs font-bold text-primary">
                        ✦ Recommended Listings — {available.length} found · AI Relevance Ranked
                    </span>
                </div>
            )}

            {/* Cards */}
            {available.length > 0 ? (
                <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {available.map(donation => (
                        <DonationCard key={donation.id} donation={donation} role="ngo" />
                    ))}
                </div>
            ) : (
                <div className="rounded-2xl border border-dashed border-border p-14 text-center">
                    <BrainCircuit className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="font-semibold text-foreground">No matches found</p>
                    <p className="text-sm text-muted-foreground mt-1">Try changing your filters above</p>
                </div>
            )}
        </div>
    );
}
