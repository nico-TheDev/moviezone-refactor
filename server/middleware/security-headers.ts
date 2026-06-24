import type { MiddlewareHandler } from "hono";

export const securityHeaders: MiddlewareHandler = async (c, next) => {
    await next();
    c.header("X-Content-Type-Options", "nosniff");
    c.header("X-Frame-Options", "DENY");
    c.header("Referrer-Policy", "strict-origin-when-cross-origin");
    c.header("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    c.header(
        "Content-Security-Policy",
        [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline'",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' https://image.tmdb.org data:",
            "connect-src 'self'",
            "worker-src 'self'",
            "frame-src https://www.youtube-nocookie.com",
        ].join("; "),
    );
    if (process.env.NODE_ENV === "production") {
        c.header("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    }
};
