
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import type { Donation } from '@/lib/types';
import { supabase } from '@/lib/supabase';

interface DonationsContextType {
  donations: Donation[];
  addDonation: (donation: Donation) => void;
  claimDonation: (donationId: string, ngoId: string) => void;
}

const DonationsContext = createContext<DonationsContextType | undefined>(undefined);

export const DonationsProvider = ({ children }: { children: ReactNode }) => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDonations = useCallback(async () => {
    try {
      // Try to fetch from Supabase first
      const { data, error } = await supabase
        .from('donations')
        .select(`*, profiles:donor_id (*)`)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        const mappedData = data.map((d: any) => ({
          id: d.id,
          title: d.title,
          description: d.description,
          imageUrl: d.image_url,
          imageHint: d.image_hint,
          quantity: d.quantity,
          type: d.type,
          pickupDeadline: new Date(d.pickup_deadline),
          location: d.location || '',
          donorId: d.donor_id,
          donor: d.profiles ? {
            id: d.profiles.id,
            name: d.profiles.name,
            email: d.profiles.email,
            avatarUrl: d.profiles.avatar_url,
            role: d.profiles.role,
            organizationName: d.profiles.organization_name,
            isVerified: d.profiles.is_verified,
            phone: d.profiles.phone,
          } : null,
          status: d.status,
          claimedByNgoId: d.claimed_by_ngo_id,
          createdAt: new Date(d.created_at),
          distance: d.distance
        }));

        setDonations(mappedData as unknown as Donation[]);
      }
    } catch (error: any) {
      console.warn('Supabase fetch failed, falling back to mock data. Error:', error?.message || JSON.stringify(error));
      import('@/lib/mock-data').then((module) => {
        setDonations(module.mockDonations);
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);

  const addDonation = async (donation: Donation) => {
    try {
      const dbPayload = {
        title: donation.title,
        description: donation.description,
        image_url: donation.imageUrl,
        image_hint: donation.imageHint,
        quantity: donation.quantity,
        type: donation.type,
        pickup_deadline: donation.pickupDeadline.toISOString(),
        location: donation.location,
        donor_id: donation.donorId,
        status: donation.status,
        distance: donation.distance || 0,
      };

      const { data, error } = await supabase
        .from('donations')
        .insert([dbPayload])
        .select()
        .single();

      if (error) {
        throw error;
      }

      setDonations((prev) => [{ ...donation, id: data.id, createdAt: new Date(data.created_at) }, ...prev]);
    } catch (error) {
      console.error('Error adding donation (falling back to local state):', error);
      // Fallback for presentation: if DB is not connected, just show it in the UI!
      setDonations((prev) => [donation, ...prev]);
    }
  };

  const claimDonation = async (donationId: string, ngoId: string) => {
    try {
      const { error } = await supabase
        .from('donations')
        .update({ status: 'claimed', claimed_by_ngo_id: ngoId })
        .eq('id', donationId);

      if (error) throw error;

      setDonations((prevDonations) =>
        prevDonations.map((d) =>
          d.id === donationId ? { ...d, status: 'claimed' as const, claimedByNgoId: ngoId } : d
        )
      );
    } catch (error) {
      console.error('Error claiming donation (falling back to local state):', error);
      // Fallback for presentation: if DB is not connected, just show it in the UI!
      setDonations((prevDonations) =>
        prevDonations.map((d) =>
          d.id === donationId ? { ...d, status: 'claimed' as const, claimedByNgoId: ngoId } : d
        )
      );
    }
  };

  return (
    <DonationsContext.Provider value={{ donations, addDonation, claimDonation }}>
      {children}
    </DonationsContext.Provider>
  );
};

export const useDonations = () => {
  const context = useContext(DonationsContext);
  if (context === undefined) {
    throw new Error('useDonations must be used within a DonationsProvider');
  }
  return context;
};
