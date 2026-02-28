import { auth } from '@clerk/nextjs/server';

const ADMIN_IDS = new Set(
  (process.env.ADMIN_USER_IDS ?? '').split(',').map((s) => s.trim()).filter(Boolean),
);

export async function isAdmin(): Promise<{ admin: boolean; userId: string | null }> {
  const { userId } = await auth();
  if (!userId) return { admin: false, userId: null };
  return { admin: ADMIN_IDS.has(userId), userId };
}
