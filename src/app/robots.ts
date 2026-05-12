import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://medassist.pk';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/api/',
        '/chat/', // Chat sessions are private
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
