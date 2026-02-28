import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Saved — Hexcast',
  description: 'Your saved Ethereum ecosystem cards. Bookmark cards to build your reading list.',
  robots: { index: false },
};

export default function SavedLayout({ children }: { children: React.ReactNode }) {
  return children;
}
