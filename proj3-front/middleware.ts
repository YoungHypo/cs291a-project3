import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
    const pathname = req.nextUrl.pathname;
    const username = req.cookies.get("username");
    if (!username && pathname !== "/login") {
        return NextResponse.redirect(new URL("/login", req.url));
    }
    else if (username && pathname === "/login") {
        return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};