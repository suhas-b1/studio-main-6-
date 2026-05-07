
'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { format } from 'date-fns';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { ChevronLeft, Upload, Sparkles, Loader2, Calendar as CalendarIcon, MapPin } from 'lucide-react';
import { suggestTitlesAction } from '@/app/actions';
import { useDonations } from '@/context/donations-context';
import { useUser } from '@/firebase';
import { mockUsers } from '@/lib/mock-data';

const schema = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters.'),
    description: z.string().min(10, 'Description must be at least 10 characters.'),
    quantity: z.string().min(1, 'Please specify the quantity.'),
    type: z.enum(['Produce', 'Baked Goods', 'Canned Goods', 'Prepared Meal', 'Dairy', 'Pantry']),
    cookedTime: z.date({ required_error: 'Please specify when the food was prepared/cooked.' }).optional().default(() => new Date()),
    location: z.string().min(5, 'Please provide a pickup location.'),
    image: z.any().optional(),
    imageHint: z.string().optional(),
});

// Configurable food expiry rules (hours from cooked time)
const FOOD_EXPIRY_RULES: Record<string, number> = {
    'Prepared Meal': 4,
    'Dairy': 2,
    'Baked Goods': 24,
    'Produce': 48,
    'Canned Goods': 720, // 30 days
    'Pantry': 720,
};

/* ── Shared field styles ──────────────────────────────── */
const inputCls =
    'w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition';

const labelCls = 'text-sm font-semibold text-foreground';

