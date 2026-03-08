
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    LayoutDashboard,
    Package,
    PlusCircle,
    HeartHandshake,
    BrainCircuit,
    Settings,
    LifeBuoy,
    MessageSquare,
    ChevronDown,
    Building,
    Utensils,
    PackageSearch,
    Map,
} from 'lucide-react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from '@/components/ui/sidebar';
import type { UserRole } from '@/lib/types';
import { cn } from '@/lib/utils';
import React from 'react';


const commonLinks = [
    { href: '/settings', label: 'Settings', icon: Settings },
    { href: '/help', label: 'Help', icon: LifeBuoy },
    { href: '/feedback', label: 'Feedback', icon: MessageSquare },
];

export function SidebarNav({ role }: { role: UserRole }) {
    const pathname = usePathname();

    const getHref = (href: string) => {
        return `${href}?role=${role}`;
    }

    const isDonorSectionActive = ['/donations/new', '/donations', '/donor-hotspot-map'].some(p => pathname.startsWith(p)) && role === 'donor';
    const isNgoSectionActive = ['/matches', '/claims', '/food-aid-map'].some(p => pathname.startsWith(p)) && role === 'ngo';

    return (
        <>
            <SidebarMenu>
                <SidebarMenuItem>
                    <Link href={getHref('/dashboard')} prefetch={true}>
                        <SidebarMenuButton
                            isActive={pathname === '/dashboard'}
                            tooltip={'Dashboard'}
                        >
                            <LayoutDashboard />
                            <span>Dashboard</span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
            </SidebarMenu>

            <Collapsible defaultOpen={isDonorSectionActive}>
                <CollapsibleTrigger asChild>
                    <button className="w-full justify-start px-3 h-9 text-sm flex items-center rounded-lg bg-sidebar-accent/60 hover:bg-sidebar-accent text-sidebar-foreground font-semibold transition-colors">
                        <Utensils className="h-5 w-5 mr-2" />
                        <span className="flex-1 text-left">Donor</span>
                        <ChevronDown className="h-4 w-4 transition-transform [&[data-state=open]]:-rotate-180" />
                    </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <SidebarMenu className="py-2 pl-6">
                        <SidebarMenuItem>
                            <Link href={getHref('/donations/new')} prefetch={true}>
                                <SidebarMenuButton size="sm" isActive={pathname === '/donations/new'} className="w-full justify-start">
                                    <PlusCircle />
                                    <span>New Donation</span>
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <Link href={getHref('/donations')} prefetch={true}>
                                <SidebarMenuButton size="sm" isActive={pathname === '/donations' && role === 'donor'} className="w-full justify-start">
                                    <Package />
                                    <span>My Donations</span>
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <Link href={getHref('/donor-hotspot-map')} prefetch={true}>
                                <SidebarMenuButton size="sm" isActive={pathname === '/donor-hotspot-map'} className="w-full justify-start">
                                    <Map />
                                    <span>Food Need Hotspots</span>
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>

                    </SidebarMenu>
                </CollapsibleContent>
            </Collapsible>

            <Collapsible defaultOpen={isNgoSectionActive}>
                <CollapsibleTrigger asChild>
                    <button className="w-full justify-start px-3 h-9 text-sm flex items-center rounded-lg bg-sidebar-accent/60 hover:bg-sidebar-accent text-sidebar-foreground font-semibold transition-colors">
                        <Building className="h-5 w-5 mr-2" />
                        <span className="flex-1 text-left">Receiver</span>
                        <ChevronDown className="h-4 w-4 transition-transform [&[data-state=open]]:-rotate-180" />
                    </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <SidebarMenu className="py-2 pl-6">
                        <SidebarMenuItem>
                            <Link href={getHref('/food-aid-map')} prefetch={true}>
                                <SidebarMenuButton size="sm" isActive={pathname === '/food-aid-map'} className="w-full justify-start">
                                    <Map />
                                    <span>Food Aid Map</span>
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <Link href={getHref('/matches')} prefetch={true}>
                                <SidebarMenuButton size="sm" isActive={pathname === '/matches'} className="w-full justify-start">
                                    <BrainCircuit />
                                    <span>Smart Matches</span>
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <Link href={getHref('/claims')} prefetch={true}>
                                <SidebarMenuButton size="sm" isActive={pathname === '/claims' && role === 'ngo'} className="w-full justify-start">
                                    <HeartHandshake />
                                    <span>My Claims</span>
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </CollapsibleContent>
            </Collapsible>

            <SidebarMenu className="mt-auto">
                {commonLinks.map((link) => (
                    <SidebarMenuItem key={link.href}>
                        <Link href={`${link.href}?role=${role}`} prefetch={true}>
                            <SidebarMenuButton
                                isActive={pathname === link.href}
                                tooltip={link.label}
                            >
                                <link.icon />
                                <span>{link.label}</span>
                            </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </>
    );
}
