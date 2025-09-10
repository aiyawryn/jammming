// pkceUtil.js

// สร้าง code_verifier ด้วยอักขระที่ปลอดภัยตามมาตรฐาน PKCE
export function generateCodeVerifier(length = 128) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    const randomValues = crypto.getRandomValues(new Uint8Array(length));

    return Array.from(randomValues)
        .map((value) => charset[value % charset.length])
        .join('');
}

// แปลง buffer เป็น Base64 URL-safe โดยไม่ใช้ btoa กับ binary โดยตรง
function base64UrlEncode(buffer) {
    const binary = Array.from(buffer)
        .map((b) => String.fromCharCode(b))
        .join('');
    const base64 = btoa(binary);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// สร้าง code_challenge โดยใช้ SHA-256 และแปลงเป็น Base64 URL-safe
export async function generateCodeChallenge(codeVerifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return base64UrlEncode(new Uint8Array(digest));
}