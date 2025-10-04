import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';
import {decrypt} from '@/lib/session';
import {cookies} from 'next/headers';

const protectedRoutes = ['/dashboard', '/expenses', '/approvals', '/admin'];
const authRoutes = ['/login', '/signup'];

export async function middleware(request: NextRequest) {
  const {pathname} = request.nextUrl;

  const sessionCookie = cookies().get('session')?.value;
  const session = sessionCookie ? await decrypt(sessionCookie) : null;

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', request.nextUrl));
  }

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
