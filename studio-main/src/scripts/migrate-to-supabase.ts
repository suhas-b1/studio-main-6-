// src/scripts/migrate-to-supabase.ts
// This script helps migrate existing Firestore data to Supabase.
// Run this once after you've set your environment variables and created the tables.

import { initializeFirebase } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { supabase } from '../lib/supabase';

const { firestore: db } = initializeFirebase();

async function migrateProfiles() {
    console.log('🔄 Migrating profiles...');
    const usersCol = collection(db, 'users');
    const snapshot = await getDocs(usersCol);

    for (const doc of snapshot.docs) {
        const data = doc.data();
        const { error } = await supabase
            .from('profiles')
            .upsert({
                id: doc.id,
                name: data.name || '',
                email: data.email || '',
                role: data.role || 'donor',
                organization_name: data.organizationName || null,
                phone: data.phone || null,
                addresses: data.addresses || [],
                is_verified: data.isVerified || false,
                avatar_url: data.avatarUrl || null,
            });

        if (error) console.error(`❌ Error migrating profile ${doc.id}:`, error.message);
    }
    console.log('✅ Profiles migration finished.');
}

// Add more migration functions for donations, orders, etc. if they exist in Firestore.

export async function runMigration() {
    await migrateProfiles();
    // await migrateDonations();
}
