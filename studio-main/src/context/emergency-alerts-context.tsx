'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  onSnapshot, 
  doc, 
  serverTimestamp,
} from 'firebase/firestore';
import { initializeFirebase, useUser } from '@/firebase';

export type AlertPriority = 'high' | 'medium' | 'low';
export type AlertStatus = 'active' | 'accepted' | 'completed' | 'expired';

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
  acceptedBy?: string;
  acceptedByName?: string;
  createdAt: Date;
  lastNotificationSent: Date;
  retryCount: number;
  maxRetries: number;
  voiceTranscript?: string;
}

interface EmergencyAlertsContextType {
  alerts: EmergencyAlert[];
  activeAlerts: EmergencyAlert[];
  createAlert: (data: Omit<EmergencyAlert, 'id' | 'creatorId' | 'creatorName' | 'status' | 'createdAt' | 'lastNotificationSent' | 'retryCount' | 'maxRetries'>) => Promise<boolean>;
  respondToAlert: (alertId: string) => Promise<void>;
  closeAlert: (alertId: string) => Promise<void>;
  isLoading: boolean;
}

const EmergencyAlertsContext = createContext<EmergencyAlertsContextType | undefined>(undefined);

export const EmergencyAlertsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { firestore } = initializeFirebase();

  const API_BASE = '/api'; // Use internal Next.js API routes for zero-config demo

  useEffect(() => {
    // Simple query with NO compound index needed — just filter by collection
    // Client-side filtering is fine for emergency alerts (low volume)
    const q = collection(firestore, 'emergency_alerts');

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const mapped: EmergencyAlert[] = snapshot.docs
        .map(docSnap => {
          const d = docSnap.data();
          return {
            id: docSnap.id,
            creatorId: d.receiverId || d.creator_id || '',
            creatorName: d.receiverName || d.creator_name || 'Unknown',
            priority: (d.priority || 'high') as AlertPriority,
            description: d.description || '',
            location: d.location || '',
            latitude: d.latitude,
            longitude: d.longitude,
            status: (d.status || 'active') as AlertStatus,
            acceptedBy: d.acceptedBy,
            acceptedByName: d.acceptedByName,
            createdAt: d.createdAt?.toDate() || new Date(),
            lastNotificationSent: d.lastNotificationSent?.toDate() || d.createdAt?.toDate() || new Date(),
            retryCount: d.retryCount || 0,
            maxRetries: d.maxRetries || 0,
            voiceTranscript: d.voice_transcript,
          };
        })
        // Client-side filter: only show active/accepted
        .filter(a => a.status === 'active' || a.status === 'accepted')
        // Sort newest first
        .sort((a, b) => b.lastNotificationSent.getTime() - a.lastNotificationSent.getTime());

      setAlerts(mapped);
      setIsLoading(false);
    }, (error) => {
      console.error('Firestore subscription error:', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [firestore]);

  const createAlert = async (data: Omit<EmergencyAlert, 'id' | 'creatorId' | 'creatorName' | 'status' | 'createdAt' | 'lastNotificationSent' | 'retryCount' | 'maxRetries'>): Promise<boolean> => {
    if (!user) return false;

    // FOR DEMO: If backend isn't ready, we use direct Firestore as a fallback to guarantee it works
    try {
      const maxRetriesMap = { low: 2, medium: 3, high: 5 };
      const maxRetries = maxRetriesMap[data.priority] || 2;

      const alertData: any = {
        receiverId: user.uid,
        receiverName: user.displayName || 'Emergency User',
        description: data.description,
        priority: data.priority,
        location: data.location,
        latitude: data.latitude,
        longitude: data.longitude,
        status: 'active',
        createdAt: serverTimestamp(),
        lastNotificationSent: serverTimestamp(),
        retryCount: 0,
        maxRetries,
        voice_transcript: data.voiceTranscript || ''
      };

      await addDoc(collection(firestore, 'emergency_alerts'), alertData);
      return true;
    } catch (err) {
      console.error('Alert creation failed:', err);
      return false;
    }
  };

  const respondToAlert = async (alertId: string) => {
    if (!user) return;
    try {
      // Direct Firestore transaction fallback for demo reliability
      const alertRef = doc(firestore, 'emergency_alerts', alertId);
      await updateDoc(alertRef, {
        status: 'accepted',
        acceptedBy: user.uid,
        acceptedByName: user.displayName || 'Donor',
        acceptedAt: serverTimestamp()
      });
    } catch (err) {
      console.error('Alert acceptance failed:', err);
    }
  };

  const closeAlert = async (alertId: string) => {
    try {
      const alertRef = doc(firestore, 'emergency_alerts', alertId);
      await updateDoc(alertRef, { 
        status: 'completed',
        completedAt: serverTimestamp()
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
