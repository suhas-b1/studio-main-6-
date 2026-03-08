
'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { HandHeart, UtensilsCrossed, Building, LogIn, UserPlus, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useUser } from '@/firebase';

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const heroImage = PlaceHolderImages.find(p => p.id === 'community-gathering');
  const { user, isUserLoading } = useUser();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Sign In / Sign Up Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-3xl border border-border bg-card p-8 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center mb-6">
              <HandHeart className="mx-auto h-10 w-10 text-primary mb-3" />
              <h2 className="text-xl font-bold text-foreground">Start Donating Food</h2>
              <p className="text-sm text-muted-foreground mt-1">Sign in to an existing account or create a new one.</p>
            </div>
            <div className="flex flex-col gap-3">
              <Link
                href="/login?role=donor"
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-bold text-sm text-white transition active:scale-95"
                style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)', boxShadow: '0 4px 20px rgba(249,115,22,0.35)' }}
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </Link>
              <Link
                href="/signup?role=donor"
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-bold text-sm border border-border bg-muted text-foreground hover:bg-muted/70 transition active:scale-95"
              >
                <UserPlus className="w-4 h-4" />
                Sign Up
              </Link>
            </div>
            <p className="text-center text-xs text-muted-foreground mt-5">
              By continuing, you agree to our Terms of Service.
            </p>
          </div>
        </div>
      )}
      <header className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
        <Link href="#" className="flex items-center gap-2" prefetch={false}>
          <HandHeart className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold tracking-tighter text-foreground">Nourish Connect</span>
        </Link>
        <nav className="flex items-center gap-4">
          {!isUserLoading && !user && (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Log In</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
            </>
          )}
          {!isUserLoading && user && (
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          )}
        </nav>
      </header>
      <main className="flex-1">
        <section className="relative w-full py-12 md:py-24 lg:py-32 xl:py-48">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover"
              priority
              data-ai-hint={heroImage.imageHint}
            />
          )}
          <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
          <div className="container relative px-4 text-center md:px-6">
            <div className="flex flex-col items-center space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none font-headline">
                Turn Surplus into Sustenance
              </h1>
              <p className="mx-auto max-w-[700px] text-foreground/80 md:text-xl">
                Nourish Connect is the bridge between those with excess food and those in need. Join our community to fight food waste and feed hope.
              </p>
              <div className="mt-6">
                <Button size="lg" onClick={() => !user && setShowModal(true)} asChild={!!user}>
                  {user ? <Link href="/dashboard">Go to Dashboard</Link> : <span>Donate Food Now</span>}
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="role-selection" className="w-full bg-secondary py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Join as a...</h2>
                <p className="max-w-[900px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Whether you're a business with surplus food or an organization that feeds the community, you have a place here.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:max-w-none lg:grid-cols-2 mt-12">
              <Link href="/signup?role=donor">
                <Card className="flex h-full flex-col justify-between transition-all hover:scale-105 hover:shadow-xl">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="rounded-full bg-primary/20 p-3">
                        <UtensilsCrossed className="h-8 w-8 text-primary" />
                      </div>
                      <CardTitle className="text-2xl font-headline">Donor</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      You are a restaurant, supermarket, hotel, or individual with surplus food to share. List your donations and make a tangible impact.
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/signup?role=ngo">
                <Card className="flex h-full flex-col justify-between transition-all hover:scale-105 hover:shadow-xl">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="rounded-full bg-teal-500/20 p-3">
                        <Building className="h-8 w-8 text-teal-500" />
                      </div>
                      <CardTitle className="text-2xl font-headline">Recipient</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      You represent an NGO, shelter, or community kitchen. Browse available listings and claim the food your community needs.
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-background border-t">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row md:px-6">
          <p className="text-sm text-muted-foreground">&copy; 2025 Nourish Connect. All rights reserved.</p>
          <nav className="flex gap-4 sm:gap-6">
            <Link href="#" className="text-sm hover:underline underline-offset-4" prefetch={false}>
              Terms of Service
            </Link>
            <Link href="#" className="text-sm hover:underline underline-offset-4" prefetch={false}>
              Privacy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
