'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { Outfit } from 'next/font/google';

  const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
});

export default function DrugInteractivityPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const [drug1, setDrug1] = useState('');
  const [drug2, setDrug2] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const [suggestions1, setSuggestions1] = useState([]);
  const [suggestions2, setSuggestions2] = useState([]);
  const timeoutRef = useRef();


  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role === 'DOCTOR') {
      setIsAuthorized(true);
    } else {
      setErrorMessage("You can't access this page. Please login first.");
    }
  }, [router]);

  const fetchSuggestions = async (query, forDrug) => {
    if (query.trim().length < 2) return;
    try {
      const res = await fetch(`http://localhost:8082/api/interactions/search?name=${encodeURIComponent(query)}`);
      const data = await res.json();

      const allDrugs = [
        ...new Set(
          data.flatMap(d => [d.drug1, d.drug2])
            .filter(name => name?.toLowerCase().startsWith(query.toLowerCase()))
        )
      ];

      if (forDrug === 'drug1') setSuggestions1(allDrugs);
      else setSuggestions2(allDrugs);
    } catch (err) {
      console.error('Failed to fetch suggestions:', err);
    }
  };

  const handleDrugChange = (value, forDrug) => {
    if (forDrug === 'drug1') setDrug1(value);
    else setDrug2(value);

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      fetchSuggestions(value, forDrug);
    }, 250);
  };

  const handleSelect = (value, forDrug) => {
    if (forDrug === 'drug1') {
      setDrug1(value);
      setSuggestions1([]);
    } else {
      setDrug2(value);
      setSuggestions2([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResult(null);
    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:8082/api/interactions/check?drug1=${encodeURIComponent(drug1)}&drug2=${encodeURIComponent(drug2)}`
      );
      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        setResult(data[0].interactionDescription);
      } else {
        setResult(`No known interaction between ${drug1} and ${drug2}`);
      }
    } catch (error) {
      setResult(`No known interaction between ${drug1} and ${drug2}`);
    } finally {
      setLoading(false);
    }
  };

  if (isAuthorized === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-red-600 text-xl font-semibold text-center px-4">
        <p>{errorMessage}</p>
        <button
          onClick={() => router.push('/login')}
          className="mt-6 bg-blue-300 hover:bg-blue-500 text-black py-2 px-4 rounded-full transition font-bold"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
  <div className={`${outfit.className} relative min-h-screen px-6 py-8 bg-gradient-to-br from-blue-100 via-white to-blue-200`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => router.push('/doctor/homepage')}>
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
          <h1 className="text-3xl font-bold text-blue-950">Medica</h1>
          
        </div>
        
        <button onClick={() => {
          localStorage.removeItem('role');
          router.push('/login');
        }} className="text-blue-950 font-semibold hover:text-red-600 flex items-center gap-2 cursor-pointer">
          <FontAwesomeIcon icon={faRightFromBracket} className="text-blue-950 w-5 h-5" />
          Logout
        </button>
      </div>

      <h2 className="text-4xl font-bold text-blue-950 text-center mb-12">Check Drug Interactivity</h2>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-8">
        {[
          { label: 'Drug 1', value: drug1, suggestions: suggestions1, onChange: val => handleDrugChange(val, 'drug1'), onSelect: val => handleSelect(val, 'drug1') },
          { label: 'Drug 2', value: drug2, suggestions: suggestions2, onChange: val => handleDrugChange(val, 'drug2'), onSelect: val => handleSelect(val, 'drug2') },
        ].map(({ label, value, suggestions, onChange, onSelect }, idx) => (
          <div key={idx} className="relative">
            <label className="block text-lg font-semibold text-blue-950 mb-2">{label}</label>
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full h-14 border border-gray-400 rounded-full px-5 text-base outline-none"
              placeholder={`Type ${label.toLowerCase()} name...`}
              autoComplete="off"
            />
            {suggestions.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-xl shadow-lg mt-1 max-h-60 overflow-y-auto">
                {suggestions.map((suggestion, i) => (
                  <li
                    key={i}
                    className="px-4 py-3 hover:bg-blue-100 cursor-pointer"
                    onClick={() => onSelect(suggestion)}
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}

        <div className="text-center">
          <button
            type="submit"
            disabled={loading}
            className="w-48 h-14 bg-blue-400 hover:bg-blue-500 text-white text-lg font-bold rounded-full transition cursor-pointer"
          >
            {loading ? 'Checking...' : 'Check Interaction'}
          </button>
        </div>

        {result && (
          <div className="text-center text-lg font-medium text-blue-950 border-t border-blue-200 pt-6">
            {result}
          </div>
        )}
      </form>
    </div>
  );
}
