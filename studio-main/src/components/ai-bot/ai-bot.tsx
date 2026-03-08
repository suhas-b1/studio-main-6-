'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDonations } from '@/context/donations-context';
import { useUser } from '@/firebase';
import { chatWithAIAction, type ChatMessage } from '@/app/ai-chat-action';
import { cn } from '@/lib/utils';
import {
    X, Send, Image as ImageIcon, Mic, Trash2,
    ChevronDown, Bot, Sparkles, Loader2, ArrowRight,
    Package, MapPin, BarChart2, HeartHandshake, Settings, CheckCircle
} from 'lucide-react';
import Image from 'next/image';
import type { UserRole } from '@/lib/types';
import { mockUsers } from '@/lib/mock-data';

/* ── Quick action chips ──────────────────────────────────── */
const DONOR_CHIPS = ['Find nearby NGOs', 'List a donation', 'See my impact', 'Open Food Aid Map'];
const NGO_CHIPS = ['Find food near me', 'Track my claims', 'Show urgent donations', 'Smart match me'];

/* ── Parse actions from AI response ───────────── */
function parseActions(text: string) {
    const actions: { path: string; label: string }[] = [];
    const showDonationIds: string[] = [];
    let claimDonationId: string | null = null;
    let createDonationPayload: any = null;

    let cleanText = text.replace(/NAV_ACTION:\s*([^\s|]+)\s*\|\s*(.+)/g, (_, path, label) => {
        actions.push({ path: path.trim(), label: label.trim() });
        return '';
    });

    cleanText = cleanText.replace(/ACTION:\s*SHOW_DONATIONS\s*\|\s*([^\n]+)/g, (_, ids) => {
        showDonationIds.push(...ids.split(',').map((id: string) => id.trim()));
        return '';
    });

    cleanText = cleanText.replace(/ACTION:\s*CLAIM_DONATION\s*\|\s*([^\n]+)/g, (_, id) => {
        claimDonationId = id.trim();
        return '';
    });

    cleanText = cleanText.replace(/ACTION:\s*CREATE_DONATION\s*\|\s*(\{[\s\S]*?\})/g, (_, jsonStr) => {
        try { createDonationPayload = JSON.parse(jsonStr.trim()); } catch { }
        return '';
    });

    // Legacy JSON support
    cleanText = cleanText.replace(/```action\n([\s\S]*?)```/g, (_, json) => {
        try {
            const a = JSON.parse(json.trim());
            if (a.type === 'navigate') actions.push({ path: a.path, label: a.label });
        } catch { }
        return '';
    });

    return { cleanText: cleanText.trim(), actions, showDonationIds, claimDonationId, createDonationPayload };
}

