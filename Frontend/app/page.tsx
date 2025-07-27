'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Outfit } from 'next/font/google';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
});

export default function HomePage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      switch (user.role) {
        case 'admin':
          router.push('/admin');
          break;
        case 'customer':
          router.push('/customer');
          break;
        case 'seller':
          router.push('/seller');
          break;
        default:
          router.push('/unauthorized');
      }
    } else {
      setIsChecking(false);
    }
  }, [router]);

  if (isChecking) {
    return <p className="text-center mt-10 text-gray-600">Redirecting...</p>;
  }

  return (
    <div className={`${outfit.className} relative min-h-screen flex flex-col overflow-hidden`}>
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src="/doctors.jpg"
          alt="Doctors Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      </div>

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-6 sm:px-12 py-4 bg-transparent">
        {/* Logo and Title */}
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => router.push('/')}
          aria-label="Medica homepage"
        >
          <div className="bg-blue-200 p-2 rounded-full shadow-md animate-pulse">
            <svg
              width="45"
              height="45"
              viewBox="0 0 47 47"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <rect width="47" height="47" rx="23.5" fill="#C6DEFD" />
              <path
                d="M34 24H30L27 33L21 15L18 24H14"
                stroke="#252B61"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="text-white text-3xl font-extrabold tracking-tight select-none">
            Medica
          </h1>
        </div>

        {/* Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={() => router.push('/register')}
            className="bg-[#C6DEFD] hover:bg-[#aac9fb] text-black font-semibold py-2 px-6 rounded-full shadow transition cursor-pointer"
          >
            Register
          </button>
          <button
            onClick={() => router.push('/login')}
            className="bg-[#C6DEFD] hover:bg-[#aac9fb] text-black font-semibold py-2 px-6 rounded-full shadow transition cursor-pointer"
          >
            Login
          </button>
        </div>
      </header>

      {/* Main Hero Content */}
      <main className="relative z-20 flex flex-col items-center justify-center flex-grow text-center px-6 sm:px-12">
        <h2
          className="text-white font-extrabold drop-shadow-lg"
          style={{
            fontSize: 'clamp(48px, 8vw, 160px)',
            fontFamily: "'Inter', sans-serif",
            lineHeight: '0.85',
            letterSpacing: '-0.02em',
          }}
        >
          Medica
        </h2>
        <p className="mt-4 text-lg sm:text-2xl font-medium text-white drop-shadow-md max-w-3xl">
          Empowering Doctors & Pharmacies with Smart Healthcare Solutions
        </p>
      </main>
    </div>
  );
}
