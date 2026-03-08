'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft, ArrowRight, Building, Home, UtensilsCrossed, Baby,
  Box, MoreHorizontal, Camera, Store, ChefHat, User, CheckCircle,
  MapPin, Mail, KeyRound, Loader2, Sparkles, Building2, HandHeart,
  Upload, RefreshCw, FileText, X, ZoomIn
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const NGO_TYPES = [
  { id: 'ngo', label: 'NGO', icon: Building2 },
  { id: 'shelter', label: 'Shelter', icon: Home },
  { id: 'kitchen', label: 'Community Kitchen', icon: UtensilsCrossed },
  { id: 'orphanage', label: 'Orphanage', icon: Baby },
  { id: 'foodbank', label: 'Food Bank', icon: Box },
];

const DONOR_TYPES = [
  { id: 'restaurant', label: 'Restaurant', icon: Store },
  { id: 'caterer', label: 'Caterer', icon: ChefHat },
  { id: 'individual', label: 'Individual', icon: User },
  { id: 'other', label: 'Other', icon: MoreHorizontal },
];

const FOOD_CATEGORIES = ['Cooked Food', 'Grains', 'Produce', 'Dairy', 'Bakery'];

export default function SignupWizard() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [orgType, setOrgType] = useState('');
  const [role, setRole] = useState<'donor' | 'ngo'>('ngo');
  const [capacity, setCapacity] = useState('');
  const [customCapacity, setCustomCapacity] = useState('');
  const [categories, setCategories] = useState<string[]>(['Cooked Food', 'Grains']);
  const [accountParams, setAccountParams] = useState({ name: '', email: '', password: '' });

  // Location State
  const [address, setAddress] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  // Google Auth Intercept State
  const [isGooglePending, setIsGooglePending] = useState(false);
  const [googleUser, setGoogleUser] = useState<any>(null);

  // Document Verification State
  const [docMode, setDocMode] = useState<'choose' | 'camera' | 'upload' | 'preview'>('choose');
  const [docImage, setDocImage] = useState<string | null>(null); // base64 or object URL
  const [docFileName, setDocFileName] = useState<string | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();

  // Stop camera stream helper
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setIsCameraOn(false);
  }, []);

  // Cleanup camera on unmount or step change
  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  const startCamera = async () => {
    setCameraError(null);
    setDocMode('camera');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraOn(true);
    } catch (err: any) {
      setCameraError('Camera access denied. Please allow camera permission in your browser settings.');
      setDocMode('choose');
      toast({ variant: 'destructive', title: 'Camera Error', description: 'Could not access camera.' });
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setDocImage(dataUrl);
    setDocFileName('camera-capture.jpg');
    stopCamera();
    setDocMode('preview');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast({ variant: 'destructive', title: 'Invalid file type', description: 'Please upload a PDF, JPG, PNG, or WebP file.' });
      return;
    }
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast({ variant: 'destructive', title: 'File too large', description: 'Please upload a file smaller than 10MB.' });
      return;
    }
    const url = URL.createObjectURL(file);
    setDocImage(url);
    setDocFileName(file.name);
    stopCamera();
    setDocMode('preview');
  };

  const resetDoc = () => {
    setDocImage(null);
    setDocFileName(null);
    stopCamera();
    setCameraError(null);
    setDocMode('choose');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleOrgSelect = (id: string, selectedRole: 'donor' | 'ngo') => {
    setOrgType(id);
    setRole(selectedRole);
  };

  const toggleCategory = (cat: string) => {
    setCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
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
          // Reverse geocode using a free public API (OpenStreetMap Nominatim)
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          if (!res.ok) throw new Error('Failed to fetch address');
          const data = await res.json();
          setAddress(data.display_name || `${latitude}, ${longitude}`);
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

  const handleCreateAccount = async () => {
    if (!accountParams.name) {
      toast({ variant: 'destructive', title: 'Missing Organization Name', description: 'Please provide an organization name.' });
      return;
    }

    setIsLoading(true);
    try {
      if (isGooglePending && googleUser) {
        // Just update the profile name for the Google user
        await updateProfile(googleUser, { displayName: accountParams.name });

        // Create/Update Supabase Profile
        await supabase.from('profiles').upsert({
          id: googleUser.uid,
          name: accountParams.name,
          email: googleUser.email,
          role: role,
          updated_at: new Date().toISOString()
        });

        toast({ title: 'Google sign-up complete!' });
        router.push(`/dashboard?role=${role}`);
      } else {
        // Standard Email/Password flow
        if (!accountParams.email || !accountParams.password) {
          toast({ variant: 'destructive', title: 'Missing fields', description: 'Please fill out email and password.' });
          setIsLoading(false);
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, accountParams.email, accountParams.password);
        await updateProfile(userCredential.user, { displayName: accountParams.name });

        // Create Supabase Profile
        await supabase.from('profiles').insert([{
          id: userCredential.user.uid,
          name: accountParams.name,
          email: accountParams.email,
          role: role,
          created_at: new Date().toISOString(),
          addresses: [],
          updated_at: new Date().toISOString()
        }]);

        toast({ title: 'Account created successfully!' });
        router.push(`/dashboard?role=${role}`);
      }
    } catch (error: any) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Signup failed', description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);

      setGoogleUser(result.user);
      setAccountParams(p => ({
        ...p,
        email: result.user.email || '',
        name: result.user.displayName || ''
      }));
      setIsGooglePending(true);
      toast({ title: 'Google linked. Please confirm or edit your Organization Name.', variant: 'default' });

    } catch (error: any) {
      console.error(error);
      if (error.code !== 'auth/cancelled-popup-request') {
        toast({ variant: 'destructive', title: 'Google sign-up failed', description: error.message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const skipsVerification = ['shelter', 'individual', 'other'];
  const isExempt = orgType ? skipsVerification.includes(orgType) : false;
  const totalSteps = isExempt ? 3 : 4;

  const getDisplayStep = () => {
    if (isExempt) {
      if (step === 1) return 1;
      if (step === 3) return 2;
      if (step === 4) return 3;
      return 1;
    }
    return step;
  };

  const nextStep = () => {
    if (step === 1 && skipsVerification.includes(orgType)) {
      setStep(3);
    } else {
      setStep(s => Math.min(s + 1, 4));
    }
  };

  const prevStep = () => {
    if (step === 3 && skipsVerification.includes(orgType)) {
      setStep(1);
    } else {
      setStep(s => Math.max(s - 1, 1));
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0f0700] text-foreground font-sans">
      {/* Header & Progress */}
      <div className="px-6 pt-12 pb-4">
        <div className="flex items-center justify-between mb-6">
          <button onClick={prevStep} className={cn("p-2 -ml-2 text-muted-foreground", step === 1 && "opacity-0 pointer-events-none")}>
            <ChevronLeft className="h-6 w-6" />
          </button>
          <span className="text-xs font-bold tracking-widest text-white uppercase">Step {getDisplayStep()} of {totalSteps}</span>
          <div className="w-10"></div>
        </div>
        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden flex">
          <div className="bg-primary h-full transition-all duration-500 ease-out" style={{ width: `${(getDisplayStep() / totalSteps) * 100}%` }} />
        </div>
      </div>

      <div className="flex-1 px-6 pb-24 overflow-y-auto">
        {/* STEP 1: ORGANIZATION TYPE */}
        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
            <div>
              <p className="text-primary text-xs font-bold uppercase tracking-widest mb-2">Account Creation</p>
              <h1 className="text-3xl font-bold font-headline text-white mb-2">Select your organization type</h1>
              <p className="text-muted-foreground text-sm">Tell us more about your mission to help us connect you with the right network.</p>
            </div>

            <div className="space-y-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Receivers (Get Food)</p>
              <div className="grid grid-cols-2 gap-4">
                {NGO_TYPES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => handleOrgSelect(t.id, 'ngo')}
                    className={cn(
                      "flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-300 relative",
                      orgType === t.id ? "bg-[#1f1208] border-primary" : "bg-[#150d06] border-border/40 hover:border-primary/50"
                    )}
                  >
                    {orgType === t.id && <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-primary flex items-center justify-center"><CheckCircle className="h-2.5 w-2.5 text-white" /></div>}
                    <div className={cn("h-12 w-12 rounded-full flex items-center justify-center mb-3", orgType === t.id ? "bg-primary/20 text-primary" : "bg-white/5 text-muted-foreground")}>
                      <t.icon className="h-6 w-6" />
                    </div>
                    <span className={cn("text-sm font-semibold", orgType === t.id ? "text-white" : "text-muted-foreground")}>{t.label}</span>
                  </button>
                ))}
              </div>

              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-6">Donors (Give Food)</p>
              <div className="grid grid-cols-2 gap-4">
                {DONOR_TYPES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => handleOrgSelect(t.id, 'donor')}
                    className={cn(
                      "flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-300 relative",
                      orgType === t.id ? "bg-[#1f1208] border-primary" : "bg-[#150d06] border-border/40 hover:border-primary/50"
                    )}
                  >
                    {orgType === t.id && <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-primary flex items-center justify-center"><CheckCircle className="h-2.5 w-2.5 text-white" /></div>}
                    <div className={cn("h-12 w-12 rounded-full flex items-center justify-center mb-3", orgType === t.id ? "bg-primary/20 text-primary" : "bg-white/5 text-muted-foreground")}>
                      <t.icon className="h-6 w-6" />
                    </div>
                    <span className={cn("text-sm font-semibold", orgType === t.id ? "text-white" : "text-muted-foreground")}>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={nextStep} disabled={!orgType} className="w-full h-14 text-lg font-bold mt-8 shadow-xl shadow-primary/20">
              Next <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}

        {/* STEP 2: VERIFICATION */}
        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
            <div>
              <h1 className="text-3xl font-bold font-headline text-white mb-2">Legal Documents</h1>
              <p className="text-muted-foreground text-sm">
                Upload your {role === 'ngo' ? '80G certificate or Registration ID' : 'FSSAI License or Business Registration'}. Use your camera or upload a file.
              </p>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="hidden"
              onChange={handleFileUpload}
            />
            {/* Hidden canvas for photo capture */}
            <canvas ref={canvasRef} className="hidden" />

            {/* === CHOOSE MODE === */}
            {docMode === 'choose' && (
              <div className="space-y-4">
                <div className="relative rounded-3xl overflow-hidden border border-border/40 bg-[#160f08] flex flex-col items-center justify-center py-16 gap-4">
                  <div className="absolute top-4 left-0 w-full flex justify-center z-10">
                    <span className="bg-[#2a1305] border border-primary/40 text-primary text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-2 shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                      <Sparkles className="h-3.5 w-3.5" /> AI RECOGNITION ACTIVE
                    </span>
                  </div>
                  {/* Scanner frame corners */}
                  <div className="relative h-36 w-56 mb-4">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary rounded-tl" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary rounded-tr" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary rounded-bl" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary rounded-br" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                      <FileText className="h-12 w-12 text-primary/50" />
                      <p className="text-white text-xs font-medium">Place document here</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-xs">Supports PDF, PNG, JPG, WebP (max 10MB)</p>
                  {cameraError && (
                    <p className="text-red-400 text-xs text-center px-4">{cameraError}</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={startCamera}
                    className="h-14 text-base font-bold shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
                  >
                    <Camera className="h-5 w-5" />
                    Use Camera
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-14 text-base font-bold border-border/40 bg-[#150d06] text-white hover:bg-[#1f1208] flex items-center justify-center gap-2"
                  >
                    <Upload className="h-5 w-5" />
                    Upload File
                  </Button>
                </div>
              </div>
            )}

            {/* === CAMERA MODE === */}
            {docMode === 'camera' && (
              <div className="space-y-4">
                <div className="relative rounded-3xl overflow-hidden border border-primary/40 bg-black aspect-video flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover rounded-3xl"
                  />
                  {/* Scanning overlay corners */}
                  <div className="absolute inset-4 pointer-events-none">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary" />
                  </div>
                  {/* Laser scan line */}
                  {isCameraOn && (
                    <div className="absolute left-0 w-full h-[2px] bg-primary shadow-[0_0_12px_rgba(249,115,22,0.9)] animate-[scan_2s_ease-in-out_infinite]" style={{ top: '50%' }} />
                  )}
                  {!isCameraOn && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="h-10 w-10 text-primary animate-spin" />
                    </div>
                  )}
                </div>
                <p className="text-muted-foreground text-xs text-center">Align your document within the frame, then capture</p>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    onClick={() => { stopCamera(); setDocMode('choose'); }}
                    className="h-14 border-border/40 bg-[#150d06] text-white hover:bg-[#1f1208] flex items-center gap-2"
                  >
                    <X className="h-5 w-5" /> Cancel
                  </Button>
                  <Button
                    onClick={capturePhoto}
                    disabled={!isCameraOn}
                    className="h-14 font-bold shadow-xl shadow-primary/20 flex items-center gap-2"
                  >
                    <Camera className="h-5 w-5" /> Capture
                  </Button>
                </div>
              </div>
            )}

            {/* === PREVIEW MODE === */}
            {docMode === 'preview' && docImage && (
              <div className="space-y-4">
                <div className="relative rounded-3xl overflow-hidden border border-green-500/40 bg-[#160f08]">
                  {docFileName?.endsWith('.pdf') ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-4">
                      <div className="h-20 w-20 rounded-2xl bg-primary/20 flex items-center justify-center">
                        <FileText className="h-10 w-10 text-primary" />
                      </div>
                      <p className="text-white font-medium text-sm">{docFileName}</p>
                      <p className="text-green-400 text-xs">PDF document ready</p>
                    </div>
                  ) : (
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={docImage}
                        alt="Document preview"
                        className="w-full object-contain max-h-72 rounded-3xl"
                      />
                    </div>
                  )}
                  {/* Success badge */}
                  <div className="absolute top-3 right-3">
                    <div className="bg-green-500/90 rounded-full p-1.5">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </div>

                {/* File info */}
                <div className="flex items-center gap-3 bg-[#150d06] border border-green-500/20 rounded-2xl px-4 py-3">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{docFileName}</p>
                    <p className="text-green-400 text-xs">Document ready for submission</p>
                  </div>
                  <button onClick={resetDoc} className="text-muted-foreground hover:text-white transition-colors">
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>

                {/* Retake/Upload again options */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={startCamera}
                    className="h-12 border-border/40 bg-[#150d06] text-white hover:bg-[#1f1208] text-sm flex items-center gap-2"
                  >
                    <Camera className="h-4 w-4" /> Retake
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-12 border-border/40 bg-[#150d06] text-white hover:bg-[#1f1208] text-sm flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" /> Re-upload
                  </Button>
                </div>

                <Button onClick={nextStep} className="w-full h-14 text-lg font-bold shadow-xl shadow-primary/20">
                  Next Setup <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: IMPACT PROFILE */}
        {step === 3 && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            <div>
              <h1 className="text-3xl font-bold font-headline text-white mb-2">Define your reach</h1>
              <p className="text-muted-foreground text-sm">Help our Smart Match AI connect you with the right networks in your area.</p>
            </div>

            {role === 'donor' && (
              <div className="space-y-4">
                <h3 className="text-white font-bold text-lg">Serving Capacity</h3>
                <div className="grid grid-cols-2 gap-4">
                  {['100+', '500+'].map(num => (
                    <button
                      key={num}
                      onClick={() => { setCapacity(num); setCustomCapacity(''); }}
                      className={cn(
                        "flex flex-col items-center justify-center py-4 rounded-xl border transition-all",
                        capacity === num ? "bg-[#1f1208] border-primary" : "bg-[#150d06] border-border/40"
                      )}
                    >
                      <span className={cn("font-bold text-xl", capacity === num ? "text-primary" : "text-white")}>{num}</span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Or enter specific number</p>
                <Input
                  placeholder="Enter capacity"
                  value={customCapacity}
                  onChange={e => { setCustomCapacity(e.target.value); setCapacity('custom'); }}
                  className="bg-[#150d06] border-border/40 h-12"
                />
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-white font-bold text-lg">Food Categories {role === 'ngo' ? 'Needed' : 'Provided'}</h3>
              <div className="flex flex-wrap gap-2">
                {FOOD_CATEGORIES.map(cat => {
                  const active = categories.includes(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={cn(
                        "px-4 py-2 rounded-full border text-sm transition-all flex items-center gap-2",
                        active ? "bg-primary border-primary text-white font-medium shadow-lg shadow-primary/20" : "bg-[#150d06] border-border/40 text-muted-foreground"
                      )}
                    >
                      {cat}
                      {active ? <XIcon /> : <PlusIcon />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-white font-bold text-lg">Primary Location</h3>
              </div>

              <div className="flex gap-2 relative">
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Enter full address manually"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className="pl-10 h-14 bg-[#150d06] border-border/40 text-sm placeholder:text-muted-foreground/50"
                  />
                </div>
                <Button
                  onClick={handleLocateMe}
                  disabled={isLocating}
                  className="h-14 px-4 bg-primary text-black hover:bg-orange-500 font-bold shrink-0 shadow-lg shadow-primary/20 transition-all"
                >
                  {isLocating ? <Loader2 className="animate-spin h-5 w-5" /> : (
                    <>
                      <MapPin className="mr-2 h-5 w-5" /> Locate Me
                    </>
                  )}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground flex gap-2">
                <Building2 className="h-4 w-4 shrink-0" />
                This location will be used to calculate logistics for {role === 'donor' ? 'NGO pickups' : 'donor deliveries'}. You can edit it manually if the GPS is imprecise.
              </p>
            </div>

            <Button onClick={nextStep} className="w-full h-14 text-lg font-bold mt-8 shadow-xl shadow-primary/20">
              Continue <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}

        {/* STEP 4: ACCOUNT DETAILS */}
        {step === 4 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
            <div className="text-center pt-4">
              <div className="mx-auto h-16 w-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <HandHeart className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold font-headline text-white mb-2">Final Step</h1>
              <p className="text-muted-foreground text-sm">
                {isGooglePending ? 'Almost done! Just tell us your organization name.' : `Secure your ${orgType ? orgType.toUpperCase() : ''} account.`}
              </p>
            </div>

            <div className="space-y-5 bg-[#150d06] p-6 rounded-3xl border border-border/40 mt-8">
              <div className="space-y-2">
                <p className="text-sm font-medium text-white">Organization Name</p>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="e.g., Maria's Kitchen"
                    className="pl-10 h-12 bg-black/40 border-border/40"
                    value={accountParams.name}
                    onChange={e => setAccountParams(p => ({ ...p, name: e.target.value }))}
                  />
                </div>
              </div>

              {!isGooglePending && (
                <>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-white">Email Address</p>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        className="pl-10 h-12 bg-black/40 border-border/40"
                        value={accountParams.email}
                        onChange={e => setAccountParams(p => ({ ...p, email: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-white">Password</p>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="pl-10 h-12 bg-black/40 border-border/40"
                        value={accountParams.password}
                        onChange={e => setAccountParams(p => ({ ...p, password: e.target.value }))}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <Button
              onClick={handleCreateAccount}
              disabled={isLoading || isGooglePending === false && (!accountParams.name || !accountParams.email || !accountParams.password) || isGooglePending === true && !accountParams.name}
              className="w-full h-14 text-lg font-bold mt-8 shadow-xl shadow-primary/20"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : (isGooglePending ? 'Complete Setup' : 'Complete Registration')}
            </Button>

            {!isGooglePending && (
              <>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/40" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[#0f0700] px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full h-14 text-lg font-bold border-border/40 bg-[#150d06] text-white hover:bg-[#1f1208]" onClick={handleGoogleSignUp} disabled={isLoading}>
                  <GoogleIcon />
                  <span className="ml-2">Sign Up with Google</span>
                </Button>
              </>
            )}

            <p className="text-center text-sm text-muted-foreground pt-4">
              Already have an account?{' '}
              <Link href="/login" className="font-bold text-primary hover:underline">Sign in</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

const XIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);
const PlusIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

