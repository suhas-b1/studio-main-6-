'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft, Share2, Flame, ShieldCheck, HeartHandshake, ChevronRight, HelpCircle, Shield, FileText, BadgeCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function TrustAndAchievementPage() {
    const router = useRouter();

    const reviews = [
        {
            name: "Green Hope Food Bank",
            text: "Consistently provides high-quality surplus. Their logistics are always on point.",
            avatar: "/avatars/ghfb.jpg",
            initials: "GH"
        },
        {
            name: "City Shelter",
            text: "Amazing community support. The communication is seamless and quick.",
            avatar: "/avatars/cs.jpg",
            initials: "CS"
        }
    ];

    return (
        <div className="min-h-[calc(100vh-6rem)] bg-[#0f0700] text-stone-200 font-sans pb-10">
            {/* Custom Header */}
            <header className="sticky top-0 z-30 flex h-16 items-center justify-between px-4 bg-[#0f0700]/90 backdrop-blur-sm">
                <button onClick={() => router.back()} className="p-2 -ml-2 text-stone-300 hover:text-white">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h1 className="text-lg font-semibold text-white tracking-wide">Trust & Achievement</h1>
                <button className="p-2 -mr-2 text-primary hover:text-orange-400">
                    <Share2 className="w-5 h-5" />
                </button>
            </header>

            <div className="px-4 mt-6 space-y-8 max-w-2xl mx-auto">

                {/* Trust Score Gauge */}
                <div className="flex flex-col items-center relative py-6">
                    {/* Semi-circle SVG background */}
                    <svg viewBox="0 0 200 100" className="w-[200px] h-[100px] absolute top-1">
                        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#2a1a0c" strokeWidth="16" strokeLinecap="round" />
                        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#f97316" strokeWidth="16" strokeLinecap="round" strokeDasharray="251.2" strokeDashoffset="50" />
                    </svg>

                    <div className="mt-8 text-center relative z-10">
                        <div className="text-5xl font-bold text-primary tracking-tight">850</div>
                        <div className="text-[10px] font-bold text-stone-400 tracking-[0.2em] uppercase mt-1">Trust Score</div>
                    </div>

                    <div className="mt-6 bg-[#2a1a0c] text-primary px-4 py-1.5 rounded-full text-sm font-semibold border border-primary/20">
                        Excellent Reliability
                    </div>
                </div>

                {/* Donation Streak */}
                <Card className="bg-[#1a1008] border-primary/20 p-5 shadow-lg relative overflow-hidden flex items-center justify-between">
                    <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.5)]">
                                <Flame className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-stone-400 tracking-wide">Donation Streak</div>
                            <div className="text-2xl font-bold text-white tracking-tight">15 Days</div>
                        </div>
                    </div>
                    <div className="text-right relative z-10">
                        <div className="text-[10px] font-bold text-stone-500 tracking-wider uppercase">Next Milestone</div>
                        <div className="text-sm font-bold text-stone-300">20 Days</div>
                    </div>
                </Card>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-[#1a1008] border-primary/10 p-5 shadow-md flex flex-col justify-center gap-3">
                        <ShieldCheck className="w-6 h-6 text-primary" />
                        <div>
                            <div className="text-xs text-stone-400 font-medium tracking-wide">Verified Since</div>
                            <div className="text-xl font-bold text-white tracking-tight">Oct 2021</div>
                        </div>
                    </Card>
                    <Card className="bg-[#1a1008] border-primary/10 p-5 shadow-md flex flex-col justify-center gap-3">
                        <HeartHandshake className="w-6 h-6 text-primary" />
                        <div>
                            <div className="text-xs text-stone-400 font-medium tracking-wide">NGO Partnerships</div>
                            <div className="text-xl font-bold text-white tracking-tight">24 Active</div>
                        </div>
                    </Card>
                </div>

                {/* Reviews Section */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-white tracking-tight">Reviews from NGOs</h3>
                        <button className="text-sm text-primary font-semibold hover:text-orange-400 transition-colors">View all</button>
                    </div>

                    {/* Horizontal Scroll Area */}
                    <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x hide-scrollbar">
                        {reviews.map((review, i) => (
                            <Card key={i} className="bg-[#1a2332] border-[#2a364a] p-5 w-[280px] shrink-0 snap-center shadow-lg rounded-2xl">
                                <div className="flex border-b border-white/5 pb-3 mb-3 items-center gap-3">
                                    <Avatar className="w-10 h-10 border border-white/10">
                                        <AvatarFallback className="bg-stone-800 text-stone-300 text-xs">{review.initials}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h4 className="font-semibold text-white text-sm">{review.name}</h4>
                                        <div className="flex text-primary gap-0.5 mt-0.5">
                                            {[1, 2, 3, 4, 5].map(s => (
                                                <svg key={s} className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-sm text-stone-300 italic leading-snug">
                                    "{review.text}"
                                </p>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Support & Legal */}
                <section>
                    <h3 className="text-lg font-bold text-white tracking-tight mb-4">Support & Legal</h3>
                    <Card className="bg-[#1a1008] border-primary/10 overflow-hidden shadow-md">
                        {[
                            { icon: HelpCircle, label: "Help Center" },
                            { icon: Shield, label: "Privacy Policy" },
                            { icon: FileText, label: "Terms of Service" },
                            { icon: BadgeCheck, label: "NGO Verification Info" }
                        ].map((item, i, arr) => (
                            <div key={i} className={`p-4 flex items-center justify-between mx-4 px-0 ${i !== arr.length - 1 ? 'border-b border-white/5' : ''}`}>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-[#2a1a0c]">
                                        <item.icon className="w-5 h-5 text-primary" />
                                    </div>
                                    <p className="font-semibold text-white text-sm">{item.label}</p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-stone-500" />
                            </div>
                        ))}
                    </Card>
                </section>

                {/* Footer Build Info */}
                <div className="text-center text-xs text-stone-500 mt-8 mb-4">
                    <p>Nourish Connect Premium</p>
                    <p>Version 2.4.1 (Build 890)</p>
                </div>

            </div>
        </div>
    );
}
