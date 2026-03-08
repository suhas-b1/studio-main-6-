
'use client';

import { useState } from 'react';
import { MapPin, Plus, Home, Briefcase, Map as MapIcon, Check, MoreVertical, Trash2, Loader2, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { UserAddress } from '@/lib/types';

interface AddressManagerProps {
    addresses: UserAddress[];
    onSelect?: (address: UserAddress) => void;
    onAdd: (address: Omit<UserAddress, 'id'>) => void;
    onDelete: (id: string) => void;
    onSetDefault: (id: string) => void;
    selectedId?: string;
    className?: string;
}

export function AddressManager({
    addresses,
    onSelect,
    onAdd,
    onDelete,
    onSetDefault,
    selectedId,
    className,
}: AddressManagerProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [newAddress, setNewAddress] = useState<Omit<UserAddress, 'id'>>({
        label: 'Home',
        name: '',
        phone: '',
        fullAddress: '',
        isDefault: addresses.length === 0,
    });
    const [isLocating, setIsLocating] = useState(false);

    const handleLocateMe = () => {
        setIsLocating(true);
        if (!navigator.geolocation) {
            setIsLocating(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await res.json();
                    if (data.display_name) {
                        setNewAddress(prev => ({ ...prev, fullAddress: data.display_name }));
                    }
                } catch (err) {
                    console.error("Location error:", err);
                } finally {
                    setIsLocating(false);
                }
            },
            (err) => {
                console.error("Position error:", err);
                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    };

    const handleAdd = () => {
        onAdd(newAddress);
        setIsAdding(false);
        setNewAddress({
            label: 'Home',
            name: '',
            phone: '',
            fullAddress: '',
            isDefault: addresses.length === 0,
        });
    };

    const getIcon = (label: string) => {
        switch (label.toLowerCase()) {
            case 'home':
                return <Home className="h-4 w-4" />;
            case 'office':
            case 'work':
                return <Briefcase className="h-4 w-4" />;
            default:
                return <MapIcon className="h-4 w-4" />;
        }
    };

    return (
        <div className={cn("space-y-4", className)}>
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> SAVED ADDRESSES
                </h3>
                <Dialog open={isAdding} onOpenChange={setIsAdding}>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-primary h-8 gap-1">
                            <Plus className="h-4 w-4" /> Add New
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Add New Address</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="label" className="text-right">Label</Label>
                                <div className="col-span-3 flex gap-2">
                                    {['Home', 'Office', 'Other'].map((l) => (
                                        <Button
                                            key={l}
                                            type="button"
                                            variant={newAddress.label === l ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setNewAddress({ ...newAddress, label: l })}
                                        >
                                            {l}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">Name</Label>
                                <Input
                                    id="name"
                                    value={newAddress.name}
                                    onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                                    placeholder="Full Name"
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="phone" className="text-right">Phone</Label>
                                <Input
                                    id="phone"
                                    value={newAddress.phone}
                                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                                    placeholder="Contact Number"
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-start gap-4">
                                <Label htmlFor="address" className="text-right pt-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">Address</Label>
                                <div className="col-span-3 space-y-2">
                                    <div className="relative">
                                        <Input
                                            id="address"
                                            value={newAddress.fullAddress}
                                            onChange={(e) => setNewAddress({ ...newAddress, fullAddress: e.target.value })}
                                            placeholder="Street, Area, Building"
                                            className="pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleLocateMe}
                                            disabled={isLocating}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
                                            title="Use current location"
                                        >
                                            {isLocating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">Click the location icon to auto-detect your address.</p>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" onClick={handleAdd} disabled={!newAddress.name || !newAddress.fullAddress}>
                                Save Address
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-3">
                {addresses.map((address) => (
                    <Card
                        key={address.id}
                        className={cn(
                            "relative cursor-pointer transition-all hover:border-primary/50",
                            selectedId === address.id && "border-primary bg-primary/5 ring-1 ring-primary"
                        )}
                        onClick={() => onSelect?.(address)}
                    >
                        <CardContent className="p-4 flex items-start gap-3">
                            <div className={cn(
                                "mt-1 p-2 rounded-lg",
                                selectedId === address.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                            )}>
                                {getIcon(address.label)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="font-bold text-sm">{address.label}</p>
                                    {address.isDefault && (
                                        <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded uppercase font-bold text-muted-foreground">Default</span>
                                    )}
                                </div>
                                <p className="text-xs text-foreground font-semibold mt-0.5">{address.name} • {address.phone}</p>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{address.fullAddress}</p>
                            </div>
                            <div className="flex items-center gap-1">
                                {selectedId === address.id && (
                                    <Check className="h-4 w-4 text-primary" />
                                )}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        {!address.isDefault && (
                                            <DropdownMenuItem onClick={() => onSetDefault(address.id)}>
                                                Set as Default
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem className="text-destructive" onClick={() => onDelete(address.id)}>
                                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
