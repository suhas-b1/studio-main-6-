
import type { LucideIcon } from "lucide-react";

export type UserRole = "donor" | "ngo";

export type UserAddress = {
  id: string;
  label: string; // e.g., "Home", "Office", "Main NGO Branch"
  name: string;
  phone: string;
  fullAddress: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  isDefault: boolean;
};

export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: UserRole;
  organizationName?: string;
  isVerified: boolean;
  phone?: string;
  address?: string; // Legacy field
  addresses?: UserAddress[];
};

export type OrderStatus = "pending" | "confirmed" | "preparing" | "out-for-delivery" | "delivered" | "completed" | "cancelled";

export type ServiceType = "pickup" | "drop" | "delivery";

export type BillingDetails = {
  itemTotal: number;
  handlingFee: number;
  deliveryFee: number;
  tip: number;
  gst: number;
  total: number;
};

export type Order = {
  id: string;
  donationId: string;
  donorId: string;
  receiverId: string;
  status: OrderStatus;
  serviceType: ServiceType;
  address: UserAddress;
  billing: BillingDetails;
  paymentMethod: "upi" | "card" | "cod" | "netbanking";
  deliveryPersonId?: string;
  estimatedArrival?: Date;
  currentLocation?: {
    lat: number;
    lng: number;
  };
  createdAt: Date;
};

export type Donation = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  quantity: string;
  type: "Produce" | "Baked Goods" | "Canned Goods" | "Prepared Meal" | "Dairy" | "Pantry";
  pickupDeadline: Date;
  location: string;
  donorId: string;
  donor: User;
  status: "available" | "claimed" | "picked-up" | "expired";
  claimedByNgoId?: string | null;
  createdAt: Date;
  distance: number;
};

export type Ngo = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  distance: string;
  reasonForMatch: string;
};

export type AppNotification = {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  read: boolean;
  createdAt: Date;
};
