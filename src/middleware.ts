import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';

// This middleware is temporarily disabled to bypass authentication.
export async function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
