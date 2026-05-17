import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./globals.css";
import MaintenanceAlert from "@/components/MaintenanceAlert";
import Script from "next/script";


const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
  display: 'swap',
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'OP Retreat Talent Calculator | Optimize Your Build & Skills',
  description: 'Unofficial talent calculator for Survivor.io (OP Retreat). Plan and optimize your character builds with our interactive talent tree tool. Calculate points for Low HP and Full HP modes.',
  keywords: 'OP Retreat, talent calculator, build planner, character optimizer, Habby games, talent tree, skill planner, gaming tool, OP Retreat guide, talent points calculator',
  authors: [{ name: 'Pl4yer810 & Miguel Amaya' }],
  robots: 'index, follow',
  alternates: {
    canonical: 'https://op-retreat-calculator.vercel.app/',
  },
  openGraph: {
    type: 'website',
    url: 'https://op-retreat-calculator.vercel.app/',
    siteName: 'OP Retreat Calculator',
    title: 'OP Retreat Talent Calculator | Optimize Your Build',
    description: 'Free interactive talent calculator for OP Retreat. Plan your character builds, calculate talent points, and optimize your gameplay strategy.',
    images: [
      {
        url: 'https://op-retreat-calculator.vercel.app/assets/images/og-preview.png',
        width: 1200,
        height: 630,
        alt: 'OP Retreat Talent Calculator Interface',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OP Retreat Talent Calculator | Build Optimizer',
    description: 'Free interactive talent calculator for OP Retreat. Plan your character builds and optimize talent points.',
    images: ['https://op-retreat-calculator.vercel.app/assets/images/og-preview.png'],
  },
  verification: {
    google: 'google4b92ac73a16174dd',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
};

import { SettingsProvider } from "@/context/SettingsContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={poppins.variable}>
      <body>
        <SettingsProvider>
          <MaintenanceAlert />
          {children}
        </SettingsProvider>
        <Script type="module" src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js" strategy="lazyOnload" />
        <Script noModule src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
