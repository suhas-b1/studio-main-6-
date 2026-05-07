'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  serverTimestamp, 
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { initializeFirebase, useUser } from '@/firebase';

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
  const { firestore } = initializeFirebase();

  useEffect(() => {
    // Real-time updates with Firestore onSnapshot
    const q = query(
      collection(firestore, 'emergency_alerts'),
      where('status', 'in', ['open', 'escalated', 'responded']),
      orderBy('created_at', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const mapped: EmergencyAlert[] = snapshot.docs.map(docSnap => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          creatorId: d.creator_id,
          creatorName: d.creator_name,
          priority: d.priority,
          description: d.description,
          location: d.location,
          latitude: d.latitude,
          longitude: d.longitude,
          status: d.status,
          responderId: d.responder_id,
          createdAt: d.created_at?.toDate() || new Date(),
          escalatedAt: d.escalated_at?.toDate(),
          voiceTranscript: d.voice_transcript,
        };
      });
      setAlerts(mapped);
      setIsLoading(false);
    }, (error) => {
      console.warn('Firestore subscription failed, falling back to empty state:', error);
      setIsLoading(false);
    });

    // Auto-escalation check every minute
    const escalationInterval = setInterval(() => {
      setAlerts(prev => autoEscalate(prev));
    }, 60000);

    return () => {
      unsubscribe();
      clearInterval(escalationInterval);
    };
  }, [firestore]);

  const createAlert = async (data: Omit<EmergencyAlert, 'id' | 'creatorId' | 'creatorName' | 'status' | 'createdAt'>): Promise<boolean> => {
    if (!user) return false;

    // All limits removed per user request


    try {
      await addDoc(collection(firestore, 'emergency_alerts'), {
        creator_id: user.uid,
        creator_name: user.displayName || user.email || 'Anonymous',
        priority: data.priority,
        description: data.description,
        location: data.location,
        latitude: data.latitude,
        longitude: data.longitude,
        status: 'open',
        voice_transcript: data.voiceTranscript,
        created_at: serverTimestamp(),
      });
      return true;
    } catch (err) {
      console.error('Firestore insert failed:', err);
      throw err;
    }
  };

  const respondToAlert = async (alertId: string) => {
    if (!user) return;
    try {
      const alertRef = doc(firestore, 'emergency_alerts', alertId);
      await updateDoc(alertRef, { 
        status: 'responded', 
        responder_id: user.uid 
      });
    } catch (err) {
      console.error('Firestore update failed:', err);
    }
  };

  const closeAlert = async (alertId: string) => {
    try {
      const alertRef = doc(firestore, 'emergency_alerts', alertId);
      await updateDoc(alertRef, { 
        status: 'closed',
        closed_at: serverTimestamp()
      });
    } catch (err) {
      console.error('Firestore update failed:', err);
    }
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
