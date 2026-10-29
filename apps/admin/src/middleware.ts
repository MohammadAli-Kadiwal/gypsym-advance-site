import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

async function isTokenValid(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  try {
    const [headerB64, payloadB64, signatureB64] = parts;
    if (!headerB64 || !payloadB64 || !signatureB64) return false;

    const base64 = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    if (!payload.sub || (payload.exp && Date.now() >= payload.exp * 1000)) {
      return false; // Token expired or invalid structure
    }

    // Cryptographic HMAC-SHA256 signature verification via Web Crypto API
    const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
    if (secret) {
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['verify']
      );

      const b64Sig = signatureB64.replace(/-/g, '+').replace(/_/g, '/');
      const padLen = (4 - (b64Sig.length % 4)) % 4;
      const paddedSig = b64Sig + '='.repeat(padLen);
      const binaryString = atob(paddedSig);
      const sigBytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        sigBytes[i] = binaryString.charCodeAt(i);
      }

      const dataBytes = encoder.encode(`${headerB64}.${payloadB64}`);
      const isSignatureValid = await crypto.subtle.verify('HMAC', key, sigBytes, dataBytes);
      if (!isSignatureValid) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bypass static assets, next internals, and icons
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('gypsym_admin_token')?.value;
  const hasValidToken = await isTokenValid(token);

  // Public authentication route
  if (pathname === '/login') {
    if (hasValidToken) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Strictly protect all dashboard routes
  if (!hasValidToken) {
    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirect', pathname);
    }
    const response = NextResponse.redirect(loginUrl);
    if (token && !hasValidToken) {
      // Clear expired / invalid cookie
      response.cookies.delete('gypsym_admin_token');
    }
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
