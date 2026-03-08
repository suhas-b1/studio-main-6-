'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Settings, Info, UtensilsCrossed, Leaf, Handshake, Award } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Progress } from "@/components/ui/progress";
import Link from 'next/link';
import {
  BarChart,
  Bar,
  XAxis,
  ResponsiveContainer,
  Cell
} from "recharts";

const performanceData = [
  { name: 'Jan', value: 30 },
  { name: 'Feb', value: 45 },
  { name: 'Mar', value: 40 },
  { name: 'Apr', value: 50 },
  { name: 'May', value: 35 },
  { name: 'Jun', value: 60 },
  { name: 'Jul', value: 100 }, // Current month highlighted
  { name: 'Aug', value: 45 },
  { name: 'Sep', value: 55 },
  { name: 'Oct', value: 40 },
];

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  if (isUserLoading) return null;

  return (
    <div className="min-h-full bg-[#0f0700] text-stone-200 font-sans pb-10">
      {/* Custom Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between px-4 bg-[#0f0700]/90 backdrop-blur-sm">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-stone-300 hover:text-white">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold text-white tracking-wide">Impact Hub</h1>
        <Link href="/settings" className="p-2 -mr-2 text-primary hover:text-orange-400">
          <Settings className="w-6 h-6" />
        </Link>
      </header>

      <div className="px-4 mt-6 space-y-8 max-w-2xl mx-auto">

        {/* Profile Card */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full border border-primary/30 p-1 scale-110"></div>
            <Avatar className="w-28 h-28 border-2 border-primary/20 shadow-xl shadow-primary/5">
              <AvatarImage src={user?.photoURL ?? ''} alt={user?.displayName ?? 'User'} className="object-cover" />
              <AvatarFallback className="text-4xl bg-stone-800 text-stone-300">
                {user?.displayName?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            {/* Verified Badge */}
            <div className="absolute top-1 right-1 bg-blue-500 rounded-full p-1 border-2 border-[#0f0700]">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            {/* Edit Button */}
            <button className="absolute bottom-1 right-1 bg-primary rounded-full p-2 border-2 text-[#0f0700] border-[#0f0700] hover:bg-orange-500 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          </div>

          <h2 className="mt-4 text-2xl font-bold text-white tracking-tight">{user?.displayName || 'User'}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-2.5 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-semibold tracking-wider uppercase border border-primary/30">
              Gold Donor
            </span>
            <span className="text-stone-400 text-sm flex items-center gap-1">
              • Member since 2022
            </span>
          </div>
        </div>

        {/* Profile Strength */}
        <Card className="bg-[#1a1008] border-primary/10 p-5 shadow-lg">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-stone-200">Profile Strength</h3>
            <span className="text-primary font-bold">85%</span>
          </div>
          <Progress value={85} className="h-2.5 bg-stone-800 [&>div]:bg-primary" />
          <p className="mt-4 text-sm text-stone-400 leading-relaxed">
            Complete your bio to reach 100% and earn the 'Pro Donor' badge.
          </p>
        </Card>

        {/* Impact Overview */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4 tracking-tight">Impact Overview</h3>
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-[#1a1008] border-primary/10 p-5 shadow-md flex flex-col justify-center">
              <UtensilsCrossed className="w-6 h-6 text-primary mb-3" />
              <div className="text-2xl font-bold text-white mb-1 tracking-tight">1.2k</div>
              <div className="text-xs text-stone-400 font-medium tracking-wide uppercase">Meals served</div>
            </Card>
            <Card className="bg-[#1a1008] border-primary/10 p-5 shadow-md flex flex-col justify-center">
              <Leaf className="w-6 h-6 text-primary mb-3" />
              <div className="text-2xl font-bold text-white mb-1 tracking-tight">450kg</div>
              <div className="text-xs text-stone-400 font-medium tracking-wide uppercase">Food saved</div>
            </Card>
            <Card className="bg-[#1a1008] border-primary/10 p-5 shadow-md flex flex-col justify-center">
              <Handshake className="w-6 h-6 text-primary mb-3" />
              <div className="text-2xl font-bold text-white mb-1 tracking-tight">12</div>
              <div className="text-xs text-stone-400 font-medium tracking-wide uppercase">NGOs Connected</div>
            </Card>
            <Link href="/profile/trust">
              <Card className="bg-[#1a1008] border-primary/10 p-5 shadow-md flex flex-col justify-center hover:bg-[#20140a] transition-colors h-full cursor-pointer relative overflow-hidden group">
                <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors"></div>
                <Award className="w-6 h-6 text-primary mb-3 relative z-10" />
                <div className="text-2xl font-bold text-white mb-1 tracking-tight relative z-10">Gold</div>
                <div className="text-xs text-stone-400 font-medium tracking-wide uppercase relative z-10">Donor Status</div>
              </Card>
            </Link>
          </div>
        </div>

        {/* Monthly Impact Chart */}
        <Card className="bg-[#1a1008] border-primary/10 p-5 shadow-lg">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h4 className="text-xs font-bold text-stone-400 tracking-wider uppercase mb-1">Monthly Impact</h4>
              <div className="text-xl font-bold text-white">
                +12% from last month
              </div>
            </div>
            <button className="text-primary text-xs font-bold uppercase tracking-wider hover:text-orange-400 transition-colors">
              View Report
            </button>
          </div>

          <div className="h-[120px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <Bar
                  dataKey="value"
                  radius={[4, 4, 4, 4]}
                  barSize={32}
                >
                  {performanceData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === 6 ? '#f97316' : '#452a12'}
                      className="transition-colors duration-300"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

      </div>
    </div>
  );
}
