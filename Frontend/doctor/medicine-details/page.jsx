'use client';

import Image from 'next/image';
import { Outfit } from 'next/font/google';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
});

export default function MedicineDetails() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [medicines, setMedicines] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role === 'DOCTOR') {
      setIsAuthorized(true);
      const companyId = localStorage.getItem('selectedCompany');
      fetch(`http://localhost:8082/api/medicines/by-company/${companyId}`)
        .then((res) => res.json())
        .then((data) => setMedicines(data))
        .catch((err) => console.error('Failed to fetch medicines:', err));
    } else {
      setErrorMessage("You can't access this page. Please login first.");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('role');
    router.push('/login');
  };

  const handleCardClick = (medicine) => {
    localStorage.setItem('medicineResult', JSON.stringify(medicine));
    router.push('/doctor/medicines');
  };

  const filteredMedicines = medicines.filter((medicine) =>
    medicine.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    <div className={`relative bg-gradient-to-tr from-blue-100 via-white to-blue-200 min-h-screen w-full px-6 py-8 ${outfit.className}`}>
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
            <h1  onClick={() => router.push('/doctor/homepage')} className="text-3xl font-extrabold text-blue-950 tracking-tight cursor-pointer">Medica</h1>
            <p className="text-sm text-gray-600 font-medium">All Medicines of Company</p>
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

      {/* Title */}
      <h2 className="text-4xl font-bold text-blue-950 mb-7 mt-10">Medicines</h2>

      {/* Search */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search medicine by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-xl px-6 py-3 rounded-full shadow-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 text-lg"
        />
      </div>

      {/* Medicine Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredMedicines.length > 0 ? (
          filteredMedicines.map((medicine) => (
            <div
              key={medicine.id}
              onClick={() => handleCardClick(medicine)}
              className="cursor-pointer bg-white rounded-3xl shadow-md p-6 hover:shadow-xl hover:bg-blue-100 transition duration-300"
            >
              <h3 className="text-2xl font-bold text-blue-950">{medicine.name}</h3>
              <p className="text-gray-700 mt-2">{medicine.use0 || 'No use listed'}</p>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-600 col-span-full">No medicines found.</p>
        )}
      </div>
    </div>
  );
}
