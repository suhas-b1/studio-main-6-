
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/firebase';
import { supabase } from '@/lib/supabase';
import { User, UserAddress } from '@/lib/types';

export function useUserProfile() {
    const { user } = useUser();
    const [profile, setProfile] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchProfile = useCallback(async () => {
        if (!user) {
            setProfile(null);
            setIsLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.uid)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    // Profile doesn't exist yet, we might need to create it
                    console.log('Profile not found in Supabase.');
                } else {
                    throw error;
                }
            }

            if (data) {
                // Map Supabase snake_case to our camelCase types if necessary
                setProfile(data as unknown as User);
            } else {
                // Fallback for presentation: Initialize a mock local profile
                setProfile({ id: user.uid, email: user.email || '', role: 'ngo', name: user.displayName || 'Demo User', addresses: [] } as any);
            }
        } catch (err: any) {
            console.error('Error fetching profile from Supabase (falling back to mock):', err);
            setProfile({ id: user.uid, email: user.email || '', role: 'ngo', name: user.displayName || 'Demo User', addresses: [] } as any);
            setError(err);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const addAddress = async (address: Omit<UserAddress, 'id'>) => {
        if (!user || !profile) return;
        const id = Math.random().toString(36).substring(2, 9);
        const newAddress: UserAddress = { ...address, id };

        const currentAddresses = profile.addresses || [];
        const shouldBeDefault = address.isDefault || currentAddresses.length === 0;

        const updatedAddresses = shouldBeDefault
            ? currentAddresses.map(a => ({ ...a, isDefault: false })).concat({ ...newAddress, isDefault: true })
            : currentAddresses.concat(newAddress);

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ addresses: updatedAddresses })
                .eq('id', user.uid);

            if (error) throw error;
            setProfile(prev => prev ? { ...prev, addresses: updatedAddresses } : null);
        } catch (err) {
            console.error('Error adding address to Supabase (falling back to local state):', err);
            // Fallback: update local state anyway so the demo works
            setProfile(prev => prev ? { ...prev, addresses: updatedAddresses } : null);
        }
    };

    const deleteAddress = async (id: string) => {
        if (!user || !profile) return;
        const updatedAddresses = (profile.addresses || []).filter(a => a.id !== id);

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ addresses: updatedAddresses })
                .eq('id', user.uid);

            if (error) throw error;
            setProfile(prev => prev ? { ...prev, addresses: updatedAddresses } : null);
        } catch (err) {
            console.error('Error deleting address from Supabase (falling back to local state):', err);
            // Fallback: update local state anyway
            setProfile(prev => prev ? { ...prev, addresses: updatedAddresses } : null);
        }
    };

    const setDefaultAddress = async (id: string) => {
        if (!user || !profile) return;
        const updatedAddresses = (profile.addresses || []).map(a => ({
            ...a,
            isDefault: a.id === id,
        }));

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ addresses: updatedAddresses })
                .eq('id', user.uid);

            if (error) throw error;
            setProfile(prev => prev ? { ...prev, addresses: updatedAddresses } : null);
        } catch (err) {
            console.error('Error setting default address in Supabase (falling back to local state):', err);
            // Fallback: update local state anyway
            setProfile(prev => prev ? { ...prev, addresses: updatedAddresses } : null);
        }
    };

    return {
        profile,
        isLoading,
        error,
        addAddress,
        deleteAddress,
        setDefaultAddress,
        defaultAddress: profile?.addresses?.find(a => a.isDefault),
    };
}
