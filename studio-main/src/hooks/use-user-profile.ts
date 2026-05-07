
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
                    console.log('Profile not found in Supabase.');
                } else {
                    throw error;
                }
            }

            // Fallback logic to grab legacy address
            const getInitialAddresses = async (loadedProfileData?: any): Promise<UserAddress[]> => {
                if (loadedProfileData?.addresses?.length > 0) return loadedProfileData.addresses;
                
                // If they have no addresses array, try to find a legacy address
                const { mockUsers } = await import('@/lib/mock-data');
                const mockUser = mockUsers.find(u => u.id === user.uid || u.email === user.email);
                
                const legacyAddressStr = loadedProfileData?.address || mockUser?.address || (user as any)?.address;
                
                if (legacyAddressStr) {
                    return [{
                        id: 'legacy-address-1',
                        label: 'Primary Address',
                        name: loadedProfileData?.name || mockUser?.name || user.displayName || 'Default',
                        phone: loadedProfileData?.phone || mockUser?.phone || '',
                        fullAddress: legacyAddressStr,
                        isDefault: true
                    }];
                }
                return [];
            };

            if (data) {
                const addresses = await getInitialAddresses(data);
                setProfile({ ...(data as unknown as User), addresses });
            } else {
                const addresses = await getInitialAddresses();
                setProfile({ id: user.uid, email: user.email || '', role: 'ngo', name: user.displayName || 'Demo User', addresses } as any);
            }
        } catch (err: any) {
            console.error('Error fetching profile from Supabase (falling back to mock):', err);
            
            const { mockUsers } = await import('@/lib/mock-data');
            const mockUser = mockUsers.find(u => u.id === user.uid || u.email === user.email);
            const legacyAddressStr = mockUser?.address || (user as any)?.address;
            
            const addresses: UserAddress[] = legacyAddressStr ? [{
                id: 'legacy-address-1',
                label: 'Primary Address',
                name: mockUser?.name || user.displayName || 'Default',
                phone: mockUser?.phone || '',
                fullAddress: legacyAddressStr,
                isDefault: true
            }] : [];

            setProfile({ id: user.uid, email: user.email || '', role: 'ngo', name: user.displayName || 'Demo User', addresses } as any);
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
