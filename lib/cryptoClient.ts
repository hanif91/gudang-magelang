import CryptoJS from "crypto-js";

const ENCRYPTION_KEY: string = process.env.NEXT_PUBLIC_SECRET_KEY || "";

export function decrypt(text: string, keyHex: string = ENCRYPTION_KEY) {
    try {
        const [ivHex, encryptedHex] = text.split(":");
        if (!ivHex || !encryptedHex) {
            throw new Error("Invalid or corrupted cipher format");
        }

        const key = CryptoJS.enc.Hex.parse(keyHex);
        const iv = CryptoJS.enc.Hex.parse(ivHex);
        const encrypted = CryptoJS.enc.Hex.parse(encryptedHex);

        const encryptedBase64 = CryptoJS.enc.Base64.stringify(encrypted);

        const decrypted = CryptoJS.AES.decrypt(encryptedBase64, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
        });

        return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        console.error("Decryption error:", error);
        return null;
    }
}
