import type { Metadata, Viewport } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import { BottomNav } from '@/components/bottom-nav';
import { FeedbackWidget } from '@/components/feedback-widget';
import { ToastProvider } from '@/components/toast';
import { PostHogProvider } from '@/components/posthog-provider';

export const metadata: Metadata = {
  title: 'EthPulse',
  description: 'Ethereum ecosystem intelligence in 60-word cards.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'EthPulse',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#08080c',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
            rel="stylesheet"
          />
        </head>
        <body className="antialiased overflow-hidden" style={{ color: 'var(--text-primary)' }}>
          <PostHogProvider>
            {children}
            <BottomNav />
            <FeedbackWidget />
            <ToastProvider />
          </PostHogProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
