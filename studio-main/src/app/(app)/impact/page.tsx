
'use client';
import { HandHeart, HeartPulse, Leaf, Truck, TrendingUp } from "lucide-react";
import { impactStats } from "@/lib/mock-data";
import { ImpactChart } from "@/components/impact/impact-chart";

const BAR_DATA = [
    { month: 'Sep', meals: 820 },
    { month: 'Oct', meals: 940 },
    { month: 'Nov', meals: 760 },
    { month: 'Dec', meals: 1080 },
    { month: 'Jan', meals: 1020 },
    { month: 'Feb', meals: 1150 },
    { month: 'Mar', meals: 1240 },
];
const MAX = Math.max(...BAR_DATA.map(d => d.meals));

export default function ImpactPage() {
    return (
        <div className="container mx-auto py-8 px-4 md:px-6 max-w-4xl animate-slide-up">
            <div className="mb-6">
                <h1 className="text-2xl font-black text-foreground">Your Impact</h1>
                <p className="text-sm text-muted-foreground mt-1">See the difference your generosity is making.</p>
            </div>

            {/* Hero stat */}
            <div className="rounded-2xl border border-border bg-card p-6 mb-5 relative overflow-hidden">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Meals Provided</p>
                        <div className="text-5xl font-black text-foreground">{impactStats.mealsProvided.toLocaleString()}</div>
                        <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-emerald-400">
                            <TrendingUp className="h-3 w-3" /> +12% from last month
                        </div>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">Weekly</div>
                </div>

                {/* Bar chart */}
                <div className="flex items-end gap-2 h-20">
                    {BAR_DATA.map((d, i) => (
                        <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                            <div
                                className="w-full rounded-t animate-bar-grow"
                                style={{
                                    height: `${(d.meals / MAX) * 72}px`,
                                    background: i === BAR_DATA.length - 1 ? '#f97316' : `rgba(249,115,22,${0.2 + i * 0.1})`,
                                    animationDelay: `${i * 70}ms`,
                                }}
                            />
                            <span className="text-[9px] text-muted-foreground">{d.month}</span>
                        </div>
                    ))}
                </div>

                <div className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full bg-primary/5 blur-2xl pointer-events-none" />
            </div>

            {/* Stat tiles */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="rounded-2xl border border-border bg-card p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="h-8 w-8 rounded-lg bg-orange-500/15 flex items-center justify-center">
                            <HeartPulse className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">KG Saved</span>
                    </div>
                    <div className="text-3xl font-bold text-foreground">{impactStats.foodSavedKg} kg</div>
                    <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: '68%' }} />
                    </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="h-8 w-8 rounded-lg bg-blue-500/15 flex items-center justify-center">
                            <Leaf className="h-4 w-4 text-blue-400" />
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">CO₂ Reduced</span>
                    </div>
                    <div className="text-3xl font-bold text-foreground">{impactStats.co2ReducedTons} t</div>
                    <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: '45%' }} />
                    </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="h-8 w-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                            <HandHeart className="h-4 w-4 text-emerald-400" />
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Lives Impacted</span>
                    </div>
                    <div className="text-3xl font-bold text-foreground">850</div>
                    <div className="text-xs text-emerald-400 mt-1 font-semibold">+8% increase</div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="h-8 w-8 rounded-lg bg-violet-500/15 flex items-center justify-center">
                            <Truck className="h-4 w-4 text-violet-400" />
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Donations Made</span>
                    </div>
                    <div className="text-3xl font-bold text-foreground">{impactStats.donationsMade}</div>
                    <div className="text-xs text-muted-foreground mt-1">All time</div>
                </div>
            </div>

            {/* Existing chart component */}
            <ImpactChart />
        </div>
    );
}
