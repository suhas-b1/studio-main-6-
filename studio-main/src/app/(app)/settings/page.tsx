'use client';

import { useState, useRef, useEffect } from 'react';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft, Save, ShieldCheck, Fingerprint, Palette,
  Globe, LogOut, HeartHandshake, Loader2, Monitor,
  Smartphone, Laptop, Check, X, Key,
  MapPin, ChevronRight, Scan, Camera, RefreshCw,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { getAuth, signOut, updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential, sendPasswordResetEmail } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/context/settings-context';
import { LANGUAGE_NAMES, type Language } from '@/lib/translations';
import type { Accent, Theme } from '@/context/settings-context';
import { getUserSessions, revokeSession, formatSessionTime, type DeviceSession } from '@/lib/session-tracker';



// ─── TOTP helpers ───────────────────────────────────────────────────────────
async function generateTOTPSecret(): Promise<{ secret: string; otpauth: string; qrDataUrl: string }> {
  const { TOTP, Secret } = await import('otpauth');
  const QRCode = (await import('qrcode')).default;
  const secret = new Secret({ size: 20 });
  const totp = new TOTP({ issuer: 'Nourish Connect', label: 'account', secret });
  const uri = totp.toString();
  const qrDataUrl = await QRCode.toDataURL(uri);
  return { secret: secret.base32, otpauth: uri, qrDataUrl };
}

function verifyTOTP(secret: string, token: string): boolean {
  try {
    const { TOTP, Secret } = require('otpauth');
    const totp = new TOTP({ issuer: 'Nourish Connect', label: 'account', secret: Secret.fromBase32(secret) });
    const delta = totp.validate({ token, window: 1 });
    return delta !== null;
  } catch { return false; }
}

// ─── Sub-components ─────────────────────────────────────────────────────────
const ACCENT_OPTIONS: { id: Accent; color: string; label: string }[] = [
  { id: 'orange', color: '#f97316', label: 'Orange' },
  { id: 'blue', color: '#3b82f6', label: 'Blue' },
  { id: 'emerald', color: '#10b981', label: 'Emerald' },
  { id: 'purple', color: '#8b5cf6', label: 'Purple' },
];

const THEME_OPTIONS: { id: Theme; label: string }[] = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'system', label: 'System' },
];

