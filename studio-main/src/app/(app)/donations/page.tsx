
'use client';
import { use, useState } from 'react';
import { DonationCard } from "@/components/donations/donation-card";
import { UserRole } from "@/lib/types";
import { Search, SlidersHorizontal } from "lucide-react";
import { useUser } from '@/firebase';
import { useDonations } from '@/context/donations-context';
import { cn } from '@/lib/utils';

const TYPE_FILTERS = ['All', 'Produce', 'Prepared Meal', 'Baked Goods', 'Dairy', 'Pantry', 'Canned Goods'];

export default function DonationsPage({ searchParams }: { searchParams: Promise<{ role?: UserRole }> }) {
  const role = use(searchParams)?.role || 'ngo';
  const { user } = useUser();
  const { donations } = useDonations();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  const title = role === 'donor' ? 'My Donations' : 'Available Food Donations';
  const description = role === 'donor'
    ? 'Track all your past and current food listings.'
    : 'Browse and claim surplus food from generous donors.';

  let list = role === 'donor'
    ? donations.filter(d => d.donorId === user?.uid)
    : donations.filter(d => d.status === 'available');

  if (search) list = list.filter(d => d.title.toLowerCase().includes(search.toLowerCase()) || d.description.toLowerCase().includes(search.toLowerCase()));
  if (typeFilter !== 'All') list = list.filter(d => d.type === typeFilter);

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 max-w-7xl animate-slide-up">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>

      {/* Search bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, description..."
          className="w-full rounded-xl bg-card border border-border pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
        />
      </div>

      {/* Type filter pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6">
        {TYPE_FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setTypeFilter(f)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-all",
              typeFilter === f
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border text-muted-foreground hover:border-primary/50"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-xs text-muted-foreground mb-4 font-medium">{list.length} listing{list.length !== 1 ? 's' : ''} found</p>

      {/* Grid */}
      <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {list.map(donation => (
          <DonationCard key={donation.id} donation={donation} role={role} />
        ))}
      </div>

      {list.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-14 text-center mt-8">
          <Search className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-semibold text-foreground">No listings found</p>
          <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
}
