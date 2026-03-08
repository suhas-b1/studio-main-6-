
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
import type { Ngo } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Building, Phone, Mail, MapPin, Milestone } from 'lucide-react';
import { Separator } from '../ui/separator';

type NgoDetailsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ngo: Ngo | null;
};

export function NgoDetailsDialog({
  open,
  onOpenChange,
  ngo,
}: NgoDetailsDialogProps) {
  if (!ngo) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center items-center">
            <Avatar className="h-20 w-20 mb-4">
                <AvatarImage src={`https://picsum.photos/seed/${ngo.id}/100/100`} />
                <AvatarFallback>{ngo.name ? ngo.name.charAt(0) : 'N'}</AvatarFallback>
            </Avatar>
          <DialogTitle className="font-headline text-2xl">
            {ngo.name}
          </DialogTitle>
          <DialogDescription>
            Contact details and information.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 my-4">
            <div className="flex items-start gap-4">
                <Mail className="h-5 w-5 text-muted-foreground mt-1" />
                <div>
                    <h4 className="font-semibold">Email</h4>
                    <p className="text-sm text-primary underline">{ngo.email}</p>
                </div>
            </div>
             <div className="flex items-start gap-4">
                <Phone className="h-5 w-5 text-muted-foreground mt-1" />
                <div>
                    <h4 className="font-semibold">Phone</h4>
                    <p className="text-sm">{ngo.phone}</p>
                </div>
            </div>
            <div className="flex items-start gap-4">
                <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
                <div>
                    <h4 className="font-semibold">Address</h4>
                    <p className="text-sm">{ngo.address}</p>
                </div>
            </div>
             <div className="flex items-start gap-4">
                <Milestone className="h-5 w-5 text-muted-foreground mt-1" />
                <div>
                    <h4 className="font-semibold">Distance</h4>
                    <p className="text-sm">{ngo.distance} from you</p>
                </div>
            </div>
        </div>

        <Separator />

        <div className='mt-4'>
             <h4 className="font-semibold mb-2">Reason for Match</h4>
            <p className="text-sm text-muted-foreground italic">"{ngo.reasonForMatch}"</p>
        </div>


        <DialogFooter className='mt-6'>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
