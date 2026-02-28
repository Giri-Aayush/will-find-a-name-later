import posthog from 'posthog-js';

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;

if (posthogKey) {
  posthog.init(posthogKey, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    person_profiles: 'identified_only',
    capture_pageview: true,
    capture_pageleave: true,
    capture_performance: true,
    debug: false,
    session_recording: {
      maskAllInputs: true,
    },
  });
}
