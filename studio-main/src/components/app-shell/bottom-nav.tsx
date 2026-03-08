'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    LayoutDashboard,
    Package,
    PlusCircle,
    Map,
    BrainCircuit,
    HeartHandshake,
    Trophy
} from 'lucide-react';
import type { UserRole } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useSettings } from '@/context/settings-context';

export function BottomNav({ role }: { role: UserRole }) {
    const pathname = usePathname();
    const router = useRouter();
    const { t } = useSettings();

    // Links based on user role
    const donorLinks = [
        { href: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
        { href: '/donations', label: t('listings'), icon: Package },
        { href: '/donations/new', label: t('add'), icon: PlusCircle, isFab: true },
        { href: '/donor-hotspot-map', label: t('map'), icon: Map },
        { href: '/leaderboard', label: 'Rank', icon: Trophy },
    ];

    const receiverLinks = [
        { href: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
        { href: '/food-aid-map', label: t('map'), icon: Map },
        { href: '/matches', label: 'Match', icon: BrainCircuit, isFab: true },
        { href: '/claims', label: 'Orders', icon: HeartHandshake },
        { href: '/leaderboard', label: 'Rank', icon: Trophy },
    ];


    const links = role === 'donor' ? donorLinks : receiverLinks;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0f0700] border-t border-border/40 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-around h-16 px-2">
                {links.map((link) => {
                    const isActive = pathname === link.href || pathname.startsWith(link.href + '/');

                    if (link.isFab) {
                        return (
                            <div key={link.href} className="relative -top-5 flex flex-col items-center">
                                <Link
                                    href={`${link.href}?role=${role}`}
                                    className="flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-br from-primary to-orange-600 shadow-xl shadow-orange-900/50 text-white transform transition-transform active:scale-95 hover:scale-105"
                                >
                                    <link.icon className="h-7 w-7" />
                                </Link>
                                <span className="text-[10px] font-medium text-muted-foreground mt-1 absolute -bottom-4">
                                    {link.label}
                                </span>
                            </div>
                        );
                    }

                    return (
                        <Link
                            key={link.href}
                            href={`${link.href}?role=${role}`}
                            className="flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors group relative"
                        >
                            <div
                                className={cn(
                                    "p-1.5 rounded-xl transition-all duration-300",
                                    isActive ? "bg-primary/20 text-primary" : "text-muted-foreground group-hover:text-foreground"
                                )}
                            >
                                <link.icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            <span
                                className={cn(
                                    "text-[10px] font-medium transition-colors",
                                    isActive ? "text-primary" : "text-muted-foreground"
                                )}
                            >
                                {link.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
