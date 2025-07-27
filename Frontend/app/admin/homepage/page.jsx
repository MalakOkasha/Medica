'use client';
import Link from 'next/link';
import { Outfit } from 'next/font/google';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserDoctor, faUserTie, faHouseMedical , faClipboardList } from '@fortawesome/free-solid-svg-icons';
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import {
  faMagnifyingGlass,
  faPills,
  faUserInjured,
  faIndustry,
  faRobot,
} from '@fortawesome/free-solid-svg-icons';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
});

const Homepage = () => {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role === 'ADMIN') {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
      setErrorMessage("You can't access this page. Please login first.");
    }
  }, []);

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

  const handleLogout = () => {
    localStorage.removeItem('role');
    router.push('/login');
  };

  return (
    <div className={`h-screen flex flex-col overflow-hidden ${outfit.className}`}>
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
            <p className="text-sm text-gray-600 font-medium">Welcome back, Admin</p>
          </div>
        </div>

        <div className="flex items-center gap-10">
        {/* Logs icon and label grouped closely */}
        <div className="flex items-center hover:text-blue-700 cursor-pointer gap-1">
          <FontAwesomeIcon
            icon={faClipboardList}
            className="text-blue-950 w-5 h-5"
            title="View Logs"
          />
          <button
            onClick={() => router.push('/admin/logs')}
            className="text-base font-semibold text-gray-700 hover:text-blue-700 transition cursor-pointer"
          >
            Logs
          </button>
        </div>
        <div>

      {/* Logout icon and label */}
            <FontAwesomeIcon
              icon={faRightFromBracket}
              className="text-blue-950 w-5 h-5"
            />
            <button
              onClick={handleLogout}
              className="text-base font-semibold text-gray-700 hover:text-red-600 transition cursor-pointer"
            >
              Logout
            </button>
        </div>    
      </div>
      </header>

      <section className="relative h-[65%] w-full bg-[url('/background5.jpg')] bg-cover bg-center bg-no-repeat">
      {/* Darker blur overlay */}
      <div className="absolute inset-0 bg-blue/50 backdrop-blur-sm" />
    </section>


      {/* Cards - 1/3 height */}
      <section className="flex-none px-4 py-6 bg-gradient-to-b from-transparent to-blue-100">
      <main className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10 lg:gap-16 max-w-7xl mx-auto items-end">

    {[
      { title: 'Doctors', href: '/admin/viewAllDoctors', icon: faUserDoctor, iconColor: '#1a3465' },
      { title: 'Admins', href: '/admin/viewAllAdmins', icon: faUserTie, iconColor: '#253b5f' },
    { title: 'Pharmaceutical', href: '/admin/viewAllCompanies', icon: faHouseMedical },
    ].map(({ title, href, img, icon, iconColor }, idx) => (
      <Link
        key={idx}
        href={href}
        className="group bg-white/90 backdrop-blur-md border border-white/30 rounded-2xl p-4 shadow-md hover:bg-[#1a3465] hover:border-[#1a3465] hover:shadow-blue-300 hover:scale-105 transition-all duration-300 overflow-hidden"
      >
        <h2 className="text-center text-blue-950 text-xl sm:text-2xl font-semibold mb-5 mt-7 group-hover:text-white transition-colors duration-300">
          {title}
        </h2>
        <div className="flex flex-col justify-center items-center h-35 sm:h-40 gap-2">
          <FontAwesomeIcon
            icon={icon}
            className="text-[140px] sm:text-[120px] lg:text-[140px] text-[#1a3465] group-hover:text-white transition-colors duration-300"
          />
        </div>
      </Link>
    ))}
  </main>
</section>

    </div>
  );
};

export default Homepage;
