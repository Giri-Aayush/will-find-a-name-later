import type { NextConfig } from 'next';
import { join } from 'path';
import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  disable: process.env.NODE_ENV === 'development',
  fallbacks: {
    document: '/offline',
  },
});

const nextConfig: NextConfig = withPWA({
  transpilePackages: ['@hexcast/shared'],
  outputFileTracingRoot: join(import.meta.dirname, '..'),
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.clerk.dev https://*.clerk.accounts.dev https://challenges.cloudflare.com https://us.i.posthog.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://*.clerk.dev https://img.clerk.com",
              "connect-src 'self' https://*.supabase.co https://*.clerk.dev https://*.clerk.accounts.dev https://us.i.posthog.com https://us.posthog.com",
              "frame-src https://*.clerk.dev https://*.clerk.accounts.dev https://challenges.cloudflare.com",
              "worker-src 'self' blob:",
              "manifest-src 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
});

export default nextConfig;
