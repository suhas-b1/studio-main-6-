
'use client';

import { useMemo } from 'react';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useUser, useFirestore } from '@/firebase';
import { useDoc } from '@/firebase/firestore/use-doc';
import { User, UserAddress } from '@/lib/types';
import { updateDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

export function useUserProfile() {
    const { user } = useUser();
    const firestore = useFirestore();

    const userDocRef = useMemo(() => {
        if (!user) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);

    const { data: profile, isLoading, error } = useDoc<User>(userDocRef);

    const addAddress = async (address: Omit<UserAddress, 'id'>) => {
        if (!userDocRef) return;
        const id = Math.random().toString(36).substring(2, 9);
        const newAddress: UserAddress = { ...address, id };

        // If it's the first address or set as default, handle default logic
        const currentAddresses = profile?.addresses || [];
        const shouldBeDefault = address.isDefault || currentAddresses.length === 0;

        const updatedAddresses = shouldBeDefault
            ? currentAddresses.map(a => ({ ...a, isDefault: false })).concat({ ...newAddress, isDefault: true })
            : currentAddresses.concat(newAddress);

        if (user) {
            setDocumentNonBlocking(userDocRef, {
                id: user.uid,
                addresses: updatedAddresses
            }, { merge: true });
        }
    };

    const deleteAddress = async (id: string) => {
        if (!user || !userDocRef || !profile) return;
        const updatedAddresses = (profile.addresses || []).filter(a => a.id !== id);
        setDocumentNonBlocking(userDocRef, {
            id: user.uid,
            addresses: updatedAddresses
        }, { merge: true });
    };

    const setDefaultAddress = async (id: string) => {
        if (!user || !userDocRef || !profile) return;
        const updatedAddresses = (profile.addresses || []).map(a => ({
            ...a,
            isDefault: a.id === id,
        }));
        setDocumentNonBlocking(userDocRef, {
            id: user.uid,
            addresses: updatedAddresses
        }, { merge: true });
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
