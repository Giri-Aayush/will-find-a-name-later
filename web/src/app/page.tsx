import { getCards } from '@/lib/queries';
import { CardFeed } from '@/components/card-feed';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const cards = await getCards({ limit: 20 });

  return <CardFeed initialCards={cards} />;
}
