import { NextResponse } from 'next/server';

// Definimos las bases de las rutas que serán de acceso libre
const publicPaths = ['/join', '/assembly', '/funcionario'];

export function middleware(request) {
  const sessionCookie = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;

  // 0. VERIFICACIÓN DE RUTAS PÚBLICAS
  // Comprobamos si la ruta actual empieza con alguna de nuestras rutas públicas
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  // Si es pública, dejamos que el flujo continúe normalmente sin exigir sesión de admin
  if (isPublicPath) {
    return NextResponse.next();
  }

  // 1. Si NO hay sesión y el usuario intenta entrar a cualquier ruta que no sea el login ('/') 
  // y que TAMPOCO sea una ruta pública, lo devolvemos al login.
  if (!sessionCookie && pathname !== '/') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 2. Si SÍ hay sesión, validamos hacia dónde va
  if (sessionCookie) {
    const session = JSON.parse(sessionCookie);

    // Si un usuario logueado intenta entrar a la raíz ('/'), lo redirigimos a su panel
    if (pathname === '/') {
      if (session.role === '1') return NextResponse.redirect(new URL('/admin', request.url)); // ID de SUPERADMIN
      if (session.role === '3') return NextResponse.redirect(new URL('/operario', request.url)); // ID de Representante/Operator
    }

    // Proteger las rutas de /admin para que solo entre el rol '1'
    if (pathname.startsWith('/admin') && session.role !== '1') {
      return NextResponse.rewrite(new URL('/404', request.url)); // O redirigirlo a su propio panel
    }

    // Proteger las rutas de /operario para que solo entre el rol '3'
    if (pathname.startsWith('/operario') && session.role !== '3') {
      return NextResponse.rewrite(new URL('/404', request.url));
    }
  }

  return NextResponse.next();
}

// Configurar en qué rutas debe correr este middleware (excluimos imágenes, api, etc)
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};