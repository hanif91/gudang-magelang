import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const hasToken = request.cookies.has('token_gudang');

	// Allow access to the receiver page without a token
	if (pathname.startsWith("/authentication/receiver")) {
		return NextResponse.next();
	}

	// If no token, redirect to Portal
	if (!hasToken) {
		const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL;
		if (portalUrl) {
			return NextResponse.redirect(new URL(portalUrl));
		} else {
			// Fallback if env is missing (though it should be there)
			// Maybe redirect to a generic error page or keep on current page but it will fail
			return NextResponse.next();
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		'/((?!api|_next/static|_next/image|favicon.ico).*)',
	],
};