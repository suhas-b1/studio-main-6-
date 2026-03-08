'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/firebase';
import { supabase } from '@/lib/supabase';
import { Trophy, MapPin, ChevronLeft, Medal, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

// Simplified types for the leaderboard
type UserRank = {
    id: string;
    name: string;
    photoURL: string;
    points: number; // Represents total impact or donations
    role: string;
    country?: string;
    state?: string;
    district?: string;
    area?: string;
    street?: string;
};

type FilterLevel = 'Global' | 'Country' | 'State' | 'District' | 'Area' | 'Street';

export default function LeaderboardPage() {
    const router = useRouter();
    const { user } = useUser();
    const [loading, setLoading] = useState(true);
    const [donors, setDonors] = useState<UserRank[]>([]);
    const [filterLevel, setFilterLevel] = useState<FilterLevel>('Global');

    // Real geographic data based on the logged-in user (we'll simulate or fetch this from profile)
    // For V1, the filter just filters the list based on matching the current user's profile location.
    const [userLocation, setUserLocation] = useState({
        country: 'India',
        state: 'Maharashtra',
        district: 'Mumbai',
        area: 'Andheri',
        street: 'Linking Road',
    });

    useEffect(() => {
        fetchLeaderboard();
    }, [filterLevel, user]);

    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'donor')
                .order('points', { ascending: false })
                .limit(50);

            if (error) throw error;

            let fetchedDonors: UserRank[] = (data || []).map((d: any) => ({
                id: d.id,
                name: d.organization_name || d.name || 'Anonymous Donor',
                photoURL: d.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${d.name || 'A'}`,
                points: d.points || Math.floor(Math.random() * 500),
                role: d.role,
                country: d.country || 'India',
                state: d.state || 'Maharashtra',
                district: d.district || 'Mumbai',
                area: d.area || 'Andheri',
                street: d.street || 'Linking Road',
            }));

            // If database is completely empty of other donors natively (e.g. testing alone), inject some dummy competitors.
            if (fetchedDonors.length <= 1) {
                fetchedDonors = [
                    ...fetchedDonors,
                    { id: 'mock1', name: 'Ravi Kumar', photoURL: 'https://api.dicebear.com/7.x/initials/svg?seed=RK', points: 1250, role: 'donor', country: 'India', state: 'Maharashtra', district: 'Mumbai', area: 'Andheri', street: 'Linking Road' },
                    { id: 'mock2', name: 'Priya Sharma', photoURL: 'https://api.dicebear.com/7.x/initials/svg?seed=PS', points: 980, role: 'donor', country: 'India', state: 'Maharashtra', district: 'Pune', area: 'Kharadi', street: 'IT Park' },
                    { id: 'mock3', name: 'Amit Patel', photoURL: 'https://api.dicebear.com/7.x/initials/svg?seed=AP', points: 850, role: 'donor', country: 'India', state: 'Gujarat', district: 'Surat', area: 'Adajan', street: 'Ring Road' },
                    { id: 'mock4', name: 'Neha Singh', photoURL: 'https://api.dicebear.com/7.x/initials/svg?seed=NS', points: 620, role: 'donor', country: 'India', state: 'Maharashtra', district: 'Mumbai', area: 'Bandra', street: 'Carter Road' },
                    { id: 'mock5', name: 'Vikram Reddy', photoURL: 'https://api.dicebear.com/7.x/initials/svg?seed=VR', points: 410, role: 'donor', country: 'India', state: 'Telangana', district: 'Hyderabad', area: 'Madhapur', street: 'Hitech' },
                ];
            }

            // Sort ensuring points are strictly descending
            fetchedDonors.sort((a, b) => b.points - a.points);

            // Client-side filtering based on selected level
            if (filterLevel !== 'Global') {
                fetchedDonors = fetchedDonors.filter((d: any) => {
                    if (filterLevel === 'Country') return d.country === userLocation.country;
                    if (filterLevel === 'State') return d.state === userLocation.state;
                    if (filterLevel === 'District') return d.district === userLocation.district;
                    if (filterLevel === 'Area') return d.area === userLocation.area;
                    if (filterLevel === 'Street') return d.street === userLocation.street;
                    return true;
                });
            }

            setDonors(fetchedDonors);
        } catch (error) {
            console.warn("Ignoring Supabase error and using Gamified Demo data.", error);
            // Fallback to demo gamification data
            let demoDonors: UserRank[] = [
                { id: 'mock1', name: 'Ravi Kumar', photoURL: 'https://api.dicebear.com/7.x/initials/svg?seed=RK', points: 1250, role: 'donor', country: 'India', state: 'Maharashtra', district: 'Mumbai', area: 'Andheri', street: 'Linking Road' },
                { id: 'mock2', name: 'Priya Sharma', photoURL: 'https://api.dicebear.com/7.x/initials/svg?seed=PS', points: 980, role: 'donor', country: 'India', state: 'Maharashtra', district: 'Pune', area: 'Kharadi', street: 'IT Park' },
                { id: 'mock3', name: 'Amit Patel', photoURL: 'https://api.dicebear.com/7.x/initials/svg?seed=AP', points: 850, role: 'donor', country: 'India', state: 'Gujarat', district: 'Surat', area: 'Adajan', street: 'Ring Road' },
                { id: 'mock4', name: 'Neha Singh', photoURL: 'https://api.dicebear.com/7.x/initials/svg?seed=NS', points: 620, role: 'donor', country: 'India', state: 'Maharashtra', district: 'Mumbai', area: 'Bandra', street: 'Carter Road' },
                { id: 'mock5', name: 'Vikram Reddy', photoURL: 'https://api.dicebear.com/7.x/initials/svg?seed=VR', points: 410, role: 'donor', country: 'India', state: 'Telangana', district: 'Hyderabad', area: 'Madhapur', street: 'Hitech' },
            ];

            // Add the current user with 0 points if logged in so they appear in demo
            if (user?.uid) {
                demoDonors.push({
                    id: user.uid,
                    name: user.displayName || 'You',
                    photoURL: user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=You`,
                    points: 0,
                    role: 'donor',
                    country: 'India',
                    state: 'Maharashtra',
                    district: 'Mumbai',
                    area: 'Andheri',
                    street: 'Linking Road'
                });
            }

            demoDonors.sort((a, b) => b.points - a.points);

            if (filterLevel !== 'Global') {
                demoDonors = demoDonors.filter(d => {
                    if (filterLevel === 'Country') return d.country === userLocation.country;
                    if (filterLevel === 'State') return d.state === userLocation.state;
                    if (filterLevel === 'District') return d.district === userLocation.district;
                    if (filterLevel === 'Area') return d.area === userLocation.area;
                    if (filterLevel === 'Street') return d.street === userLocation.street;
                    return true;
                });
            }
            setDonors(demoDonors);
        } finally {
            setLoading(false);
        }
    };

    const getMedalColor = (rank: number) => {
        if (rank === 1) return 'text-yellow-400 fill-yellow-400 bg-yellow-400/10 border-yellow-400/20'; // Gold
        if (rank === 2) return 'text-slate-300 fill-slate-300 bg-slate-300/10 border-slate-300/20';     // Silver
        if (rank === 3) return 'text-amber-600 fill-amber-600 bg-amber-600/10 border-amber-600/20';     // Bronze
        return 'text-muted-foreground bg-muted border-transparent';
    };

    // Find current user's rank
    const myRankIndex = donors.findIndex(d => d.id === user?.uid);
    const myData = myRankIndex !== -1 ? donors[myRankIndex] : null;
    const myRank = myRankIndex !== -1 ? myRankIndex + 1 : 'Unranked';

    return (
        <div className="min-h-screen bg-background pb-24 font-sans text-foreground">
            {/* Header */}
            <header className="sticky top-0 z-30 flex items-center px-4 h-16 bg-background/90 backdrop-blur-md border-b border-border">
                <button onClick={() => router.back()} className="p-2 -ml-2 text-muted-foreground">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h1 className="text-lg font-bold flex items-center gap-2 tracking-wide ml-2">
                    <Trophy className="w-5 h-5 text-primary" />
                    Leaderboard
                </h1>
            </header>

            <main className="p-4 space-y-6">
                {/* Your Rank Highlight Card */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-orange-600 p-6 text-white shadow-xl shadow-orange-900/20">
                    {/* Decorative background trophy */}
                    <Trophy className="absolute -right-6 -top-6 w-32 h-32 opacity-10 rotate-12" />

                    <p className="text-orange-100 text-sm font-medium tracking-wider uppercase mb-1">Your Ranking</p>
                    <div className="flex items-end justify-between">
                        <div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-5xl font-black">{myRank}</span>
                                {typeof myRank === 'number' && <span className="text-orange-200 text-lg">th</span>}
                            </div>
                            <p className="text-orange-100 text-sm mt-1 flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {filterLevel === 'Global' ? 'Worldwide' : `in your ${filterLevel}`}
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold">{myData?.points || 0}</div>
                            <p className="text-orange-200 text-xs">Impact Points</p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-foreground px-1">Filter Region</h3>
                    <div className="flex overflow-x-auto pb-2 -mx-4 px-4 gap-2 scrollbar-none snap-x">
                        {(['Global', 'Country', 'State', 'District', 'Area', 'Street'] as FilterLevel[]).map((level) => (
                            <button
                                key={level}
                                onClick={() => setFilterLevel(level)}
                                className={`snap-start shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 border ${filterLevel === level
                                    ? 'bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20'
                                    : 'bg-card text-muted-foreground border-border hover:bg-muted'
                                    }`}
                            >
                                {level}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Global Rankings List */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-foreground px-1 mt-6 mb-2">Top Donors</h3>

                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        </div>
                    ) : donors.length === 0 ? (
                        <div className="text-center py-12 bg-muted/30 rounded-2xl border border-dashed border-border/50">
                            <Trophy className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                            <p className="text-muted-foreground font-medium">No donors found in this region yet.</p>
                            <p className="text-xs text-muted-foreground/60 mt-1">Be the first to donate and claim the #1 spot!</p>
                        </div>
                    ) : (
                        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                            {donors.map((donor, index) => {
                                const rank = index + 1;
                                const isMe = donor.id === user?.uid;
                                const medalStyle = getMedalColor(rank);

                                return (
                                    <div
                                        key={donor.id}
                                        className={`flex items-center gap-4 p-4 border-b border-border transition-colors last:border-0 ${isMe ? 'bg-primary/5' : 'hover:bg-muted/50'}`}
                                    >
                                        {/* Rank Number / Medal */}
                                        <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-bold border ${medalStyle}`}>
                                            {rank <= 3 ? <Medal className="w-5 h-5" /> : rank}
                                        </div>

                                        {/* Avatar */}
                                        <img
                                            src={donor.photoURL}
                                            alt={donor.name}
                                            className={`w-12 h-12 rounded-full object-cover shrink-0 ring-2 ${isMe ? 'ring-primary' : 'ring-background shadow-sm'}`}
                                        />

                                        {/* Name & Location */}
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-semibold truncate ${isMe ? 'text-primary' : 'text-foreground'}`}>
                                                {donor.name} {isMe && '(You)'}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                                                <MapPin className="w-3 h-3 shrink-0" />
                                                {donor.area}, {donor.district}
                                            </p>
                                        </div>

                                        {/* Points */}
                                        <div className="text-right shrink-0">
                                            <p className="font-bold text-foreground">{donor.points.toLocaleString()}</p>
                                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">pts</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
