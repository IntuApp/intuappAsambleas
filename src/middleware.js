import { NextResponse } from 'next/server';

const publicPaths = ['/join', '/assembly', '/funcionario'];

export function middleware(request) {
  const sessionCookie = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;

  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  if (isPublicPath) {
    return NextResponse.next();
  }

  if (!sessionCookie && pathname !== '/') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (sessionCookie) {
    const session = JSON.parse(sessionCookie);

    if (pathname === '/') {
      if (session.role === '1') return NextResponse.redirect(new URL('/admin', request.url));
      if (session.role === '3') return NextResponse.redirect(new URL('/operario', request.url));
    }

    if (pathname.startsWith('/admin') && session.role !== '1') {
      return NextResponse.rewrite(new URL('/404', request.url));
    }

    if (pathname.startsWith('/operario') && session.role !== '3') {
      return NextResponse.rewrite(new URL('/404', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};