'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import posthog from 'posthog-js';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, user } = useUser();

  useEffect(() => {
    // Skip if PostHog was not initialized (missing key)
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;

    if (isSignedIn && user) {
      posthog.identify(user.id, {
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName,
        avatar: user.imageUrl,
      });
    } else if (isSignedIn === false) {
      posthog.reset();
    }
  }, [isSignedIn, user]);

  return <>{children}</>;
}
