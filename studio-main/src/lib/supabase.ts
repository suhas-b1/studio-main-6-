import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
        console.error('Supabase credentials missing! Please check your .env.local file and restart your dev server.');
    } else {
        console.warn('Supabase credentials missing during server execution.');
    }
}

// Create a real client with fallbacks to guarantee an object is returned and prevent "null" crashes
export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key'
);
