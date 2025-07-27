'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { Outfit } from 'next/font/google';


import Swal from 'sweetalert2';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
});


export default function PharmaceuticalCompany() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [companies, setCompanies] = useState([]);
  const [favorites, setFavorites] = useState({});

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role === 'DOCTOR') {
      setIsAuthorized(true);
    } else {
      setErrorMessage("You can't access this page. Please login first.");
    }
  }, [router]);

  useEffect(() => {
    if (isAuthorized) {
      fetch('http://localhost:8082/api/pharma/all')
        .then((res) => res.json())
        .then(async (data) => {
          setCompanies(data);
          const doctorId = localStorage.getItem('id');
          const favStatuses = {};

          for (const company of data) {
            try {
              const res = await fetch(`http://localhost:8082/favorites/exists/${doctorId}/${company.id}`);
              const isFav = await res.json();
              favStatuses[company.id] = isFav;
            } catch {
              favStatuses[company.id] = false;
            }
          }
          setFavorites(favStatuses);
        })
        .catch((err) => console.error('Error fetching companies:', err));
    }
  }, [isAuthorized]);

  const toggleFavorite = async (companyId) => {
    const doctorId = localStorage.getItem('id');

    if (favorites[companyId]) {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'Do you want to remove this company from your favorites?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, remove it!',
        cancelButtonText: 'Cancel'
      });

      if (result.isConfirmed) {
        await fetch(`http://localhost:8082/favorites/remove/${doctorId}/${companyId}`, {
          method: 'DELETE'
        });
        setFavorites(prev => ({ ...prev, [companyId]: false }));

        Swal.fire({
          icon: 'success',
          title: 'Removed!',
          text: 'Company has been removed from favorites.',
          timer: 1500,
          showConfirmButton: false
        });
      }
    } else {
      await fetch(`http://localhost:8082/favorites/add/${doctorId}/${companyId}`, {
        method: 'POST'
      });
      setFavorites(prev => ({ ...prev, [companyId]: true }));

      Swal.fire({
        icon: 'success',
        title: 'Added!',
        text: 'Company has been added to favorites.',
        timer: 1500,
        showConfirmButton: false
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('role');
    router.push('/login');
  };

  const handleCardClick = (companyId) => {
    localStorage.setItem('selectedCompany', JSON.stringify(companyId));
    router.push('/doctor/medicine-details');
  };

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-red-600 font-bold text-xl px-4 text-center">
        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded shadow mb-4">
            {errorMessage}
          </div>
        )}
        <button
          onClick={() => router.push('/login')}
          className="bg-[#C6DEFD] hover:bg-[#a0c4f5] text-black font-bold py-2 px-4 rounded transition duration-300"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className={`${outfit.className} min-h-screen w-full bg-gradient-to-tr from-blue-100 via-white to-blue-200 px-6 py-8`}>
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
            <h1 onClick={() => router.push('/doctor/homepage')} className="text-3xl font-extrabold text-blue-950 tracking-tight cursor-pointer">Medica</h1>
            <p className="text-sm text-gray-600 font-medium">All Pharmaceutical Companies</p>
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

      {/* Page Title */}
      <h2 className="text-4xl font-extrabold text-blue-950 text-center mb-8">Pharmaceutical Companies</h2>

      {/* message if no companies */}
      {companies.length === 0 ? (
        <div className="flex items-center justify-center min-h-screen bg-white/80 backdrop-blur-md p-6 rounded-lg shadow-xl">
          <div className="text-center max-w-lg">
            <h3 className="text-3xl font-semibold text-blue-950 mb-4">No companies found</h3>
            <p className="text-xl text-gray-600 mb-6">It seems like there are no pharmaceutical companies registered yet. Please check back later.</p>
            <button
              onClick={() => router.push('/doctor/homepage')}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
            >
              Go Back to Homepage
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {companies.map((company, index) => (
            <div key={index} className="relative group">
              <div
                onClick={() => handleCardClick(company.id)}
                className="bg-white/90 backdrop-blur-md border border-white/30 rounded-2xl p-6 shadow-md hover:shadow-blue-300 hover:scale-105 hover:bg-[#1a3465] hover:text-white transition-all duration-300 cursor-pointer"
              >
                <h2 className="text-xl font-bold mb-2 group-hover:text-white">{company.user.fullName}</h2>
                <p className="text-base group-hover:text-white">Check out their medicines</p>
              </div>

              {/* Favorite Star */}
              <button
                onClick={() => toggleFavorite(company.id)}
                className="absolute top-4 right-4 text-2xl text-yellow-500"
                aria-label="Toggle Favorite"
              >
                {favorites[company.id] ? '★' : '☆'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
