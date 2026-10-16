import type { MiddlewareHandler } from "hono";

/**
 * Headers for every response. On Workers, static files skip the Worker and get these from
 * public/_headers instead, so keep that file in step (tests/unit/security-headers.test.ts).
 */
export function getSecurityHeaders(isProduction: boolean): Record<string, string> {
    const headers: Record<string, string> = {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
        "Content-Security-Policy": [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline'",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' https://image.tmdb.org https://www.gravatar.com https://secure.gravatar.com data:",
            "connect-src 'self'",
            "worker-src 'self'",
            "frame-src https://www.youtube-nocookie.com",
        ].join("; "),
    };
    if (isProduction) {
        headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains";
    }
    return headers;
}

export const securityHeaders: MiddlewareHandler = async (c, next) => {
    await next();
    for (const [name, value] of Object.entries(
        getSecurityHeaders(process.env.NODE_ENV === "production"),
    )) {
        c.header(name, value);
    }
};
