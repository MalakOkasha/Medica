'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Outfit } from 'next/font/google';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
});

export default function MedicinePage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [openSection, setOpenSection] = useState(null);
  const [medicine, setMedicine] = useState(null);

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
    const storedData = localStorage.getItem('medicineResult');
    if (storedData) {
      setMedicine(JSON.parse(storedData));
    }
  }, []);

  const toggleSection = (key) => {
    setOpenSection(prev => (prev === key ? null : key));
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-red-600 font-bold text-xl px-4 text-center cursor-pointer">
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

  if (!medicine) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-tr from-blue-100 via-white to-blue-200 px-4">
        <h2 className="text-4xl font-bold text-blue-900 mb-4">No medicine data found</h2>
        <p className="text-lg text-gray-700 max-w-xl text-center">
          It seems we couldn't retrieve the medicine information. Please make sure you've selected a medicine correctly or try again later.
        </p>
      </div>
    );
  }

  return (
<div className={`min-h-screen bg-gradient-to-tr from-blue-100 via-white to-blue-200 px-6 py-12 overflow-auto ${outfit.className}`}>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
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

 <div className="mb-3 ml-7">
      <button
        onClick={() => router.push(`/doctor/medicine-details`)}
        className="bg-blue-200 hover:bg-blue-300 text-blue-950 font-semibold px-4 py-2 rounded-xl shadow transition flex items-center gap-2 cursor-pointer"
      >
        <span>←</span>
        <span>Back to all medicines</span>
      </button>
    </div>


      {/* Medicine Title */}
      <h1 className="text-center text-5xl font-extrabold text-blue-950 mb-25 mt-15 capitalize">
        {medicine.name}
      </h1>

      {/* Sections */}
      <div className="flex flex-col items-center gap-10 max-w-4xl mx-auto">
        {[
          {
            title: 'Usage',
            key: 'usage',
            content: [medicine.use0, medicine.use1, medicine.use2].filter(Boolean).join(', '),
          },
          {
            title: 'Side Effects',
            key: 'sideEffects',
            content: [medicine.sideeffect0, medicine.sideeffect1, medicine.sideeffect2].filter(Boolean).join(', '),
          },
          {
            title: 'Substitutes',
            key: 'substitutes',
            content: [medicine.substitute0, medicine.substitute1].filter(Boolean).join(', '),
          },
        ].map(({ title, key, content }) => (
          <div key={key} className="w-full bg-white rounded-xl shadow-lg overflow-hidden">
            <button
              onClick={() => toggleSection(key)}
              className="w-full flex justify-between items-center px-6 py-5 bg-blue-200 text-blue-950 text-2xl font-semibold hover:bg-blue-300 transition-all cursor-pointer"
            >
              {title}
              <Image
                src="/drop-down.png"
                alt="Toggle"
                width={30}
                height={30}
                className={`transition-transform duration-300 ${openSection === key ? 'rotate-180' : ''}`}
              />
            </button>
            {openSection === key && (
              <div className="px-6 py-4 text-lg text-blue-950 bg-blue-100 transition-all duration-300">
                {content || 'No information available.'}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