export function NewDonationForm() {
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [isSuccessOpen, setIsSuccessOpen] = useState(false);
    const { toast } = useToast();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { addDonation } = useDonations();
    const { user } = useUser();

    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: { title: '', description: '', quantity: '', type: 'Prepared Meal', cookedTime: new Date(), location: (user as any)?.address || '' },
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        form.setValue('image', file);
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleSuggestTitle = async () => {
        setIsSuggesting(true);
        const description = form.getValues('description');
        const photoDataUri = imagePreview ?? undefined;

        if (!description && !photoDataUri) {
            toast({ variant: 'destructive', title: 'Input Needed', description: 'Add a description or upload an image first.' });
            setIsSuggesting(false);
            return;
        }

        const result = await suggestTitlesAction({ description, photoDataUri });
        if (result.error) {
            toast({ variant: 'destructive', title: 'AI Error', description: result.error });
        } else if (result.suggestions?.length) {
            form.setValue('title', result.suggestions[0]);
            toast({ title: '✨ Title Suggested!', description: 'Gemini AI has filled in your listing title.' });
        }
        setIsSuggesting(false);
    };

    const handleLocateMe = () => {
        setIsLocating(true);
        if (!navigator.geolocation) {
            toast({ variant: 'destructive', title: 'Geolocation not supported', description: 'Your browser does not support geolocation.' });
            setIsLocating(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    if (!res.ok) throw new Error('Failed to fetch address');
                    const data = await res.json();
                    form.setValue('location', data.display_name || `${latitude}, ${longitude}`);
                    toast({ title: 'Location found!' });
                } catch (error) {
                    console.error(error);
                    toast({ variant: 'destructive', title: 'Location failed', description: 'Could not determine your address.' });
                } finally {
                    setIsLocating(false);
                }
            },
            (error) => {
                console.error(error);
                toast({ variant: 'destructive', title: 'Permission denied', description: 'Please allow location access to use this feature.' });
                setIsLocating(false);
            }
        );
    };

    function onSubmit(values: z.infer<typeof schema>) {
        if (!user) { toast({ variant: 'destructive', title: 'You must be logged in to donate.' }); return; }

        // Food Expiry Engine: Auto-calculate expiry based on configurable rules
        const safeHours = FOOD_EXPIRY_RULES[values.type] || 4;
        const autoExpiryTime = new Date((values.cookedTime || new Date()).getTime() + safeHours * 60 * 60 * 1000);

        addDonation({
            id: `donation-${Date.now()}`,
            ...values,
            pickupDeadline: autoExpiryTime,
            imageUrl: imagePreview || 'https://placehold.co/600x400',
            imageHint: values.imageHint || 'food',
            donorId: user.uid,
            donor: mockUsers.find(u => u.id === user.uid) || mockUsers.find(u => u.role === 'donor')!,
            status: 'available',
            createdAt: new Date(),
            distance: Math.random() * 10,
        });

        toast({ title: 'Donation Listed! 🎉', description: 'Your food donation is now visible to nearby NGOs.' });
        setIsSuccessOpen(true);
    }

    return (
        <div className="max-w-2xl mx-auto pb-28">

            <AlertDialog open={isSuccessOpen} onOpenChange={setIsSuccessOpen}>
                <AlertDialogContent className="bg-[#150d06] border-border/40">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-white text-2xl flex items-center gap-2">
                            <Sparkles className="h-6 w-6 text-primary" /> Donation Listed!
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground text-base">
                            Your food donation is now live. NGOs in your area can see it and claim it immediately.
                            Thank you for making a difference!
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-6">
                        <AlertDialogCancel
                            className="bg-transparent border-border/40 text-white hover:bg-[#1f1208]"
                            onClick={() => {
                                form.reset();
                                setImagePreview(null);
                                setIsSuccessOpen(false);
                            }}
                        >
                            List Another Item
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-primary text-black hover:bg-orange-500 font-bold shadow-lg shadow-primary/20"
                            onClick={() => router.push('/dashboard')}
                        >
                            Go to Feed
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* ── Header ─────────────────────────────────────── */}
            <div className="flex items-center gap-4 mb-6 px-4 pt-6">
                <button
                    onClick={() => window.history.back()}
                    className="h-8 w-8 rounded-xl border border-border flex items-center justify-center hover:bg-card transition"
                >
                    <ChevronLeft className="h-4 w-4 text-foreground" />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-foreground">List a New Donation</h1>
                    <p className="text-xs text-muted-foreground">Fill in the details to make your food available.</p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-4">

                    {/* ── Card 1: Food Details ──────────────────── */}
                    <div className="rounded-2xl border border-border bg-card p-5 space-y-5">
                        <div>
                            <h2 className="text-base font-bold text-foreground">Food Details</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">Describe the food you are donating. Be as specific as possible.</p>
                        </div>

                        {/* Image upload */}
                        <FormField control={form.control} name="image" render={() => (
                            <FormItem>
                                <FormLabel className={labelCls}>Donation Image</FormLabel>
                                <FormControl>
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="relative flex flex-col items-center justify-center h-40 rounded-xl border-2 border-dashed border-border cursor-pointer hover:border-primary/40 hover:bg-muted/20 transition"
                                    >
                                        <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                        {imagePreview ? (
                                            <Image src={imagePreview} alt="Preview" fill className="object-contain rounded-xl" />
                                        ) : (
                                            <div className="text-center text-muted-foreground">
                                                <Upload className="mx-auto h-7 w-7 mb-2" />
                                                <p className="text-sm">Click to upload an image</p>
                                                <p className="text-xs mt-0.5">PNG, JPG, GIF up to 10MB</p>
                                            </div>
                                        )}
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        {/* Description */}
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem>
                                <FormLabel className={labelCls}>Description</FormLabel>
                                <FormControl>
                                    <textarea
                                        {...field}
                                        rows={3}
                                        placeholder="e.g., Unopened bags of basmati rice, sealed boxes of whole-wheat pasta..."
                                        className={cn(inputCls, 'resize-none')}
                                    />
                                </FormControl>
                                <FormDescription className="text-xs text-muted-foreground">
                                    Provide details like brand, condition, and any dietary information.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )} />

                        {/* Title with AI button */}
                        <FormField control={form.control} name="title" render={({ field }) => (
                            <FormItem>
                                <div className="flex items-center justify-between">
                                    <FormLabel className={labelCls}>Listing Title</FormLabel>
                                    <button
                                        type="button"
                                        onClick={handleSuggestTitle}
                                        disabled={isSuggesting}
                                        className="flex items-center gap-1.5 text-xs font-semibold text-primary border border-primary/30 rounded-lg px-2.5 py-1 hover:bg-primary/10 transition disabled:opacity-60"
                                    >
                                        {isSuggesting
                                            ? <Loader2 className="h-3 w-3 animate-spin" />
                                            : <Sparkles className="h-3 w-3" />}
                                        Suggest with AI
                                    </button>
                                </div>
                                <FormControl>
                                    <input {...field} placeholder="e.g., 'Bulk Pantry Staples - Rice & Pasta'" className={inputCls} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        {/* Food Type + Quantity in grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField control={form.control} name="type" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className={labelCls}>Food Type</FormLabel>
                                    <FormControl>
                                        <select
                                            {...field}
                                            className={cn(inputCls, 'appearance-none')}
                                        >
                                            <option value="" disabled>Select a food category</option>
                                            <option value="Pantry">Pantry Staples</option>
                                            <option value="Produce">Fresh Produce</option>
                                            <option value="Baked Goods">Baked Goods</option>
                                            <option value="Dairy">Dairy &amp; Eggs</option>
                                            <option value="Prepared Meal">Prepared Meals</option>
                                            <option value="Canned Goods">Canned Goods</option>
                                        </select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <FormField control={form.control} name="quantity" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className={labelCls}>Quantity</FormLabel>
                                    <FormControl>
                                        <input {...field} placeholder="e.g., '10 kg' or '2 boxes'" className={inputCls} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                    </div>

                    {/* ── Card 2: Pickup & Logistics ────────────── */}
                    <div className="rounded-2xl border border-border bg-card p-5 space-y-5">
                        <div>
                            <h2 className="text-base font-bold text-foreground">Pickup &amp; Logistics</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">Provide details for where and when the food can be collected.</p>
                        </div>

                        {/* Cooked/Prepared Time */}
                        <FormField control={form.control} name="cookedTime" render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel className={labelCls}>When was this prepared?</FormLabel>
                                <FormControl>
                                    <input 
                                        type="datetime-local" 
                                        className={cn(inputCls, 'w-full')}
                                        value={field.value ? format(field.value, "yyyy-MM-dd'T'HH:mm") : ''}
                                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                                    />
                                </FormControl>
                                <FormDescription className="text-xs text-muted-foreground">
                                    The system will auto-calculate safe expiry based on the food type and this time.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )} />

                        {/* Pickup Location */}
                        <FormField control={form.control} name="location" render={({ field }) => (
                            <FormItem>
                                <FormLabel className={labelCls}>Pickup Location</FormLabel>
                                <div className="flex gap-2">
                                    <FormControl>
                                        <input {...field} placeholder="Full address for pickup" className={cn(inputCls, "flex-1")} />
                                    </FormControl>
                                    <button
                                        type="button"
                                        onClick={handleLocateMe}
                                        disabled={isLocating}
                                        className="h-[42px] px-4 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 border border-orange-500/30 flex items-center justify-center transition disabled:opacity-50 font-medium"
                                        title="Locate Me"
                                    >
                                        {isLocating ? <Loader2 className="animate-spin h-5 w-5 mr-1.5" /> : <MapPin className="h-4 w-4 mr-1.5" />}
                                        <span className="text-sm">Locate</span>
                                    </button>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )} />
                        {/* Inline Submit Button */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                className="w-full py-3.5 rounded-2xl font-bold text-sm text-black transition active:scale-95 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                            >
                                List New Donation
                            </button>
                        </div>
                    </div>
                </form>
            </Form>

            {/* ── Sticky CTA ─────────────────────────────────── */}
            <div className="fixed bottom-0 left-0 right-0 z-50 p-4" style={{ background: 'linear-gradient(to top, rgba(15,7,0,1) 60%, transparent)' }}>
                <button
                    type="button"
                    onClick={form.handleSubmit(onSubmit)}
                    className="w-full py-4 rounded-2xl font-black text-sm text-white transition active:scale-95"
                    style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)', boxShadow: '0 4px 24px rgba(249,115,22,0.4)' }}
                >
                    List Donation
                </button>
            </div>
        </div>
    );
}
