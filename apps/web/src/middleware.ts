import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface RedirectItem {
  sourceUrl: string;
  targetUrl: string;
  statusCode: number;
  isActive: boolean;
}

// In-memory short cache for Edge middleware performance
let cachedRedirects: RedirectItem[] = [];
let lastFetched = 0;
const CACHE_TTL_MS = 30000; // 30 seconds

async function fetchActiveRedirects(apiUrl: string): Promise<RedirectItem[]> {
  const now = Date.now();
  if (cachedRedirects.length > 0 && now - lastFetched < CACHE_TTL_MS) {
    return cachedRedirects;
  }

  try {
    const res = await fetch(`${apiUrl}/seo/public/redirects`, {
      next: { revalidate: 30 },
    });
    if (res.ok) {
      const data = await res.json();
      cachedRedirects = Array.isArray(data?.data) ? data.data : [];
      lastFetched = now;
    }
  } catch {
    // If API unavailable, proceed without blocking
  }

  return cachedRedirects;
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Ignore static assets, next internal files, and api requests
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
  const redirects = await fetchActiveRedirects(apiUrl);

  const cleanPath = pathname.toLowerCase().replace(/\/+$/, '') || '/';

  for (const r of redirects) {
    if (!r.isActive) continue;

    const source = r.sourceUrl.toLowerCase().replace(/\/+$/, '') || '/';
    if (cleanPath === source) {
      let target = r.targetUrl;
      const statusCode = [301, 302, 307, 308].includes(r.statusCode) ? r.statusCode : 301;

      // Handle relative vs absolute target
      let targetUrl: URL;
      if (target.startsWith('http://') || target.startsWith('https://')) {
        targetUrl = new URL(target);
      } else {
        targetUrl = new URL(target + (search || ''), request.url);
      }

      return NextResponse.redirect(targetUrl, { status: statusCode });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
