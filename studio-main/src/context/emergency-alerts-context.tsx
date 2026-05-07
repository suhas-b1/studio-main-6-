'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/firebase';

export type AlertPriority = 'high' | 'medium' | 'low';
export type AlertStatus = 'open' | 'escalated' | 'responded' | 'closed';

export interface EmergencyAlert {
  id: string;
  creatorId: string;
  creatorName: string;
  priority: AlertPriority;
  description: string;
  location: string;
  latitude?: number;
  longitude?: number;
  status: AlertStatus;
  responderId?: string;
  createdAt: Date;
  escalatedAt?: Date;
  voiceTranscript?: string;
}

interface EmergencyAlertsContextType {
  alerts: EmergencyAlert[];
  activeAlerts: EmergencyAlert[];
  createAlert: (data: Omit<EmergencyAlert, 'id' | 'creatorId' | 'creatorName' | 'status' | 'createdAt'>) => Promise<boolean>;
  respondToAlert: (alertId: string) => Promise<void>;
  closeAlert: (alertId: string) => Promise<void>;
  isLoading: boolean;
}

const EmergencyAlertsContext = createContext<EmergencyAlertsContextType | undefined>(undefined);

// Rate limiting: max 3 alerts per hour per user (stored in localStorage)
function checkRateLimit(userId: string): boolean {
  const key = `alert_rate_${userId}`;
  const stored = localStorage.getItem(key);
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;

  if (stored) {
    const timestamps: number[] = JSON.parse(stored);
    const recent = timestamps.filter(t => now - t < oneHour);
    if (recent.length >= 3) return false;
    localStorage.setItem(key, JSON.stringify([...recent, now]));
  } else {
    localStorage.setItem(key, JSON.stringify([now]));
  }
  return true;
}

// Fake alert detection: check if identical location submitted recently
function isFakeAlert(location: string, userId: string): boolean {
  const key = `alert_locs_${userId}`;
  const stored = localStorage.getItem(key);
  const now = Date.now();
  const tenMins = 10 * 60 * 1000;

  if (stored) {
    const entries: { loc: string; time: number }[] = JSON.parse(stored);
    const recent = entries.filter(e => now - e.time < tenMins);
    if (recent.some(e => e.loc === location)) return true;
    localStorage.setItem(key, JSON.stringify([...recent, { loc: location, time: now }]));
  } else {
    localStorage.setItem(key, JSON.stringify([{ loc: location, time: now }]));
  }
  return false;
}

// Escalation: auto-escalate alerts older than 10 mins with no response
function autoEscalate(alerts: EmergencyAlert[]): EmergencyAlert[] {
  const now = Date.now();
  const tenMins = 10 * 60 * 1000;
  return alerts.map(a => {
    if (a.status === 'open' && now - new Date(a.createdAt).getTime() > tenMins) {
      return { ...a, status: 'escalated' as AlertStatus, escalatedAt: new Date() };
    }
    return a;
  });
}

export const EmergencyAlertsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAlerts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('emergency_alerts')
        .select('*')
        .neq('status', 'closed')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        const mapped: EmergencyAlert[] = data.map((d: any) => ({
          id: d.id,
          creatorId: d.creator_id,
          creatorName: d.creator_name,
          priority: d.priority,
          description: d.description,
          location: d.location,
          latitude: d.latitude,
          longitude: d.longitude,
          status: d.status,
          responderId: d.responder_id,
          createdAt: new Date(d.created_at),
          escalatedAt: d.escalated_at ? new Date(d.escalated_at) : undefined,
          voiceTranscript: d.voice_transcript,
        }));
        setAlerts(mapped);
      }
    } catch (err) {
      console.warn('Using local alert state (DB unavailable):', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();

    // Supabase Realtime subscription for live updates
    const channel = supabase
      .channel('emergency_alerts_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'emergency_alerts' }, () => {
        fetchAlerts();
      })
      .subscribe();

    // Auto-escalation check every minute
    const escalationInterval = setInterval(() => {
      setAlerts(prev => autoEscalate(prev));
    }, 60000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(escalationInterval);
    };
  }, [fetchAlerts]);

  const createAlert = async (data: Omit<EmergencyAlert, 'id' | 'creatorId' | 'creatorName' | 'status' | 'createdAt'>): Promise<boolean> => {
    if (!user) return false;

    // Fake alert & rate limit checks
    if (!checkRateLimit(user.uid)) {
      throw new Error('RATE_LIMIT: You can only submit 3 alerts per hour. Please wait before submitting again.');
    }
    if (isFakeAlert(data.location, user.uid)) {
      throw new Error('DUPLICATE: A similar alert from this location was submitted recently.');
    }

    const newAlert: EmergencyAlert = {
      ...data,
      id: `alert-${Date.now()}`,
      creatorId: user.uid,
      creatorName: user.displayName || user.email || 'Anonymous',
      status: 'open',
      createdAt: new Date(),
    };

    try {
      const { data: dbData, error } = await supabase.from('emergency_alerts').insert([{
        creator_id: newAlert.creatorId,
        creator_name: newAlert.creatorName,
        priority: newAlert.priority,
        description: newAlert.description,
        location: newAlert.location,
        latitude: newAlert.latitude,
        longitude: newAlert.longitude,
        status: newAlert.status,
        voice_transcript: newAlert.voiceTranscript,
      }]).select().single();

      if (error) throw error;
      if (dbData) newAlert.id = dbData.id;
    } catch (err) {
      console.warn('DB insert failed, using local state:', err);
    }

    setAlerts(prev => [newAlert, ...prev]);
    return true;
  };

  const respondToAlert = async (alertId: string) => {
    if (!user) return;
    try {
      await supabase.from('emergency_alerts').update({ status: 'responded', responder_id: user.uid }).eq('id', alertId);
    } catch (err) { console.warn('DB update failed, local only'); }
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'responded', responderId: user.uid } : a));
  };

  const closeAlert = async (alertId: string) => {
    try {
      await supabase.from('emergency_alerts').update({ status: 'closed' }).eq('id', alertId);
    } catch (err) { console.warn('DB update failed, local only'); }
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  return (
    <EmergencyAlertsContext.Provider value={{
      alerts,
      activeAlerts: alerts.filter(a => a.status !== 'closed'),
      createAlert,
      respondToAlert,
      closeAlert,
      isLoading,
    }}>
      {children}
    </EmergencyAlertsContext.Provider>
  );
};

export const useEmergencyAlerts = () => {
  const ctx = useContext(EmergencyAlertsContext);
  if (!ctx) throw new Error('useEmergencyAlerts must be used within EmergencyAlertsProvider');
  return ctx;
};
