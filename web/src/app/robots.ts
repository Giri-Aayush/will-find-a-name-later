import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/api/og'],
        disallow: ['/api/', '/admin/'],
      },
    ],
    sitemap: 'https://hexcast.xyz/sitemap.xml',
  };
}
