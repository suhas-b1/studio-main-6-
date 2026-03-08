'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { translations, type Language, type TranslationKey } from '@/lib/translations';

export type Theme = 'light' | 'dark' | 'system';
export type Accent = 'orange' | 'blue' | 'emerald' | 'purple';

interface SettingsContextValue {
    theme: Theme;
    setTheme: (t: Theme) => void;
    accent: Accent;
    setAccent: (a: Accent) => void;
    language: Language;
    setLanguage: (l: Language) => void;
    t: (key: TranslationKey) => string;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

const ACCENT_VARS: Record<Accent, Record<string, string>> = {
    orange: { '--primary': '26 95% 53%', '--ring': '26 95% 53%', '--accent': '26 95% 53%' },
    blue: { '--primary': '217 91% 60%', '--ring': '217 91% 60%', '--accent': '217 91% 60%' },
    emerald: { '--primary': '160 84% 39%', '--ring': '160 84% 39%', '--accent': '160 84% 39%' },
    purple: { '--primary': '271 81% 56%', '--ring': '271 81% 56%', '--accent': '271 81% 56%' },
};

function applyTheme(theme: Theme) {
    const root = document.documentElement;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = theme === 'dark' || (theme === 'system' && prefersDark);
    root.classList.toggle('dark', isDark);
    root.classList.toggle('light', !isDark);
}

function applyAccent(accent: Accent) {
    const root = document.documentElement;
    const vars = ACCENT_VARS[accent];
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('dark');
    const [accent, setAccentState] = useState<Accent>('orange');
    const [language, setLanguageState] = useState<Language>('en');

    // Load from localStorage on mount
    useEffect(() => {
        const savedTheme = (localStorage.getItem('nc-theme') as Theme) || 'dark';
        const savedAccent = (localStorage.getItem('nc-accent') as Accent) || 'orange';
        const savedLang = (localStorage.getItem('nc-language') as Language) || 'en';
        setThemeState(savedTheme);
        setAccentState(savedAccent);
        setLanguageState(savedLang);
        applyTheme(savedTheme);
        applyAccent(savedAccent);
    }, []);

    // Listen for system theme changes
    useEffect(() => {
        if (theme !== 'system') return;
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = () => applyTheme('system');
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, [theme]);

    const setTheme = useCallback((t: Theme) => {
        setThemeState(t);
        localStorage.setItem('nc-theme', t);
        applyTheme(t);
    }, []);

    const setAccent = useCallback((a: Accent) => {
        setAccentState(a);
        localStorage.setItem('nc-accent', a);
        applyAccent(a);
    }, []);

    const setLanguage = useCallback((l: Language) => {
        setLanguageState(l);
        localStorage.setItem('nc-language', l);
    }, []);

    const t = useCallback((key: TranslationKey): string => {
        return translations[language]?.[key] ?? translations['en'][key] ?? key;
    }, [language]);

    return (
        <SettingsContext.Provider value={{ theme, setTheme, accent, setAccent, language, setLanguage, t }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const ctx = useContext(SettingsContext);
    if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
    return ctx;
}
