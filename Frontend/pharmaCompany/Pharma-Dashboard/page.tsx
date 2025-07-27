'use client';

import { useRouter } from 'next/navigation';
import { faCapsules, faDatabase } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import { Outfit } from 'next/font/google';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPenToSquare,
  faTrashArrowUp,
  faRightFromBracket,
} from '@fortawesome/free-solid-svg-icons';


const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
});

export default function DashboardPage() {
  const tips = [
    "Double-check medicine names before uploading to avoid duplicates.",
    "Use consistent naming conventions for better dataset organization.",
    "Did you know? You can update existing medicine records easily!",
    "Keep your dataset clean by regularly reviewing outdated entries.",
    "Stay compliant — always verify side effects and usage fields.",
  ];

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [companyName, setCompanyName] = useState('Pharma');
  const [greeting, setGreeting] = useState('');
  const [dailyTip, setDailyTip] = useState('');
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem('role');
    const name = localStorage.getItem('name');

    if (role === 'PHARMA_COMPANY') {
      setIsAuthorized(true);
      if (name) setCompanyName(name);
    } else {
      setIsAuthorized(false);
      setErrorMessage("You can't access this page. Please login first.");
    }

    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  useEffect(() => {
    let tipIndex = 0;
    setDailyTip(tips[tipIndex]);

    const interval = setInterval(() => {
      tipIndex = (tipIndex + 1) % tips.length;
      setDailyTip(tips[tipIndex]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('role');
    localStorage.removeItem('companyId');
    router.push('/login');
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center">
        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl shadow-xl text-lg font-semibold mb-6">
            {errorMessage}
          </div>
        )}
        <button
          onClick={() => router.push('/login')}
          className="bg-blue-300 hover:bg-blue-400 text-black font-semibold py-2 px-6 rounded-xl shadow-lg transition duration-300"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Background Image */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/Background2.png')",
          filter: 'blur(3px)',
          zIndex: 0,
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 bg-white text-[#252B61]">
          <div className="flex items-center gap-4">
            <div className="bg-blue-200 p-2 rounded-full shadow-md animate-pulse">
              <svg width="45" height="45" viewBox="0 0 47 47" fill="none" xmlns="http://www.w3.org/2000/svg">
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
            <div>
              <h1 className={`${outfit.className} text-3xl font-extrabold text-[#252B61] tracking-tight`}>
                Medica
              </h1>
              <p className="text-sm text-gray-600 font-medium">
                {greeting}, {companyName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
             <FontAwesomeIcon icon={faRightFromBracket} className="text-blue-950 w-5 h-5" />
            <button
              onClick={handleLogout}
              className="text-base font-semibold text-gray-700 hover:text-red-600 transition cursor-pointer"
            >
              Logout
            </button>
          </div>
        </header>

      {/* Tip of the Day */}
        <div className="px-4 py-4 text-center mt-20">
          <div className="bg-white/80 backdrop-blur-md p-4 rounded-xl shadow-lg max-w-3xl mx-auto">
            <p className="text-[22px] font-bold text-[#252B61]">
              💡 <span className="font-extrabold">Tip of the Day:</span> {dailyTip}
            </p>
          </div>
        </div>

        {/* Cards Section */}
      <section className="flex justify-center items-center gap-12 flex-wrap py-10 mt-35">
        {/* Add Medicine Dataset Card */}
        <div
          className="group bg-white backdrop-blur-md border border-white/30 rounded-2xl p-4 shadow-md hover:bg-[#1a3465] hover:border-[#1a3465] hover:shadow-blue-300 hover:scale-105 transition-all duration-300 overflow-hidden cursor-pointer w-[300px] h-[300px] flex flex-col justify-center items-center"
          onClick={() => router.push('/pharmaCompany/Add-Med-Dataset')}
        >
          <h2 className="text-center text-blue-950 text-xl sm:text-2xl font-semibold mb-5 mt-7 group-hover:text-white transition-colors duration-300">
            Add Medicine Dataset
          </h2>
          <FontAwesomeIcon icon={faCapsules} className="text-[120px] text-[#1a3465] group-hover:text-white transition-colors duration-300" />
        </div>

        {/* View Dataset Card */}
        <div
          className="group bg-white backdrop-blur-md border border-white/30 rounded-2xl p-4 shadow-md hover:bg-[#1a3465] hover:border-[#1a3465] hover:shadow-blue-300 hover:scale-105 transition-all duration-300 overflow-hidden cursor-pointer w-[300px] h-[300px] flex flex-col justify-center items-center"
          onClick={() => router.push('/pharmaCompany/View-Dataset')}
        >
          <h2 className="text-center text-blue-950 text-xl sm:text-2xl font-semibold mb-5 mt-7 group-hover:text-white transition-colors duration-300">
            View Dataset
          </h2>
          <FontAwesomeIcon icon={faDatabase} className="text-[120px] text-[#1a3465] group-hover:text-white transition-colors duration-300" />
        </div>
      </section>

      </div>
    </div>
  );
}
