import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
    function middleware() {
        // Add security headers
        const response = NextResponse.next()

        // XSS Protection
        response.headers.set("X-XSS-Protection", "1; mode=block")
        response.headers.set("X-Content-Type-Options", "nosniff")
        response.headers.set("X-Frame-Options", "DENY")
        response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")

        // CSRF Protection
        response.headers.set(
            "Content-Security-Policy",
            "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;",
        )

        return response
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                // Protect profile routes
                if (req.nextUrl.pathname.startsWith("/profile")) {
                    return !!token
                }
                return true
            },
        },
    },
)

export const config = {
    matcher: ["/profile/:path*", "/api/user/:path*"],
}
