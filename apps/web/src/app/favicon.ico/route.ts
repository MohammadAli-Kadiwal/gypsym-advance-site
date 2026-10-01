import { NextResponse } from 'next/server';
import { getPublicGlobalSeo } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const seo = await getPublicGlobalSeo().catch(() => null);
    const favicon = seo?.favicon;

    if (favicon && favicon.startsWith('data:')) {
      const match = favicon.match(/^data:([^;]+);base64,(.+)$/);
      if (match && match[1] && match[2]) {
        const mimeType = match[1];
        const base64Data = match[2];
        const buffer = Buffer.from(base64Data, 'base64');
        return new NextResponse(new Uint8Array(buffer), {
          status: 200,
          headers: {
            'Content-Type': mimeType,
            'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
          },
        });
      }
    }

    if (favicon && (favicon.startsWith('http://') || favicon.startsWith('https://'))) {
      return NextResponse.redirect(favicon, 307);
    }
  } catch (err) {
    console.error('Error serving dynamic favicon:', err);
  }

  // Fallback default SVG favicon
  const defaultSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32"><rect width="32" height="32" rx="6" fill="#0f172a"/><path d="M9 16L16 8L23 16L16 24L9 16Z" fill="#98c22a"/></svg>`;
  return new NextResponse(defaultSvg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
