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
  Timestamp 
} from 'firebase/firestore';
import { initializeFirebase, useUser } from '@/firebase';

export type DeliveryStatus = 
  | 'pending' 
  | 'assigned' 
  | 'accepted' 
  | 'heading_to_donor' 
  | 'arrived_at_donor' 
  | 'picked_up' 
  | 'heading_to_receiver' 
  | 'near_receiver' 
  | 'delivered' 
  | 'cancelled';

export interface DeliveryTracking {
  id: string;
  donationId: string;
  volunteerId: string;
  volunteerName: string;
  receiverId: string;
  status: DeliveryStatus;
  currentLat?: number;
  currentLng?: number;
  pickupLat: number;
  pickupLng: number;
  destLat: number;
  destLng: number;
  eta?: string;
  polyline?: string;
  lastLocationUpdate?: Date;
  startedAt: Date;
}

interface DeliveryContextType {
  activeDeliveries: DeliveryTracking[];
  createDelivery: (data: Omit<DeliveryTracking, 'id' | 'status' | 'startedAt'>) => Promise<string>;
  updateDeliveryStatus: (deliveryId: string, status: DeliveryStatus) => Promise<void>;
  updateVolunteerLocation: (deliveryId: string, lat: number, lng: number, eta?: string) => Promise<void>;
  isLoading: boolean;
}

const DeliveryContext = createContext<DeliveryContextType | undefined>(undefined);

export const DeliveryProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const [activeDeliveries, setActiveDeliveries] = useState<DeliveryTracking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { firestore } = initializeFirebase();

  useEffect(() => {
    if (!user) {
      setActiveDeliveries([]);
      setIsLoading(false);
      return;
    }

    // Listen for deliveries where the user is either the volunteer or the receiver
    const q = query(
      collection(firestore, 'deliveries'),
      where('status', 'not-in', ['delivered', 'cancelled'])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const mapped = snapshot.docs.map(docSnap => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          donationId: d.donation_id,
          volunteerId: d.volunteer_id,
          volunteerName: d.volunteer_name,
          receiverId: d.receiver_id,
          status: d.status,
          currentLat: d.current_lat,
          currentLng: d.current_lng,
          pickupLat: d.pickup_lat,
          pickupLng: d.pickup_lng,
          destLat: d.dest_lat,
          destLng: d.dest_lng,
          eta: d.eta,
          polyline: d.polyline,
          lastLocationUpdate: d.last_location_update?.toDate(),
          startedAt: d.started_at?.toDate() || new Date(),
        };
      }) as DeliveryTracking[];
      
      // Filter locally for simplicity (Firestore composite indexes can be tricky with NOT-IN + WHERE user_id)
      const filtered = mapped.filter(d => d.volunteerId === user.uid || d.receiverId === user.uid);
      
      setActiveDeliveries(filtered);
      setIsLoading(false);
    }, (error) => {
      console.warn('Delivery subscription failed:', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [firestore, user]);

  const createDelivery = async (data: Omit<DeliveryTracking, 'id' | 'status' | 'startedAt'>) => {
    const docRef = await addDoc(collection(firestore, 'deliveries'), {
      donation_id: data.donationId,
      volunteer_id: data.volunteerId,
      volunteer_name: data.volunteerName,
      receiver_id: data.receiverId,
      status: 'assigned',
      pickup_lat: data.pickupLat,
      pickup_lng: data.pickupLng,
      dest_lat: data.destLat,
      dest_lng: data.destLng,
      current_lat: data.pickupLat, // Start at pickup for initial render
      current_lng: data.pickupLng,
      started_at: serverTimestamp(),
      last_location_update: serverTimestamp(),
    });
    return docRef.id;
  };

  const updateDeliveryStatus = async (deliveryId: string, status: DeliveryStatus) => {
    const deliveryRef = doc(firestore, 'deliveries', deliveryId);
    await updateDoc(deliveryRef, { status });
  };

  const updateVolunteerLocation = async (deliveryId: string, lat: number, lng: number, eta?: string) => {
    const deliveryRef = doc(firestore, 'deliveries', deliveryId);
    const updateData: any = {
      current_lat: lat,
      current_lng: lng,
      last_location_update: serverTimestamp(),
    };
    if (eta) updateData.eta = eta;
    await updateDoc(deliveryRef, updateData);
  };

  return (
    <DeliveryContext.Provider value={{
      activeDeliveries,
      createDelivery,
      updateDeliveryStatus,
      updateVolunteerLocation,
      isLoading,
    }}>
      {children}
    </DeliveryContext.Provider>
  );
};

export const useDelivery = () => {
  const ctx = useContext(DeliveryContext);
  if (!ctx) throw new Error('useDelivery must be used within DeliveryProvider');
  return ctx;
};
