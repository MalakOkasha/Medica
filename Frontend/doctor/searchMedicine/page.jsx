'use client';

import { useRouter } from 'next/navigation';
import { Outfit } from 'next/font/google';
import { useEffect, useState, useRef } from 'react';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
});

const SearchMedicine = () => {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role === 'DOCTOR') {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
      setErrorMessage("You can't access this page. Please login first.");
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchText.trim().length > 1) {
        fetchSuggestions(searchText);
      } else {
        setSuggestions([]);
      }
    }, 300); // debounce

    return () => clearTimeout(timeout);
  }, [searchText]);

  const fetchSuggestions = async (query) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8082/api/medicines/search?name=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error('Fetch error');
      const data = await res.json();
      setSuggestions(data);
    } catch (err) {
      console.error(err);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (medicine) => {
    localStorage.setItem('medicineResult', JSON.stringify(medicine));
    router.push('/doctor/medicines');
  };

 const handleSearch = async () => {
  try {
    const res = await fetch(`http://localhost:8082/api/medicines/search?name=${encodeURIComponent(searchText)}`);
    if (!res.ok) throw new Error('No results');
    const medicineData = await res.json();

    if (!medicineData || medicineData.length === 0) {
      setErrorMessage('Sorry, no medicine found. Please try a different name.');
      return;
    }

    const validMedicine = medicineData.find(med => med.description && med.description.trim() !== "");
    if (!validMedicine) {
      setErrorMessage(`Sorry, no detailed info found for "${searchText}".`);
      return;
    }

    localStorage.setItem('medicineResult', JSON.stringify(validMedicine));
    setErrorMessage('');
    router.push('/doctor/medicines');
  } catch (err) {
    setErrorMessage('Sorry, no medicine found. Please try a different name.');
  }
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
    <div className={`${outfit.className} relative w-full min-h-screen bg-gradient-to-tr from-blue-100 via-white to-blue-200 px-4 py-12`}>
      {/* Logo Header */}
      <div className="flex items-center gap-4 mb-12">
        <div className="bg-blue-200 p-2 rounded-full shadow-md animate-pulse">
          <svg width="45" height="45" viewBox="0 0 47 47" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="47" height="47" rx="23.5" fill="#C6DEFD" />
            <path d="M34 24H30L27 33L21 15L18 24H14" stroke="#252B61" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <h1
            onClick={() => router.push('/doctor/homepage')}
            className="text-3xl font-extrabold text-blue-950 cursor-pointer"
          >
            Medica
          </h1>
          <p className="text-sm text-gray-600 font-medium">Medicine Details</p>
        </div>
      </div>

      {/* Title */}
      <h1 className="text-4xl font-bold text-blue-950 mb-40 mt-20 text-center">Search for a Medicine</h1>

      {/* Search Box */}
      <div className="relative max-w-3xl mx-auto">
        <div className="flex items-center bg-white rounded-full border border-gray-300 overflow-hidden shadow-md">
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Type medicine name..."
            className="w-full h-14 px-6 text-lg text-gray-800 outline-none rounded-l-full"
          />
          <button
            className="bg-[#92BDF6] hover:bg-blue-600 text-white px-6 h-14 text-lg font-medium rounded-r-full transition cursor-pointer"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>

        {/* Autocomplete Suggestions */}
        {suggestions.length > 0 && (
          <ul ref={dropdownRef} className="absolute z-10 w-full bg-white border border-gray-300 rounded-xl shadow-lg mt-2 max-h-64 overflow-y-auto">
            {suggestions.map((medicine, index) => (
              <li
                key={index}
                onClick={() => handleSelect(medicine)}
                className="px-4 py-3 hover:bg-blue-100 cursor-pointer text-gray-800 text-base"
              >
                {medicine.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mt-8 max-w-2xl mx-auto bg-red-100 border border-red-300 text-red-700 px-6 py-4 rounded-xl text-center text-base font-medium">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default SearchMedicine;