function SessionIcon({ type }: { type: DeviceSession['icon'] }) {
  if (type === 'phone') return <Smartphone className="w-5 h-5 text-primary" />;
  if (type === 'laptop') return <Laptop className="w-5 h-5 text-primary" />;
  return <Monitor className="w-5 h-5 text-primary" />;
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { theme, setTheme, accent, setAccent, language, setLanguage } = useSettings();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // UI state
  const [isUploading, setIsUploading] = useState(false);
  const [showLangSheet, setShowLangSheet] = useState(false);
  const [sessions, setSessions] = useState<DeviceSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [showSessionsSection, setShowSessionsSection] = useState(false);

  // Biometric state
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);

  // 2FA state
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFAQR, setTwoFAQR] = useState('');
  const [twoFASecret, setTwoFASecret] = useState('');
  const [twoFACode, setTwoFACode] = useState('');
  const [twoFALoading, setTwoFALoading] = useState(false);
  const [twoFAStep, setTwoFAStep] = useState<'qr' | 'verify' | 'done'>('qr');

  // Password change (direct)
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);

  // Forgot password flow
  // Step: 'input' | 'otp' | 'reset'
  const [forgotStep, setForgotStep] = useState<'input' | 'otp' | 'reset'>('input');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotContact, setForgotContact] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  useEffect(() => {
    // Check biometric support
    if (window.PublicKeyCredential && typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
      window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable().then(available => {
        setBiometricSupported(available);
      });
    }
    // Load saved states
    setBiometricEnabled(localStorage.getItem('nc-biometric') === 'true');
    setTwoFAEnabled(!!localStorage.getItem('nc-totp-secret'));
  }, []);

  // Load real sessions from Firestore when section is expanded
  const loadSessions = async () => {
    if (!user) return;
    setSessionsLoading(true);
    try {
      const data = await getUserSessions(user.uid);
      setSessions(data);
    } finally {
      setSessionsLoading(false);
    }
  };

  const handleToggleSessions = async () => {
    if (!showSessionsSection) await loadSessions();
    setShowSessionsSection(v => !v);
  };

  // ── Profile image upload ──────────────────────────────────────────────────
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setIsUploading(true);
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `profiles/${user.uid}`);
      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);
      await updateProfile(user, { photoURL });
      toast({ title: '✅ Profile picture updated!' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Upload failed', description: err.message });
    } finally {
      setIsUploading(false);
    }
  };

  // ── Biometric ──────────────────────────────────────────────────────────────
  const handleBiometricToggle = async (enabled: boolean) => {
    if (!biometricSupported) {
      toast({ variant: 'destructive', title: 'Not supported', description: 'Your device does not support biometric authentication.' });
      return;
    }
    setBiometricLoading(true);
    try {
      if (enabled) {
        // Register credential
        const challenge = new Uint8Array(32);
        crypto.getRandomValues(challenge);
        const credential = await navigator.credentials.create({
          publicKey: {
            challenge,
            rp: { name: 'Nourish Connect', id: window.location.hostname },
            user: { id: new Uint8Array(16), name: user?.email || 'user', displayName: user?.displayName || 'User' },
            pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
            authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required' },
            timeout: 60000,
          },
        });
        if (credential) {
          localStorage.setItem('nc-biometric', 'true');
          setBiometricEnabled(true);
          toast({ title: '✅ Biometric login enabled!' });
        }
      } else {
        localStorage.removeItem('nc-biometric');
        setBiometricEnabled(false);
        toast({ title: 'Biometric login disabled.' });
      }
    } catch (err: any) {
      if (err.name !== 'NotAllowedError') {
        toast({ variant: 'destructive', title: 'Biometric error', description: err.message });
      }
    } finally {
      setBiometricLoading(false);
    }
  };

  // ── 2FA ────────────────────────────────────────────────────────────────────
  const handleOpen2FA = async () => {
    if (twoFAEnabled) {
      // Disable 2FA
      localStorage.removeItem('nc-totp-secret');
      setTwoFAEnabled(false);
      toast({ title: '2FA disabled.' });
      return;
    }
    setTwoFALoading(true);
    setTwoFAStep('qr');
    try {
      const { secret, qrDataUrl } = await generateTOTPSecret();
      setTwoFASecret(secret);
      setTwoFAQR(qrDataUrl);
      setTwoFACode('');
      setShow2FAModal(true);
    } catch (err) {
      toast({ variant: 'destructive', title: 'Failed to generate QR code' });
    } finally {
      setTwoFALoading(false);
    }
  };

  const handleVerify2FA = () => {
    if (!verifyTOTP(twoFASecret, twoFACode)) {
      toast({ variant: 'destructive', title: 'Invalid code', description: 'The 6-digit code is wrong. Try again.' });
      return;
    }
    localStorage.setItem('nc-totp-secret', twoFASecret);
    setTwoFAEnabled(true);
    setTwoFAStep('done');
    setTimeout(() => setShow2FAModal(false), 1500);
    toast({ title: '✅ Two-Factor Auth enabled!' });
  };

  // ── Sessions ───────────────────────────────────────────────────────────────
  const logOutSession = async (id: string) => {
    await revokeSession(id);
    setSessions(prev => prev.filter(s => s.id !== id));
    toast({ title: '✅ Device logged out.' });
  };

  // ── Password change ────────────────────────────────────────────────────────
  const handleChangePassword = async () => {
    if (!user?.email) return;
    if (newPwd !== confirmPwd) {
      toast({ variant: 'destructive', title: 'Passwords do not match', description: 'New password and confirm password must be the same.' });
      return;
    }
    if (newPwd.length < 8) {
      toast({ variant: 'destructive', title: 'Too short', description: 'Password must be at least 8 characters.' });
      return;
    }
    setPwdLoading(true);
    try {
      const cred = EmailAuthProvider.credential(user.email, oldPwd);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, newPwd);
      toast({ title: '✅ Password updated!' });
      setShowPasswordModal(false);
      setOldPwd(''); setNewPwd(''); setConfirmPwd('');
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Failed', description: err.message });
    } finally {
      setPwdLoading(false);
    }
  };

  // ── Forgot Password flow ────────────────────────────────────────────────────
  const openForgotPassword = () => {
    setShowPasswordModal(false);
    setForgotContact(user?.email || '');
    setShowForgotModal(true);
  };


  const handleSendResetLink = async () => {
    if (!forgotContact.trim()) return;
    setForgotLoading(true);
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, forgotContact.trim());
      toast({ title: '✅ Reset link sent!', description: `Check your inbox (and spam folder) at ${forgotContact}.` });
      setShowForgotModal(false);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Failed to send link', description: err.message });
    } finally {
      setForgotLoading(false);
    }
  };

  // ── Sign out ───────────────────────────────────────────────────────────────
  const handleSignOut = async () => {
    const auth = getAuth();
    await signOut(auth);
    router.push('/login');
  };

  if (isUserLoading) return null;

  const rowBase = 'p-4 flex items-center justify-between mx-4 px-0';
  const borderB = 'border-b border-border';
  const iconBox = 'p-2 rounded-lg bg-muted';

  return (
    <div className="min-h-[calc(100vh-6rem)] bg-background text-foreground font-sans pb-24">

      {/* ── Header ── */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between px-4 bg-background/90 backdrop-blur-sm border-b border-border">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-muted-foreground hover:text-foreground flex items-center">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold text-foreground tracking-wide">Settings</h1>
        <button
          onClick={() => toast({ title: '✅ Preferences saved!' })}
          className="p-2 -mr-2 text-primary hover:text-orange-400"
        >
          <Save className="w-5 h-5" />
        </button>
      </header>

      <div className="px-4 mt-6 space-y-8 max-w-2xl mx-auto">

        {/* ── Profile ── */}
        <div className="flex items-center gap-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center cursor-pointer overflow-hidden group"
          >
            {isUploading ? (
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            ) : user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <HeartHandshake className="w-8 h-8 text-primary" />
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">{user?.displayName || 'Nourish User'}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="text-xs text-primary mt-1 hover:underline flex items-center gap-1"
            >
              <Key className="w-3 h-3" /> Change Password
            </button>
          </div>
        </div>

        {/* ── Security ── */}
        <section>
          <h3 className="text-xs font-bold text-muted-foreground tracking-wider uppercase mb-3">Security</h3>
          <Card className="bg-card border-border overflow-hidden shadow-md">
            {/* 2FA */}
            <div className={`${rowBase} ${borderB}`}>
              <div className="flex items-center gap-3">
                <div className={iconBox}><ShieldCheck className="w-5 h-5 text-primary" /></div>
                <div>
                  <p className="font-semibold text-foreground text-sm">Two-Factor Auth</p>
                  <p className="text-xs text-muted-foreground">Authenticator app (TOTP)</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {twoFAEnabled && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">ON</span>}
                {twoFALoading ? <Loader2 className="w-5 h-5 animate-spin text-primary" /> : (
                  <Switch
                    checked={twoFAEnabled}
                    onCheckedChange={handleOpen2FA}
                    className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-stone-700"
                  />
                )}
              </div>
            </div>

            {/* Biometric */}
            <div className={`${rowBase} ${borderB}`}>
              <div className="flex items-center gap-3">
                <div className={iconBox}><Fingerprint className="w-5 h-5 text-primary" /></div>
                <div>
                  <p className="font-semibold text-foreground text-sm">Biometric Login</p>
                  <p className="text-xs text-muted-foreground">
                    {biometricSupported ? 'Face ID / Fingerprint / Passkey' : 'Not supported on this device'}
                  </p>
                </div>
              </div>
              {biometricLoading ? <Loader2 className="w-5 h-5 animate-spin text-primary" /> : (
                <Switch
                  checked={biometricEnabled}
                  onCheckedChange={handleBiometricToggle}
                  disabled={!biometricSupported}
                  className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-stone-700 disabled:opacity-40"
                />
              )}
            </div>

            {/* Active Sessions */}
            <button
              onClick={handleToggleSessions}
              className={`${rowBase} w-full text-left hover:bg-muted/50 transition-colors`}
            >
              <div className="flex items-center gap-3">
                <div className={iconBox}><MapPin className="w-5 h-5 text-primary" /></div>
                <div>
                  <p className="font-semibold text-foreground text-sm">Where Am I Logged In</p>
                  <p className="text-xs text-muted-foreground">{sessions.length} active session{sessions.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${showSessionsSection ? 'rotate-90' : ''}`} />
            </button>

            {/* Sessions List */}
            {showSessionsSection && (
              <div className="px-4 pb-4 space-y-3">
                {sessionsLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <span className="text-xs text-muted-foreground ml-2">Loading sessions…</span>
                  </div>
                ) : sessions.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No active sessions found.</p>
                ) : sessions.map(session => (
                  <div key={session.id} className="rounded-xl border border-border bg-background p-3 flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-muted shrink-0">
                      <SessionIcon type={session.icon} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-foreground truncate">{session.device}</span>
                        {session.os && <span className="text-[10px] text-muted-foreground">{session.os}</span>}
                        {session.isCurrent && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">This device</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{session.browser} · {session.location}</p>
                      <p className="text-xs text-muted-foreground/60">{formatSessionTime(session.lastActive)}</p>
                    </div>
                    {!session.isCurrent && (
                      <div className="flex flex-col gap-1 shrink-0">
                        <button
                          onClick={() => logOutSession(session.id)}
                          className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors"
                        >
                          Log Out
                        </button>
                        <button
                          onClick={() => toast({ title: '✅ Marked as trusted.' })}
                          className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-colors"
                        >
                          It was me
                        </button>
                        <button
                          onClick={() => setShowPasswordModal(true)}
                          className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-orange-500/15 text-orange-400 hover:bg-orange-500/25 transition-colors"
                        >
                          Change Pwd
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                <button
                  onClick={loadSessions}
                  className="w-full flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground py-2 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" /> Refresh sessions
                </button>
              </div>
            )}
          </Card>
        </section>

        {/* ── Appearance ── */}
        <section>
          <h3 className="text-xs font-bold text-muted-foreground tracking-wider uppercase mb-3">Appearance</h3>
          <Card className="bg-card border-border overflow-hidden shadow-md">
            {/* Theme */}
            <div className={`p-4 mx-4 px-0 ${borderB} space-y-4`}>
              <div className="flex items-center gap-3 mb-2">
                <div className={iconBox}><Palette className="w-5 h-5 text-primary" /></div>
                <p className="font-semibold text-foreground text-sm">Display Theme</p>
              </div>
              <div className="flex rounded-lg overflow-hidden bg-muted border border-border p-1 gap-1">
                {THEME_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setTheme(opt.id)}
                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${theme === opt.id
                      ? 'text-primary-foreground bg-primary shadow-sm shadow-primary/30'
                      : 'text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Accent color */}
            <div className={`${rowBase}`}>
              <div className="flex items-center gap-3">
                <div className={iconBox}><Palette className="w-5 h-5 text-primary" /></div>
                <p className="font-semibold text-foreground text-sm">Accent Color</p>
              </div>
              <div className="flex gap-2.5">
                {ACCENT_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setAccent(opt.id)}
                    className={`w-7 h-7 rounded-full transition-all ${accent === opt.id ? 'ring-2 ring-foreground/40 ring-offset-2 ring-offset-card scale-110' : 'opacity-70 hover:opacity-100'
                      }`}
                    style={{ backgroundColor: opt.color }}
                    title={opt.label}
                  />
                ))}
              </div>
            </div>
          </Card>
        </section>

        {/* ── App Preferences ── */}
        <section>
          <h3 className="text-xs font-bold text-muted-foreground tracking-wider uppercase mb-3">App Preferences</h3>
          <Card className="bg-card border-border overflow-hidden shadow-md">
            <button
              onClick={() => setShowLangSheet(true)}
              className={`${rowBase} w-full text-left hover:bg-muted/50 transition-colors`}
            >
              <div className="flex items-center gap-3">
                <div className={iconBox}><Globe className="w-5 h-5 text-primary" /></div>
                <p className="font-semibold text-foreground text-sm">Language</p>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="text-sm">{LANGUAGE_NAMES[language as Language]}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>
          </Card>
        </section>

        {/* ── Sign Out ── */}
        <button
          onClick={handleSignOut}
          className="w-full py-4 mt-4 bg-destructive/5 hover:bg-destructive/10 border border-destructive/20 rounded-xl flex items-center justify-center gap-3 text-destructive font-semibold transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════
           MODALS & SHEETS
         ══════════════════════════════════════════════════════ */}

      {/* ── Language Sheet ── */}
      {showLangSheet && (
        <div className="fixed inset-0 z-50 flex items-end" onClick={() => setShowLangSheet(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-2xl mx-auto bg-card rounded-t-3xl p-6 max-h-[70vh] overflow-y-auto border-t border-border"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-5" />
            <h2 className="text-lg font-bold text-foreground mb-4">Select Language</h2>
            <div className="space-y-1">
              {(Object.entries(LANGUAGE_NAMES) as [Language, string][]).map(([code, name]) => (
                <button
                  key={code}
                  onClick={() => { setLanguage(code); setShowLangSheet(false); toast({ title: `Language changed to ${name}` }); }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-between ${language === code
                    ? 'bg-primary/20 text-primary font-bold'
                    : 'text-foreground hover:bg-muted/50'
                    }`}
                >
                  {name}
                  {language === code && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 2FA Modal ── */}
      {show2FAModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShow2FAModal(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShow2FAModal(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>

            {twoFAStep === 'qr' && (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-bold text-foreground">Set Up Authenticator</h2>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  Scan this QR code with <b className="text-foreground">Google Authenticator</b>, <b className="text-foreground">Authy</b>, or any TOTP app.
                </p>
                <div className="flex justify-center mb-4">
                  {twoFAQR ? (
                    <img src={twoFAQR} alt="2FA QR" className="w-48 h-48 rounded-xl bg-white p-2" />
                  ) : (
                    <div className="w-48 h-48 rounded-xl bg-muted flex items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground text-center mb-4">
                  Or enter this code manually:<br />
                  <span className="font-mono text-foreground text-sm break-all">{twoFASecret}</span>
                </p>
                <button
                  onClick={() => setTwoFAStep('verify')}
                  className="w-full py-3 bg-primary rounded-xl text-white font-semibold text-sm hover:bg-primary/90 transition-colors"
                >
                  Next — Enter Code
                </button>
              </>
            )}

            {twoFAStep === 'verify' && (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <Scan className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-bold text-foreground">Verify Code</h2>
                </div>
                <p className="text-xs text-muted-foreground mb-4">Enter the 6-digit code from your authenticator app to confirm setup.</p>
                <input
                  type="number"
                  maxLength={6}
                  value={twoFACode}
                  onChange={e => setTwoFACode(e.target.value.slice(0, 6))}
                  placeholder="000000"
                  className="w-full bg-background border border-primary/30 rounded-xl px-4 py-3 text-center text-2xl font-mono text-foreground tracking-[0.5em] focus:outline-none focus:border-primary mb-4"
                  autoFocus
                />
                <button
                  onClick={handleVerify2FA}
                  disabled={twoFACode.length !== 6}
                  className="w-full py-3 bg-primary rounded-xl text-white font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  Verify & Enable
                </button>
              </>
            )}

            {twoFAStep === 'done' && (
              <div className="flex flex-col items-center py-6 gap-3">
                <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center">
                  <Check className="w-8 h-8 text-emerald-400" />
                </div>
                <p className="text-lg font-bold text-foreground">2FA Enabled!</p>
                <p className="text-xs text-muted-foreground text-center">Your account is now protected with two-factor authentication.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Password Change Modal ── */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowPasswordModal(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowPasswordModal(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 mb-1">
              <Key className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">Change Password</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Enter your current password, then set a new one.</p>
            <div className="space-y-3 mb-2">
              <input
                type="password"
                placeholder="Current password"
                value={oldPwd}
                onChange={e => setOldPwd(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
              <input
                type="password"
                placeholder="New password (min 8 characters)"
                value={newPwd}
                onChange={e => setNewPwd(e.target.value)}
                className={`w-full bg-background border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary ${newPwd && confirmPwd && newPwd !== confirmPwd ? 'border-destructive' : 'border-border'}`}
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPwd}
                onChange={e => setConfirmPwd(e.target.value)}
                className={`w-full bg-background border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary ${confirmPwd && newPwd !== confirmPwd ? 'border-destructive' : 'border-border'}`}
              />
              {confirmPwd && newPwd !== confirmPwd && (
                <p className="text-xs text-destructive">Passwords do not match</p>
              )}
            </div>
            {/* Forgot Password link */}
            <div className="flex justify-end mb-4">
              <button
                onClick={openForgotPassword}
                className="text-xs text-primary hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <button
              onClick={handleChangePassword}
              disabled={pwdLoading || !oldPwd || newPwd.length < 8 || newPwd !== confirmPwd}
              className="w-full py-3 bg-primary rounded-xl text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {pwdLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
              Update Password
            </button>
          </div>
        </div>
      )}

      {/* ── Forgot Password Modal (multi-step) ── */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowForgotModal(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowForgotModal(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>

            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-5">
              {['input', 'otp', 'reset'].map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${forgotStep === s ? 'bg-primary text-primary-foreground' : ['input', 'otp', 'reset'].indexOf(forgotStep) > i ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                    {['input', 'otp', 'reset'].indexOf(forgotStep) > i ? '✓' : i + 1}
                  </div>
                  {i < 2 && <div className={`flex-1 h-0.5 w-6 ${['input', 'otp', 'reset'].indexOf(forgotStep) > i ? 'bg-emerald-500' : 'bg-muted'}`} />}
                </div>
              ))}
              <span className="ml-1 text-xs text-muted-foreground">
                {forgotStep === 'input' ? 'Contact' : forgotStep === 'otp' ? 'Verify OTP' : 'New Password'}
              </span>
            </div>

            {/* Step 1: Email or Phone */}
            {forgotStep === 'input' && (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <Key className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-bold text-foreground">Forgot Password</h2>
                </div>
                <p className="text-xs text-muted-foreground mb-4">Enter your registered email address. We'll send you a password reset link.</p>
                <input
                  type="email"
                  placeholder="Email address"
                  value={forgotContact}
                  onChange={e => setForgotContact(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary mb-4"
                  autoFocus
                />
                <button
                  onClick={handleSendResetLink}
                  disabled={forgotLoading || !forgotContact.trim() || !forgotContact.includes('@')}
                  className="w-full py-3 bg-primary rounded-xl text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {forgotLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Send Reset Link
                </button>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
