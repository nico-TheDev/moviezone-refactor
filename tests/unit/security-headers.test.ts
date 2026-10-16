import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { getSecurityHeaders } from "../../server/middleware/security-headers";

function parseHeadersFile(): Record<string, string> {
    const text = readFileSync(join(process.cwd(), "public/_headers"), "utf-8");
    const headers: Record<string, string> = {};
    for (const line of text.split("\n")) {
        if (!/^\s+\S/.test(line)) continue;
        const separator = line.indexOf(":");
        headers[line.slice(0, separator).trim()] = line.slice(separator + 1).trim();
    }
    return headers;
}

describe("public/_headers", () => {
    it("matches the production headers the Worker sets on API responses", () => {
        expect(parseHeadersFile()).toEqual(getSecurityHeaders(true));
    });
});
