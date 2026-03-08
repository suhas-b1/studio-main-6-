// src/lib/session-tracker.ts
// Writes/reads login sessions to/from Supabase so "Where Am I Logged In" shows real data.
import { supabase } from './supabase';

export interface DeviceSession {
    id: string;           // session ID (stored in localStorage per browser)
    userId: string;
    device: string;       // "Desktop", "Mobile", "Tablet"
    browser: string;      // "Chrome", "Firefox", etc.
    os: string;           // "Windows", "macOS", "Android", "iOS"
    location: string;     // country/city (approximate from timezone)
    lastActive: string;   // ISO string
    icon: 'phone' | 'laptop' | 'desktop';
    isCurrent?: boolean;
}

function getBrowserInfo() {
    const ua = navigator.userAgent;
    const browser =
        /Edg/i.test(ua) ? 'Edge' :
            /Chrome/i.test(ua) ? 'Chrome' :
                /Firefox/i.test(ua) ? 'Firefox' :
                    /Safari/i.test(ua) ? 'Safari' :
                        /Opera/i.test(ua) ? 'Opera' : 'Browser';

    const isMobile = /Mobile|Android/i.test(ua);
    const isTablet = /Tablet|iPad/i.test(ua);

    const os =
        /Windows/i.test(ua) ? 'Windows' :
            /Mac OS X/i.test(ua) ? 'macOS' :
                /Android/i.test(ua) ? 'Android' :
                    /iPhone|iPad/i.test(ua) ? 'iOS' :
                        /Linux/i.test(ua) ? 'Linux' : 'Unknown OS';

    const device = isTablet ? 'Tablet' : isMobile ? 'Mobile' : 'Desktop / Laptop';
    const icon: DeviceSession['icon'] = isMobile || isTablet ? 'phone' : 'laptop';

    // Infer approximate location from timezone
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const location =
        tz.includes('Kolkata') || tz.includes('India') ? '🇮🇳 India' :
            tz.includes('London') ? '🇬🇧 United Kingdom' :
                tz.includes('New_York') ? '🇺🇸 United States' :
                    tz.includes('Tokyo') ? '🇯🇵 Japan' :
                        tz.includes('Sydney') ? '🇦🇺 Australia' :
                            tz.includes('Dubai') ? '🇦🇪 UAE' :
                                tz.includes('Paris') ? '🇫🇷 France' : `🌍 ${tz.split('/')[1]?.replace('_', ' ') || 'Unknown'}`;

    return { browser, device, os, icon, location };
}

/** Get or create a stable session ID for this browser tab/window */
function getOrCreateSessionId(): string {
    let id = localStorage.getItem('nc-session-id');
    if (!id) {
        id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        localStorage.setItem('nc-session-id', id);
    }
    return id;
}

/** Called when user logs in — registers this device in Supabase */
export async function registerSession(userId: string) {
    try {
        const sessionId = getOrCreateSessionId();
        const info = getBrowserInfo();

        const { error } = await supabase
            .from('sessions')
            .upsert({
                id: sessionId,
                user_id: userId,
                ...info,
                last_active: new Date().toISOString(),
                created_at: new Date().toISOString(),
            });

        if (error) throw error;
    } catch (e) {
        console.warn('Session register failed:', e);
    }
}

/** Fetch all sessions for a user from Supabase */
export async function getUserSessions(userId: string): Promise<DeviceSession[]> {
    try {
        const { data, error } = await supabase
            .from('sessions')
            .select('*')
            .eq('user_id', userId);

        if (error) throw error;

        const currentId = getOrCreateSessionId();

        return (data || []).map(d => ({
            id: d.id,
            userId: d.user_id,
            device: d.device || 'Unknown Device',
            browser: d.browser || 'Browser',
            os: d.os || '',
            location: d.location || 'Unknown',
            lastActive: d.last_active,
            icon: d.icon || 'desktop',
            isCurrent: d.id === currentId,
        })).sort((a, b) => (a.isCurrent ? -1 : b.isCurrent ? 1 : 0));
    } catch (e) {
        console.warn('Fetch sessions failed:', e);
        return [];
    }
}

/** Remove a specific session from Supabase */
export async function revokeSession(sessionId: string) {
    try {
        const { error } = await supabase
            .from('sessions')
            .delete()
            .eq('id', sessionId);

        if (error) throw error;
    } catch (e) {
        console.warn('Revoke session failed:', e);
    }
}

/** Format relative time for display */
export function formatSessionTime(isoString: string): string {
    const diff = Date.now() - new Date(isoString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 2) return 'Just now';
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
}
