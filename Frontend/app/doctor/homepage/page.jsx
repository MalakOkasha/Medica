'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Outfit } from 'next/font/google';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import {
  faMagnifyingGlass,
  faPills,
  faUserInjured,
  faIndustry,
  faRobot,
  faHouseMedical
} from '@fortawesome/free-solid-svg-icons';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
});

const DoctorHomepage = () => {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role === 'DOCTOR') {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
      setErrorMessage("You can't access this page. Please login first.");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('role');
    router.push('/login');
  };

  if (isAuthorized === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-blue-100 via-white to-blue-200 px-4 text-center">
        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl shadow-xl text-lg font-semibold mb-6">
            {errorMessage}
          </div>
        )}
        <button
          onClick={() => router.push('/login')}
          className="bg-gradient-to-r from-blue-300 to-blue-400 hover:from-blue-400 hover:to-blue-500 text-black font-semibold py-2 px-6 rounded-xl shadow-lg transition duration-300"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${outfit.className}`}>
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 flex-none">
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
            <h1 className="text-3xl font-extrabold text-blue-950 tracking-tight">Medica</h1>
            <p className="text-sm text-gray-600 font-medium">Welcome back, Doctor</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
           <FontAwesomeIcon icon={faRightFromBracket} className="text-blue-950 w-5 h-5" />
          <button
            onClick={handleLogout}
            className="text-base font-semibold text-blue-950 hover:text-red-600 transition cursor-pointer"
          >
            Logout
          </button>
        </div>
      </header>

      <section
        className="flex-grow w-full flex flex-col lg:flex-row bg-cover bg-center bg-no-repeat relative"
        style={{
          backgroundImage: "url('/doctorHomepage.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-sm z-0" />
        <div className="hidden lg:block lg:w-1/2 z-10"></div>
        <div className="w-full lg:w-1/2 px-6 py-10 z-10">

     {/* Top 4 cards in grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10 max-w-3xl -ml-35 mb-8">
  {[
    { title: 'Search Medicine', href: '/doctor/searchMedicine', icon: faMagnifyingGlass },
    { title: 'Drug Interaction', href: '/doctor/drug-interaction', icon: faPills },
    { title: 'Patients', href: '/doctor/patientOptions', icon: faUserInjured },
    { title: 'Pharma Companies', href: '/doctor/pharmaceuticalCompany', icon: faHouseMedical },
  ].map(({ title, href, icon }, idx) => (
    <Link
      key={idx}
      href={href}
      className="group bg-white/90 backdrop-blur-md border border-white/30 rounded-2xl p-4 shadow-md hover:bg-[#1a3465] hover:border-[#1a3465] hover:shadow-blue-300 hover:scale-105 transition-all duration-300 overflow-hidden"
    >
      <h2 className="text-center text-blue-950 text-xl font-semibold mb-4 group-hover:text-white transition-colors duration-300">
        {title}
      </h2>
      <div className="flex justify-center items-center h-28">
        <FontAwesomeIcon
          icon={icon}
          className="text-[80px] text-[#1a3465] group-hover:text-white transition-colors duration-300"
        />
      </div>
    </Link>
  ))}
</div>


      {/* Medi Bot card centered */}
     <div className="flex justify-start">
      <Link
        href="/doctor/machineLearningOptions"
        className="w-full max-w-md group bg-white/90 backdrop-blur-md border border-white/30 rounded-2xl p-4 shadow-md hover:bg-[#1a3465] hover:border-[#1a3465] hover:shadow-blue-300 hover:scale-105 transition-all duration-300 overflow-hidden"
      >
        <h2 className="text-center text-blue-950 text-xl font-semibold mb-4 group-hover:text-white transition-colors duration-300">
          Medi Bot
        </h2>
        <div className="flex justify-center items-center h-28">
          <FontAwesomeIcon
            icon={faRobot}
            className="text-[80px] text-[#1a3465] group-hover:text-white transition-colors duration-300"
          />
        </div>
      </Link>
      </div>

    </div>
  </section>
  </div>
  );
};

export default DoctorHomepage;
