import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import Script from "next/script";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Poppins } from 'next/font/google'
import { FirebaseClientProvider } from "@/firebase";
import { SettingsProvider } from "@/context/settings-context";

// Leaflet CSS for map rendering
import "leaflet/dist/leaflet.css";

export const metadata: Metadata = {
  title: "Nourish Connect",
  description: "Connecting surplus food with those in need.",
};

const poppins = Poppins({
  weight: ['400', '600', '700', '900'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins'
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={cn(
          "min-h-screen bg-background font-body antialiased",
          poppins.variable
        )}
      >
        <FirebaseClientProvider>
          <SettingsProvider>
            {children}
          </SettingsProvider>
        </FirebaseClientProvider>
        <Toaster />
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
