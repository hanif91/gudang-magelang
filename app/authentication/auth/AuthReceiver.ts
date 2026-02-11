
import AES from 'crypto-js/aes';
import encUtf8 from 'crypto-js/enc-utf8';
import Cookies from 'js-cookie';

// Definisikan tipe respon dari backend agar Typescript senang
interface ValidationResponse {
  valid: boolean;
  user?: any; // Sesuaikan dengan bentuk object user di databasemu
  message?: string;
}

export async function processEncryptedToken(encryptedData: string) {
  const secretKey = process.env.NEXT_PUBLIC_SSO_SECRET_KEY;
  // URL Backend kamu (bukan URL frontend Web A atau Web B)
  const backendApiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!secretKey || !backendApiUrl) {
    return { success: false, message: "Konfigurasi Server (Env) belum lengkap" };
  }

  try {
    // -------------------------------------------------------------
    // LANGKAH 1: DEKRIPSI (Membuka Kotak Besi) - Client Side
    // -------------------------------------------------------------
    const bytes = AES.decrypt(encryptedData, secretKey);
    const originalToken = bytes.toString(encUtf8);

    if (!originalToken) {
      return { success: false, message: "Gagal dekripsi: Token rusak atau kunci salah" };
    }

    // -------------------------------------------------------------
    // LANGKAH 2: VALIDASI KE BACKEND PUSAT (Check keabsahan tiket)
    // -------------------------------------------------------------
    // Kita kirim token ini ke endpoint validasi yang kamu punya
    const res = await fetch(`${backendApiUrl}/api/auth/validate-token`, {
      method: 'GET', // atau POST, tergantung backendmu maunya apa
      headers: {
        'Content-Type': 'application/json',
        // Masukkan token di Header Authorization
        'Authorization': `Bearer ${originalToken}`
      }
      // cache: 'no-store' // Tidak perlu option ini di client-side fetch defaultnya biasanya oke
    });

    if (!res.ok) {
      // Jika backend merespon 401 (Unauthorized) atau 403 (Forbidden)
      return { success: false, message: "Token sudah kadaluarsa atau tidak valid" };
    }

    // Opsional: Ambil data user terbaru dari respon validasi
    // const userData = await res.json(); 

    // -------------------------------------------------------------
    // LANGKAH 3: SET COOKIE DI WEB B (Resmi Masuk)
    // -------------------------------------------------------------

    Cookies.set('token_gudang', originalToken, {
      sameSite: 'lax',
      path: '/',
      // expires: 7 // Set expired sesuai kebijakan (misal 7 hari), js-cookie pakai 'expires' bukan 'maxAge' (dalam hari)
    });

    return { success: true };

  } catch (error) {
    console.error("SSO Error:", error);
    return { success: false, message: "Terjadi kesalahan internal saat memproses token" };
  }
}