/* ── Render markdown-lite ────────────────────────────────── */
function MarkdownText({ text }: { text: string }) {
    const lines = text.split('\n');
    return (
        <div className="space-y-1 text-sm leading-relaxed">
            {lines.map((line, i) => {
                if (line.startsWith('## ')) return <p key={i} className="font-black text-foreground text-base mt-2">{line.slice(3)}</p>;
                if (line.startsWith('### ')) return <p key={i} className="font-bold text-foreground mt-1">{line.slice(4)}</p>;
                if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="font-bold text-foreground">{line.slice(2, -2)}</p>;
                if (line.startsWith('- ') || line.startsWith('• ')) {
                    const content = line.slice(2);
                    return (
                        <div key={i} className="flex gap-2">
                            <span className="text-primary mt-0.5 flex-shrink-0">•</span>
                            <span dangerouslySetInnerHTML={{ __html: content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                        </div>
                    );
                }
                if (!line.trim()) return <div key={i} className="h-1" />;
                return (
                    <p key={i} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                );
            })}
        </div>
    );
}

/* ── Main AiBot component ────────────────────────────────── */
export function AiBot() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImgPrev] = useState<string | null>(null);
    const [showChips, setShowChips] = useState(true);

    const fileRef = useRef<HTMLInputElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const { donations, claimDonation, addDonation } = useDonations();
    const { user } = useUser();
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const role = (searchParams.get('role') as UserRole) || 'donor';

    /* Auto-scroll */
    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

    /* Focus input when opened */
    useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 300); }, [open]);

    /* Build app context for AI */
    const buildContext = useCallback(() => {
        const mockUser = mockUsers.find(u => u.id === user?.uid) || mockUsers[0];
        return {
            role,
            userName: mockUser?.organizationName || user?.email || 'User',
            userAddress: mockUser?.address,
            userPhone: mockUser?.phone,
            currentPage: pathname,
            availableDonations: donations
                .filter(d => d.status === 'available')
                .map(d => ({
                    id: d.id,
                    title: d.title,
                    type: d.type,
                    quantity: d.quantity,
                    distance: d.distance ?? 0,
                    location: (d as any).location ?? '',
                    status: d.status,
                    donorName: d.donor?.organizationName || 'Donor',
                })),
            userDonations: donations
                .filter(d => d.donorId === user?.uid)
                .map(d => ({ id: d.id, title: d.title, status: d.status, quantity: d.quantity })),
            userClaims: donations
                .filter(d => d.claimedByNgoId === user?.uid)
                .map(d => ({ id: d.id, title: d.title, status: d.status })),
        };
    }, [donations, user, role, pathname]);

    /* Handle image upload */
    const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => setImgPrev(reader.result as string);
        reader.readAsDataURL(file);
    };

    /* Send message */
    const send = async (text?: string) => {
        const content = (text ?? input).trim();
        if (!content && !imagePreview) return;

        const userMsg: ChatMessage = { role: 'user', content, imageDataUri: imagePreview ?? undefined };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInput('');
        setImgPrev(null);
        setLoading(true);
        setShowChips(false);

        const { reply, error } = await chatWithAIAction(newMessages, buildContext());
        setLoading(false);

        if (error) {
            setMessages(m => [...m, { role: 'assistant', content: `⚠️ ${error}` }]);
        } else {
            const parsed = parseActions(reply);

            // Execute mutations immediately upon receiving the AI's intent
            if (parsed.claimDonationId && user?.uid) {
                claimDonation(parsed.claimDonationId, user.uid);
            }
            if (parsed.createDonationPayload && user?.uid) {
                const p = parsed.createDonationPayload;
                addDonation({
                    id: `ai-donation-${Date.now()}`,
                    title: p.title || 'Donation via AI',
                    description: p.description || '',
                    quantity: p.quantity || '1',
                    type: p.type || 'Produce',
                    pickupDeadline: p.pickupDeadline ? new Date(p.pickupDeadline) : new Date(Date.now() + 86400000 * 3),
                    donorId: user.uid,
                    donor: mockUsers.find((u) => u.id === user.uid) || mockUsers[0],
                    status: 'available',
                    createdAt: new Date(),
                    distance: 0,
                    imageUrl: imagePreview || 'https://placehold.co/600x400',
                    imageHint: 'ai generated'
                });
            }

            setMessages(m => [...m, { role: 'assistant', content: reply }]);
        }
    };

    /* Navigate from AI action button */
    const navigate = (path: string) => {
        router.push(`${path}?role=${role}`);
        setOpen(false);
    };

    const chips = role === 'donor' ? DONOR_CHIPS : NGO_CHIPS;

    return (
        <>
            {/* ── Floating robot button ────────────────────── */}
            <button
                onClick={() => setOpen(o => !o)}
                className={cn(
                    'fixed bottom-6 right-6 z-[2000] h-14 w-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300',
                    open ? 'scale-90 rotate-12' : 'hover:scale-110 hover:-rotate-6 animate-pulse-orange'
                )}
                style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)', boxShadow: '0 4px 24px rgba(249,115,22,0.5)' }}
                title="Nourish AI Assistant"
            >
                {open
                    ? <X className="h-6 w-6 text-white" />
                    : (
                        <svg viewBox="0 0 24 24" className="h-7 w-7 text-white" fill="currentColor">
                            <path d="M20 9V7c0-1.1-.9-2-2-2h-3V3h-2v2H9V3H7v2H4c-1.1 0-2 .9-2 2v2H0v2h2v2H0v2h2v2c0 1.1.9 2 2 2h3v2h2v-2h2v2h2v-2h3c1.1 0 2-.9 2-2v-2h2v-2h-2v-2h2V9h-2zm-2 10H6V7h12v12z" />
                            <circle cx="9" cy="12" r="1.5" />
                            <circle cx="15" cy="12" r="1.5" />
                            <path d="M8 15.5h8c-.5 1.5-2 2.5-4 2.5s-3.5-1-4-2.5z" />
                        </svg>
                    )
                }
                {/* Notification dot */}
                {!open && (
                    <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-green-400 border-2 border-background animate-pulse" />
                )}
            </button>

            {/* ── Chat panel ───────────────────────────────── */}
            <div
                className={cn(
                    'fixed bottom-24 right-6 z-[1999] w-[360px] max-w-[calc(100vw-3rem)] flex flex-col rounded-2xl border border-border shadow-2xl transition-all duration-300 origin-bottom-right',
                    open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
                )}
                style={{ height: '560px', background: 'rgba(15,7,0,0.97)', backdropFilter: 'blur(20px)' }}
            >
                {/* Header */}
                <div
                    className="flex items-center gap-3 px-4 py-3 rounded-t-2xl flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}
                >
                    <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                        <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="currentColor">
                            <path d="M20 9V7c0-1.1-.9-2-2-2h-3V3h-2v2H9V3H7v2H4c-1.1 0-2 .9-2 2v2H0v2h2v2H0v2h2v2c0 1.1.9 2 2 2h3v2h2v-2h2v2h2v-2h3c1.1 0 2-.9 2-2v-2h2v-2h-2v-2h2V9h-2zm-2 10H6V7h12v12z" />
                            <circle cx="9" cy="12" r="1.5" />
                            <circle cx="15" cy="12" r="1.5" />
                            <path d="M8 15.5h8c-.5 1.5-2 2.5-4 2.5s-3.5-1-4-2.5z" />
                        </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-black text-white text-sm leading-tight">Nourish AI</p>
                        <p className="text-[10px] text-white/80">Powered by Gemini 2.5 Flash • Full App Access</p>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-green-300 animate-pulse" />
                        <span className="text-[10px] text-white/80 font-medium">Online</span>
                    </div>
                    {messages.length > 0 && (
                        <button onClick={() => { setMessages([]); setShowChips(true); }} title="Clear chat" className="ml-1 text-white/70 hover:text-white transition">
                            <Trash2 className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 min-h-0">
                    {/* Welcome state */}
                    {messages.length === 0 && (
                        <div className="text-center py-4 space-y-3">
                            <div className="h-14 w-14 rounded-2xl mx-auto flex items-center justify-center" style={{ background: 'rgba(249,115,22,0.15)' }}>
                                <Sparkles className="h-7 w-7 text-primary" />
                            </div>
                            <div>
                                <p className="font-black text-foreground text-base">
                                    Hi! I'm Nourish AI 🤖
                                </p>
                                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                    I have <strong className="text-primary">full access</strong> to NourishConnect — donations, matches, map, claims & more. Ask me anything or upload a food photo!
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Quick chip suggestions */}
                    {showChips && (
                        <div className="flex flex-wrap gap-2">
                            {chips.map(chip => (
                                <button
                                    key={chip}
                                    onClick={() => send(chip)}
                                    className="text-[11px] font-semibold px-3 py-1.5 rounded-full border border-primary/30 text-primary bg-primary/5 hover:bg-primary/15 transition"
                                >
                                    {chip}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Conversation */}
                    {messages.map((msg, i) => {
                        if (msg.role === 'user') {
                            return (
                                <div key={i} className="flex justify-end gap-2">
                                    <div className="max-w-[80%] space-y-2">
                                        {msg.imageDataUri && (
                                            <div className="relative h-32 w-full rounded-xl overflow-hidden">
                                                <Image src={msg.imageDataUri} alt="Food" fill className="object-cover" />
                                            </div>
                                        )}
                                        {msg.content && (
                                            <div className="rounded-2xl rounded-tr-sm px-3 py-2 text-sm text-white" style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}>
                                                {msg.content}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        }

                        // Assistant message
                        const { cleanText, actions, showDonationIds, claimDonationId, createDonationPayload } = parseActions(msg.content);
                        const currentMockUser = mockUsers.find(u => u.id === user?.uid) || mockUsers[0];
                        return (
                            <div key={i} className="flex gap-2">
                                <div className="h-7 w-7 rounded-full flex-shrink-0 flex items-center justify-center mt-1" style={{ background: 'rgba(249,115,22,0.15)' }}>
                                    <Bot className="h-3.5 w-3.5 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0 space-y-2">
                                    <div className="rounded-2xl rounded-tl-sm px-3 py-2.5 border border-border text-muted-foreground" style={{ background: 'rgba(30,15,0,0.8)' }}>
                                        <MarkdownText text={cleanText} />
                                    </div>
                                    {/* Navigation action buttons */}
                                    {actions.map((a, ai) => (
                                        <button
                                            key={ai}
                                            onClick={() => navigate(a.path)}
                                            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs font-bold text-white transition hover:opacity-90"
                                            style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}
                                        >
                                            <ArrowRight className="h-3.5 w-3.5 flex-shrink-0" />
                                            {a.label}
                                        </button>
                                    ))}
                                    {/* Show Donations Inline */}
                                    {showDonationIds.length > 0 && (
                                        <div className="space-y-2 mt-2">
                                            {donations.filter(d => showDonationIds.includes(d.id)).map(d => (
                                                <div key={d.id} className="rounded-xl bg-[#1a110a] border border-border p-3 flex gap-3">
                                                    <div className="h-12 w-12 rounded-lg relative overflow-hidden flex-shrink-0">
                                                        <Image src={d.imageUrl} alt={d.title} fill className="object-cover" />
                                                    </div>
                                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                        <p className="font-bold text-white text-sm truncate">{d.title}</p>
                                                        <p className="text-[11px] text-muted-foreground">{d.quantity} • {d.distance}km away</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {/* Action Confirmed Signals */}
                                    {claimDonationId && (
                                        <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-3 flex items-center gap-3 mt-2">
                                            <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-green-400">Order Automatically Placed</p>
                                                <p className="text-[10px] text-green-400/80 truncate">Delivery to: {currentMockUser?.address}</p>
                                            </div>
                                        </div>
                                    )}
                                    {createDonationPayload && (
                                        <div className="rounded-xl border border-primary/30 bg-primary/10 p-3 flex items-center gap-3 mt-2">
                                            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                                <CheckCircle className="h-4 w-4 text-primary" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-primary">Donation Automatically Listed</p>
                                                <p className="text-[10px] text-primary/80 truncate">Pickup at: {currentMockUser?.address}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {/* Loading indicator */}
                    {loading && (
                        <div className="flex gap-2">
                            <div className="h-7 w-7 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: 'rgba(249,115,22,0.15)' }}>
                                <Bot className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <div className="rounded-2xl rounded-tl-sm px-4 py-3 border border-border" style={{ background: 'rgba(30,15,0,0.8)' }}>
                                <div className="flex items-center gap-1.5">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Image preview strip */}
                {imagePreview && (
                    <div className="px-4 pb-2 flex-shrink-0">
                        <div className="relative inline-block">
                            <div className="relative h-16 w-20 rounded-lg overflow-hidden border border-primary/40">
                                <Image src={imagePreview} alt="Food" fill className="object-cover" />
                            </div>
                            <button
                                onClick={() => setImgPrev(null)}
                                className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive flex items-center justify-center"
                            >
                                <X className="h-3 w-3 text-white" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Input row */}
                <div className="px-3 pb-3 flex-shrink-0">
                    <div className="flex items-end gap-2 rounded-xl border border-border p-2" style={{ background: 'rgba(30,15,0,0.8)' }}>
                        {/* Image upload */}
                        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
                        <button
                            onClick={() => fileRef.current?.click()}
                            className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 hover:bg-primary/10 transition"
                            title="Upload food photo"
                        >
                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        </button>

                        {/* Text input */}
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                            placeholder="Ask anything about food donations…"
                            rows={1}
                            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none leading-5 max-h-24 overflow-y-auto py-1.5"
                        />

                        {/* Send */}
                        <button
                            onClick={() => send()}
                            disabled={loading || (!input.trim() && !imagePreview)}
                            className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 transition disabled:opacity-40"
                            style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}
                        >
                            {loading ? <Loader2 className="h-4 w-4 text-white animate-spin" /> : <Send className="h-4 w-4 text-white" />}
                        </button>
                    </div>
                    <p className="text-[9px] text-center text-muted-foreground mt-1.5">
                        Powered by Gemini 2.5 Flash · Full NourishConnect access
                    </p>
                </div>
            </div>
        </>
    );
}
