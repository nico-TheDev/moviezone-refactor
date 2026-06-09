/* Minimal MD5 for Gravatar URLs */
function md5(input: string): string {
    function rotateLeft(value: number, shift: number) {
        return (value << shift) | (value >>> (32 - shift));
    }
    function toWords(input: string) {
        const length = input.length;
        const words: number[] = [];
        for (let i = 0; i < length; i++) {
            words[i >> 2] |= input.charCodeAt(i) << ((i % 4) * 8);
        }
        words[length >> 2] |= 0x80 << ((length % 4) * 8);
        words[(((length + 8) >>> 6) << 4) + 14] = length * 8;
        return words;
    }
    function toHex(value: number) {
        let hex = "";
        for (let i = 0; i < 4; i++) {
            hex += ((value >> (i * 8)) & 0xff).toString(16).padStart(2, "0");
        }
        return hex;
    }
    const words = toWords(input);
    let a = 0x67452301;
    let b = 0xefcdab89;
    let c = 0x98badcfe;
    let d = 0x10325476;
    const k = Array.from({ length: 64 }, (_, i) =>
        Math.floor(Math.abs(Math.sin(i + 1)) * 2 ** 32),
    );
    const s = [
        7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5, 9, 14, 20,
        5, 9, 14, 20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 6,
        10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
    ];
    for (let i = 0; i < words.length; i += 16) {
        const aa = a;
        const bb = b;
        const cc = c;
        const dd = d;
        for (let j = 0; j < 64; j++) {
            let f: number;
            let g: number;
            if (j < 16) {
                f = (b & c) | (~b & d);
                g = j;
            } else if (j < 32) {
                f = (d & b) | (~d & c);
                g = (5 * j + 1) % 16;
            } else if (j < 48) {
                f = b ^ c ^ d;
                g = (3 * j + 5) % 16;
            } else {
                f = c ^ (b | ~d);
                g = (7 * j) % 16;
            }
            const temp = d;
            d = c;
            c = b;
            const sum = (a + f + k[j] + (words[i + g] ?? 0)) >>> 0;
            b = (b + rotateLeft(sum, s[j]!)) >>> 0;
            a = temp;
        }
        a = (a + aa) >>> 0;
        b = (b + bb) >>> 0;
        c = (c + cc) >>> 0;
        d = (d + dd) >>> 0;
    }
    return toHex(a) + toHex(b) + toHex(c) + toHex(d);
}

export function gravatarUrl(email: string, size = 120): string {
    const hash = md5(email.trim().toLowerCase());
    return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=mp`;
}
