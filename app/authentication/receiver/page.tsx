'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { processEncryptedToken } from '@/app/authentication/auth/AuthReceiver';

function AuthReceiverContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState("Memproses keamanan...");

  useEffect(() => {
    const encryptedData = searchParams.get('data');

    if (!encryptedData) {
      setStatus("Data otentikasi tidak ditemukan.");
      return;
    }

    // Panggil Server Action
    const doAuth = async () => {
      try {
        const result = await processEncryptedToken(encryptedData);

        if (result.success) {
          setStatus("Berhasil! Mengalihkan...");
          // Gunakan window.location agar state aplikasi benar-benar fresh, 
          // atau router.replace jika ingin SPA transition
          router.replace('/');
        } else {
          setStatus(`Gagal: ${result.message}`);
        }
      } catch (err) {
        setStatus("Terjadi kesalahan sistem.");
      }
    };

    doAuth();

  }, [searchParams, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-2">Autentikasi Silang</h2>
        <p className="text-gray-600 animate-pulse">{status}</p>
      </div>
    </div>
  );
}

export default function AuthReceiverPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthReceiverContent />
    </Suspense>
  );
}