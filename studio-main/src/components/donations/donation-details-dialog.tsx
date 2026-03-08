
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Donation, UserRole } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Building, Phone, Mail, MapPin, Calendar, Clock, Package, Info, User, CheckCircle, XCircle, HeartHandshake } from 'lucide-react';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { mockUsers } from '@/lib/mock-data';
import { format } from 'date-fns';

type DonationDetailsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  donation: Donation;
  role: UserRole;
  onClaimClick: () => void;
};

const statusDetails = {
  available: { icon: CheckCircle, color: 'text-green-500', label: 'Available' },
  claimed: { icon: User, color: 'text-yellow-500', label: 'Claimed' },
  'picked-up': { icon: Package, color: 'text-blue-500', label: 'Picked Up' },
  expired: { icon: XCircle, color: 'text-destructive', label: 'Expired' },
};


export function DonationDetailsDialog({
  open,
  onOpenChange,
  donation,
  role,
  onClaimClick,
}: DonationDetailsDialogProps) {

  const claimedByNgo = donation.claimedByNgoId ? mockUsers.find(u => u.id === donation.claimedByNgoId) : null;
  const statusInfo = statusDetails[donation.status] || statusDetails.expired;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">
            {donation.title}
          </DialogTitle>
          <DialogDescription>
            Detailed information about the donation listing.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 my-4">
            
            <div className="flex items-center justify-between rounded-lg border bg-card p-4">
                <div className="flex items-center gap-3">
                    <statusInfo.icon className={`w-6 h-6 ${statusInfo.color}`} />
                    <div>
                        <h4 className="font-semibold">Status</h4>
                        <p className={`text-sm font-medium ${statusInfo.color}`}>{statusInfo.label}</p>
                    </div>
                </div>
                {claimedByNgo && (
                     <div className="text-right">
                        <p className="text-xs text-muted-foreground">Claimed by</p>
                        <p className="font-semibold">{claimedByNgo.organizationName}</p>
                    </div>
                )}
            </div>

            <Separator />
            
            <div className="space-y-4">
                <div className="flex items-start gap-4">
                    <Info className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                    <div>
                        <h4 className="font-semibold">Description</h4>
                        <p className="text-sm text-muted-foreground">{donation.description}</p>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    <Package className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                    <div>
                        <h4 className="font-semibold">Details</h4>
                        <div className="flex gap-2 mt-1">
                            <Badge variant="secondary">{donation.type}</Badge>
                            <Badge variant="secondary">Qty: {donation.quantity}</Badge>
                        </div>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    <Clock className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                    <div>
                        <h4 className="font-semibold">Pickup Deadline</h4>
                        <p className="text-sm">{format(donation.pickupDeadline, "PP 'at' p")}</p>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                    <div>
                        <h4 className="font-semibold">Pickup Location</h4>
                        <p className="text-sm">{donation.donor.organizationName}</p>
                    </div>
                </div>
            </div>
        </div>

        <DialogFooter className='mt-6 flex sm:justify-between gap-2'>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
           {role === 'ngo' && donation.status === 'available' && (
            <Button onClick={onClaimClick}>
                <HeartHandshake className='mr-2 h-4 w-4' />
                Claim This Item
            </Button>
           )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
