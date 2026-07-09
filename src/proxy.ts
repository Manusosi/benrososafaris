import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

import { detectLocale, localeFromPathname, pathnameHasLocale } from '@/lib/i18n';
import {
  getPortalHost,
  getPortalUrl,
  getRequestHost,
  getSiteUrl,
  isPortalRequestHost
} from '@/lib/portal-url';

const PUBLIC_FILE = /\.(.*)$/;

function redirectTo(url: string | URL) {
  return NextResponse.redirect(url, 302);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const search = request.nextUrl.search;
  const requestHost = getRequestHost(request);
  const onPortalHost = isPortalRequestHost(requestHost);
  const portalHostConfigured = Boolean(getPortalHost());

  let response = NextResponse.next({ request });

  const isPortalRoute = pathname.startsWith('/portal');
  const isAdminRoute = pathname.startsWith('/admin');
  const isAuthExempt =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/auth') ||
    isPortalRoute ||
    isAdminRoute ||
    PUBLIC_FILE.test(pathname);

  if (isAdminRoute) {
    const target = pathname.replace(/^\/admin/, '/portal') || '/portal';
    return redirectTo(new URL(`${target}${search}`, request.url));
  }

  if (!onPortalHost && portalHostConfigured && isPortalRoute) {
    return redirectTo(new URL(`${pathname}${search}`, getPortalUrl()));
  }

  if (onPortalHost) {
    if (pathnameHasLocale(pathname)) {
      return redirectTo(new URL(`${pathname}${search}`, getSiteUrl()));
    }

    if (pathname === '/') {
      return redirectTo(new URL(`/portal${search}`, request.url));
    }

    if (pathname === '/login' || pathname.startsWith('/login/')) {
      const target = pathname.replace(/^\/login/, '/portal/login') || '/portal/login';
      return redirectTo(new URL(`${target}${search}`, request.url));
    }

    const isPortalHostExempt =
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api') ||
      pathname.startsWith('/auth') ||
      pathname.startsWith('/portal') ||
      pathname.startsWith('/monitoring') ||
      PUBLIC_FILE.test(pathname);

    if (!isPortalHostExempt) {
      return redirectTo(new URL(`${pathname}${search}`, getSiteUrl()));
    }
  }

  if (isPortalRoute || pathname.startsWith('/api')) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => {
              request.cookies.set(name, value);
            });
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          }
        }
      }
    );

    const {
      data: { user }
    } = await supabase.auth.getUser();

    const isLoginRoute = pathname.startsWith('/portal/login');

    if (isPortalRoute && !isLoginRoute && !user) {
      const loginUrl = new URL('/portal/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return redirectTo(loginUrl);
    }

    return response;
  }

  if (isAuthExempt) {
    return NextResponse.next();
  }

  if (pathnameHasLocale(pathname)) {
    const chosenLocale = localeFromPathname(pathname);
    const localeResponse = NextResponse.next();
    if (chosenLocale) {
      localeResponse.cookies.set('NEXT_LOCALE', chosenLocale, {
        maxAge: 60 * 60 * 24 * 365,
        path: '/',
        sameSite: 'lax'
      });
    }
    return localeResponse;
  }

  const locale = detectLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = pathname === '/' ? `/${locale}` : `/${locale}${pathname}`;

  return NextResponse.redirect(url);
}

export const proxyConfig = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)'
  ]
};
